# SecurityContext 검증 — 2026-10-27

검토 기준: `d04c7e9` 및 직전 `f99a990` / `de2221e`.
실제 ENOVIA/3DDashboard 로그인 세션 없이 소스와 실행 가능한 VM/AMD/DOM 대역으로 검증했습니다.

## 판정

최근 변경은 오류 문구를 숨기는 방식이 아닙니다. 전역 `currentSecurityContext` 이벤트와
생성창 `New-SecurityContext` 선택을 분리합니다. 열린 생성창은 처음 선택한 문맥 A를 유지합니다.
설정의 기본 자격증명이 B로 바뀌어도 열린 창의 생성 대상이 자동으로 B가 되는 기능은 아닙니다.
창 안의 문맥 자체가 B로 변경되면 세션을 오류 상태로 고정하고, 창을 닫아 다시 열어야 합니다.
A로 되돌려도 이전 분류 응답을 재사용해 저장하지 않습니다.

기존 수정에는 최종 저장 데이터의 문맥 재검사가 없었습니다. 모델 변경 이벤트가 누락되면
세션 A에서 준비한 분류를 문맥 B로 생성할 가능성을 코드상 배제할 수 없었습니다.
새 회귀 검사는 수정 전 코드에서 실패했고 이번 수정 후 통과했습니다.

## 추가 변경

- 제출 입구에서 현재 `New-SecurityContext.valueDB`를 세션 문맥과 비교합니다.
  모델이 아직 없으면 기존 OOTB 데이터의 `defaultAttributes.SecurityContext.value`를 확인합니다.
- `sdxECChangeAction`의 OOTB `onSubmit` 비동기 콜백에서 현재 모델과 최종 직렬화된
  `defaultAttributes.SecurityContext.value`를 각각 재검사합니다. 누락/빈 값/불일치는
  `session.fail` 및 `callback(false)`로 거부하고, 다른 문맥으로 덮어써 저장하지 않습니다.
- `runtime-hooks.json`에 남아 있던 구형 전역 이벤트 처리 코드를 실제 배포 메모와 일치시켰습니다.
- `test-runtime-hooks.cjs`의 기대값을 세션 문맥 유지로 바로잡았습니다. 이전 테스트는
  세션을 수동 부착하면서 고정 문맥을 설정하지 않았고 전역 문맥을 기대하고 있었습니다.

## 검증 결과

| 목표 | 실행 결과와 한계 |
|---|---|
| 1. 자격증명 변경 | 배포 조각을 VM에서 실행: 전역 A→B→C→A에도 대상 facet provider는 A 유지, 세션 checkContext 미호출. 실제 설정 UI 조작은 미실행. |
| 2. 창 안 문맥 변경 | 배포 onChangeAttribute 조각에서 실제 checkContext 호출, 기존 publish와 원래 콜백 순서 유지. 세션 오류/변경 후 되돌림 차단 검사 통과. |
| 3. 분류/늦은 응답 | 클래스 코드·부서 조회에 세션 문맥/tenant 전달, 서로 다른 창의 역순 응답 격리, 종료/문맥 변경 후 늦은 규칙·경로·속성 응답 무시 검사 통과. 전역 변경 후에도 기존 창은 A 문맥의 데이터를 의도적으로 유지. |
| 4. 생성 문맥 | 모델 이벤트 누락, BL 처리 중 모델 변경, 직렬화 결과만 변경, 결과의 문맥 누락/빈 값 모두 거부. 같은 문맥은 보존. 공개 R2024x 원본 Controller.onSubmit→Services.createContent 실행에서 전역/기존 헤더 B가 있어도 최종 선택 A가 생성 HTTP 헤더로 전달됨을 확인. 생성 객체의 실제 협업공간은 미검증. |
| 5. CO/CR | 대상 타입 외 bridge 미설치, 공용 배포 조각에서 비대상 facet의 원래 전역 문맥 갱신 유지, Text/정책/검색 격리 검사 통과. 실서버 CO/CR 생성은 미실행. |
| 6. 회귀 | 자동 분류, 필수 메타데이터·OOTB 검증 연결, 버튼 검증 대역, Text 복사, 정책, 객체 검색, 속성 표시 검사 통과. 실제 DB 저장은 미실행. |

외부 원본 없이 실행하는 9개 테스트 파일 모두 통과:

```sh
node tests/test-amd-headers.cjs
node tests/test-attribute-visibility.cjs
node tests/test-auto-fields.cjs
node tests/test-class-code.cjs
node tests/test-class-mandatory.cjs
node tests/test-object-search.cjs
node tests/test-search-initialization.cjs
node tests/test-security-context.cjs
node tests/test-visibility-binding.cjs
```

공개 참조 [ENONewWidget.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENONewWidget/ENONewWidget.js)를
추가 인자로 넘긴 `test-security-context.cjs`의 실제 생성 헤더 전달 검사도 통과했습니다.
같은 공개 참조의 ClassificationProp.js로 `test-ootb-validation.cjs`를 실행해
실제 AttributesUtils의 필수값 오류/정상값 통과를 확인했습니다. 공급사 소스는 커밋하지 않습니다.
전체 배포 메모/fixture 일치는 새 테스트가 검사하고 JavaScript 문법 및 `git diff --check`도 확인했습니다.

## 남은 위험 및 현장 확인

- 설치본 2025 원본 4개 번들을 확보하지 못해 `test-runtime-hooks.cjs`의 전체 패치 적용 실행은
  미완료입니다. 새 테스트는 배포 조각 자체와 fixture 일치를 검사하며 원본 매칭까지 보장하지 않습니다.
- `test-ootb-button-state.cjs`를 공개 R2024x 원본에 실행하면 Save 버튼 기대값에서 실패합니다.
  이 원본의 `disableFormSubmit`은 Ok/Apply를 처리하고 테스트는 Ok/Save를 구성하는 버전 차이가
  확인됐습니다. 이번 변경의 버튼 회귀로 판정하지 않았으며 설치 2025 원본으로 재실행해야 합니다.
- 설치본의 최종 직렬화 결과가 문맥을 생략하면 이제 저장이 거부됩니다. 생략된 문맥을
  세션값으로 자동 보충하지 않습니다. 설치본 계약에 따라 안전하게 실패하는 의도된 동작입니다.
- 서버에서 A 권한이 회수되면 열린 창은 A로 요청한 뒤 권한 오류를 받을 수 있습니다.
  전역 B로 자동 재시도하지 않으며 서버의 최종 권한 검증이 필요합니다.
- 실제 생성 성공 및 객체 협업공간은 서버의 정책/트리거/소유권 처리까지 포함하므로
  클라이언트 헤더 검사만으로 보장할 수 없습니다.
- 기존 보류 사항인 `ClassificationAttributeUtil.java:95` 저장 오류는 이번 변경으로 해결하지 않습니다.

현장에서는 협업공간 A에서 창을 열고 설정의 자격증명을 B로 바꾼 뒤,
창 안 선택이 A인 상태의 분류 요청 및 Create 요청 헤더가 A인지 확인하고,
생성 객체의 실제 협업공간을 조회해야 합니다. 이어 창 안 선택을 B로 바꿔 저장이 차단되는지,
B에서 새 창을 열면 정상 생성되는지 확인하십시오. 네트워크 응답 지연 상태에서도 반복하고,
CO/CR 및 필수값 미입력/입력 후 CA 생성·반복 생성·Text/분류 속성 저장을 확인해야 합니다.
