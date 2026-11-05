/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 같은 모듈의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * 원본에서 찾을 부분은 검색용이며 교체 코드는 여러 줄로 표시합니다.
 * define 의존성/인자는 변경하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewClassificationFacet
 * [
 *     "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase",
 *     "UWA/Core",
 *     "UWA/Class/Options",
 *     "UWA/Class/Events",
 *     "DS/ClassificationProp/models/ClassifPropModel",
 *     "DS/ClassificationProp/utils/ClassifPropControl",
 *     "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel",
 *     "DS/ClassificationsFacet/InitClassificationCmpUI",
 *     "DS/IPClassifyUtil/IPClassifyUtility",
 *     "css!DS/ClassificationsFacet/ClassificationsFacet.css"
 * ]
 * function(e,t,i,o,s,n,a,r,l)
 * 확인용입니다. 이 의존성 배열과 인자는 그대로 둡니다.
 */

/* ============================================================
 * [F0] [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewClassificationFacet
 * [추가 위치] 해당 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 F1] init(e)의 var i=e 부분. */
/* [변경 1 — 원본에서 찾을 부분]
init:function(e){var i=e;
*/
/* [변경 1 — 아래 코드로 교체]
init: function (e) {
    var i = e;
    var sdxECCAFacet = this;

*/

/* [위치 F2] 같은 init(e)의 this.listenToPublishedInfo 콜백부터 init 끝까지. */
/* [F2 찾는 순서]
 * init 안에서 this.listenToPublishedInfo를 검색합니다.
 * currentSecurityContext를 받는 콜백 전체부터 init 메서드 끝까지 교체합니다.
 * F1에서 만든 sdxECCAFacet을 함께 사용하므로 F1과 F2를 모두 적용합니다.
 * 뒤의 plmNewContextProvider 정의와 그 앞 구분 쉼표는 유지합니다.
 */
/* [변경 2 — 원본에서 찾을 부분]
this.listenToPublishedInfo((function(e,t){if("currentSecurityContext"===e){let e=t.value;securityContext=e}}))}
*/
/* [변경 2 — 아래 코드로 교체]
this.listenToPublishedInfo(function (e, t) {
    if (e === "currentSecurityContext") {
        let currentContext = t.value;

        // [원본 유지] 기존 권한 문맥을 갱신합니다.
        securityContext = currentContext;

        // 전역 자격증명 변경만으로 생성창의 선택 문맥을 갱신하거나 실패시키지 않습니다.
        // 실제 New-SecurityContext 필드 변경은 ENONewWidget의 changeContext가 재초기화합니다.
    }
});

// r은 이 factory의 기존 InitClassificationCmpUI 생성자입니다.
// 새 UI 인스턴스의 속성 조회 context 클로저까지 새 문맥으로 만듭니다.
this.sdxECCARebuildUI = function (context) {
    var oldContainer = this.elements.container;
    var options = Object.assign({}, e, {securityContext: context});
    var nextUI = new r;
    var container = nextUI.getUI(options);
    if (oldContainer && oldContainer.parentNode) {
        oldContainer.parentNode.replaceChild(container, oldContainer);
    }
    this.initUI = nextUI;
    this.elements.container = container;
};

var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) {
    sdxECCAApi.connectClassification(this, e);
}
}
*/

/* [위치 F3] plmNewContextProvider()의 반환 부분. */
/* [변경 3 — 원본에서 찾을 부분]
return securityContext}
*/
/* [변경 3 — 아래 코드로 교체]
if (this.sdxECCAAutoSession) {
    return this.sdxECCAAutoContext;
}

return securityContext;
}
*/

/* [위치 F4] PLMNewClassificationFacet의 destroy() 시작 부분. */
/* [변경 4 — 원본에서 찾을 부분]
destroy:function(){t.is(
*/
/* [변경 4 — 아래 코드로 교체]
destroy: function () {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) {
        sdxECCAApi.disconnectClassification(this);
    }

    t.is(
*/

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * [
 *     "UWA/Controls/Abstract",
 *     "UWA/Class/Options",
 *     "UWA/Class/Events",
 *     "DS/WUXAutoComplete/AutoComplete",
 *     "DS/Controls/Button",
 *     "DS/Controls/TooltipModel",
 *     "DS/Windows/ImmersiveFrame",
 *     "DS/Windows/Dialog",
 *     "DS/Controls/Loader",
 *     "DS/Controls/ModalContainer",
 *     "DS/Controls/Accordeon",
 *     "DS/ClassificationsFacet/utils/PLMNewClassificationFacetData",
 *     "DS/TreeModel/TreeDocument",
 *     "DS/Controls/Popup",
 *     "DS/ClassificationProp/facets/Properties/Properties",
 *     "DS/ClassificationProp/facets/Properties/PropertiesInfo",
 *     "DS/ClassificationProp/models/ClassifPropModel",
 *     "DS/ClassificationProp/ClassifPropWidget",
 *     "DS/ClassificationProp/constants/ClassifPropConstants",
 *     "DS/ClassificationProp/comm/EventManager",
 *     "DS/ClassificationProp/utils/ClassifPropControl",
 *     "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel",
 *     "DS/IPClassifyUtil/IPClassifyPreference",
 *     "DS/IPClassifyUtil/IPClassifyAlert",
 *     "DS/IPClassifyUXUtil/CredentialsView",
 *     "css!DS/ClassificationsFacet/ClassificationsFacet.css"
 * ]
 * function(e,t,i,o,s,n,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,b,A)
 * 확인용입니다. 이 의존성 배열과 인자는 그대로 둡니다.
 */

/* ============================================================
 * [M0] [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * [추가 위치] 해당 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 M1] createAutocompleteComponent() 내부의 클래스 모델 추가 부분. */
/* [M1 찾는 순서]
 * createAutocompleteComponent 안에서 r.classifPropModels.push(s)를 검색합니다.
 * 바로 앞은 var s=new C({objectId:e})로 클래스 모델을 만드는 코드입니다.
 * r.classifPropModels.push(s)부터 뒤의 v.publish( 시작까지 교체합니다.
 * v.publish의 기존 이벤트명과 인자는 뒤에 그대로 남깁니다.
 * r=컨트롤러, s=새 클래스 모델, e=클래스 ID입니다.
 */
/* [변경 1 — 원본에서 찾을 부분]
r.classifPropModels.push(s),v.publish(
*/
/* [변경 1 — 아래 코드로 교체]
r.classifPropModels.push(s);

var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) {
    sdxECCAApi.tagClassModel(r, s, e);
}

v.publish(
*/
