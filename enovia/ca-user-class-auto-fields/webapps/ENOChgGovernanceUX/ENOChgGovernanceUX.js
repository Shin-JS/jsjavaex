/* 기존 커스텀 ENOChgGovernanceUX.js에 적용하는 생성 진입 수정 메모입니다.
 * R2026x 원본의 실제 AMD 헤더/축약 변수/생성 호출을 기준으로 합니다.
 * 참조 blob: 2e8f017f2471ff3fd657b862f2c4e201f9932906
 * 설치본의 모듈명과 실제 생성 호출 위치를 기준으로 적용합니다.
 * 이 파일 전체를 OOTB에 덮어쓰지 않습니다.
 * [출발 상태] 기존 커스텀 생성 모듈. G0/G1/G2가 있으면 해당 연결만 갱신합니다.
 * [추가] 각 대상 AMD factory 안에 표시된 함수를 한 번 추가합니다.
 * [교체] 같은 모듈의 모든 [변경 N]을 번호 순서대로 적용합니다.
 * 원본에서 찾을 부분은 검색용이며 교체 코드는 여러 줄로 표시합니다.
 * define 의존성/인자는 변경하지 않습니다.
 */
/* [작업 지도 — 이 AMD 모듈 안에서만 세 군데 작업합니다]
 * 검색: DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * G0: factory 시작의 function(e,t,i,n,o,a,s){ 와 원래 return{ 사이에 함수 두 개 추가.
 * G1: launchCreateChangeActionDialog(r)의 맨 마지막 (new e).CreateNew(d)만 교체.
 * G2: events.onSuccess의 마지막 let p={}부터 saveUserPreference(p)까지 교체.
 * Change Order는 아래 CO0/CO1/CO2를 별도 factory에 적용합니다. Change Request는 수정하지 않습니다.
 */

/* [2026 OOTB 헤더 유지] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * [
 *     "DS/ENONewWidget/ENONewLauncher",
 *     "DS/ENOChgServices/scripts/services/ChgServiceGlobalVariable",
 *     "DS/ENOChgServices/scripts/services/UserPreferenceUtil",
 *     "DS/ENOChgServices/scripts/services/DefaultPreferencesManager",
 *     "i18n!DS/ENOChgGovernanceUX/assets/nls/ENOChgGovernanceNLS",
 *     "DS/UIKIT/Mask",
 *     "require"
 * ]
 * function(e,t,i,n,o,a,s)
 * 확인용입니다. 이 의존성 배열과 인자는 그대로 둡니다.
 */

/* ============================================================
 * [G0] [대상 AMD 모듈] DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * [추가 위치] 해당 factory 안, 원래 return 또는 클래스 선언보다 앞.
 * use strict가 있으면 그 문장 다음에 넣습니다.
 * 다른 factory나 파일 맨 끝에 넣지 않습니다.
 * ============================================================ */
/* [G0 위치 찾기]
 * 1. 위 AMD 모듈 이름으로 검색합니다.
 * 2. 그 define의 의존성 배열 뒤 function(e,t,i,n,o,a,s){ 를 찾습니다.
 * 3. 원본은 곧바로 return{launchCreateChangeActionDialog:... 로 이어집니다.
 * 4. function의 여는 { 다음, 그 return 앞에 아래 함수 두 개를 붙여넣습니다.
 * s는 의존성 배열의 require와 대응합니다. 인자를 새로 추가하지 않습니다.
 */
// 아래 두 함수를 같은 ChgCreateChangeAction factory 안에 한 번 추가합니다.
function sdxECCAIsEnabled() {
    if (typeof widget === "undefined") {
        return false;
    }

    var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
    return enabled === true || enabled === "true";
}

function sdxECCALaunch(options, Launcher, localRequire, command) {
    if (!sdxECCAIsEnabled()) {
        // [원본 흐름] 일반 위젯은 커스텀 파일을 요청하지 않습니다.
        return (new Launcher).CreateNew(options);
    }

    function fail(error) {
        if (command) {
            command.isClickProcessing = false;
        }
        console.error("[sdxECCA] 생성창 준비에 실패했습니다.", error);
    }

    try {
        localRequire(["DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService"], function (entry) {
            try {
                // 대상 생성창만 전용 상속 엔진으로 실행합니다.
                entry.launch(options);
            } catch (error) {
                fail(error);
            }
        }, fail);
    } catch (error) {
        fail(error);
    }
}


/* [위치 G1] launchCreateChangeActionDialog(r)의 마지막 생성 호출. */
/* [G1 앞뒤 위치]
 * 함수: launchCreateChangeActionDialog: function(r)
 * 원래 d={context:..., options:..., facets:..., events:...}를 구성한 다음입니다.
 * 확인한 2026 원본에서는 cloudProbeUtils.genericCommandClickEventForAnalytics(...)
 * 호출 바로 다음에 (new e).CreateNew(d)가 있습니다.
 * 검색 문자열: (new e).CreateNew(d)
 * CreateNew 호출만 바꾸고 바로 뒤의 t.setDialogEventForLoader()는 유지합니다.
 * 앞뒤 쉼표와 메서드를 닫는 괄호도 유지합니다.
 * 원본 options/type/typeName/facets와 기존 이벤트 본문은 여기서 바꾸지 않습니다.
 */
/* [변경 1 — 원본에서 찾을 부분]
(new e).CreateNew(d),t.setDialogEventForLoader()
*/
/* [변경 1 — 아래 코드로 교체]
sdxECCALaunch(
    d, // 원본 생성 옵션
    e, // 원본 ENONewLauncher
    s, // 원본 AMD require
    r  // 원본 launchCreateChangeActionDialog 인자
),
// 2026 원래 로더 이벤트 연결 유지
t.setDialogEventForLoader()
*/

/* [위치 G2] 같은 함수의 events.onSuccess 콜백 끝, 기본 타입 저장 부분. */
/* [G2 앞뒤 위치]
 * 함수: launchCreateChangeActionDialog의 events.onSuccess: function(e)
 * 기존 목록/상세 갱신과 displayObjectInfoInsideIDcard(o,true) 호출 다음입니다.
 * 검색 문자열: CA_DEF_TYPE 또는 i.saveUserPreference(p)
 * let p={}부터 i.saveUserPreference(p) 끝까지를 아래 코드로 교체합니다.
 * 다음 onFailure/onCancel과 onSuccess를 닫는 } 및 구분 쉼표는 유지합니다.
 * G1의 d/e/s/r과 이 onSuccess 안의 e는 다른 함수의 지역변수입니다.
 */
/* [변경 2 — 원본에서 찾을 부분]
let p={};p[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(p)
*/
/* [변경 2 — 아래 코드로 교체]
let p = {};

// [변경] 우리 위젯의 커스텀 타입을 공용 기본 타입으로 저장하지 않습니다.
if (!sdxECCAIsEnabled()) {
    p[n.keys.createKeys.CA_DEF_TYPE] = e.result[0].type;
    i.saveUserPreference(p);
}
*/

/* ============================================================
 * CO 생성창 — R2026x: DS/ENOChgGovernanceUX/scripts/view/ChgCreateChangeOrder
 * 참조 blob: 2e8f017f2471ff3fd657b862f2c4e201f9932906
 * CO0: 해당 factory function(e,t,i,n,o,a,s,r,l,d,c,p){ 안의 var u= 앞에 아래 함수 추가.
 * c는 기존 ENONewLauncher, p는 기존 require입니다. 의존성/인자를 추가하지 않습니다.
 * CA의 G0/G1/G2와 다른 factory입니다. CO 함수들을 CA factory에 넣지 않습니다.
 * processChangeOrder/createBlankChangeOrder의 별도 생성 경로는 수정하지 않습니다.
 * ============================================================ */
function sdxECCACOIsEnabled() {
    if (typeof widget === "undefined") return false;
    var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
    return enabled === true || enabled === "true";
}

function sdxECCACOLaunch(options, Launcher, localRequire, command) {
    if (!sdxECCACOIsEnabled()) return (new Launcher).CreateNew(options);
    function fail(error) {
        if (command) command.isClickProcessing = false;
        console.error("[sdxECCA] CO 생성창 준비에 실패했습니다.", error);
    }
    try {
        localRequire(["DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService"], function (entry) {
            try {
                entry.launch(options, {
                    policy: "sdxECO",
                    attributeControlState: widget.getValue("sdxECCACOAttributeControlState") || "CREATE"
                });
            } catch (error) { fail(error); }
        }, fail);
    } catch (error) { fail(error); }
}

/* [CO1] createChangeOrder의 마지막 생성 호출
 * 원래 로더·분석 이벤트·목록/상세 갱신·실패/취소 콜백은 유지합니다.
 */
/* [원본에서 찾을 부분]
(new c).CreateNew(n),r.setDialogEventForLoader()
*/
/* [아래 코드로 교체]
sdxECCACOLaunch(n, c, p, e),r.setDialogEventForLoader()
*/

/* [CO2] createChangeOrder의 events.onSuccess 끝 기본 타입 저장
 * 원래 로더·분석 이벤트·목록/상세 갱신·실패/취소 콜백은 유지합니다.
 */
/* [원본에서 찾을 부분]
let c={};c[d.keys.createKeys.CO_DEF_TYPE]=t.result[0].type,l.saveUserPreference(c)
*/
/* [아래 코드로 교체]
let c = {};
if (!sdxECCACOIsEnabled()) {
    c[d.keys.createKeys.CO_DEF_TYPE] = t.result[0].type;
    l.saveUserPreference(c);
}
*/
