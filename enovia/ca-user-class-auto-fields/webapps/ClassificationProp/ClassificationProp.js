/* R2026x 원본에 적용하는 F/M/P 수정 메모입니다. 파일 전체를 덮어쓰지 않습니다.
 * ENONewWidget.js는 수정하지 않습니다. 예전 동일 연결이 있으면 중복 추가하지 않습니다.
 * 각 AMD factory 안에서 setup을 한 번 추가하고, 변경 조각을 순서대로 교체합니다.
 * AMD 의존성/인자는 원본 그대로 유지합니다. 일반 위젯/표식 없는 모델은 원래 경로를 사용합니다.
 */

/* [2026 OOTB 헤더 유지] DS/ClassificationProp/facets/Properties/ClassifPropController
 * [
 *     "UWA/Class/Model",
 *     "UWA/Core",
 *     "DS/ClassificationProp/utils/ClassifSecurityContextServices",
 *     "DS/WidgetServices/WidgetServices",
 *     "DS/ClassificationProp/comm/EventManager",
 *     "DS/IPClassifyUtil/PlatformAPIWrapper",
 *     "DS/ClassificationProp/facets/Common/ClassifFacetsBase",
 *     "DS/ClassificationProp/models/ClassifPropModel",
 *     "DS/ClassificationProp/models/ClassifPropModelMerge",
 *     "DS/ClassificationProp/models/ClassifPropAttributeModel",
 *     "DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests",
 *     "DS/ClassificationProp/facets/Properties/Properties",
 *     "DS/ClassificationProp/facets/Properties/PropertiesInfo",
 *     "DS/ClassificationProp/constants/ClassifPropConstants",
 *     "DS/ClassificationProp/constants/ConstantsMapping",
 *     "DS/ClassificationProp/comm/DistantAjax",
 *     "DS/ClassificationProp/utils/ClassifPropUtils",
 *     "DS/ClassificationProp/utils/ClassifPropControl",
 *     "DS/IPClassifyUtil/IPClassifyAlert",
 *     "i18n!DS/ClassificationProp/assets/nls/langEditProp",
 *     "DS/PlatformAPI/PlatformAPI"
 * ]
 * function(e,t,i,n,s,a,r,o,l,c,u,d,h,f,p,m,g,v,_,C,S)
 */

/* [추가 위치] DS/ClassificationProp/facets/Properties/ClassifPropController의 factory 안, use strict 다음(없으면 return/클래스 선언 앞). */
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}

function sdxECCAIsClassModelActive(model) {
    var session = model && model.sdxECCAAutoSession;
    return !session || (!session.disposed && !session.transitioning && session.status !== "error");
}

/* [변경 1 — 원본에서 찾을 부분]
loadModels:function(t,i){window.top.performance.mark("start_PrepareAjax");
*/
/* [변경 1 — 아래 코드로 교체]
loadModels: function (t, i) {
    if (!sdxECCAIsClassModelActive(t)) return;
    window.top.performance.mark("start_PrepareAjax");
*/

/* [변경 2 — 원본에서 찾을 부분]
onAttributesLoad:function(r){if(!1===h){
*/
/* [변경 2 — 아래 코드로 교체]
onAttributesLoad: function (r) {
    if (!sdxECCAIsClassModelActive(i)) return;
    if (!1 === h) {
*/

/* [변경 3 — 원본에서 찾을 부분]
a.getListHandle.handle=null,a._onCompleteLoadModel(r,{initTable:!e,buildBehavior:t?f.FORCE_DEFAULT:f.NO_CHANGES})
*/
/* [변경 3 — 아래 코드로 교체]
a.getListHandle.handle = null;
var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi && !sdxECCAApi.prepareAttributes(i, r)) return;
a._onCompleteLoadModel(r, {
    initTable: !e, buildBehavior: t ? f.FORCE_DEFAULT : f.NO_CHANGES
});
if (sdxECCAApi) sdxECCAApi.notifyAttributesLoaded(i, r);
*/
