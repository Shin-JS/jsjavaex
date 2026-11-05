# sdxECChangeAction 생성창

이 버전은 **`feature/ca-ootb-entry-only-2026` 별도 브랜치**에서 검토합니다.
기본 브랜치의 기존 배포본과 분리하며 자동 병합하지 않습니다.

2026-11-05: **위젯 소스는 R2026x를 우선 기준으로 검토합니다.**
OOTB 수정은 이미 커스텀한 `ENOChgGovernanceUX.js`의 생성 진입부만 남깁니다.
`ENONewWidget.js`, `ClassificationsFacet.js`, `ClassificationProp.js`는 설치 버전 원본을 사용합니다.

## 배포할 커스텀 파일

서버 `3dspace/webapps/sdxENOChgGovernanceUX/custom/services`에 아래 **세 파일**을 배포합니다.

| 파일 | 역할 |
|---|---|
| [sdxECCACreateService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js) | 생성 진입, 전용 엔진·Controller·Dialog·facet 상속 클래스 |
| [sdxECCAAutoClassService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js) | 창별 세션, 자동 분류, 분류 폼 이동, 속성 제어, 검색, 검증·저장 전 처리 |
| [sdxECCADataService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCADataService.js) | 클래스 규칙·속성·제어 bus·모델 검색·상세 조회 |

세 파일의 내부 named AMD 모듈은 함께 등록됩니다. 내부 클래스마다 별도 파일을 배포하지 않습니다.
`sdxECCA.js`와 예전 개별 AttributeControl/ObjectSearch/조회 서비스 파일도 배포하지 않습니다.
Node나 별도 빌드는 서버 배포에 필요하지 않습니다.

환경 설정은 기존 [우리 위젯의 HTML 초기화 위치](webapps/ENOChgGovernanceUX/ENOChgGovernance.html)에 둡니다.
현재 클래스 규칙은 EC Library/EC_MX이고, 향후 사용자 정보 조회로 결정하는 Provider 연결은 유지합니다.
사용자·부서 정보를 공통 모듈의 전역 캐시에 저장하지 않습니다.

## OOTB 연결과 기존 설치본 전환

[ENOChgGovernanceUX.js의 G0~G2 메모](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js)만 적용합니다.
이는 전체 파일 교체본이 아니라 기존 커스텀 생성 모듈에 적용할 조각입니다.
대상 위젯은 `entry.launch(options)`를 호출하며, 일반 위젯은 기존 Launcher를 사용합니다.

**기존 네 파일 수정 방식에서 전환할 때는 [전환 안내](MIGRATION.md)를 먼저 따릅니다.**
예전 세 OOTB 파일의 자동 분류 연결을 원복하고 커스텀 JS 세 파일을 같은 버전으로 배포합니다.
서버의 릴리스·핫픽스에 맞는 원본으로 원복해야 합니다. 참고 저장소의 원본 파일을 서버에 덮어쓰지 않습니다.

## 현재 구조

CreateService가 OOTB 엔진을 상속하고, 이 생성창의 Controller·Dialog·기본/분류 facet만 교체합니다.
기본 facet 목록과 분류 위젯의 속성 facet 정의는 **해당 인스턴스의 복사본**에서 커스텀 경로로 연결합니다.
공통 helper, RequireJS 설정, OOTB prototype은 변경하지 않습니다.

분류 입력 폼과 모델을 그대로 속성 탭으로 이동합니다.
기존 `postCreation`·분류 저장·기본 필드의 펼치기 구획·입력/저장 검증을 재사용합니다.
이 연결은 OOTB 내부 구조에도 의존하므로 공식 확장 API만 사용하는 구현으로 표현하지 않습니다.

R2026x는 생성 모델의 `getSecurityContext()`를 문맥 기준으로 사용합니다.
모델 변경 이벤트에서 새 분류 세션을 만들고, 최종 저장도 같은 모델 문맥과 비교합니다.
권한 문맥별 typeInfo/자격증명 재조회는 응답 세대를 확인하여 이전 응답의 화면 반영을 막습니다.
R2025x의 `New-SecurityContext` 필드 방식은 호환 경로로 유지합니다.

## 수정 위치

| 할 일 | 파일·위치 |
|---|---|
| 생성 엔진·대화상자·facet 연결 | CreateService의 named AMD 클래스 |
| 환경 설정 읽기 | AutoClass C0 `sdxECCAReadSettings` |
| 초기화·문맥 변경·종료 | AutoClass C1 |
| Text 복사·조직값·EC Type·policy | AutoClass C2 |
| 기본 폼·분류 영역 연결 | AutoClass C3 `sdxECCAInstallAutoFields` |
| 검증과 버튼 상태 | AutoClass C4 |
| 클래스 자동 선택·속성 로딩 | AutoClass C5 |
| 표시·편집·순서·필수 제어 | AutoClass C6 |
| 검색 선택 후 다른 필드 채우기 | AutoClass C7 `accept(record)`의 `record.attributes` |
| 사용자/부서 조회 계약 | DataService S1·S2 |
| 클래스 코드·속성 조회 | DataService S3 |
| 제어 bus 조회 | DataService S4 |
| 모델 검색·ID로 전체 속성 조회 | DataService S5 |

`sdxECOrganization`의 값 출처는 미정입니다.
현재는 세션의 `organizationValue`가 지정되면 `publicAttributes`의 숨긴 필드에 반영합니다.
기존 Text 복사·policy·모델 검색 선택값 저장 처리는 유지합니다.

- [속성 제어](ATTRIBUTE-CONTROL.md)
- [모델 검색](MODEL-SEARCH.md)
- [권한 문맥 재초기화](SECURITY-CONTEXT-VALIDATION.md)
- [사용자/부서 규칙](DEPARTMENT.md)
- [검사 결과와 실제 서버 확인 범위](VALIDATION.md)

자동 검사에서 실제 브라우저·WUX·DB 저장을 대신하지는 않습니다.
배포 후 생성창 열기, 분류값 저장, 협업공간 변경, 검색, 필수값과 CO/CR 회귀를 확인합니다.
