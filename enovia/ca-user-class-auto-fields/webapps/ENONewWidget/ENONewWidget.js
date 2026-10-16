/*
 * 전체 OOTB 파일 교체용이 아니라 변경·추가 조각입니다. 새 define/AMD ID를 만들지 않습니다.
 * 이 폴더는 검색창 없이 지정 클래스를 자동 적용하는 별도 방식입니다.
 * 앞의 ca-isolated-kit에서 연결한 zcaAttachBridge/zcaInstallPropertiesPicker 호출은
 * 아래 자동 방식 호출로 바꿉니다. 두 UI 설치 함수를 동시에 호출하지 않습니다.
 */

/* [1] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper factory 내부
 * 아래 세션 생성/연결 함수를 return 앞에 추가합니다.
 * getFacetList(e,t,i)의 최종 배열 a를 반환하기 직전에:
 *     zcaAttachAutoBridge(e, a, i);
 * 기존 zcaAttachBridge(e,a) 호출이 있다면 위 호출로 바꿉니다.
 */

/* [부서 기반 조회: 보류]
 * 이후 general type의 사용자 부서정보를 조회할 위치입니다.
 * 사용자 부서 조회 -> 부서별 클래스 ID 결정 -> 아래 rule에 전달하는 흐름으로 바꿀 수 있습니다.
 * 실제 타입명/속성명/API가 아직 정해지지 않아 조회 코드를 실행하지 않습니다.
 * 현재는 zcaFixedClassId로 지정한 클래스 하나를 자동 적용합니다.
 */

/** 대화상자마다 별도 세션을 만들어 초기화·속성 로딩·UI·생성 검증을 연결합니다. */
function zcaCreateAutoSession(context, type, rule) {
    var session = {
        context: context, type: type, rule: rule, controller: null,
        status: "loading", error: null, disposed: false, started: false,
        attributesLoaded: false, fieldsMounted: false, validateFields: null,
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
        session.listeners.forEach(function (fn) { fn(session); });
        session.listeners.clear();
        if (session.controller && session.controller.zcaAutoSession === session) {
            (session.controller.classifPropModels || []).forEach(function (model) {
                if (model.zcaAutoSession === session) {
                    delete model.zcaAutoSession;
                    delete model.zcaAutoClassId;
                }
            });
            delete session.controller.zcaAutoSession;
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
function zcaAttachAutoBridge(data, facetList, settings) {
    if (typeof widget === "undefined") return;
    var enabled = widget.getValue("zcaEnableAutoClassByOrganization");
    if (!(enabled === true || enabled === "true")) return;
    var attrs = data && data.defaultAttributes;
    var type = attrs && attrs.Type && attrs.Type.value;
    var targetType = widget.getValue("zcaAutoClassType") || "Change Action";
    if (type !== targetType) return;
    var properties = facetList.find(function (item) { return item.facet.name === "ENOCreate"; });
    var classification = facetList.find(function (item) { return item.facet.name === "classificationFacet"; });
    if (!properties || !classification) throw new Error("ENOCreate와 classificationFacet이 필요합니다.");
    var context = attrs && attrs.SecurityContext && attrs.SecurityContext.value;
    context = context || settings && settings.securityContext;
    var rule = null, configError = null;
    var typeDisplay = widget.getValue("zcaTypeDisplay") || "hidden";
    try {
        // TODO: 부서 기준 조회는 여기서 rule을 결정하도록 연결합니다. 현재는 실행하지 않습니다.
        var classId = widget.getValue("zcaFixedClassId");
        var libraryId = widget.getValue("zcaFixedLibraryId");
        if (typeof classId !== "string" || !classId.trim()) {
            throw new Error("zcaFixedClassId에 클래스 physicalid를 지정해 주세요.");
        }
        if (typeDisplay !== "hidden" && typeDisplay !== "disabled") {
            throw new Error("zcaTypeDisplay는 hidden 또는 disabled로 지정해 주세요.");
        }
        rule = {classId: classId.trim(), libraryId: libraryId || null};
    } catch (error) { configError = error; }
    var session = zcaCreateAutoSession(context, type, rule);
    session.typeDisplay = typeDisplay;
    properties.options = properties.options || {};
    classification.options = classification.options || {};
    properties.options.zcaAutoSession = session;
    classification.options.zcaAutoSession = session;
    classification.alwaysCalled = true;
    if (configError) session.fail(configError);
}

/* [2] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet factory 내부
 * 아래 함수를 return 앞에 추가합니다.
 * init(t)의 this._parent(t) 바로 뒤, this.listview.buildModel(t.data)보다 앞:
 *     zcaPrepareFixedType(t.data,t.zcaAutoSession);
 * init(t)의 this.listview.loadView() 뒤: zcaInstallAutoFields(this,t);
 * destroy()의 this.listview.destroy() 앞: zcaDestroyAutoFields(this);
 * updateFacet(e)의 첫 줄: zcaCheckAutoFacetContext(this,e);
 * init의 기존 onChangeAttribute 콜백 안:
 *   New-SecurityContext 분기에서 n=e[t]를 얻은 직후:
 *       if(i.zcaAutoSession)i.zcaAutoSession.checkContext(n.valueDB);
 *   New-Type 분기에서 n=e[t]를 얻은 직후:
 *       if(i.zcaAutoSession)i.zcaAutoSession.checkType(n.valueDB);
 * 기존 publishInfo와 o(e) 호출은 유지합니다.
 */

/** OOTB가 유형 모델을 만들기 전에 표시·편집 메타데이터를 제한합니다.
 * 타입 값은 CreateNew 이전부터 지정해야 합니다. 여기서 다른 타입으로 값만 바꾸지 않습니다.
 * OOTB isReadOnly는 편집을 막는 모델 옵션이며, disabled 모드의 실제 모양은 렌더러에 따릅니다.
 */
function zcaPrepareFixedType(data, session) {
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
function zcaInstallAutoFields(facet, options) {
    var session = options.zcaAutoSession;
    if (!session) return;
    facet.zcaAutoSession = session;
    facet.zcaAutoDisposed = false;
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
    facet.zcaAutoRoot = root;
    facet.zcaAutoHost = host;
    session.showMessage = function (message) {
        if (!facet.zcaAutoDisposed) status.textContent = message;
    };
    facet.zcaAutoUnsubscribe = session.subscribe(function (state) {
        if (state.disposed) { zcaDestroyAutoFields(facet); return; }
        if (state.controller && state.status !== "error") {
            try { zcaMountAutoFields(facet, state); }
            catch (error) { state.fail(error); return; }
        }
        state.refreshReady();
        status.textContent = state.error ? state.error.message :
            state.status === "ready" ? "" : "지정 클래스 속성을 준비하고 있습니다…";
        host.style.display = state.attributesLoaded ? "" : "none";
    });
    require(["DS/ClassificationProp/utils/AttributesUtils"], function (AttributesUtils) {
        if (session.disposed || facet.zcaAutoDisposed) return;
        session.validateFields = function () {
            var ctrl = session.controller;
            if (!ctrl || !Array.isArray(ctrl.classifPropModels) || ctrl.classifPropModels.length !== 1) {
                throw new Error("자동 적용한 클래스 모델을 확인해 주세요.");
            }
            var model = ctrl.classifPropModels[0];
            if (model.get("objectId") !== session.classId) throw new Error("클래스 모델이 일치하지 않습니다.");
            var errors = AttributesUtils.validateAttributes(model, model.getAttributeFromField());
            if (errors && errors.length) throw new Error(errors.map(function (item) { return item.message; }).join("\n"));
        };
        session.refreshReady();
        session.notify();
    }, function () { session.fail(new Error("OOTB 속성 검증 모듈을 로드할 수 없습니다.")); });
}

/** 기존 폼 객체를 한 번 이동하고, 종료 시 돌려놓을 원래 위치를 기억합니다. */
function zcaMountAutoFields(facet, session) {
    var ctrl = session.controller, form = ctrl.accordeonCon;
    if (!form || form.nodeType !== 1 || !ctrl.classifPropertiesView) {
        throw new Error("분류 속성 폼의 accordeonCon이 없습니다.");
    }
    var binding = facet.zcaAutoBinding;
    if (!binding) {
        if (!form.parentNode) throw new Error("분류 속성 폼이 아직 연결되지 않았습니다.");
        binding = facet.zcaAutoBinding = {form: form, parent: form.parentNode, next: form.nextSibling};
    } else if (binding.form !== form) {
        throw new Error("분류 폼이 재초기화되었습니다. 화면을 다시 열어 주세요.");
    }
    if (form.parentNode !== facet.zcaAutoHost) facet.zcaAutoHost.appendChild(form);
    session.fieldsMounted = true;
    clearTimeout(facet.zcaAutoResize);
    facet.zcaAutoResize = setTimeout(function () {
        if (!facet.zcaAutoDisposed && !session.disposed && ctrl.classifPropertiesView.onInnerResize) {
            ctrl.classifPropertiesView.onInnerResize();
        }
    }, 0);
}

function zcaCheckAutoFacetContext(facet, options) {
    var session = facet.zcaAutoSession;
    var attrs = options.data && options.data.defaultAttributes;
    if (!session || !attrs) return;
    zcaPrepareFixedType(options.data, session);
    if (attrs.SecurityContext) session.checkContext(attrs.SecurityContext.value);
    if (attrs.Type) session.checkType(attrs.Type.value);
}

/** 폼을 이동 전 위치로 돌려놓습니다. 기존 폼과 모델은 파괴하지 않습니다. */
function zcaDestroyAutoFields(facet) {
    if (facet.zcaAutoDisposed) return;
    facet.zcaAutoDisposed = true;
    clearTimeout(facet.zcaAutoResize);
    if (facet.zcaAutoUnsubscribe) facet.zcaAutoUnsubscribe();
    var binding = facet.zcaAutoBinding;
    if (binding) {
        if (binding.next && binding.next.parentNode === binding.parent) binding.parent.insertBefore(binding.form, binding.next);
        else binding.parent.appendChild(binding.form);
    }
    if (facet.zcaAutoRoot && facet.zcaAutoRoot.parentNode) facet.zcaAutoRoot.parentNode.removeChild(facet.zcaAutoRoot);
    if (facet.zcaAutoSession) facet.zcaAutoSession.dispose();
}

/* [3] DS/ENONewWidget/ENONew/Controller/ENONewDialogController factory 내부
 * 아래 함수를 return 앞에 추가합니다.
 * onSubmitDialog(e)의 첫 줄(기존 ServiceCallback보다 앞):
 *     if(!zcaCanSubmitAutoDialog(this)){this.resetButtons();return;}
 * destroy()의 첫 줄: zcaDisposeAutoDialog(this);
 * 기존 생성, 취소, postCreation 호출은 유지합니다.
 */

function zcaFindAutoSession(dialog) {
    var facets = dialog.View && dialog.View.facets || dialog.facets || [];
    for (var i = 0; i < facets.length; i++) {
        if (facets[i].options && facets[i].options.zcaAutoSession) return facets[i].options.zcaAutoSession;
    }
    return null;
}

/** 클릭/Enter/반복 생성이 지나는 OOTB 공통 생성 입구에서 준비와 입력값을 검증합니다. */
function zcaCanSubmitAutoDialog(dialog) {
    var session = zcaFindAutoSession(dialog);
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
        if (session.showMessage) session.showMessage(error.message || String(error));
        return false;
    }
}

function zcaDisposeAutoDialog(dialog) {
    var session = zcaFindAutoSession(dialog);
    if (session) session.dispose();
}
