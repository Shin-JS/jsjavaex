/** 제어 객체 조회만 담당합니다. UI/폼 모델과 분리합니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeControlService", [
    "DS/WAFData/WAFData",
    "DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices"
], function (WAFData, Compass) {
    "use strict";
    function parse(response) {
        if (typeof response === "string") response = JSON.parse(response);
        if (!response || response.success !== true || response.type !== "sdxECChangeAction" ||
                response.organization !== "MX" || response.state !== "CREATE" || !Array.isArray(response.attributes)) {
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
        if (!/^\/resources\/[A-Za-z0-9_/-]+$/.test(url) || !request.securityContext || !request.tenant) {
            return Promise.reject(new Error("속성 제어 조회 URL·권한 문맥·tenant를 확인해 주세요."));
        }
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
                WAFData.authenticatedRequest(base + url, {method: "GET", type: "json", timeout: 10000,
                    proxy: "passport", authentication: "passport",
                    headers: {Accept: "application/json", SecurityContext: encodeURIComponent(request.securityContext)},
                    onComplete: function (response) {
                        try { resolve(closed() ? null : parse(response)); } catch (error) { reject(error); }
                    },
                    onFailure: function () { reject(new Error("속성 제어 설정 조회에 실패했습니다.")); },
                    onTimeout: function () { reject(new Error("속성 제어 설정 조회 시간이 초과되었습니다.")); }
                });
            });
        });
    }
    return {read: read};
});
