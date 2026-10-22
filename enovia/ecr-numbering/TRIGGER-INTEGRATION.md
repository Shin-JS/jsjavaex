# ECR 채번: createAction 단일 메서드 구현 (2026-10-22)

모든 채번 처리를 `createAction(Context context, String[] args)` 하나에 통합했습니다.
**args[0] = objectId 한 개만 받습니다.** 사업부·날짜·순번은 추가 인자로 받지 않습니다.
생성 화면/백엔드에서 전달하는 sdxECR/sdxECO Policy 파라미터는 이 JPO의 args와 별개입니다.
JPO에서는 objectId로 생성 시 지정된 policy를 조회합니다. sdxECType은 조회하지 않습니다.
JPO 생성자는 유지하며 보조 메서드·람다·내부 클래스로 로직을 분리하지 않았습니다.

현재 배포 대상은 [jpo/sdxEcrNumbering_mxJPO.java](jpo/sdxEcrNumbering_mxJPO.java)입니다.
이 파일은 이전 SdxEcrCreateAction 위임을 대체하며 com.sdx.enovia.ecr 유틸리티, 카운터 객체, 커스텀 속성, interface, properties 파일을 사용하지 않습니다.
기존 src 코드와 Adapter 패치는 이전 방식의 이력입니다. 새 JPO와 함께 별도로 호출하지 않습니다.

## 규칙과 처리

정확한 타입 sdxECChangeAction + 정책 sdxECR에만 적용합니다.
sdxECO 정책과 다른 타입은 건너뛰며, 대상 타입의 나머지 다른 정책은 오류로 처리합니다.
생성 구분 ECR과 정책 sdxECR이 일치한다는 전제입니다. ECO 채번은 추가하지 않았습니다.
payload의 policy를 대신 변경하지 않습니다.

번호는 ECR- + 사업부(W=MX, N=NW, V=VD, A=DA, H=HME) + 한국 날짜 yyMMdd + 4자리 순번입니다.
사업부·날짜별로 0001부터 시작하며, 9999 다음 A001, A999 다음 B001, 마지막 Z999입니다.

1. 즉시 실행 create action에서 해결된 OBJECTID 한 개를 받습니다.
2. type과 policy를 검사한 뒤 name을 읽고 이미 유효한 ECR 번호면 반환합니다.
3. 서버 사용자/credential로 사업부를 결정하고 한국 날짜를 한 번 확정합니다.
4. temp query bus로 해당 사업부·날짜의 기존 name들을 조회하고 최대 순번 + 1을 계산합니다.
5. `DomainObject.newInstance(context, objectId)`로 객체를 얻고 `setName(context, candidate)`로 이름을 변경합니다.
   실행 컨텍스트는 변경하지 않으며, 이 API도 changename 권한 검사를 받습니다.
6. 변경 실패 시 트랜잭션이 update 상태인지, 자기 이름이 원래대로인지,
   동일 type/name/revision을 가진 다른 객체가 실제 조회되는지 확인합니다.
   세 조건을 모두 만족할 때만 최대번호를 다시 조회하고 다음 후보로 재시도합니다(최대 100회).
7. 성공 후 실제 name을 재조회합니다. changename 트리거가 이름을 바꿨으면 실패합니다.
8. 전체 commit/abort는 원래 생성 서비스가 수행합니다. 이 JPO는 트랜잭션을 새로 열거나 commit/abort하지 않습니다.

조회 실패·권한 오류를 0001로 취급하지 않으며, 확인 불가능한 충돌이나 중단된 트랜잭션은 원래 예외를 전달합니다.
서로 다른 생성 객체를 lockForUpdate하거나 JVM synchronized를 쓰는 것으로 서버 간 채번을 직렬화했다고 주장하지 않습니다.

## 배포 전에 채울 곳

createAction 내부의 roles/users 맵에 **실제 서버의 정확한 credential 또는 로그인명**을 추가합니다.
예시 주석의 REAL 값은 실제 계정이 아닙니다. 설치 환경의 사용자-사업부 매핑이 제공되지 않았으므로
임의의 사용자나 관리자를 MX로 고정하지 않았습니다. 미설정이면 명확한 오류로 중단합니다.
사용자 부서 조회가 필요하면 createAction의 사업부 매핑 블록 안에 기존 서버 조회를 연결합니다.
Trigger Manager가 관리자 Context로 호출하는 경우 원래 생성자를 확인하는 연결이 먼저 필요합니다.

```java
users.put("실제로그인명", "MX");
// 또는 전체 credential 문자열을 정확히 지정합니다.
roles.put("실제전체credential", "NW");
```

JPO를 기존 insert/compile 절차로 DB에 등록하고, 등록 프로그램 이름 sdxEcrNumbering,
메서드 createAction, Argument 1은 리터럴 ${OBJECTID}로 설정합니다.
이 JPO 자체에는 JVM mode 옵션이나 properties가 필요 없습니다.
기존 Adapter 채번 Hook은 원복해야 하며, 남겨두면 이중 채번 경로가 됩니다.
구 Hook의 mode 보호만 이용한다면 기존 Hook용 -Dsdx.ecr.mode=trigger는 계속 필요합니다.

Execute Deferred를 끄고 원래 생성 update 트랜잭션 안에서 실행해야 합니다.
Create Action 시점에 아직 저장되지 않은 사용자 입력 속성이나 분류 속성을 사업부 근거로 읽지 않습니다.
사용자 환경에서는 Create Action에서 sdxECType이 `-`로 조회되고 생성 완료 후 `ECR`로 저장되는 것을 확인했습니다.
따라서 sdxECType 조회·비교를 제거하고 생성 시 이미 지정된 policy로 ECR 여부를 판단합니다.
정책 sdxECR과 ECR 구분이 일치하도록 기존 생성 화면/백엔드에서 policy를 전달해야 합니다.

## 트리거 등록 문법

MQL 이벤트는 CreateAction 한 단어가 아니라 **create action 두 단어**입니다.
전용 파라미터 객체 이름은 사용 중인 sdxECRCreateAction을 유지해도 됩니다.

```mql
modify type "sdxECChangeAction" add trigger create action emxTriggerManager input "기존Input전체 sdxECRCreateAction";
```

위 명령은 실제 기존 Input을 대체해 입력해야 하는 설명용입니다. 그대로 실행하지 않습니다.
기존 자식 트리거뿐 아니라 부모의 유효 Create Action도 먼저 보관합니다.
자식의 같은 이벤트 등록이 상속 트리거를 대체할 수 있으므로 기존 OOTB 프로그램/Input을 모두 유지합니다.
기존 프로그램이 emxTriggerManager가 아니면 이를 덮어쓰지 말고 기존 호출을 보존하는 연결을 사용합니다.
prepare_trigger_registration.py는 기존 전용 이름을 사용하는 다른 등록안이며,
이미 sdxECRCreateAction을 만들었다면 중복 등록하지 않습니다.

## 동시성 보장 범위

이 구현은 **최대번호 조회 + rename 충돌 재시도 방식**입니다. 공유 카운터 잠금 방식이 아닙니다.

- DB의 동일 객체 식별 조합(type/name/revision 등)에 대한 유일성 검사가 최종 중복 방지 근거입니다.
  name 문자열 하나만 전역 유일하다고 가정하면 안 됩니다.
- 같은 사업부에 여러 revision/type/vault 식별 범위가 섞이면 두 요청이 같은 name으로 성공할 수 있습니다.
  모든 발급 대상이 같은 유일성 범위를 쓰는지 설치 DB에서 확인해야 합니다.
- 중복 오류가 rename 시점에 발생하고 실패 후에도 바깥 update 트랜잭션이 유효하며,
  승자 객체를 재조회할 수 있을 때만 JPO 내부에서 자동 재시도할 수 있습니다.
- DB가 전체 트랜잭션을 중단하거나 오류를 commit까지 미루거나 경쟁 객체가 조회되지 않으면
  이 JPO는 실패를 전달합니다. Create Action 안에서 새 트랜잭션을 만들어 우회하지 않습니다.
- 조회 권한으로 일부 번호가 숨겨질 수 있습니다. 전체 번호 조회 권한이 있어야 최대값을 정확히 구합니다.
- 마지막 번호 객체가 삭제되면 그 번호가 재사용될 수 있습니다. 별도 영속 이력 없이 삭제된 최대번호까지 복원하지 못합니다.
- 클라이언트가 이미 올바른 형식의 ECR 이름을 보내면 그대로 보존합니다.
  이 검사는 발급 증명이 아니므로 임의 이름 지정 경로도 통제해야 합니다.

따라서 실제 서버 검증 전에는 “모든 동시 요청이 자동 재시도되어 성공한다”거나
“서로 다른 식별 범위에서도 전역 name 중복이 불가능하다”고 보장하지 않습니다.

## 검증

이번 변경은 JDK 17에서 --release 8로 원본 JPO 및 테스트용 매핑을 넣은 임시 JPO를
대역 SDK와 컴파일하고 JpoOnlyNumberingTest를 실행했습니다.
테스트용 사본에만 test-user → MX 매핑을 추가하며 배포 원본은 바꾸지 않습니다.
DomainObject 대역의 setName 호출에서 정상 변경·충돌·권한 실패를 재현하며,
JPO가 MQL modify로 이름을 바꾸면 테스트가 실패하도록 검사합니다.
0001 시작, 기존 최대번호 다음 발급, 9999→A001, A999→B001, Z998→Z999,
상한 초과, 충돌 재시도, 권한 오류 전파, 중단된 트랜잭션, changename 결과 불일치,
대상 제외, 이중 채번 방지, 잘못된 번호·날짜·미설정 사업부를 확인했습니다.
sdxECR 정책의 채번, sdxECO 정책 제외, 기타 정책 오류를 확인했습니다.
테스트 대역은 sdxECType 조회 시 즉시 실패하도록 하여 생성 트리거가 해당 속성에 의존하지 않는지 검사합니다.
args는 objectId 한 개만 허용하며 추가 인자, 미해결 매크로, 빈 값 등을 거부하는 것도 검사합니다.
리플렉션으로 JPO에 선언된 메서드가 createAction 한 개뿐인지 확인합니다.

단일 메서드 검사 실행:

```bash
python3 run_jpo_only_tests.py
```

run_tests.py에서도 위 검사를 호출합니다. 기존 전체 검사와 실제 SDK 컴파일은 이번 실행에서 재수행하지 않았습니다.

실제 서버에서는 동일 사업부 병렬 생성(여러 WAS 포함), 충돌 시 예외/트랜잭션 상태,
생성 이후 분류 저장 실패 시 rollback, OOTB 트리거 보존, 날짜 전환,
화면·REST 응답·DB name 일치를 확인해야 합니다. 서버 배포와 이 통합 검증은 수행하지 않았습니다.

## 참고

- [DS Supported Trigger Events](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-c-trigger-design-supportedevents.htm)
- [DS Multi-trigger Events](https://cjlr.srm.covisint.com/enovia/docv6/English/DteCustomizingMap/dte-c-trigger-design-multitrigger.htm)
- [DS MQL Guide](https://cjlr.srm.covisint.com/enovia/docv6/English/DteUserPdf/ENOVIAStudioModelingPlatformMQLGuide-V6R2013.pdf)

공급자 과거 버전 문서이며 현재 설치 커널의 충돌/트랜잭션 동작을 증명하는 자료는 아닙니다.

