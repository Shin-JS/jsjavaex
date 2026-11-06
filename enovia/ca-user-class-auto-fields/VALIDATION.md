# 검증 결과 — 1단계 ClassificationProp 원본 유지

브랜치: `feature/ca-classificationprop-untouched-2026`. 소스 기준: R2026x.
정상 확인된 기준 버전 de46aa5와 비교해 AutoClassService의 P 인스턴스 연결만 추가합니다.
ClassificationsFacet F/M, Governance, CreateService, DataService는 변경하지 않습니다.

## 구현 경계

- ENONewWidget/ClassificationProp 수정 메모·교체본 없음. 두 파일 모두 원본 사용.
- OOTB 적용 조각은 Governance와 ClassificationsFacet F/M만 유지.
- P는 기존 폼 인스턴스의 loadModels/_onCompleteLoadModel 앞뒤에 연결.
- 지연 생성 시 해당 skeleton 인스턴스의 publishEvt에서 classifAttributeLoaded를 확인해,
  원본 이벤트 소비자와 모델 로딩 콜백보다 먼저 해당 폼에 연결.
- 원본 모듈/constructor/폼/데이터 변환·validation·저장과 메서드 this/인자/반환값/예외 유지.
- 공통 prototype 변경, 전역 이벤트 구독, require.config/undef, 원본 모듈 복제 없음.
- 종료한 인스턴스의 가드를 되돌리지 않아 이미 보낸 요청의 늦은 렌더링을 차단.

## 실행 결과

- 독립 회귀 검사 **17개 통과**.
- 실제 R2026x 원본 입력 실행 검사 **9개 통과**.
- 원본 ClassificationProp의 loadModels/응답 변환/_onCompleteLoadModel/폼 렌더링 실행:
  준비 메타데이터를 렌더 전에 적용하고 원래 렌더 이후 해당 세션의 로딩 완료를 통지.
- 원본 IDCardSkeleton._loadFacet 실행:
  원래 constructor로 폼 생성 → 인스턴스 연결 → 원래 이벤트 → 모델 로딩 콜백 순서 확인.
- 기존/지연 생성 폼, 같은 세션 중복 연결, 빈 폼 초기화, 원래 this/인자/반환값/예외 검사.
- 두 인스턴스의 세션 격리, 폐기/문맥 전환/오류 후 늦은 응답 차단, 표식 누락 시 제출 준비 차단 검사.
- 실제 원본의 이전 onAttributesLoad가 늦게 실행되어도 새 세션의 폼/준비 상태가 바뀌지 않고,
  새 세션의 실제 응답·렌더링 후에만 attributesLoaded가 설정되는 것 확인.
- 일반 인스턴스·공통 prototype·원래 모듈 ID 불변 확인.
- 기존 2026 AmdLoader/pluginDS, Governance 진입, 기본 폼 펼치기/검증/버튼 상태,
  모델 문맥·HTTP 헤더·이전 typeInfo 응답 차단, 검색·속성 제어 회귀 검사 유지.

## 실행 명령

```sh
NODE_PATH=/개발자/의존성/node_modules node tests/run-tests.cjs
node tests/test-property-native-lifecycle.cjs /원본/ClassificationProp.js
node tests/test-amdloader-2026.cjs /원본/AmdLoader.js
node tests/test-governance-2026.cjs /원본/ENOChgGovernanceUX.js
node tests/test-runtime-hooks.cjs /원본JS디렉터리
node tests/test-ootb-classification-edit.cjs /원본JS디렉터리
NODE_PATH=/개발자/의존성/node_modules node tests/test-ootb-control-layout.cjs /원본JS디렉터리
node tests/test-ootb-validation.cjs /원본/ClassificationProp.js
node tests/test-security-context.cjs /원본/ENONewWidget.js
node tests/test-ootb-button-state.cjs /원본/ENONewWidget.js
```

model-search-reference는 이번에 실행하지 않았습니다.

## 실제 서버 검증 범위

현재 검사는 VM/AMD/DOM/서비스 대역 검사이며 UI/DB 저장의 실제 성공을 보장하지 않습니다.
기준 버전의 생성·저장·재조회는 사용자 확인이 있었지만, 이번 단계는 아직 서버 적용 전입니다.
원본 onAttributesLoad 내부의 기존 이벤트 발행은 유지되며, 그 전체 플랫폼 부작용까지 입증한 것은 아닙니다.
[적용·복구 안내](MIGRATION.md)를 따라 이 단계만 검증한 뒤 다음 파일의 무수정 전환을 검토합니다.
