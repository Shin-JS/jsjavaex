/* R2026x 원본에 적용하는 F/M/P 수정 메모입니다. 파일 전체를 덮어쓰지 않습니다.
 * ENONewWidget.js는 수정하지 않습니다. 예전 동일 연결이 있으면 중복 추가하지 않습니다.
 * 각 AMD factory 안에서 setup을 한 번 추가하고, 변경 조각을 순서대로 교체합니다.
 * AMD 의존성/인자는 원본 그대로 유지합니다. 일반 위젯/표식 없는 모델은 원래 경로를 사용합니다.
 */

/* [2026 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewClassificationFacet
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
 * function(e,t,i,o,n,s,a,r,l)
 */

/* [추가 위치] DS/ClassificationsFacet/PLMNewClassificationFacet의 factory 안, use strict 다음(없으면 return/클래스 선언 앞). */
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}

/* [변경 1 — 원본에서 찾을 부분]
this.listenToPublishedInfo((function(e,t){if("currentSecurityContext"===e){let e=t.value;securityContext=e}}))}
*/
/* [변경 1 — 아래 코드로 교체]
this.listenToPublishedInfo(function (e, t) {
    if (e === "currentSecurityContext") securityContext = t.value;
});
// 원본 UI를 새 문맥으로 다시 구성합니다. 분류 저장 경로는 변경하지 않습니다.
this.sdxECCARebuildUI = function (context) {
    var oldContainer = this.elements.container;
    var nextUI = new r;
    var container = nextUI.getUI(Object.assign({}, e, {
        securityContext: context, sdxECCAAutoSession: this.sdxECCAAutoSession
    }));
    if (oldContainer && oldContainer.parentNode) oldContainer.parentNode.replaceChild(container, oldContainer);
    this.initUI = nextUI;
    this.elements.container = container;
};
var sdxECCAApi = sdxECCAGetApi();
if (e.sdxECCAAutoSession) {
    var sdxECCAFacet = this;
    // postCreation에서 함수만 전달해도 이 생성창의 문맥을 사용합니다.
    this.plmNewContextProvider = function () { return sdxECCAFacet.sdxECCAAutoContext; };
}
if (sdxECCAApi) sdxECCAApi.connectClassification(this, e);
}
*/

/* [변경 2 — 원본에서 찾을 부분]
destroy:function(){t.is(
*/
/* [변경 2 — 아래 코드로 교체]
destroy: function () {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) sdxECCAApi.disconnectClassification(this);
    t.is(
*/

/* [2026 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * [
 *     "UWA/Controls/Abstract",
 *     "UWA/Class/Options",
 *     "UWA/Class/Events",
 *     "DS/WUXAutoComplete/AutoComplete",
 *     "DS/Controls/Button",
 *     "DS/Core/TooltipModel",
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
 * function(e,t,i,o,n,s,a,r,l,c,d,p,u,f,m,h,C,g,v,w,P,y,I,A,b)
 */

/* [추가 위치] DS/ClassificationsFacet/PLMNewCommomCmpUXController의 factory 안, use strict 다음(없으면 return/클래스 선언 앞). */
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}

/* [변경 1 — 원본에서 찾을 부분]
r.classifPropModels.push(n),w.publish(
*/
/* [변경 1 — 아래 코드로 교체]
r.classifPropModels.push(n);
var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) sdxECCAApi.tagClassModel(r, n, e);
w.publish(
*/
