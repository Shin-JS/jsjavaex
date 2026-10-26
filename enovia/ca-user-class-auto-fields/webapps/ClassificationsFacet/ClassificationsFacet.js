/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 그 모듈 안의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * [수정 전]은 원본에서 찾을 정확한 코드 조각입니다.
 * define 의존성/인자는 변경하지 않습니다. 새 커스텀 의존성을 추가하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewClassificationFacet
 * ["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","UWA/Core","UWA/Class/Options","UWA/Class/Events","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/ClassificationsFacet/InitClassificationCmpUI","DS/IPClassifyUtil/IPClassifyUtility","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
 * function(e,t,i,o,s,n,a,r,l)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewClassificationFacet
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
init:function(e){var i=e;
*/
/* [변경 1 — 아래 코드로 교체]
init:function(e){var i=e,sdxECCAFacet=this;
*/

/* [변경 2 — 원본에서 찾을 부분]
securityContext=e}}))}
*/
/* [변경 2 — 아래 코드로 교체]
securityContext=e;if(sdxECCAFacet.sdxECCAAutoSession){sdxECCAFacet.sdxECCAAutoContext=e;sdxECCAFacet.sdxECCAAutoSession.checkContext(e)}}}));var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.connectClassification(this,e)}
*/

/* [변경 3 — 원본에서 찾을 부분]
return securityContext}
*/
/* [변경 3 — 아래 코드로 교체]
return this.sdxECCAAutoSession?this.sdxECCAAutoContext:securityContext}
*/

/* [변경 4 — 원본에서 찾을 부분]
destroy:function(){t.is(
*/
/* [변경 4 — 아래 코드로 교체]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.disconnectClassification(this);t.is(
*/

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * ["UWA/Controls/Abstract","UWA/Class/Options","UWA/Class/Events","DS/WUXAutoComplete/AutoComplete","DS/Controls/Button","DS/Controls/TooltipModel","DS/Windows/ImmersiveFrame","DS/Windows/Dialog","DS/Controls/Loader","DS/Controls/ModalContainer","DS/Controls/Accordeon","DS/ClassificationsFacet/utils/PLMNewClassificationFacetData","DS/TreeModel/TreeDocument","DS/Controls/Popup","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/ClassifPropWidget","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/IPClassifyUtil/IPClassifyPreference","DS/IPClassifyUtil/IPClassifyAlert","DS/IPClassifyUXUtil/CredentialsView","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
 * function(e,t,i,o,s,n,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,b,A)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
r.classifPropModels.push(s),v.publish(
*/
/* [변경 1 — 아래 코드로 교체]
r.classifPropModels.push(s);var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.tagClassModel(r,s,e);v.publish(
*/
