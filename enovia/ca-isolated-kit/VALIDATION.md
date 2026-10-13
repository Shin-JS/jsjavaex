# 로컬 검증 결과

검증일: 2026-10-14.

- 공개 R2024x ENONewWidget 번들로 prepare_dialog.py 실행 성공.
- 입력 SHA-256이 준비 전후 동일함을 도구에서 확인.
- 생성된 DialogController의 AMD ID 및 helper 의존성이 전용 경로로 연결됨.
- check_amd.cjs: 전용 AMD 모듈 10개, 중복 ID 없음, 전용 의존성 및 CSS 파일 확인 성공.
- test_isolation.cjs: 대화상자별 session 분리, 기본 helper 미변경, 같은 controller를 통한 선택, 중복 방지, 취소된 session의 늦은 응답 무시 확인 성공.
- prepare_dialog.py Python 문법 검사 성공.

통합 검증을 대체하지 않습니다. 실제 설치 버전의 UWA 상속 실행, facet 초기화, WUX 노드 이벤트, 정책/타입 지원, 서버 MQL 실행, 분류 속성 조회와 영구 저장, 권한/라이선스, 별도 위젯 동시 사용은 사용자 환경에서 검증해야 합니다.

검증용 OOTB 참조 번들과 생성된 OOTB 복제 파일은 배포 키트에 포함하지 않았습니다. 현재 설치 파일을 입력으로 준비 도구를 실행해 생성하세요.
