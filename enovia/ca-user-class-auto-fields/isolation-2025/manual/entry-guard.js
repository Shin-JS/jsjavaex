/* DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction의
 * factory 안, return { ... }보다 앞에 붙여넣는 함수입니다.
 * launchCreateChangeActionDialog(r)의 맨 앞에는 다음 한 줄을 추가합니다.
 * if (sdxECCA2025TryLaunch(r, s, typeof widget === "undefined" ? null : widget)) return;
 * s는 확인한 2025 원본 factory의 마지막 인자인 AMD require입니다.
 * define의 의존성 배열에는 전용 모듈을 추가하지 않습니다.
 */
function sdxECCA2025TryLaunch(command, localRequire, currentWidget) {
    if (!currentWidget) return false;
    var enabled = currentWidget.getValue("sdxECCAUsePrivateCreate2025");
    if (enabled !== true && enabled !== "true") return false;

    function fail(error) {
        if (command) command.isClickProcessing = false;
        console.error("[sdxECCA2025] 전용 생성창을 열지 못했습니다.", error);
        // 필요한 경우 이 위치에 기존 위젯의 오류 표시 함수를 연결합니다.
    }

    try {
        localRequire(["DS/sdxECCA2025/sdxECCA2025"], function (CreateCA) {
            try { CreateCA.launch(command); }
            catch (error) { fail(error); }
        }, fail);
    } catch (error) { fail(error); }
    // 대상 위젯에서 실패하더라도 공용 생성으로 우회하지 않습니다.
    return true;
}
