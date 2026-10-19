/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/sdxECCAAutoClass/sdxECCAAutoClass.js로 이동했습니다.
 * 예전 sdxECCA... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["DS/ENONewWidget/utils/ENONewFacetConstants", "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls", "i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,sdxECCAAutoClass){ ...기존 본문... }
 */
/* getFacetList(e,t,i)의 최종 facet 배열 a를 반환하기 직전:
 *     sdxECCAAutoClass.attachBridge(e,a,i);
 * 기존 sdxECCAAttachAutoBridge(e,a,i) 호출을 위 호출로 바꿉니다.
 * e는 data, a는 최종 배열, i는 settings입니다. 함수 밖에 넣지 않습니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Core", "DS/UIKIT/Scroller", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase", "DS/ENONewWidget/ENONew/View/ENOListView", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,n,a,sdxECCAAutoClass){ ...기존 본문... }
 */
/* init(t)의 _parent(t) 뒤, listview.buildModel(t.data)보다 앞:
 *     sdxECCAAutoClass.prepareFixedType(t.data,t.sdxECCAAutoSession);
 * init(t)의 listview.loadView() 뒤:
 *     sdxECCAAutoClass.installFields(this,t);
 * updateFacet(e) 첫 줄:
 *     sdxECCAAutoClass.checkFacetContext(this,e);
 * destroy()의 listview.destroy() 앞:
 *     sdxECCAAutoClass.destroyFields(this);
 */

/* [onChangeAttribute — 현재 설치 소스의 publishAttributeInfo 방식]
 * 사용자 제공 원본 콜백:
 *     e => {for(var t in e){var n=e[t];i.publishAttributeInfo(n)}o(e)}
 * 기존 onChangeAttribute 할당 대상은 그대로 두고, 우변 콜백을 아래처럼 변경합니다.
 * i는 기존 ENOListViewFacet 인스턴스, o는 원래 onChangeAttribute 콜백입니다.
 * for문의 t는 이벤트 키이며 바깥 init(t)의 옵션 인자와 구분해서 읽습니다.
 *
 * e => {
 *     for (var t in e) {
 *         var n = e[t];
 *
 *         if (i.sdxECCAAutoSession) {
 *             if (t === "New-SecurityContext") {
 *                 i.sdxECCAAutoSession.checkContext(n.valueDB);
 *             } else if (t === "New-Type") {
 *                 i.sdxECCAAutoSession.checkType(n.valueDB);
 *             }
 *         }
 *
 *         i.publishAttributeInfo(n);
 *     }
 *     o(e);
 * }
 *
 * publishAttributeInfo(n)는 항목마다, o(e)는 반복문 뒤에 한 번 호출하도록 유지합니다.
 * 세션이 없는 다른 위젯에서는 원래 두 호출만 실행됩니다.
 * New-SecurityContext/New-Type 키와 n.valueDB가 유지되는 설치 소스 기준입니다.
 * 이 방식에서는 예전 publishInfo 분기 코드를 추가로 중복 삽입하지 않습니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Controls/Abstract", "DS/Windows/ImmersiveFrame", "DS/Controls/ComboBox", "DS/Controls/Button", "DS/Windows/Dialog", "DS/Controls/ModalLoader", "DS/ENONewWidget/ENONew/Events", "DS/ENONewWidget/ENONew/View/ENOListView", "DS/ENONewWidget/ENONew/View/ENOTabView", "DS/ENONewWidget/ENONew/View/ENOWizardView", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper", "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,n,a,o,r,s,c,l,u,d,sdxECCAAutoClass){ ...기존 본문... }
 */
/* onSubmitDialog(e) 첫 줄(기존 ServiceCallback 실행보다 앞):
 *     if(!sdxECCAAutoClass.canSubmitDialog(this)){this.resetButtons();return;}
 * destroy() 첫 줄:
 *     sdxECCAAutoClass.disposeDialog(this);
 * 기존 생성, 취소, postCreation 처리는 그대로 유지합니다.
 */
