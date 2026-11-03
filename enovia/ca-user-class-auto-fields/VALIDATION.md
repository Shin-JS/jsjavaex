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


bindDialog 지연 연결 보완: 동기 버튼 집계 호출 없음, 같은 dialog 중복 연결 방지,
집계 중 bindDialog 재호출 무시, 연결 대기 중 화면 종료 후 늦은 작업 무시 검사 통과.
사용자 환경의 팝업 표시 정상화는 재배포 후 확인이 필요합니다.


설치 버전 버튼 API 차이 보완:

- disableFormSubmit이 없고 evaluateValidationStatus만 있는 대역에서 필수 오류/정상 전환 통과.
- 네이티브 집계가 preserveValidationState로 재진입해도 한 번만 집계하는 검사 통과.
- auto-fields, class-mandatory, amd-headers 및 R2024x 원본 기반 validation/button-state 검사 통과.
- 실제 설치 서버의 버튼 상태와 생성 응답은 재배포 후 확인이 필요합니다.

## 2026-10-23 sdxECModel 검색

`node tests/test-object-search.cjs` 통과: 타입 제한/단일 선택 전달, 기존 속성 모델의
value/valueDB 및 변경 플래그 반영, 취소/저장 필드 누락/복수 선택 시 값 유지,
중복 장착 방지, 문맥 오류/종료 후 지연 선택 무시, 다른 타입/비활성 설정 제외.
기존 auto-fields/class-mandatory/class-code/amd-headers 검사도 통과했습니다.
실제 대시보드에서 돋보기 위치·6W 검색창, 선택 응답 최상위 name 필드,
최종 생성 Payload의 sdxECModel 값과 생성 객체 속성 저장을 확인해야 합니다.

## 제어 객체 기반 속성 구성 — 2026-11-02

Searchable 검사 대신 test-attribute-control-service.cjs, test-attribute-control.cjs,
Java AttributeControlTest로 새 규칙을 검사했습니다. 상세 범위와 배포 환경의 미검증 항목은
[ATTRIBUTE-CONTROL.md](ATTRIBUTE-CONTROL.md)에 기록했습니다.
기존 runtime-hooks.json과 OOTB JS 적용 메모는 수정하지 않았고 실제 2025 원본 연결 검사를 통과했습니다.

### 상태 파라미터 및 Classification 확장

서버의 CREATE 상수를 제거하고 JS state를 검증하여 DB where/응답에 사용합니다.
test-class-control-hooks와 DOM 검사에서 분류 응답 선행/규칙 선행, 목록 밖 행 숨김,
분류 편집 제어·필수 표시/검증 분리·원래 class ID/값 보존·UI 재생성/정리를 확인했습니다.
기존 클래스 전체 필수 로직은 비대상 타입에서 유지하며, 대상 CA는 속성별 제어 규칙을 우선합니다.

분류의 CCMAttr 접미어는 규칙 조회에서만 제거하고 실제 이름/ID는 보존합니다.
중복 기본 속성의 숨김/필수 검증 제외/원래 값 보존, 접미어가 중간에 있는 이름의 비매칭,
분류 목록 지연 및 재생성 시 우선순위를 DOM/모델 검사에 포함했습니다.

Y/N/X 확장: Java AttributeControlTest에서 네 제어 항목 각각의 X 허용,
N과 X의 전체 응답 동일성, 전 항목 X 조합, 지원하지 않는 Z의 거절을 검사합니다.

### 2026-11-03 초기화 대기 분리

CA occurrence가 없음/지연됨/setValidation이 없는 경우에도 준비된 라이브러리 컨트롤러로
자동 선택을 한 번만 시작하는 회귀 검사를 추가했습니다.
분류 목록보다 제어 응답이 먼저 와도 기본 폼을 표시하고, 목록 도착 후 중복 숨김/편집 허용을
재적용하며 원래 값을 보존하는 DOM 검사를 추가했습니다. 저장은 분류 준비 완료까지 차단합니다.

### 기본 입력/추가 정보 구획 복구

분류 목록 대기 중에도 Edit=Y 필드의 readOnly=false를 확인하고,
필수 표시/검증 4조합에 맞는 기본/ExtensionsFacet 구획과 section/form/group 보존을 검사합니다.
test-ootb-control-layout.cjs는 실제 2025 AttributeModel/FormSections/Form/manageAccordion을
실행하여 두 구획, 각 구획의 정렬, 펼치기 헤더를 확인합니다. WUX 입력의 실제 브라우저 렌더링은 별도 확인 대상입니다.

2026-11-03 분류 편집 모드·별표 위치·OOTB 검증 복원:

- Edit=true만으로는 전체 분류 폼의 조회 모드가 바뀌지 않아, Properties.initData의 FORCE_READWRITE를 사용합니다.
- test-ootb-classification-edit.cjs: 실제 2025 Properties.initData/_switchEditionMode로 편집 전환, 읽기 전용 권한, 기존 모델/값 보존을 확인했습니다.
- 같은 검사에서 실제 기본·분류 AttributesUtils로 Mandatory/MandatoryCheck 4조합 및 읽기 전용 필드의 OOTB 검증 동작을 확인했습니다.
- 별도 빈값 검사와 AttributeControl의 onSubmit 래퍼를 제거했습니다. 기본 폼 원래 onSubmit과 분류 UIController.validateModels를 유지합니다.
- DOM 검사로 입력창 생성과 별표의 textContainer 내부 배치를 확인했습니다. OOTB 원본 파일의 추가 수정은 없습니다.
- 실제 설치 환경의 WUX 렌더링/별표 위치/저장 동작은 배포 후 확인해야 합니다.

2026-11-03 후속 수정: 분류 폼 전체 잠금 원인 제거 및 초기 버튼 검증:

- 이전 검사에는 prepareAttributes → _onCompleteLoadModel의 allAttributeAreRO 집계가 빠져 있었습니다.
- prepareAttributes가 모든 분류 속성에 readOnly=true를 넣어 OOTB가 폼 전체를 조회 전용으로 판정하던 부분을 제거했습니다. 응답의 편집 가능/읽기 전용 값을 보존합니다.
- 실제 OOTB _onCompleteLoadModel로 커스텀 prepareAttributes 결과를 처리하여 편집 가능/읽기 전용 양쪽 판정을 확인했습니다. 모델 생성/네트워크 부분은 대역입니다.
- 규칙 적용 후 기본 폼의 원래 validateForm/updateValidStatus를 호출합니다. 별도 빈값 검사나 버튼 직접 활성화는 추가하지 않았습니다.
- 실제 ENOListView/AttributesUtils/DialogController로 초기 미수정 필드의 검사 생략을 재현하고, 전체 검증 후 생성 버튼 비활성화 → 값 입력 시 활성화 → 값 제거 시 비활성화를 확인했습니다. 취소 버튼은 유지됩니다.
- 분류 속성의 모델 변경 검증/버튼 집계와 기존 필수 표시·검증 분리는 유지합니다. 실제 배포 화면에서의 확인은 별도로 필요합니다.

2026-11-03 초기 오류 문구 표시 수정:

- 직전 수정의 초기 validateForm 호출이 새 창에서 제목 등의 필수 오류를 표시하는 부작용이 있어 제거했습니다.
- onValidActivation의 활성화 판단에 OOTB validateModels 결과를 합칩니다. 검사 대상은 원래 모델/필드를 상속하는 임시 객체이며 오류 resetError/setError는 실제 필드에 쓰지 않습니다.
- 실제 isFormValid, isUIModified, 기존 서버 오류, 원래 onSubmit은 변경하지 않습니다. 다른 dispatchEvent의 인수도 그대로 전달합니다.
- 실제 OOTB ENOListView/AttributesUtils/DialogController 기반 검사: 초기 필수값 미입력 시 버튼 비활성화 및 실제 오류 상태 없음, 입력 시 활성화, 수정 후 비우기/저장 시 원래 오류 표시, 기존 오류 유지.
- 실제 WUX 화면 렌더링은 설치 환경에서 확인해야 합니다. 배포 변경은 sdxECCAAttributeControl.js 하나입니다.
