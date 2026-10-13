define("ZCAChangeAction/LibraryAdapter", [], function () {
    "use strict";
    function Adapter(session) { this.session = session; }
    Adapter.prototype.controller = function () {
        if (this.session.disposed || !this.session.controller) {
            throw new Error("분류 컨트롤러가 아직 준비되지 않았습니다.");
        }
        return this.session.controller;
    };
    Adapter.prototype.search = function (text) {
        var ctrl = this.controller();
        var selectedIds = this.session.selected().map(function (item) { return item.id; });
        return new Promise(function (resolve, reject) {
            ctrl.PLMNewCommonWebService.flattenedSearch({
                searchKey: text, alreadyPresentIDs: selectedIds, nresults: 10,
                onComplete: function (response) {
                    if (!response || !response.results) { resolve([]); return; }
                    var tree = ctrl.plmNewClassificationFacetData._generateSearchData(
                        response.results,
                        function (data) { return ctrl._getIcon(data); },
                        function (type) { return ctrl.couldBeSelected(type); }
                    );
                    resolve(tree.getChildren().filter(function (node) {
                        return ctrl.couldBeSelected(node.plmType);
                    }));
                },
                onFailure: reject
            });
        });
    };
    Adapter.prototype.add = function (node) {
        var self = this;
        var ctrl = this.controller();
        var id = node.getID();
        if (!ctrl.couldBeSelected(node.plmType)) {
            return Promise.reject(new Error("클래스를 선택해 주세요."));
        }
        if (this.session.selected().some(function (item) { return item.id === id; })) {
            return Promise.resolve();
        }
        // Path lookup precedes insertion, matching the OOTB browse-selection path.
        return new Promise(function (resolve, reject) {
            ctrl.PLMNewCommonWebService.getClassPaths({
                id: [id], plmNewContextProvider: ctrl.plmNewContextProvider,
                onComplete: function (response) {
                    try {
                        if (self.session.disposed) { resolve(); return; }
                        if (self.session.selected().some(function (item) {
                            return item.id === id;
                        })) { resolve(); return; }
                        var paths = ctrl.PLMNewCommonWebService.constructPath(response, "idPathMap");
                        if (!paths.has(id)) throw new Error("클래스 경로를 찾지 못했습니다.");
                        ctrl._classPathMap.set(id, paths.get(id));
                        ctrl._classNameMap.set(id, node.getLabel());
                        if (node.options.classUsage) {
                            ctrl._classUsageMap.set(id, node.options.classUsage);
                        }
                        ctrl.classifPropertiesUI.setClassPath(ctrl.getClassPath());
                        ctrl.classifPropertiesUI.setClassUsage(ctrl.getClassUsage());
                        ctrl.autoComplete._model.prepareUpdate();
                        var inserted = ctrl.insertInAutocomplete(ctrl.autocompleteLibrary, node);
                        if (!inserted) throw new Error("클래스 선택 노드를 추가하지 못했습니다.");
                        ctrl._nodesData[id] = inserted;
                        ctrl.autoComplete._model.pushUpdate();
                        inserted.select();
                        // Attribute loading itself remains OOTB asynchronous work.
                        self.session.notify();
                        resolve();
                    } catch (error) { reject(error); }
                },
                onFailure: reject
            });
        });
    };
    Adapter.prototype.browse = function () { this.controller().onClickSelector(); };
    return Adapter;
});
