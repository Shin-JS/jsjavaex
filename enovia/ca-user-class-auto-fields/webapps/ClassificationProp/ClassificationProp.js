/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/sdxECCAAutoClass/sdxECCAAutoClass.js로 이동했습니다.
 * 예전 sdxECCA... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ClassificationProp/facets/Properties/ClassifPropController
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["UWA/Class/Model", "UWA/Core", "DS/WidgetServices/securityContextServices/SecurityContextServices", "DS/WidgetServices/WidgetServices", "DS/ClassificationProp/comm/EventManager", "DS/ClassificationProp/facets/Common/ClassifFacetsBase", "DS/ClassificationProp/models/ClassifPropModel", "DS/ClassificationProp/models/ClassifPropModelMerge", "DS/ClassificationProp/models/ClassifPropAttributeModel", "DS/ClassificationProp/ajaxRequests/ClassifPropAjaxRequests", "DS/ClassificationProp/facets/Properties/Properties", "DS/ClassificationProp/constants/ClassifPropConstants", "DS/ClassificationProp/constants/ConstantsMapping", "DS/ClassificationProp/comm/DistantAjax", "DS/ClassificationProp/utils/ClassifPropUtils", "DS/ClassificationProp/utils/ClassifPropControl", "DS/IPClassifyUtil/IPClassifyAlert", "i18n!DS/ClassificationProp/assets/nls/langEditProp", "DS/PlatformAPI/PlatformAPI", "DS/sdxECCAAutoClass/sdxECCAAutoClass"]
 * function(e,t,i,n,s,a,o,r,l,c,u,d,h,f,p,m,g,v,_,sdxECCAAutoClass){ ...기존 본문... }
 */
/* loadModels 안의 내부 v(e,t) -> onAttributesLoad(t)에서 기존 호출:
 *     n._onCompleteLoadModel(t,{initTable:!r,buildBehavior:l?d.FORCE_DEFAULT:d.NO_CHANGES})
 * 바로 뒤에 콤마로 추가:
 *     n._onCompleteLoadModel(t,{initTable:!r,buildBehavior:l?d.FORCE_DEFAULT:d.NO_CHANGES}),
 *     sdxECCAAutoClass.notifyAttributesLoaded(e,t)
 * e=현재 ClassifPropModel, t=속성 응답입니다.
 * getAttributesDone publish와 실제 _onCompleteLoadModel보다 뒤에서 통지합니다.
 * 기존 sdxECCANotifyAutoClassAttributes(e,t)를 위 호출로 바꾸며 중복 호출하지 않습니다.
 */
