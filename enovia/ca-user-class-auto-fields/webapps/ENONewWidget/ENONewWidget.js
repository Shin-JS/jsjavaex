/* 기존 작업 폴더의 OOTB 수정 메모 — 파일 전체 덮어쓰기용이 아닙니다.
 * 기준: 2025. 기존 생성/분류 코드는 유지하고 아래 연결 부분만 갱신합니다.
 * [먼저 제거] 과거 추가한 define 의존성 "DS/sdxECCAAutoClass/sdxECCAAutoClass"와
 * 그에 대응하는 마지막 factory 인자 sdxECCAAutoClass만 제거합니다.
 * 기존 OOTB 의존성/인자는 순서를 포함해 유지합니다. 별도 원복/소스 복사는 하지 않습니다.
 * 이미 넣은 커스텀 호출은 아래 조건부 호출로 교체합니다. 중복 추가하지 않습니다.
 * 아래 수정 전은 위치를 찾기 위한 변경 전 2025 원본 조각입니다.
 */

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * ["DS/ENONewWidget/utils/ENONewFacetConstants","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls","i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls"]
 * function(e,t,i)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
return o.options.data=e
*/
/* [변경 1 — 수정 후]
o.options.data=e
*/

/* [변경 2 — 수정 전 / 위치 확인]
})),a},getDefaultFacet:
*/
/* [변경 2 — 수정 후]
}));var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.attachBridge(e,a,i);return a},getDefaultFacet:
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * ["UWA/Core","DS/UIKIT/Scroller","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper"]
 * function(e,t,i,n,a)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
this._parent(t),this.skeleton=
*/
/* [변경 1 — 수정 후]
this._parent(t);var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.prepareFixedType(t.data,t.sdxECCAAutoSession);this.skeleton=
*/

/* [변경 2 — 수정 전 / 위치 확인]
this.listview.loadView()},updateFacet:
*/
/* [변경 2 — 수정 후]
this.listview.loadView();if(sdxECCAApi)sdxECCAApi.installFields(this,t)},updateFacet:
*/

/* [변경 3 — 수정 전 / 위치 확인]
updateFacet:function(e){
*/
/* [변경 3 — 수정 후]
updateFacet:function(e){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.checkFacetContext(this,e);
*/

/* [변경 4 — 수정 전 / 위치 확인]
var n=e[t];i.publishAttributeInfo(n)
*/
/* [변경 4 — 수정 후]
var n=e[t];if(i.sdxECCAAutoSession){if(t==="New-SecurityContext")i.sdxECCAAutoSession.checkContext(n.valueDB);else if(t==="New-Type")i.sdxECCAAutoSession.checkType(n.valueDB)}i.publishAttributeInfo(n)
*/

/* [변경 5 — 수정 전 / 위치 확인]
destroy:function(){this.listview.destroy()
*/
/* [변경 5 — 수정 후]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.destroyFields(this);this.listview.destroy()
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * ["UWA/Controls/Abstract","DS/Windows/ImmersiveFrame","DS/Controls/ComboBox","DS/Controls/Button","DS/Windows/Dialog","DS/Controls/ModalLoader","DS/ENONewWidget/ENONew/Events","DS/ENONewWidget/ENONew/View/ENOListView","DS/ENONewWidget/ENONew/View/ENOTabView","DS/ENONewWidget/ENONew/View/TabUtility","DS/ENONewWidget/ENONew/View/ENOWizardView","DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper","i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls"]
 * function(e,t,i,n,a,o,r,s,c,l,d,u,f)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
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


/* [변경 1 — 수정 전 / 위치 확인]
o.myDialog=o.buildDialog(a),o.manageButtons(),t.activateDraftMode
*/
/* [변경 1 — 수정 후]
o.myDialog=o.buildDialog(a);o.manageButtons();var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.bindDialog(o);t.activateDraftMode
*/

/* [변경 2 — 수정 전 / 위치 확인]
onSubmitDialog:function(e){
*/
/* [변경 2 — 수정 후]
onSubmitDialog:function(e){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi&&!sdxECCAApi.canSubmitDialog(this)){this.resetButtonLabel();this.disableFormInput(false,false,true);return;}
*/

/* [변경 3 — 수정 전 / 위치 확인]
i?this.removeLoadingOverlay():this.addLoadingOverlay()},
*/
/* [변경 3 — 수정 후]
i?this.removeLoadingOverlay():this.addLoadingOverlay();var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.preserveValidationState(this)},
*/

/* [변경 4 — 수정 전 / 위치 확인]
destroy:function(){this.myDialog
*/
/* [변경 4 — 수정 후]
destroy:function(){var sdxECCAApi=sdxECCAGetApi();if(sdxECCAApi)sdxECCAApi.disposeDialog(this);this.myDialog
*/
