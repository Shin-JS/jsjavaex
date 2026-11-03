/**
 * CA 서버 조회·클래스 규칙 — 전체 배포합니다. DOM/폼 변경은 하지 않습니다.
 * S1 클래스 결정 / S2 부서 조회 연결 / S3 클래스 속성 조회
 * S4 등록창 속성 제어 조회 / S5 모델 검색·ID 기반 속성 조회
 * 기존 named AMD 이름은 유지하고 이 파일에서 함께 등록합니다.
 * WAFData/검색 의존성은 해당 기능을 실행할 때 기존 방식으로 로드합니다.
 */

// S1. sdxECCAClassRuleService
/** 클래스 결정 전용 서비스. UI/OOTB 컨트롤러를 변경하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAClassRuleService", [], function () {
    "use strict";

    function required(value, message) {
        if (typeof value !== "string" || !value.trim()) throw new Error(message);
        return value.trim();
    }

    function resolveFixed(rule) {
        return {
            classId: required(rule.classId, "sdxECCAFixedClassId에 클래스 physicalid를 지정해 주세요."),
            libraryId: rule.libraryId == null || rule.libraryId === "" ? null :
                required(rule.libraryId, "라이브러리 physicalid를 확인해 주세요.")
        };
    }

    /**
     * Provider가 실제 서버 응답을 아래 계약으로 변환합니다.
     * 사용자: {departmentCode: "부서 코드"}
     * 클래스 후보: [{departmentCode: "부서 코드", classId: "General Class physicalid", libraryId: null}]
     * 표시명/문맥 문자열의 Organization을 사용자 부서로 간주하지 않습니다.
     * General Type의 실제 속성명/API는 확정되지 않았으므로 여기에 추정 URL을 넣지 않습니다.
     */
    function resolveDepartment(request, provider) {
        return Promise.resolve().then(function () {
            if (!provider || typeof provider.loadCurrentUser !== "function" ||
                typeof provider.findDepartmentClasses !== "function") {
                throw new Error("부서 조회 Provider를 연결해 주세요.");
            }
            var securityContext = required(request.securityContext, "부서 조회 권한 문맥을 확인해 주세요.");
            // 원래 options 객체나 위젯 인스턴스 전체를 서버 조회 계층에 전달하지 않습니다.
            var scope = {securityContext: securityContext, tenant: request.tenant};
            return Promise.resolve(provider.loadCurrentUser(scope)).then(function (user) {
                var departmentCode = required(user && user.departmentCode, "로그인 사용자의 부서 코드가 없습니다.");
                return Promise.resolve(provider.findDepartmentClasses({
                    securityContext: scope.securityContext,
                    tenant: scope.tenant,
                    departmentCode: departmentCode
                })).then(function (candidates) {
                    if (!Array.isArray(candidates)) throw new Error("부서별 클래스 조회 응답은 배열이어야 합니다.");
                    // 조회 구현에서 누락된 부서 필터 때문에 다른 부서가 자동 선택되는 것을 막습니다.
                    var matches = candidates.filter(function (item) {
                        return item && typeof item.departmentCode === "string" &&
                            item.departmentCode.trim() === departmentCode;
                    });
                    if (!matches.length) throw new Error("사용자 부서에 해당하는 클래스가 없습니다.");
                    if (matches.length !== 1) throw new Error("사용자 부서에 해당하는 클래스가 여러 개입니다. 매핑을 확인해 주세요.");
                    var rule = resolveFixed(matches[0]);
                    rule.departmentCode = departmentCode;
                    return rule;
                });
            });
        });
    }

    return {resolveFixed: resolveFixed, resolveDepartment: resolveDepartment};
});

// S2. sdxECCAOrganizationProvider
/**
 * 실제 환경의 사용자/General Type 조회를 연결할 파일입니다.
 * 기본 fixed 모드에서는 이 함수들이 호출되지 않습니다.
 * 타입/속성/API가 확정되면 아래 두 함수 본문만 실제 서비스 호출로 교체합니다.
 * 서버는 로그인 세션으로 사용자를 식별하고 해당 권한 문맥에서 조회해야 합니다.
 * 호출자가 넘긴 임의 사용자명으로 부서를 결정하지 않습니다.
 */
define("DS/sdxECCAAutoClass/sdxECCAOrganizationProvider", [], function () {
    "use strict";

    function loadCurrentUser(scope) {
        // scope = {securityContext, tenant}
        // TODO: 실제 로그인 사용자 조회 응답을 {departmentCode: "..."}로 변환하여 반환합니다.
        // 동기 반환 또는 Promise 반환을 모두 지원합니다. 샘플 부서를 실제 사용자처럼 반환하지 않습니다.
        throw new Error("사용자 부서 조회가 아직 연결되지 않았습니다. OrganizationProvider.loadCurrentUser를 구현해 주세요.");
    }

    function findDepartmentClasses(request) {
        // request = {securityContext, tenant, departmentCode}
        // TODO: 분류에 추가할 General Type의 부서 속성으로 조회한 결과를 다음 배열로 변환합니다.
        // [{departmentCode: "...", classId: "General Class physicalid", libraryId: "General Library physicalid 또는 null"}]
        // General Type 객체 ID 자체가 아닌, 실제 자동 선택할 General Class ID를 classId로 반환합니다.
        // 결과는 전체 페이지를 확인해 중복을 판단할 수 있어야 합니다. 임의로 첫 결과만 반환하지 않습니다.
        throw new Error("General Type 기반 클래스 조회가 아직 연결되지 않았습니다. OrganizationProvider.findDepartmentClasses를 구현해 주세요.");
    }

    return {loadCurrentUser: loadCurrentUser, findDepartmentClasses: findDepartmentClasses};
});

// S3. sdxECCAClassAttributeService
/** 클래스 객체 자체의 제어 속성을 조회합니다. 입력할 Class Attributes의 기본값과 구별합니다. */
define("DS/sdxECCAAutoClass/sdxECCAClassAttributeService", ["require"], function (require) {
    "use strict";
    var FLAG = "sdxClassAttrMandatory";

    function readMandatory(response, classId) {
        if (!response || response.success === false || response.error || !Array.isArray(response.results)) {
            throw new Error("클래스 필수 속성 설정 조회에 실패했습니다.");
        }
        var rows = response.results.filter(function (row) { return row.physicalID === classId; });
        if (rows.length !== 1 || !Array.isArray(rows[0].data)) {
            throw new Error("클래스 필수 속성 설정 응답의 객체 ID를 확인해 주세요.");
        }
        var attrs = rows[0].data.filter(function (attr) {
            return attr.name === FLAG || attr.selectable === "attribute[" + FLAG + "]";
        });
        if (attrs.length !== 1) throw new Error("클래스의 sdxClassAttrMandatory 속성을 조회할 수 없습니다.");
        var value = attrs[0].valueDB !== undefined ? attrs[0].valueDB : attrs[0].value;
        if (Array.isArray(value)) {
            if (value.length > 1) throw new Error("sdxClassAttrMandatory는 단일 값이어야 합니다.");
            value = value.length ? value[0] : "";
        }
        if (typeof value !== "string") throw new Error("sdxClassAttrMandatory 값을 확인해 주세요.");
        return value.trim() === "Y";
    }

    function load(service, scope) {
        return Promise.resolve().then(function () {
            if (!service || typeof service.get3DSpaceUrl !== "function") throw new Error("3DSpace 주소 조회 서비스를 확인해 주세요.");
            return service.get3DSpaceUrl();
        }).then(function (url) {
            return new Promise(function (resolve, reject) {
                require(["DS/WAFData/WAFData"], function (WAFData) {
                    try {
                        // R2024x 3DSpaceAjaxRequests.getListOfAttributes의 bus 조회 계약입니다.
                        WAFData.authenticatedRequest(url.replace(/\/$/, "") +
                            "/resources/v1/collabServices/attributes/op/read?tenant=" + encodeURIComponent(scope.tenant), {
                            method: "POST", type: "json", timeout: 60000, proxy: "passport", authentication: "passport",
                            headers: {Accept: "application/json", "Content-Type": "application/json",
                                SecurityContext: encodeURIComponent(scope.securityContext)},
                            data: JSON.stringify({lIds: [], relIDs: [], busIDs: [scope.classId],
                                plmparameters: "false", attributes: "true", navigateToMain: "false", readonly: "true", debug_properties: ""}),
                            onComplete: function (response) {
                                try { resolve(readMandatory(response, scope.classId)); } catch (error) { reject(error); }
                            },
                            onFailure: function () { reject(new Error("클래스의 sdxClassAttrMandatory 조회에 실패했습니다.")); },
                            onTimeout: function () { reject(new Error("클래스 필수 속성 설정 조회 시간이 초과되었습니다.")); }
                        });
                    } catch (error) { reject(error); }
                }, function () { reject(new Error("WAFData 모듈을 로드할 수 없습니다.")); });
            });
        });
    }
    /** OOTB authoring API의 MQL where 조건과 Subclass 경로로 코드·상태를 확인합니다. */
    function findActiveClassByCode(service, scope) {
        return Promise.resolve().then(async function () {
            if (!scope || typeof scope.classCode !== "string" || !/^[A-Za-z0-9_]+$/.test(scope.classCode)) {
                throw new Error("조회할 sdxClassCode를 확인해 주세요.");
            }
            var libraryTitle = scope.libraryTitle === undefined ? "EC Library" : scope.libraryTitle;
            // MQL where의 문자열 리터럴에 들어가는 제목입니다. 따옴표·역슬래시·제어문자는 허용하지 않습니다.
            if (typeof libraryTitle !== "string" || !libraryTitle.trim() || /["'\\\x00-\x1f\x7f]/.test(libraryTitle)) {
                throw new Error("조회할 라이브러리 제목을 확인해 주세요.");
            }
            if (!scope.securityContext) throw new Error("클래스 조회 권한 문맥이 없습니다.");
            if (!service || typeof service.get3DSpaceUrl !== "function") throw new Error("3DSpace 조회 서비스를 확인해 주세요.");
            var url = (await service.get3DSpaceUrl()).replace(/\/$/, "");
            var tenant = scope.tenant || "OnPremise";
            var WAFData = await new Promise(function (resolve, reject) {
                require(["DS/WAFData/WAFData"], resolve, function () { reject(new Error("WAFData 모듈을 로드할 수 없습니다.")); });
            });
            function checkOpen() {
                if (scope.isCancelled && scope.isCancelled()) throw new Error("클래스 조회가 취소되었습니다.");
            }
            function post(path, payload) {
                checkOpen();
                return new Promise(function (resolve, reject) {
                    WAFData.authenticatedRequest(url + path + "?tenant=" + encodeURIComponent(tenant), {
                        method: "POST", type: "json", timeout: 60000, proxy: "passport", authentication: "passport",
                        headers: {Accept: "application/json", "Content-Type": "application/json", SecurityContext: encodeURIComponent(scope.securityContext)},
                        data: JSON.stringify(payload),
                        onComplete: function (response) {
                            try {
                                checkOpen();
                                if (typeof response === "string") response = JSON.parse(response);
                                if (!response || response.success === false || response.error ||
                                    (!Array.isArray(response.results) && !(response.infos && response.infos.nresults === 0))) {
                                    throw new Error("분류 조회 API의 results 응답을 확인해 주세요.");
                                }
                                if (!response.results) response.results = [];
                                resolve(response);
                            } catch (error) { reject(error); }
                        },
                        onFailure: function (error) {
                            var code = error && error.error && error.error.code;
                            reject(new Error("분류 조회 API " + path + " 호출에 실패했습니다." + (code ? " " + code : "")));
                        },
                        onTimeout: function () { reject(new Error("활성 클래스 조회 시간이 초과되었습니다.")); }
                    });
                });
            }
            function value(row, names) {
                if (!row || !Array.isArray(row.attributes)) throw new Error("분류 조회의 attributes 응답을 확인해 주세요.");
                var attrs = row.attributes.filter(function (item) { return item && names.indexOf(item.name) >= 0; });
                if (!attrs.length) return null;
                var values = attrs.map(function (item) {
                    var result = item.value;
                    if (Array.isArray(result) && result.length <= 1) result = result.length ? result[0] : "";
                    if (typeof result !== "string") throw new Error("분류 속성의 단일 문자열 값을 확인해 주세요.");
                    return result;
                });
                if (values.some(function (item) { return item !== values[0]; })) throw new Error("분류 속성의 응답값이 서로 다릅니다.");
                return values[0];
            }
            var libraryId = null, matches = new Set();
            async function readChildren(rootId, consume) {
                var start = 0, next = null, seen = new Set();
                for (var page = 0; page < 1000; page++) {
                    // SearchUtil은 query를 MQL where에 그대로 전달하므로 검색 엔진 문법을 사용하지 않습니다.
                    var payload = {
                        label: "sdxECCAClassCode_" + Date.now() + "_" + Math.random().toString(36).slice(2), tenant: tenant,
                        query: rootId ? 'type == "General Class"' : 'type == "General Library" && attribute[Title] == "' + libraryTitle + '"',
                        // type은 서버가 자동 추가하는 ds6w:type으로 통일해 중복 DB 선택을 피합니다.
                        select_predicate: rootId ? ["physicalid", "ds6w:type", "current", "attribute[sdxClassCode]"] : ["physicalid", "ds6w:type", "attribute[Title]"],
                        person_predicate: [], select_file: [], start: start, nresults: 100,
                        // 정렬은 OOTB authoring 조회에서 사용하는 기본 modified 정렬을 유지합니다.
                        order_field: "ds6w:modified", order_by: "desc"
                    };
                    if (rootId) {
                        payload.root_physicalid = rootId;
                        payload.rels_to_fetch = ["Subclass"];
                    }
                    if (next !== null) payload.next_start = next;
                    var response = await post("/resources/IPClassificationReuse/Search/search", payload);
                    var rows = response.results, info = response.infos;
                    if (!info || !Number.isSafeInteger(info.nhits) || info.nhits < 0 ||
                        !Number.isSafeInteger(info.nresults) || info.nresults !== rows.length) {
                        throw new Error("분류 조회 API의 페이지 집계 정보를 확인해 주세요.");
                    }
                    rows.forEach(function (row) {
                        var id = value(row, ["physicalid"]);
                        if (!id || seen.has(id)) throw new Error("분류 조회의 physicalid 또는 페이지 진행을 확인해 주세요.");
                        seen.add(id);
                        consume(row, id);
                    });
                    if (!rows.length) {
                        if (start < info.nhits) throw new Error("분류 조회 결과가 누락되었습니다.");
                        return;
                    }
                    next = info.next_start;
                    if (typeof next !== "string" || !/^\d+(?: \d+)?$/.test(next)) throw new Error("분류 조회의 next_start를 확인해 주세요.");
                    var offset = Number(next.split(" ")[0]);
                    if (!Number.isSafeInteger(offset) || offset !== start + rows.length) throw new Error("분류 조회의 페이지 진행을 확인해 주세요.");
                    if (offset >= info.nhits) return;
                    start = offset;
                }
                throw new Error("분류 조회 페이지 제한을 초과했습니다.");
            }
            // 루트 ID가 없으면 이 API는 General Library만 조회합니다.
            await readChildren(null, function (row, id) {
                if (value(row, ["ds6w:type", "type"]) !== "General Library") throw new Error("루트 라이브러리 유형을 확인해 주세요.");
                if (value(row, ["attribute[Title]"]) !== libraryTitle) throw new Error("조회된 라이브러리 제목이 지정값과 다릅니다.");
                if (libraryId && libraryId !== id) throw new Error("제목이 " + libraryTitle + "인 라이브러리가 여러 개입니다.");
                libraryId = id;
            });
            if (!libraryId) throw new Error("제목이 " + libraryTitle + "인 라이브러리가 없습니다. 제목과 조회 권한을 확인해 주세요.");
            function consumeClass(row, id) {
                    if (value(row, ["ds6w:type", "type"]) !== "General Class") throw new Error("조회한 클래스 유형을 확인해 주세요.");
                    var state = value(row, ["current"]), code = value(row, ["attribute[sdxClassCode]"]);
                    if (state === null || code === null) throw new Error("클래스의 current·sdxClassCode 조회값을 확인해 주세요.");
                    if (state === "Active" && code === scope.classCode) matches.add(id);
                    if (matches.size > 1) throw new Error("코드에 해당하는 활성 클래스가 여러 개입니다.");
                    // 조회 범위는 라이브러리 바로 아래 1뎁스입니다. 클래스를 다시 확장하지 않습니다.
            }
            await readChildren(libraryId, consumeClass);
            if (!matches.size) throw new Error("라이브러리 바로 아래 1뎁스에 sdxClassCode가 " + scope.classCode + "인 활성 클래스가 없습니다.");
            return {classId: Array.from(matches)[0], libraryId: libraryId};
        });
    }
    return {load: load, readMandatory: readMandatory, findActiveClassByCode: findActiveClassByCode};
});


// S4. sdxECCAAttributeControlService
/** 제어 객체 조회만 담당합니다. UI/폼 모델과 분리합니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeControlService", [
    "DS/WAFData/WAFData",
    "DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices"
], function (WAFData, Compass) {
    "use strict";
    function parse(response, state) {
        if (typeof response === "string") response = JSON.parse(response, state);
        if (!response || response.success !== true || response.type !== "sdxECChangeAction" ||
                response.organization !== "MX" || response.state !== state || !Array.isArray(response.attributes)) {
            throw new Error("속성 제어 설정 응답을 확인해 주세요.");
        }
        var rules = new Map();
        response.attributes.forEach(function (rule) {
            if (!rule || typeof rule.name !== "string" || !rule.name.trim() || rule.name !== rule.name.trim() ||
                    rules.has(rule.name) || !Number.isInteger(rule.order) || rule.order < 0 || rule.order > 999999999 ||
                    ["read", "edit", "mandatory", "mandatoryCheck"].some(function (key) { return typeof rule[key] !== "boolean"; })) {
                throw new Error("속성 제어 설정의 이름·순서·Y/N 값을 확인해 주세요.");
            }
            rules.set(rule.name, Object.assign({}, rule));
        });
        return rules;
    }
    function read(request) {
        var url = request.url || "/resources/v1/modeler/sdxECCA/attributes/control";
        if (!/^\/resources\/[A-Za-z0-9_/-]+$/.test(url) || !request.securityContext || !request.tenant ||
                typeof request.state !== "string" || !request.state.trim() || request.state !== request.state.trim() || request.state.length > 128) {
            return Promise.reject(new Error("속성 제어 조회 URL·권한 문맥·tenant·상태를 확인해 주세요."));
        }
        var state = request.state;
        function closed() { return request.isCancelled && request.isCancelled(); }
        return new Promise(function (resolve, reject) {
            Compass.getServiceUrl({serviceName: "3DSpace", platformId: request.tenant,
                onComplete: function (result) {
                    if (Array.isArray(result)) {
                        var match = result.find(function (item) { return item.platformId === request.tenant; });
                        result = match && match.url;
                    }
                    if (typeof result !== "string" || !result) { reject(new Error("3DSpace 주소를 확인해 주세요.")); return; }
                    resolve(result.replace(/\/$/, ""));
                }, onFailure: function () { reject(new Error("3DSpace 주소를 조회하지 못했습니다.")); }
            });
        }).then(function (base) {
            if (closed()) return null;
            return new Promise(function (resolve, reject) {
                WAFData.authenticatedRequest(base + url + "?state=" + encodeURIComponent(state), {method: "GET", type: "json", timeout: 10000,
                    proxy: "passport", authentication: "passport",
                    headers: {Accept: "application/json", SecurityContext: encodeURIComponent(request.securityContext)},
                    onComplete: function (response) {
                        try { resolve(closed() ? null : parse(response, state)); } catch (error) { reject(error); }
                    },
                    onFailure: function () { reject(new Error("속성 제어 설정 조회에 실패했습니다.")); },
                    onTimeout: function () { reject(new Error("속성 제어 설정 조회 시간이 초과되었습니다.")); }
                });
            });
        });
    }
    return {read: read};
});

// S5. sdxECCAModelSearchService
/** 모델 후보 조회. UI와 분리하고 생성창의 tenant/SecurityContext를 사용합니다. */
define("DS/sdxECCAAutoClass/sdxECCAModelSearchService", [
    "DS/WAFData/WAFData",
    "DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices"
], function (WAFData, Compass) {
    "use strict";
    var MODEL_TYPE = "sdxMTopAssy";

    function text(value) { return typeof value === "string" ? value : ""; }
    function escapeTerm(value) {
        return value.replace(/([\\+\-!(){}\[\]^"~*?:/|&])/g, "\\$1");
    }
    function normalize(object) {
        if (!object || typeof object !== "object") return null;
        var data = Object.assign({}, object);
        (Array.isArray(object.attributes) ? object.attributes : []).forEach(function (attribute) {
            if (attribute && typeof attribute.name === "string") data[attribute.name] = attribute.value;
        });
        var type = text(data["ds6w:type_value"]) || text(data.type) || text(data.objectType) || text(data["ds6w:type"]);
        if (type && type !== MODEL_TYPE) return null;
        var id = text(data.id) || text(data.physicalid) || text(data.physicalID) || text(data.resourceid);
        var name = text(data.name) || text(data["ds6w:identifier"]);
        if (!id || !name) return null;
        return Object.assign({}, data, {
            id: id, physicalid: id, name: name,
            title: text(data.title) || text(data["ds6w:label"]) || name,
            type: type || MODEL_TYPE
        });
    }
    function search(request) {
        var query = text(request.query).trim();
        if (query.length < 3) return Promise.resolve([]);
        if (!text(request.securityContext).trim() || !text(request.tenant).trim()) {
            return Promise.reject(new Error("모델 검색의 권한 문맥과 tenant를 확인해 주세요."));
        }
        var scope = {securityContext: request.securityContext, tenant: request.tenant};
        return new Promise(function (resolve, reject) {
            Compass.getServiceUrl({serviceName: "3DSearch", platformId: scope.tenant,
                onComplete: function (response) {
                    var url = typeof response === "string" ? response : "";
                    if (Array.isArray(response)) {
                        var match = response.find(function (item) { return item.platformId === scope.tenant; });
                        url = match && match.url;
                    }
                    if (!url) { reject(new Error("모델 검색 서비스를 찾지 못했습니다.")); return; }
                    resolve(url.replace(/\/$/, ""));
                },
                onFailure: function () { reject(new Error("모델 검색 서비스를 조회하지 못했습니다.")); }
            });
        }).then(function (base) {
            if (request.isCancelled && request.isCancelled()) return [];
            var term = escapeTerm(query);
            var payload = {
                query: 'type:"' + MODEL_TYPE + '" AND ([ds6w:label]:(*' + term + '*) OR [ds6w:identifier]:(*' + term + '*))',
                source: ["3dspace"], tenant: scope.tenant,
                login: {"3dspace": {SecurityContext: scope.securityContext}},
                select_predicate: ["ds6w:label", "ds6w:identifier", "ds6w:type"],
                select_file: ["icon", "thumbnail_2d"],
                with_indexing_date: true, with_nls: false, with_synthesis: false,
                order_by: "asc", order_field: "ds6w:label", nresults: 20, start: "0"
            };
            return new Promise(function (resolve, reject) {
                WAFData.authenticatedRequest(base + "/search?xrequestedwith=xmlhttprequest&tenant=" + encodeURIComponent(scope.tenant), {
                    method: "POST", type: "json", timeout: 10000,
                    auth: {passport_target: "enovia"}, proxy: "passport", authentication: "passport",
                    headers: {Accept: "application/json", "Content-Type": "application/json"},
                    data: JSON.stringify(payload),
                    onComplete: function (response) {
                        try {
                            if (request.isCancelled && request.isCancelled()) { resolve([]); return; }
                            if (typeof response === "string") response = JSON.parse(response);
                            if (!response || !Array.isArray(response.results)) {
                                // 빈 검색도 명시적인 배열 계약을 요구합니다. 오류 응답을 후보로 취급하지 않습니다.
                                if (response && response.infos && Number(response.infos.nhits) === 0) { resolve([]); return; }
                                throw new Error("모델 검색 응답 형식을 확인해 주세요.");
                            }
                            var seen = new Set();
                            resolve(response.results.map(normalize).filter(function (item) {
                                if (!item || seen.has(item.id)) return false;
                                seen.add(item.id); return true;
                            }));
                        } catch (error) { reject(error); }
                    },
                    onFailure: function () { reject(new Error("모델 검색에 실패했습니다.")); },
                    onTimeout: function () { reject(new Error("모델 검색 시간이 초과되었습니다.")); }
                });
            });
        });
    }
    /** 3DSearch의 색인값 대신 선택 객체의 최신 전체 속성값을 3DSpace에서 읽습니다. */
    function readAttributes(request) {
        if (!request || !/^[A-Za-z0-9.-]{1,128}$/.test(text(request.id)) ||
                !text(request.securityContext).trim() || !text(request.tenant).trim()) {
            return Promise.reject(new Error("모델 속성 조회의 ID와 권한 문맥을 확인해 주세요."));
        }
        var id = request.id, context = request.securityContext, tenant = request.tenant;
        function cancelled() { return request.isCancelled && request.isCancelled(); }
        return new Promise(function (resolve, reject) {
            Compass.getServiceUrl({serviceName: "3DSpace", platformId: tenant,
                onComplete: function (response) {
                    var url = typeof response === "string" ? response : "";
                    if (Array.isArray(response)) {
                        var match = response.find(function (item) { return item.platformId === tenant; });
                        url = match && match.url;
                    }
                    if (!url) { reject(new Error("모델 속성 조회 서비스를 찾지 못했습니다.")); return; }
                    resolve(url.replace(/\/$/, ""));
                },
                onFailure: function () { reject(new Error("모델 속성 조회 서비스를 찾지 못했습니다.")); }
            });
        }).then(function (base) {
            if (cancelled()) return null;
            return new Promise(function (resolve, reject) {
                WAFData.authenticatedRequest(base + "/resources/v1/modeler/sdxECCA/models/" + encodeURIComponent(id) + "/attributes", {
                    method: "GET", type: "json", timeout: 10000,
                    auth: {passport_target: "enovia"}, proxy: "passport", authentication: "passport",
                    headers: {Accept: "application/json", SecurityContext: encodeURIComponent(context)},
                    onComplete: function (response) {
                        try {
                            if (cancelled()) { resolve(null); return; }
                            if (typeof response === "string") response = JSON.parse(response);
                            if (!response || response.success !== true || response.type !== MODEL_TYPE ||
                                    (response.id !== id && response.physicalid !== id) || !text(response.name) ||
                                    !response.attributes || typeof response.attributes !== "object" || Array.isArray(response.attributes)) {
                                throw new Error("모델 속성 조회 응답을 확인해 주세요.");
                            }
                            resolve(response);
                        } catch (error) { reject(error); }
                    },
                    onFailure: function () { reject(new Error("모델 속성을 조회하지 못했습니다. 객체 접근 권한과 서비스 배포를 확인해 주세요.")); },
                    onTimeout: function () { reject(new Error("모델 속성 조회 시간이 초과되었습니다.")); }
                });
            });
        });
    }
    return {search: search, normalize: normalize, readAttributes: readAttributes, modelType: MODEL_TYPE};
});

// 생성창 진입 시 이 파일 전체의 named 모듈을 먼저 등록합니다.
// 검색·제어 조회 모듈은 여기의 필수 의존성에 넣지 않습니다.
define("DS/sdxECCAAutoClass/sdxECCAService", [
    "DS/sdxECCAAutoClass/sdxECCAClassRuleService",
    "DS/sdxECCAAutoClass/sdxECCAOrganizationProvider",
    "DS/sdxECCAAutoClass/sdxECCAClassAttributeService"
], function (ClassRule, Organization, ClassAttribute) {
    "use strict";
    return {classRule: ClassRule, organization: Organization, classAttribute: ClassAttribute};
});
