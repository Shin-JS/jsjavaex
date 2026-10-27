/** 우리 등록창의 기본/확장 속성 표시만 제어합니다. 분류 클래스 속성은 대상이 아닙니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeVisibility", ["require"], function (require) {
    "use strict";

    function readResponse(response, names) {
        if (typeof response === "string") response = JSON.parse(response);
        if (!response || response.success !== true || response.type !== "sdxECChangeAction" ||
                !Array.isArray(response.attributes)) {
            throw new Error("속성 표시 설정 응답을 확인해 주세요.");
        }
        var result = new Map();
        response.attributes.forEach(function (item) {
            if (!item || !names.has(item.name) || typeof item.searchable !== "boolean" || result.has(item.name)) {
                throw new Error("속성 표시 설정의 이름/값을 확인해 주세요.");
            }
            result.set(item.name, item.searchable);
        });
        return result;
    }

    function install(facet, session, options) {
        if (!session || session.type !== "sdxECChangeAction" || session.disposed || !options.url) {
            return Promise.resolve(function () {});
        }
        var view = facet.listview;
        var model = view && view.propModel;
        var data = view && view.data;
        var names = new Set();
        ["publicAttributes", "extensionAttributes"].forEach(function (group) {
            var attributes = data && data.attributes && data.attributes[group];
            (Array.isArray(attributes) ? attributes : []).forEach(function (attribute) {
                if (attribute && typeof attribute.name === "string") names.add(attribute.name);
            });
        });
        if (!names.size) return Promise.resolve(function () {});
        if (names.size > 300 || !model || typeof model.getAllAttributes !== "function" ||
                typeof view.addAttributeOnUI !== "function") {
            return Promise.reject(new Error("대상 속성 목록 또는 OOTB 표시 API를 확인해 주세요."));
        }
        // 3DSpace 기준 상대 경로만 사용합니다. 다른 서버로 속성명을 전송하지 않습니다.
        if (!/^\/resources\/[A-Za-z0-9_/-]+$/.test(options.url)) {
            return Promise.reject(new Error("속성 표시 조회 URL을 확인해 주세요."));
        }
        var disposed = false;
        function isClosed() {
            return disposed || session.disposed || session.transitioning || session.status === "error" ||
                (session.readCurrentType && session.readCurrentType() !== session.type);
        }
        function requestJson(WAFData, url, method, headers, body) {
            return new Promise(function (resolve, reject) {
                try {
                    WAFData.authenticatedRequest(url, {
                        method: method,
                        type: "json",
                        timeout: 5000,
                        proxy: "passport",
                        authentication: "passport",
                        headers: headers,
                        data: body,
                        onComplete: function (response) {
                            try { resolve(typeof response === "string" ? JSON.parse(response) : response); }
                            catch (error) { reject(error); }
                        },
                        onFailure: function () { reject(new Error("속성 표시 설정 조회에 실패했습니다.")); },
                        onTimeout: function () { reject(new Error("속성 표시 설정 조회 시간이 초과되었습니다.")); }
                    });
                } catch (error) { reject(error); }
            });
        }
        return Promise.resolve().then(function () {
            return options.service.get3DSpaceUrl();
        }).then(function (spaceUrl) {
            return new Promise(function (resolve, reject) {
                require(["DS/WAFData/WAFData"], resolve, reject);
            }).then(function (WAFData) {
                if (isClosed()) return new Map();
                var base = spaceUrl.replace(/\/$/, "");
                var headers = {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    SecurityContext: encodeURIComponent(session.context)
                };
                return requestJson(WAFData, base + "/resources/v1/application/CSRF", "GET", headers)
                    .then(function (token) {
                        if (isClosed()) return new Map();
                        var csrf = token && token.csrf;
                        if (!csrf || !/^[A-Za-z0-9_-]+$/.test(csrf.name) || typeof csrf.value !== "string" || !csrf.value) {
                            throw new Error("CSRF 토큰을 확인해 주세요.");
                        }
                        headers[csrf.name] = csrf.value;
                        return requestJson(WAFData, base + options.url, "POST", headers,
                            JSON.stringify(Array.from(names)))
                            .then(function (response) { return readResponse(response, names); });
                    });
            });
        }).then(function (visibility) {
            function apply() {
                if (isClosed()) return;
                var fields = model.getAllAttributes();
                Object.keys(fields).forEach(function (key) {
                    var field = fields[key];
                    if (field && visibility.get(field.name) === false && field.visible !== false) {
                        // 모델/입력값/필수 설정은 유지하고 OOTB API로 표시만 숨깁니다.
                        view.addAttributeOnUI(field.getIdentifier(), false);
                    }
                });
            }
            apply();
            if (!isClosed() && typeof model.addEvent === "function") model.addEvent("onChangeAttributes", apply);
            return function () {
                disposed = true;
                if (typeof model.removeEvent === "function") model.removeEvent("onChangeAttributes", apply);
            };
        });
    }

    return {install: install};
});
