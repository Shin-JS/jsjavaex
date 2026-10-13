define("ZCAChangeAction/Engine", [
    "DS/ENONewWidget/ENONew/ENONewEngine",
    "ZCAChangeAction/Controller"
], function (Base, Controller) {
    "use strict";
    return Base.extend({
        init: function (options, widgetObject, createOptions) {
            // Base stores mutable defaults on its prototype; own them per instance.
            this.objInfo = {
                id: "", context: {}, labelTopBar: "", commandName: "",
                overlay: true, type: "", silentMode: false, responseFormat: 0,
                notification: true, activatelock: {show: false, preference: ""},
                activateDraftMode: {show: false, preference: ""},
                activateCreateAnother: false,
                options: {
                    preferedType: "", typeName: "", select: [], parentPIDs: [],
                    selectedIDs: [], parentOrigin: [], folderID: [],
                    activeFolder: false, attributes: {}, domainAttributes: []
                },
                facets: [], viewType: "tabView",
                events: {onSuccess: function () {}, onFailure: function () {},
                    onCancel: function () {}}
            };
            this.controller = null;
            this._parent(options, widgetObject, createOptions);
        },
        _getController: function (options, createOptions) {
            return this.controller || new Controller(options, createOptions);
        }
    });
});
