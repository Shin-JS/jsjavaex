# 전용 복사본에 적용할 변경 부분

각 JS 파일은 전체 교체용 소스가 아니라 주석으로 작성한 수정 메모입니다. `[대상 AMD 모듈]`을 찾아 `[수정 전]`을 `[수정 후]`로 바꿉니다.

- [ENONewWidget.js](ENONewWidget.js): facet 연결, 타입/폼 준비, 2025 생성 검증과 버튼 복원.
- [ClassificationsFacet.js](ClassificationsFacet.js): 문맥 분리, 세션 연결, 모델 표시와 전용 앱 설정.
- [ClassificationProp.js](ClassificationProp.js): 분류 속성 폼 생성 전·후 처리.
- [ENOChgGovernanceUX.js](ENOChgGovernanceUX.js): 복사한 전용 CA 모듈의 타입 지정과 사용자 기본 타입 저장 조건.

위 변경은 **새 sdxECCA2025.js 안의 복사본에만** 적용합니다. 공통 원본 파일에 그대로 적용하지 않습니다. 공통 CA 진입부의 변경은 별도 [entry-guard.js](../entry-guard.js)를 사용합니다.

적용 순서는 [수동 적용 안내](../README.md)를 따릅니다. `patches.json`은 같은 변경 조각을 자동 비교하는 개발자 검사 데이터이며 서버에 배포하거나 실행할 파일이 아닙니다.
