/* 적용 메모 — 전체 파일 교체용 코드가 아닙니다.
 * 수정 대상: 새 전용 sdxECCA2025.js에 복사한 ENONewWidget의 해당 AMD 모듈.
 * 공통 원본에 이 조각을 적용하지 않습니다.
 * 아래 부분 변경을 마친 다음 README의 전용 이름 치환을 적용합니다.
 * 각 [수정 전]을 해당 AMD 모듈 안에서 찾아 [수정 후]로 바꿉니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * ============================================================ */

/* [의존성 배열 수정 전]
["DS/ENONewWidget/utils/ENONewFacetConstants","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls","i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["DS/ENONewWidget/utils/ENONewFacetConstants","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls","i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
})),a},getDefaultFacet:
*/
/* [변경 1 — 수정 후]
})),sdxECCAAutoClass.attachBridge(e,a,i),a.forEach(function(f){if(f.facet.name==="classificationFacet"&&f.options.sdxECCAAutoSession)f.visible=false}),a},getDefaultFacet:
*/

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * ============================================================ */

/* [의존성 배열 수정 전]
["UWA/Core","DS/UIKIT/Scroller","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["UWA/Core","DS/UIKIT/Scroller","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,n,a)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,n,a,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
this._parent(t),this.skeleton=
*/
/* [변경 1 — 수정 후]
this._parent(t),sdxECCAAutoClass.prepareFixedType(t.data,t.sdxECCAAutoSession),this.skeleton=
*/

/* [변경 2 — 수정 전]
this.listview.loadView()},updateFacet:
*/
/* [변경 2 — 수정 후]
this.listview.loadView(),sdxECCAAutoClass.installFields(this,t)},updateFacet:
*/

/* [변경 3 — 수정 전]
updateFacet:function(e){
*/
/* [변경 3 — 수정 후]
updateFacet:function(e){sdxECCAAutoClass.checkFacetContext(this,e);
*/

/* [변경 4 — 수정 전]
var n=e[t];i.publishAttributeInfo(n)
*/
/* [변경 4 — 수정 후]
var n=e[t];if(i.sdxECCAAutoSession){if(t==="New-SecurityContext")i.sdxECCAAutoSession.checkContext(n.valueDB);else if(t==="New-Type")i.sdxECCAAutoSession.checkType(n.valueDB)}i.publishAttributeInfo(n)
*/

/* [변경 5 — 수정 전]
destroy:function(){this.listview.destroy()
*/
/* [변경 5 — 수정 후]
destroy:function(){sdxECCAAutoClass.destroyFields(this);this.listview.destroy()
*/

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * ============================================================ */

/* [의존성 배열 수정 전]
["UWA/Controls/Abstract","DS/Windows/ImmersiveFrame","DS/Controls/ComboBox","DS/Controls/Button","DS/Windows/Dialog","DS/Controls/ModalLoader","DS/ENONewWidget/ENONew/Events","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/ENOTabView","DS/ENONewWidget/ENONew/View/TabUtility","DS/ENONewWidget/ENONew/View/ENOWizardView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["UWA/Controls/Abstract","DS/Windows/ImmersiveFrame","DS/Controls/ComboBox","DS/Controls/Button","DS/Windows/Dialog","DS/Controls/ModalLoader","DS/ENONewWidget/ENONew/Events","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/ENOTabView","DS/ENONewWidget/ENONew/View/TabUtility","DS/ENONewWidget/ENONew/View/ENOWizardView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,n,a,o,r,s,c,l,d,u,f)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,n,a,o,r,s,c,l,d,u,f,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
o.myDialog=o.buildDialog(a),o.manageButtons(),
*/
/* [변경 1 — 수정 후]
o.myDialog=o.buildDialog(a),o.manageButtons(),sdxECCAAutoClass.bindDialog(o),
*/

/* [변경 2 — 수정 전]
onSubmitDialog:function(e){
*/
/* [변경 2 — 수정 후]
onSubmitDialog:function(e){if(!sdxECCAAutoClass.canSubmitDialog(this)){this.resetButtonLabel();this.disableFormInput(!1,!1,!0);return;}
*/

/* [변경 3 — 수정 전]
i?this.removeLoadingOverlay():this.addLoadingOverlay()},
*/
/* [변경 3 — 수정 후]
i?this.removeLoadingOverlay():this.addLoadingOverlay();sdxECCAAutoClass.preserveValidationState(this)},
*/

/* [변경 4 — 수정 전]
destroy:function(){this.myDialog
*/
/* [변경 4 — 수정 후]
destroy:function(){sdxECCAAutoClass.disposeDialog(this);this.myDialog
*/

/* [변경 5 — 수정 전]
for(eventID in 
*/
/* [변경 5 — 수정 후]
for(var eventID in 
*/

/* [변경 6 — 수정 전]
var p=e.extend(
*/
/* [변경 6 — 수정 후]
var errorenousFacetsList;var p=e.extend(
*/
