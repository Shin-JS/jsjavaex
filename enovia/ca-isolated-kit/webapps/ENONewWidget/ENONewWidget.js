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
/**
 * [역할] 한 생성 대화상자의 속성 facet과 분류 facet을 연결하는 객체를 만듭니다.
 * [왜 필요한가] 서로 다른 AMD factory/facet의 지역변수는 직접 공유되지 않습니다.
 * 두 facet의 options에 이 객체를 같은 참조로 넣으면 기존 분류 컨트롤러에 함께 접근할 수 있습니다.
 * [수명] 대화상자마다 새로 생성하며 화면을 닫으면 dispose합니다. 전역 선택 목록이 아닙니다.
 */
function zcaCreateBridge() {
/**
 * controller: 실제 클래스 선택/속성 모델을 관리하는 기존 라이브러리 컨트롤러입니다.
 * listeners: 그 컨트롤러 준비나 선택 변경을 전달할 UI 구독 함수들입니다.
 * disposed: 종료 여부입니다. 늦게 도착한 응답이 닫힌 화면에 반영되는 것을 차단합니다.
 * cleanup: 기존 AutoComplete에 연결한 change 리스너를 해제하는 함수입니다.
 * error: 초기화 실패를 속성 탭에 표시하기 위한 값입니다.
 */
    function Session() {
        this.controller = null;
        this.listeners = new Set();
        this.disposed = false;
        this.cleanup = null;
        this.error = null;
    }
/**
 * listener는 bridge 상태를 받아 선택 UI/속성 폼 표시를 갱신하는 함수입니다.
 * 등록 즉시 한 번 호출하는 이유는 컨트롤러가 이미 준비된 경우에도 현재 상태를 표시하기 위해서입니다.
 * 반환한 함수는 구독 해제용입니다. 화면 종료 시 호출해야 리스너가 남지 않습니다.
 */
    Session.prototype.subscribe = function (listener) {
        this.listeners.add(listener);
        listener(this);
        var self = this;
        return function () { self.listeners.delete(listener); };
    };
/**
 * notify는 현재 bridge를 구독자에게 전달합니다. 데이터를 서버에 저장하는 함수가 아닙니다.
 * 기존 선택창의 change 이벤트나 초기화 완료가 발생했을 때 UI에 다시 읽을 기회를 줍니다.
 */
    Session.prototype.notify = function () {
        if (!this.disposed) this.listeners.forEach(function (fn) { fn(this); }, this);
    };
/**
 * 비동기 초기화가 끝난 컨트롤러를 등록하고 선택 UI에 준비 완료를 알립니다.
 * 다른 컨트롤러를 같은 bridge에 다시 붙이지 못하게 하는 검사는 두 생성 화면의 상태 혼합을 막습니다.
 */
    Session.prototype.attach = function (controller) {
        if (this.disposed) return;
        if (this.controller && this.controller !== controller) {
            throw new Error("한 생성 대화상자에 두 분류 컨트롤러를 연결할 수 없습니다.");
        }
        this.controller = controller;
        this.error = null;
        this.notify();
    };
/**
 * 기존 컨트롤러의 selectedItems를 읽습니다. bridge 안에 독립적인 선택 목록을 만들지 않습니다.
 * 반환 배열을 직접 고치는 대신 adapter의 선택/해제 경로를 사용해야 기존 속성 모델 갱신이 이어집니다.
 */
    Session.prototype.selected = function () {
        var ctrl = this.controller;
        return ctrl && ctrl.autoComplete ? ctrl.autoComplete.selectedItems || [] : [];
    };
/**
 * 기존 change 리스너를 정리한 뒤 구독자에게 종료를 알립니다.
 * 종료 알림을 먼저 보내야 속성 탭의 추가 UI도 파괴될 수 있습니다.
 * 그 다음 참조를 비웁니다. 이미 만들어진 CA를 삭제하는 처리는 아닙니다.
 */
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
/**
 * [인자] data는 생성 폼 데이터이며 defaultAttributes.Type.value에서 현재 타입을 읽습니다.
 * facetList는 getFacetList가 구성한 최종 facet 배열입니다. 해당 함수 안에서 반환 직전에 전달해야 합니다.
 * [역할] 적용 대상인지 검사한 뒤 ENOCreate와 classificationFacet에 같은 bridge 참조를 넣습니다.
 * 이 연결이 빠지면 zcaInstallPropertiesPicker의 options.zcaBridge가 undefined입니다.
 */
function zcaAttachBridge(data, facetList) {
/**
 * 이 저장소는 활성화 값 + 예시 신규 타입으로 적용 범위를 제한합니다.
 * 로컬에서 Change Action을 시험했다면 타입 비교 문자열을 실제 타입에 맞추되,
 * 다른 위젯에 적용하지 않으려면 위젯 활성화 검사를 유지해야 합니다.
 * 활성화 값은 대상 위젯 전용 진입 HTML의 onLoad에서만 설정합니다.
 */
    var enabled = typeof widget !== "undefined" &&
        widget.getValue("zcaEnableLibraryInProperties");
    var currentType = data && data.defaultAttributes &&
        data.defaultAttributes.Type && data.defaultAttributes.Type.value;
    if (!(enabled === true || enabled === "true") ||
        currentType !== "ZCA Change Action") return;
/**
 * classification/properties는 facet 인스턴스가 아니라 모듈 경로와 options를 가진 정의 객체입니다.
 * 분류 facet이 없으면 사용할 기존 분류 컨트롤러도 없으므로 연결하지 않습니다.
 * 두 변수는 이 함수 안에서만 유효합니다. 다른 factory의 로그에서도 그대로 사용할 수 없습니다.
 */
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
/**
 * 같은 객체를 두 번 전달합니다. 객체를 복사해 별도의 bridge를 두면 notify/선택 상태가 연결되지 않습니다.
 * alwaysCalled는 분류 탭을 클릭하기 전에도 기존 인프라가 facet을 초기화하도록 사용하는 설정입니다.
 * 설치 버전에서 실제 초기화 순서는 별도로 확인해야 합니다.
 */
    properties.options.zcaBridge = bridge;
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
/**
 * [역할] 추가한 WUX 선택창과 기존 라이브러리 컨트롤러 사이의 호출을 모읍니다.
 * 선택 UI 함수 안에 서비스 요청을 섞지 않고, 검색/선택 전달을 한곳에서 수정할 수 있게 합니다.
 * 새 분류 컨트롤러나 새 클래스 속성 모델을 만드는 클래스는 아닙니다.
 */
    function ZcaLibraryAdapter(session) { this.session = session; }
/**
 * 아직 준비되지 않았거나 종료된 컨트롤러를 사용하지 않도록 공통으로 검사합니다.
 * 새 필드 UI의 초기화와 기존 라이브러리 컴포넌트의 준비 시점이 다르기 때문에 필요합니다.
 */
    ZcaLibraryAdapter.prototype.controller = function () {
        if (this.session.disposed || !this.session.controller) {
            throw new Error("분류 컨트롤러가 아직 준비되지 않았습니다.");
        }
        return this.session.controller;
    };
/**
 * text는 사용자가 입력한 검색어입니다. 반환값은 검색 결과 TreeNodeModel 배열을 담은 Promise입니다.
 * alreadyPresentIDs에 이미 선택한 클래스 ID를 보내 중복 검색 결과를 줄입니다.
 * 검색 결과만 만드는 단계이며 여기서는 클래스 연결이나 속성 저장을 하지 않습니다.
 */
    ZcaLibraryAdapter.prototype.search = function (text) {
        var ctrl = this.controller();
        var selectedIds = this.session.selected().map(function (item) { return item.id; });
        return new Promise(function (resolve, reject) {
            ctrl.PLMNewCommonWebService.flattenedSearch({
                searchKey: text, alreadyPresentIDs: selectedIds, nresults: 10,
                onComplete: function (response) {
                    if (!response || !response.results) { resolve([]); return; }
/**
 * 기존 검색 응답을 기존 노드 생성 도구로 변환합니다.
 * 이 노드에는 ID/라벨/타입/아이콘 등 선택에 필요한 정보가 들어 있습니다.
 * couldBeSelected로 General Class 등 기존 컨트롤러가 허용하는 대상만 반환합니다.
 */
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
/**
 * node는 추가 선택창에서 고른 클래스 노드입니다. label 문자열만 전달하지 않습니다.
 * 기존 컨트롤러에 노드를 넣고 select()를 실행해야 기존 change 이벤트가 속성 모델 생성으로 이어집니다.
 * 여기서 resolve되는 것은 선택 반영이지, 클래스 속성 조회 완료나 서버 저장 완료가 아닙니다.
 */
    ZcaLibraryAdapter.prototype.add = function (node) {
        var self = this;
        var ctrl = this.controller();
        var id = node.getID();
        if (!ctrl.couldBeSelected(node.plmType)) {
            return Promise.reject(new Error("클래스를 선택해 주세요."));
        }
/**
 * 같은 클래스를 또 넣지 않도록 선택 전에 검사합니다.
 * 아래 경로 조회는 비동기이므로 응답 뒤에도 같은 검사를 한 번 더 합니다.
 */
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
/**
 * 기존 컨트롤러가 속성 폼의 클래스 제목/경로/용도 표시에서 사용하는 자료를 채웁니다.
 * _classPathMap/_classNameMap 같은 내부 필드는 버전에 따라 달라질 수 있어 확인이 필요합니다.
 */
                        ctrl._classPathMap.set(id, paths.get(id));
                        ctrl._classNameMap.set(id, node.getLabel());
                        if (node.options.classUsage) {
                            ctrl._classUsageMap.set(id, node.options.classUsage);
                        }
                        ctrl.classifPropertiesUI.setClassPath(ctrl.getClassPath());
                        ctrl.classifPropertiesUI.setClassUsage(ctrl.getClassUsage());
/**
 * 기존 노드 모델에 변경을 준비하고, 새 노드를 넣고, 변경을 확정한 뒤 선택합니다.
 * 마지막 select()가 기존 클래스 선택 처리를 작동시키는 핵심입니다.
 * 이 블록을 selectedItems 배열 대입으로 바꾸면 동일한 속성 모델 처리까지 보장되지 않습니다.
 */
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
/**
 * 검색 아이콘은 기존 라이브러리 탐색창을 엽니다. 표시 UI만 추가했으므로 탐색 기능은 재사용합니다.
 * 기본 onClickSelector는 인자를 처리하지 않아 파라미터의 실제 반영에는 별도 수신 구현이 필요합니다.
 */
    ZcaLibraryAdapter.prototype.browse = function () { this.controller().onClickSelector(); };
/**
 * [인자] facet은 기존 ENOListViewFacet 인스턴스, options는 그 facet에 전달된 설정입니다.
 * [역할] 속성 탭에 WUX 클래스 선택창과 기존 클래스 속성 폼을 붙일 표시 영역을 만듭니다.
 * bridge가 없는 일반 생성 화면에서는 아무것도 추가하지 않습니다.
 * 기존 CA 기본 속성 폼을 대체하지 않고 해당 폼 아래에 UI를 추가합니다.
 */
function zcaInstallPropertiesPicker(facet, options) {
    if (!options.zcaBridge) return;
    var session = options.zcaBridge;
    var adapter = new ZcaLibraryAdapter(session);
    facet.zcaDisposed = false;
/**
 * root는 이번에 추가한 UI만 감싸는 컨테이너입니다. 원래 기본 속성 폼은 facet.skeleton에 그대로 있습니다.
 * status는 준비/실패 안내입니다. 업무 속성값이나 저장 모델이 아닙니다.
 */
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
/**
 * 기존 분류 화면에서 사용하는 WUX 컨트롤, NLS, CSS를 가져옵니다.
 * 이 함수 안에서 비동기 require하므로 기존 factory의 인자 순서를 바꾸지 않아도 됩니다.
 * 로딩이 끝나기 전에 화면이 닫히면 아래 콜백은 UI를 만들지 않습니다.
 */
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
/**
 * synchronizing: 기존 컨트롤러의 선택을 새 UI에 표시하는 중인지 나타냅니다.
 * busy: 새 UI의 선택/삭제를 기존 컨트롤러에 반영하는 중인지 나타냅니다.
 * 프로그램으로 칩을 갱신한 change를 사용자 선택으로 다시 처리하는 순환을 막기 위한 변수입니다.
 */
        var synchronizing = false;
        var busy = false;
/**
 * 기존 분류 탭과 같은 AutoComplete 설정을 사용하여 검색 목록과 여러 선택 칩을 표시합니다.
 * allowFreeInputFlag=false는 임의 문자열이 아니라 실제 클래스 노드를 선택하게 합니다.
 * disabled=true는 기존 라이브러리 컨트롤러가 연결되기 전 검색/선택을 막습니다.
 */
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
/**
 * 정렬한 클래스 ID 목록으로 두 선택 상태를 비교합니다.
 * 노드 객체가 서로 다른 인스턴스라도 같은 클래스를 표시하면 불필요하게 선택을 다시 처리하지 않습니다.
 */
        function signature(nodes) {
            return JSON.stringify(nodes.map(nodeId).sort());
        }
/**
 * 새 선택창에 칩을 표시할 노드를 만듭니다. 기존 노드 객체 자체는 공유하지 않습니다.
 * 두 AutoComplete가 같은 TreeNodeModel의 선택 상태를 직접 관리하면 서로의 UI에 영향을 줄 수 있습니다.
 * 클래스 ID는 같지만 이 노드는 표시용입니다. 실제 속성 데이터는 기존 컨트롤러가 관리합니다.
 */
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
/**
 * 분류 탭의 선택 변경을 속성 탭의 칩 표시로 반영합니다.
 * busy 동안에는 반영을 잠시 미루고 작업 종료 뒤 실제 컨트롤러 상태로 맞춥니다.
 * 검색 중인 UI의 일시 상태를 업무 선택 상태로 확정하는 함수가 아닙니다.
 */
        function syncFromController() {
            if (facet.zcaDisposed || session.disposed || !session.controller || busy) return;
            if (signature(picker.selectedItems || []) === signature(session.selected())) return;
            synchronizing = true;
            try { picker.selectedItems = session.selected().map(mirrorNode); }
            finally { synchronizing = false; }
        }
/**
 * 기존 분류 UI와 같은 lite 아이콘 버튼입니다. 클릭할 때 기존 탐색창 또는 커스텀 수신 함수를 실행합니다.
 * zcaSelectorParameters는 이번 코드의 전달용 옵션이며 OOTB가 자동 인식하는 옵션명은 아닙니다.
 */
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
/**
 * 클래스 속성의 실제 편집 폼이 붙는 영역입니다. 선택 칩 영역과 별개입니다.
 * 360px는 내부 WUX 폼의 레이아웃 계산에 필요한 기본 높이입니다. 데이터나 저장값과 관계없습니다.
 * 높이를 바꿀 때는 필드 수, 내부 스크롤, 화면 크기도 확인해야 합니다.
 */
        var fieldsHost = element("zca-class-fields", root);
        fieldsHost.style.width = "100%";
        fieldsHost.style.height = "360px";
        fieldsHost.style.display = "none";
        facet.zcaFieldsHost = fieldsHost;

/**
 * WUX가 검색어에 맞는 목록을 요청할 때 호출하는 함수입니다.
 * 3자 미만과 기존 검색에서 제한하는 특수문자를 걸러 무의미하거나 잘못된 검색 요청을 줄입니다.
 * adapter의 노드 배열을 TreeDocument로 감싸서 WUX에 반환합니다.
 */
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
/**
 * 새 선택창의 사용자 선택/칩 삭제를 처리합니다.
 * desired는 새 UI의 선택, actual은 기존 컨트롤러의 확정 선택을 복사한 배열입니다.
 * 두 배열의 차이로 추가/삭제만 계산합니다. 클래스 속성값을 비교하는 코드는 아닙니다.
 */
        facet.zcaChangeHandler = function () {
            if (synchronizing || busy || facet.zcaDisposed ||
                session.disposed || !session.controller) return;
            var desired = (picker.selectedItems || []).slice();
            var actual = session.selected().slice();
            if (signature(desired) === signature(actual)) return;
/**
 * Set은 클래스 ID가 들어 있는지 빠르게 확인하기 위한 자료구조입니다.
 * added는 실제 컨트롤러에 아직 없는 선택, removed는 사용자 UI에서 빠진 기존 선택입니다.
 */
            var desiredIds = new Set(desired.map(nodeId));
            var actualIds = new Set(actual.map(nodeId));
            var added = desired.filter(function (node) { return !actualIds.has(nodeId(node)); });
            var removed = actual.filter(function (node) { return !desiredIds.has(nodeId(node)); });
            busy = true;
            picker.disabled = browse.disabled = true;
            // Serialize adds: the original path service cancels overlapping requests.
/**
 * 기존 클래스 경로 서비스가 겹치는 요청을 취소할 수 있으므로 클래스 추가를 순서대로 실행합니다.
 * 선택한 노드가 여러 개여도 동시 add 요청을 보내지 않습니다.
 * 작업 동안 컨트롤을 비활성화하고, 끝나면 실제 컨트롤러의 선택으로 표시를 맞춥니다.
 */
            var work = Promise.resolve();
            added.forEach(function (node) {
                work = work.then(function () {
                    if (!session.disposed) return adapter.add(node);
                });
            });
            work.then(function () {
                if (session.disposed) return;
/**
 * 기존 노드를 선택 해제하면 원래 change 처리에서 클래스 속성 모델/폼 제거가 이어집니다.
 * 화면의 칩만 지우면 실제 분류 상태는 남을 수 있으므로 기존 노드에 해제를 전달합니다.
 */
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
/**
 * 컨트롤러 준비/기존 선택 변경/종료를 한곳에서 받습니다.
 * 준비된 뒤 선택창을 활성화하고, 기존 속성 폼을 표시 영역으로 옮기고, 칩도 갱신합니다.
 * state.disposed이면 새 UI를 정리합니다. 구독 해제 함수는 destroy에서 사용합니다.
 */
        facet.zcaUnsubscribe = session.subscribe(function (state) {
            if (state.disposed) { zcaDestroyPropertiesPicker(facet); return; }
            picker.disabled = browse.disabled = busy || !state.controller;
            var fieldsError = null;
            if (state.controller) {
                try { zcaRenderClassFields(facet, state); }
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

/**
 * [역할] 기존 라이브러리 컨트롤러의 실제 속성 폼을 속성 탭에 붙입니다.
 * 현재는 move 단일 동작입니다. 활성 탭에 따라 폼을 옮기는 분기는 없습니다.
 * accordeonCon 안에 원래 ClassifPropWidget이 있으므로 DOM을 복제하거나 새 속성 모델을 만들지 않습니다.
 */
function zcaRenderClassFields(facet, session) {
    if (facet.zcaDisposed || session.disposed || !session.controller) return;
    var ctrl = session.controller;
    // Existing live form containing ClassifPropWidget, including editable tweakers.
    var form = ctrl.accordeonCon;
    if (!form || form.nodeType !== 1 || !ctrl.classifPropertiesView) {
        throw new Error("기존 분류 속성 폼의 accordeonCon을 확인해 주세요.");
    }
/**
 * binding은 옮긴 폼의 원래 부모와 다음 형제를 기억합니다.
 * 종료 때 원래 순서를 복원하기 위한 값이며 속성의 입력값을 저장하는 객체가 아닙니다.
 * 도중에 다른 폼 인스턴스가 생기면 임의로 다시 붙이지 않고 재초기화 여부를 알려 줍니다.
 */
    var binding = facet.zcaFieldsBinding;
    if (!binding) {
        if (!form.parentNode) throw new Error("기존 분류 속성 폼이 아직 연결되지 않았습니다.");
        binding = facet.zcaFieldsBinding = {
            form: form, originalParent: form.parentNode, originalNext: form.nextSibling
        };
    } else if (binding.form !== form) {
        throw new Error("분류 폼이 재초기화되었습니다. 생성 화면을 다시 열어 주세요.");
    }
    // Single move behavior: the form stays in Properties until the dialog closes.
/**
 * 폼을 이동할 때 활성 필드에 blur를 호출하여 tweaker가 편집값을 커밋할 기회를 줍니다.
 * 이 처리는 서버 저장을 뜻하지 않습니다. 필드별 모델 반영 시점은 실제 환경에서 확인해야 합니다.
 */
    if (form.parentNode !== facet.zcaFieldsHost) {
        var active = document.activeElement;
        if (active && form.contains(active) && typeof active.blur === "function") active.blur();
        facet.zcaFieldsHost.appendChild(form);
    }
    facet.zcaFieldsHost.style.display = session.selected().length ? "" : "none";
    clearTimeout(facet.zcaFieldsResizeTimer);
/**
 * DOM이 새 부모에 붙은 다음 기존 폼의 크기를 재계산합니다.
 * 연속 호출이면 이전 타이머를 지우고 마지막 요청만 남깁니다. 닫힌 화면에서는 실행하지 않습니다.
 */
    facet.zcaFieldsResizeTimer = setTimeout(function () {
        if (!facet.zcaDisposed && !session.disposed &&
            typeof ctrl.classifPropertiesView.onInnerResize === "function") {
            ctrl.classifPropertiesView.onInnerResize();
        }
    }, 0);
}

/**
 * 기존 컴포넌트가 소유하던 폼을 원래 부모/순서로 돌려놓습니다.
 * 추가 UI의 root를 제거하기 전에 호출해야 기존 폼까지 함께 제거되는 일을 막을 수 있습니다.
 * 입력값을 초기화하거나 CA를 삭제하는 함수는 아닙니다.
 */
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

/**
 * 추가한 선택 UI와 구독/타이머를 정리합니다. 중복 호출도 첫 정리 뒤에는 즉시 반환합니다.
 * 기존 분류 속성 폼은 파괴하지 않고 복원합니다. 모델은 기존 분류 컴포넌트의 관리 대상으로 유지합니다.
 */
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
   이번 버전은 onTabChange에 추가할 코드가 없습니다.
   이전에 추가한 zcaSelectFieldsTab 호출/함수는 제거합니다.
   기존 manageButtons 및 일반 탭 전환 처리는 유지합니다.
*/
/**
 * [인자] dialog는 기존 ENONewDialogController입니다.
 * 각 facet 옵션에서 bridge를 찾고 Set으로 중복을 제거한 뒤 한 번씩 종료합니다.
 * 두 facet이 같은 bridge를 공유하므로 배열을 그대로 돌며 중복 종료하지 않도록 합니다.
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




