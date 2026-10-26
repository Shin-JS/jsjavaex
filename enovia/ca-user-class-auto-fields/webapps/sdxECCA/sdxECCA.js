/* 신규 커스텀 파일 — 전체 배포합니다.
 * 기존 자동 분류 모듈을 우리 CA 생성 진입부에서만 먼저 로딩합니다.
 * OOTB 모듈의 define 의존성에는 이 파일이나 자동 분류 모듈을 추가하지 않습니다.
 */
define("DS/sdxECCA/sdxECCA", [
    "DS/sdxECCAAutoClass/sdxECCAAutoClass"
], function (AutoClass) {
    "use strict";
    return {
        launch: function (createOptions, createNew) {
            if (typeof widget === "undefined" || !AutoClass.isEnabled()) {
                throw new Error("대상 위젯의 자동 분류 설정을 확인해 주세요.");
            }
            if (!createOptions || typeof createNew !== "function") {
                throw new Error("기존 생성 옵션과 생성 호출을 확인해 주세요.");
            }
            // 원래 옵션은 보존하고, 기존 생성 흐름에 설정만 전달합니다.
            var options = Object.assign({}, createOptions);
            options.options = Object.assign({}, createOptions.options);
            AutoClass.configureCreateType(options);
            // widget 인스턴스에만 보관합니다. 공통 모듈은 호출 시점에 읽습니다.
            widget.sdxECCARuntime = AutoClass;
            return createNew(options);
        }
    };
});
