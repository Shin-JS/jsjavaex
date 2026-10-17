/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/ZCAAutoClass/ZCAAutoClass.js로 이동했습니다.
 * 예전 zca... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ClassificationsFacet/PLMNewClassificationFacet
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase", "UWA/Core", "UWA/Class/Options", "UWA/Class/Events", "DS/PADUtils/PADSettingsMgt", "DS/ClassificationProp/models/ClassifPropModel", "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel", "DS/ClassificationsFacet/InitClassificationCmpUI", "DS/IPClassifyUtil/IPClassifyUtility", "css!DS/ClassificationsFacet/ClassificationsFacet.css", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,o,n,s,a,r,l,zcaCss,ZcaAutoClass){ ...기존 본문... }
 */
/* 중요: 기존 CSS 의존성도 자리를 차지합니다. zcaCss는 그 값을 받는 자리 인자입니다.
 * init(e) 시작에 콜백용 인스턴스 참조:
 *     var zcaFacet=this;
 * 기존 currentSecurityContext 구독 콜백에서 securityContext=e 처리 뒤:
 *     if(zcaFacet.zcaAutoSession){
 *         zcaFacet.zcaAutoContext=e;
 *         zcaFacet.zcaAutoSession.checkContext(e);
 *     }
 * init(e)의 initUI/getUI/구독 설정이 끝난 뒤:
 *     ZcaAutoClass.connectClassification(this,e);
 * plmNewContextProvider의 반환문:
 *     return this.zcaAutoSession ? this.zcaAutoContext : securityContext;
 * destroy() 첫 줄:
 *     ZcaAutoClass.disconnectClassification(this);
 * 기존 getUI/postCreation/_parent 처리는 유지합니다.
 */

/* [의존성/인자] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Controls/Abstract", "UWA/Class/Options", "UWA/Class/Events", "DS/WUXAutoComplete/AutoComplete", "DS/Controls/Button", "DS/Controls/TooltipModel", "DS/Windows/ImmersiveFrame", "DS/Windows/Dialog", "DS/Controls/Loader", "DS/Controls/ModalContainer", "DS/Controls/Accordeon", "DS/ClassificationsFacet/utils/PLMNewClassificationFacetData", "DS/TreeModel/TreeDocument", "DS/Controls/Popup", "DS/ClassificationProp/facets/Properties/Properties", "DS/ClassificationProp/models/ClassifPropModel", "DS/ClassificationProp/ClassifPropWidget", "DS/ClassificationProp/constants/ClassifPropConstants", "DS/ClassificationProp/comm/EventManager", "DS/PADUtils/PADSettingsMgt", "DS/ClassificationProp/utils/ClassifPropControl", "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel", "DS/IPClassifyUtil/IPClassifyPreference", "DS/IPClassifyUtil/IPClassifyAlert", "css!DS/ClassificationsFacet/ClassificationsFacet.css", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,o,n,s,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,A,zcaCss,ZcaAutoClass){ ...기존 본문... }
 */
/* 중요: zcaCss와 ZcaAutoClass를 둘 다 위 순서대로 추가합니다.
 * createAutocompleteComponent의 내부 var v=function(e,t,i)에서:
 *     var o=new h({objectId:e});
 *     r.classifPropModels.push(o),w.publish(...)
 * push(o)와 w.publish 사이에 한 호출을 추가:
 *     r.classifPropModels.push(o),ZcaAutoClass.tagClassModel(r,o,e),w.publish(...)
 * r=기존 컨트롤러, o=새 ClassifPropModel, e=클래스 ID입니다.
 * 함수 선언이 모듈로 이동해도 이 호출은 생략할 수 없습니다.
 * 기존 getAttributesDone 구독, initDatas, 삭제 처리는 유지합니다.
 */
