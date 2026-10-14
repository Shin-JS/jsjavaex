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
/**
 * [인자] facet은 기존 PLMNewClassificationFacet, options는 해당 facet의 설정입니다.
 * [역할] 기존 라이브러리 선택 컨트롤러가 준비되면 공유 bridge에 전달합니다.
 * 여기서 새 컨트롤러나 새 속성 모델을 생성하지 않습니다.
 * 속성 탭의 UI는 이 연결 뒤부터 기존 컨트롤러를 사용할 수 있습니다.
 */
function zcaConnectClassificationFacet(facet, options) {
/**
 * 다른 위젯에 영향을 주지 않는 연결 조건입니다.
 * zcaAttachBridge에서 위젯/타입 조건을 통과한 대화상자만 zcaBridge를 전달받습니다.
 * 공용 파일을 로드해도 bridge가 없는 일반 화면은 바로 반환합니다.
 * 위젯 활성화 검사를 없애고 타입만 검사했다면 같은 타입의 다른 위젯도 연결될 수 있습니다.
 */
    if (!options.zcaBridge) return;

/**
 * zcaSession은 options에 담긴 같은 bridge의 참조입니다. 선택 데이터를 복사하는 변수가 아닙니다.
 * self는 setInterval 콜백 안에서도 원래 facet에 접근하기 위해 보관한 참조입니다.
 */
            facet.zcaSession = options.zcaBridge;
            var self = facet;
/**
 * 기존 initUI의 require 초기화가 비동기라 준비된 컨트롤러가 없을 수 있습니다.
 * 100ms마다 확인하고, 30초가 지나면 무한 대기하지 않고 준비 실패를 표시합니다.
 * 속성 탭 입력창이 비활성화된 상태로 남으면 이 준비/타임아웃 경로를 확인합니다.
 */
            var started = Date.now();
            var timer = setInterval(function () {
                if (self.zcaSession.disposed) { clearInterval(timer); return; }
/**
 * ctrl은 기존 라이브러리 검색/선택 컨트롤러입니다. 원래 분류 탭이 사용하던 객체입니다.
 * autoComplete까지 있어야 검색 노드 추가와 선택 이벤트를 연결할 수 있습니다.
 */
                var ctrl = self.initUI.getController().plmNewLibraryActive;
                if (ctrl && ctrl.autoComplete) {
                    clearInterval(timer);
                    // Keep mutable collections instance-local where exposed by OOTB.
/**
 * 참고 소스에서 공유되거나 prototype에 놓인 자료를 현재 신규 생성 컨트롤러에 독립적으로 둡니다.
 * _classPathMap: 클래스 ID와 경로 / _classNameMap: 클래스 ID와 표시명
 * _classUsageMap: 클래스 용도 / _attributeMap: 기존 분류 속성 정보에 사용되는 자료
 * apiAttributesCall과 _isProcessing: 속성 로딩 호출을 순서대로 처리하는 큐와 실행 상태
 * 초기 연결 시 한 번 실행합니다. 기존 객체 편집이나 값이 이미 있는 화면에서 반복 초기화하면 안 됩니다.
 */
                    ctrl.classIdAndTitleMap = new Map();
                    ctrl._classPathMap = new Map();
                    ctrl._attributeMap = new Map();
                    ctrl._classUsageMap = new Map();
                    ctrl._classNameMap = new Map();
                    ctrl.apiAttributesCall = [];
                    ctrl._isProcessing = false;
/**
 * 기존 분류 선택창의 change도 속성 탭에 알립니다.
 * 속성 탭의 별도 선택 노드와 실제 컨트롤러 선택이 다르므로 변경 시 다시 읽어 표시해야 합니다.
 */
                    var notify = function () { self.zcaSession.notify(); };
                    ctrl.autoComplete.addEventListener("change", notify);
/**
 * bridge 종료 시 기존 AutoComplete에 추가한 리스너를 해제합니다.
 * 생성 화면을 여러 번 열어도 같은 용도의 리스너가 누적되지 않도록 하는 정리 함수입니다.
 */
                    self.zcaSession.cleanup = function () {
                        if (typeof ctrl.autoComplete.removeEventListener === "function") {
                            ctrl.autoComplete.removeEventListener("change", notify);
                        }
                    };
/**
 * 속성 탭에 준비 완료를 알리는 시점입니다. attach가 구독자를 호출하므로 이후 선택 UI가 활성화됩니다.
 * 
 * [오늘 적용한 분류 탭 선택창 숨김 위치]
 * 현재 사용자 환경에서 추가한 아래 실행문은 이 attach 호출 바로 앞에 둡니다.
 *     ctrl.container.style.display = "none";
 * 이 저장소의 실행 코드는 이번 주석 추가에서 바꾸지 않았으므로, 위 줄은 위치 설명용 주석입니다.
 * ctrl.container는 기존 라이브러리 선택 영역이며 옮기는 속성 폼 accordeonCon과 다른 컨테이너입니다.
 * 컨트롤러를 파괴하지 않고 선택 영역만 숨기므로 새 속성 탭의 선택/저장 연결을 계속 사용할 수 있습니다.
 * 반드시 위 bridge 검사와 ctrl 준비 분기 안에서 적용해야 대상 생성 화면만 숨길 수 있습니다.
 * 전역 CSS나 분류 facet 전체를 숨기는 처리로 바꾸면 다른 UI까지 영향을 줄 수 있습니다.
 */
                    self.zcaSession.attach(ctrl);
                } else if (Date.now() - started > 30000) {
                    clearInterval(timer);
                    self.zcaSession.error = new Error("분류 facet 초기화 시간이 초과되었습니다.");
                    self.zcaSession.notify();
                }
            }, 100);
            facet.zcaTimer = timer;
}
/**
 * 기존 facet이 파괴될 때 준비 확인 타이머와 bridge를 정리합니다.
 * 원래 destroy/_parent와 postCreation은 유지해야 합니다.
 * postCreation은 생성된 CA ID로 클래스 연결과 속성 저장을 수행하는 기존 경로입니다.
 */
function zcaDisconnectClassificationFacet(facet) {
    clearInterval(facet.zcaTimer);
    if (facet.zcaSession) facet.zcaSession.dispose();
}

