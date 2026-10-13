define("ZCAChangeAction/Launcher", [
    "DS/ENONewWidget/ajaxRequests/LifecycleServicesSettings",
    "ZCAChangeAction/Config",
    "ZCAChangeAction/Engine"
], function (Services, Config, Engine) {
    "use strict";
    // This module exists only in the custom widget's RequireJS context.
    // OOTB classification utilities contain singleton state: one dialog per frame.
    var active = false;
    return {
        open: function (context, callbacks) {
            if (active) throw new Error("이미 열린 생성 대화상자를 먼저 닫아 주세요.");
            if (!context || !context.tenant || !context.header ||
                !context.header.SecurityContext) {
                throw new Error("현재 위젯의 tenant와 SecurityContext가 필요합니다.");
            }
            callbacks = callbacks || {};
            active = true;
            return new Promise(function (resolve, reject) {
                Services.service_initialization(function () {
                    try {
                        var engine = new Engine({
                            context: Object.assign({}, context, {
                                header: Object.assign({}, context.header)
                            }),
                            type: Config.typeName,
                            labelTopBar: Config.label,
                            options: {
                                typeName: Config.typeName,
                                preferedType: Config.typeName,
                                select: []
                            },
                            viewType: "tabView",
                            overlay: true,
                            activateCreateAnother: false,
                            facets: [{name: "classificationFacet", facetoptions: {
                                isBookmark: false, isLibrary: true, isExportControl: false
                            }}],
                            events: {
                                onSuccess: function (response) {
                                    active = false;
                                    if (callbacks.onSuccess) callbacks.onSuccess(response);
                                },
                                onFailure: function (response) {
                                    // Validation/request failures may leave dialog open.
                                    if (callbacks.onFailure) callbacks.onFailure(response);
                                },
                                onCancel: function (response) {
                                    active = false;
                                    if (callbacks.onCancel) callbacks.onCancel(response);
                                }
                            }
                        });
                        resolve(engine);
                    } catch (error) { active = false; reject(error); }
                });
            });
        }
    };
});
