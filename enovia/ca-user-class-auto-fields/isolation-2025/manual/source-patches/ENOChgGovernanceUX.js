/* 적용 메모 — 전체 파일 교체용 코드가 아닙니다.
 * 수정 대상: 새 전용 sdxECCA2025.js에 복사한 ENOChgGovernanceUX의 해당 AMD 모듈.
 * 공통 원본에 이 조각을 적용하지 않습니다.
 * 아래 부분 변경을 마친 다음 README의 전용 이름 치환을 적용합니다.
 * 각 [수정 전]을 해당 AMD 모듈 안에서 찾아 [수정 후]로 바꿉니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * ============================================================ */

/* [의존성 배열 수정 전]
["DS/ENONewWidget/ENONewLauncher","DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable","DS/ENOChgServices/scripts/services/UserPreferenceUtil","DS/ENOChgServices/scripts/services/DefaultPreferencesManager","i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS","DS/UIKIT/Mask","require"]
*/
/* [의존성 배열 수정 후 — 마지막에만 추가, 기존 순서 유지]
["DS/ENONewWidget/ENONewLauncher","DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable","DS/ENOChgServices/scripts/services/UserPreferenceUtil","DS/ENOChgServices/scripts/services/DefaultPreferencesManager","i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS","DS/UIKIT/Mask","require","DS/sdxECCAAutoClass/sdxECCAAutoClass"]
*/
/* [factory 인자 수정 전]
function(e,t,i,n,o,a,s)
*/
/* [factory 인자 수정 후 — CSS 등 빈 자리 인자도 유지]
function(e,t,i,n,o,a,s,sdxECCAAutoClass)
*/

/* [변경 1 — 수정 전]
(new e).CreateNew(d)
*/
/* [변경 1 — 수정 후]
(new e).CreateNew(sdxECCAAutoClass.configureCreateType(d))
*/

/* [변경 2 — 수정 전]
u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u)
*/
/* [변경 2 — 수정 후]
sdxECCAAutoClass.isEnabled()||(u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u))
*/
