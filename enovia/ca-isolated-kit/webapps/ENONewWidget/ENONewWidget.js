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
    // "move": fields only in Properties; "both": same form in the active tab.
    properties.options.zcaClassFieldsMode = "move";
    classification.options.zcaBridge = bridge;
    classification.alwaysCalled = true;
}

/* [2] 모듈: DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
   아래 ZcaLibraryAdapter와 입력창/속성 폼 관련 함수들을 이 factory 내부에 추가합니다.
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
    var session = options.zcaBridge;
    var adapter = new ZcaLibraryAdapter(session);
    var fieldsMode = options.zcaClassFieldsMode || "move";
    if (fieldsMode !== "move" && fieldsMode !== "both") {
        throw new Error("zcaClassFieldsMode는 move 또는 both여야 합니다.");
    }
    facet.zcaDisposed = false;
    var root = document.createElement("div");
    root.className = "classificationPLMNewContainer zca-library-picker";
    var status = document.createElement("div");
    status.setAttribute("role", "status");
    root.appendChild(status);
    facet.skeleton.appendChild(root);
    facet.zcaRoot = root;
    function setStatus(message) {
        status.textContent = message || "";
        status.style.display = message ? "" : "none";
    }
    setStatus("분류 선택 화면을 준비하고 있습니다…");

    // Existing AMD factory dependencies do not need new positional arguments.
    require([
        "DS/WUXAutoComplete/AutoComplete",
        "DS/TreeModel/TreeDocument",
        "DS/TreeModel/TreeNodeModel",
        "DS/Controls/Button",
        "DS/Controls/Popup",
        "DS/Controls/TooltipModel",
        "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel",
        "i18n!DS/LibraryActive/assets/nls/LibraryActive",
        "css!DS/ClassificationsFacet/ClassificationsFacet.css"
    ], function (AutoComplete, TreeDocument, TreeNodeModel, Button, Popup, TooltipModel, Nls, LibraryNls) {
        if (facet.zcaDisposed || session.disposed) return;
        function element(className, parent) {
            var result = document.createElement("div");
            result.className = className;
            parent.appendChild(result);
            return result;
        }
        var container = element("plmnew-autocomplete-container", root);
        var labelHost = element("plmnew-autocomplete-label", container);
        var label = document.createElement("label");
        label.textContent = LibraryNls.name_Section_AllLibraries;
        labelHost.appendChild(label);
        var line = element("plmnew-autocomplete-line", container);
        var inputHost = element("plmnew-autocomplete", line);
        var browseHost = element("plmnew-button-browse", line);
        var synchronizing = false;
        var busy = false;
        var picker = new AutoComplete({
            elementsTree: new TreeDocument(),
            placeholder: Nls.search,
            typeDelayBeforeSearch: 400,
            keepSearchResultsFlag: false,
            multiSearchMode: true,
            minLengthBeforeSearch: 0,
            allowFreeInputFlag: false,
            selectedItems: [],
            disabled: true,
            popupSizeAdjustPolicy: Popup.SizeAdjustPolicyEnum.NoAdjust,
            columnOptions: {autoRowHeightFlag: true, typeRepresentation: "detailedUser"}
        }).inject(inputHost);
        facet.zcaPicker = picker;

        function nodeId(node) { return node.getID ? node.getID() : node.id; }
        function signature(nodes) {
            return JSON.stringify(nodes.map(nodeId).sort());
        }
        function mirrorNode(node) {
            // Do not share selected TreeNodeModel instances between the two views.
            var id = nodeId(node);
            var title = node.getLabel ? node.getLabel() : node.options.label;
            var ctrl = session.controller;
            var path = ctrl._classPathMap && ctrl._classPathMap.get(id);
            var mirror = new TreeNodeModel({
                label: title, customNode: true, isSelectable: true,
                icons: node.options.icons,
                value: {label: title, subLabel: path || ""}
            });
            mirror.id = id;
            mirror.plmType = node.plmType;
            mirror.getID = function () { return id; };
            mirror.getLabel = function () { return title; };
            return mirror;
        }
        function syncFromController() {
            if (facet.zcaDisposed || session.disposed || !session.controller || busy) return;
            if (signature(picker.selectedItems || []) === signature(session.selected())) return;
            synchronizing = true;
            try { picker.selectedItems = session.selected().map(mirrorNode); }
            finally { synchronizing = false; }
        }
        var browse = new Button({
            displayStyle: "lite",
            label: Nls.tooltip_browse,
            showLabelFlag: false,
            disabled: true,
            icon: {iconName: "open-in-a-new-window", fontIconFamily: 1},
            onClick: function () {
                try {
                    if (typeof options.zcaOpenClassSelector === "function") {
                        // Optional custom receiving hook, not an OOTB API option.
                        options.zcaOpenClassSelector(
                            session.controller, options.zcaSelectorParameters || {}
                        );
                    } else if (options.zcaSelectorParameters) {
                        throw new Error("파라미터를 처리할 zcaOpenClassSelector를 연결해 주세요.");
                    } else { adapter.browse(); }
                } catch (error) { setStatus(error.message || String(error)); }
            }
        }).inject(browseHost);
        browse.tooltipInfos = new TooltipModel({shortHelp: Nls.tooltip_browse});
        facet.zcaBrowseButton = browse;
        root.appendChild(status);
        var fieldsHost = element("zca-class-fields", root);
        fieldsHost.style.width = "100%";
        fieldsHost.style.height = "360px";
        fieldsHost.style.display = "none";
        facet.zcaFieldsHost = fieldsHost;

        picker.elementsTree = function (text) {
            var empty = new TreeDocument();
            text = String(text || "").trim();
            if (facet.zcaDisposed || session.disposed || !session.controller) {
                return Promise.resolve(empty);
            }
            if (/[*+?()[\]\"]/.test(text)) {
                picker.customFilterMessage = '특수문자 * + ? ( ) [ ] " 는 사용할 수 없습니다.';
                return Promise.resolve(empty);
            }
            if (text.length < 3) {
                picker.customFilterMessage = Nls.autoCompleteFilterMessage.minimum_3_characters_search;
                return Promise.resolve(empty);
            }
            picker.customFilterMessage = Nls.autoCompleteFilterMessage.no_objects_found;
            return adapter.search(text).then(function (nodes) {
                if (facet.zcaDisposed || session.disposed) return empty;
                var tree = new TreeDocument();
                nodes.forEach(function (node) { tree.addRoot(node); });
                return tree;
            }).catch(function (error) {
                if (!facet.zcaDisposed) setStatus(error.message || String(error));
                return empty;
            });
        };
        facet.zcaChangeHandler = function () {
            if (synchronizing || busy || facet.zcaDisposed ||
                session.disposed || !session.controller) return;
            var desired = (picker.selectedItems || []).slice();
            var actual = session.selected().slice();
            if (signature(desired) === signature(actual)) return;
            var desiredIds = new Set(desired.map(nodeId));
            var actualIds = new Set(actual.map(nodeId));
            var added = desired.filter(function (node) { return !actualIds.has(nodeId(node)); });
            var removed = actual.filter(function (node) { return !desiredIds.has(nodeId(node)); });
            busy = true;
            picker.disabled = browse.disabled = true;
            // Serialize adds: the original path service cancels overlapping requests.
            var work = Promise.resolve();
            added.forEach(function (node) {
                work = work.then(function () {
                    if (!session.disposed) return adapter.add(node);
                });
            });
            work.then(function () {
                if (session.disposed) return;
                removed.forEach(function (node) { node.unselect(); });
                setStatus("");
            }).catch(function (error) {
                if (!facet.zcaDisposed) setStatus(error.message || String(error));
            }).finally(function () {
                busy = false;
                if (facet.zcaDisposed || session.disposed) return;
                picker.disabled = browse.disabled = !session.controller;
                syncFromController();
            });
        };
        picker.addEventListener("change", facet.zcaChangeHandler);
        facet.zcaUnsubscribe = session.subscribe(function (state) {
            if (state.disposed) { zcaDestroyPropertiesPicker(facet); return; }
            picker.disabled = browse.disabled = busy || !state.controller;
            var fieldsError = null;
            if (state.controller) {
                try { zcaRenderClassFields(facet, state, fieldsMode); }
                catch (error) { fieldsError = error.message; }
            }
            setStatus(fieldsError || (state.error ? state.error.message : state.controller ? "" :
                "분류 선택 화면을 준비하고 있습니다…"));
            syncFromController();
        });
    }, function (error) {
        if (!facet.zcaDisposed) setStatus("기존 UI 컴포넌트 로딩 실패: " + error.message);
    });
}

function zcaRenderClassFields(facet, session, mode) {
    if (facet.zcaDisposed || session.disposed || !session.controller) return;
    var ctrl = session.controller;
    // Existing live form containing ClassifPropWidget, including editable tweakers.
    var form = ctrl.accordeonCon;
    if (!form || form.nodeType !== 1 || !ctrl.classifPropertiesView) {
        throw new Error("기존 분류 속성 폼의 accordeonCon을 확인해 주세요.");
    }
    var binding = facet.zcaFieldsBinding;
    if (!binding) {
        if (!form.parentNode) throw new Error("기존 분류 속성 폼이 아직 연결되지 않았습니다.");
        binding = facet.zcaFieldsBinding = {
            form: form, originalParent: form.parentNode, originalNext: form.nextSibling
        };
    } else if (binding.form !== form) {
        throw new Error("분류 폼이 재초기화되었습니다. 생성 화면을 다시 열어 주세요.");
    }
    var inProperties = mode === "move" ||
        !session.zcaActiveFacet || session.zcaActiveFacet === "ENOCreate";
    if (inProperties) {
        if (form.parentNode !== facet.zcaFieldsHost) {
            var active = document.activeElement;
            if (active && form.contains(active) && typeof active.blur === "function") active.blur();
            facet.zcaFieldsHost.appendChild(form);
        }
    } else { zcaRestoreClassFields(facet); }
    facet.zcaFieldsHost.style.display = inProperties && session.selected().length ? "" : "none";
    clearTimeout(facet.zcaFieldsResizeTimer);
    facet.zcaFieldsResizeTimer = setTimeout(function () {
        if (!facet.zcaDisposed && !session.disposed &&
            typeof ctrl.classifPropertiesView.onInnerResize === "function") {
            ctrl.classifPropertiesView.onInnerResize();
        }
    }, 0);
}

function zcaRestoreClassFields(facet) {
    var binding = facet.zcaFieldsBinding;
    if (!binding || !binding.originalParent) return;
    if (binding.form.parentNode !== binding.originalParent) {
        var active = document.activeElement;
        if (active && binding.form.contains(active) && typeof active.blur === "function") active.blur();
        if (binding.originalNext && binding.originalNext.parentNode === binding.originalParent) {
            binding.originalParent.insertBefore(binding.form, binding.originalNext);
        } else { binding.originalParent.appendChild(binding.form); }
    }
}

function zcaDestroyPropertiesPicker(facet) {
    if (facet.zcaDisposed) return;
    facet.zcaDisposed = true;
    clearTimeout(facet.zcaFieldsResizeTimer);
    // Return the live OOTB form before removing our UI. Do not destroy its model.
    zcaRestoreClassFields(facet);
    facet.zcaFieldsBinding = null;
    if (facet.zcaUnsubscribe) facet.zcaUnsubscribe();
    if (facet.zcaPicker) {
        if (facet.zcaChangeHandler) {
            facet.zcaPicker.removeEventListener("change", facet.zcaChangeHandler);
        }
        facet.zcaPicker.destroy();
    }
    if (facet.zcaBrowseButton) facet.zcaBrowseButton.destroy();
    if (facet.zcaRoot) facet.zcaRoot.remove();
}

/* [3] 모듈: DS/ENONewWidget/ENONew/Controller/ENONewDialogController
   아래 함수를 이 factory 내부에 추가합니다.
   기존 destroy() 첫 줄에:
       zcaDisposeDialogBridge(this);
   기존 myDialog/immersiveFrame 파괴 및 _parent 호출은 그대로 유지합니다.
   both 모드를 위해 기존 onTabChange 콜백의 manageButtons 다음에 추가:
       zcaSelectFieldsTab(n, e); // 참조 소스: n=DialogController, e=선택 facet
   예: onTabChange: function(e) { n.manageButtons(e); zcaSelectFieldsTab(n, e); }
*/
function zcaSelectFieldsTab(dialog, selectedFacet) {
    var name = selectedFacet && selectedFacet.facet && selectedFacet.facet.name;
    if (!name) return;
    var facets = dialog.View && dialog.View.facets;
    var bridges = new Set();
    (facets || []).forEach(function (facet) {
        if (facet.options && facet.options.zcaBridge) bridges.add(facet.options.zcaBridge);
    });
    bridges.forEach(function (bridge) {
        if (!bridge.disposed) {
            bridge.zcaActiveFacet = name;
            bridge.notify();
        }
    });
}

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


