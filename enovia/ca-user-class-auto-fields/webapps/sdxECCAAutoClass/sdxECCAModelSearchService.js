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
        var type = text(data.type) || text(data.objectType) || text(data["ds6w:type"]);
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
    return {search: search, normalize: normalize, modelType: MODEL_TYPE};
});
