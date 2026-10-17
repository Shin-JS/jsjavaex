/* OOTB 파일 변경·추가 부분만 적은 적용 메모입니다. 전체 파일 교체용이 아닙니다.
 * 함수 본문은 webapps/ZCAAutoClass/ZCAAutoClass.js로 이동했습니다.
 * 예전 zca... 함수 선언은 제거하고 아래 호출을 적용합니다. 중복 설치하지 않습니다.
 * 커스텀 의존성/인자는 항상 마지막입니다. 기존 의존성 순서는 바꾸지 않습니다.
 */

/* [의존성/인자] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * 원본 define의 의존성 배열과 factory 인자를 아래처럼 바꿉니다. 본문은 유지합니다.
 * ["DS/ENONewWidget/ENONewLauncher", "DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable", "DS/ENOChgServices/scripts/services/UserPreferenceUtil", "DS/ENOChgServices/scripts/services/DefaultPreferencesManager", "i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS", "DS/UIKIT/Mask", "require", "DS/ZCAAutoClass/ZCAAutoClass"]
 * function(e,t,i,n,o,a,s,ZcaAutoClass){ ...기존 본문... }
 */
/* launchCreateChangeActionDialog(r)의 기존 d 생성 옵션 구성 뒤:
 *     (new e).CreateNew(d)
 * 를 다음으로 변경:
 *     (new e).CreateNew(ZcaAutoClass.configureCreateType(d))
 * onSuccess의 CA_DEF_TYPE 할당+saveUserPreference는 함께 조건 처리:
 *     if(!ZcaAutoClass.isEnabled()){
 *         u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type;
 *         i.saveUserPreference(u);
 *     }
 * d는 기존 context/options/facets/events를 가진 옵션 객체입니다.
 * 목록/상세 갱신, onFailure/onCancel, 분류 facet 옵션은 유지합니다.
 */
