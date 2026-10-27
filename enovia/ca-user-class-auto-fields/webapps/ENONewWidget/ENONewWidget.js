/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 그 모듈 안의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * [수정 전]은 원본에서 찾을 정확한 코드 조각입니다.
 * define 의존성/인자는 변경하지 않습니다. 새 커스텀 의존성을 추가하지 않습니다.
 */

/* [찾는 위치 안내]
 * A. ENONewFacetHelper: getFacetList의 변경 1·2는 반드시 함께 적용합니다.
 * B. ENOListViewFacet: 변경 4는 init(t) 안의 onChangeAttribute 콜백입니다.
 * C. ENONewDialogController: 여기의 변경 4는 destroy() 정리 처리입니다.
 * 원본에서 찾을 부분은 검색용으로 그대로 두고, 교체 코드는 여러 줄로 표시합니다.
 * 아래 조각의 마지막이 this.skeleton = 또는 this.myDialog처럼 끝나면,
 * 원래 뒤에 이어지는 코드는 그대로 남겨 연결합니다.
 */

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * [
 *     "DS/ENONewWidget/utils/ENONewFacetConstants",
 *     "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls",
 *     "i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls"
 * ]
 * function(e,t,i)
 * 확인용 원본 헤더입니다. 의존성/인자는 변경하지 않습니다.
 */

/* ============================================================
 * [A] [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 A1] getFacetList(e, t, i)의 return 시작 부분. 변경 2와 함께 적용합니다. */
/* [변경 1 — 원본에서 찾을 부분]
return o.options.data=e
*/
/* [변경 1 — 아래 코드로 교체]
o.options.data = e
*/

/* [위치 A2] 같은 getFacetList 끝, getDefaultFacet 정의 바로 앞. 반환값 a를 유지합니다. */
/* [변경 2 — 원본에서 찾을 부분]
})),a},getDefaultFacet:
*/
/* [변경 2 — 아래 코드로 교체]
}));

var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) {
    sdxECCAApi.attachBridge(e, a, i);
}

return a;
},
getDefaultFacet:
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * [
 *     "UWA/Core",
 *     "DS/UIKIT/Scroller",
 *     "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase",
 *     "DS/ENONewWidget/ENONew/View/ENOListView",
 *     "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper"
 * ]
 * function(e,t,i,n,a)
 * 확인용 원본 헤더입니다. 의존성/인자는 변경하지 않습니다.
 */

/* ============================================================
 * [B] [대상 AMD 모듈] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 B1] init(t): this._parent(t) 다음, this.skeleton 생성 전. */
/* [변경 1 — 원본에서 찾을 부분]
this._parent(t),this.skeleton=
*/
/* [변경 1 — 아래 코드로 교체]
this._parent(t);

var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) {
    sdxECCAApi.prepareFixedType(t.data, t.sdxECCAAutoSession);
}

this.skeleton =
*/

/* [위치 B2] 같은 init(t): this.listview.loadView() 다음, updateFacet 정의 전. */
/* [변경 2 — 원본에서 찾을 부분]
this.listview.loadView()},updateFacet:
*/
/* [변경 2 — 아래 코드로 교체]
this.listview.loadView();

if (sdxECCAApi) {
    sdxECCAApi.installFields(this, t);
}
},
updateFacet:
*/

/* [위치 B3] updateFacet(e)의 시작 부분. */
/* [변경 3 — 원본에서 찾을 부분]
updateFacet:function(e){
*/
/* [변경 3 — 아래 코드로 교체]
updateFacet: function (e) {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) {
        if (sdxECCAApi.checkFacetContext(this, e) === false) return;
    }

*/

/* [위치 B4] init(t)의 t.events.onChangeAttribute 콜백 전체. 아래 위치 안내 참고. */
/* [변경 4의 정확한 위치 — B4]
 * 1. 먼저 DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet 모듈을 찾습니다.
 * 2. 그 안의 init: function(t)로 이동합니다.
 * 3. t.events.onChangeAttribute 또는 var o=t.events.onChangeAttribute를 검색합니다.
 * 4. 아래 원본 블록을 통째로 교체합니다. var o부터 publishAttribute 바인딩 뒤 쉼표까지입니다.
 * 5. 뒤의 this.publishInfoForObjectInit(t), this.listview 생성 등은 유지합니다.
 * ENONewDialogController의 onChangeAttribute와 혼동하지 않습니다.
 */
/* [변경 4 — 원본에서 찾을 부분]
var o=t.events.onChangeAttribute;t.events.onChangeAttribute=e=>{for(var t in e){var n=e[t];i.publishAttributeInfo(n)}o(e)},t.events.publishAttribute=this.publishAttributeInfo.bind(this),
*/
/* [변경 4 — 아래 코드로 교체]
var o = t.events.onChangeAttribute;

t.events.onChangeAttribute = e => {
    for (var t in e) {
        var n = e[t];

        // [추가] 우리 생성창에 세션이 있을 때만 문맥/유형을 확인합니다.
        if (i.sdxECCAAutoSession) {
            if (t === "New-SecurityContext") {
                i.sdxECCAAutoSession.currentContext = n.valueDB;
                i.sdxECCAAutoSession.changeContext(n.valueDB);
            } else if (t === "New-Type") {
                i.sdxECCAAutoSession.checkType(n.valueDB);
            }
        }

        // [원본 유지] 항목마다 속성 정보를 발행합니다.
        i.publishAttributeInfo(n);
    }

    // [원본 유지] 원래 콜백은 반복문 밖에서 한 번 호출합니다.
    o(e);
};

t.events.publishAttribute = this.publishAttributeInfo.bind(this);

*/

/* [위치 B5] ENOListViewFacet의 destroy(): this.listview.destroy() 전. */
/* [변경 5 — 원본에서 찾을 부분]
destroy:function(){this.listview.destroy()
*/
/* [변경 5 — 아래 코드로 교체]
destroy: function () {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) {
        sdxECCAApi.destroyFields(this);
    }

    this.listview.destroy()
*/

/* [2025 OOTB 헤더 유지] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * [
 *     "UWA/Controls/Abstract",
 *     "DS/Windows/ImmersiveFrame",
 *     "DS/Controls/ComboBox",
 *     "DS/Controls/Button",
 *     "DS/Windows/Dialog",
 *     "DS/Controls/ModalLoader",
 *     "DS/ENONewWidget/ENONew/Events",
 *     "DS/ENONewWidget/ENONew/View/ENOListView",
 *     "DS/ENONewWidget/ENONew/View/ENOTabView",
 *     "DS/ENONewWidget/ENONew/View/TabUtility",
 *     "DS/ENONewWidget/ENONew/View/ENOWizardView",
 *     "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper",
 *     "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls"
 * ]
 * function(e,t,i,n,a,o,r,s,c,l,d,u,f)
 * 확인용 원본 헤더입니다. 의존성/인자는 변경하지 않습니다.
 */

/* ============================================================
 * [C] [대상 AMD 모듈] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
// 해당 AMD factory 안, return/클래스 정의보다 앞에 한 번 추가합니다.
function sdxECCAGetApi() {
    return typeof widget === "undefined" ? null : widget.sdxECCARuntime;
}


/* [위치 C1] setup()의 Promise then 안: o.myDialog 생성과 o.manageButtons() 뒤. */
/* [변경 1 — 원본에서 찾을 부분]
o.myDialog=o.buildDialog(a),o.manageButtons(),t.activateDraftMode
*/
/* [변경 1 — 아래 코드로 교체]
o.myDialog = o.buildDialog(a);
o.manageButtons();

var sdxECCAApi = sdxECCAGetApi();
if (sdxECCAApi) {
    sdxECCAApi.bindDialog(o);
}

t.activateDraftMode
*/

/* [위치 C2] onSubmitDialog(e)의 시작 부분. */
/* [변경 2 — 원본에서 찾을 부분]
onSubmitDialog:function(e){
*/
/* [변경 2 — 아래 코드로 교체]
onSubmitDialog: function (e) {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi && !sdxECCAApi.canSubmitDialog(this)) {
        this.resetButtonLabel();
        this.disableFormInput(false, false, true);
        return;
    }

*/

/* [위치 C3] disableFormInput(e, t, i) 메서드 전체. 끝 쉼표까지 교체합니다. */
/* [변경 3 — 원본에서 찾을 부분]
disableFormInput:function(e=!0,t=!0,i=!1){this.disableSubmitButton(e),this.disableRepeatButton(t),i?this.removeLoadingOverlay():this.addLoadingOverlay()},
*/
/* [변경 3 — 아래 코드로 교체]
disableFormInput: function (e = true, t = true, i = false) {
    this.disableSubmitButton(e);
    this.disableRepeatButton(t);

    if (i) {
        this.removeLoadingOverlay();
    } else {
        this.addLoadingOverlay();
    }

    // [추가] 버튼 복원 뒤 우리 분류 검증 결과를 반영합니다.
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) {
        sdxECCAApi.preserveValidationState(this);
    }
},
*/

/* [위치 C4] ENONewDialogController의 destroy(): this.myDialog 정리 전. */
/* [변경 4 — 원본에서 찾을 부분]
destroy:function(){this.myDialog
*/
/* [변경 4 — 아래 코드로 교체]
destroy: function () {
    var sdxECCAApi = sdxECCAGetApi();
    if (sdxECCAApi) {
        sdxECCAApi.disposeDialog(this);
    }

    this.myDialog
*/
