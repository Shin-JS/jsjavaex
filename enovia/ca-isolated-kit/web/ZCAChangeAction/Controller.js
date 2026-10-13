define("ZCAChangeAction/Controller", [
    "UWA/Core",
    "DS/ENONewWidget/ENONew/Controller/ENONewController",
    "ZCAChangeAction/vendor/DialogController"
], function (UWA, Base, DialogController) {
    "use strict";
    return Base.extend({
        init: function (options, createOptions) {
            this.skeleton = null;
            this.defaultAttributes = {};
            this._parent(options, createOptions);
        },
        getUI: function () {
            var self = this;
            return new UWA.Promise(function (resolve) {
                if (!self.dialog) self.dialog = new DialogController();
                resolve(self.dialog);
            });
        },
        destroyComponent: function () {
            // The OOTB dialog destroys its frame; explicitly dispose our sessions
            // rather than assume facet.destroy() is always called by that path.
            var facets = this.dialog && this.dialog.View && this.dialog.View.facets;
            var sessions = new Set();
            (facets || []).forEach(function (facet) {
                if (facet.options && facet.options.zcaSession) {
                    sessions.add(facet.options.zcaSession);
                }
            });
            sessions.forEach(function (session) { session.dispose(); });
            this._parent();
        }
    });
});
