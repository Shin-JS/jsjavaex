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
            if (!scope.securityContext) throw new Error("클래스 조회 권한 문맥이 없습니다.");
            if (!service || typeof service.get3DSpaceUrl !== "function") throw new Error("3DSpace 조회 서비스를 확인해 주세요.");
            var url = (await service.get3DSpaceUrl()).replace(/\/$/, "");
            var tenant = scope.tenant || "OnPremise";
            var WAFData = await new Promise(function (resolve, reject) {
                require(["DS/WAFData/WAFData"], resolve, function () { reject(new Error("WAFData 모듈을 로드할 수 없습니다.")); });
            });
            var stoppedError = null;
            function checkOpen() {
                if (stoppedError) throw stoppedError;
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
            var queue = [], queued = new Set(), matches = new Set();
            function enqueue(id) {
                if (!queued.has(id)) { queued.add(id); queue.push(id); }
            }
            async function readChildren(rootId, consume) {
                var start = 0, next = null, seen = new Set();
                for (var page = 0; page < 1000; page++) {
                    // SearchUtil은 query를 MQL where에 그대로 전달하므로 검색 엔진 문법을 사용하지 않습니다.
                    var payload = {
                        label: "sdxECCAClassCode_" + Date.now() + "_" + Math.random().toString(36).slice(2), tenant: tenant,
                        query: rootId ? 'type == "General Class"' : 'type == "General Library"',
                        // type은 서버가 자동 추가하는 ds6w:type으로 통일해 중복 DB 선택을 피합니다.
                        select_predicate: rootId ? ["physicalid", "ds6w:type", "current", "attribute[sdxClassCode]"] : ["physicalid", "ds6w:type"],
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
                enqueue(id);
            });
            function consumeClass(row, id) {
                    if (value(row, ["ds6w:type", "type"]) !== "General Class") throw new Error("조회한 클래스 유형을 확인해 주세요.");
                    var state = value(row, ["current"]), code = value(row, ["attribute[sdxClassCode]"]);
                    if (state === null || code === null) throw new Error("클래스의 current·sdxClassCode 조회값을 확인해 주세요.");
                    if (state === "Active" && code === scope.classCode) matches.add(id);
                    if (matches.size > 1) throw new Error("코드에 해당하는 활성 클래스가 여러 개입니다.");
                    // 조회 범위는 라이브러리 바로 아래 1뎁스입니다. 클래스를 다시 확장하지 않습니다.
            }
            // 페이지는 각 라이브러리 안에서 순차 조회하고, 라이브러리는 최대 4개만 병렬 조회합니다.
            var node = 0;
            while (node < queue.length) {
                checkOpen();
                var end = Math.min(node + 4, queue.length);
                if (end > 20000) throw new Error("클래스 경로 조회 제한을 초과했습니다.");
                var batch = queue.slice(node, end);
                node = end;
                await Promise.all(batch.map(async function (id) {
                    try {
                        await readChildren(id, consumeClass);
                    } catch (error) {
                        // 한 경로라도 실패하면 다른 진행 중 경로의 후속 페이지도 중단합니다.
                        if (!stoppedError) stoppedError = error;
                        throw stoppedError;
                    }
                }));
            }
            if (!matches.size) throw new Error("라이브러리 바로 아래 1뎁스에 sdxClassCode가 " + scope.classCode + "인 활성 클래스가 없습니다.");
            return {classId: Array.from(matches)[0], libraryId: null};
        });
    }
    return {load: load, readMandatory: readMandatory, findActiveClassByCode: findActiveClassByCode};
});

