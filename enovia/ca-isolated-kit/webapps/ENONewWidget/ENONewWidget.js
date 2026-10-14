/*
수정·추가 부분만 포함합니다. 전체 파일 교체용이 아닙니다.
2024x 참조 기준이며 설치 버전의 해당 AMD factory 안에 적용하세요.
새 define(), 새 모듈명, 기존 AMD ID 변경은 없습니다.
아래 함수는 표시된 모듈의 factory 내부, return ... 앞에 추가합니다.
*/

/* [1] 모듈: DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
   zcaCreateBridge, zcaAttachBridge를 이 factory 내부에 추가합니다.
   getFacetList(data, facets, settings)의 기존 로직을 유지하고,
   마지막 return 직전에 아래 호출만 추가합니다.

   zcaAttachBridge(e, a); // 2024x 소스에서 e=data, a=최종 facet 배열

   보통 변수명으로 풀어쓴 소스라면:
   zcaAttachBridge(data, facetList);
*/
function zcaCreateBridge() {
    function Session() {
        this.controller = null;
        this.listeners = new Set();
        this.disposed = false;
        this.cleanup = null;
        this.error = null;
    }
    Session.prototype.subscribe = function (listener) {
        this.listeners.add(listener);
        listener(this);
        var self = this;
        return function () { self.listeners.delete(listener); };
    };
    Session.prototype.notify = function () {
        if (!this.disposed) this.listeners.forEach(function (fn) { fn(this); }, this);
    };
    Session.prototype.attach = function (controller) {
        if (this.disposed) return;
        if (this.controller && this.controller !== controller) {
            throw new Error("한 생성 대화상자에 두 분류 컨트롤러를 연결할 수 없습니다.");
        }
        this.controller = controller;
        this.error = null;
        this.notify();
    };
    Session.prototype.selected = function () {
        var ctrl = this.controller;
        return ctrl && ctrl.autoComplete ? ctrl.autoComplete.selectedItems || [] : [];
    };
    Session.prototype.dispose = function () {
        if (this.disposed) return;
        this.disposed = true;
        if (this.cleanup) this.cleanup();
        this.listeners.forEach(function (fn) { fn(this); }, this);
        this.listeners.clear();
        this.controller = null;
    };
    return new Session();
}
function zcaAttachBridge(data, facetList) {
    var enabled = typeof widget !== "undefined" &&
        widget.getValue("zcaEnableLibraryInProperties");
    var currentType = data && data.defaultAttributes &&
        data.defaultAttributes.Type && data.defaultAttributes.Type.value;
    if (!(enabled === true || enabled === "true") ||
        currentType !== "ZCA Change Action") return;
    var classification = facetList.find(function (item) {
        return item.facet.name === "classificationFacet";
    });
    if (!classification) return;
    var bridge = zcaCreateBridge();
    var properties = facetList.find(function (item) {
        return item.facet.name === "ENOCreate";
    });
    if (!properties) return;
    properties.options = properties.options || {};
    classification.options = classification.options || {};
    properties.options.zcaBridge = bridge;
    classification.options.zcaBridge = bridge;
    classification.alwaysCalled = true;
}

/* [2] 모듈: DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
   아래 ZcaLibraryAdapter와 두 함수를 이 factory 내부에 추가합니다.
   기존 init(t)의 마지막 this.listview.loadView() 뒤에:
       zcaInstallPropertiesPicker(this, t);
   기존 destroy()의 this.listview.destroy() 앞에:
       zcaDestroyPropertiesPicker(this);
   기존 init/destroy 본문 및 _parent 호출은 그대로 유지합니다.
*/
    function ZcaLibraryAdapter(session) { this.session = session; }
    ZcaLibraryAdapter.prototype.controller = function () {
        if (this.session.disposed || !this.session.controller) {
            throw new Error("분류 컨트롤러가 아직 준비되지 않았습니다.");
        }
        return this.session.controller;
    };
    ZcaLibraryAdapter.prototype.search = function (text) {
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
    ZcaLibraryAdapter.prototype.add = function (node) {
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
    ZcaLibraryAdapter.prototype.browse = function () { this.controller().onClickSelector(); };
function zcaInstallPropertiesPicker(facet, options) {
    if (!options.zcaBridge) return;

            var self = facet;
            var session = options.zcaBridge;
            var adapter = new ZcaLibraryAdapter(session);
            facet.zcaDisposed = false;
            facet.zcaRequest = 0;
            var root = document.createElement("section");
            root.className = "zca-library-picker";
            var label = document.createElement("label");
            label.textContent = "라이브러리 / 클래스";
            var line = document.createElement("div");
            line.className = "zca-library-line";
            var input = document.createElement("input");
            input.type = "text";
            input.placeholder = "클래스 이름을 3자 이상 입력하세요";
            input.setAttribute("aria-label", "라이브러리 클래스 검색");
            var browse = document.createElement("button");
            browse.type = "button";
            browse.textContent = "찾아보기";
            var results = document.createElement("div");
            var selected = document.createElement("div");
            var status = document.createElement("div");
            status.setAttribute("role", "status");
            label.appendChild(input);
            line.appendChild(label);
            line.appendChild(browse);
            root.appendChild(line);
            root.appendChild(results);
            root.appendChild(selected);
            root.appendChild(status);
            facet.skeleton.appendChild(root);
            facet.zcaRoot = root;
            facet.zcaUnsubscribe = session.subscribe(function (state) {
                if (state.disposed) {
                    self.zcaDisposed = true;
                    ++self.zcaRequest;
                    clearTimeout(self.zcaSearchTimer);
                    input.disabled = browse.disabled = true;
                    return;
                }
                input.disabled = browse.disabled = !state.controller;
                selected.textContent = state.selected().map(function (node) {
                    return node.getLabel ? node.getLabel() : node.label || node.id;
                }).join(" / ");
                status.textContent = state.error ? state.error.message :
                    state.controller ? "" : "분류 선택 화면을 준비하고 있습니다…";
            });
            browse.addEventListener("click", function () {
                try { adapter.browse(); } catch (error) { status.textContent = error.message; }
            });
            input.addEventListener("input", function () {
                clearTimeout(self.zcaSearchTimer);
                var request = ++self.zcaRequest;
                var text = input.value.trim();
                results.replaceChildren();
                if (text.length < 3) return;
                self.zcaSearchTimer = setTimeout(function () {
                    status.textContent = "검색 중…";
                    adapter.search(text).then(function (nodes) {
                        if (self.zcaDisposed || request !== self.zcaRequest) return;
                        status.textContent = nodes.length ? "" : "검색 결과가 없습니다.";
                        nodes.forEach(function (node) {
                            var button = document.createElement("button");
                            button.type = "button";
                            button.className = "zca-library-result";
                            button.textContent = node.getLabel();
                            button.addEventListener("click", function () {
                                button.disabled = true;
                                adapter.add(node).then(function () {
                                    if (self.zcaDisposed) return;
                                    input.value = "";
                                    ++self.zcaRequest;
                                    results.replaceChildren();
                                    status.textContent = "분류 탭에서 속성값을 입력하세요.";
                                }).catch(function (error) {
                                    if (self.zcaDisposed) return;
                                    button.disabled = false;
                                    status.textContent = error.message || String(error);
                                });
                            });
                            results.appendChild(button);
                        });
                    }).catch(function (error) {
                        if (!self.zcaDisposed && request === self.zcaRequest) {
                            status.textContent = error.message || String(error);
                        }
                    });
                }, 400);
            });
}
function zcaDestroyPropertiesPicker(facet) {

            facet.zcaDisposed = true;
            ++facet.zcaRequest;
            clearTimeout(facet.zcaSearchTimer);
            if (facet.zcaUnsubscribe) facet.zcaUnsubscribe();
            if (facet.zcaRoot) facet.zcaRoot.remove();

}

/* [3] 모듈: DS/ENONewWidget/ENONew/Controller/ENONewDialogController
   아래 함수를 이 factory 내부에 추가합니다.
   기존 destroy() 첫 줄에:
       zcaDisposeDialogBridge(this);
   기존 myDialog/immersiveFrame 파괴 및 _parent 호출은 그대로 유지합니다.
*/
function zcaDisposeDialogBridge(dialog) {
    var facets = dialog.View && dialog.View.facets;
    var bridges = new Set();
    (facets || []).forEach(function (facet) {
        if (facet.options && facet.options.zcaBridge) {
            bridges.add(facet.options.zcaBridge);
        }
    });
    bridges.forEach(function (bridge) { bridge.dispose(); });
}
