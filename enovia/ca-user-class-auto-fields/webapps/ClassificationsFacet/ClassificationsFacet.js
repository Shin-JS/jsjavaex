/* 전체 파일 교체용이 아닙니다. 아래 factory별 변경 조각만 적용합니다.
 * 원래 getUI/postCreation/_parent 호출은 유지합니다.
 * ca-isolated-kit의 zcaConnectClassificationFacet/Disconnect 호출은 자동 방식 호출로 바꿉니다.
 */

/* [1] DS/ClassificationsFacet/PLMNewClassificationFacet factory 안의 return 앞
 * init(e)의 기존 initUI/getUI/listenToPublishedInfo 설정 뒤:
 *     zcaConnectAutoClassification(this,e);
 * destroy()의 기존 처리보다 앞:
 *     zcaDisconnectAutoClassification(this);
 * 현재 문맥 처리의 기존 securityContext 변수는 자동 대상에서는 인스턴스 지역값으로 대체:
 * init에서 t.securityContext 처리 뒤:
 *     if(e.zcaAutoSession)this.zcaAutoContext=e.securityContext||e.zcaAutoSession.context;
 * 기존 currentSecurityContext 구독 콜백에서 securityContext=e 처리 뒤:
 *     if(this.zcaAutoSession){this.zcaAutoContext=e;this.zcaAutoSession.checkContext(e);}
 * 위 콜백의 this는 보장되지 않으므로 init의 var zcaFacet=this를 선언하고 실제로는
 *     if(zcaFacet.zcaAutoSession){zcaFacet.zcaAutoContext=e;zcaFacet.zcaAutoSession.checkContext(e);}
 * 를 사용합니다. 일반 OOTB 분기의 기존 처리는 그대로 둡니다.
 * plmNewContextProvider 함수는 다음으로 변경:
 *     return this.zcaAutoSession ? this.zcaAutoContext : securityContext;
 */

/** 비동기 OOTB 컨트롤러가 준비되면 자동 선택을 시작합니다. 다른 위젯은 즉시 반환합니다. */
function zcaConnectAutoClassification(facet, options) {
    var session = options.zcaAutoSession;
    if (!session) return;
    facet.zcaAutoSession = session;
    facet.zcaAutoContext = options.securityContext || session.context;
    session.checkContext(facet.zcaAutoContext);
    var started = Date.now();
    facet.zcaAutoTimer = setInterval(function () {
        if (session.disposed || session.status === "error") { clearInterval(facet.zcaAutoTimer); return; }
        var ui = facet.initUI && facet.initUI.getController();
        var ctrl = ui && ui.plmNewLibraryActive;
        if (ctrl && ctrl.autoComplete && ctrl.classifPropertiesView && ctrl.accordeonCon) {
            clearInterval(facet.zcaAutoTimer);
            try {
                if ((ctrl.autoComplete.selectedItems || []).length || (ctrl.classifPropModels || []).length) {
                    throw new Error("이미 분류가 선택된 화면에는 자동 초기화를 적용하지 않습니다.");
                }
                // OOTB prototype의 Map을 대화상자별로 분리합니다. 신규 생성 초기 연결 때만 실행합니다.
                ctrl.classIdAndTitleMap = new Map();
                ctrl._classPathMap = new Map();
                ctrl._classNameMap = new Map();
                ctrl._classUsageMap = new Map();
                ctrl._attributeMap = new Map();
                ctrl.apiAttributesCall = [];
                ctrl._isProcessing = false;
                ctrl.zcaAutoSession = session;
                // 현재 대화상자 문맥으로 조회합니다. 분류 폼 자체를 제거하지 않습니다.
                ctrl.plmNewContextProvider = session.context;
                if (ctrl.container) ctrl.container.style.display = "none";
                session.controller = ctrl;
                session.notify();
                if (session.status !== "error" && !session.disposed) zcaApplyOrganizationClass(ctrl, session);
            } catch (error) { session.fail(error); }
        } else if (Date.now() - started > 30000) {
            clearInterval(facet.zcaAutoTimer);
            session.fail(new Error("기존 분류 컨트롤러 준비 시간이 초과되었습니다."));
        }
    }, 100);
}

/** OOTB getClassPaths 응답으로 클래스 노드를 만들고 원래 select/change 처리를 실행합니다.
 * 검색 서비스나 존재를 확인하지 않은 별도 클래스 조회 API를 추가하지 않습니다.
 * classId는 General Class의 physicalid입니다. General Library ID를 넣으면 거부합니다.
 */
function zcaApplyOrganizationClass(ctrl, session) {
    if (session.started || session.disposed || session.status === "error") return;
    session.started = true;
    var service = ctrl.PLMNewCommonWebService;
    session.classId = session.rule.classId;
    service.getClassPaths({
        id: [session.classId],
        plmNewContextProvider: session.context,
        onComplete: function (response) {
            if (session.disposed || session.status === "error") return;
            try {
                var chains = service.constructPath(response, "idPathChainMap");
                var chain = chains.get(session.classId);
                var leaf = chain && chain[chain.length - 1];
                if (!leaf || leaf.physicalid !== session.classId || !ctrl.couldBeSelected(leaf.type)) {
                    throw new Error("설정한 클래스가 없거나 선택 가능한 General Class가 아닙니다.");
                }
                if (session.rule.libraryId && !chain.some(function (item) {
                    return item.physicalid === session.rule.libraryId;
                })) throw new Error("클래스가 설정한 라이브러리 경로에 포함되지 않습니다.");
                var path = service.extractPath(chain);
                session.classTitle = leaf.label;
                ctrl._classPathMap.set(session.classId, path);
                ctrl._classNameMap.set(session.classId, leaf.label);
                ctrl.classifPropertiesUI.setClassPath(ctrl.getClassPath());
                ctrl.classifPropertiesUI.setClassUsage(ctrl.getClassUsage());
                var data = {
                    id: session.classId, label: leaf.label, plmType: leaf.type,
                    value: {label: leaf.label, subLabel: path},
                    icons: [ctrl._getIcon(leaf)]
                };
                // OOTB 노드 생성 함수가 요구하는 임시 TreeDocument입니다. 선택 UI를 만들지는 않습니다.
                var tree = ctrl.plmNewClassificationFacetData.createAutocompleteDataTree([]);
                var node = ctrl.plmNewClassificationFacetData._createTreeNodeModel(
                    data, tree, ctrl.couldBeSelected.bind(ctrl)
                );
                ctrl.autoComplete._model.prepareUpdate();
                var inserted = ctrl.insertInAutocomplete(ctrl.autocompleteLibrary, node);
                if (!inserted) throw new Error("클래스 선택 노드를 추가할 수 없습니다.");
                ctrl._nodesData[session.classId] = inserted;
                ctrl.autoComplete._model.pushUpdate();
                inserted.select();
                // select 완료는 속성 로딩 완료가 아닙니다. 별도 ClassificationProp 완료 표식을 기다립니다.
                session.notify();
            } catch (error) { session.fail(error); }
        },
        onFailure: function () { session.fail(new Error("지정 클래스 경로 조회에 실패했습니다.")); }
    });
}

function zcaDisconnectAutoClassification(facet) {
    clearInterval(facet.zcaAutoTimer);
    if (facet.zcaAutoSession) facet.zcaAutoSession.dispose();
}

/* [2] DS/ClassificationsFacet/PLMNewCommomCmpUXController factory 내부
 * 아래 함수를 return 앞에 추가합니다.
 * createAutocompleteComponent 안의 var v=function(e,t,i)에서 추가 분기:
 *     var o=new h({objectId:e});
 *     r.classifPropModels.push(o),w.publish(...)
 * 에서 push(o)와 w.publish 사이에 다음 호출을 추가합니다:
 *     r.classifPropModels.push(o),zcaTagAutoClassModel(r,o,e),w.publish(...)
 * 원래 getAttributesDone 구독, initDatas, 삭제 처리 모두 유지합니다.
 */

/** 현재 자동 대상 모델에만 세션을 붙입니다. 전역 이벤트만으로 완료를 판정하지 않습니다. */
function zcaTagAutoClassModel(controller, model, classId) {
    var session = controller.zcaAutoSession;
    if (session && !session.disposed && session.status !== "error" && session.classId === classId) {
        model.zcaAutoSession = session;
        model.zcaAutoClassId = classId;
    }
}
