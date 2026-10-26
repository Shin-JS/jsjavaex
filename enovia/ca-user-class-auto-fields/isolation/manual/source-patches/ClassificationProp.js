/* 적용 메모 — 전체 파일 교체용 코드가 아닙니다.
 * 수정 대상: 새 전용 sdxECCA.js에 복사한 ClassificationProp의 해당 AMD 모듈.
 * 공통 원본에 이 조각을 적용하지 않습니다.
 * 아래 부분 변경을 마친 다음 README의 전용 이름 치환을 적용합니다.
 * 각 [수정 전]을 해당 AMD 모듈 안에서 찾아 [수정 후]로 바꿉니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationProp/facets/Properties/ClassifPropController
 * ============================================================ */

/* [의존성 배열 수정 전]
["UWA/Class/Model","UWA/Core","DS/ClassificationProp/utils/ClassifSecurityContextServices","DS/WidgetServices/WidgetServices","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/facets/Common/ClassifFacetsBase","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/models/ClassifPropModelMerge","DS/ClassificationProp/models/ClassifPropAttributeModel","DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/constants/ConstantsMapping","DS/ClassificationProp/comm/DistantAjax","DS/ClassificationProp/utils/ClassifPropUtils","DS/ClassificationProp/utils/ClassifPropControl","DS/IPClassifyUtil/IPClassifyAlert","i18n!DS/ClassificationProp/assets/nls/langEditProp","DS/PlatformAPI/PlatformAPI"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["UWA/Class/Model","UWA/Core","DS/ClassificationProp/utils/ClassifSecurityContextServices","DS/WidgetServices/WidgetServices","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/facets/Common/ClassifFacetsBase","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/models/ClassifPropModelMerge","DS/ClassificationProp/models/ClassifPropAttributeModel","DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/constants/ConstantsMapping","DS/ClassificationProp/comm/DistantAjax","DS/ClassificationProp/utils/ClassifPropUtils","DS/ClassificationProp/utils/ClassifPropControl","DS/IPClassifyUtil/IPClassifyAlert","i18n!DS/ClassificationProp/assets/nls/langEditProp","DS/PlatformAPI/PlatformAPI","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,C)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,C,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES})
*/
/* [변경 1 — 수정 후]
sdxECCAAutoClass.prepareAttributes(i,a)&&(n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES}),sdxECCAAutoClass.notifyAttributesLoaded(i,a))
*/
