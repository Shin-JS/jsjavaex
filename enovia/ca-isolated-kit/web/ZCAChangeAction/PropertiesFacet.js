define("ZCAChangeAction/PropertiesFacet", [
    "DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet",
    "ZCAChangeAction/LibraryAdapter",
    "ZCAChangeAction/Config",
    "css!ZCAChangeAction/style.css"
], function (Base, Adapter, Config) {
    "use strict";
    return Base.extend({
        init: function (options) {
            this._parent(options);
            var self = this;
            var session = options.zcaSession;
            var adapter = new Adapter(session);
            this.zcaDisposed = false;
            this.zcaRequest = 0;
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
            this.skeleton.appendChild(root);
            this.zcaRoot = root;
            this.zcaUnsubscribe = session.subscribe(function (state) {
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
                }, Config.searchDelayMs);
            });
        },
        destroy: function () {
            this.zcaDisposed = true;
            ++this.zcaRequest;
            clearTimeout(this.zcaSearchTimer);
            if (this.zcaUnsubscribe) this.zcaUnsubscribe();
            if (this.zcaRoot) this.zcaRoot.remove();
            this._parent();
        }
    });
});
