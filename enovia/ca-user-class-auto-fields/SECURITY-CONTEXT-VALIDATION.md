# SecurityContext 재초기화 및 검증 — 2026-10-27

## 최종 동작

설정의 전역 자격증명 변경은 열린 생성창의 선택 문맥을 바꾸지 않습니다.
생성창의 `New-SecurityContext` 선택을 바꾸면 기존 세션을 종료하고 새 세션과 새 분류 UI를 만듭니다.
이전 버전의 “문맥 변경 시 창을 닫고 다시 열기” 동작을 대체합니다.

1. 기존 세션을 disposed 상태로 만들고 제출 콜백, 검색, 속성 표시 조회, 검증 구독 및 타이머를 정리합니다.
2. 기존 분류 폼을 원위치로 돌려놓고 이전 분류 UI를 분리합니다. 기존 모델에는 종료 세션 표식을
   남겨 늦은 속성 응답이 일반 모델로 처리되는 것을 막습니다.
3. `InitClassificationCmpUI`를 새로 만들어 새 SecurityContext를 내부에 보관하는 속성 조회 컨텍스트까지 교체합니다.
   기존 컨트롤러의 문자열 값만 바꾸는 방식이 아닙니다.
4. 타입/정책/tenant/클래스 규칙을 새 세션에 전달하고 코드 또는 부서 규칙 조회, 클래스 경로 조회,
   필수 플래그 조회, OOTB 속성 모델 생성 및 필수 검증을 다시 수행합니다.
5. 준비가 끝나고 OOTB 검증을 통과하기 전까지 생성 버튼과 제출 입구를 차단합니다.
6. 저장 직전 현재 모델과 최종 직렬화된 문맥을 다시 비교합니다. 모델 이벤트 누락 또는 BL 처리 중
   선택 변경도 재초기화하고 그 제출은 거부합니다. 문맥 누락/빈 값/최종 요청 불일치는 계속 차단합니다.

기본 속성 모델을 새로 만들지 않으므로 기본 입력값은 유지합니다. 분류 영역은 새 UI이므로
이전 분류 선택과 속성 입력값은 초기화합니다. 해당 facet에서 북마크/보호 영역까지 활성화한 경우
그 영역의 선택도 재설정됩니다. 새 문맥에서 접근/정의가 달라질 수 있는 값을 자동 재사용하지 않습니다.

실제 HTTP 요청의 전송 중단을 보장하지 않습니다. 종료 세션 검사, 세션별 컨트롤러/UI 격리와
종료 모델 표식으로 늦은 응답이 현재 화면에 적용되지 않게 합니다.

## 반드시 함께 배포할 파일/블록

- `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js`: 전체 커스텀 모듈 교체.
- `webapps/ENONewWidget/ENONewWidget.js`: 적용 메모의 **B3와 B4** 교체.
  B4는 `checkContext` 대신 `changeContext`를 호출합니다. B3는 이전 문맥의 늦은
  typeInfo 응답이면 OOTB updateFacet 적용을 중단합니다.
- `webapps/ClassificationsFacet/ClassificationsFacet.js`: 적용 메모의 **F2** 교체.
  기존 factory의 `r` 생성자를 사용하는 `sdxECCARebuildUI`가 추가됐습니다.

OOTB 파일 두 개는 전체 덮어쓰기용이 아닌 수정 메모입니다. 기존 수정이 적용된 설치본에서는
표시한 블록을 최신 교체 코드로 갱신해야 합니다. 커스텀 모듈만 배포하면 안전하게 오류 처리됩니다.

## 실행 검증

외부 원본 없이 실행하는 9개 테스트 파일 모두 통과했습니다.

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

추가/유지한 검사:

- 전역 자격증명 변경은 기존 창 문맥을 유지하고 비대상 CO/CR은 기존 이벤트 처리를 유지.
- 배포 메모와 runtime-hooks fixture 일치 및 실제 배포 조각 실행.
- 새 문맥마다 새 InitClassificationCmpUI 인스턴스/컨텍스트 생성.
- 실제 커스텀 모듈의 A→B, A→B→C→A 세션 교체 및 분류 재조회.
- 재조회 중 저장 차단, 새 속성 로딩/검증 완료 후 새 문맥 저장 허용.
- 기본 입력값 유지, 새 정책 제출 연결, 새 세션 참조 전달.
- 이전 코드 조회/클래스 경로/필수 플래그/속성 응답 및 저장 콜백 무시.
- 같은 클래스 ID 또는 A로 다시 돌아가도 이전 세션 응답을 재사용하지 않음.
- 새 문맥 조회 실패 시 차단, 오류 후 다른 문맥으로 새 세션 시작, 종료 후 응답 무시.
- 변경 이벤트 누락, BL 중 변경은 재초기화하고 해당 제출 거부.
- 최종 직렬화 문맥 누락/빈 값/불일치는 차단.
- 필수 속성, Text 복사, 정책, 검색, 속성 표시, 위젯/타입 격리 회귀 검사.

JavaScript 문법 및 `git diff --check`도 확인했습니다.
공개 R2024x 원본을 인자로 실행한 생성 헤더 전달 및 실제 AttributesUtils 필수 검증도 통과했습니다.
공급사 소스는 저장소에 포함하지 않습니다.

## 실서버에서 남은 확인

테스트는 VM/AMD/DOM/서버 대역입니다. 실제 설치본 2025 원본 4개 번들을 확보하지 못했으므로
전체 runtime-hooks 패치 적용 실행, 실제 브라우저 렌더링과 DB 저장을 검증한 결과는 아닙니다.
공개 R2024x 원본의 버튼 검사는 기존 2025 fixture의 Save/Apply 차이로 통과하지 않았으며
설치본 원본으로 별도 확인해야 합니다.

설치 후 확인 순서:

1. A에서 생성창을 열고 기본 속성값을 입력한 뒤 창 안 협업공간을 B로 변경합니다.
2. 재조회 중 생성이 차단되고 새 분류와 속성이 로드되는지 확인합니다.
3. Network에서 코드/경로/필수 플래그/속성 조회의 문맥이 B인지 확인합니다.
4. B의 필수값을 입력하고 생성 요청 헤더 및 생성 객체의 실제 협업공간이 B인지 확인합니다.
5. 네트워크 지연을 주고 A→B→C→A 및 조회 중 창 종료를 반복합니다.
6. 전역 자격증명만 변경하는 경우와 CO/CR, CA 반복 생성, Text/분류 속성 저장도 확인합니다.

이전 OOTB 컨트롤러는 격리된 컨테이너에서 이미 진행 중인 초기화를 마칠 수 있습니다.
실제 설치본의 반복 전환 시 자원 해제/전역 이벤트 구독과 다른 facet 동작은 현장 확인이 필요합니다.
서버 정책/트리거/권한 처리와 기존 ClassificationAttributeUtil.java:95 저장 오류는 이번 변경으로 해결하지 않습니다.
