# ECR No: Create Action JPO 내부 채번

2026-10-22: 현재 구현은 **JPO 한 파일에서 최대번호 조회 후 rename 충돌 시 재시도**하는 방식입니다.
[jpo/sdxEcrNumbering_mxJPO.java](jpo/sdxEcrNumbering_mxJPO.java)에 채번 로직을 모두 넣었습니다.
카운터 객체·커스텀 속성·interface·별도 유틸리티 JAR가 필요 없습니다.

배포/설정/동시성 조건은 [TRIGGER-INTEGRATION.md](TRIGGER-INTEGRATION.md)를 따릅니다.
**resolveDivision의 실제 사용자/credential 매핑은 배포 전에 채워야 합니다.**
동시성은 DB 유일성 범위 및 충돌 후 트랜잭션 상태에 의존하며 실제 서버 검증은 미완료입니다.

이전 src 구현, properties와 Adapter 패치는 아래의 과거 구현 설명에 해당합니다.
현재 JPO와 별도의 Adapter 채번을 동시에 사용하지 않습니다.

---

# ECR No: Create Action 트리거 채번

2026-10-21: 현재 전환안은 **즉시 실행 Create Action JPO**입니다. [TRIGGER-INTEGRATION.md](TRIGGER-INTEGRATION.md)의 배포·기존 OOTB 트리거 보존·검증 순서를 따릅니다. 대상은 정확한 `sdxECChangeAction` 타입 + `sdxECR` 정책이며 `sdxECO`는 제외합니다. 서버 배포/등록은 아직 하지 않았습니다.

기존 채번 핵심 코드를 재사용하며 `jpo/sdxEcrNumbering_mxJPO.java` → `SdxEcrCreateAction`에서 생성 객체의 이름을 변경합니다. 기존 Adapter 호출과 트리거를 동시에 채번시키지 않습니다. 아래 Adapter 설명과 패치는 이전 방식의 이력입니다. 새 트리거 전환에 Adapter 패치를 적용하지 마십시오.

---

# ECR No: 기존 CA 생성 백엔드에 적용할 채번 코드

2026-10-20 R2024x 원본 조사 반영본입니다. 기존 `ENONewChangeActionApplicationAdapter.createBusinessObject(Context, CreateParameters)`에 이름 설정 호출을 추가하는 **소스 수정 패치와 Java 구현**입니다. 새 생성 REST API·위젯·채번 스키마를 만들지 않습니다.

이전 범용 연결 예시는 [INTEGRATION.md](INTEGRATION.md)의 실제 R2024x 수정 지점으로 대체했습니다. `enoECMChangeActionBase`의 autoName 코드는 주석이며 활성 코드가 아니라는 점도 정정했습니다. 실제 SDK JAR에 대한 사용자 작성 소스의 컴파일을 통과했습니다. 벤더 Java 전체 수정/서버 배포 완료본은 아니며, [적용 문서](INTEGRATION.md)에 범위를 명시했습니다.

## 기존 번호 조회 반영

현재 수정본은 카운터만 읽지 않습니다. 카운터의 트랜잭션 잠금을 잡은 뒤 `MqlExistingEcrNumbers`가 해당 사업부·날짜의 실제 business object name을 MQL로 조회합니다. 기존 번호의 마지막 순번과 저장된 다음 순번을 비교해 이어서 발급합니다. 상세 코드는 [MqlExistingEcrNumbers.java](src/com/sdx/enovia/ecr/MqlExistingEcrNumbers.java), 동작 예시는 [EXISTING-NUMBERS.md](EXISTING-NUMBERS.md)에 있습니다.

## 확정 규칙

`ECR-` + 사업부 1자리 + `yyMMdd` 6자리 + 순번 4자리 = 15자리. 저장 대상은 business object의 **name**입니다.

| 사업부 | 코드 | 첫 번호 예시 |
|---|---|---|
| MX | W | ECR-W2610200001 |
| NW | N | ECR-N2610200001 |
| VD | V | ECR-V2610200001 |
| DA | A | ECR-A2610200001 |
| HME | H | ECR-H2610200001 |

| 내부 정수 순번 | 표시 순번 |
|---:|---|
| 1 | 0001 |
| 9999 | 9999 |
| 10000 | A001 |
| 10998 | A999 |
| 10999 | B001 |
| 34975 | Z001 |
| 35973 | Z999 |
| 35974 이상 | 오류, 생성 중단 |

`A000`~`Z000`은 발급하지 않습니다. DB에는 계속 정수 순번을 저장하며 화면 번호만 변환합니다. `% 10000`이나 문자열 끝 네 자리 자르기를 사용하지 않습니다.

**구현 가정:** 사업부·날짜별 독립 순번, 매일 0001 시작, 한국 시간 기준입니다. 사용자가 확정한 사항은 번호 형식과 사업부 매핑 및 알파벳 전환입니다. 날짜별 초기화·사업부별 독립 여부는 아직 별도 확인되지 않은 가정입니다. 기존 업무 규칙이 다르면 이 가정부터 조정해야 합니다.

## 구성

- `EcrNumberRule.java`: 사업부 변환, 15자리 조립, 정수↔순번 변환.
- `EcrNameService.java`: 날짜를 한 번만 확정하고 기존 영속 채번기를 호출.
- `SdxEcrNameHook.java`: 실제 CA adapter에서 부르는 타입 제한 Hook. 서버 credential/user 매핑과 기존 카운터를 연결하고 CreateParameters.name 설정.
- `apply_r2024x_adapter_patch.py`: 기존 Java 메서드에 Hook을 삽입.
- `patches/r2024x-ca-adapter.patch`: 조회한 메서드 구조 기준 최소 diff.
- `MqlExistingEcrNumbers.java`: MQL로 기존 ECR name 조회, 숫자/알파벳 순번을 정수로 변환해 마지막 순번 계산.
- `EnoviaNumberGeneratorSequence.java`: 카운터 잠금→저장값 읽기→기존 번호 MQL 조회→더 큰 다음 순번 발급→카운터 증가.
- `PropertiesCounterResolver.java`: 기존 사업부·날짜별 카운터 ID의 명시적 매핑. 동일 객체의 여러 시리즈 재사용과 누락을 거부.
- [INTEGRATION.md](INTEGRATION.md): 기존 소스의 교체 지점과 코드 조각.
- [REFERENCES.md](REFERENCES.md): 실제 조회 자료와 확인 한계.
- [VALIDATION.md](VALIDATION.md): 검사 범위와 미검증 항목.

## 기존 소스 수정의 범위

원래의 CA 생성 서비스, 인증·권한 검사, 트랜잭션, 객체 생성 호출, 분류 저장, 응답 처리를 유지합니다. 대상 커스텀 타입의 **최종 이름 발급 분기**에서 이 코드를 호출하고 결과를 기존 생성 호출의 name에 전달합니다. 기본 CA와 다른 타입의 기존 이름 발급 분기는 유지합니다.

새 utility 클래스가 추가되지만 새로운 업무 생성 API나 위젯을 만드는 방식은 아닙니다. utility를 둘 수 없는 배포라면 해당 메서드를 기존 커스텀 Java/JPO 내부로 옮겨 사용할 수 있습니다. 실제 타입의 대소문자와 정확한 생성 메서드명은 설치 소스로 확인해야 합니다.

## 기존 카운터 연결

기존 채번이 이미 영속적이고 원자적인 정수 순번을 반환한다면 `EcrNameService.ExistingSequence`에 그 호출을 연결하는 것이 우선입니다. 이 경우 ENOVIA 어댑터와 properties resolver는 필요 없습니다.

기존 ENOVIA Number Generator 객체를 직접 사용하는 경우에는 속성명이 실제 환경에서 `eService Next Number`인지 확인하고 전달합니다. 이 값은 **다음에 발급할 정수**여야 합니다. 마지막 발급값을 저장하는 기존 구현이면 의미를 그대로 혼용하지 말고 연결부를 수정합니다.

`sdx-ecr.example.properties`는 설정 형식 예시이며 실행 가능한 운영 ID가 없습니다. 기존 카운터 ID로 채우고 서버의 기존 설정 로딩 경로로 읽습니다. 한 사업부·날짜에는 한 카운터만, 모든 서버 노드에서는 동일한 매핑을 사용합니다. 해당 카운터에 다른 OOTB 채번기가 동시에 값을 쓰면 안 됩니다. 기존 쓰기 경로까지 같은 잠금·증가 규약으로 통일해야 합니다.

**실제 생성 메서드에 넣을 패치는 제공하며, 설치 환경의 카운터 ID·사업부 매핑과 서버 배포는 아직 완료되지 않았습니다.** 날짜에 맞는 기존 카운터가 없으면 코드는 생성을 거부합니다. 카운터를 자동 생성하거나 공용 카운터를 1로 리셋하지 않습니다. 기존 시스템이 일자별 카운터를 제공하지 않는다면 기존 영속 채번 구현에서 날짜별 시리즈를 지원하도록 수정해야 하며, 이 자료만으로 매일 자동 초기화가 완성된다고 볼 수 없습니다.

기존 발급번호가 있으면 MQL 조회 결과로 초기값을 보정합니다. 예를 들어 마지막 번호가 A999이고 카운터가 1이면 B001(정수 10999)을 발급합니다. 카운터가 빈 값/0인 경우에도 같은 조회로 시작값을 결정합니다. 카운터가 더 앞서 있으면 낮추지 않습니다. 이미 삭제된 과거 번호는 객체 조회만으로 복원할 수 없으므로 해당 채번 이력의 다음 값은 별도로 이관해야 합니다.

## 트랜잭션과 동시성

ENOVIA 어댑터는 기존 **update 트랜잭션 안에서만** 실행됩니다. 기존 트랜잭션을 별도 commit/abort하지 않습니다. 카운터의 `lockForUpdate` 후 속성과 기존 ECR 번호를 조회하고, `max(1, 저장된 다음 순번, 기존 최대 순번 + 1)`을 발급한 다음 카운터를 증가시킵니다. Z999 초과 시에는 갱신하지 않고 실패시킵니다. CA 생성과 분류 저장까지 성공한 뒤 기존 호출자가 commit합니다. 실패 시 기존 호출자는 전체 트랜잭션을 abort해야 합니다. 예외를 잡고 계속 생성하면 안 됩니다.

현재 날짜는 잠금 대기 전에 한 번 확정합니다. 자정에 걸친 요청은 해당 확정 날짜를 일관되게 사용합니다. 사업부는 서버 Context의 정확한 credential/user 값에 매핑합니다. 클라이언트의 날짜·사업부 값이나 임의로 분해한 조직 문자열은 사용하지 않습니다. 실제 조직 조회 규칙이 따로 있다면 검증된 서버 조회를 연결합니다.

실제 분산 잠금 및 롤백 동작은 설치 버전·DB에서 검증해야 합니다. 순번 할당 후 응답을 잃고 사용자가 다시 요청하는 경우의 중복 생성 방지는 원래 생성 서비스의 재요청 처리 범위입니다.

## 검사 실행

JDK 17에서 Java 8 호환 대상으로 컴파일합니다.

```bash
python3 run_tests.py
```

실제 SDK 빌드는 `python3 compile_with_sdk.py PATH/TO/WEB-INF/lib`로 수행합니다. R2024x의 실제 JAR에 대한 컴파일을 확인했습니다. **tests/stubs는 배포하거나 실제 ENOVIA JAR와 함께 컴파일하지 않습니다.** 이 저장소의 검사는 대역 API를 사용하며 서버 통합 검사와 구분됩니다.
