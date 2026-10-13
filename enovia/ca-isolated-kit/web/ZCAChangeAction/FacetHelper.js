define("ZCAChangeAction/FacetHelper", [
    "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper",
    "ZCAChangeAction/SelectionSession"
], function (Base, Session) {
    "use strict";
    return {
        getDefaultFacetName: function () { return Base.getDefaultFacetName(); },
        getFacetList: function (data, requested, settings) {
            // New object per dialog. No module-global selection or Base mutation.
            var session = new Session();
            var first = Base.getDefaultFacet();
            first.require = "ZCAChangeAction/PropertiesFacet";
            first.options = Object.assign({}, first.options, {
                data: data,
                zcaSession: session
            });
            if (settings.buttons) first.options.buttons = settings.buttons;
            var result = [first];
            (requested || []).forEach(function (entry) {
                var descriptor = Base.getFacetDefinition(entry.name);
                if (!descriptor) throw new Error("Unsupported facet: " + entry.name);
                descriptor.options = Object.assign({}, entry.facetoptions || {});
                if (settings.securityContext) {
                    descriptor.options.securityContext = settings.securityContext;
                }
                if (entry.name === "classificationFacet") {
                    descriptor.require = "ZCAChangeAction/ClassificationFacet";
                    descriptor.options.zcaSession = session;
                    descriptor.alwaysCalled = true;
                }
                result.push(descriptor);
            });
            return result;
        }
    };
});
