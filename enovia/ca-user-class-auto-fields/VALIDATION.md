# 검사 결과와 현장 확인 범위 — 2026-10-19

## 현장에서 확인한 내용

사용자가 실제 설치 환경에서 고정 클래스의 속성 필드 표시를 확인했습니다. 문맥 검사에 문자열을 전달하고, 세션 속성명을 맞추고, 속성 완료 알림의 인자를 실제 코드에 맞춘 뒤 표시됐습니다. 현재 설치 소스가 modelList:[i], onAttributesLoad:function(r)이면 notifyAttributesLoaded(i,r)입니다. 호출 위치는 ClassificationProp.js이며, 모델 세션을 붙이는 tagClassModel은 ClassificationsFacet.js입니다.

검증은 실제 분류 폼 facet의 UIController.validateModels로 연결했습니다. 별도 검증 모듈 로딩은 제거했습니다. debug용 공유 모델/컨트롤러 변수와 console 로그는 배포 코드에서 제외했습니다. 모듈 ID/경로는 사용자 로컬 이름이 아닌 이 폴더의 표준 경로로 유지하며, 다른 경로에 배포할 때 define ID와 의존성을 함께 변경해야 합니다.

## 이번에 통과한 대역 검사

- 위젯 비활성/다른 타입에는 세션을 추가하지 않는 기존 적용 제한.
- 고정 클래스 적용, 유형 숨김/읽기 전용과 원래 생성 스키마 유지.
- 실제 분류 폼 모델을 OOTB UIController.validateModels에 전달하며 별도 검증 모듈 요청 없음.
- 클래스 선택과 실제 속성 완료를 구분하며 잘못된 모델/응답 순서로 준비 완료되지 않음.
- 부서 서비스의 tenant/문맥 전달, 부서 미설정/매핑 없음/중복/응답 형식/조회 실패 처리.
- department 모드에서 고정 ID 없이 초기화하고, 조회 오류 시 고정 클래스로 우회하지 않음.
- 서로 다른 대화상자의 부서 조회 응답이 역순으로 와도 세션별 클래스가 유지됨.
- 대화상자 종료 또는 문맥 변경 후 늦은 부서 응답이 클래스 선택을 실행하지 않음.
- 기존 라이브러리 경로/클래스 종류 검증, 속성 검증/blur, 준비 전 생성 거부와 폼 원위치 복구.
- 일곱 OOTB 모듈의 기존 의존성/인자 순서 보존, 커스텀 인자 마지막, 두 CSS 자리 인자.
- 새 세 AMD 파일 및 변경 메모의 JavaScript 문법 검사.

폴더에서 재실행:

```sh
node tests/test-auto-fields.cjs
node tests/test-amd-headers.cjs
node --check webapps/sdxECCAAutoClass/sdxECCAAutoClass.js
node --check webapps/sdxECCAAutoClass/sdxECCAClassRuleService.js
node --check webapps/sdxECCAAutoClass/sdxECCAOrganizationProvider.js
```

테스트는 VM/AMD/DOM/서버 대역이며 실제 플랫폼 실행/저장을 대신하지 않습니다. amd-headers.json은 공개 R2024x 참조의 헤더 fixture이며 설치 버전과 동일함을 보장하지 않습니다.

## 남은 확인

- 실제 사용자/부서 API와 General Type의 부서 속성 및 General Class 연결 정의 확정.
- OrganizationProvider 두 함수의 실제 조회 구현과 권한/전체 조회 결과 검증.
- 새 서비스 분기의 실제 플랫폼 배포·부서별 실행·다른 위젯 영향 확인.
- 실제 입력값 커밋, 필수/범위 검증, Enter/버튼/반복 생성 및 새 CA의 분류/속성값 저장.

커스터마이징 없는 서버에서도 재현된 ClassificationAttributeUtil.java:95 저장 오류는 별도로 보류 중입니다. 필드 표시 확인이 저장 성공까지 의미하지는 않습니다.


## 2026-10-20 클래스 전체 필수 규칙

- `test-class-mandatory.cjs`: 클래스 자체 플래그 Y/N/빈 값, 잘못된 객체/응답,
  현재 클래스 전 속성 mandatory, 기본 속성/다른 클래스/비대상 모델 격리,
  기존 필수값과 입력값 보존, 공유 데이터 복제, 폼 생성 전 연결 누락, 조회 실패, 종료 후 응답 검사 통과.
- `test-auto-fields.cjs`: 클래스 플래그 조회가 추가된 비동기 선택, 기존 준비/생성 검증/복원/부서 흐름 검사 통과.
- `test-amd-headers.cjs`: 기존 7개 OOTB 모듈 의존성/인자 매핑 검사 통과.
- OOTB R2024x 소스에서 `mandatory:true` → 모델 mandatory → Form `mandAttr` 표시와
  AttributesUtils의 필수 검증 연결을 확인했습니다. 실제 브라우저 렌더링을 실행한 결과는 아닙니다.
- 서버 확인 필요: General Class 자체의 제어 속성이 attributes/op/read의 results.data로 반환되는지,
  설치 버전의 동일 API/필드 계약, Y/N별 실제 표시와 생성 검증. 서버 저장 규칙을 추가한 변경은 아닙니다.


2026-10-20 OOTB 검증 연결 수정:

- 별도 validateMandatoryFields 및 null/빈 값 판정 제거.
- 선택 시 모델과 화면 모델을 다르게 만든 대역 검사에서도 실제 화면 모델로 OOTB 검증 호출 확인.
- notifyAttributesLoaded는 실제 폼 모델에 mandatory가 전달되지 않았으면 오류 처리.
- test-auto-fields, test-class-mandatory, test-amd-headers 모두 통과.
- test-ootb-validation에 R2024x 실제 AttributesUtils 코드를 전달하여 실행: 빈 문자열/빈 배열의 필수 오류,
  모델 setError 호출, 값 입력 후 통과와 선택 속성 허용 검사 통과. 공급사 코드는 저장소에 복사하지 않았습니다.
- 실제 별표 DOM/중복 해결, 설치 서버의 API 및 생성·저장 동작은 미검증입니다.


2026-10-20 입력 중 생성 버튼 상태 연결:

- 모델 변경 → OOTB validateModels → classificationFacet.setFacetValidation 연결.
- 대역 검사: 로딩 비활성, 필수 오류 비활성, 값 수정 후 활성, 다른 facet 무효 시 계속 비활성,
  resetButtons 이후 무효 상태 보존, 종료 시 onChangeAttributes 구독 해제 통과.
- test-ootb-button-state: R2024x ENONewFacetBase와 ENONewDialogController의 실제 코드를 실행하여
  setFacetValidation → evaluateValidationStatus → 생성 버튼 전체 비활성/활성,
  다른 facet 무효 상태 보존과 취소 버튼 유지 검사 통과.
- 필수 별표는 기존 mandatory 메타데이터만 사용합니다. 별도 표시 코드는 추가하지 않았습니다.
- 서버의 실제 버튼/별표 중복 및 입력값 저장은 실행하지 못했습니다.


2026-10-21 occurrence 초기화 순서 보완:

- 컨트롤러가 준비됐어도 getOccurrence()가 null이면 setFacetValidation/자동 선택을 호출하지 않음.
- 초기 false 상태를 보존하고 occurrence가 나중에 붙으면 같은 false 상태도 OOTB에 발행하는 검사 통과.
- 기존 위젯 격리/모델 검증/버튼 상태 검사 모두 통과. 실제 설치 서버에서의 확인은 남아 있습니다.


2026-10-21 기본 필수 아이콘 표시:

- 대상 폼의 구형 필수 라벨 요소만 mandIcon/wux-ui3ds/wux-ui-3ds-new-create span으로 교체.
- 반복 렌더링 시 중복 생성하지 않고 검증 모델/버튼 경로를 변경하지 않는 검사 통과.
- 실제 서버의 두 별표 소멸 여부와 분류 빨간 X 원인/해결은 미검증입니다.


분류 탭 오류 아이콘 변경 제거:

- setFacetValidation을 호출하면 예외를 던지도록 만든 대역에서 초기 로딩/오류/유효 상태 테스트 통과.
- bindDialog 후 OOTB evaluateValidationStatus로 버튼만 갱신하며, 분류 facetValidation은 실제 결과를 유지.
- 실제 R2024x DialogController.evaluateValidationStatus에서도 무효/유효에 따른 버튼 상태와 아이콘 속성 유지 검사 통과.
- 이번 수정은 생성 API 오류를 처리하지 않습니다. 실제 서버의 탭 표시/생성은 미검증입니다.
