/* 수정·추가 부분만 포함합니다. 전체 파일 교체용이 아닙니다.
 * 모듈: DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * 아래 함수를 해당 factory의 return {...} 앞에 추가합니다.
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
