/**
 * CA 생성창 처리 — 전체 배포합니다. OOTB 연결 API/AMD 이름은 유지합니다.
 *
 * 환경 값: webapps/ENOChgGovernanceUX/ENOChgGovernance.html H1
 * 서버 조회: sdxECCADataService.js
 * 이 파일: C0 설정 읽기 / C1 세션 / C2 저장 데이터 / C3 폼 / C4 검증 / C5 자동 분류
 *          C6 속성 표시·편집·필수 제어 / C7 모델 검색 UI·선택 결과
 *
 * 검색 선택 후 필드 자동 채움: C7 accept()의 record.attributes
 * 저장 직전 값 설정: C2 sdxECCABindCreatePolicy()의 onSubmit 연결
 * 아래 세 named AMD 모듈은 이 파일에서 함께 등록합니다. 별도 JS 파일은 필요 없습니다.
 * 기능별 함수 범위와 지연 실행을 유지하여 OOTB 초기화 순서를 바꾸지 않습니다.
 */
define("DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService", [
    "require",
    "DS/sdxENOChgGovernanceUX/custom/services/sdxECCADataService"
], function (require, Services) {
    "use strict";

    var ClassRuleService = Services.classRule;
    var OrganizationProvider = Services.organization;
    var ClassAttributeService = Services.classAttribute;

    // C0. 환경 설정 읽기. 설정값 변경은 ENOChgGovernance.html의 H1 한곳에서 합니다.
    // 위젯/대화상자별로 읽으며 공통 AMD 모듈에 위젯 설정을 캐시하지 않습니다.
    function sdxECCAReadSettings() {
        if (typeof widget === "undefined") return {};
        return {
            enabled: widget.getValue("sdxECCAEnableAutoClassByOrganization"),
            type: widget.getValue("sdxECCAAutoClassType"),
            policy: widget.getValue("sdxECCACreatePolicy"),
            controlState: widget.getValue("sdxECCAAttributeControlState"),
            typeDisplay: widget.getValue("sdxECCATypeDisplay"),
            ruleMode: widget.getValue("sdxECCAClassRuleMode"),
            classId: widget.getValue("sdxECCAFixedClassId"),
            libraryId: widget.getValue("sdxECCAFixedLibraryId"),
            classCode: widget.getValue("sdxECCAClassCode"),
            libraryTitle: widget.getValue("sdxECCALibraryTitle"),
            libraryName: widget.getValue("sdxECCALibraryName"),
            searchEnabled: widget.getValue("sdxECCAEnableModelSearch"),
            searchValueField: widget.getValue("sdxECCAModelSearchValueField"),
            controlUrl: widget.getValue("sdxECCAAttributeControlUrl")
        };
    }

    // C1. 세션 생성·종료와 협업공간 변경

    /** 대화상자마다 별도 세션을 만들어 초기화·속성 로딩·UI·생성 검증을 연결합니다. */
    function sdxECCACreateAutoSession(context, type, rule) {
        var session = {
            context: context, currentContext: context, type: type, rule: rule, controller: null,
            status: "loading", error: null, disposed: false, started: false, transitioning: false, contextChangeTimer: null,
            mandatory: null, mandatoryPrepared: false, mandatoryNames: [], attributesLoaded: false, fieldsMounted: false, validateFields: null,
            classId: null, classTitle: null, typeDisplay: "hidden", readCurrentType: null, listeners: new Set(), timer: null,
            cancelRequest: null, attributeControlReady: type !== "sdxECChangeAction", classificationControlReady: type !== "sdxECChangeAction"
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
            if (session.disposed || session.transitioning || session.status === "error") return;
            if (session.attributesLoaded && session.fieldsMounted && session.validateFields && session.attributeControlReady && session.classificationControlReady) {
                session.status = "ready";
                clearTimeout(session.timer);
            }
        };
        session.markAttributesLoaded = function (classId) {
            if (session.disposed || session.transitioning || session.status === "error" || classId !== session.classId) return;
            session.attributesLoaded = true;
            session.refreshReady();
            session.notify();
        };
        session.checkContext = function (value) {
            // 입력한 값을 버리지 않도록 문맥 변경 시 다시 열도록 안내합니다.
            if (typeof value !== "string" || !value.trim() || value !== session.context) {
                session.fail(new Error("권한 문맥이 변경되었습니다. 생성 화면을 닫고 다시 열어 주세요."));
            }
        };
        session.changeContext = function (value) {
            if (session.disposed || (!session.transitioning && value === session.context)) return;
            // onChangeAttribute의 원래 자격증명/프로젝트 초기화가 끝나기 전에는
            // dispose, UI 교체, 검증 이벤트 발행을 실행하지 않습니다.
            session.pendingContext = value;
            session.transitioning = true;
            session.status = "loading";
            session.fieldsValid = false;
            if (session.validationFacet) session.validationFacet.facetValidation = false;
            if (session.contextChangeTimer) return;
            var started = Date.now();
            function restartWhenReady() {
                session.contextChangeTimer = null;
                if (session.disposed) return;
                if (!session.dialog) {
                    if (Date.now() - started > 30000) {
                        session.fail(new Error("권한 문맥 변경을 위한 생성창 준비 시간이 초과되었습니다."));
                        return;
                    }
                    session.contextChangeTimer = setTimeout(restartWhenReady, 25);
                    return;
                }
                // 초기 구성 중의 중간 이벤트 값 대신, 준비 완료 후 최종 선택 모델을 읽습니다.
                try {
                    var context = session.readCurrentContext ? session.readCurrentContext() : session.pendingContext;
                    if (typeof context !== "string" || !context.trim()) {
                        throw new Error("선택한 권한 문맥을 확인할 수 없습니다.");
                    }
                    sdxECCARestartAutoSession(session, context);
                } catch (error) { session.fail(error); }
            }
            session.contextChangeTimer = setTimeout(restartWhenReady, 0);
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
            clearTimeout(session.dialogBindTimer);
            clearTimeout(session.objectSearchTimer);
            clearTimeout(session.contextChangeTimer);
            session.bindingDialog = null;
            if (session.cleanupObjectSearch) session.cleanupObjectSearch();
            if (session.cleanupAttributeControl) session.cleanupAttributeControl();
            if (session.cancelRequest) session.cancelRequest();
            if (session.cleanupValidation) session.cleanupValidation();
            if (session.cleanupContextWatch) session.cleanupContextWatch();
            session.listeners.forEach(function (fn) { fn(session); });
            session.listeners.clear();
            if (session.controller && session.controller.sdxECCAAutoSession === session) {
                // 모델의 종료 세션 표식은 유지합니다. 늦은 속성 응답도 prepareAttributes에서 거부합니다.
                delete session.controller.sdxECCAAutoSession;
            }
            session.controller = null;
            session.validateFields = null;
            session.showMessage = null;
            session.readCurrentType = null;
            session.readCurrentContext = null;
        };
        session.timer = setTimeout(function () {
            session.fail(new Error("지정 클래스 속성 준비 시간이 초과되었습니다."));
        }, 60000);
        return session;
    }

    /** 대상 위젯에만 세션을 전달합니다. 클래스 코드/유형은 전용 위젯에서 설정합니다. */
    function sdxECCAAttachAutoBridge(data, facetList, settings, createPolicy) {
        if (typeof widget === "undefined") return;
        var settingsValues = sdxECCAReadSettings();
        var enabled = settingsValues.enabled;
        if (!(enabled === true || enabled === "true")) return;
        var attrs = data && data.defaultAttributes;
        var type = attrs && attrs.Type && attrs.Type.value;
        var targetType = settingsValues.type || "Change Action";
        if (type !== targetType) return;
        var properties = facetList.find(function (item) { return item.facet.name === "ENOCreate"; });
        var classification = facetList.find(function (item) { return item.facet.name === "classificationFacet"; });
        if (!properties || !classification) throw new Error("ENOCreate와 classificationFacet이 필요합니다.");
        var createModel = data && data.model;
        var context = createModel && typeof createModel.getSecurityContext === "function" ?
            createModel.getSecurityContext() : attrs && attrs.SecurityContext && attrs.SecurityContext.value;
        context = context || settings && settings.securityContext;
        var rule = null, configError = null;
        var typeDisplay = settingsValues.typeDisplay || "hidden";
        try {
            var ruleMode = settingsValues.ruleMode || "code";
            if (ruleMode !== "fixed" && ruleMode !== "department" && ruleMode !== "code") {
                throw new Error("sdxECCAClassRuleMode는 code, fixed 또는 department로 지정해 주세요.");
            }
            // code/department 모드에는 고정 ID가 필요하지 않습니다. 조회 실패 시 고정값으로 우회하지 않습니다.
            if (ruleMode === "fixed") rule = ClassRuleService.resolveFixed({
                classId: settingsValues.classId,
                libraryId: settingsValues.libraryId
            });
            if (typeDisplay !== "hidden" && typeDisplay !== "disabled") {
                throw new Error("sdxECCATypeDisplay는 hidden 또는 disabled로 지정해 주세요.");
            }
        } catch (error) { configError = error; }
        var session = sdxECCACreateAutoSession(context, type, rule);
        session.facetEntries = facetList;
        session.createPolicy = createPolicy === undefined ? settingsValues.policy : createPolicy;
        session.attributeControlState = settings && settings.attributeControlState ||
            settingsValues.controlState || "CREATE";
        session.typeDisplay = typeDisplay;
        session.ruleMode = ruleMode;
        session.classCode = settingsValues.classCode || "EC_MX";
        // 기존 LibraryName 설정값도 제목으로 해석하여 이전 위젯 설정을 호환합니다.
        session.libraryTitle = settingsValues.libraryTitle || settingsValues.libraryName || "EC Library";
        session.tenant = settings && settings.tenant || "OnPremise";
        properties.options = properties.options || {};
        classification.options = classification.options || {};
        properties.options.sdxECCAAutoSession = session;
        classification.options.sdxECCAAutoSession = session;
        classification.require = "DS/sdxECCACreate/ClassificationFacet";
        classification.alwaysCalled = true;
        // 속성/분류/북마크 탭 선택 영역은 OOTB 표시 상태를 유지합니다.
        if (configError) session.fail(configError);
    }

    /** 새 세션/새 컨트롤러로 교체해 이전 문맥의 모든 콜백과 폼을 격리합니다. */
    function sdxECCARestartAutoSession(previous, context) {
        var properties = previous.propertiesFacet, classification = previous.classificationFacet;
        if (!properties || !classification || typeof classification.sdxECCARebuildUI !== "function") {
            previous.fail(new Error("권한 문맥 재초기화를 위한 커스텀 생성 모듈 연결을 확인해 주세요."));
            return;
        }
        var dialog = previous.dialog || previous.bindingDialog;
        var entries = previous.facetEntries || [];
        var next = sdxECCACreateAutoSession(context, previous.type, previous.ruleMode === "fixed" ? previous.rule : null);
        ["createPolicy", "typeDisplay", "ruleMode", "classCode", "libraryTitle", "tenant", "textAttributePairs", "attributeControlState"].forEach(function (key) {
            next[key] = previous[key];
        });
        next.facetEntries = entries;
        // dispose는 이전 제출 콜백/검색/표시 조회/분류 속성 응답을 모두 차단합니다.
        previous.dispose();
        clearInterval(classification.sdxECCAAutoTimer);
        entries.forEach(function (entry) {
            if (entry.options && entry.options.sdxECCAAutoSession === previous) {
                entry.options.sdxECCAAutoSession = next;
                entry.options.securityContext = context;
            }
        });
        [properties, classification].forEach(function (facet) {
            if (facet.options) {
                facet.options.sdxECCAAutoSession = next;
                facet.options.securityContext = context;
            }
        });
        delete properties.sdxECCAAutoBinding;
        classification.sdxECCAValidationInstalled = false;
        classification.facetValidation = false;
        classification.sdxECCAAutoContext = context;
        classification.sdxECCAAutoSession = next;
        var options = Object.assign({}, previous.classificationOptions, {sdxECCAAutoSession: next, securityContext: context});
        try {
            sdxECCAInstallAutoFields(properties, {sdxECCAAutoSession: next});
            classification.sdxECCARebuildUI(context);
            sdxECCAConnectAutoClassification(classification, options);
            if (dialog) sdxECCABindDialog(dialog);
        } catch (error) { next.fail(error); }
    }

    /** sdxECChangeAction 전용 필드입니다. 숨긴 모델도 만들어 저장 데이터에 값을 유지합니다. */
    // C2. 폼 데이터 준비와 저장 전 값 설정 (Text·조직·EC Type·policy)

    function sdxECCAPrepareECType(data, session) {
        if (session.type !== "sdxECChangeAction") return;
        var groups = data && data.attributes;
        var found = false;
        Object.keys(groups || {}).forEach(function (key) {
            var attributes = groups[key];
            if (!Array.isArray(attributes)) return;
            attributes.forEach(function (attribute) {
                if (!attribute || attribute.name !== "sdxECType") return;
                found = true;
                attribute.value = "ECR";
                attribute.modified = true;
                attribute.isReadOnly = true;
                attribute.visible = false;
                // visible:false만으로 모델 생성까지 생략되지 않도록 OOTB forUI를 사용합니다.
                attribute.forUI = true;
                attribute.storeLocalPreference = false;
                // 다른 필드의 변경 이벤트로 다시 표시되는 조건도 제거합니다.
                delete attribute.visibility;
            });
        });
        if (!found) throw new Error("sdxECChangeAction의 sdxECType 속성 정의를 찾지 못했습니다.");
    }

    /** 기본/확장 속성만 숨깁니다. 분류 클래스 속성은 별도 facet이므로 대상이 아닙니다. */
    function sdxECCAPrepareTextAttributes(data, session) {
        if (session.type !== "sdxECChangeAction") return;
        session.textAttributePairs = [];
        ["publicAttributes", "extensionAttributes"].forEach(function (group) {
            var attributes = data.attributes && data.attributes[group];
            if (!Array.isArray(attributes)) return;
            attributes.forEach(function (attribute, index) {
                if (!attribute || typeof attribute.name !== "string" || !/Text$/.test(attribute.name)) return;
                var sourceName = attribute.name.slice(0, -4);
                var hidden = Object.assign({}, attribute, {
                    visible: false, forUI: true, isReadOnly: true, storeLocalPreference: false,
                    // 값은 검증 후 복사하므로 숨긴 필드의 필수 검증으로 제출을 막지 않습니다.
                    mandatory: false
                });
                delete hidden.visibility;
                attributes[index] = hidden;
                // 원본이 없는 Text 속성도 숨기되 기존 값을 임의로 지우지 않습니다.
                if (attributes.some(function (item) { return item && item.name === sourceName; })) {
                    session.textAttributePairs.push({group: group, sourceName: sourceName, target: hidden});
                }
            });
        });
    }

    /** BL/모델 직렬화가 끝난 최신 value를 복사합니다. 초기 typeInfo 값은 사용하지 않습니다. */
    function sdxECCACopyTextAttributes(result, session) {
        (session.textAttributePairs || []).forEach(function (pair) {
            var attributes = result.attributes && result.attributes[pair.group];
            var source = Array.isArray(attributes) && attributes.find(function (item) {
                return item && item.name === pair.sourceName;
            });
            if (!source || !Object.prototype.hasOwnProperty.call(source, "value") || source.value === undefined) {
                throw new Error("Text 속성에 복사할 저장 값을 찾지 못했습니다: " + pair.sourceName);
            }
            var value = Array.isArray(source.value) ? source.value.slice() : source.value;
            var index = attributes.findIndex(function (item) { return item && item.name === pair.target.name; });
            var target = Object.assign({}, pair.target, index < 0 ? null : attributes[index], {
                value: value, modified: true
            });
            if (index < 0) attributes.push(target);
            else attributes[index] = target;
        });
    }

    /** 설치 환경의 실제 요청 구조: basicAttributes.policy는 문자열입니다. */
    function sdxECCAPreparePolicy(data, session) {
        if (session.type !== "sdxECChangeAction") return;
        var policyName = session.createPolicy;
        if (policyName !== "sdxECR" && policyName !== "sdxECO") {
            throw new Error("생성 Policy 파라미터는 sdxECR 또는 sdxECO로 지정해 주세요.");
        }
        if (data.basicAttributes == null) data.basicAttributes = {};
        if (typeof data.basicAttributes !== "object" || Array.isArray(data.basicAttributes)) {
            throw new Error("basicAttributes가 객체가 아닙니다.");
        }
        data.basicAttributes.policy = policyName;
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
            sdxECCAPrepareECType(data, session);
            sdxECCAPrepareTextAttributes(data, session);
            sdxECCAPreparePolicy(data, session);
            sdxECCAPrepareControlledAttributes(data, session);
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

    /** 제어 조회 전에 입력창이 노출되지 않도록 모델은 보존하고 표시/필수만 대기시킵니다. */
    function sdxECCAPrepareControlledAttributes(data, session) {
        if (session.type !== "sdxECChangeAction") return;
        ["publicAttributes", "extensionAttributes"].forEach(function (group) {
            var rows = data.attributes && data.attributes[group];
            if (!Array.isArray(rows)) return;
            data.attributes[group] = rows.map(function (attribute) {
                if (!attribute) return attribute;
                var controlled = Object.assign({}, attribute, {visible: false, forUI: true, mandatory: false});
                delete controlled.visibility;
                return controlled;
            });
        });
    }

    /** 선택 사항인 모델 필드는 실제 검색 선택 또는 빈 값만 최종 저장에 반영합니다. */
    function sdxECCAPrepareModelSelection(result, session, view) {
        if (!session.modelSearchEnabled) return;
        var fields = view.propModel && view.propModel.getAttributeFromField &&
            view.propModel.getAttributeFromField("name", "sdxECModel");
        var field = fields && fields[0];
        if (field && (field.visible === false || field.readOnly === true)) return;
        if (session.modelSearchLoading) throw new Error("모델 속성 조회가 끝난 뒤 저장해 주세요.");
        var selected = session.modelSearchSelection;
        if (selected && (selected.context !== session.context || selected.type !== "sdxMTopAssy" ||
            typeof selected.id !== "string" || !selected.id || typeof selected.value !== "string" || !selected.value)) {
            throw new Error("모델을 현재 권한 문맥에서 다시 선택해 주세요.");
        }
        var value = selected ? selected.value : "";
        ["publicAttributes", "extensionAttributes"].forEach(function (group) {
            var original = view.data && view.data.attributes && view.data.attributes[group];
            var rows = result.attributes && result.attributes[group];
            var template = Array.isArray(original) && original.find(function (item) { return item && item.name === "sdxECModel"; });
            var index = Array.isArray(rows) ? rows.findIndex(function (item) { return item && item.name === "sdxECModel"; }) : -1;
            if (!template && index < 0) return;
            if (!result.attributes) result.attributes = {};
            if (!Array.isArray(rows)) rows = result.attributes[group] = [];
            var attribute = Object.assign({}, template || rows[index], index < 0 ? null : rows[index], {value: value, modified: true});
            if (index < 0) rows.push(attribute); else rows[index] = attribute;
        });
    }

    /** 조직값 출처 확정 후 session.organizationValue에 넣습니다. 미지정이면 기존 값을 유지합니다. */
    function sdxECCAPrepareOrganization(result, session, view) {
        var value = session.organizationValue;
        if (typeof value !== "string" || !value.trim()) return;
        var original = view.data && view.data.attributes && view.data.attributes.publicAttributes;
        var field = Array.isArray(original) && original.find(function (item) {
            return item && item.name === "sdxECOrganization";
        });
        if (!result.attributes) result.attributes = {};
        var rows = result.attributes.publicAttributes;
        if (!Array.isArray(rows)) rows = result.attributes.publicAttributes = [];
        var index = rows.findIndex(function (item) { return item && item.name === "sdxECOrganization"; });
        if (!field && index < 0) throw new Error("sdxECOrganization 속성 정의를 찾지 못했습니다.");
        var updated = Object.assign({}, field, index >= 0 ? rows[index] : null, {value: value, modified: true});
        if (index >= 0) rows[index] = updated; else rows.push(updated);
    }

    /** OOTB BL/모델 직렬화가 끝난 콜백에서 문맥·정책·모델 선택값을 확정합니다. */
    function sdxECCABindCreatePolicy(facet, session) {
        if (session.type !== "sdxECChangeAction" || facet.sdxECCAPolicySubmitBinding) return;
        var view = facet.listview;
        var original = view && view.onSubmit;
        if (typeof original !== "function") throw new Error("ENOListView.onSubmit 연결을 확인해 주세요.");
        var wrapped = function (callback) {
            return original.call(this, function (result) {
                // OOTB 검증 실패는 그대로 전달합니다. 실패를 성공 데이터로 바꾸지 않습니다.
                if (!result) { callback(result); return; }
                if (session.disposed || session.transitioning || session.status === "error") { callback(false); return; }
                try {
                    var currentContext = session.readCurrentContext();
                    if (currentContext !== session.context) {
                        session.changeContext(currentContext);
                        callback(false);
                        return;
                    }
                    // 이벤트 누락 및 비동기 BL 실행 중 변경도 최종 직렬화 결과로 확인합니다.
                    session.checkContext(session.readCurrentContext());
                    if (!result.defaultAttributes) {
                        throw new Error("생성 요청의 기본 속성이 누락되었습니다.");
                    }
                    var security = result.defaultAttributes.SecurityContext;
                    // OOTB 직렬화가 생략한 문맥만 검증된 현재 선택값으로 보충합니다.
                    // 기존 값이 있으면 덮어쓰지 않고 아래에서 일치 여부를 검사합니다.
                    var createModel = view.data && view.data.model;
                    var modelContext = createModel && typeof createModel.getSecurityContext === "function";
                    // 2026은 생성 모델에서 HTTP 권한 문맥을 읽습니다. legacy 필드를 새로 만들지 않습니다.
                    if (modelContext) {
                        session.checkContext(createModel.getSecurityContext());
                        if (security) session.checkContext(security.value);
                    } else if (!security || security.value == null) {
                        var selectedContext = session.readCurrentContext();
                        session.checkContext(selectedContext);
                        if (session.status === "error") throw session.error;
                        security = Object.assign({}, security, {
                            name: "SecurityContext", value: selectedContext
                        });
                        result.defaultAttributes.SecurityContext = security;
                    }
                    if (!modelContext) session.checkContext(security.value);
                    if (session.status === "error") throw session.error;
                    var type = result.defaultAttributes && result.defaultAttributes.Type;
                    if (!type || type.value !== session.type) throw new Error("생성 요청의 유형이 지정 유형과 다릅니다.");
                    // OOTB _parseModel은 basicAttributes를 결과에서 생략할 수 있습니다.
                    // 원래 기본 속성을 보존해 결과에 넣으면 createContent가 rawTypeInfo에도 반영합니다.
                    result.basicAttributes = Object.assign({}, view.data && view.data.basicAttributes, result.basicAttributes);
                    sdxECCAPreparePolicy(result, session);
                    // BL이나 기본 tweaker가 전달한 임의 입력은 최종 요청에서도 저장하지 않습니다.
                    sdxECCAPrepareModelSelection(result, session, view);
                    sdxECCAPrepareOrganization(result, session, view);
                    sdxECCACopyTextAttributes(result, session);
                } catch (error) {
                    session.fail(error);
                    callback(false);
                    return;
                }
                callback(result);
            });
        };
        facet.sdxECCAPolicySubmitBinding = {view: view, original: original, wrapped: wrapped};
        view.onSubmit = wrapped;
    }

    // C3. 기본 폼 연결·자동 분류 영역 배치·검색 예약

    /** 2026의 필수값 버튼 검사는 원래 검증기로 수행하되 실제 필드에 초기 오류를 남기지 않습니다. */
    function sdxECCACheckMandatoryQuietly(view, original) {
        var snapshot = Object.create(view);
        snapshot.propModel = Object.create(view.propModel);
        snapshot.propModel.getAllAttributes = function () {
            var fields = view.propModel.getAllAttributes(), copies = {};
            Object.keys(fields).forEach(function (key) {
                var field = fields[key];
                if (!field || typeof field !== "object" || field.isUIModified) { copies[key] = field; return; }
                var copy = Object.create(field);
                copy.resetError = function () {};
                copy.setError = function () {};
                copies[key] = copy;
            });
            return copies;
        };
        return original.call(snapshot);
    }

    /** OOTB 분류 폼을 이동하고 대상 타입의 모델 검색을 연결합니다. */
    function sdxECCAInstallAutoFields(facet, options) {
        var session = options.sdxECCAAutoSession;
        if (!session) return;
        var settingsValues = sdxECCAReadSettings();
        session.propertiesFacet = facet;
        var searchEnabled = typeof widget !== "undefined" && settingsValues.searchEnabled;
        session.modelSearchEnabled = session.type === "sdxECChangeAction" && searchEnabled !== false && searchEnabled !== "false";
        facet.sdxECCAAutoSession = session;
        facet.sdxECCAAutoDisposed = false;
        var view = facet.listview;
        if (view && typeof view.checkForMandatoryAttributes === "function" && !facet.sdxECCAQuietMandatoryBinding) {
            var check = view.checkForMandatoryAttributes;
            var quietCheck = function () { return sdxECCACheckMandatoryQuietly(this, check); };
            facet.sdxECCAQuietMandatoryBinding = {view: view, original: check, wrapped: quietCheck};
            view.checkForMandatoryAttributes = quietCheck;
        }
        try { sdxECCABindCreatePolicy(facet, session); }
        catch (error) { session.fail(error); }
        session.readCurrentType = function () {
            var view = facet.listview;
            var field = view && view.propModel && view.propModel.get("New-Type");
            return field ? field.valueDB : view && view.data && view.data.defaultAttributes &&
                view.data.defaultAttributes.Type && view.data.defaultAttributes.Type.value;
        };
        session.readCurrentContext = function () {
            var view = facet.listview;
            var createModel = view && view.data && view.data.model;
            if (createModel && typeof createModel.getSecurityContext === "function") {
                return createModel.getSecurityContext();
            }
            var field = view && view.propModel && view.propModel.get("New-SecurityContext");
            var value;
            if (field) {
                value = typeof field.get === "function" ? field.get("valueDB") : undefined;
                if (value == null) value = field.valueDB;
            }
            return value != null ? value : session.currentContext;
        };
        // 2026의 project/organisation/role 선택은 생성 모델의 securityContext를 갱신합니다.
        var createModel = facet.listview && facet.listview.data && facet.listview.data.model;
        if (createModel && typeof createModel.getSecurityContext === "function") {
            if (typeof createModel.addEvent !== "function" || typeof createModel.removeEvent !== "function") {
                session.fail(new Error("생성 모델의 권한 문맥 변경 이벤트를 확인해 주세요."));
            } else {
                var onContextChange = function () {
                    if (session.disposed) return;
                    var value = createModel.getSecurityContext();
                    session.currentContext = value;
                    session.changeContext(value);
                };
                createModel.addEvent("onChange:securityContext", onContextChange);
                session.cleanupContextWatch = function () {
                    createModel.removeEvent("onChange:securityContext", onContextChange);
                    session.cleanupContextWatch = null;
                };
            }
        }
        var root = document.createElement("div");
        var style = document.createElement("style");
        style.textContent = ".sdxECCAObjectSearchValue { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; } .sdxECCAObjectSearchValue > .formTweakerContainer { flex: 1; min-width: 0; } .sdxECCAObjectSearchButton { cursor: pointer; min-width: 28px; height: 28px; border: 1px solid #b4b6ba; border-radius: 3px; background: white; } .sdxECCAObjectSearchError { width: 100%; color: #b32020; } .sdxECCAClassFields .flexLine .formLabel .mandIcon { font-size: 7px; font-family: DSFontIcon; color: rgb(234, 79, 55) !important; }";
        root.appendChild(style);
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
            if (state.controller && !state.transitioning && state.status !== "error") {
                try { sdxECCAMountAutoFields(facet, state); }
                catch (error) { state.fail(error); return; }
                // 분류 폼 자체의 UIController가 사용하는 실제 모델과 기본 검증을 연결합니다.
                // getAttributeFromField()를 전체 속성 열거 API로 사용하지 않습니다.
                session.validateFields = function () {
                    var form = sdxECCAGetRenderedClassForm(session);
                    if (session.type === "sdxECChangeAction") {
                        if (!session.classificationControlReady) {
                            throw new Error("분류 속성 제어 설정이 준비되지 않았습니다.");
                        }
                    }
                    var errors = form.ui.validateModels([form.model]);
                    if (errors && errors.length) {
                        throw new Error(errors.map(function (item) { return item.message; }).join("\n"));
                    }
                };
            }
            state.refreshReady();
            status.textContent = state.error ? state.error.message :
                state.status === "ready" ? "" : !state.attributeControlReady ?
                    "속성 제어 설정을 조회하고 있습니다…" : "지정 클래스 속성을 준비하고 있습니다…";
            host.style.display = state.attributesLoaded ? "" : "none";
        });
        sdxECCAScheduleAttributeControl(facet, session);
        sdxECCAScheduleObjectSearch(facet, session);
    }

    /** 기존 installFields 연결을 사용합니다. OOTB에는 새 수정 지점을 추가하지 않습니다. */
    function sdxECCAScheduleAttributeControl(facet, session) {
        if (session.type !== "sdxECChangeAction" || session.attributeControlStarted) return;
        session.attributeControlStarted = true;
        session.attributeControlReady = false;
        function report(error) {
            if (!session.disposed && !session.transitioning) session.fail(error);
        }
        try {
            require(["DS/sdxECCAAutoClass/sdxECCAAttributeControl"], function (Control) {
                if (session.disposed || session.transitioning || session.status === "error") return;
                Promise.resolve().then(function () {
                    return Control.install(facet, session, {
                        url: sdxECCAReadSettings().controlUrl
                    });
                }).then(function (cleanup) {
                    if (session.disposed || session.transitioning) cleanup();
                    else session.cleanupAttributeControl = cleanup;
                }).catch(report);
            }, report);
        } catch (error) { report(error); }
    }

    /** 검색 모듈은 기존 생성 폼 초기화가 끝난 다음 선택적으로 연결합니다. */
    function sdxECCAScheduleObjectSearch(facet, session) {
        if (session.type !== "sdxECChangeAction") return;
        var settingsValues = sdxECCAReadSettings();
        var enabled = settingsValues.searchEnabled;
        if (enabled === false || enabled === "false") return;
        var config = {
            enabled: enabled,
            allowedTypes: "sdxMTopAssy",
            valueField: settingsValues.searchValueField
        };
        function report(error) {
            if (!session.disposed) console.error("[sdxECCAObjectSearch] 검색 연결 실패. 생성창은 계속 사용 가능합니다.", error);
        }
        session.objectSearchTimer = setTimeout(function () {
            if (session.disposed || session.transitioning) return;
            try {
                require(["DS/sdxECCAAutoClass/sdxECCAObjectSearch"], function (ObjectSearch) {
                    if (session.disposed || session.transitioning) return;
                    try { session.cleanupObjectSearch = ObjectSearch.install(facet, session, config); }
                    catch (error) { report(error); }
                }, report);
            } catch (error) { report(error); }
        }, 0);
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
            binding = facet.sdxECCAAutoBinding = {form: form, parent: form.parentNode, next: form.nextSibling,
                hadScopedClass: form.classList.contains("sdxECCAClassFields")};
        } else if (binding.form !== form) {
            throw new Error("분류 폼이 재초기화되었습니다. 화면을 다시 열어 주세요.");
        }
        form.classList.add("sdxECCAClassFields");
        if (form.parentNode !== facet.sdxECCAAutoHost) facet.sdxECCAAutoHost.appendChild(form);
        if (session.type !== "sdxECChangeAction") sdxECCARenderMandatoryIcons(form);
        session.fieldsMounted = true;
        clearTimeout(facet.sdxECCAAutoResize);
        facet.sdxECCAAutoResize = setTimeout(function () {
            if (!facet.sdxECCAAutoDisposed && !session.disposed && !session.transitioning && ctrl.classifPropertiesView.onInnerResize) {
                ctrl.classifPropertiesView.onInnerResize();
                if (session.type !== "sdxECChangeAction") sdxECCARenderMandatoryIcons(form);
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
        if (session.transitioning) return false;
        // 이전 문맥의 typeInfo 재조회가 늦게 와도 새 세션/속성 모델을 덮어쓰지 않습니다.
        if (attrs.SecurityContext && attrs.SecurityContext.value !== session.context) return false;
        sdxECCAPrepareFixedType(options.data, session);
        if (attrs.SecurityContext) session.checkContext(attrs.SecurityContext.value);
        if (attrs.Type) session.checkType(attrs.Type.value);
        return true;
    }

    /** 폼을 이동 전 위치로 돌려놓습니다. 기존 폼과 모델은 파괴하지 않습니다. */
    function sdxECCADestroyAutoFields(facet) {
        if (facet.sdxECCAAutoDisposed) return;
        facet.sdxECCAAutoDisposed = true;
        var quietBinding = facet.sdxECCAQuietMandatoryBinding;
        if (quietBinding) {
            if (quietBinding.view.checkForMandatoryAttributes === quietBinding.wrapped) {
                quietBinding.view.checkForMandatoryAttributes = quietBinding.original;
            }
            delete facet.sdxECCAQuietMandatoryBinding;
        }
        var submitBinding = facet.sdxECCAPolicySubmitBinding;
        if (submitBinding) {
            if (submitBinding.view.onSubmit === submitBinding.wrapped) submitBinding.view.onSubmit = submitBinding.original;
            delete facet.sdxECCAPolicySubmitBinding;
        }
        clearTimeout(facet.sdxECCAAutoResize);
        if (facet.sdxECCAAutoUnsubscribe) facet.sdxECCAAutoUnsubscribe();
        var binding = facet.sdxECCAAutoBinding;
        if (binding) {
            if (!binding.hadScopedClass) binding.form.classList.remove("sdxECCAClassFields");
            if (binding.next && binding.next.parentNode === binding.parent) binding.parent.insertBefore(binding.form, binding.next);
            else binding.parent.appendChild(binding.form);
        }
        if (facet.sdxECCAAutoRoot && facet.sdxECCAAutoRoot.parentNode) facet.sdxECCAAutoRoot.parentNode.removeChild(facet.sdxECCAAutoRoot);
        if (facet.sdxECCAAutoSession) facet.sdxECCAAutoSession.dispose();
    }

    // C4. OOTB 검증 결과와 생성 버튼 연결

    function sdxECCAFindAutoSession(dialog) {
        var facets = dialog.View && dialog.View.facets || dialog.facets || [];
        for (var i = 0; i < facets.length; i++) {
            if (facets[i].content && facets[i].content.sdxECCAAutoSession) return facets[i].content.sdxECCAAutoSession;
            if (facets[i].options && facets[i].options.sdxECCAAutoSession) return facets[i].options.sdxECCAAutoSession;
        }
        return null;
    }

    /** 클릭/Enter/반복 생성이 지나는 OOTB 공통 생성 입구에서 준비와 입력값을 검증합니다. */
    function sdxECCACanSubmitAutoDialog(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (!session) return true;
        try {
            // 이벤트가 누락되어도 현재 선택으로 재조회하며, 이번 제출은 반드시 중단합니다.
            var currentContext = session.readCurrentContext && session.readCurrentContext();
            if (!session.disposed && currentContext !== session.context) {
                session.changeContext(currentContext);
                throw session.error || new Error("변경한 협업공간의 분류 속성을 다시 준비하고 있습니다.");
            }
            if (session.disposed || session.status !== "ready") {
                throw session.error || new Error("지정 클래스 속성 준비가 완료되지 않았습니다.");
            }
            session.checkContext(session.readCurrentContext && session.readCurrentContext());
            if (session.status === "error") throw session.error;
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

    /** 대화상자 생성이 끝난 뒤 한 번 연결합니다. 탭 아이콘 상태와 버튼 유효성을 분리합니다. */
    function sdxECCABindDialog(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (!session || session.disposed || session.bindingDialog === dialog) return;
        session.bindingDialog = dialog;
        clearTimeout(session.dialogBindTimer);
        // setup/Promise 콜백 스택이 끝난 뒤 연결합니다. 초기화 안에서 버튼 복원으로 재진입하지 않습니다.
        session.dialogBindTimer = setTimeout(function () {
            session.dialogBindTimer = null;
            if (session.disposed || session.bindingDialog !== dialog) return;
            session.dialog = dialog;
            if (typeof dialog.evaluateValidationStatus !== "function") {
                session.fail(new Error("설치된 DialogController의 evaluateValidationStatus 함수를 확인해 주세요."));
                return;
            }
            try {
                if (session.refreshValidation) session.refreshValidation();
                else sdxECCAPreserveValidationState(dialog);
            } catch (error) { session.fail(error); }
        }, 0);
    }

    function sdxECCAPublishButtonValidation(session, currentDialog) {
        var dialog = currentDialog || session.dialog;
        if (!dialog || typeof dialog.evaluateValidationStatus !== "function" ||
            session.updatingButtons || session.disposed) return;
        session.updatingButtons = true;
        try {
            // OOTB 집계는 모든 facetValidation을 확인합니다. 탭 아이콘 변경 함수를 호출하지 않습니다.
            dialog.evaluateValidationStatus();
        } finally { session.updatingButtons = false; }
    }

    /** OOTB resetButtons가 준비/입력 오류 상태를 덮어쓰지 않도록 마지막에 적용합니다.
     * 활성화는 OOTB evaluateValidationStatus에 맡기며 취소 버튼은 건드리지 않습니다.
     */
    function sdxECCAPreserveValidationState(dialog) {
        var session = sdxECCAFindAutoSession(dialog);
        if (!session || session.disposed) return;
        if (session.validationFacet) {
            session.validationFacet.facetValidation = session.status === "ready" && session.fieldsValid === true;
        }
        var facets = dialog.View && dialog.View.facets || dialog.facets || [];
        var invalid = session.status !== "ready" || session.fieldsValid !== true || facets.some(function (entry) {
            return entry.content && entry.content.facetValidation === false;
        });
        if (invalid) {
            sdxECCAPublishButtonValidation(session, dialog);
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
        session.validationFacet = facet;
        var watchedModel = null, pending = null, unsubscribe = null, validating = false;
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
            } else { unwatch(); }
            session.fieldsValid = valid;
            if (valid) session.validationError = null;
            // 값은 집계에 반영하되 탭 아이콘을 오류 상태로 바꾸는 setFacetValidation은 호출하지 않습니다.
            facet.facetValidation = valid;
            sdxECCAPublishButtonValidation(session);
        }
        session.cleanupValidation = function () {
            clearTimeout(pending);
            unwatch();
            if (unsubscribe) unsubscribe();
            session.cleanupValidation = null;
            session.refreshValidation = null;
            session.dialog = null;
            session.validationFacet = null;
        };
        session.refreshValidation = refresh;
        unsubscribe = session.subscribe(refresh);
    }

    /** 비동기 OOTB 컨트롤러가 준비되면 자동 선택을 시작합니다. 다른 위젯은 즉시 반환합니다. */
    // C5. 클래스 자동 선택·분류 속성 로딩

    function sdxECCAConnectAutoClassification(facet, options) {
        var session = options.sdxECCAAutoSession;
        if (!session) return;
        session.classificationFacet = facet;
        session.classificationOptions = options;
        facet.sdxECCAAutoSession = session;
        sdxECCAInstallValidationState(facet, session);
        session.tenant = options.tenant || session.tenant;
        facet.sdxECCAAutoContext = options.securityContext || session.context;
        session.checkContext(facet.sdxECCAAutoContext);
        var started = Date.now(), connected = false;
        facet.sdxECCAAutoTimer = setInterval(function () {
            if (connected || session.disposed || session.transitioning || session.status === "error") { clearInterval(facet.sdxECCAAutoTimer); return; }
            if (session.refreshValidation) session.refreshValidation();
            var isCA = session.type === "sdxECChangeAction";
            var occurrence = !isCA && typeof facet.getOccurrence === "function" ? facet.getOccurrence() : null;
            var ui = facet.initUI && facet.initUI.getController();
            var ctrl = ui && ui.plmNewLibraryActive;
            // CA 검증은 facetValidation과 Dialog 집계로 연결합니다.
            // occurrence의 지연 생성이 라이브러리 초기화를 막지 않게 분리합니다.
            var occurrenceReady = isCA ||
                (occurrence && typeof occurrence.setValidation === "function");
            if (occurrenceReady && ctrl && ctrl.autoComplete && ctrl.classifPropertiesView && ctrl.accordeonCon) {
                connected = true;
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
                    // 클래스 선택 전에 이 생성창의 분류 속성 facet만 상속 컨트롤러로 연결합니다.
                    sdxECCAConfigureClassPropertyFacet(ctrl, session);
                    session.notify();
                    if (session.status === "error" || session.disposed || session.transitioning) return;
                    if (session.ruleMode === "code") {
                        ClassAttributeService.findActiveClassByCode(ctrl.PLMNewCommonWebService, {
                            classCode: session.classCode, securityContext: session.context, tenant: session.tenant,
                            libraryTitle: session.libraryTitle,
                            isCancelled: function () { return session.disposed || session.transitioning || session.status === "error"; }
                        }).then(function (rule) {
                            if (session.disposed || session.transitioning || session.status === "error") return;
                            session.rule = rule;
                            sdxECCAApplyOrganizationClass(ctrl, session);
                        }).catch(function (error) {
                            if (!session.disposed && !session.transitioning && session.status !== "error") session.fail(error);
                        });
                    } else if (session.ruleMode === "department") {
                        // 부서 조회는 현재 대화상자 문맥으로 매번 수행하며 전역 사용자/클래스 캐시를 두지 않습니다.
                        ClassRuleService.resolveDepartment({
                            securityContext: session.context, tenant: options.tenant
                        }, OrganizationProvider).then(function (rule) {
                            if (session.disposed || session.transitioning || session.status === "error") return;
                            session.rule = rule;
                            sdxECCAApplyOrganizationClass(ctrl, session);
                        }).catch(function (error) {
                            if (!session.disposed && !session.transitioning && session.status !== "error") session.fail(error);
                        });
                    } else {
                        sdxECCAApplyOrganizationClass(ctrl, session);
                    }
                } catch (error) { session.fail(error); }
            } else if (Date.now() - started > 30000) {
                clearInterval(facet.sdxECCAAutoTimer);
                var missing = [];
                if (!ctrl) missing.push("controller");
                else ["autoComplete", "classifPropertiesView", "accordeonCon"].forEach(function (key) {
                    if (!ctrl[key]) missing.push(key);
                });
                if (!occurrenceReady) missing.push("occurrence.setValidation");
                console.warn("[sdxECCA] 분류 초기화 준비 미완료", missing);
                session.fail(new Error("분류 입력창 준비 시간이 초과되었습니다. 콘솔의 준비 미완료 항목을 확인해 주세요."));
            }
        }, 100);
    }

    /** 분류 위젯의 전용 skeleton만 변경합니다. 공통 매핑/컨트롤러 prototype은 변경하지 않습니다. */
    function sdxECCAConfigureClassPropertyFacet(controller, session) {
        var view = controller.classifPropertiesView;
        var skeleton = view && view.controller && view.controller.skeleton;
        var facets = skeleton && skeleton._lFacets;
        if (!Array.isArray(facets)) {
            throw new Error("분류 속성 facet 구성을 확인해 주세요.");
        }
        var found = false;
        skeleton._lFacets = facets.map(function (entry) {
            if (!entry.facet || entry.facet.name !== "classificationAttiProp") return entry;
            if (entry.content) throw new Error("분류 속성 폼이 만들어지기 전에 커스텀 모듈을 연결해야 합니다.");
            found = true;
            return Object.assign({}, entry, {
                require: "DS/sdxECCACreate/ClassifPropController",
                options: Object.assign({}, entry.options, {sdxECCAAutoSession: session})
            });
        });
        if (!found) throw new Error("classificationAttiProp facet을 찾을 수 없습니다.");
    }

    /** OOTB getClassPaths 응답으로 클래스 노드를 만들고 원래 select/change 처리를 실행합니다.
     * code 모드가 조회한 ID도 기존 getClassPaths로 경로·유형을 확인합니다.
     * classId는 General Class의 physicalid입니다. General Library ID를 넣으면 거부합니다.
     */
    function sdxECCAApplyOrganizationClass(ctrl, session) {
        if (session.started || session.disposed || session.transitioning || session.status === "error") return;
        session.started = true;
        var service = ctrl.PLMNewCommonWebService;
        session.classId = session.rule.classId;
        service.getClassPaths({
            id: [session.classId],
            plmNewContextProvider: session.context,
            onComplete: function (response) {
                if (session.disposed || session.transitioning || session.status === "error") return;
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
                        if (session.disposed || session.transitioning || session.status === "error") return;
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
                        if (!session.disposed && !session.transitioning && session.status !== "error") session.fail(error);
                    });
                } catch (error) { session.fail(error); }
            },
            onFailure: function () {
                if (!session.disposed && !session.transitioning) session.fail(new Error("지정 클래스 경로 조회에 실패했습니다."));
            }
        });
    }

    function sdxECCADisconnectAutoClassification(facet) {
        clearInterval(facet.sdxECCAAutoTimer);
        if (facet.sdxECCAAutoSession) facet.sdxECCAAutoSession.dispose();
    }

    /** 현재 자동 대상 모델에만 세션을 붙입니다. 전역 이벤트만으로 완료를 판정하지 않습니다. */
    function sdxECCATagAutoClassModel(controller, model, classId) {
        var session = controller.sdxECCAAutoSession;
        if (session && !session.disposed && !session.transitioning && session.status !== "error" && session.classId === classId) {
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
        if (session.disposed || session.transitioning || session.status === "error") return false;
        try {
            if (model.sdxECCAAutoClassId !== session.classId || typeof session.mandatory !== "boolean" ||
                !response || !Array.isArray(response.attribute)) {
                throw new Error("클래스 필수 속성 설정이 준비되지 않았습니다.");
            }
            if (session.type === "sdxECChangeAction") {
                if (!Array.isArray(response.results)) throw new Error("분류 속성 폼 변환 결과가 없습니다.");
                var controlledNames = new Set(response.attribute.map(function (attr) { return attr.name; }));
                // 제어 bus에는 분류 속성의 CCMAttr 접미어가 없습니다. 실제 속성명은 바꾸지 않습니다.
                session.classificationControlNames = new Set(response.attribute.map(function (attr) {
                    return attr.name.replace(/CCMAttr$/, "");
                }));
                response.results = response.results.map(function (row) {
                    if (!Array.isArray(row.data)) return row;
                    return Object.assign({}, row, {data: row.data.map(function (attr) {
                        if (attr.extension !== session.classId || !controlledNames.has(attr.name)) return attr;
                        // OOTB는 여기의 readOnly로 allAttributeAreRO를 계산해 폼 전체를 잠급니다.
                        // 대기 중 숨김은 폼 컨테이너로 처리하고 원래 편집 메타데이터는 보존합니다.
                        return Object.assign({}, attr, {mandatory: false});
                    })});
                });
                session.mandatoryPrepared = true;
                session.classificationControlReady = false;
                return true;
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
        return {model: model, ui: ui, propertiesUI: facet.editPropertiesUI, root: ctrl.accordeonCon};
    }

    /** 자동 대상 클래스 모델에만 완료를 알립니다. 다른 위젯 모델에는 표식이 없어 즉시 반환합니다.
     * 빈 attribute 배열도 정상입니다. 배열 누락을 빈 폼 성공으로 취급하지 않습니다.
     * OOTB 서버 호출 실패로 여기까지 오지 않으면 세션 타임아웃이 생성을 막습니다.
     */
    function sdxECCANotifyAutoClassAttributes(model, response) {
        var session = model && model.sdxECCAAutoSession;
        if (!session || session.disposed || session.transitioning || session.status === "error") return;
        if (!response || !Array.isArray(response.attribute)) {
            session.fail(new Error("클래스 속성 응답의 attribute 배열을 확인해 주세요."));
            return;
        }
        if (!session.mandatoryPrepared) {
            session.fail(new Error("폼 생성 전 prepareAttributes 호출을 확인해 주세요."));
            return;
        }
        try {
            if (session.type === "sdxECChangeAction") {
                var form = sdxECCAGetRenderedClassForm(session);
                if (!form.root || !form.root.style) throw new Error("분류 속성 폼을 확인해 주세요.");
                form.root.style.visibility = "hidden";
                session.classControlForm = form;
                if (session.attachClassificationControl) session.attachClassificationControl(form);
                session.markAttributesLoaded(model.sdxECCAAutoClassId);
                return;
            }
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
        var enabled = sdxECCAReadSettings().enabled;
        return enabled === true || enabled === "true";
    }

    /** 초기 typeInfo 조회부터 고정 타입으로 실행합니다. 다른 위젯의 옵션은 건드리지 않습니다.
     * displayDialog 이후에 Type.value만 바꾸면 다른 타입의 속성 정의로 생성할 수 있어 금지합니다.
     * OOTB 실제 철자는 preferedType입니다. 서버가 지원하고 생성 권한이 있는 타입을 지정해야 합니다.
     */
    function sdxECCAConfigureFixedCreateType(createOptions) {
        if (!sdxECCAIsFixedClassWidget()) return createOptions;
        var type = sdxECCAReadSettings().type || "Change Action";
        createOptions.type = type;
        createOptions.options = createOptions.options || {};
        // 커스텀 CA도 OOTB 생성 서비스의 typeName은 Change Action으로 전달합니다.
        createOptions.options.typeName = type === "sdxECChangeAction" ? "Change Action" : type;
        createOptions.options.preferedType = type;
        return createOptions;
    }

    return {
        attachBridge: sdxECCAAttachAutoBridge,
        prepareFixedType: sdxECCAPrepareFixedType,
        installFields: sdxECCAInstallAutoFields,
        checkMandatoryQuietly: sdxECCACheckMandatoryQuietly,
        destroyFields: sdxECCADestroyAutoFields,
        checkFacetContext: sdxECCACheckAutoFacetContext,
        canSubmitDialog: sdxECCACanSubmitAutoDialog,
        bindDialog: sdxECCABindDialog,
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




// C6. 속성 표시·편집·순서·필수 제어
/** 현재 CA 등록창 인스턴스에만 제어 규칙을 적용합니다. OOTB prototype은 변경하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeControl", ["require"], function (require) {
    "use strict";
    function get(field, key) {
        var value = field && typeof field.get === "function" ? field.get(key) : undefined;
        return value !== undefined ? value : field && field[key];
    }
    // 같은 OOTB 검증기를 사용하되 버튼 판단용 검사에서는 실제 필드의 오류 상태를 바꾸지 않습니다.
    function validateWithoutMessages(ui, model) {
        var snapshot = Object.create(model);
        snapshot.values = function () {
            return model.values().map(function (field) {
                // EditPropModel.values에는 문자열/boolean 등 모델 메타데이터도 포함됩니다.
                // OOTB 검증기는 이름 없는 값을 건너뛰므로 원래 값 그대로 전달합니다.
                if (field === null || typeof field !== "object") return field;
                var copy = Object.create(field);
                copy.resetError = function () {};
                copy.setError = function () {};
                return copy;
            });
        };
        return ui.validateModels([snapshot]);
    }
    function install(facet, session, options) {
        if (!session || session.type !== "sdxECChangeAction" || session.disposed) return Promise.resolve(function () {});
        var classification = options && options.classification === true;
        var view = facet.listview, disposed = false, applying = false, observer = null, rules = null;
        var names = new Set(), ranks = new Map(), restores = [], restoreModel = null;
        function closed() { return disposed || session.disposed || session.transitioning || session.status === "error"; }
        function collect(data) {
            ["publicAttributes", "extensionAttributes"].forEach(function (group) {
                var rows = data && data.attributes && data.attributes[group];
                (Array.isArray(rows) ? rows : []).forEach(function (row) { if (row && row.name) names.add(row.name); });
            });
        }
        collect(view.data);
        function ruleName(name) { return classification && typeof name === "string" ? name.replace(/CCMAttr$/, "") : name; }
        function visible(name) {
            var rule = rules && rules.get(ruleName(name));
            // 규칙 조회가 완료되면 기본 폼을 먼저 표시합니다.
            // 분류 목록이 도착하면 알려진 중복만 숨깁니다. 분류 대기가 기본 폼을 막지 않습니다.
            if (!classification && session.classificationControlNames && session.classificationControlNames.has(name)) return false;
            // 이전 Text 복사/EC Type 저장 규칙은 계속 숨깁니다.
            return !!rule && rule.read && (classification || (name !== "sdxECType" && !/Text$/.test(name)));
        }
        function controlled(field) {
            var name = get(field, "name");
            if (!field || get(field, "defaultAttribute") || typeof field.getIdentifier !== "function" ||
                    typeof name !== "string" || !name ||
                    (classification && get(field, "facet") !== session.classId)) return false;
            // BL이 typeinfo 목록 밖의 모델을 추가해도 허용 목록을 우회하지 못합니다.
            names.add(name);
            return true;
        }
        function apply(field) {
            var name = get(field, "name");
            if (!controlled(field) || typeof field.set !== "function") return;
            var rule = rules && rules.get(ruleName(name)), show = visible(name);
            var flags = {visible: show, readOnly: !show || !rule.edit,
                mandatory: show && rule.mandatoryCheck, positionUI: "2-1-" + (ranks.get(ruleName(name)) || 1000000),
                // 분류의 class ID와 기존 section/form/group은 유지합니다.
                // 기본 폼은 OOTB 기본 영역/ExtensionsFacet(펼치기) 구획을 사용합니다.
                facet: classification ? get(field, "facet") :
                    show && (rule.mandatory || rule.mandatoryCheck) ? "" : "ExtensionsFacet"};
            Object.keys(flags).forEach(function (key) {
                if (get(field, key) !== flags[key]) field.set(key, flags[key]);
            });
        }
        function all() {
            var model = view.propModel;
            return model && model.getAllAttributes ? model.getAllAttributes() : {};
        }
        function syncClassificationNames() {
            if (!classification || closed()) return;
            var current = new Set(), fields = all();
            Object.keys(fields).forEach(function (id) {
                var field = fields[id];
                if (controlled(field)) current.add(ruleName(get(field, "name")));
            });
            var previous = session.classificationControlNames;
            var changed = !previous || current.size !== previous.size ||
                Array.from(current).some(function (name) { return !previous.has(name); });
            if (changed) {
                session.classificationControlNames = current;
                if (session.refreshBaseAttributeControl) session.refreshBaseAttributeControl();
            }
        }
        function refreshBase() {
            if (!closed()) { enforce(); view.refresh(); }
        }
        function enforce() {
            if (closed() || applying) return;
            applying = true;
            try { syncClassificationNames(); var fields = all(); Object.keys(fields).forEach(function (key) { apply(fields[key]); }); }
            finally { applying = false; }
        }
        function decorate() {
            if (closed()) return;
            var ui = view.propUI, section = ui && ui.getFormSection && ui.getFormSection();
            var organizers = section && section.getOrganizers && section.getOrganizers();
            var fields = all();
            Object.keys(organizers || {}).forEach(function (key) {
                (organizers[key]._forms || []).forEach(function (form) {
                    (form.fields || []).forEach(function (line) {
                        var field = fields[line._idAttr], name = get(field, "name");
                        if (!controlled(field)) return;
                        var flex = line.elements && line.elements.flexLine;
                        if (classification && flex) {
                            var content = typeof line.getContent === "function" ? line.getContent() : flex;
                            var display = visible(name) ? "" : "none";
                            if (content.style.display !== display) content.style.display = display;
                        }
                        var label = flex && flex.querySelector(".formLabel");
                        if (!label) return;
                        if (!label.classList.contains("sdxECCAControlledLabel")) label.classList.add("sdxECCAControlledLabel");
                        var icon = label.querySelector(".sdxECCAControlMandatory");
                        var rule = rules && rules.get(ruleName(name)), show = visible(name) && rule.mandatory;
                        if (show && !icon) {
                            icon = document.createElement("span");
                            icon.className = "mandIcon wux-ui3ds wux-ui-3ds-new-create sdxECCAControlMandatory";
                            icon.setAttribute("aria-hidden", "true");
                            // OOTB 제목 텍스트와 같은 인라인 컨테이너에 둡니다.
                            var title = label.querySelector(".textContainer") || label.querySelector(".attrLabel") || label;
                            title.appendChild(icon);
                        } else if (!show && icon) icon.parentNode.removeChild(icon);
                    });
                });
            });
        }
        function wrap(object, key, handler) {
            var original = object[key];
            if (typeof original !== "function") throw new Error("OOTB " + key + " 연결을 확인해 주세요.");
            var wrapped = handler(original);
            object[key] = wrapped;
            restores.push(function () { if (object[key] === wrapped) object[key] = original; });
        }
        function bindModel() {
            if (restoreModel) restoreModel();
            var model = view.propModel, original = model && model.set;
            if (typeof original !== "function") throw new Error("OOTB 속성 모델 set을 확인해 주세요.");
            // BL/검색이 새 AttributeModel을 넣을 때도 규칙을 먼저 적용합니다.
            var wrapped = function (key, value) {
                if (!closed()) {
                    var values = arguments.length > 1 ? [value] :
                        Array.isArray(key) ? key : key && typeof key.getIdentifier === "function" ? [key] : Object.values(key || {});
                    values.forEach(apply);
                }
                var result = original.apply(this, arguments);
                syncClassificationNames();
                return result;
            };
            model.set = wrapped;
            restoreModel = function () { if (model.set === wrapped) model.set = original; };
        }
        function cleanup() {
            disposed = true;
            if (observer) observer.disconnect();
            if (restoreModel) restoreModel();
            restores.reverse().forEach(function (restore) { restore(); });
            if (style.parentNode) style.parentNode.removeChild(style);
            if (!classification) {
                if (session.cleanupClassificationControl) session.cleanupClassificationControl();
                session.attachClassificationControl = null;
                if (session.refreshBaseAttributeControl === refreshBase) session.refreshBaseAttributeControl = null;
            }
        }
        var style = document.createElement("style");
        style.textContent = ".sdxECCAControlledLabel .mandIcon,.sdxECCAControlledLabel .attrMand{display:none!important}" +
            ".sdxECCAControlledLabel .sdxECCAControlMandatory{display:inline!important;margin-left:3px;vertical-align:middle;font-size:7px;font-family:DSFontIcon;color:rgb(234,79,55)!important}";
        facet.skeleton.appendChild(style);
        if (classification) {
            session.cleanupClassificationControl = cleanup;
        } else {
            session.cleanupAttributeControl = cleanup;
            session.refreshBaseAttributeControl = refreshBase;
        }
        try {
            bindModel();
            if (classification) {
                wrap(options.propertiesUI, "updateTableManager", function (original) { return function () {
                    enforce();
                    var result = original.apply(this, arguments);
                    decorate(); return result;
                }; });
            } else {
                wrap(view, "dispatchEvent", function (original) { return function (event, args) {
                    if (!closed() && rules && event === "onValidActivation" && args && args[0] === true) {
                        var errors = validateWithoutMessages(this.propUI.elements.UIController, this.propModel);
                        var forwarded = Array.prototype.slice.call(arguments);
                        forwarded[1] = [!errors || !errors.length];
                        return original.apply(this, forwarded);
                    }
                    return original.apply(this, arguments);
                }; });
                wrap(view, "buildModel", function (original) { return function (data) {
                    collect(data);
                    var result = original.apply(this, arguments);
                    bindModel(); enforce(); return result;
                }; });
                ["refresh", "loadView"].forEach(function (key) {
                    wrap(view, key, function (original) { return function () {
                        enforce();
                        var result = original.apply(this, arguments);
                        decorate();
                        // 초기 전체 검증은 오류 문구를 만들지 않고 버튼 상태에만 반영합니다.
                        if (typeof this.updateValidStatus === "function") this.updateValidStatus();
                        return result;
                    }; });
                });
                wrap(view, "addAttributeOnUI", function (original) { return function (id, show) {
                    var field = view.propModel.get(id), name = get(field, "name");
                    // BL이 재표시를 요청해도 제어 설정의 숨김을 유지합니다.
                    if (controlled(field)) show = visible(name);
                    return original.call(this, id, show);
                }; });
            }
            if (typeof MutationObserver !== "undefined") {
                observer = new MutationObserver(decorate);
                observer.observe(facet.skeleton, {childList: true, subtree: true});
            }
        } catch (error) { cleanup(); return Promise.reject(error); }
        // 조회 완료 전에는 prepareFixedType에서 모든 제어 대상 모델을 숨겨 두었습니다.
        var query = classification ? Promise.resolve(options.rules) : new Promise(function (resolve, reject) {
            require(["DS/sdxECCAAutoClass/sdxECCAAttributeControlService"], resolve, reject);
        }).then(function (Service) {
            if (closed()) return null;
            return Service.read({securityContext: session.context, tenant: session.tenant,
                url: options && options.url, state: session.attributeControlState, isCancelled: closed});
        });
        return query.then(function (result) {
            if (closed() || !result) { cleanup(); return function () {}; }
            rules = result;
            Array.from(rules.values()).sort(function (a, b) {
                return a.order - b.order || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
            }).forEach(function (rule, index) { ranks.set(rule.name, index + 1); });
            enforce();
            view.refresh();
            if (classification) {
                session.classificationControlReady = true;
                facet.skeleton.style.visibility = "";
            } else {
                session.attributeControlRules = rules;
                session.attributeControlReady = true;
                session.attachClassificationControl = function (form) {
                    if (closed()) return;
                    if (session.cleanupClassificationControl) session.cleanupClassificationControl();
                    session.classificationControlReady = false;
                    installClassification(form, session, rules).catch(function (error) {
                        if (!closed()) session.fail(error);
                    });
                };
                if (session.classControlForm) session.attachClassificationControl(session.classControlForm);
            }
            session.refreshReady(); session.notify();
            return cleanup;
        }).catch(function (error) { cleanup(); throw error; });
    }
    /** 분류 폼도 같은 규칙·검증·라벨 처리를 사용하고 원래 모델/저장 경로는 유지합니다. */
    function installClassification(form, session, rules) {
        var ui = form.propertiesUI;
        if (!ui || !ui.elements || !ui.elements.formSection || typeof ui.updateTableManager !== "function" || typeof ui.initData !== "function") {
            return Promise.reject(new Error("분류 속성 UI의 initData/updateTableManager 연결을 확인해 주세요."));
        }
        // Properties 생성에 이미 사용된 OOTB 상수입니다. 기본 폼 로딩에는 추가 의존성을 만들지 않습니다.
        var ClassifConstants;
        try { ClassifConstants = require("DS/ClassificationProp/constants/ClassifPropConstants"); }
        catch (error) { return Promise.reject(error); }
        var view = {propModel: form.model, data: {},
            propUI: {getFormSection: function () { return ui.elements.formSection; }},
            // updateTableManager만 호출하면 기존 조회 모드가 유지되어 입력창이 생기지 않습니다.
            refresh: function () { return ui.initData([form.model], {edition: ClassifConstants.FORCE_READWRITE}); }};
        return install({listview: view, skeleton: form.root}, session,
            {classification: true, rules: rules, propertiesUI: ui});
    }
    return {install: install, validateWithoutMessages: validateWithoutMessages};
});

// C7. 모델 검색 UI와 선택 결과 반영
/** sdxECModel: OOTB 자동완성/6W 선택 결과만 저장하고 검색어는 저장하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAObjectSearch", ["require"], function (require) {
    "use strict";
    var MODEL_TYPE = "sdxMTopAssy";
    function install(facet, session, config) {
        if (session.type !== "sdxECChangeAction" || config.enabled === false || config.enabled === "false") return function () {};
        var disposed = false, search = null, loading = false, observer = null, mounted = null, toolkit = null;
        var inputRevision = 0, requestNumber = 0, chooserNumber = 0, detailNumber = 0, candidates = new Map(), synchronizing = false;
        var valueField = config.valueField || "name";
        function closed() { return disposed || session.disposed || session.transitioning || session.status === "error"; }
        function read(field, key) {
            var value = field && typeof field.get === "function" ? field.get(key) : undefined;
            return value != null ? value : field && field[key];
        }
        function fieldModel() {
            var model = facet.listview && facet.listview.propModel;
            var fields = model && typeof model.getAttributeFromField === "function" && model.getAttributeFromField("name", "sdxECModel");
            return fields && fields[0];
        }
        function message(text) { if (mounted) mounted.error.textContent = text; }
        function write(value) {
            var current = fieldModel();
            if (!toolkit || !current || read(current, "readOnly") || read(current, "visible") === false) return;
            if (read(current, "valueDB") === value && read(current, "value") === value) return;
            var updated = new toolkit.AttributeModel(current);
            updated.set("value", value); updated.set("valueDB", value);
            updated.set("isModified", true); updated.set("isUIModified", true);
            facet.listview.propModel.set(current.getIdentifier(), updated);
        }
        function forget() {
            detailNumber++; session.modelSearchLoading = false;
            session.modelSearchSelection = null; write("");
        }
        function syncNode(record) {
            if (!mounted || !mounted.auto) return;
            synchronizing = true;
            try {
                var node;
                if (record) {
                    node = new toolkit.Node({label: record.title || record.name, value: record.id,
                        name: record.name, searchText: (record.title || "") + " " + record.name, grid: {name: record.name}});
                    candidates.set(node, {record: record, revision: inputRevision});
                }
                mounted.auto.selectedItems = node;
            } finally { synchronizing = false; }
        }
        function accept(record) {
            if (closed()) return;
            var current = fieldModel(), value = record && record[valueField];
            if (!current || read(current, "readOnly") || read(current, "visible") === false) return;
            if (!record || record.type !== MODEL_TYPE || typeof value !== "string" || !value) {
                message("검색 결과에 저장할 " + valueField + " 값이 없습니다."); return;
            }
            requestNumber++; chooserNumber++;
            forget();
            var number = detailNumber, revision = inputRevision, context = session.context;
            function stale() { return closed() || number !== detailNumber || revision !== inputRevision || context !== session.context; }
            session.modelSearchLoading = true;
            syncNode(record); message("모델 속성을 조회하고 있습니다.");
            Promise.resolve().then(function () {
                if (stale()) return null;
                return toolkit.Service.readAttributes({id: record.id, tenant: session.tenant,
                    securityContext: context, isCancelled: stale});
            }).then(function (details) {
                if (stale() || !details) return;
                current = fieldModel();
                if (!current || read(current, "readOnly") || read(current, "visible") === false) {
                    forget(); return;
                }
                record = Object.assign({}, record, {name: details.name, attributes: details.attributes});
                value = record[valueField];
                if (typeof value !== "string" || !value) throw new Error("모델의 저장값을 확인해 주세요.");
                // 필드별 자동 채움은 여기서 record.attributes["속성명"]을 사용합니다.
                session.modelSearchSelection = {id: record.id, type: MODEL_TYPE, value: value, context: context, record: record};
                session.modelSearchLoading = false;
                write(value); syncNode(record); message("");
            }).catch(function (error) {
                if (stale()) return;
                forget(); syncNode(null); message(error.message || "모델 속성을 조회하지 못했습니다.");
            });
        }
        function onSelection() {
            if (closed() || synchronizing || !mounted || !mounted.auto) return;
            var node = mounted.auto.selectedItems;
            if (Array.isArray(node)) node = node.length === 1 ? node[0] : null;
            if (!node) { inputRevision++; requestNumber++; chooserNumber++; candidates.clear(); forget(); return; }
            var proof = candidates.get(node);
            if (!proof || proof.revision !== inputRevision) { forget(); syncNode(null); return; }
            accept(proof.record);
        }
        // Capture runs before the native LineEditor input listener. Clearing selection can reset
        // its DOM value, so restore the user's query before the OOTB listener consumes the event.
        function onInput(event) {
            if (closed() || synchronizing || !event.target || typeof event.target.value !== "string") return;
            var query = event.target.value;
            inputRevision++; requestNumber++; chooserNumber++; candidates.clear();
            forget(); syncNode(null);
            event.target.value = query;
            message("");
        }
        function stopEnter(event) { if (event.keyCode === 13 || event.key === "Enter") event.stopPropagation(); }
        function query(text) {
            var tree = new toolkit.Tree(), revision = inputRevision, number = ++requestNumber;
            if (closed() || typeof text !== "string" || text.trim().length < 3) return Promise.resolve(tree);
            return toolkit.Service.search({query: text, tenant: session.tenant, securityContext: session.context,
                isCancelled: function () { return closed() || revision !== inputRevision || number !== requestNumber; }
            }).then(function (records) {
                if (closed() || revision !== inputRevision || number !== requestNumber) return tree;
                records.forEach(function (record) {
                    var node = new toolkit.Node({label: record.title || record.name, value: record.id,
                        name: record.name, searchText: (record.title || "") + " " + record.name, grid: {name: record.name}});
                    candidates.set(node, {record: record, revision: revision}); tree.addRoot(node);
                });
                message(""); return tree;
            }).catch(function (error) {
                if (!closed() && revision === inputRevision && number === requestNumber) message(error.message || "모델 검색에 실패했습니다.");
                return tree;
            });
        }
        function chooserResult(objects, revision, number) {
            if (closed() || revision !== inputRevision || number !== chooserNumber || !objects || !objects.length) return;
            if (objects.length !== 1) { message("객체를 하나만 선택해 주세요."); return; }
            var record = toolkit.Service.normalize(objects[0]);
            if (!record) { message("검색 결과의 객체 ID·이름·타입을 확인해 주세요."); return; }
            accept(record);
        }
        function launch() {
            if (closed() || loading || !toolkit) return;
            message("");
            var revision = inputRevision, number = ++chooserNumber;
            function open() {
                if (closed() || revision !== inputRevision || number !== chooserNumber) return;
                try {
                    search.launchSearch({title: "모델 선택", allowedTypes: MODEL_TYPE,
                        criteria: "", multiSel: false, defaultMode: false, default_with_precond: true,
                        in_apps_callback: function (objects) { chooserResult(objects, revision, number); }});
                } catch (error) { message("객체 검색을 열지 못했습니다: " + error.message); }
            }
            if (search) { open(); return; }
            loading = true;
            require(["DS/ENOXSearchUIController/ENOXSearchUIController"], function () {
                if (closed()) { loading = false; return; }
                require(["DS/ENOXSearchUIController/ObjectOpenSearchUtil"], function (SearchUtil) {
                    loading = false;
                    if (closed()) return;
                    try { search = Object.create(SearchUtil); search.initialize(); open(); }
                    catch (error) { message("객체 검색 초기화에 실패했습니다: " + error.message); }
                }, function () { loading = false; message("객체 검색 모듈을 불러오지 못했습니다."); });
            }, function () { loading = false; message("객체 검색 번들을 불러오지 못했습니다."); });
        }
        function unmount() {
            if (!mounted) return;
            inputRevision++; requestNumber++; chooserNumber++; detailNumber++; session.modelSearchLoading = false; candidates.clear();
            mounted.button.removeEventListener("click", launch);
            if (mounted.auto) {
                var content = mounted.auto.getContent();
                content.removeEventListener("input", onInput, true);
                content.removeEventListener("keydown", stopEnter);
                content.removeEventListener("keyup", stopEnter);
                mounted.auto.removeEventListener("change", onSelection);
                mounted.auto.destroy();
            }
            mounted.originals.forEach(function (entry) { entry.node.style.display = entry.display; });
            mounted.inputs.forEach(function (entry) { entry.node.readOnly = entry.readOnly; });
            [mounted.host, mounted.button, mounted.error].forEach(function (node) { if (node.parentNode) node.parentNode.removeChild(node); });
            mounted.target.classList.remove("sdxECCAObjectSearchValue"); mounted = null;
        }
        function targetElement(current) {
            var result = null, ui = facet.listview && facet.listview.propUI;
            var section = ui && ui.getFormSection && ui.getFormSection();
            var organizers = section && typeof section.getOrganizers === "function" && section.getOrganizers();
            Object.keys(organizers || {}).forEach(function (key) {
                (organizers[key]._forms || []).forEach(function (form) {
                    (form.fields || []).forEach(function (line) {
                        if (line._idAttr === current.getIdentifier()) {
                            var flex = line.elements && line.elements.flexLine;
                            result = flex && flex.querySelector(".formValue");
                        }
                    });
                });
            });
            return result;
        }
        function mount() {
            if (closed()) return;
            var current = fieldModel();
            var target = current && !read(current, "readOnly") && read(current, "visible") !== false ? targetElement(current) : null;
            if (mounted && (mounted.target !== target || mounted.host.parentNode !== target)) unmount();
            if (!target) return;
            if (!mounted) {
                var host = document.createElement("div"), button = document.createElement("button"), error = document.createElement("span");
                host.className = "sdxECCAObjectSearchAutoComplete"; host.style.flex = "1"; host.style.minWidth = "0";
                button.type = "button"; button.className = "sdxECCAObjectSearchButton"; button.title = "모델 검색";
                button.setAttribute("aria-label", "모델 검색"); button.disabled = true;
                var icon = document.createElement("span"); icon.className = "fonticon fonticon-search"; icon.setAttribute("aria-hidden", "true"); button.appendChild(icon);
                error.className = "sdxECCAObjectSearchError"; error.setAttribute("role", "alert");
                var originals = Array.from(target.children).map(function (node) { return {node: node, display: node.style.display}; });
                var inputs = Array.from(target.querySelectorAll("input, textarea")).map(function (node) { var entry = {node: node, readOnly: node.readOnly}; node.readOnly = true; return entry; });
                mounted = {target: target, host: host, button: button, error: error, originals: originals, inputs: inputs, auto: null};
                target.classList.add("sdxECCAObjectSearchValue"); button.addEventListener("click", launch);
                target.appendChild(host); target.appendChild(button); target.appendChild(error);
            }
            // OOTB가 같은 formValue 아래 tweaker를 다시 그려도 원래 편집기는 노출하지 않습니다.
            Array.from(target.children).forEach(function (node) {
                if (node === mounted.host || node === mounted.button || node === mounted.error) return;
                if (!mounted.originals.some(function (entry) { return entry.node === node; })) {
                    mounted.originals.push({node: node, display: node.style.display});
                }
                if (mounted.auto) node.style.display = "none";
            });
            if (!toolkit || mounted.auto) return;
            var auto = new toolkit.AutoComplete({multiSearchMode: false, allowFreeInputFlag: false,
                allowResetToUndefinedByUIFlag: true, keepSearchResultsFlag: false,
                minLengthBeforeSearch: 3, typeDelayBeforeSearch: 300,
                placeholder: "모델 검색", elementsTree: query,
                defaultFilterOptions: {property: "searchText", type: "contains"}});
            mounted.auto = auto; auto.inject(mounted.host);
            auto.addEventListener("change", onSelection);
            auto.getContent().addEventListener("input", onInput, true);
            auto.getContent().addEventListener("keydown", stopEnter);
            auto.getContent().addEventListener("keyup", stopEnter);
            mounted.originals.forEach(function (entry) { entry.node.style.display = "none"; });
            mounted.button.disabled = false;
            var chosen = session.modelSearchSelection;
            if (chosen && chosen.context === session.context) { write(chosen.value); syncNode(chosen.record); }
            else forget();
        }
        function report(error) {
            if (closed()) return;
            message("모델 검색을 불러오지 못했습니다. 선택하지 않으면 빈 값으로 저장됩니다.");
            console.error("[sdxECCAObjectSearch] 검색 연결 실패", error);
        }
        if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(function () { try { mount(); } catch (error) { observer.disconnect(); report(error); } });
            observer.observe(facet.skeleton, {childList: true, subtree: true});
        }
        try {
            mount();
            require(["DS/WUXAutoComplete/AutoComplete", "DS/TreeModel/TreeDocument", "DS/TreeModel/TreeNodeModel",
                "DS/EditPropWidget/models/EditPropAttributeModel", "DS/sdxECCAAutoClass/sdxECCAModelSearchService"],
                function (AutoComplete, Tree, Node, AttributeModel, Service) {
                    if (closed()) return;
                    toolkit = {AutoComplete: AutoComplete, Tree: Tree, Node: Node, AttributeModel: AttributeModel, Service: Service};
                    try { mount(); } catch (error) { report(error); }
                }, report);
        } catch (error) { report(error); }
        return function () {
            disposed = true;
            if (observer) observer.disconnect();
            unmount();
            if (search && search.socket) search.destroy();
            search = null; session.modelSearchSelection = null; session.modelSearchLoading = false;
        };
    }
    return {install: install};
});
