/*
수정·추가 부분만 포함합니다. 전체 파일 교체용이 아닙니다.
2024x 참조 기준이며 설치 버전의 해당 AMD factory 안에 적용하세요.
새 define(), 새 모듈명, 기존 AMD ID 변경은 없습니다.
아래 함수는 표시된 모듈의 factory 내부, return ... 앞에 추가합니다.
*/

/* 모듈: DS/ClassificationsFacet/PLMNewClassificationFacet
   두 함수를 이 factory 내부의 return e.extend(...) 앞에 추가합니다.
   기존 init(e)의 initUI 생성/getUI/보안컨텍스트 구독이 끝난 뒤:
       zcaConnectClassificationFacet(this, e);
   기존 destroy() 첫 줄에:
       zcaDisconnectClassificationFacet(this);
   기존 getUI/postCreation/destroy 및 _parent 호출은 그대로 유지합니다.
   postCreation은 분류 연결과 속성값 저장을 맡으므로 삭제하지 않습니다.
*/
function zcaConnectClassificationFacet(facet, options) {
    if (!options.zcaBridge) return;

            facet.zcaSession = options.zcaBridge;
            var self = facet;
            var started = Date.now();
            var timer = setInterval(function () {
                if (self.zcaSession.disposed) { clearInterval(timer); return; }
                var ctrl = self.initUI.getController().plmNewLibraryActive;
                if (ctrl && ctrl.autoComplete) {
                    clearInterval(timer);
                    // Keep mutable collections instance-local where exposed by OOTB.
                    ctrl.classIdAndTitleMap = new Map();
                    ctrl._classPathMap = new Map();
                    ctrl._attributeMap = new Map();
                    ctrl._classUsageMap = new Map();
                    ctrl._classNameMap = new Map();
                    ctrl.apiAttributesCall = [];
                    ctrl._isProcessing = false;
                    var notify = function () { self.zcaSession.notify(); };
                    ctrl.autoComplete.addEventListener("change", notify);
                    self.zcaSession.cleanup = function () {
                        if (typeof ctrl.autoComplete.removeEventListener === "function") {
                            ctrl.autoComplete.removeEventListener("change", notify);
                        }
                    };
                    self.zcaSession.attach(ctrl);
                } else if (Date.now() - started > 30000) {
                    clearInterval(timer);
                    self.zcaSession.error = new Error("분류 facet 초기화 시간이 초과되었습니다.");
                    self.zcaSession.notify();
                }
            }, 100);
            facet.zcaTimer = timer;
}
function zcaDisconnectClassificationFacet(facet) {
    clearInterval(facet.zcaTimer);
    if (facet.zcaSession) facet.zcaSession.dispose();
}
