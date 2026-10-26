/* 기존 작업 폴더의 OOTB 수정 메모 — 파일 전체 덮어쓰기용이 아닙니다.
 * 기준: 2025. 기존 생성/분류 코드는 유지하고 아래 연결 부분만 갱신합니다.
 * [먼저 제거] 과거 추가한 define 의존성 "DS/sdxECCAAutoClass/sdxECCAAutoClass"와
 * 그에 대응하는 마지막 factory 인자 sdxECCAAutoClass만 제거합니다.
 * 기존 OOTB 의존성/인자는 순서를 포함해 유지합니다. 별도 원복/소스 복사는 하지 않습니다.
 * 이미 넣은 커스텀 호출은 아래 조건부 호출로 교체합니다. 중복 추가하지 않습니다.
 * 아래 수정 전은 위치를 찾기 위한 변경 전 2025 원본 조각입니다.
 */

/* [2025 OOTB 헤더 유지] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * ["DS/ENONewWidget/ENONewLauncher","DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable","DS/ENOChgServices/scripts/services/UserPreferenceUtil","DS/ENOChgServices/scripts/services/DefaultPreferencesManager","i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS","DS/UIKIT/Mask","require"]
 * function(e,t,i,n,o,a,s)
 * 위 원래 의존성/인자는 유지하고 과거 커스텀 의존성/인자만 제거합니다.
 */

/* ============================================================
 * [대상 AMD 모듈] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * [추가 위치] 이 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣어 strict 동작을 유지합니다.
 * 함수를 파일 맨 끝이나 다른 factory에 넣지 않습니다.
 * ============================================================ */
// ChgCreateChangeAction의 AMD factory 안, return { ... } 앞에 추가합니다.
function sdxECCAIsEnabled() {
    if (typeof widget === "undefined") return false;
    var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
    return enabled === true || enabled === "true";
}

function sdxECCALaunch(options, Launcher, localRequire, command) {
    if (!sdxECCAIsEnabled()) {
        // 일반 위젯은 커스텀 파일을 요청하지 않고 원래 흐름으로 실행합니다.
        return (new Launcher).CreateNew(options);
    }
    function fail(error) {
        if (command) command.isClickProcessing = false;
        console.error("[sdxECCA] 생성창 준비에 실패했습니다.", error);
    }
    try {
        localRequire(["DS/sdxECCA/sdxECCA"], function (entry) {
            try {
                entry.launch(options, function (configuredOptions) {
                    return (new Launcher).CreateNew(configuredOptions);
                });
            } catch (error) { fail(error); }
        }, fail);
    } catch (error) { fail(error); }
}

/* [기존 적용에서 교체할 호출]
(new e).CreateNew(sdxECCAAutoClass.configureCreateType(d))
 * 위 호출도 아래 sdxECCALaunch(d,e,s,r) 한 호출로 바꿉니다.
 * 커스텀 타입 지정은 새 sdxECCA.js 안에서 실행합니다.
 * s는 2025 원본의 require 인자입니다.
 */

/* [변경 1 — 수정 전 / 위치 확인]
(new e).CreateNew(d)
*/
/* [변경 1 — 수정 후]
sdxECCALaunch(d,e,s,r)
*/

/* [변경 2 — 수정 전 / 위치 확인]
u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u)
*/
/* [변경 2 — 수정 후]
sdxECCAIsEnabled()||(u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u))
*/
