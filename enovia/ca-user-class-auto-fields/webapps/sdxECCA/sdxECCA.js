/* [신규 파일] 3dspace/webapps/sdxECCA/sdxECCA.js
 * 이 파일은 직접 작성한 전용 설정·진입 모듈입니다.
 * 아래 두 모듈은 전체 추가 코드이며 기존 OOTB 모듈의 전체 소스는 포함하지 않습니다.
 *
 * [붙여넣을 위치]
 * manual/README.md 순서로 전용 복사본과 변경 조각을 구성한 다음,
 * 그 파일의 맨 마지막에 세미콜론을 두고 아래 코드를 붙여넣습니다.
 *
 * [주의]
 * 이 진입 코드만 단독 배포하면 private/... 의존 모듈이 없어 실행되지 않습니다.
 * 로컬 2025 원본의 전용 복사본이 같은 파일 안에 필요합니다.
 * 공통 원본 파일을 이 파일로 덮어쓰지 않습니다.
 */
define("DS/sdxECCA/appSettings", [], function () {
    return JSON.stringify({
        facets: {
            library: {
                require: "DS/sdxECCA/private/PLMNewLibraryActive/PLMNewLibraryActiveController"
            },
            bookmarks: {
                require: "DS/sdxECCA/private/PLMNewFolderActive/PLMNewFolderActiveController"
            }
        }
    });
});

define("DS/sdxECCA/sdxECCA", [
    "DS/sdxECCA/private/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction"
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
