# ECR 채번: 즉시 실행 Create Action으로 전환

2026-10-21 구현. 기존 CA Adapter 수정 대신 `sdxECChangeAction` 타입의 Create Action에서 JPO를 실행합니다. **코드 및 등록 준비 도구이며 서버에 등록/배포한 결과는 아닙니다.**

## 실행 흐름

1. 기존 OOTB 생성 로직이 객체를 만듭니다.
2. 기존 Create Action들을 보존한 Trigger Manager가 `sdxEcrNumbering.createAction`을 호출합니다.
3. `${OBJECTID}`로 생성 객체를 잠그고 실제 type/policy/name을 읽습니다.
4. type이 정확히 `sdxECChangeAction`이고 policy가 `sdxECR`이면 번호를 발급합니다. `sdxECO`는 변경하지 않습니다. 같은 타입의 다른 정책은 설정 오류로 중단합니다. 따라서 payload의 policy가 아직 `Change Action`이면 먼저 정책 전달을 바로잡아야 합니다. 트리거가 정책을 대신 변경하지 않습니다.
5. 기존 번호 조회 및 영속 카운터 잠금/증가 로직으로 다음 번호를 정합니다.
6. `modify bus OBJECTID name NUMBER`로 이름을 바꾼 뒤 실제 name을 다시 읽어 확인합니다.
7. 기존 생성 서비스가 나머지 처리를 마치고 전체 트랜잭션을 commit합니다. 실패는 예외로 전달하며 트리거가 commit/abort하거나 새 트랜잭션을 열지 않습니다.

번호 규칙은 기존 코드 그대로 `ECR-` + 사업부 + `yyMMdd` + 4자리 순번입니다. `9999 → A001`, `A999 → B001`, 최대 `Z999`입니다. 사업부·일자별 독립 카운터 및 한국 시간이라는 기존 구현 가정도 유지합니다.

## 파일과 배포 범위

- `jpo/sdxEcrNumbering_mxJPO.java`: DB에 insert할 JPO. 등록 이름은 **sdxEcrNumbering**, 메서드는 **createAction**입니다.
- `src/com/sdx/enovia/ecr/SdxEcrCreateAction.java`: 생성 객체 검사, 채번 및 rename. `${OBJECTID}` 한 개만 받습니다. JPO에서 `JPO.unpackArgs()`를 호출하지 않습니다.
- `EcrServerConfiguration.java`: 기존 properties 로딩·서버 사업부 매핑·카운터 연결을 공통화했습니다.
- `EcrNumberRule`, `EcrNameService`, `EnoviaNumberGeneratorSequence`, `MqlExistingEcrNumbers`, `PropertiesCounterResolver`: 기존 채번 구현을 재사용합니다.
- `prepare_trigger_registration.py`: 확인한 기존 Trigger Manager Input을 보존하는 MQL 파일을 생성합니다. 서버 명령을 실행하지 않습니다.

일반 Java 클래스는 기존 서버 빌드로 컴파일해 `com/sdx/enovia/ecr/` 클래스패스에 배포합니다. JPO는 일반 유틸리티 JAR에 넣는 것으로 등록을 대체하지 말고 환경의 기존 JPO insert/compile 절차로 등록합니다. 모든 커널/JPO 실행 노드에서 Java 의존성과 설정을 읽을 수 있어야 합니다. 기존 OOTB JAR 수정은 새 구현의 필수 작업이 아닙니다.

```bash
python3 run_tests.py
python3 compile_with_sdk.py PATH/TO/WEB-INF/lib
```

SDK 컴파일 출력의 `sdxEcrNumbering_mxJPO.class`는 소스 호환성 확인용이며 실제 JPO DB 등록을 대신하지 않습니다. `tests/stubs`는 배포하지 않습니다. 컴파일 결과에는 이전 Adapter Hook도 있으나 새 트리거에서 호출하지 않습니다.

## 1. 전환 전 현황 보관

MQL 또는 Business Modeler에서 다음 내용을 저장합니다.

```mql
print type "sdxECChangeAction";
print type "Change Action";
print program "emxTriggerManager";
print policy "eService Trigger Program Policy";
```

추가 조상 타입이 있으면 그 타입까지 확인합니다. **현재 실제로 상속/실행되는 Create Action 프로그램과 Input 전체**, 자식에 직접 등록된 트리거 유무, 파라미터 객체들의 실행 순서를 보관합니다. `print type` 한 번으로 유효한 상속 체인 전체를 확인했다고 가정하지 않습니다.

자식에 native Create Action을 추가하면 부모의 동일 이벤트 트리거가 대체될 수 있습니다. 기존 유효 프로그램이 `emxTriggerManager`이면 Input의 모든 이름을 보존하고 ECR 전용 파라미터 이름을 추가합니다. 기존 프로그램이 직접 실행 JPO/Tcl 등 다른 프로그램이면 아래 자동 준비 도구를 쓰지 말고, 기존 프로그램 호출을 보존하는 연결부부터 환경에 맞게 검토합니다.

기존 OOTB 파라미터 객체에 새 revision을 추가하지 않습니다. 전용 이름을 사용해 부모/다른 타입으로의 적용 범위 확장을 피합니다. 같은 커스텀 타입을 생성하는 다른 화면에는 규칙이 적용되며, 코드에서 정확한 타입을 검사하므로 그 하위 타입은 자동으로 채번하지 않습니다.

## 2. 클래스·JPO·설정 배포

서버 JVM 옵션을 다음과 같이 설정합니다. properties 파일에 적는 항목이 아닙니다.

```text
-Dsdx.ecr.mode=trigger
-Dsdx.ecr.targetType=sdxECChangeAction
```

이전 Adapter의 `SdxEcrNameHook.apply(...)` 호출은 제거하고 원래 생성 처리를 복원합니다. 이번 Hook 버전에는 trigger 모드에서 즉시 반환하는 보호 장치도 추가했지만, **서버에 남아 있는 구버전 Hook에는 이 보호가 없습니다.** 구버전 Hook 호출과 트리거를 동시에 활성화하지 않습니다. 구 Adapter 패치는 이력용으로만 남깁니다.

`sdx-ecr.properties`의 기존 서버 사용자/credential 사업부 매핑과 **해당 날짜의 실제 카운터 ID**를 설정합니다. Trigger Manager가 호출하는 Context의 실제 user/role을 확인합니다. 실행 중 관리자 컨텍스트로 바뀌는 설치 환경이면 관리자 계정을 임의의 사업부로 매핑하지 말고 원래 생성자의 검증된 정보를 전달하는 연결을 먼저 보완합니다. 객체 organization, owner, 사용자 입력 속성이 Create Action 시점에 모두 저장되었다고 가정하지 않습니다.

기존 카운터를 자동 생성하거나 매일 리셋하지 않습니다. 일자별 카운터 준비가 없으면 생성은 실패합니다. 기존 번호 전체를 조회할 권한, 카운터 수정 권한, 대상 객체 이름 변경 권한이 필요합니다. 코드가 자동으로 권한을 상승시키지는 않습니다.

JPO를 등록한 다음 **Execute Deferred를 끈 즉시 실행 프로그램**인지 확인합니다. Trigger Manager/실행 경로도 전체 생성 update 트랜잭션 안에서 동작해야 합니다. 조회 결과 및 실제 실패 시험으로 확인합니다. `sdxEcrNumbering`만이 아니라 실행 경로가 deferred라면 이 구현과 호환되지 않습니다.

## 3. 전용 파라미터와 타입 연결 준비

다음 값으로 전용 파라미터 객체를 만듭니다. 아래 도구가 명령을 생성합니다.

| 항목 | 값 |
|---|---|
| Type | eService Trigger Program Parameters |
| Name | TypesdxECChangeActionCreateActionEcrNumber |
| Revision | EcrNumbering |
| Policy | eService Trigger Program Policy |
| Vault | eService Administration |
| eService Program Name | sdxEcrNumbering |
| eService Method Name | createAction |
| eService Program Argument 1 | `${OBJECTID}` |
| eService Error Type | Error |
| eService Sequence Number | 기존 순서 확인 후 정한 양의 정수 |
| 상태 | Active |

실제 정책의 초기 상태가 Inactive이고 한 번의 promote로 Active가 되는지 먼저 확인합니다. 생성 MQL은 이 정책 구조를 전제로 합니다. 이미 같은 Name/Revision의 객체가 있으면 새로 추가하지 말고 기존 등록부터 확인합니다.

아래 Input은 **설명용 예시**이며 서버에서 확인한 실제 전체 Input으로 바꿔 실행합니다. 순서 100도 예시이며 기존 규칙의 순서를 검토해 정합니다. 기본안은 기존 Create Action 뒤에서 채번하는 것이며, 앞선 규칙이 이름을 별도로 저장/전달하면 순서 및 호환성을 추가로 검토합니다.

```bash
python3 prepare_trigger_registration.py --existing-program emxTriggerManager --existing-input "TypeAllCreateAction TypeChangeActionCreateAction" --sequence 100 --output register-ecr-trigger.mql
```

실제로 상속을 포함해 기존 Create Action이 전혀 없는 경우에만 다음을 사용합니다.

```bash
python3 prepare_trigger_registration.py --existing-program none --existing-input "" --sequence 1 --output register-ecr-trigger.mql
```

출력 MQL은 `${OBJECTID}`를 리터럴로 저장하도록 작성되었습니다. MQL 콘솔/기존 파일 실행 방식으로 사용하며 shell이나 Tcl이 먼저 변수를 치환하지 않도록 합니다. 등록 후 파라미터의 Argument 1이 빈 값이 아닌 `${OBJECTID}`인지 다시 조회합니다. 도구는 원본 파일을 덮어쓰거나 서버에 접속하지 않습니다.

## 4. 실제 서버 검증

로컬 대역 테스트는 실제 DB 잠금·rollback·트리거 실행 순서·생성 응답의 이름을 증명하지 않습니다. 다음은 전환 완료 판정에 필요한 서버 확인입니다.

- 실제 위젯에서 `sdxECR` 생성: business object name과 REST 응답, 화면/재조회 이름 모두 최종 ECR 번호인지 확인합니다. DB는 맞고 응답만 이전 이름이면 생성 서비스의 응답 조립/재조회 연결이 추가로 필요합니다.
- 동일 타입 `sdxECO`와 기본 `Change Action`: 기존 이름/동작을 유지하는지 확인합니다.
- 기존 OOTB Create Action들이 누락 없이 실행되는지 비교합니다.
- 같은 사업부에서 병렬 생성: 여러 WAS에서도 중복 번호가 없는지 확인합니다.
- 트리거/rename 또는 이후 분류 저장을 의도적으로 실패시킴: 생성 객체와 카운터 증가가 함께 rollback되는지 확인합니다. 실제 데이터가 남으면 그 생성 경로에서는 배포를 완료한 것으로 볼 수 없습니다.
- 날짜 변경, 사업부 변경, 기존 최고 번호보다 뒤처진 카운터, `9999/A001`, `A999/B001`, `Z999` 한계와 잠금 대기를 확인합니다.

이미 올바른 형식의 ECR name이 있으면 트리거는 다시 번호를 소비하지 않습니다. 과거 날짜의 정상 번호도 보존하며, 이것은 외부에서 임의 지정한 번호가 정식 발급되었음을 인증하는 기능은 아닙니다. 잘못된 `ECR-` 이름은 오류로 처리합니다. copy/revision 이벤트의 신규 채번은 이번 Create Action 범위에 포함하지 않습니다.

## 원복

적용 전 보관한 native 트리거와 유효 상속 체인으로 정확히 복원합니다. 원래 자식에 native Create Action이 없었다면 추가한 자식 트리거를 제거해 상속을 되살리고, 있었다면 원래 프로그램과 전체 Input으로 복구합니다. 전용 파라미터 객체만 Inactive로 바꾸는 것은 타입 연결의 완전한 복원이 아닙니다.

그 뒤 필요할 때 기존 Adapter 방식과 JVM mode를 함께 되돌립니다. 이 작업으로 이미 발급한 업무 번호나 카운터 값을 낮추지 않습니다. 새로 발급된 번호를 과거 이름으로 일괄 rename하지 않습니다.

## 참고 자료와 한계

- [DS: Adding a Trigger for a Trigger Event](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-t-trigger-add.htm): Trigger Manager, Input 이름 목록, Active 상태.
- [DS: Supported Trigger Events](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-c-trigger-design-supportedevents.htm): 상속과 native 트리거 대체.
- [DS: Multi-trigger Events](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-c-trigger-design-multitrigger.htm): create/속성 저장 단계의 구분.
- [DS: Types of Trigger Programs](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-c-trigger-programs.htm): 즉시/지연 실행과 예외.

위 자료는 공급자 문서의 과거 버전 호스팅본입니다. 설치 버전의 Trigger Manager 구현·상속·정책·트랜잭션 동작은 서버에서 최종 확인해야 합니다.
