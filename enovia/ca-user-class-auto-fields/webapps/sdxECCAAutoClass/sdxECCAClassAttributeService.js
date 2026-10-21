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
    /** OOTB authoring 검색과 상세 조회로 클래스 자체의 코드·상태를 확인합니다. */
    function findActiveClassByCode(service, scope) {
        return Promise.resolve().then(async function () {
            if (!scope || typeof scope.classCode !== "string" || !/^[A-Za-z0-9_]+$/.test(scope.classCode)) {
                throw new Error("조회할 sdxClassCode를 확인해 주세요.");
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
                                if (!response || response.success === false || response.error || !Array.isArray(response.results)) {
                                    throw new Error("분류 조회 API의 results 응답을 확인해 주세요.");
                                }
                                resolve(response.results);
                            } catch (error) { reject(error); }
                        },
                        onFailure: function () { reject(new Error("기존 분류 조회 API 호출에 실패했습니다. 응답과 권한을 확인해 주세요.")); },
                        onTimeout: function () { reject(new Error("활성 클래스 조회 시간이 초과되었습니다.")); }
                    });
                });
            }
            function value(row, names) {
                if (!row || !Array.isArray(row.attributes)) throw new Error("분류 상세 조회의 attributes 응답을 확인해 주세요.");
                var attrs = row.attributes.filter(function (item) { return item && names.indexOf(item.name) >= 0; });
                if (!attrs.length) return null;
                var values = attrs.map(function (item) {
                    var result = item.value;
                    if (Array.isArray(result) && result.length <= 1) result = result.length ? result[0] : "";
                    if (typeof result !== "string") throw new Error("분류 상세 속성의 단일 문자열 값을 확인해 주세요.");
                    return result;
                });
                if (values.some(function (item) { return item !== values[0]; })) throw new Error("분류 속성의 응답값이 서로 다릅니다.");
                return values[0];
            }
            var seen = new Set(), matches = new Set(), start = 0;
            // sdxClassCode의 검색 인덱스 등록 여부를 가정하지 않습니다.
            // DB 기반 활성 후보를 페이지별로 읽고 DB 상세 속성으로 정확히 비교합니다.
            for (var page = 0; page < 1000; page++) {
                var rows = await post("/resources/IPClassificationReuse/Search/search", {
                    label: "sdxECCAClassCodeSearch", tenant: tenant,
                    query: 'flattenedtaxonomies:"types/General Class"', states_to_fetch: ["Active"],
                    select_predicate: ["physicalid", "ds6w:type", "ds6w:status"],
                    person_predicate: [], start: start, nresults: 100,
                    order_field: "ds6w:modified", order_by: "desc", with_indexing_date: true
                });
                if (!rows.length) {
                    if (!matches.size) throw new Error("sdxClassCode가 " + scope.classCode + "인 활성 클래스가 없습니다.");
                    return {classId: Array.from(matches)[0], libraryId: null};
                }
                var ids = rows.map(function (row) {
                    var id = value(row, ["physicalid"]);
                    if (!id || seen.has(id)) throw new Error("분류 조회의 physicalid 또는 페이지 진행을 확인해 주세요.");
                    seen.add(id);
                    return id;
                });
                var details = await post("/resources/IPClassificationReuse/classifiedItem/getContentDetails", {
                    label: "sdxECCAClassCodeDetails", physicalid: ids,
                    select_predicate: ["physicalid", "ds6w:type", "ds6w:status", "attribute[sdxClassCode]"],
                    classification_attribute: ["attribute[sdxClassCode]"],
                    person_predicate: [], compute_select_bo: []
                });
                var returned = new Set();
                details.forEach(function (row) {
                    var id = value(row, ["physicalid"]);
                    if (ids.indexOf(id) < 0 || returned.has(id)) throw new Error("분류 상세 응답의 객체 ID를 확인해 주세요.");
                    returned.add(id);
                    var type = value(row, ["ds6w:type", "ds6w:what/ds6w:type", "type"]);
                    var state = value(row, ["ds6w:status", "ds6w:what/ds6w:status", "current"]);
                    var code = value(row, ["attribute[sdxClassCode]", "sdxClassCode"]);
                    if (type !== "General Class" || state === null || code === null) throw new Error("분류 상세의 유형·상태·sdxClassCode를 확인해 주세요.");
                    if ((state === "Active" || state === "Classification.Active") && code === scope.classCode) matches.add(id);
                });
                if (returned.size !== ids.length) throw new Error("분류 상세 조회 결과가 누락되었습니다.");
                if (matches.size > 1) throw new Error("코드에 해당하는 활성 클래스가 여러 개입니다.");
                start += rows.length;
            }
            throw new Error("분류 조회 페이지 제한을 초과했습니다. 검색 범위를 확인해 주세요.");
        });
    }
    return {load: load, readMandatory: readMandatory, findActiveClassByCode: findActiveClassByCode};
});

