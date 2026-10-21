/**
 * 커스텀 AMD 모듈. 이 파일은 새로 배포하는 전체 파일입니다.
 * OOTB 파일에는 이 모듈 의존성과 연결 호출만 추가합니다.
 * 공유되는 것은 함수뿐이며 세션/선택 모델은 대화상자마다 생성합니다.
 * OOTB 모듈을 정적 의존성으로 요구하지 않아 역방향 의존 순환을 피합니다.
 * 값 검증은 실제 분류 폼 UIController의 기본 validateModels를 사용합니다.
 *
 * 클래스 결정은 ClassRuleService, 실제 사용자/분류 조회 연결은 OrganizationProvider로 분리합니다.
 * 기본 fixed 모드는 현재 정상 표시된 고정 클래스 방식을 유지합니다.
 */
define("DS/sdxECCAAutoClass/sdxECCAAutoClass", [
    "require",
    "DS/sdxECCAAutoClass/sdxECCAClassRuleService",
    "DS/sdxECCAAutoClass/sdxECCAOrganizationProvider",
    "DS/sdxECCAAutoClass/sdxECCAClassAttributeService"
], function (require, ClassRuleService, OrganizationProvider, ClassAttributeService) {
    "use strict";

    /** 대화상자마다 별도 세션을 만들어 초기화·속성 로딩·UI·생성 검증을 연결합니다. */
    function sdxECCACreateAutoSession(context, type, rule) {
        var session = {
            context: context, type: type, rule: rule, controller: null,
            status: "loading", error: null, disposed: false, started: false,
            mandatory: null, mandatoryPrepared: false, mandatoryNames: [], attributesLoaded: false, fieldsMounted: false, validateFields: null,
            classId: null, classTitle: null, typeDisplay: "hidden", readCurrentType: null, listeners: new Set(), timer: null,
            cancelRequest: null
        };
        session.subscribe = function (listener) {
            session.listeners.add(listener);
            listener(session);
            return function () { session.listeners.delete(listener); };
        };
        session.notify = function () {
            if (!session.disposed) session.listeners.forEach(function (fn) { fn(session); });
        };
        session.fail = function (error) {
            if (session.disposed) return;
            session.status = "error";
            session.error = error instanceof Error ? error : new Error(String(error));
            clearTimeout(session.timer);
            session.notify();
        };
        session.refreshReady = function () {
            if (session.disposed || session.status === "error") return;
            if (session.attributesLoaded && session.fieldsMounted && session.validateFields) {
                session.status = "ready";
                clearTimeout(session.timer);
            }
        };
        session.markAttributesLoaded = function (classId) {
            if (session.disposed || session.status === "error" || classId !== session.classId) return;
            session.attributesLoaded = true;
            session.refreshReady();
            session.notify();
        };
        session.checkContext = function (value) {
            // 입력한 값을 버리지 않도록 문맥 변경 시 다시 열도록 안내합니다.
            if (value !== session.context) {
                session.fail(new Error("권한 문맥이 변경되었습니다. 생성 화면을 닫고 다시 열어 주세요."));
            }
        };
        session.checkType = function (value) {
            if (value !== session.type) {
                session.fail(new Error("생성 타입이 변경되었습니다. 생성 화면을 다시 열어 주세요."));
            }
        };
        session.dispose = function () {
            if (session.disposed) return;
            session.disposed = true;
            clearTimeout(session.timer);
            if (session.cancelRequest) session.cancelRequest();
            if (session.cleanupValidation) session.cleanupValidation();
            session.listeners.forEach(function (fn) { fn(session); });
            session.listeners.clear();
            if (session.controller && session.controller.sdxECCAAutoSession === session) {
                (session.controller.classifPropModels || []).forEach(function (model) {
                    if (model.sdxECCAAutoSession === session) {
                        delete model.sdxECCAAutoSession;
                        delete model.sdxECCAAutoClassId;
                    }
                });
                delete session.controller.sdxECCAAutoSession;
            }
            session.controller = null;
            session.validateFields = null;
            session.showMessage = null;
            session.readCurrentType = null;
        };
        session.timer = setTimeout(function () {
            session.fail(new Error("지정 클래스 속성 준비 시간이 초과되었습니다."));
        }, 60000);
        return session;
    }

    /** 대상 위젯에만 공유 세션을 전달합니다. 고정 클래스/유형은 전용 HTML에서 설정합니다. */
    function sdxECCAAttachAutoBridge(data, facetList, settings) {
        if (typeof widget === "undefined") return;
        var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
        if (!(enabled === true || enabled === "true")) return;
        var attrs = data && data.defaultAttributes;
        var type = attrs && attrs.Type && attrs.Type.value;
        var targetType = widget.getValue("sdxECCAAutoClassType") || "Change Action";
        if (type !== targetType) return;
        var properties = facetList.find(function (item) { return item.facet.name === "ENOCreate"; });
        var classification = facetList.find(function (item) { return item.facet.name === "classificationFacet"; });
        if (!properties || !classification) throw new Error("ENOCreate와 classificationFacet이 필요합니다.");
        var context = attrs && attrs.SecurityContext && attrs.SecurityContext.value;
        context = context || settings && settings.securityContext;
        var rule = null, configError = null;
        var typeDisplay = widget.getValue("sdxECCATypeDisplay") || "hidden";
        try {
            var ruleMode = widget.getValue("sdxECCAClassRuleMode") || "fixed";
            if (ruleMode !== "fixed" && ruleMode !== "department") {
                throw new Error("sdxECCAClassRuleMode는 fixed 또는 department로 지정해 주세요.");
            }
            // department 모드에는 고정 클래스 ID가 필요하지 않습니다. 조회 실패 시 고정값으로 우회하지 않습니다.
            if (ruleMode === "fixed") rule = ClassRuleService.resolveFixed({
                classId: widget.getValue("sdxECCAFixedClassId"),
                libraryId: widget.getValue("sdxECCAFixedLibraryId")
            });
            if (typeDisplay !== "hidden" && typeDisplay !== "disabled") {
                throw new Error("sdxECCATypeDisplay는 hidden 또는 disabled로 지정해 주세요.");
            }
        } catch (error) { configError = error; }
        var session = sdxECCACreateAutoSession(context, type, rule);
        session.typeDisplay = typeDisplay;
        session.ruleMode = ruleMode;
        session.tenant = settings && settings.tenant || "OnPremise";
        properties.options = properties.options || {};
        classification.options = classification.options || {};
        properties.options.sdxECCAAutoSession = session;
        classification.options.sdxECCAAutoSession = session;
        classification.alwaysCalled = true;
        if (configError) session.fail(configError);
    }

    /** OOTB가 유형 모델을 만들기 전에 표시·편집 메타데이터를 제한합니다.
     * 타입 값은 CreateNew 이전부터 지정해야 합니다. 여기서 다른 타입으로 값만 바꾸지 않습니다.
     * OOTB isReadOnly는 편집을 막는 모델 옵션이며, disabled 모드의 실제 모양은 렌더러에 따릅니다.
     */
    function sdxECCAPrepareFixedType(data, session) {
        if (!session || session.disposed) return;
        try {
            var type = data && data.defaultAttributes && data.defaultAttributes.Type;
            if (!type || type.value !== session.type) {
                throw new Error("조회된 유형과 고정 유형이 다릅니다. CreateNew 전 타입 설정을 확인해 주세요.");
            }
            var index = Array.isArray(type.range) ? type.range.indexOf(session.type) : -1;
            if (index < 0 || !Array.isArray(type.persistData) || !type.persistData.some(function (item) {
                return item.name === session.type;
            })) throw new Error("고정 유형의 range/persistData 정의를 조회하지 못했습니다.");
            var label = type.rangeNLS && type.rangeNLS[index] || session.type;
            type.range = [session.type];
            type.rangeNLS = [label];
            type.isReadOnly = true;
            type.visible = session.typeDisplay === "disabled";
            // defaultAttributes.Type.value/persistData를 유지하므로 숨겨도 생성 타입 정보는 남습니다.
        } catch (error) { session.fail(error); }
    }

    /** 폼 영역만 준비하며 검색 UI는 만들지 않습니다. OOTB 폼을 이동합니다. */
    function sdxECCAInstallAutoFields(facet, options) {
        var session = options.sdxECCAAutoSession;
        if (!session) return;
        facet.sdxECCAAutoSession = session;
        facet.sdxECCAAutoDisposed = false;
        session.readCurrentType = function () {
            var view = facet.listview;
            var field = view && view.propModel && view.propModel.get("New-Type");
            return field ? field.valueDB : view && view.data && view.data.defaultAttributes &&
                view.data.defaultAttributes.Type && view.data.defaultAttributes.Type.value;
        };
        var root = document.createElement("div");
        var status = document.createElement("div");
        status.setAttribute("role", "status");
        var host = document.createElement("div");
        host.style.width = "100%";
        host.style.height = "360px";
        host.style.display = "none";
        root.appendChild(status);
        root.appendChild(host);
        facet.skeleton.appendChild(root);
        facet.sdxECCAAutoRoot = root;
        facet.sdxECCAAutoHost = host;
        session.showMessage = function (message) {
            if (!facet.sdxECCAAutoDisposed) status.textContent = message;
        };
        facet.sdxECCAAutoUnsubscribe = session.subscribe(function (state) {
            if (state.disposed) { sdxECCADestroyAutoFields(facet); return; }
            if (state.controller && state.status !== "error") {
                try { sdxECCAMountAutoFields(facet, state); }
                catch (error) { state.fail(error); return; }
                // 분류 폼 자체의 UIController가 사용하는 실제 모델과 기본 검증을 연결합니다.
                // getAttributeFromField()를 전체 속성 열거 API로 사용하지 않습니다.
                session.validateFields = function () {
                    var form = sdxECCAGetRenderedClassForm(session);
                    var errors = form.ui.validateModels([form.model]);
                    if (errors && errors.length) {
                        throw new Error(errors.map(function (item) { return item.message; }).join("\n"));
                    }
                };
            }
            state.refreshReady();
            status.textContent = state.error ? state.error.message :
                state.status === "ready" ? "" : "지정 클래스 속성을 준비하고 있습니다…";
            host.style.display = state.attributesLoaded ? "" : "none";
        });

    }

    /** 기존 폼 객체를 한 번 이동하고, 종료 시 돌려놓을 원래 위치를 기억합니다. */
    function sdxECCAMountAutoFields(facet, session) {
        var ctrl = session.controller, form = ctrl.accordeonCon;
        if (!form || form.nodeType !== 1 || !ctrl.classifPropertiesView) {
            throw new Error("분류 속성 폼의 accordeonCon이 없습니다.");
        }
        var binding = facet.sdxECCAAutoBinding;
        if (!binding) {
            if (!form.parentNode) throw new Error("분류 속성 폼이 아직 연결되지 않았습니다.");
            binding = facet.sdxECCAAutoBinding = {form: form, parent: form.parentNode, next: form.nextSibling};
        } else if (binding.form !== form) {
            throw new Error("분류 폼이 재초기화되었습니다. 화면을 다시 열어 주세요.");
        }
        if (form.parentNode !== facet.sdxECCAAutoHost) facet.sdxECCAAutoHost.appendChild(form);
        sdxECCARenderMandatoryIcons(form);
        session.fieldsMounted = true;
        clearTimeout(facet.sdxECCAAutoResize);
        facet.sdxECCAAutoResize = setTimeout(function () {
            if (!facet.sdxECCAAutoDisposed && !session.disposed && ctrl.classifPropertiesView.onInnerResize) {
                ctrl.classifPropertiesView.onInnerResize();
                sdxECCARenderMandatoryIcons(form);
            }
        }, 0);
    }

    /** OOTB가 만든 필수 라벨 표시만 기본 생성 폼의 mandIcon으로 맞춥니다.
     * 분류 헤더/탭/검증 오류 아이콘은 선택하거나 변경하지 않습니다.
     */
    function sdxECCARenderMandatoryIcons(form) {
        if (!form) return;
        form.querySelectorAll(".attrLabel.mandAttr").forEach(function (label) {
            var legacy = label.querySelector(".attrMand");
            if (!legacy) return;
            if (label.querySelector(".mandIcon")) {
                // 기본 아이콘이 이미 있으면 추가하지 않고 구형 별표만 제거합니다.
                legacy.parentNode.removeChild(legacy);
            } else {
                var icon = document.createElement("span");
                icon.className = "mandIcon wux-ui3ds wux-ui-3ds-new-create";
                icon.setAttribute("aria-hidden", "true");
                legacy.parentNode.replaceChild(icon, legacy);
            }
            label.classList.remove("mandAttr");
        });
        form.querySelectorAll(".flexLine").forEach(function (row) {
            // 한 속성 행의 필수 아이콘만 검사합니다. 맨 앞의 하나를 남깁니다.
            row.querySelectorAll(".mandIcon").forEach(function (icon, index) {
                if (index > 0 && icon.parentNode) icon.parentNode.removeChild(icon);
            });
        });
    }

    function sdxECCACheckAutoFacetContext(facet, options) {
        var session = facet.sdxECCAAutoSession;
        var attrs = options.data && options.data.defaultAttributes;
        if (!session || !attrs) return;
        sdxECCAPrepareFixedType(options.data, session);
        if (attrs.SecurityContext) session.checkContext(attrs.SecurityContext.value);
        if (attrs.Type) session.checkType(attrs.Type.value);
    }

    /** 폼을 이동 전 위치로 돌려놓습니다. 기존 폼과 모델은 파괴하지 않습니다. */
    function sdxECCADestroyAutoFields(facet) {
        if (facet.sdxECCAAutoDisposed) return;
        facet.sdxECCAAutoDisposed = true;
        clearTimeout(facet.sdxECCAAutoResize);
        if (facet.sdxECCAAutoUnsubscribe) facet.sdxECCAAutoUnsubscribe();
        var binding = facet.sdxECCAAutoBinding;
        if (binding) {
            if (binding.next && binding.next.parentNode === binding.parent) binding.parent.insertBefore(binding.form, binding.next);
            else binding.parent.appendChild(binding.form);
        }
        if (facet.sdxECCAAutoRoot && facet.sdxECCAAutoRoot.parentNode) facet.sdxECCAAutoRoot.parentNode.removeChild(facet.sdxECCAAutoRoot);
        if (facet.sdxECCAAutoSession) facet.sdxECCAAutoSession.dispose();
    }

    function sdxECCAFindAutoSession(dialog) {
        var facets = dialog.View && dialog.View.facets || dialog.facets || [];
        for (var i = 0; i < facets.length; i++) {
            if (facets[i].options && facets[i].options.sdxECCAAutoSession) return facets[i].options.sdxECCAAutoSession;
        }
        return null;
    }

    /** 클릭/Enter/반복 생성이 지나는 OOTB 공통 생성 입구에서 준비와 입력값을 검증합니다. */
    function sdxECCACanSubmitAutoDialog(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (!session) return true;
        try {
            if (session.disposed || session.status !== "ready") {
                throw session.error || new Error("지정 클래스 속성 준비가 완료되지 않았습니다.");
            }
            if (!session.readCurrentType || session.readCurrentType() !== session.type) {
                throw new Error("현재 유형이 지정한 고정 유형과 다릅니다. 화면을 다시 열어 주세요.");
            }
            var ctrl = session.controller;
            var selected = ctrl.autoComplete.selectedItems || [];
            if (selected.length !== 1 || selected[0].getID() !== session.classId) {
                throw new Error("지정 클래스 선택 상태가 바뀌었습니다. 화면을 다시 열어 주세요.");
            }
            // blur는 입력값의 모델 반영을 유도합니다. 서버 저장을 뜻하지 않습니다.
            var active = document.activeElement;
            if (active && ctrl.accordeonCon.contains(active) && typeof active.blur === "function") active.blur();
            session.validateFields();
            return true;
        } catch (error) {
            if (session.refreshValidation) session.refreshValidation();
            if (session.showMessage) session.showMessage(error.message || String(error));
            return false;
        }
    }

    /** OOTB resetButtons가 준비/입력 오류 상태를 덮어쓰지 않도록 마지막에 적용합니다.
     * 활성화는 OOTB evaluateValidationStatus에 맡기며 취소 버튼은 건드리지 않습니다.
     */
    function sdxECCAPreserveValidationState(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (!session || session.disposed) return;
        var facets = dialog.View && dialog.View.facets || dialog.facets || [];
        var invalid = session.status !== "ready" || session.fieldsValid !== true || facets.some(function (entry) {
            return entry.content && entry.content.facetValidation === false;
        });
        if (invalid) {
            dialog.permanentDisable = true;
            dialog.disableFormSubmit(true, true);
        }
    }

    function sdxECCADisposeAutoDialog(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (session) session.dispose();
    }

    /** 분류 facet의 유효성을 OOTB 대화상자 버튼 상태 판단에 전달합니다.
     * 버튼을 직접 enable하거나 resetButtons를 호출하지 않습니다.
     */
    function sdxECCAInstallValidationState(facet, session) {
        if (facet.sdxECCAValidationInstalled) return;
        facet.sdxECCAValidationInstalled = true;
        var watchedModel = null, pending = null, unsubscribe = null, validating = false, needsPublish = false;
        function unwatch() {
            if (watchedModel) watchedModel.removeEvent("onChangeAttributes", onChange);
            watchedModel = null;
        }
        function onChange() {
            if (session.disposed || validating) return;
            clearTimeout(pending);
            // OOTB tweaker가 모델 값을 반영한 뒤 같은 모델의 기본 검증을 실행합니다.
            pending = setTimeout(function () { pending = null; refresh(); }, 0);
        }
        function refresh() {
            if (session.disposed) return;
            var valid = false;
            if (session.status === "ready") {
                try {
                    var form = sdxECCAGetRenderedClassForm(session);
                    if (watchedModel !== form.model) {
                        unwatch();
                        if (typeof form.model.addEvent !== "function" || typeof form.model.removeEvent !== "function") {
                            throw new Error("OOTB 분류 속성 모델 변경 이벤트를 확인해 주세요.");
                        }
                        watchedModel = form.model;
                        watchedModel.addEvent("onChangeAttributes", onChange);
                    }
                    validating = true;
                    try { session.validateFields(); } finally { validating = false; }
                    valid = true;
                } catch (error) {
                    // 입력 오류는 준비 실패로 만들지 않습니다. 값을 고치면 다시 검증됩니다.
                    session.validationError = error;
                }
            }
            session.fieldsValid = valid;
            if (valid) session.validationError = null;
            var occurrence = typeof facet.getOccurrence === "function" ? facet.getOccurrence() : null;
            if (!occurrence || typeof occurrence.setValidation !== "function") {
                // facet init 중에는 occurrence가 아직 없습니다. 값만 보존하고 이벤트는 준비 후 발행합니다.
                facet.facetValidation = valid;
                needsPublish = true;
                return;
            }
            if (needsPublish || facet.facetValidation !== valid) {
                needsPublish = false;
                facet.setFacetValidation(valid);
            }
        }
        if (typeof facet.setFacetValidation !== "function") {
            session.fail(new Error("OOTB setFacetValidation 연결을 확인해 주세요."));
            return;
        }
        session.cleanupValidation = function () {
            clearTimeout(pending);
            unwatch();
            if (unsubscribe) unsubscribe();
            session.cleanupValidation = null;
            session.refreshValidation = null;
        };
        session.refreshValidation = refresh;
        unsubscribe = session.subscribe(refresh);
    }

    /** 비동기 OOTB 컨트롤러가 준비되면 자동 선택을 시작합니다. 다른 위젯은 즉시 반환합니다. */
    function sdxECCAConnectAutoClassification(facet, options) {
        var session = options.sdxECCAAutoSession;
        if (!session) return;
        facet.sdxECCAAutoSession = session;
        sdxECCAInstallValidationState(facet, session);
        session.tenant = options.tenant || session.tenant;
        facet.sdxECCAAutoContext = options.securityContext || session.context;
        session.checkContext(facet.sdxECCAAutoContext);
        var started = Date.now();
        facet.sdxECCAAutoTimer = setInterval(function () {
            if (session.disposed || session.status === "error") { clearInterval(facet.sdxECCAAutoTimer); return; }
            if (session.refreshValidation) session.refreshValidation();
            var occurrence = typeof facet.getOccurrence === "function" ? facet.getOccurrence() : null;
            var ui = facet.initUI && facet.initUI.getController();
            var ctrl = ui && ui.plmNewLibraryActive;
            if (occurrence && typeof occurrence.setValidation === "function" &&
                ctrl && ctrl.autoComplete && ctrl.classifPropertiesView && ctrl.accordeonCon) {
                clearInterval(facet.sdxECCAAutoTimer);
                try {
                    if ((ctrl.autoComplete.selectedItems || []).length || (ctrl.classifPropModels || []).length) {
                        throw new Error("이미 분류가 선택된 화면에는 자동 초기화를 적용하지 않습니다.");
                    }
                    // OOTB prototype의 Map을 대화상자별로 분리합니다. 신규 생성 초기 연결 때만 실행합니다.
                    ctrl.classIdAndTitleMap = new Map();
                    ctrl._classPathMap = new Map();
                    ctrl._classNameMap = new Map();
                    ctrl._classUsageMap = new Map();
                    ctrl._attributeMap = new Map();
                    ctrl.apiAttributesCall = [];
                    ctrl._isProcessing = false;
                    ctrl.sdxECCAAutoSession = session;
                    // 현재 대화상자 문맥으로 조회합니다. 분류 폼 자체를 제거하지 않습니다.
                    ctrl.plmNewContextProvider = session.context;
                    if (ctrl.container) ctrl.container.style.display = "none";
                    session.controller = ctrl;
                    session.notify();
                    if (session.status === "error" || session.disposed) return;
                    if (session.ruleMode === "department") {
                        // 부서 조회는 현재 대화상자 문맥으로 매번 수행하며 전역 사용자/클래스 캐시를 두지 않습니다.
                        ClassRuleService.resolveDepartment({
                            securityContext: session.context, tenant: options.tenant
                        }, OrganizationProvider).then(function (rule) {
                            if (session.disposed || session.status === "error") return;
                            session.rule = rule;
                            sdxECCAApplyOrganizationClass(ctrl, session);
                        }).catch(function (error) {
                            if (!session.disposed && session.status !== "error") session.fail(error);
                        });
                    } else {
                        sdxECCAApplyOrganizationClass(ctrl, session);
                    }
                } catch (error) { session.fail(error); }
            } else if (Date.now() - started > 30000) {
                clearInterval(facet.sdxECCAAutoTimer);
                session.fail(new Error("분류 컨트롤러 또는 facet occurrence 준비 시간이 초과되었습니다."));
            }
        }, 100);
    }

    /** OOTB getClassPaths 응답으로 클래스 노드를 만들고 원래 select/change 처리를 실행합니다.
     * 검색 서비스나 존재를 확인하지 않은 별도 클래스 조회 API를 추가하지 않습니다.
     * classId는 General Class의 physicalid입니다. General Library ID를 넣으면 거부합니다.
     */
    function sdxECCAApplyOrganizationClass(ctrl, session) {
        if (session.started || session.disposed || session.status === "error") return;
        session.started = true;
        var service = ctrl.PLMNewCommonWebService;
        session.classId = session.rule.classId;
        service.getClassPaths({
            id: [session.classId],
            plmNewContextProvider: session.context,
            onComplete: function (response) {
                if (session.disposed || session.status === "error") return;
                try {
                    var chains = service.constructPath(response, "idPathChainMap");
                    var chain = chains.get(session.classId);
                    var leaf = chain && chain[chain.length - 1];
                    if (!leaf || leaf.physicalid !== session.classId || !ctrl.couldBeSelected(leaf.type)) {
                        throw new Error("설정한 클래스가 없거나 선택 가능한 General Class가 아닙니다.");
                    }
                    if (session.rule.libraryId && !chain.some(function (item) {
                        return item.physicalid === session.rule.libraryId;
                    })) throw new Error("클래스가 설정한 라이브러리 경로에 포함되지 않습니다.");
                    // 클래스 자체의 플래그를 먼저 읽어야 OOTB 첫 렌더링부터 필수 표시됩니다.
                    ClassAttributeService.load(service, {
                        classId: session.classId, securityContext: session.context, tenant: session.tenant
                    }).then(function (mandatory) {
                        if (session.disposed || session.status === "error") return;
                        session.mandatory = mandatory;
                        var path = service.extractPath(chain);
                        session.classTitle = leaf.label;
                        ctrl._classPathMap.set(session.classId, path);
                        ctrl._classNameMap.set(session.classId, leaf.label);
                        ctrl.classifPropertiesUI.setClassPath(ctrl.getClassPath());
                        ctrl.classifPropertiesUI.setClassUsage(ctrl.getClassUsage());
                        var data = {
                            id: session.classId, label: leaf.label, plmType: leaf.type,
                            value: {label: leaf.label, subLabel: path},
                            icons: [ctrl._getIcon(leaf)]
                        };
                        // OOTB 노드 생성 함수가 요구하는 임시 TreeDocument입니다. 선택 UI를 만들지는 않습니다.
                        var tree = ctrl.plmNewClassificationFacetData.createAutocompleteDataTree([]);
                        var node = ctrl.plmNewClassificationFacetData._createTreeNodeModel(
                            data, tree, ctrl.couldBeSelected.bind(ctrl)
                        );
                        ctrl.autoComplete._model.prepareUpdate();
                        var inserted = ctrl.insertInAutocomplete(ctrl.autocompleteLibrary, node);
                        if (!inserted) throw new Error("클래스 선택 노드를 추가할 수 없습니다.");
                        ctrl._nodesData[session.classId] = inserted;
                        ctrl.autoComplete._model.pushUpdate();
                        inserted.select();
                        // select 완료는 속성 로딩 완료가 아닙니다. 별도 ClassificationProp 완료 표식을 기다립니다.
                        session.notify();
                    }).catch(function (error) {
                        if (!session.disposed && session.status !== "error") session.fail(error);
                    });
                } catch (error) { session.fail(error); }
            },
            onFailure: function () { session.fail(new Error("지정 클래스 경로 조회에 실패했습니다.")); }
        });
    }

    function sdxECCADisconnectAutoClassification(facet) {
        clearInterval(facet.sdxECCAAutoTimer);
        if (facet.sdxECCAAutoSession) facet.sdxECCAAutoSession.dispose();
    }

    /** 현재 자동 대상 모델에만 세션을 붙입니다. 전역 이벤트만으로 완료를 판정하지 않습니다. */
    function sdxECCATagAutoClassModel(controller, model, classId) {
        var session = controller.sdxECCAAutoSession;
        if (session && !session.disposed && session.status !== "error" && session.classId === classId) {
            model.sdxECCAAutoSession = session;
            model.sdxECCAAutoClassId = classId;
        }
    }

    /** OOTB가 results.data로 변환한 직후, _onCompleteLoadModel 호출 전에 실행합니다.
     * 공유 속성 정의/기본 필드를 변경하지 않고 현재 클래스의 분류 속성만 복제합니다.
     */
    function sdxECCAPrepareClassAttributes(model, response) {
        var session = model && model.sdxECCAAutoSession;
        if (!session) return true;
        if (session.disposed || session.status === "error") return false;
        try {
            if (model.sdxECCAAutoClassId !== session.classId || typeof session.mandatory !== "boolean" ||
                !response || !Array.isArray(response.attribute)) {
                throw new Error("클래스 필수 속성 설정이 준비되지 않았습니다.");
            }
            if (session.mandatory) {
                if (!Array.isArray(response.results)) throw new Error("분류 속성 폼 변환 결과가 없습니다.");
                var names = new Set(response.attribute.map(function (attr) { return attr.name; }));
                var found = new Set();
                var results = response.results.map(function (row) {
                    if (!Array.isArray(row.data)) return row;
                    var data = row.data.map(function (attr) {
                        if (attr.extension !== session.classId || !names.has(attr.name)) return attr;
                        found.add(attr.name);
                        return Object.assign({}, attr, {mandatory: true});
                    });
                    return Object.assign({}, row, {data: data});
                });
                if (found.size !== names.size) throw new Error("필수 표시를 적용할 클래스 속성이 폼에 없습니다.");
                response.results = results;
            }
            session.mandatoryNames = response.attribute.map(function (attr) { return attr.name; });
            session.mandatoryPrepared = true;
            return true;
        } catch (error) { session.fail(error); return false; }
    }

    /** 화면이 사용하는 모델을 OOTB UIController에서 가져옵니다.
     * 선택 시 생성했던 모델 배열만 보고 검증 대상을 추정하지 않습니다.
     */
    function sdxECCAGetRenderedClassForm(session) {
        var ctrl = session.controller;
        var skeleton = ctrl && ctrl.classifPropertiesView && ctrl.classifPropertiesView.controller &&
            ctrl.classifPropertiesView.controller.skeleton;
        // classifPropertiesUI는 별도 보조 인스턴스입니다. 실제 이동한 폼의 facet을 사용합니다.
        var facet = skeleton && typeof skeleton.getFacetContent === "function" &&
            skeleton.getFacetContent("classificationAttiProp");
        var ui = facet && facet.editPropertiesUI && facet.editPropertiesUI.elements &&
            facet.editPropertiesUI.elements.UIController;
        if (!facet || typeof facet.getModel !== "function" || !ui || typeof ui.validateModels !== "function") {
            throw new Error("실제 분류 폼의 OOTB facet/UIController를 확인해 주세요.");
        }
        var model = facet.getModel();
        if (!model || model.get("objectId") !== session.classId || typeof model.values !== "function") {
            throw new Error("분류 폼에 표시된 클래스 모델을 확인해 주세요.");
        }
        return {model: model, ui: ui};
    }

    /** 자동 대상 클래스 모델에만 완료를 알립니다. 다른 위젯 모델에는 표식이 없어 즉시 반환합니다.
     * 빈 attribute 배열도 정상입니다. 배열 누락을 빈 폼 성공으로 취급하지 않습니다.
     * OOTB 서버 호출 실패로 여기까지 오지 않으면 세션 타임아웃이 생성을 막습니다.
     */
    function sdxECCANotifyAutoClassAttributes(model, response) {
        var session = model && model.sdxECCAAutoSession;
        if (!session || session.disposed || session.status === "error") return;
        if (!response || !Array.isArray(response.attribute)) {
            session.fail(new Error("클래스 속성 응답의 attribute 배열을 확인해 주세요."));
            return;
        }
        if (!session.mandatoryPrepared) {
            session.fail(new Error("폼 생성 전 prepareAttributes 호출을 확인해 주세요."));
            return;
        }
        try {
            var rendered = sdxECCAGetRenderedClassForm(session).model;
            // 필수값을 직접 판정하지 않습니다. 폼 생성 시 OOTB 모델에 전달됐는지만 확인합니다.
            if (session.mandatory) {
                var fields = rendered.values();
                session.mandatoryNames.forEach(function (name) {
                    var matches = fields.filter(function (field) {
                        return field && typeof field.get === "function" &&
                            field.get("name") === name && field.get("facet") === session.classId;
                    });
                    if (matches.length !== 1 || matches[0].get("mandatory") !== true) {
                        throw new Error("OOTB 분류 속성 모델에 mandatory가 반영되지 않았습니다: " + name);
                    }
                });
            }
            sdxECCARenderMandatoryIcons(session.controller.accordeonCon);
            session.markAttributesLoaded(model.sdxECCAAutoClassId);
        } catch (error) { session.fail(error); }
    }

    /** 기존 활성화 옵션명을 유지합니다. 현재 동작은 조직 매핑 대신 지정 클래스를 사용합니다. */
    function sdxECCAIsFixedClassWidget() {
        if (typeof widget === "undefined") return false;
        var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
        return enabled === true || enabled === "true";
    }

    /** 초기 typeInfo 조회부터 고정 타입으로 실행합니다. 다른 위젯의 옵션은 건드리지 않습니다.
     * displayDialog 이후에 Type.value만 바꾸면 다른 타입의 속성 정의로 생성할 수 있어 금지합니다.
     * OOTB 실제 철자는 preferedType입니다. 서버가 지원하고 생성 권한이 있는 타입을 지정해야 합니다.
     */
    function sdxECCAConfigureFixedCreateType(createOptions) {
        if (!sdxECCAIsFixedClassWidget()) return createOptions;
        var type = widget.getValue("sdxECCAAutoClassType") || "Change Action";
        createOptions.type = type;
        createOptions.options = createOptions.options || {};
        createOptions.options.typeName = type;
        createOptions.options.preferedType = type;
        return createOptions;
    }

    return {
        attachBridge: sdxECCAAttachAutoBridge,
        prepareFixedType: sdxECCAPrepareFixedType,
        installFields: sdxECCAInstallAutoFields,
        destroyFields: sdxECCADestroyAutoFields,
        checkFacetContext: sdxECCACheckAutoFacetContext,
        canSubmitDialog: sdxECCACanSubmitAutoDialog,
        preserveValidationState: sdxECCAPreserveValidationState,
        disposeDialog: sdxECCADisposeAutoDialog,
        connectClassification: sdxECCAConnectAutoClassification,
        disconnectClassification: sdxECCADisconnectAutoClassification,
        applyClass: sdxECCAApplyOrganizationClass,
        tagClassModel: sdxECCATagAutoClassModel,
        prepareAttributes: sdxECCAPrepareClassAttributes,
        renderMandatoryIcons: sdxECCARenderMandatoryIcons,
        notifyAttributesLoaded: sdxECCANotifyAutoClassAttributes,
        isEnabled: sdxECCAIsFixedClassWidget,
        configureCreateType: sdxECCAConfigureFixedCreateType
    };
});
