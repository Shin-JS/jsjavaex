define("ZCAChangeAction/ClassificationFacet", [
    "DS/ClassificationsFacet/PLMNewClassificationFacet",
    "ZCAChangeAction/Config"
], function (Base, Config) {
    "use strict";
    return Base.extend({
        init: function (options) {
            this.zcaSession = options.zcaSession;
            this._parent(options);
            var self = this;
            var started = Date.now();
            var timer = setInterval(function () {
                if (self.zcaSession.disposed) { clearInterval(timer); return; }
                var ctrl = self.initUI.getController().plmNewLibraryActive;
                if (ctrl && ctrl.autoComplete) {
                    clearInterval(timer);
                    // Keep mutable collections instance-local where exposed by OOTB.
                    ctrl.classIdAndTitleMap = new Map();
                    ctrl._classPathMap = new Map();
                    ctrl._attributeMap = new Map();
                    ctrl._classUsageMap = new Map();
                    ctrl._classNameMap = new Map();
                    ctrl.apiAttributesCall = [];
                    ctrl._isProcessing = false;
                    var notify = function () { self.zcaSession.notify(); };
                    ctrl.autoComplete.addEventListener("change", notify);
                    self.zcaSession.cleanup = function () {
                        if (typeof ctrl.autoComplete.removeEventListener === "function") {
                            ctrl.autoComplete.removeEventListener("change", notify);
                        }
                    };
                    self.zcaSession.attach(ctrl);
                } else if (Date.now() - started > Config.libraryReadyTimeoutMs) {
                    clearInterval(timer);
                    self.zcaSession.error = new Error("분류 facet 초기화 시간이 초과되었습니다.");
                    self.zcaSession.notify();
                }
            }, 100);
            this.zcaTimer = timer;
        },
        destroy: function () {
            clearInterval(this.zcaTimer);
            this.zcaSession.dispose();
            this._parent();
        }
        // Inherit postCreation(): classify the newly-created object and save attributes.
    });
});
