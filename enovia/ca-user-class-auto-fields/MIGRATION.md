# ENONewWidget 기존 수정본을 유지하는 구조로 전환

기준일: 2026-11-05. 위젯은 R2026x 소스를 우선 참고합니다.

## 최종 파일 구성

| 파일 | 최종 상태 |
|---|---|
| ENOChgGovernanceUX.js | 기존 커스텀 유지. G0의 `entry.launch(options)` 호출 사용 |
| ENONewWidget.js | 직전 푸시 전의 기존 A/B/C 연결을 그대로 유지/복원 |
| ClassificationsFacet.js | 우리 자동 분류 연결을 제거한 설치 버전 원본 |
| ClassificationProp.js | 우리 자동 분류 연결을 제거한 설치 버전 원본 |
| custom/services의 커스텀 JS 세 개 | 새 버전을 함께 배포 |

ENONewWidget 수정 메모의 내용은 직전 푸시 전 커밋 `9627977`과 같습니다.
이는 서버 파일 전체 교체본이 아니라 변경 조각입니다. 서버 파일을 이 메모로 덮어쓰지 않습니다.

## 현재 설치 상태에 따른 적용

### 직전의 한 파일 수정 구조(cd29be2)를 이미 반영한 경우

1. 열린 생성창을 닫고 기존 배포본을 보관합니다.
2. ENONewWidget의 A/B/C 연결을 푸시 전의 수정 상태로 복원합니다.
3. ClassificationsFacet/ClassificationProp은 원본 상태로 유지합니다.
4. CreateService/AutoClassService/DataService 세 파일을 함께 배포합니다.
5. ENOChgGovernanceUX의 `entry.launch(options)` 호출은 유지합니다.
6. 브라우저/위젯 캐시를 갱신하고 새 창에서 확인합니다.

### 직전 푸시를 아직 서버에 반영하지 않은 경우

1. ENONewWidget의 기존 A/B/C 연결은 그대로 둡니다.
2. ClassificationsFacet의 F/M, ClassificationProp의 P 연결만 제거합니다.
3. 커스텀 JS 세 파일을 함께 배포하고 ENOChgGovernanceUX의 생성 호출을 확인합니다.
4. 브라우저/위젯 캐시를 갱신합니다.

원복은 서버와 같은 릴리스·핫픽스의 변경 전 소스를 기준으로 합니다.
다른 업무의 수정이 섞여 있으면 해당 수정은 보존하고 우리 자동 분류 연결만 제거합니다.
참고 저장소의 원본 파일을 서버에 그대로 덮어쓰지 않습니다.

## ENONewWidget에서 유지하는 연결

| 구역 | 역할 |
|---|---|
| A — ENONewFacetHelper | 기본/분류 facet에 같은 세션 연결 |
| B — ENOListViewFacet | 기본 폼 준비·연결, 문맥 변경, 갱신·종료 |
| C — ENONewDialogController | 제출 전 검증, 버튼 상태 유지, 종료 시 세션 정리 |

CreateService가 `widget.sdxECCARuntime`을 설정하고 위 연결이 해당 위젯의 API를 읽습니다.
전용 Dialog와 PropertiesFacet 상속은 제거했습니다. 기본 폼과 Dialog를 중복 연결하지 않습니다.
분류 facet 경로는 attachBridge에서 해당 생성창에만 지정합니다.

## 2026 원본에서 연결을 다시 넣는 경우

기존 수정 메모의 축약 변수명과 원문은 2025 참조 위치입니다.
같은 기능을 2026 원본에 다시 넣을 때는 해당 모듈의 실제 변수/초기화 순서를 따릅니다.
이미 적용된 기존 ENONewWidget을 유지하는 경우에는 다시 넣을 필요가 없습니다.

- C1: Dialog를 만들고 manageButtons를 호출한 **직후** bindDialog를 호출합니다.
  2026은 draft 버튼을 앞에서 만들고 뒤에서 inject하므로 `t.activateDraftMode`까지 교체하지 않습니다.
- C4: destroy 메서드의 **시작**에서 disposeDialog를 호출합니다.
  2026의 View → myDialog → immersiveFrame 정리 순서는 보존합니다.
- A/B의 연결은 동일합니다. define의 기존 의존성/인자 순서는 바꾸지 않습니다.

개발 검사는 이 위치 차이를 반영하여 2026 원본에 기존 연결을 적용합니다.
서버 배포에 소스 조립 도구나 Node는 필요하지 않습니다.

## 유지한 2026 보완

- 생성 모델의 getSecurityContext와 문맥 변경 이벤트를 사용합니다.
- 문맥 변경 후 기본 폼에도 같은 생성 모델을 전달합니다.
- typeInfo/자격증명 조회는 요청 세대와 최종 문맥을 확인해 이전 응답의 화면 반영을 막습니다.
- 초기 필수 오류 문구를 남기지 않고 입력/저장 시 기존 검증을 유지합니다.
- 분류 폼·모델·저장 경로, 속성 제어, Text 복사·조직값·검색 선택값은 유지합니다.

## 설치 후 확인

기본 속성·추가 정보 펼치기·분류 입력창·돋보기, 최초 필수 오류 표시 시점,
필수값에 따른 저장 버튼, 실제 분류값 저장을 확인합니다.
협업공간 A→B→C→A 전환과 조회 중 종료도 확인합니다.
최종 생성 요청 헤더/객체 협업공간, policy·Text·모델 선택값 및 일반 위젯·CO/CR 회귀를 확인합니다.
자동 검사는 실제 플랫폼 UI·DB 저장 성공을 대신하지 않습니다.
