# sdxECChangeAction 생성창 — ENONewWidget 원본 유지

검토 브랜치: **`feature/ca-enonewwidget-untouched-2026`**. master에는 병합하지 않습니다.
R2026x 소스를 우선 기준으로 합니다. 설치본의 릴리스·핫픽스 차이는 적용 전 대조합니다.

## 적용 범위

| 파일 | 처리 |
|---|---|
| ENONewWidget.js | **원본 유지**. 예전 A/B/C 연결 제거 |
| ENOChgGovernanceUX.js | G0/G1/G2 생성 진입 연결 유지 |
| ClassificationsFacet.js | master의 F/M 연결 유지, 아래 2026 메모로 대조·갱신 |
| ClassificationProp.js | master의 P 연결 유지, 아래 2026 메모로 대조·갱신 |

원본 모듈/파일을 커스텀 이름으로 복제하지 않습니다. 공통 prototype이나 전역 RequireJS 설정도 변경하지 않습니다.
분류 초기화·선택·속성 렌더링·저장은 기존 OOTB 경로와 F/M/P 연결을 사용합니다.
이전 전체 무수정 브랜치의 직접 분류 초기화, 강제 번들 선로딩, 전용 분류 Controller와 자동 진단은 제거했습니다.

## Change Order 생성 적용 — 2026-11-13

동일한 `sdxECChangeAction` 타입을 생성하고 CO 진입에서만 `sdxECO` policy를 전달합니다.
기본 타입 조회/생성 서비스의 `typeName`은 기존 성공 경로인 `Change Action`을 유지합니다.

- `ENOChgGovernanceUX.js` 메모의 CO0/CO1/CO2를 R2026x `DS/ENOChgGovernanceUX/scripts/view/ChgCreateChangeOrder` factory에 적용합니다.
- `sdxECCACreateService.js`, `sdxECCAAutoClassService.js`를 전체 갱신합니다. DataService와 Java 서비스는 기존 policy 조건 지원본을 사용합니다.
- 위젯의 기존 CA policy 설정 `sdxECCACreatePolicy=sdxECR`은 유지합니다. CO 진입은 창별 설정으로 `sdxECO`를 전달하고 위젯 값을 덮어쓰지 않습니다.
- CO 제어 조회 상태는 `sdxECCACOAttributeControlState`로 지정하며 미설정 시 `CREATE`입니다. 실제 CO 제어 객체에 `ECO_CREATE` 등 다른 값을 사용한다면 그 값으로 지정합니다. policy 초기 상태를 DB에서 자동 조회하는 기능은 추가하지 않았습니다.
- `sdxECType`은 세션 policy에 따라 `sdxECR → ECR`, `sdxECO → ECO`로 준비합니다. 속성 제어 GET도 같은 세션 policy를 전달하므로 기존 Java 서비스가 `sdxECAttributeType=ECO` 조건으로 조회합니다.
- 자동분류·속성 제어·검색·Text 복사·필수표시/검증은 기존 서비스를 함께 사용합니다. 클래스 조건은 현재 위젯 설정을 그대로 사용합니다.
- CO 기본 타입 사용자 설정에는 커스텀 타입을 저장하지 않습니다. 성공 후 CO 목록/상세 갱신과 로더·분석·실패/취소 처리는 원본을 유지합니다.
- `processChangeOrder`/`createBlankChangeOrder`의 별도 생성 경로와 Change Request 경로는 이번 적용 대상이 아닙니다.

아래 자동 검사 통과와 별개로 실제 서버에서 생성/분류 저장 및 CO 목록·상세 표시를 확인해야 합니다.
`sdxECChangeAction` 타입 객체를 CO 화면에 표시하는 지원 여부는 설치 서버의 서비스/목록 로직에 따라 달라질 수 있습니다.

## 배포 파일

서버 `3dspace/webapps/sdxENOChgGovernanceUX/custom/services`에 커스텀 **세 파일을 함께** 배포합니다.

| 파일 | 역할 |
|---|---|
| [sdxECCACreateService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js) | 생성 진입, 전용 Engine/Controller/Dialog/기본 속성 facet |
| [sdxECCAAutoClassService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js) | 창별 세션, 자동분류, 폼 이동, 속성 제어·검색·검증·저장 전 처리 |
| [sdxECCADataService.js](webapps/sdxENOChgGovernanceUX/custom/services/sdxECCADataService.js) | 클래스 규칙·속성·제어 bus·모델 검색·상세 조회 |

내부 상속 클래스는 CreateService 안에 함께 등록됩니다. 내부 클래스별 JS 파일은 배포하지 않습니다.
Node나 별도 빌드는 서버 배포에 필요하지 않습니다.
환경 값은 기존 [HTML 초기화 위치](webapps/ENOChgGovernanceUX/ENOChgGovernance.html)에 둡니다.
현재 클래스 규칙은 EC Library/EC_MX이고, 향후 사용자 정보 조회 Provider 연결은 유지합니다.

다음 세 파일은 **전체 교체본이 아니라 적용 위치와 변경 조각을 담은 메모**입니다.

- [Governance G0/G1/G2](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js)
- [ClassificationsFacet F/M](webapps/ClassificationsFacet/ClassificationsFacet.js)
- [ClassificationProp P](webapps/ClassificationProp/ClassificationProp.js)

서버 상태별 적용 순서는 [전환 안내](MIGRATION.md)를 따릅니다.

## 구조

CreateService는 ENONewWidget의 Engine/Controller/Dialog/ENOListViewFacet을 상속합니다.
원본 helper가 만든 facet 목록 복사본에 세션을 전달하고 **기본 속성 facet만** 커스텀 경로로 연결합니다.
분류 facet의 `DS/ClassificationsFacet/PLMNewClassificationFacet` 경로는 유지합니다.
`widget.sdxECCARuntime`에 현재 위젯의 API를 연결하여 master와 같은 F/M/P 코드가 호출하게 합니다.
세션이 없는 일반 생성창·다른 유형의 모델은 F/M/P에서 원래 동작을 유지합니다.

기본 필드 펼치기/입력 검증과 분류 폼·분류 저장은 원래 모델과 렌더러를 사용합니다.
C6/C7의 표시·편집·순서·필수 제어, 모델 검색, Text 복사, policy와 조직값 처리를 유지합니다.
생성 저장 직전 `sdxECPlan`/`sdxECCondition`/`sdxECReason`의 최신 HTML에서 텍스트를 추출하여
각각 `sdxECPlanText`/`sdxECConditionText`/`sdxECReasonText`에 저장합니다.
원본 HTML은 유지하며 문단·줄바꿈·HTML 엔티티를 처리합니다. 빈 값은 빈 문자열로 저장하고,
그 외 `Text` 접미사 속성은 기존 값 복사 규칙을 유지합니다.
`sdxECOrganization` 값 출처는 미정이며 세션의 organizationValue가 있으면 publicAttributes 숨긴 필드에 반영합니다.

2026 생성 모델의 getSecurityContext를 기준으로 문맥 변경 시 분류 세션을 재생성하고 이전 응답을 차단합니다.
F의 저장 문맥 함수는 대상 생성창 인스턴스에 묶어 원본 postCreation이 함수만 전달해도 같은 문맥을 사용합니다.

## 확인 범위

[검증 결과](VALIDATION.md)와 [참조 소스](REFERENCES.md)를 참고합니다.
자동 검사는 실제 ENOVIA 브라우저·WUX·DB 저장을 대체하지 않습니다. 서버 배포 후 생성/자동분류/저장과 문맥 변경 확인이 필요합니다.
