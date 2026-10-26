/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 그 모듈 안의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * [수정 전]은 원본에서 찾을 정확한 코드 조각입니다.
 * define 의존성/인자는 변경하지 않습니다. 새 커스텀 의존성을 추가하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationProp/facets/Properties/ClassifPropController
 * ["UWA/Class/Model","UWA/Core","DS/ClassificationProp/utils/ClassifSecurityContextServices","DS/WidgetServices/WidgetServices","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/facets/Common/ClassifFacetsBase","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/models/ClassifPropModelMerge","DS/ClassificationProp/models/ClassifPropAttributeModel","DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/constants/ConstantsMapping","DS/ClassificationProp/comm/DistantAjax","DS/ClassificationProp/utils/ClassifPropUtils","DS/ClassificationProp/utils/ClassifPropControl","DS/IPClassifyUtil/IPClassifyAlert","i18n!DS/ClassificationProp/assets/nls/langEditProp","DS/PlatformAPI/PlatformAPI"]
 * function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,C)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationProp/facets/Properties/ClassifPropController
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
n.getListHandle.handle=null,n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES})
*/
/* [변경 1 — 아래 코드로 교체]
n.getListHandle.handle=null;var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi&&!sdxECCAApi.prepareAttributes(i,a))return;n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES});if(sdxECCAApi)sdxECCAApi.notifyAttributesLoaded(i,a)
*/
