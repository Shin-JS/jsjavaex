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
/* [필수 표시 + 로딩 완료 연결 — 두 호출을 함께 적용]
 * onAttributesLoad 안에서 기존 코드가 response.attribute를 results[0].data로
 * 변환한 뒤, 실제 _onCompleteLoadModel 호출 직전에 prepareAttributes를 호출합니다.
 * 이 호출은 결과 메타데이터를 바꾸므로 반드시 폼 생성 전이어야 합니다.
 *
 * R2024x 예시: 모델=e, 응답=t
 *     if (!sdxECCAAutoClass.prepareAttributes(e,t)) return;
 *     n._onCompleteLoadModel(t,{initTable:!r,buildBehavior:l?d.FORCE_DEFAULT:d.NO_CHANGES});
 *     sdxECCAAutoClass.notifyAttributesLoaded(e,t);
 *
 * 현재 설치 소스 예시: modelList:[i], onAttributesLoad:function(r){...}
 * 모델=i, 응답=r이므로 다음처럼 연결합니다.
 *     if (!sdxECCAAutoClass.prepareAttributes(i,r)) return;
 *     기존컨트롤러.onCompleteLoadModel(r,{기존옵션유지});
 *     sdxECCAAutoClass.notifyAttributesLoaded(i,r);
 *
 * 기존 콤마 표현식에 추가한다면 위 세 문장으로 나누고 앞선 publish/로그/handle 해제는 유지합니다.
 * 함수명 앞의 컨트롤러 참조, _ 유무, 옵션은 설치 소스의 실제 원래 호출을 유지합니다.
 * 두 함수의 첫 인자는 ClassificationsFacet에서 tagClassModel로 표시한 동일 모델입니다.
 * notifyAttributesLoaded(r,e)처럼 모델/응답을 뒤집거나 prepare를 완료 호출 뒤에 두지 않습니다.
 * 기존 after-only notify 연결을 위 before/after 쌍으로 교체하며 중복 호출하지 않습니다.
 * 대상 위젯 외 모델에는 prepareAttributes가 true를 반환하고 응답을 변경하지 않습니다.
 */
