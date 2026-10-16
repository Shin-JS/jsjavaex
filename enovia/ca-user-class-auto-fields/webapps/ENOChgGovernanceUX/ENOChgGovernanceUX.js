/* 기존 파일 변경 조각입니다. 전체 교체용이 아닙니다.
 * factory: DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
 * 아래 함수를 factory의 return 앞에 추가합니다.
 * launchCreateChangeActionDialog(r)에서 기존 d 생성 옵션을 구성한 뒤:
 *     (new e).CreateNew(d)
 * 를 다음으로 변경합니다:
 *     (new e).CreateNew(zcaConfigureFixedCreateType(d))
 * 변수명은 참조 R2024x 기준입니다. d는 context/options/facets/events를 가진 기존 생성 옵션입니다.
 * 기존 onSuccess의 CA_DEF_TYPE 할당+saveUserPreference는 아래 조건으로 함께 감쌉니다:
 *     if(!zcaIsFixedClassWidget()){
 *         u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type;
 *         i.saveUserPreference(u);
 *     }
 * 그 외 목록/상세 갱신, onFailure/onCancel, 분류 facet 설정은 그대로 유지합니다.
 */

/** 기존 활성화 옵션명을 유지합니다. 현재 동작은 조직 매핑 대신 지정 클래스를 사용합니다. */
function zcaIsFixedClassWidget() {
    if (typeof widget === "undefined") return false;
    var enabled = widget.getValue("zcaEnableAutoClassByOrganization");
    return enabled === true || enabled === "true";
}

/** 초기 typeInfo 조회부터 고정 타입으로 실행합니다. 다른 위젯의 옵션은 건드리지 않습니다.
 * displayDialog 이후에 Type.value만 바꾸면 다른 타입의 속성 정의로 생성할 수 있어 금지합니다.
 * OOTB 실제 철자는 preferedType입니다. 서버가 지원하고 생성 권한이 있는 타입을 지정해야 합니다.
 */
function zcaConfigureFixedCreateType(createOptions) {
    if (!zcaIsFixedClassWidget()) return createOptions;
    var type = widget.getValue("zcaAutoClassType") || "Change Action";
    createOptions.type = type;
    createOptions.options = createOptions.options || {};
    createOptions.options.typeName = type;
    createOptions.options.preferedType = type;
    return createOptions;
}
