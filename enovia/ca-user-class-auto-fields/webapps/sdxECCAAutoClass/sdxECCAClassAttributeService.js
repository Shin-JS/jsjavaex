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
    return {load: load, readMandatory: readMandatory};
});
