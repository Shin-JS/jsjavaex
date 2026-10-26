/* 변경 전 2025 OOTB 원본에 처음 적용하는 수정 메모입니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 이전 zca/sdxECCA 수정이 없는 2025 원본.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 그 모듈 안의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * [수정 전]은 원본에서 찾을 정확한 코드 조각입니다.
 * define 의존성/인자는 변경하지 않습니다. 새 커스텀 의존성을 추가하지 않습니다.
 */

/* [2025 OOTB 헤더 유지] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * ["DS/ENONewWidget/ENONewLauncher","DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable","DS/ENOChgServices/scripts/services/UserPreferenceUtil","DS/ENOChgServices/scripts/services/DefaultPreferencesManager","i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS","DS/UIKIT/Mask","require"]
 * function(e,t,i,n,o,a,s)
 * 확인용 원본 헤더입니다. 의존성/인자를 추가하거나 제거하지 않습니다.
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

/* [호출 인자 확인]
 * d: 원본의 생성 옵션, e: 원본 ENONewLauncher, s: 원본 AMD require,
 * r: 원본 launchCreateChangeActionDialog의 인자입니다.
 * 커스텀 타입 지정은 sdxECCA.js에서 처리하므로 원본 type/typeName을 직접 바꾸지 않습니다.
 */

/* [변경 1 — 원본에서 찾을 부분]
(new e).CreateNew(d)
*/
/* [변경 1 — 아래 코드로 교체]
sdxECCALaunch(d,e,s,r)
*/

/* [변경 2 — 원본에서 찾을 부분]
u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u)
*/
/* [변경 2 — 아래 코드로 교체]
sdxECCAIsEnabled()||(u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u))
*/
