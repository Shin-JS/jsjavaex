/* 기존 작업 폴더의 OOTB 수정 메모 — 파일 전체 덮어쓰기용이 아닙니다.
 * 기준: 2025. 기존 생성/분류 코드는 유지하고 아래 연결 부분만 갱신합니다.
 * [먼저 제거] 과거 추가한 define 의존성 "DS/sdxECCAAutoClass/sdxECCAAutoClass"와
 * 그에 대응하는 마지막 factory 인자 sdxECCAAutoClass만 제거합니다.
 * 기존 OOTB 의존성/인자는 순서를 포함해 유지합니다. 별도 원복/소스 복사는 하지 않습니다.
 * 이미 넣은 커스텀 호출은 아래 조건부 호출로 교체합니다. 중복 추가하지 않습니다.
 * 아래 수정 전은 위치를 찾기 위한 변경 전 2025 원본 조각입니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationProp/facets/Properties/ClassifPropController
 * ["UWA/Class/Model","UWA/Core","DS/ClassificationProp/utils/ClassifSecurityContextServices","DS/WidgetServices/WidgetServices","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/facets/Common/ClassifFacetsBase","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/models/ClassifPropModelMerge","DS/ClassificationProp/models/ClassifPropAttributeModel","DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/constants/ConstantsMapping","DS/ClassificationProp/comm/DistantAjax","DS/ClassificationProp/utils/ClassifPropUtils","DS/ClassificationProp/utils/ClassifPropControl","DS/IPClassifyUtil/IPClassifyAlert","i18n!DS/ClassificationProp/assets/nls/langEditProp","DS/PlatformAPI/PlatformAPI"]
 * function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,C)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
n.getListHandle.handle=null,n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES})
*/
/* [변경 1 — 수정 후]
n.getListHandle.handle=null;var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi&&!sdxECCAApi.prepareAttributes(i,a))return;n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES});if(sdxECCAApi)sdxECCAApi.notifyAttributesLoaded(i,a)
*/
