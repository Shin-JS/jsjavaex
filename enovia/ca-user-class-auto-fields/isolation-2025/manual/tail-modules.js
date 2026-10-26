/* [신규 코드 — 전체 추가]
 * 주석 변경 조각을 적용하고 전용 이름 치환까지 끝낸 sdxECCA2025.js의
 * 맨 마지막에 이 파일 전체를 붙여넣습니다.
 * 복사한 앞 JS 묶음과 이 코드 사이에는 세미콜론을 하나 둡니다.
 */
define("DS/sdxECCA2025/appSettings", [], function () {
    return JSON.stringify({
        facets: {
            library: {
                require: "DS/sdxECCA2025/private/PLMNewLibraryActive/PLMNewLibraryActiveController"
            },
            bookmarks: {
                require: "DS/sdxECCA2025/private/PLMNewFolderActive/PLMNewFolderActiveController"
            }
        }
    });
});

define("DS/sdxECCA2025/sdxECCA2025", [
    "DS/sdxECCA2025/private/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction"
], function (CreateCA) {
    return {
        launch: function (command) {
            if (typeof widget === "undefined") {
                throw new Error("위젯 실행 환경을 확인해 주세요.");
            }
            var enabled = widget.getValue("sdxECCAEnableAutoClassByOrganization");
            if (enabled !== true && enabled !== "true") {
                throw new Error("대상 위젯의 자동 분류 옵션을 확인해 주세요.");
            }
            return CreateCA.launchCreateChangeActionDialog(command);
        }
    };
});
