/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 같은 모듈의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * 원본에서 찾을 부분은 검색용이며 교체 코드는 여러 줄로 표시합니다.
 * define 의존성/인자는 변경하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationProp/facets/Properties/ClassifPropController
 * [
 *     "UWA/Class/Model",
 *     "UWA/Core",
 *     "DS/ClassificationProp/utils/ClassifSecurityContextServices",
 *     "DS/WidgetServices/WidgetServices",
 *     "DS/ClassificationProp/comm/EventManager",
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
 * function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,C)
 * 확인용입니다. 이 의존성 배열과 인자는 그대로 둡니다.
 */

/* ============================================================
 * [P0] [대상 AMD 모듈] DS/ClassificationProp/facets/Properties/ClassifPropController
 * [추가 위치] 해당 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 P1] loadModels() 안의 onAttributesLoad 콜백: 폼 생성 호출 전후. */
/* [P1 찾는 순서]
 * 이 AMD 모듈의 loadModels 안에서 onAttributesLoad:function(a)를 검색합니다.
 * 그 콜백 아래쪽의 n.getListHandle.handle=null을 찾습니다.
 * 바로 이어지는 n._onCompleteLoadModel(...) 호출까지 함께 교체합니다.
 * 뒤의 onComplete:function(e){n.hideLoader(),o.onAttributesLoad(e)}는 그대로 둡니다.
 * i=클래스 모델, a=속성 응답, n=기존 컨트롤러입니다.
 * 설치 소스에서 응답이 r이거나 메서드가 onCompleteLoadModel이면 그 이름을 유지합니다.
 */
/* [변경 1 — 원본에서 찾을 부분]
n.getListHandle.handle=null,n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES})
*/
/* [변경 1 — 아래 코드로 교체]
n.getListHandle.handle = null;

var sdxECCAApi = sdxECCAGetApi();

// [추가] 분류 폼이 만들어지기 전에 필수 입력 메타데이터를 준비합니다.
if (sdxECCAApi && !sdxECCAApi.prepareAttributes(i, a)) {
    return;
}

// [원본 유지] 기존 폼 생성 호출과 옵션을 유지합니다.
n._onCompleteLoadModel(a, {
    initTable: !e,
    buildBehavior: t ? h.FORCE_DEFAULT : h.NO_CHANGES
});

// [추가] 실제 폼 생성 이후에 속성 로딩 완료를 알립니다.
if (sdxECCAApi) {
    sdxECCAApi.notifyAttributesLoaded(i, a);
}
*/
