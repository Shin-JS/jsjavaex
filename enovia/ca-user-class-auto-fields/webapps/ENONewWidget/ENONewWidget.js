/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/ZCAAutoClass/ZCAAutoClass.js로 이동했습니다.
 * 예전 zca... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["DS/ENONewWidget/utils/ENONewFacetConstants", "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls", "i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,ZcaAutoClass){ ...기존 본문... }
 */
/* getFacetList(e,t,i)의 최종 facet 배열 a를 반환하기 직전:
 *     ZcaAutoClass.attachBridge(e,a,i);
 * 기존 zcaAttachAutoBridge(e,a,i) 호출을 위 호출로 바꿉니다.
 * e는 data, a는 최종 배열, i는 settings입니다. 함수 밖에 넣지 않습니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Core", "DS/UIKIT/Scroller", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase", "DS/ENONewWidget/ENONew/View/ENOListView", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,n,a,ZcaAutoClass){ ...기존 본문... }
 */
/* init(t)의 _parent(t) 뒤, listview.buildModel(t.data)보다 앞:
 *     ZcaAutoClass.prepareFixedType(t.data,t.zcaAutoSession);
 * init(t)의 listview.loadView() 뒤:
 *     ZcaAutoClass.installFields(this,t);
 * updateFacet(e) 첫 줄:
 *     ZcaAutoClass.checkFacetContext(this,e);
 * destroy()의 listview.destroy() 앞:
 *     ZcaAutoClass.destroyFields(this);
 * 기존 onChangeAttribute 콜백 안의 New-SecurityContext 분기(n=e[t] 뒤):
 *     if(i.zcaAutoSession)i.zcaAutoSession.checkContext(n.valueDB);
 * New-Type 분기(n=e[t] 뒤):
 *     if(i.zcaAutoSession)i.zcaAutoSession.checkType(n.valueDB);
 * 기존 publishInfo와 o(e)는 유지합니다. 세션은 여전히 facet 인스턴스의 값입니다.
 */

/* [의존성/인자] DS/ENONewWidget/ENONew/Controller/ENONewDialogController
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Controls/Abstract", "DS/Windows/ImmersiveFrame", "DS/Controls/ComboBox", "DS/Controls/Button", "DS/Windows/Dialog", "DS/Controls/ModalLoader", "DS/ENONewWidget/ENONew/Events", "DS/ENONewWidget/ENONew/View/ENOListView", "DS/ENONewWidget/ENONew/View/ENOTabView", "DS/ENONewWidget/ENONew/View/ENOWizardView", "DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper", "i18n!DS/ENONewWidget/assets/nls/ENONewWidgetNls", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,n,a,o,r,s,c,l,u,d,ZcaAutoClass){ ...기존 본문... }
 */
/* onSubmitDialog(e) 첫 줄(기존 ServiceCallback 실행보다 앞):
 *     if(!ZcaAutoClass.canSubmitDialog(this)){this.resetButtons();return;}
 * destroy() 첫 줄:
 *     ZcaAutoClass.disposeDialog(this);
 * 기존 생성, 취소, postCreation 처리는 그대로 유지합니다.
 */
