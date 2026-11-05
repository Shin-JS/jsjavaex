# 권한 문맥 재초기화와 저장 검증

2026-11-05: R2026x 위젯을 우선 기준으로 합니다.
배포 파일과 OOTB 원복 범위는 [README](README.md)와 [전환 안내](MIGRATION.md)를 따릅니다.

## R2026x의 기준

R2026x `ENONewController.onSubmit`은 생성 모델의 `getSecurityContext()`를 읽어
`ENONewServices.createContent`의 HTTP 권한 문맥으로 전달합니다.
따라서 기본 폼의 `view.data.model`을 현재 선택 문맥의 기준으로 사용합니다.
project/organisation/role 선택은 OOTB CredentialsManager가 같은 모델에 반영합니다.

ENONewWidget의 기존 installFields 연결은 모델의 `onChange:securityContext` 이벤트를 구독합니다.
전역 위젯 자격증명만 변경하는 것으로 열린 생성창의 선택을 임의 변경하지 않습니다.
문맥 변경 후 기본 폼을 갱신할 때도 생성 모델을 함께 전달합니다.

## 세션 전환

1. 변경 이벤트에서는 전환 대기·무효 상태만 기록합니다.
2. 원래 이벤트 스택이 끝나면 최종 모델 문맥을 읽고 기존 세션을 종료합니다.
3. 이전 분류 폼과 검증/검색/제어/모델 이벤트 구독을 정리합니다.
4. 새 `InitClassificationCmpUI`와 새 세션을 만들어 문맥 클로저를 분리합니다.
5. 사용자/클래스 규칙, 분류 속성, 제어 bus를 새 문맥으로 다시 조회합니다.
6. 실제 속성 로딩과 OOTB 검증이 끝나기 전에는 제출을 막습니다.

기본 입력값은 유지하고 분류 선택/분류 입력값은 새로 초기화합니다.
분류 facet에서 북마크·보호 영역을 함께 사용하면 그 선택도 재설정될 수 있습니다.
실제 HTTP 전송 취소와 UI 반영 차단은 구분합니다. 이미 보낸 요청은 완료될 수 있습니다.

## 이전 응답 차단

새 분류 UI마다 별도 skeleton과 전용 ClassifPropController를 사용합니다.
컨트롤러는 생성 세션에 귀속되며, 이전/종료/오류 세션의 응답을 원래 폼 생성 함수에 전달하지 않습니다.
같은 클래스 ID를 사용하거나 A로 돌아와도 이전 세션의 모델을 재사용하지 않습니다.

R2026x의 typeInfo/자격증명 재조회도 요청 세대와 현재 모델 문맥을 확인합니다.
따라서 이전 A 응답이 새 A 요청이나 B/C 선택을 덮어쓰지 않습니다.
재조회 중 창을 닫으면 뒤늦은 응답의 폼 갱신을 중단합니다.

## 저장 직전

OOTB BL/모델 직렬화 콜백 뒤에서 현재 선택과 세션 문맥을 비교합니다.
이벤트가 누락되거나 BL 실행 중 선택이 바뀌어도 재초기화하고 해당 제출은 거부합니다.
R2026x에서는 실제 생성 모델 문맥을 검사하고 legacy SecurityContext 필드를 추가하지 않습니다.
직렬화 결과에 명시적인 SecurityContext 값이 있으면 그 값도 일치해야 합니다.
정책·Text 복사·조직값·모델 검색 선택값 처리도 같은 제출 연결에서 수행합니다.

R2025x의 모델 없는 경로는 New-SecurityContext 필드와 currentContext를 사용합니다.
이 경로에서만 직렬화된 SecurityContext 객체/value가 누락되면 검증된 선택값으로 보충합니다.
명시적 빈 값, 다른 기존 문맥, 기본 속성 객체 누락은 성공으로 바꾸지 않습니다.

## 검증 범위

독립 회귀 검사에서 새 세션 생성, 최종값으로 합치기, 지연 응답/저장 거부, 기본값 유지,
이벤트 해제, A→B→C→A 및 창 종료를 확인합니다.
R2026x 원본의 Controller.onSubmit → Services.createContent를 실행하여 최종 모델 문맥이
HTTP 헤더에 전달되는 경로도 검사합니다.

실제 플랫폼에서의 UI·CredentialsManager 전체 연동과 DB 저장은 배포 후 확인해야 합니다.
특히 반복 전환 시 OOTB 전역 이벤트 구독/리소스 정리와 다른 facet의 동작은 현장 확인 대상입니다.
서버 정책·트리거·권한 오류와 별도의 ClassificationAttributeUtil 저장 오류는 이 변경의 범위가 아닙니다.
