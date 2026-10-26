/* 기존 작업 폴더의 OOTB 수정 메모 — 파일 전체 덮어쓰기용이 아닙니다.
 * 기준: 2025. 기존 생성/분류 코드는 유지하고 아래 연결 부분만 갱신합니다.
 * [먼저 제거] 과거 추가한 define 의존성 "DS/sdxECCAAutoClass/sdxECCAAutoClass"와
 * 그에 대응하는 마지막 factory 인자 sdxECCAAutoClass만 제거합니다.
 * 기존 OOTB 의존성/인자는 순서를 포함해 유지합니다. 별도 원복/소스 복사는 하지 않습니다.
 * 이미 넣은 커스텀 호출은 아래 조건부 호출로 교체합니다. 중복 추가하지 않습니다.
 * 아래 수정 전은 위치를 찾기 위한 변경 전 2025 원본 조각입니다.
 */

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewClassificationFacet
 * ["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","UWA/Core","UWA/Class/Options","UWA/Class/Events","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/ClassificationsFacet/InitClassificationCmpUI","DS/IPClassifyUtil/IPClassifyUtility","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
 * function(e,t,i,o,s,n,a,r,l)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
init:function(e){var i=e;
*/
/* [변경 1 — 수정 후]
init:function(e){var i=e,sdxECCAFacet=this;
*/

/* [변경 2 — 수정 전 / 위치 확인]
securityContext=e}}))}
*/
/* [변경 2 — 수정 후]
securityContext=e;if(sdxECCAFacet.sdxECCAAutoSession){sdxECCAFacet.sdxECCAAutoContext=e;sdxECCAFacet.sdxECCAAutoSession.checkContext(e)}}}));var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.connectClassification(this,e)}
*/

/* [변경 3 — 수정 전 / 위치 확인]
return securityContext}
*/
/* [변경 3 — 수정 후]
return this.sdxECCAAutoSession?this.sdxECCAAutoContext:securityContext}
*/

/* [변경 4 — 수정 전 / 위치 확인]
destroy:function(){t.is(
*/
/* [변경 4 — 수정 후]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.disconnectClassification(this);t.is(
*/

/* [2025 OOTB 헤더 유지] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * ["UWA/Controls/Abstract","UWA/Class/Options","UWA/Class/Events","DS/WUXAutoComplete/AutoComplete","DS/Controls/Button","DS/Controls/TooltipModel","DS/Windows/ImmersiveFrame","DS/Windows/Dialog","DS/Controls/Loader","DS/Controls/ModalContainer","DS/Controls/Accordeon","DS/ClassificationsFacet/utils/PLMNewClassificationFacetData","DS/TreeModel/TreeDocument","DS/Controls/Popup","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/ClassifPropWidget","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/IPClassifyUtil/IPClassifyPreference","DS/IPClassifyUtil/IPClassifyAlert","DS/IPClassifyUXUtil/CredentialsView","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
 * function(e,t,i,o,s,n,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,b,A)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
r.classifPropModels.push(s),v.publish(
*/
/* [변경 1 — 수정 후]
r.classifPropModels.push(s);var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.tagClassModel(r,s,e);v.publish(
*/
