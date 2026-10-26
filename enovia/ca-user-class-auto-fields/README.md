# sdxECChangeAction 생성창 — 기존 작업 폴더에서 수정

기준은 2025이며 2024는 참고용입니다. **OOTB는 필요한 연결 부분만 수정하고, 기능은 기존 커스텀 모듈에서 처리합니다.** 별도 소스 복사·조립이나 전체 원복은 하지 않습니다. Node 실행도 필요 없습니다.

## 이번에 바뀌는 것

기존 공통 OOTB에 추가했던 필수 AMD 의존성을 제거합니다. 우리 위젯에서 CA를 생성할 때만 `sdxECCA.js`를 비동기로 읽고, 이 파일이 기존 `sdxECCAAutoClass.js`를 준비한 뒤 원래 생성 코드를 호출합니다.

일반 위젯에서는 이 커스텀 파일을 요청하지 않습니다. 공통 연결 부분은 호출 시점에 `widget.sdxECCARuntime`이 있는 경우에만 커스텀 처리를 실행합니다. 세션이 없는 다른 생성창·분류 모델에 대한 처리는 기존 커스텀 모듈의 조건을 그대로 사용합니다.

## 수정할 파일

| 파일 | 작업 |
|---|---|
| [webapps/sdxECCA/sdxECCA.js](webapps/sdxECCA/sdxECCA.js) | 새 커스텀 진입 파일. 전체 내용을 그대로 배포 |
| [webapps/sdxECCAAutoClass/sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js) | 기존 파일 갱신. 자동 분류·필수 검증·Text 복사·policy·검색 기능 유지 |
| [webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) | 주석의 CA 진입 함수와 호출 부분만 수정 |
| [webapps/ENONewWidget/ENONewWidget.js](webapps/ENONewWidget/ENONewWidget.js) | 기존 연결을 API가 준비됐을 때만 실행하도록 교체 |
| [webapps/ClassificationsFacet/ClassificationsFacet.js](webapps/ClassificationsFacet/ClassificationsFacet.js) | 기존 세션·모델 연결을 조건부 호출로 교체 |
| [webapps/ClassificationProp/ClassificationProp.js](webapps/ClassificationProp/ClassificationProp.js) | 기존 속성 로딩 전·후 연결을 조건부 호출로 교체 |
| [webapps/ENOChgGovernanceUX/ENOChgGovernance.html](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) | 기존 우리 위젯 전용 설정 위치 확인. 새 진입 옵션은 추가하지 않음 |

`sdxECCAAutoClass` 폴더의 나머지 서비스/검색 파일은 기존 배포본을 유지합니다. 신규 환경에서는 해당 폴더의 기존 다섯 파일도 함께 배포해야 합니다. OOTB 수정 메모 파일은 **파일 전체를 덮어쓰는 소스가 아닙니다.**

## 적용 순서

1. `webapps/sdxECCA/sdxECCA.js`를 새 서버 경로 `3dspace/webapps/sdxECCA/sdxECCA.js`에 배포합니다. 이 파일은 지금 제공된 전체 코드만 있으면 됩니다. OOTB 내용을 이어 붙이지 않습니다.
2. 기존 `sdxECCAAutoClass.js`를 갱신합니다. 나머지 기존 커스텀 파일은 유지합니다.
3. 위 표의 OOTB 메모 네 개를 보고 기존 수정 부분만 갱신합니다. 각 메모에 `[대상 AMD 모듈]`, `[수정 전]`, `[수정 후]`를 표시했습니다. 이미 있는 커스텀 호출은 **교체**하며 중복으로 넣지 않습니다.
4. 각 대상 factory에서 과거 추가한 `"DS/sdxECCAAutoClass/sdxECCAAutoClass"` 의존성과 대응 인자 `sdxECCAAutoClass`만 제거합니다. 원래 OOTB 의존성/인자는 순서까지 유지합니다. 메모의 `[2025 OOTB 헤더 유지]`를 참고합니다. 새 커스텀 의존성을 공통 define에 추가하지 않습니다.
5. 기존 우리 위젯의 `sdxECCAEnableAutoClassByOrganization=true`와 타입·클래스·policy 설정을 유지합니다. 공용 HTML에는 설정하지 않습니다. 캐시 갱신 후 대상 CA와 일반 위젯의 생성창을 확인합니다.

factory 안에 추가하는 짧은 `sdxECCAGetApi()`는 준비된 API를 읽는 함수입니다. factory가 로딩될 때 API를 변수에 고정해 두지 않고, 실제 함수가 실행될 때 읽습니다. `"use strict"`가 있으면 그 문장 다음에 넣습니다.

분류 속성 응답의 변수명은 설치 소스에 따라 다를 수 있습니다. 메모의 `i`는 클래스 모델, `a`는 속성 응답을 뜻합니다. 설치 소스가 `i`, `r`을 사용하면 그 이름을 유지하고 연결 인자만 맞춥니다. 기존 `_onCompleteLoadModel` 또는 `onCompleteLoadModel` 함수명도 실제 설치 소스를 유지합니다.

## 이전 분리 안내를 이미 적용했다면

이전 `isolation` 구성, `private/...` 이름 치환, OOTB 파일을 새 파일에 이어 붙이는 절차는 사용하지 않습니다. 그 안내를 아직 적용하지 않았다면 정리 작업도 필요 없습니다.

이미 적용했다면 그때 추가한 `sdxECCATryLaunch` 함수와 진입부 한 줄을 이번 CA 메모의 `sdxECCALaunch` 연결로 교체합니다. `sdxECCAUsePrivateCreate` 설정은 제거합니다. 이전에 조립한 `sdxECCA.js`는 이번 짧은 커스텀 파일로 교체합니다. 원래 공통 AMD 이름을 변경해 놓았다면 원래 이름으로 돌립니다. 전체 기존 커스텀 기능이나 다른 사람의 수정을 원복하는 뜻은 아닙니다.

타입·속성·policy, 발번 JPO·트리거는 이번 변경 대상이 아닙니다.

## 검증

2025 원본 네 묶음에 변경 조각을 적용하여 구문과 원래 AMD 의존성/인자를 확인했습니다. 커스텀 파일이 없는 일반 생성, 생성 모듈이 먼저 로딩된 뒤 늦게 준비되는 API, 대상 세션과 타입 구분, 2025 버튼 복원, 대상 커스텀 로딩 실패 후 일반 생성 동작을 검사했습니다. 기존 자동 분류·필수입력·검색 검사도 수행했습니다.

이는 공통 모듈의 필수 커스텀 의존성을 제거하는 변경입니다. OOTB 내부의 공유 이벤트 관리자를 별도 복제하는 방식은 아닙니다. 같은 위젯에서 여러 팝업을 동시에 여는 경우와 실제 서버의 저장·분류·검색은 통합 확인이 필요합니다.

`tests`는 개발자 검증용이며 사용자가 실행하거나 서버에 배포할 필요는 없습니다.
