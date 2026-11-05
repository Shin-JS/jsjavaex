/* 전체 배포본. ENOChgGovernanceUX의 우리 생성 진입에서만 로딩합니다.
 * 아래 상속 클래스는 이 파일에서 함께 등록합니다. 공통 OOTB prototype은 변경하지 않습니다.
 * ENONewWidget / ClassificationsFacet / ClassificationProp은 설치 버전의 원본을 사용합니다.
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
            classification.require = "DS/sdxECCACreate/ClassificationFacet";
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

define("DS/sdxECCACreate/ClassificationFacet", [
    "DS/ClassificationsFacet/PLMNewClassificationFacet",
    "DS/sdxECCACreate/ClassificationInitializer",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService"
], function (Base, Initializer, AutoClass) {
    "use strict";
    return Base.extend({
        init: function (options) {
            this.sdxECCAAutoSession = options.sdxECCAAutoSession;
            this.sdxECCAAutoContext = options.securityContext;
            // 원본 init의 이벤트/분류 저장 연결은 유지하고 비동기 앱 초기화만 분리합니다.
            this._parent(Object.assign({}, options, {isBookmark: false, isLibrary: false, isExportControl: false}));
            // 원본 getUI가 비동기로 읽는 옵션 객체는 disabled 상태로 유지합니다.
            this.options = Object.assign({}, this.options, options);
            this.sdxECCARebuildUI(options.securityContext);
            AutoClass.connectClassification(this, options);
        },
        plmNewContextProvider: function () {
            return this.sdxECCAAutoSession ? this.sdxECCAAutoContext : this._parent.apply(this, arguments);
        },
        sdxECCARebuildUI: function (context) {
            var old = this.elements.container;
            if (this.initUI) this.initUI.sdxECCAClosed = true;
            var next = Initializer.create(Object.assign({}, this.options, {
                securityContext: context, sdxECCAAutoSession: this.sdxECCAAutoSession
            }));
            if (old && old.parentNode) old.parentNode.replaceChild(next.container, old);
            if (this.plmNewCreationClass && typeof this.plmNewCreationClass.inject === "function") {
                this.plmNewCreationClass.inject(next.container);
            }
            this.initUI = next.ui;
            this.elements.container = next.container;
        },
        destroy: function () {
            if (this.initUI) this.initUI.sdxECCAClosed = true;
            AutoClass.disconnectClassification(this);
            return this._parent.apply(this, arguments);
        }
    });
});

// 자동분류 전용 초기화입니다. 공통 InitClassificationCmpUI/prototype/AMD ID는 변경하지 않습니다.
define("DS/sdxECCACreate/ClassificationInitializer", [
    "require",
    "DS/ClassificationsFacet/InitClassificationCmpUI"
], function (require, InitUI) {
    "use strict";
    return {
        create: function (options) {
            var ui = new InitUI();
            var session = options.sdxECCAAutoSession;
            // OOTB 컨테이너/getController를 사용하고 bookmark→검색→library 순차 대기는 분리합니다.
            var container = ui.getUI(Object.assign({}, options, {
                isBookmark: false, isLibrary: false, isExportControl: false
            }));
            function stale() {
                return ui.sdxECCAClosed || !session || session.disposed || session.transitioning || session.status === "error";
            }
            function fail(stage, error) {
                if (stale()) return;
                ui.sdxECCAInitStage = "error";
                var reason = error && error.message ? error.message : String(error);
                var failure = new Error("분류 " + stage + " 실패: " + reason);
                failure.cause = error;
                session.fail(failure);
            }
            ui.sdxECCAInitStage = "configuration";
            try {
                require(["text!DS/ClassificationsFacet/assets/classificationAppsRequire_setting.json"], function (text) {
                    if (stale()) return;
                    try {
                        var definition = JSON.parse(text);
                        var moduleId = definition.facets.library.require;
                        if (typeof moduleId !== "string" || !moduleId) throw new Error("library.require 설정이 없습니다.");
                        function loadController() {
                            if (stale()) return;
                            ui.sdxECCAInitStage = "module: " + moduleId;
                            require([moduleId], function (Controller) {
                                if (stale()) return;
                                try {
                                    ui.sdxECCAInitStage = "constructor: " + moduleId;
                                    ui.plmNewLibraryActive = new Controller({
                                        dialogButtons: true, selectionMode: "ONLYSingle", favoriteButton: true,
                                        appId: "Libraries", handleClassification: true, OKButtonLabel: "OK",
                                        componentTitle: "OK", isRootSelectable: true, isClassifyMultiEveDispatch: false,
                                        isonSetActiveEveDispatch: true, container: container,
                                        getClassificationAttributes: true, attributesReadOnly: false,
                                        isInformationPanel: options.isInformationPanel, objectId: ui.objectId,
                                        securityContext: options.securityContext, tenant: options.tenant
                                    });
                                    ui.sdxECCAInitStage = "controller";
                                } catch (error) { fail("컨트롤러 생성", error); }
                            }, function (error) { fail("모듈 로딩 (" + moduleId + ")", error); });
                        }
                        // R2026x는 Controller.js가 아니라 이 번들 안에 named define을 제공합니다.
                        // 위젯에 공통 bundle 매핑이 없어도 실제 파일부터 로딩합니다.
                        if (moduleId === "DS/PLMNewLibraryActive/PLMNewLibraryActiveController") {
                            var bundleId = "DS/PLMNewLibraryActive/PLMNewLibraryActive";
                            ui.sdxECCAInitStage = "bundle: " + bundleId;
                            require([bundleId], loadController, function (error) {
                                // enforceDefine 환경에서는 번들명 define 없이 내부 모듈만 등록될 수 있습니다.
                                if (error && error.requireType === "nodefine" &&
                                    typeof require.specified === "function" && require.specified(moduleId)) {
                                    loadController();
                                    return;
                                }
                                fail("번들 로딩 (" + bundleId + ")", error);
                            });
                        } else loadController();
                    } catch (error) { fail("초기화 설정", error); }
                }, function (error) { fail("초기화 설정 로딩", error); });
            } catch (error) { fail("초기화 요청", error); }
            return {ui: ui, container: container};
        }
    };
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
