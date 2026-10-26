/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 그 모듈 안의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * [수정 전]은 원본에서 찾을 정확한 코드 조각입니다.
 * define 의존성/인자는 변경하지 않습니다. 새 커스텀 의존성을 추가하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * ["DS/ENONewWidget/utils/ENONewFacetConstants","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls","i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls"]
 * function(e,t,i)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
return o.options.data=e
*/
/* [변경 1 — 아래 코드로 교체]
o.options.data=e
*/

/* [변경 2 — 원본에서 찾을 부분]
})),a},getDefaultFacet:
*/
/* [변경 2 — 아래 코드로 교체]
}));var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.attachBridge(e,a,i);return a},getDefaultFacet:
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * ["UWA/Core","DS/UIKIT/Scroller","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper"]
 * function(e,t,i,n,a)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
this._parent(t),this.skeleton=
*/
/* [변경 1 — 아래 코드로 교체]
this._parent(t);var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.prepareFixedType(t.data,t.sdxECCAAutoSession);this.skeleton=
*/

/* [변경 2 — 원본에서 찾을 부분]
this.listview.loadView()},updateFacet:
*/
/* [변경 2 — 아래 코드로 교체]
this.listview.loadView();if(sdxECCAApi)sdxECCAApi.installFields(this,t)},updateFacet:
*/

/* [변경 3 — 원본에서 찾을 부분]
updateFacet:function(e){
*/
/* [변경 3 — 아래 코드로 교체]
updateFacet:function(e){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.checkFacetContext(this,e);
*/

/* [변경 4 — 원본에서 찾을 부분]
var n=e[t];i.publishAttributeInfo(n)
*/
/* [변경 4 — 아래 코드로 교체]
var n=e[t];if(i.sdxECCAAutoSession){if(t==="New-SecurityContext")i.sdxECCAAutoSession.checkContext(n.valueDB);else if(t==="New-Type")i.sdxECCAAutoSession.checkType(n.valueDB)}i.publishAttributeInfo(n)
*/

/* [변경 5 — 원본에서 찾을 부분]
destroy:function(){this.listview.destroy()
*/
/* [변경 5 — 아래 코드로 교체]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.destroyFields(this);this.listview.destroy()
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * ["UWA/Controls/Abstract","DS/Windows/ImmersiveFrame","DS/Controls/ComboBox","DS/Controls/Button","DS/Windows/Dialog","DS/Controls/ModalLoader","DS/ENONewWidget/ENONew/Events","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/ENOTabView","DS/ENONewWidget/ENONew/View/TabUtility","DS/ENONewWidget/ENONew/View/ENOWizardView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls"]
 * function(e,t,i,n,a,o,r,s,c,l,d,u,f)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [변경 1 — 원본에서 찾을 부분]
o.myDialog=o.buildDialog(a),o.manageButtons(),t.activateDraftMode
*/
/* [변경 1 — 아래 코드로 교체]
o.myDialog=o.buildDialog(a);o.manageButtons();var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.bindDialog(o);t.activateDraftMode
*/

/* [변경 2 — 원본에서 찾을 부분]
onSubmitDialog:function(e){
*/
/* [변경 2 — 아래 코드로 교체]
onSubmitDialog:function(e){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi&&!sdxECCAApi.canSubmitDialog(this)){this.resetButtonLabel();this.disableFormInput(false,false,true);return;}
*/

/* [변경 3 — 원본에서 찾을 부분]
i?this.removeLoadingOverlay():this.addLoadingOverlay()},
*/
/* [변경 3 — 아래 코드로 교체]
i?this.removeLoadingOverlay():this.addLoadingOverlay();var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.preserveValidationState(this)},
*/

/* [변경 4 — 원본에서 찾을 부분]
destroy:function(){this.myDialog
*/
/* [변경 4 — 아래 코드로 교체]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.disposeDialog(this);this.myDialog
*/
