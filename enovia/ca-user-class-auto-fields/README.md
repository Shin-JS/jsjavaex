# sdxECChangeAction 생성창

2026-11-03: 커스텀 JS 9개를 **3개 파일**로 통합했습니다.
생성창 처리, 서버 조회, 생성 진입을 각각 한 파일에서 관리합니다.
이번 정리는 파일 배치와 의존성 연결만 변경합니다. 속성 표시·편집·필수 검증·검색·저장 규칙은 유지합니다.

## 설치 경로 반영 — 2026-11-03

세 파일 모두 `DS/sdxENOChgGovernanceUX/custom/service` 경로를 사용합니다.
기존 생성 진입부는 `sdxECCACreateService`를 직접 로딩하고 `launch()`를 실행합니다.
CreateService는 생성 진입을 담당하며, 조회 묶음은 별도 `sdxECCADataService`가 담당합니다.
`sdxECCA.js`는 배포하지 않습니다. 세 파일의 define/의존성도 이 구조로 맞췄습니다.
내부 보조 named AMD 이름은 유지합니다.

## 배포 파일

`webapps` 이하 구조 그대로 서버 `3dspace/webapps` 아래에 배치합니다. 아래 세 파일은 전체 배포본입니다.

| 파일 | 역할 |
|---|---|
| [sdxECCAAutoClassService.js](webapps/sdxENOChgGovernanceUX/custom/service/sdxECCAAutoClassService.js) | 생성창 세션, 자동 분류, 속성 제어, 검색 UI, 검증, 저장 전 처리 |
| [sdxECCADataService.js](webapps/sdxENOChgGovernanceUX/custom/service/sdxECCADataService.js) | 클래스 규칙·속성, 제어 객체, 모델 검색·상세 속성 조회 |
| [sdxECCACreateService.js](webapps/sdxENOChgGovernanceUX/custom/service/sdxECCACreateService.js) | 우리 위젯에서 커스텀 모듈을 준비하고 기존 생성 호출 실행 |

환경별 값은 기존 [ENOChgGovernance.html의 H1 설정](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) 한곳에서 변경합니다.
이 HTML은 설정 적용 메모이며 서버 HTML 전체 교체본이 아닙니다. 공용 HTML이 아닌 우리 위젯의 기존 초기화 위치에 적용합니다.
타입·policy·제어 상태·라이브러리·클래스 코드·검색 설정을 중복 선언하지 않습니다.

## 수정할 위치

소스에서 아래 C/S 표시 또는 함수명을 검색합니다.

| 할 일 | 파일·위치 |
|---|---|
| 환경 설정 읽기 | AutoClass C0 `sdxECCAReadSettings` |
| 초기화·협업공간 변경·종료 | AutoClass C1 세션 함수 |
| Text 복사·조직값·EC Type·policy | AutoClass C2 `sdxECCABindCreatePolicy`와 그 앞의 준비 함수 |
| 기본 폼·분류 영역 연결 | AutoClass C3 `sdxECCAInstallAutoFields` |
| OOTB 검증과 버튼 상태 연결 | AutoClass C4 |
| 클래스 자동 선택·속성 로딩 | AutoClass C5 |
| 표시·읽기 전용·순서·필수 제어 | AutoClass C6 `install` |
| 검색 선택 후 다른 필드 채우기 | AutoClass C7 `accept(record)` 안의 `record.attributes` 주석 |
| 클래스 결정·부서 조회 연결 | Service S1·S2 |
| 클래스 코드·클래스 속성 조회 | Service S3 |
| 등록창 제어 객체 조회 | Service S4 |
| 모델 검색·ID로 전체 속성 조회 | Service S5 `search`·`readAttributes` |

OOTB 연결은 생성 → 데이터 준비 → 폼 연결 → 검증 → 제출 순서로 기존 공개 API를 호출합니다.
기본 속성과 분류 속성의 생성 시점이 달라 각 연결 지점은 유지합니다.
각 기능의 함수 범위, 세션 격리, 지연 로딩, 종료 시 정리를 보존합니다.

## 기존 정상 배포본에서 갱신

1. 위 커스텀 JS 세 파일을 함께 배포합니다. 기존에 CreateService를 직접 호출한 서버는 OOTB 추가 수정이 없습니다.
2. `sdxECCADataService.js`는 새 조회 묶음입니다. CreateService/AutoClassService와 함께 같은 버전으로 반영합니다.
   이전 예시의 `DS/sdxECCA/sdxECCA`를 사용한 설치본만 G0의 로딩 경로를 CreateService로 바꿉니다.
3. 아래 일곱 개의 예전 개별 JS 파일은 새 버전에서 사용하지 않습니다.
   기존 AMD 이름은 통합 파일 내부에서 유지하므로 OOTB의 호출명은 바꾸지 않습니다.
4. 기존 생성창을 닫고 캐시를 갱신한 뒤 새로 엽니다. 이전 열린 화면을 유지한 상태에서 파일을 섞어 교체하지 않습니다.

| 예전 개별 파일 | 현재 위치 |
|---|---|
| sdxECCAAttributeControl.js | AutoClass C6 |
| sdxECCAObjectSearch.js | AutoClass C7 |
| sdxECCAClassRuleService.js | Service S1 |
| sdxECCAOrganizationProvider.js | Service S2 |
| sdxECCAClassAttributeService.js | Service S3 |
| sdxECCAAttributeControlService.js | Service S4 |
| sdxECCAModelSearchService.js | Service S5 |

예전 개별 파일을 따로 갱신하거나 신규 배포하지 않습니다.
`sdxECCACreateService.js` → AutoClass → Service 순으로 시작하면 두 파일에 포함된 named AMD 모듈이 함께 등록됩니다.
내부 모듈을 통합 파일보다 먼저 개별 URL로 직접 로딩하는 별도 커스텀 진입은 사용하지 않습니다.
일반 위젯은 기존 OOTB 경로를 사용합니다.
이번 정리는 Java 서비스·DB·타입·policy·발번 JPO/트리거를 변경하지 않습니다.

## 최초 설치 시 OOTB 연결

이미 연결을 적용한 설치본은 OOTB를 원복하거나 다시 수정하지 않습니다.
처음 적용할 때만 서버와 동일한 **2025 릴리스/핫픽스의 변경 전 원본**에 아래 메모를 적용합니다. 2024는 참고용입니다.

| 수정할 OOTB 파일 | 연결 메모·위치 표시 |
|---|---|
| ENOChgGovernanceUX.js | [G0~G2 생성 진입·기본 타입](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) |
| ENONewWidget.js | [A facet / B 기본 폼 / C Dialog](webapps/ENONewWidget/ENONewWidget.js) |
| ClassificationsFacet.js | [F0~F4 facet / M0~M1 모델](webapps/ClassificationsFacet/ClassificationsFacet.js) |
| ClassificationProp.js | [P0~P1 속성 로딩 전후](webapps/ClassificationProp/ClassificationProp.js) |

이 네 파일은 **수정 메모**입니다. 서버 OOTB에 전체 덮어쓰지 않습니다.
`[대상 AMD 모듈]`을 찾고 해당 factory의 함수 추가·교체 조각을 모두 함께 적용합니다.
원래 `define` 의존성/인자는 유지합니다. 공통 OOTB에 커스텀 AMD 의존성을 추가하지 않습니다.
압축 변수명과 `_onCompleteLoadModel`/`onCompleteLoadModel` 이름은 설치 원본에 맞춥니다.
Node 실행·소스 조립·별도 빌드는 배포에 필요 없습니다. tests는 개발자용이며 서버에 배포하지 않습니다.

## 유지한 동작과 상세 설명

- [속성 제어](ATTRIBUTE-CONTROL.md): 제어 bus의 Read/Edit/Order/Mandatory/MandatoryCheck, CCMAttr 조회명, 분류 우선 중복 숨김.
- [모델 검색](MODEL-SEARCH.md): sdxMTopAssy 단일 선택, 직접 입력 미저장, 선택 ID로 속성 재조회.
- [협업공간 변경](SECURITY-CONTEXT-VALIDATION.md): 새 세션·분류 재조회, 이전 응답 차단, 최종 요청 문맥 일치.
- [부서 규칙](DEPARTMENT.md): 향후 부서 조회 연결. 현재 code 모드는 EC Library/EC_MX를 사용합니다.

`sdxECOrganization`은 값 출처가 아직 미정입니다. 해당 세션의 `organizationValue`에 문자열을 지정하면 C2에서
`publicAttributes`의 숨김 속성에 반영합니다. 미지정·빈 문자열이면 기존 값을 유지합니다.
Text 복사와 policy 처리도 C2의 원래 OOTB 제출 콜백 뒤에서 수행합니다.

## 검증

[현재 검사 결과와 범위](VALIDATION.md)를 참고하십시오.
RequireJS 실제 파일 로딩과 기존 대역 검사는 실제 ENOVIA 화면·DB 저장을 대신하지 않습니다.
배포 후 기본/분류 입력, 펼치기, 필수 아이콘·오류 시점·저장 버튼, 검색 선택·속성 조회,
Text·조직값, 협업공간 변경·저장, 일반 위젯과 CO/CR을 확인합니다.
