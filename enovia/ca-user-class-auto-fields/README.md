# sdxECChangeAction 생성창 — 원복된 2025 OOTB에서 적용

**이전 수정이 없는 2025 OOTB 원본에서 시작합니다.** 2024는 참고용입니다. OOTB에는 필요한 연결 코드만 추가하고 기능은 커스텀 모듈에서 처리합니다. Node 실행, 소스 복제·조립, 별도 폴더 구성은 필요 없습니다.

이미 기존 작업을 적용해 사용 중이라면 OOTB를 다시 원복하지 마세요. 새 Searchable 표시 기능은 [Java 웹서비스 및 변경 위치 안내](ATTRIBUTE-VISIBILITY.md)의 V1~V3와 위젯 설정만 추가합니다. JSP는 만들지 않습니다. 속성·분류·북마크 탭은 표시를 유지합니다.

## 준비 상태

아래 네 OOTB 파일이 현재 서버와 동일한 2025 릴리스/핫픽스의 변경 전 원본이어야 합니다.

```text
3dspace/webapps/ENONewWidget/ENONewWidget.js
3dspace/webapps/ClassificationsFacet/ClassificationsFacet.js
3dspace/webapps/ClassificationProp/ClassificationProp.js
3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js
```

기존에 추가했던 브리지·함수·AMD 의존성·호출이 남아 있지 않은 상태를 기준으로 합니다. 이미 원복하셨다면 아래 순서대로 처음부터 적용하면 됩니다. 서버의 타입·속성·policy, 발번 JPO·트리거는 원복하지 않습니다.

## 1. 커스텀 JS 여섯 개를 전체 배포

아래 파일은 새로 작성한 커스텀 코드이므로 GitHub의 **파일 전체 내용**을 사용합니다. `webapps` 이하의 폴더 구조 그대로 서버의 `3dspace/webapps` 아래에 배치합니다.

| 파일 | 역할 |
|---|---|
| [sdxECCA/sdxECCA.js](webapps/sdxECCA/sdxECCA.js) | 대상 위젯의 CA 생성 진입 |
| [sdxECCAAutoClass/sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js) | 자동 분류, 필수 검증, Text 복사, policy, 검색 연결 |
| [sdxECCAAutoClass/sdxECCAClassRuleService.js](webapps/sdxECCAAutoClass/sdxECCAClassRuleService.js) | 클래스 결정 규칙 |
| [sdxECCAAutoClass/sdxECCAOrganizationProvider.js](webapps/sdxECCAAutoClass/sdxECCAOrganizationProvider.js) | 부서 조회 연결용. 현재 code 모드에서는 부서 조회하지 않음 |
| [sdxECCAAutoClass/sdxECCAClassAttributeService.js](webapps/sdxECCAAutoClass/sdxECCAClassAttributeService.js) | 클래스 코드·필수 설정 조회 |
| [sdxECCAAutoClass/sdxECCAObjectSearch.js](webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js) | sdxECModel 검색 |

이미 같은 최신 커스텀 파일이 배포되어 있다면 유지할 수 있습니다. `sdxECCA.js`에 OOTB 내용을 이어 붙이지 않습니다.

## 2. 원본 OOTB 네 파일에 변경 조각 적용

아래 파일은 **수정 메모**입니다. 파일 전체를 서버 OOTB에 덮어쓰면 안 됩니다.

| 수정할 OOTB | 적용 메모 |
|---|---|
| `ENOChgGovernanceUX.js` | [CA 생성 진입부](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) |
| `ENONewWidget.js` | [기본 폼·생성 검증 연결](webapps/ENONewWidget/ENONewWidget.js) |
| `ClassificationsFacet.js` | [분류 facet·모델 연결](webapps/ClassificationsFacet/ClassificationsFacet.js) |
| `ClassificationProp.js` | [분류 속성 로딩 전·후 연결](webapps/ClassificationProp/ClassificationProp.js) |

각 파일의 위치 표시는 다음과 같습니다. 파일 안에서 해당 문자를 검색하면 변경 위치 안내로 이동할 수 있습니다.

| 파일 | 위치 표시 |
|---|---|
| `ENOChgGovernanceUX.js` | `G0` 함수 추가, `G1` 생성 호출, `G2` 기본 타입 저장 |
| `ENONewWidget.js` | `A` facet 구성, `B` 기본 폼, `C` Dialog. 속성 변경 콜백은 `B4` |
| `ClassificationsFacet.js` | `F0~F4` 분류 facet, `M0~M1` 클래스 모델 생성 |
| `ClassificationProp.js` | `P0` 함수 추가, `P1` 분류 속성 로딩 콜백 |

원본 검색용 조각은 그대로 표시하고, 교체 코드는 여러 줄로 정리했습니다. 검색 키와 교체 시작·끝 범위, 남겨야 하는 주변 코드도 메모에 적었습니다.

각 메모는 다음 순서로 적용합니다.

1. `[대상 AMD 모듈]` 이름을 원본 파일에서 검색합니다.
2. `[추가 위치]`에 표시된 함수를 해당 factory 안에 한 번 추가합니다. `"use strict"`가 있으면 그 문장 다음에 넣습니다. 다른 factory나 파일 맨 끝에 넣지 않습니다.
3. 같은 모듈 안에서 모든 `[변경 N — 원본에서 찾을 부분]`을 찾아 `[아래 코드로 교체]`의 코드로 바꿉니다. **같은 모듈의 변경은 모두 함께** 적용합니다.
4. 다음 대상 AMD 모듈로 이동하여 반복합니다.

`define` 의존성 배열과 factory 인자는 원본 그대로 둡니다. 메모의 `[2025 OOTB 헤더 유지]`는 확인용이며 교체 작업이 아닙니다. `DS/sdxECCA/...`나 `DS/sdxECCAAutoClass/...`를 공통 define 의존성에 추가하지 않습니다.

변수명이 다른 설치 소스에서는 의미에 맞게 연결합니다. 분류 속성 메모의 `i`는 클래스 모델, `a`는 속성 응답입니다. 설치 소스가 `i`, `r`이면 그 이름을 사용합니다. 원래 `_onCompleteLoadModel` 또는 `onCompleteLoadModel` 함수명과 기존 옵션은 유지합니다.

## 3. 우리 위젯 전용 HTML에 설정 추가

[ENOChgGovernance.html 설정 메모](webapps/ENOChgGovernanceUX/ENOChgGovernance.html)의 설정을 **우리 커스텀 위젯 전용 HTML의 실행되는 스크립트 위치**에 넣습니다. 공용 OOTB HTML이나 다른 위젯에는 넣지 않습니다.

기본 설정은 `sdxECChangeAction`, `sdxECR`, `EC Library`, `EC_MX`입니다. 실제 환경 값이 다르면 해당 값만 맞춥니다. 이미 같은 설정이 있다면 중복으로 넣지 않습니다. 별도 활성화 옵션이나 새 onLoad는 만들지 않습니다.

## 4. 배포 후 확인

캐시를 갱신하고 새로 연 화면에서 대상 CA 생성창의 타입·분류 속성·필수 검증·저장·policy·Text 복사·검색을 확인합니다. 일반 위젯의 생성창과 CO/CR 생성도 확인합니다.

일반 위젯에서는 커스텀 파일을 요청하지 않고 원래 생성 코드를 실행합니다. 우리 위젯에서는 커스텀 API를 먼저 준비하고 원래 생성 코드를 실행합니다. 세션이 없는 다른 폼·모델은 기존 조건에 따라 변경하지 않습니다.

## 검증 범위

이전 커스텀 수정이 없는 실제 2025 원본 네 묶음에 메모의 변경 조각을 적용하여 구문, 원래 AMD 의존성/인자, 일반 생성, API 지연 준비, 세션 구분, 2025 버튼 복원, 커스텀 로딩 실패 처리를 검사했습니다. 메모에 적힌 추가 함수와 교체 조각이 검사 데이터와 일치하는지도 확인합니다.

실제 서버 UI·저장은 아직 미검증입니다. 같은 위젯에서 여러 팝업을 동시에 여는 경우도 통합 확인이 필요합니다. `tests`는 개발자 검증용이며 사용자가 실행하거나 서버에 배포하지 않습니다.

## 생성창 협업공간 변경 — 2026-10-27

협업공간 변경 시 새 세션/분류 UI로 재조회합니다. 재조회 및 필수 검증 완료 후 저장하며,
기본 입력은 유지하고 분류 영역의 입력/선택은 초기화합니다.
**AutoClass 전체 파일과 ENONewWidget B3·B4, ClassificationsFacet F2를 함께 갱신**하십시오.
[검증 결과 및 현장 확인 절차](SECURITY-CONTEXT-VALIDATION.md)를 참고하십시오.
