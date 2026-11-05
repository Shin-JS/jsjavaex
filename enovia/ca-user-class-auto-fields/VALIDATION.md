# 검증 결과 — ENONewWidget 원본 유지

브랜치: `feature/ca-enonewwidget-untouched-2026`. 기준: R2026x.

## 구현 경계

- ENONewWidget 수정 메모/교체본 없음. 원본 helper와 기본 폼·생성 모델/서비스를 재사용.
- Governance 생성 진입과 ClassificationsFacet F/M, ClassificationProp P만 OOTB 적용 조각 제공.
- 기본 속성 facet만 커스텀 상속 경로로 연결. 분류 facet/컨트롤러 경로는 원래 ID 유지.
- 분류 직접 초기화/강제 번들 선로딩/전용 분류 Controller/로더 자동 진단 제거.
- 원본 모듈 복제·원본 AMD ID 재정의·전역 require.config/undef·공통 prototype 변경 없음.
- master 미변경. 이전 전체 무수정 실험의 소스와 구분.

## 실행 결과

- 독립 회귀 검사 **16개 통과**.
- 실제 R2026x 원본을 입력하는 추가 실행 검사 **8개 통과**.
- 실제 RequireJS로 배포 파일 세 개를 읽고 내부 상속 클래스를 별도 URL 없이 해석함을 확인.
- 실제 R2026x AmdLoader 전체(define/require 래퍼와 pluginDS 포함)에서도 세 파일 로딩 및 내부 클래스 조회 성공.
  CreateService가 분류 UI·분류 번들을 직접 요청하지 않음을 확인. 외부 UI/서비스는 대역.
- R2026x Governance 실제 모듈에 G0/G1/G2 적용, 헤더·원래 로더/분석/성공·실패/취소 동작 유지.
- 수정하지 않은 ENONewWidget의 Engine.init → Controller.displayDialog → Dialog.setup/buildContent/helper 실행.
- R2026x 원본에 가이드 F/M/P 조각만 적용해 다음을 실행:
  - F: 원본 init의 옵션/원본 InitUI 호출 유지, 세션 연결, 새 문맥의 UI 재생성, 종료 정리.
  - F: postCreation 함수 본문 불변, 분류 연결과 속성 저장 호출에 생성창 문맥 전달.
    provider가 함수만 전달되어도 다른 창/전역 문맥으로 바뀌지 않는 것 확인.
  - M: 실제 원본의 클래스 선택 처리 함수에서 소비자 initDatas 전에 모델 표식 생성.
  - P: 속성 응답 변환 후 prepare → 원본 렌더 → notify 순서, 폐기 세션/늦은 응답 차단.
- 2026의 classAttributeOrder/range/편집 메타데이터, 원본 validation·펼치기·버튼 상태 검사 유지.
- typeInfo/자격증명 지연 응답과 A→B→A/종료 후 응답 차단, 최종 생성 HTTP SecurityContext 검사 유지.
- 모델 검색/선택/속성 조회·필드 제어·Text 복사·class code/mandatory/문맥 세션 회귀 검사 유지.

## 검사 실행

```sh
NODE_PATH=/개발자/의존성/node_modules node tests/run-tests.cjs
node tests/test-amdloader-2026.cjs /원본/AmdLoader.js
node tests/test-governance-2026.cjs /원본/ENOChgGovernanceUX.js
node tests/test-runtime-hooks.cjs /원본JS디렉터리
node tests/test-ootb-classification-edit.cjs /원본JS디렉터리
NODE_PATH=/개발자/의존성/node_modules node tests/test-ootb-control-layout.cjs /원본JS디렉터리
node tests/test-ootb-validation.cjs /원본/ClassificationProp.js
node tests/test-security-context.cjs /원본/ENONewWidget.js
node tests/test-ootb-button-state.cjs /원본/ENONewWidget.js
```

독립 검사에서 제외한 참조 검사 중 model-search-reference는 이번에 실행하지 않았습니다.

## 검증의 한계

위 검사는 VM/AMD/DOM/서비스 대역 검사입니다. 실제 ENOVIA 브라우저/WUX, Registry 연결,
DB 생성·분류 저장 성공과 실제 서버 CO/CR 회귀를 입증하지 않습니다.
현장에서 발생한 Registry/여러 모듈 로딩 실패의 근본 원인도 확정하지 못했습니다.
이번 변경은 master의 분류 초기화 경로를 유지하고 ENONewWidget 연결만 분리한 것입니다.
배포 후 [서버 확인 항목](MIGRATION.md#서버-확인)을 실제 환경에서 확인해야 합니다.

이전 전체 무수정 실험 기록은 `feature/ca-ootb-entry-only-2026` 브랜치의 VALIDATION.md에 남아 있습니다.
그 실험에서 통과한 대역 검사를 실제 서버 해결로 간주하지 않습니다.
