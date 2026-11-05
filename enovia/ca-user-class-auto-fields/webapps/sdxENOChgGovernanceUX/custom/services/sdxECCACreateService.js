/* 전체 배포본. ENOChgGovernanceUX의 우리 생성 진입에서만 로딩합니다.
 * 아래 상속 클래스는 이 파일에서 함께 등록합니다. 공통 OOTB prototype은 변경하지 않습니다.
 * ENONewWidget은 기존 연결을 유지하고, ClassificationsFacet / ClassificationProp은 원본을 사용합니다.
 */
define("DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService", [
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService",
    "DS/sdxECCACreate/Engine"
], function (AutoClass, Engine) {
    "use strict";
    return {
        launch: function (createOptions) {
            if (typeof widget === "undefined" || !AutoClass.isEnabled()) {
                throw new Error("대상 위젯의 자동 분류 설정을 확인해 주세요.");
            }
            if (!createOptions) throw new Error("기존 생성 옵션을 확인해 주세요.");
            var options = Object.assign({}, createOptions);
            options.options = Object.assign({}, createOptions.options);
            AutoClass.configureCreateType(options);
            // 기존 ENONewWidget 연결이 이 위젯의 API를 읽습니다.
            widget.sdxECCARuntime = AutoClass;
            // 2026 모델 문맥/지연 응답 보완만 전용 Controller에서 유지합니다.
            return new Engine(options);
        }
    };
});

define("DS/sdxECCACreate/Engine", [
    "DS/ENONewWidget/ENONew/ENONewEngine",
    "DS/sdxECCACreate/Controller"
], function (Base, Controller) {
    "use strict";
    return Base.extend({
        init: function () {
            // OOTB 엔진의 prototype에 있는 옵션/이벤트 객체를 생성창별로 분리합니다.
            this.objInfo = Object.assign({}, this.objInfo, {
                options: Object.assign({}, this.objInfo.options),
                events: Object.assign({}, this.objInfo.events)
            });
            return this._parent.apply(this, arguments);
        },
        _getController: function (options, createOptionsModel) {
            return this.controller || new Controller(options, createOptionsModel);
        }
    });
});

define("DS/sdxECCACreate/Controller", [
    "DS/ENONewWidget/ENONew/Controller/ENONewController"
], function (Base) {
    "use strict";
    return Base.extend({
        // 2026의 생성 모델을 재조회 후에도 기본 폼에 전달합니다.
        refreshDialog: function () {
            if (!this.model || typeof this.model.getSecurityContext !== "function") {
                return this._parent.apply(this, arguments);
            }
            this.dialog.reloadContent({
                defaultAttributes: this.defaultAttributes, attributes: this.attributes,
                interfaces: this.interfaces, isUXBLDeployed: this.isUXBLDeployed,
                basicAttributes: this.basicAttributes, model: this.model
            });
        },
        onChangeSecurityContext: function (context) {
            if (!this.model || typeof this.model.getSecurityContext !== "function") {
                return this._parent.apply(this, arguments);
            }
            var controller = this;
            var revision = this.sdxECCAContextRevision = (this.sdxECCAContextRevision || 0) + 1;
            function stale() {
                return controller.sdxECCAClosed || revision !== controller.sdxECCAContextRevision ||
                    controller.model.getSecurityContext() !== context;
            }
            this.dialog.disableFormInput();
            return this._getTypeInfo({securityContext: context}).then(function (info) {
                if (stale()) return;
                return controller.credentialsManager.getCredentialsAttribute(info.type).then(function (credentials) {
                    if (stale()) return;
                    if (credentials && credentials.project) {
                        controller.defaultAttributes.project = credentials.project;
                        if (credentials.organisation) controller.defaultAttributes.organisation = credentials.organisation;
                        if (credentials.role) controller.defaultAttributes.role = credentials.role;
                    }
                    controller.attributes = info.attributes;
                    controller.interfaces = info.interfaces;
                    controller.isUXBLDeployed = info.isUXModifyDeployed;
                    controller.basicAttributes = info.basicAttributes;
                    controller.postFetchAttributes(info, "onChangeSecurityContext");
                    controller.refreshDialog();
                });
            }).catch(function (error) {
                if (stale()) return;
                controller.dispatchEvent("onFailure", [error]);
                controller.destroyComponent();
            });
        },
        destroyComponent: function () {
            this.sdxECCAClosed = true;
            return this._parent.apply(this, arguments);
        }
    });
});

define("DS/sdxECCACreate/ClassificationFacet", [
    "DS/ClassificationsFacet/PLMNewClassificationFacet",
    "DS/ClassificationsFacet/InitClassificationCmpUI",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService"
], function (Base, InitUI, AutoClass) {
    "use strict";
    return Base.extend({
        init: function (options) {
            this.sdxECCAAutoSession = options.sdxECCAAutoSession;
            this.sdxECCAAutoContext = options.securityContext;
            this._parent.apply(this, arguments);
            AutoClass.connectClassification(this, options);
        },
        plmNewContextProvider: function () {
            return this.sdxECCAAutoSession ? this.sdxECCAAutoContext : this._parent.apply(this, arguments);
        },
        sdxECCARebuildUI: function (context) {
            var old = this.elements.container;
            var next = new InitUI();
            var container = next.getUI(Object.assign({}, this.options, {securityContext: context}));
            if (old && old.parentNode) old.parentNode.replaceChild(container, old);
            this.initUI = next;
            this.elements.container = container;
        },
        destroy: function () {
            AutoClass.disconnectClassification(this);
            return this._parent.apply(this, arguments);
        }
    });
});

define("DS/sdxECCACreate/ClassifPropController", [
    "DS/ClassificationProp/facets/Properties/ClassifPropController",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService"
], function (Base, AutoClass) {
    "use strict";
    return Base.extend({
        loadModels: function (model) {
            var session = this.options.sdxECCAAutoSession;
            if (!session || session.disposed || session.transitioning || session.status === "error") return;
            if (model && typeof model.get === "function") {
                AutoClass.tagClassModel(session.controller, model, model.get("objectId"));
            }
            return this._parent.apply(this, arguments);
        },
        _onCompleteLoadModel: function (response) {
            var session = this.options.sdxECCAAutoSession;
            if (!session || session.disposed || session.transitioning || session.status === "error") return;
            // 빈 모델 초기화는 원래 처리에 맡기며, 완료 표식은 실제 속성 응답에만 적용합니다.
            if (response && Array.isArray(response.results) && response.results.length === 0 && !response.attribute) {
                return this._parent.apply(this, arguments);
            }
            var model = this.getModel();
            if (!model || model.sdxECCAAutoSession !== session) {
                session.fail(new Error("분류 속성 응답의 생성 세션을 확인해 주세요."));
                return;
            }
            if (!AutoClass.prepareAttributes(model, response)) return;
            var result = this._parent.apply(this, arguments);
            AutoClass.notifyAttributesLoaded(model, response);
            return result;
        }
    });
});
