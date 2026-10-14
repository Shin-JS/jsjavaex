/* 수정·추가 부분만 포함합니다. 전체 파일 교체용이 아닙니다.
 * 모듈: DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * 아래 함수를 해당 factory의 return {...} 앞에 추가합니다.
 */
/**
 * [역할] 지금 실행 중인 위젯이 추가 기능의 대상인지 검사합니다.
 * zcaEnableLibraryInProperties는 대상 위젯 전용 초기화에서 지정하는 값입니다.
 * 설정에 따라 boolean true 또는 문자열 "true"가 들어올 수 있어 둘 다 허용합니다.
 * 타입 이름을 검사하는 함수와는 역할이 다릅니다. 이 조건을 타입 비교로 대체하면 위젯 구분이 사라집니다.
 */
function zcaIsEnabledForThisWidget() {
    if (typeof widget === "undefined") return false;
    var enabled = widget.getValue("zcaEnableLibraryInProperties");
    return enabled === true || enabled === "true";
}

/* launchCreateChangeActionDialog(r) 수정 지점:

1. 함수 시작에 추가:
   var zcaEnabled = zcaIsEnabledForThisWidget();
   var zcaType = "ZCA Change Action";

2. 기존 기본 타입 조회를 조건부로 변경 (2024x에서는 변수 l):
   let l = zcaEnabled ? zcaType : i.getUserPreference(n.keys.createKeys.CA_DEF_TYPE);

3. 생성 옵션의 두 위치만 변경:
   type: zcaEnabled ? zcaType : "Change Action",
   options: {
       typeName: zcaEnabled ? zcaType : "Change Action",
       preferedType: l,
       select: []
   },

4. onSuccess의 기존 i.saveUserPreference(u)만 조건부로 변경:
   if (!zcaEnabled) i.saveUserPreference(u);

기존 context, tenant, SecurityContext, facets, onSuccess의 목록/상세 갱신,
onFailure/onCancel, new ENONewLauncher().CreateNew(...) 흐름은 유지합니다.
새 Launcher/Engine/Controller 모듈을 만들지 않습니다.
신규 타입 생성/처리 지원은 서버에서 먼저 검증해야 합니다.
*/


/* [기존 생성 옵션을 이해하기 위한 해설]
 * type/typeName: 생성 인프라가 조회하고 생성할 업무 타입을 지정합니다.
 * preferedType: 타입 선택의 초기 기본값입니다. 오타처럼 보이지만 참조 소스의 실제 철자입니다.
 * context/tenant/SecurityContext: 어느 플랫폼/권한 문맥으로 생성 서비스를 호출할지 결정합니다.
 * facets: 어떤 탭을 생성 화면에 포함할지 지정합니다. classificationFacet이 있어야 기존 분류 처리를 재사용합니다.
 * onSuccess: 생성된 ID로 목록/상세를 갱신하는 기존 처리입니다.
 * onFailure: 내부 호출에서 전파된 오류를 받는 위치입니다. 로그 출력 파일이 최초 오류 발생 파일과 같지는 않습니다.
 * CA_DEF_TYPE/saveUserPreference: 생성한 타입을 다음 생성의 기본값으로 저장합니다.
 * 커스텀 생성에서 이 설정을 저장하지 않는 이유는 다른 생성 화면의 기본 타입까지 바뀌는 부작용을 줄이기 위해서입니다.
 * 함수/조건의 적용 대상과 사용자 기본 타입 설정은 별개이므로 둘 다 검토해야 합니다.
 */
