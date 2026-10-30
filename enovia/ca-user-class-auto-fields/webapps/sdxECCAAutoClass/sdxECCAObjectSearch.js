/** sdxECModel: OOTB 자동완성/6W 선택 결과만 저장하고 검색어는 저장하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAObjectSearch", ["require"], function (require) {
    "use strict";
    var MODEL_TYPE = "sdxMTopAssy";
    function install(facet, session, config) {
        if (session.type !== "sdxECChangeAction" || config.enabled === false || config.enabled === "false") return function () {};
        var disposed = false, search = null, loading = false, observer = null, mounted = null, toolkit = null;
        var inputRevision = 0, requestNumber = 0, chooserNumber = 0, detailNumber = 0, candidates = new Map(), synchronizing = false;
        var valueField = config.valueField || "name";
        function closed() { return disposed || session.disposed || session.transitioning || session.status === "error"; }
        function read(field, key) {
            var value = field && typeof field.get === "function" ? field.get(key) : undefined;
            return value != null ? value : field && field[key];
        }
        function fieldModel() {
            var model = facet.listview && facet.listview.propModel;
            var fields = model && typeof model.getAttributeFromField === "function" && model.getAttributeFromField("name", "sdxECModel");
            return fields && fields[0];
        }
        function message(text) { if (mounted) mounted.error.textContent = text; }
        function write(value) {
            var current = fieldModel();
            if (!toolkit || !current || read(current, "readOnly") || read(current, "visible") === false) return;
            if (read(current, "valueDB") === value && read(current, "value") === value) return;
            var updated = new toolkit.AttributeModel(current);
            updated.set("value", value); updated.set("valueDB", value);
            updated.set("isModified", true); updated.set("isUIModified", true);
            facet.listview.propModel.set(current.getIdentifier(), updated);
        }
        function forget() {
            detailNumber++; session.modelSearchLoading = false;
            session.modelSearchSelection = null; write("");
        }
        function syncNode(record) {
            if (!mounted || !mounted.auto) return;
            synchronizing = true;
            try {
                var node;
                if (record) {
                    node = new toolkit.Node({label: record.title || record.name, value: record.id,
                        name: record.name, searchText: (record.title || "") + " " + record.name, grid: {name: record.name}});
                    candidates.set(node, {record: record, revision: inputRevision});
                }
                mounted.auto.selectedItems = node;
            } finally { synchronizing = false; }
        }
        function accept(record) {
            if (closed()) return;
            var current = fieldModel(), value = record && record[valueField];
            if (!current || read(current, "readOnly") || read(current, "visible") === false) return;
            if (!record || record.type !== MODEL_TYPE || typeof value !== "string" || !value) {
                message("검색 결과에 저장할 " + valueField + " 값이 없습니다."); return;
            }
            requestNumber++; chooserNumber++;
            forget();
            var number = detailNumber, revision = inputRevision, context = session.context;
            function stale() { return closed() || number !== detailNumber || revision !== inputRevision || context !== session.context; }
            session.modelSearchLoading = true;
            syncNode(record); message("모델 속성을 조회하고 있습니다.");
            Promise.resolve().then(function () {
                if (stale()) return null;
                return toolkit.Service.readAttributes({id: record.id, tenant: session.tenant,
                    securityContext: context, isCancelled: stale});
            }).then(function (details) {
                if (stale() || !details) return;
                current = fieldModel();
                if (!current || read(current, "readOnly") || read(current, "visible") === false) {
                    forget(); return;
                }
                record = Object.assign({}, record, {name: details.name, attributes: details.attributes});
                value = record[valueField];
                if (typeof value !== "string" || !value) throw new Error("모델의 저장값을 확인해 주세요.");
                // 필드별 자동 채움은 여기서 record.attributes["속성명"]을 사용합니다.
                session.modelSearchSelection = {id: record.id, type: MODEL_TYPE, value: value, context: context, record: record};
                session.modelSearchLoading = false;
                write(value); syncNode(record); message("");
            }).catch(function (error) {
                if (stale()) return;
                forget(); syncNode(null); message(error.message || "모델 속성을 조회하지 못했습니다.");
            });
        }
        function onSelection() {
            if (closed() || synchronizing || !mounted || !mounted.auto) return;
            var node = mounted.auto.selectedItems;
            if (Array.isArray(node)) node = node.length === 1 ? node[0] : null;
            if (!node) { inputRevision++; requestNumber++; chooserNumber++; candidates.clear(); forget(); return; }
            var proof = candidates.get(node);
            if (!proof || proof.revision !== inputRevision) { forget(); syncNode(null); return; }
            accept(proof.record);
        }
        // Capture runs before the native LineEditor input listener. Clearing selection can reset
        // its DOM value, so restore the user's query before the OOTB listener consumes the event.
        function onInput(event) {
            if (closed() || synchronizing || !event.target || typeof event.target.value !== "string") return;
            var query = event.target.value;
            inputRevision++; requestNumber++; chooserNumber++; candidates.clear();
            forget(); syncNode(null);
            event.target.value = query;
            message("");
        }
        function stopEnter(event) { if (event.keyCode === 13 || event.key === "Enter") event.stopPropagation(); }
        function query(text) {
            var tree = new toolkit.Tree(), revision = inputRevision, number = ++requestNumber;
            if (closed() || typeof text !== "string" || text.trim().length < 3) return Promise.resolve(tree);
            return toolkit.Service.search({query: text, tenant: session.tenant, securityContext: session.context,
                isCancelled: function () { return closed() || revision !== inputRevision || number !== requestNumber; }
            }).then(function (records) {
                if (closed() || revision !== inputRevision || number !== requestNumber) return tree;
                records.forEach(function (record) {
                    var node = new toolkit.Node({label: record.title || record.name, value: record.id,
                        name: record.name, searchText: (record.title || "") + " " + record.name, grid: {name: record.name}});
                    candidates.set(node, {record: record, revision: revision}); tree.addRoot(node);
                });
                message(""); return tree;
            }).catch(function (error) {
                if (!closed() && revision === inputRevision && number === requestNumber) message(error.message || "모델 검색에 실패했습니다.");
                return tree;
            });
        }
        function chooserResult(objects, revision, number) {
            if (closed() || revision !== inputRevision || number !== chooserNumber || !objects || !objects.length) return;
            if (objects.length !== 1) { message("객체를 하나만 선택해 주세요."); return; }
            var record = toolkit.Service.normalize(objects[0]);
            if (!record) { message("검색 결과의 객체 ID·이름·타입을 확인해 주세요."); return; }
            accept(record);
        }
        function launch() {
            if (closed() || loading || !toolkit) return;
            message("");
            var revision = inputRevision, number = ++chooserNumber;
            function open() {
                if (closed() || revision !== inputRevision || number !== chooserNumber) return;
                try {
                    search.launchSearch({title: "모델 선택", allowedTypes: MODEL_TYPE,
                        criteria: "", multiSel: false, defaultMode: false, default_with_precond: true,
                        in_apps_callback: function (objects) { chooserResult(objects, revision, number); }});
                } catch (error) { message("객체 검색을 열지 못했습니다: " + error.message); }
            }
            if (search) { open(); return; }
            loading = true;
            require(["DS/ENOXSearchUIController/ENOXSearchUIController"], function () {
                if (closed()) { loading = false; return; }
                require(["DS/ENOXSearchUIController/ObjectOpenSearchUtil"], function (SearchUtil) {
                    loading = false;
                    if (closed()) return;
                    try { search = Object.create(SearchUtil); search.initialize(); open(); }
                    catch (error) { message("객체 검색 초기화에 실패했습니다: " + error.message); }
                }, function () { loading = false; message("객체 검색 모듈을 불러오지 못했습니다."); });
            }, function () { loading = false; message("객체 검색 번들을 불러오지 못했습니다."); });
        }
        function unmount() {
            if (!mounted) return;
            inputRevision++; requestNumber++; chooserNumber++; detailNumber++; session.modelSearchLoading = false; candidates.clear();
            mounted.button.removeEventListener("click", launch);
            if (mounted.auto) {
                var content = mounted.auto.getContent();
                content.removeEventListener("input", onInput, true);
                content.removeEventListener("keydown", stopEnter);
                content.removeEventListener("keyup", stopEnter);
                mounted.auto.removeEventListener("change", onSelection);
                mounted.auto.destroy();
            }
            mounted.originals.forEach(function (entry) { entry.node.style.display = entry.display; });
            mounted.inputs.forEach(function (entry) { entry.node.readOnly = entry.readOnly; });
            [mounted.host, mounted.button, mounted.error].forEach(function (node) { if (node.parentNode) node.parentNode.removeChild(node); });
            mounted.target.classList.remove("sdxECCAObjectSearchValue"); mounted = null;
        }
        function targetElement(current) {
            var result = null, ui = facet.listview && facet.listview.propUI;
            var section = ui && ui.getFormSection && ui.getFormSection();
            var organizers = section && typeof section.getOrganizers === "function" && section.getOrganizers();
            Object.keys(organizers || {}).forEach(function (key) {
                (organizers[key]._forms || []).forEach(function (form) {
                    (form.fields || []).forEach(function (line) {
                        if (line._idAttr === current.getIdentifier()) {
                            var flex = line.elements && line.elements.flexLine;
                            result = flex && flex.querySelector(".formValue");
                        }
                    });
                });
            });
            return result;
        }
        function mount() {
            if (closed()) return;
            var current = fieldModel();
            var target = current && !read(current, "readOnly") && read(current, "visible") !== false ? targetElement(current) : null;
            if (mounted && (mounted.target !== target || mounted.host.parentNode !== target)) unmount();
            if (!target) return;
            if (!mounted) {
                var host = document.createElement("div"), button = document.createElement("button"), error = document.createElement("span");
                host.className = "sdxECCAObjectSearchAutoComplete"; host.style.flex = "1"; host.style.minWidth = "0";
                button.type = "button"; button.className = "sdxECCAObjectSearchButton"; button.title = "모델 검색";
                button.setAttribute("aria-label", "모델 검색"); button.disabled = true;
                var icon = document.createElement("span"); icon.className = "fonticon fonticon-search"; icon.setAttribute("aria-hidden", "true"); button.appendChild(icon);
                error.className = "sdxECCAObjectSearchError"; error.setAttribute("role", "alert");
                var originals = Array.from(target.children).map(function (node) { return {node: node, display: node.style.display}; });
                var inputs = Array.from(target.querySelectorAll("input, textarea")).map(function (node) { var entry = {node: node, readOnly: node.readOnly}; node.readOnly = true; return entry; });
                mounted = {target: target, host: host, button: button, error: error, originals: originals, inputs: inputs, auto: null};
                target.classList.add("sdxECCAObjectSearchValue"); button.addEventListener("click", launch);
                target.appendChild(host); target.appendChild(button); target.appendChild(error);
            }
            // OOTB가 같은 formValue 아래 tweaker를 다시 그려도 원래 편집기는 노출하지 않습니다.
            Array.from(target.children).forEach(function (node) {
                if (node === mounted.host || node === mounted.button || node === mounted.error) return;
                if (!mounted.originals.some(function (entry) { return entry.node === node; })) {
                    mounted.originals.push({node: node, display: node.style.display});
                }
                if (mounted.auto) node.style.display = "none";
            });
            if (!toolkit || mounted.auto) return;
            var auto = new toolkit.AutoComplete({multiSearchMode: false, allowFreeInputFlag: false,
                allowResetToUndefinedByUIFlag: true, keepSearchResultsFlag: false,
                minLengthBeforeSearch: 3, typeDelayBeforeSearch: 300,
                placeholder: "모델 검색", elementsTree: query,
                defaultFilterOptions: {property: "searchText", type: "contains"}});
            mounted.auto = auto; auto.inject(mounted.host);
            auto.addEventListener("change", onSelection);
            auto.getContent().addEventListener("input", onInput, true);
            auto.getContent().addEventListener("keydown", stopEnter);
            auto.getContent().addEventListener("keyup", stopEnter);
            mounted.originals.forEach(function (entry) { entry.node.style.display = "none"; });
            mounted.button.disabled = false;
            var chosen = session.modelSearchSelection;
            if (chosen && chosen.context === session.context) { write(chosen.value); syncNode(chosen.record); }
            else forget();
        }
        function report(error) {
            if (closed()) return;
            message("모델 검색을 불러오지 못했습니다. 선택하지 않으면 빈 값으로 저장됩니다.");
            console.error("[sdxECCAObjectSearch] 검색 연결 실패", error);
        }
        if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(function () { try { mount(); } catch (error) { observer.disconnect(); report(error); } });
            observer.observe(facet.skeleton, {childList: true, subtree: true});
        }
        try {
            mount();
            require(["DS/WUXAutoComplete/AutoComplete", "DS/TreeModel/TreeDocument", "DS/TreeModel/TreeNodeModel",
                "DS/EditPropWidget/models/EditPropAttributeModel", "DS/sdxECCAAutoClass/sdxECCAModelSearchService"],
                function (AutoComplete, Tree, Node, AttributeModel, Service) {
                    if (closed()) return;
                    toolkit = {AutoComplete: AutoComplete, Tree: Tree, Node: Node, AttributeModel: AttributeModel, Service: Service};
                    try { mount(); } catch (error) { report(error); }
                }, report);
        } catch (error) { report(error); }
        return function () {
            disposed = true;
            if (observer) observer.disconnect();
            unmount();
            if (search && search.socket) search.destroy();
            search = null; session.modelSearchSelection = null; session.modelSearchLoading = false;
        };
    }
    return {install: install};
});
