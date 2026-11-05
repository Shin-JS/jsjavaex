/* 전체 배포본. ENOChgGovernanceUX의 우리 생성 진입에서만 로딩합니다.
 * 아래 상속 클래스는 이 파일에서 함께 등록합니다. 공통 OOTB prototype은 변경하지 않습니다.
 * ENONewWidget은 설치 버전 원본을 사용합니다. 분류 두 파일의 F/M/P 연결은 유지합니다.
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
            // 자동 분류는 기본 속성 facet과 분류 facet을 함께 사용합니다.
            // 호출부에 탭 옵션이 없으면 OOTB가 listView로 내려가므로 여기서 보장합니다.
            options.viewType = "tabView";
            options.facets = (createOptions.facets || []).map(function (facet) {
                return Object.assign({}, facet, {facetoptions: Object.assign({}, facet.facetoptions)});
            });
            if (!options.facets.some(function (facet) { return facet.name === "classificationFacet"; })) {
                options.facets.push({name: "classificationFacet", facetoptions: {isBookmark: true, isLibrary: true}});
            }
            AutoClass.configureCreateType(options);
            // OOTB Launcher와 같은 엔진을 상속하되, 이 생성창의 Controller만 교체합니다.
            widget.sdxECCARuntime = AutoClass;
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
    "DS/ENONewWidget/ENONew/Controller/ENONewController",
    "DS/sdxECCACreate/Dialog"
], function (Base, Dialog) {
    "use strict";
    return Base.extend({
        getUI: function () {
            if (!this.dialog) {
                this.dialog = new Dialog({sdxECCATenant: this.context && this.context.tenant}, this.createOptsModel);
            }
            return this._parent.apply(this, arguments);
        },
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

define("DS/sdxECCACreate/Dialog", [
    "DS/ENONewWidget/ENONew/Controller/ENONewDialogController",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService"
], function (Base, AutoClass) {
    "use strict";
    return Base.extend({
        buildContent: function (data, options) {
            if (this.viewType !== "tabView" || !Array.isArray(this.facets)) {
                throw new Error("자동 분류 생성창에는 속성·분류 탭 구성이 필요합니다.");
            }
            // OOTB helper가 만든 결과만 복제합니다. helper/공통 facet 정의는 수정하지 않습니다.
            this.facets = this.facets.map(function (entry) {
                return Object.assign({}, entry, {options: Object.assign({}, entry.options)});
            });
            AutoClass.attachBridge(data, this.facets, Object.assign({}, options, {
                tenant: this.options.sdxECCATenant
            }));
            var properties = this.facets.find(function (entry) { return entry.facet.name === "ENOCreate"; });
            var classification = this.facets.find(function (entry) { return entry.facet.name === "classificationFacet"; });
            if (!properties || !classification || !properties.options.sdxECCAAutoSession) {
                throw new Error("자동 분류 세션과 생성 타입 설정을 확인해 주세요.");
            }
            properties.require = "DS/sdxECCACreate/PropertiesFacet";
            // 분류 facet은 master와 같은 OOTB 경로와 F/M/P 연결을 사용합니다.
            return this._parent.apply(this, arguments);
        },
        manageButtons: function () {
            var result = this._parent.apply(this, arguments);
            if (this.myDialog) AutoClass.bindDialog(this);
            return result;
        },
        onSubmitDialog: function () {
            if (!AutoClass.canSubmitDialog(this)) {
                this.resetButtonLabel();
                this.disableFormInput(false, false, true);
                return;
            }
            return this._parent.apply(this, arguments);
        },
        disableFormInput: function () {
            var result = this._parent.apply(this, arguments);
            AutoClass.preserveValidationState(this);
            return result;
        },
        destroy: function () {
            AutoClass.disposeDialog(this);
            return this._parent.apply(this, arguments);
        }
    });
});

define("DS/sdxECCACreate/PropertiesFacet", [
    "DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService"
], function (Base, AutoClass) {
    "use strict";
    return Base.extend({
        init: function (options) {
            this.sdxECCAAutoSession = options.sdxECCAAutoSession;
            AutoClass.prepareFixedType(options.data, this.sdxECCAAutoSession);
            this._parent.apply(this, arguments);
            var view = this.listview;
            var check = view && view.checkForMandatoryAttributes;
            if (typeof check === "function") {
                view.checkForMandatoryAttributes = function () {
                    return AutoClass.checkMandatoryQuietly(this, check);
                };
            }
            AutoClass.installFields(this, options);
        },
        // OOTB가 속성을 발행하기 전에 문맥 변경을 기록합니다. 원래 이벤트는 그대로 실행됩니다.
        publishAttributeInfo: function (field) {
            var session = this.sdxECCAAutoSession;
            if (session && field) {
                if (field.name === "SecurityContext") {
                    session.currentContext = field.valueDB;
                    session.changeContext(field.valueDB);
                } else if (field.name === "Type") session.checkType(field.valueDB);
            }
            return this._parent.apply(this, arguments);
        },
        updateFacet: function (options) {
            if (AutoClass.checkFacetContext(this, options) === false) return;
            return this._parent.apply(this, arguments);
        },
        destroy: function () {
            AutoClass.destroyFields(this);
            return this._parent.apply(this, arguments);
        }
    });
});
