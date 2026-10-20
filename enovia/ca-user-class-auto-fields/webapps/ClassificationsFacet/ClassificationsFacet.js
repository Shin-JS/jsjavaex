/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/sdxECCAAutoClass/sdxECCAAutoClass.js로 이동했습니다.
 * 예전 sdxECCA... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ClassificationsFacet/PLMNewClassificationFacet
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase", "UWA/Core", "UWA/Class/Options", "UWA/Class/Events", "DS/PADUtils/PADSettingsMgt", "DS/ClassificationProp/models/ClassifPropModel", "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel", "DS/ClassificationsFacet/InitClassificationCmpUI", "DS/IPClassifyUtil/IPClassifyUtility", "css!DS/ClassificationsFacet/ClassificationsFacet.css", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,o,n,s,a,r,l,sdxECCACss,sdxECCAAutoClass){ ...기존 본문... }
 */
/* 중요: 기존 CSS 의존성도 자리를 차지합니다. sdxECCACss는 그 값을 받는 자리 인자입니다.
 * init(e) 시작에 콜백용 인스턴스 참조:
 *     var sdxECCAFacet=this;
 * 기존 currentSecurityContext 구독 콜백에서 securityContext=e 처리 뒤:
 *     if(sdxECCAFacet.sdxECCAAutoSession){
 *         sdxECCAFacet.sdxECCAAutoContext=e;
 *         sdxECCAFacet.sdxECCAAutoSession.checkContext(e);
 *     }
 * init(e)의 initUI/getUI/구독 설정이 끝난 뒤:
 *     sdxECCAAutoClass.connectClassification(this,e);
 * plmNewContextProvider의 반환문:
 *     return this.sdxECCAAutoSession ? this.sdxECCAAutoContext : securityContext;
 * destroy() 첫 줄:
 *     sdxECCAAutoClass.disconnectClassification(this);
 * 기존 getUI/postCreation/_parent 처리는 유지합니다.
 */

/* [의존성/인자] DS/ClassificationsFacet/PLMNewCommomCmpUXController
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Controls/Abstract", "UWA/Class/Options", "UWA/Class/Events", "DS/WUXAutoComplete/AutoComplete", "DS/Controls/Button", "DS/Controls/TooltipModel", "DS/Windows/ImmersiveFrame", "DS/Windows/Dialog", "DS/Controls/Loader", "DS/Controls/ModalContainer", "DS/Controls/Accordeon", "DS/ClassificationsFacet/utils/PLMNewClassificationFacetData", "DS/TreeModel/TreeDocument", "DS/Controls/Popup", "DS/ClassificationProp/facets/Properties/Properties", "DS/ClassificationProp/models/ClassifPropModel", "DS/ClassificationProp/ClassifPropWidget", "DS/ClassificationProp/constants/ClassifPropConstants", "DS/ClassificationProp/comm/EventManager", "DS/PADUtils/PADSettingsMgt", "DS/ClassificationProp/utils/ClassifPropControl", "i18n!DS/ClassificationsFacet/assets/nls/PLMNewCommCmpSel", "DS/IPClassifyUtil/IPClassifyPreference", "DS/IPClassifyUtil/IPClassifyAlert", "css!DS/ClassificationsFacet/ClassificationsFacet.css", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,o,n,s,a,r,l,c,d,p,u,f,m,h,C,g,w,v,y,P,I,A,sdxECCACss,sdxECCAAutoClass){ ...기존 본문... }
 */
/* 중요: sdxECCACss와 sdxECCAAutoClass를 둘 다 위 순서대로 추가합니다.
 * createAutocompleteComponent의 내부 var v=function(e,t,i)에서:
 *     var o=new h({objectId:e});
 *     r.classifPropModels.push(o),w.publish(...)
 * push(o)와 w.publish 사이에 한 호출을 추가:
 *     r.classifPropModels.push(o),sdxECCAAutoClass.tagClassModel(r,o,e),w.publish(...)
 * r=기존 컨트롤러, o=새 ClassifPropModel, e=클래스 ID입니다.
 * 함수 선언이 모듈로 이동해도 이 호출은 생략할 수 없습니다.
 * 기존 getAttributesDone 구독, initDatas, 삭제 처리는 유지합니다.
 */

/* [문맥 검사 주의]
 * checkContext는 securityContext 문자열을 받습니다. init 옵션 객체 전체를 넘기지 않습니다.
 * 현재 설치 코드의 전달값이 옵션 객체인 경우 checkContext(options.securityContext)로 전달합니다.
 * 이미 문자열을 넘기는 호출까지 일괄적으로 .securityContext를 붙이지 않습니다.
 * tagClassModel은 이 파일의 공통 컨트롤러 모델 push 뒤에 둡니다. ClassificationProp.js가 아닙니다.
 * 컨트롤러/모델의 속성명은 모두 sdxECCAAutoSession으로 대소문자까지 통일합니다.
 */

/* 필수 입력에 따른 생성 버튼 상태:
 * connectClassification(this,e)가 OOTB setFacetValidation에 자동 연결합니다.
 * 숨긴 classificationFacet 자체와 getOccurrence/setValidation 연결은 유지해야 합니다.
 * 모델 onChangeAttributes 구독과 종료 시 해제는 main 모듈이 처리합니다.
 * 필수 별표는 prepareAttributes의 mandatory 메타데이터로 OOTB 폼에서 생성합니다.
 * 별표 HTML이나 필수 표시용 CSS를 추가하지 않습니다.
 */
