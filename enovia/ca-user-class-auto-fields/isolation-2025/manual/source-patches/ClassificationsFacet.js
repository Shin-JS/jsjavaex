/* 적용 메모 — 전체 파일 교체용 코드가 아닙니다.
 * 수정 대상: 새 전용 sdxECCA2025.js에 복사한 ClassificationsFacet의 해당 AMD 모듈.
 * 공통 원본에 이 조각을 적용하지 않습니다.
 * 아래 부분 변경을 마친 다음 README의 전용 이름 치환을 적용합니다.
 * 각 [수정 전]을 해당 AMD 모듈 안에서 찾아 [수정 후]로 바꿉니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewClassificationFacet
 * ============================================================ */

/* [의존성 배열 수정 전]
["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","UWA/Core","UWA/Class/Options","UWA/Class/Events","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/ClassificationsFacet/InitClassificationCmpUI","DS/IPClassifyUtil/IPClassifyUtility","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","UWA/Core","UWA/Class/Options","UWA/Class/Events","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/ClassificationsFacet/InitClassificationCmpUI","DS/IPClassifyUtil/IPClassifyUtility","css!DS/ClassificationsFacet/ClassificationsFacet.css","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,o,s,n,a,r,l)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,o,s,n,a,r,l,sdxUnused9,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
init:function(e){var i=e;
*/
/* [변경 1 — 수정 후]
init:function(e){var i=e,sdxFacet=this;
*/

/* [변경 2 — 수정 전]
i.securityContext&&(securityContext=i.securityContext)
*/
/* [변경 2 — 수정 후]
i.securityContext&&(this.sdxECCAAutoContext=i.securityContext)
*/

/* [변경 3 — 수정 전]
securityContext=e}}))}
*/
/* [변경 3 — 수정 후]
sdxFacet.sdxECCAAutoContext=e;if(sdxFacet.sdxECCAAutoSession)sdxFacet.sdxECCAAutoSession.checkContext(e)}})),sdxECCAAutoClass.connectClassification(this,e)}
*/

/* [변경 4 — 수정 전]
return securityContext}
*/
/* [변경 4 — 수정 후]
return this.sdxECCAAutoContext}
*/

/* [변경 5 — 수정 전]
destroy:function(){t.is(
*/
/* [변경 5 — 수정 후]
destroy:function(){sdxECCAAutoClass.disconnectClassification(this);t.is(
*/

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * ============================================================ */

/* [의존성 배열 수정 전]
["UWA/Controls/Abstract","UWA/Class/Options","UWA/Class/Events","DS/WUXAutoComplete/AutoComplete","DS/Controls/Button","DS/Controls/TooltipModel","DS/Windows/ImmersiveFrame","DS/Windows/Dialog","DS/Controls/Loader","DS/Controls/ModalContainer","DS/Controls/Accordeon","DS/ClassificationsFacet/utils/PLMNewClassificationFacetData","DS/TreeModel/TreeDocument","DS/Controls/Popup","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/ClassifPropWidget","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/IPClassifyUtil/IPClassifyPreference","DS/IPClassifyUtil/IPClassifyAlert","DS/IPClassifyUXUtil/CredentialsView","css!DS/ClassificationsFacet/ClassificationsFacet.css"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["UWA/Controls/Abstract","UWA/Class/Options","UWA/Class/Events","DS/WUXAutoComplete/AutoComplete","DS/Controls/Button","DS/Controls/TooltipModel","DS/Windows/ImmersiveFrame","DS/Windows/Dialog","DS/Controls/Loader","DS/Controls/ModalContainer","DS/Controls/Accordeon","DS/ClassificationsFacet/utils/PLMNewClassificationFacetData","DS/TreeModel/TreeDocument","DS/Controls/Popup","DS/ClassificationProp/facets/Properties/Properties","DS/ClassificationProp/facets/Properties/PropertiesInfo","DS/ClassificationProp/models/ClassifPropModel","DS/ClassificationProp/ClassifPropWidget","DS/ClassificationProp/constants/ClassifPropConstants","DS/ClassificationProp/comm/EventManager","DS/ClassificationProp/utils/ClassifPropControl","i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel","DS/IPClassifyUtil/IPClassifyPreference","DS/IPClassifyUtil/IPClassifyAlert","DS/IPClassifyUXUtil/CredentialsView","css!DS/ClassificationsFacet/ClassificationsFacet.css","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,o,s,n,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,b,A)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,o,s,n,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,b,A,sdxUnused25,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
r.classifPropModels.push(s),v.publish(
*/
/* [변경 1 — 수정 후]
r.classifPropModels.push(s),sdxECCAAutoClass.tagClassModel(r,s,e),v.publish(
*/

/* ============================================================
 * [대상 AMD 모듈] DS/ClassificationsFacet/InitClassificationCmpUI
 * ============================================================ */

/* [의존성 한 항목 수정 전]
"text!DS/ClassificationsFacet/assets/classificationAppsRequire_setting.json"
*/
/* [의존성 한 항목 수정 후]
"DS/sdxECCA2025/appSettings"
*/

/* [변경 1 — 수정 전]
getUI:function(t){
*/
/* [변경 1 — 수정 후]
getUI:function(t){if(t.isExportControl)throw new Error("Export control is not enabled in this private CA build");
*/
