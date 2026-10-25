# GitHub에서 복사·붙여넣기로 적용하기 — 2025 기준

Node, npm, 빌드, 자동 소스 다운로드는 필요하지 않습니다. **미리 만든 전체 JS를 새 파일에 붙여넣고, 생성 진입 모듈 하나와 우리 위젯 설정을 변경합니다.** 2024는 비교 참고용입니다.

공급사 원본을 포함하는 전체 파일은 원본 보관소와 동일한 개인 비공개 레포지토리에 있습니다. `jsjavaex`에는 커스텀 삽입 코드와 이 안내를 두었습니다.

## 복사할 파일과 붙여넣을 위치

| 순서 | GitHub에서 복사할 코드 | 내 소스에 붙여넣을 위치 | 작업 |
|---|---|---|---|
| 1 | [sdxECCA2025.js 전체](https://github.com/Shin-JS/private-rag/blob/main/projects/enovia-ca-isolation-2025/webapps/sdxECCA2025/sdxECCA2025.js) | `3dspace/webapps/sdxECCA2025/sdxECCA2025.js` | 새 폴더·파일을 만들고 전체 내용 붙여넣기 |
| 2 | [ChgCreateChangeAction 모듈 전체](https://github.com/Shin-JS/private-rag/blob/main/projects/enovia-ca-isolation-2025/patches/ChgCreateChangeAction.js) | `3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js` 안의 해당 AMD 모듈 | 해당 모듈 하나만 교체 |
| 3 | [widget-settings.js](widget-settings.js) | 기존 `sdxECCA` 설정을 넣었던 우리 위젯 전용 HTML의 실행되는 스크립트 위치 | 기존 설정을 갱신하고 전용 진입 옵션 추가 |

큰 파일은 GitHub의 Raw 화면에서 전체 선택·복사합니다. JS 앞뒤에 Markdown 코드 구분자(```` ``` ````)를 붙여넣지 않습니다. 패키지 다운로드나 Node 실행이 필요한 절차는 없습니다.

## 먼저 이전 공통 수정을 정리합니다

현재 파일을 백업합니다. 이전에 수정했던 공통 `ENONewWidget.js`, `ClassificationsFacet.js`, `ClassificationProp.js`, `ENOChgGovernanceUX.js`를 **현재 서버와 동일한 2025 릴리스/핫픽스의 변경 전 원본**으로 복원합니다. 과거 `zca*`/`sdxECCA*` 연결을 그대로 두고 새 코드를 중복 적용하면 안 됩니다.

그 뒤 위 표의 1~3번을 적용합니다. 이번 수동 방식에서 공통 파일의 새 수정은 2번의 CA 진입 모듈 하나뿐입니다. 전용 모듈을 define의 필수 의존성으로 추가하지 않습니다.

## 2번의 정확한 교체 범위

`ENOChgGovernanceUX.js`에서 다음 문자열을 검색합니다.

```javascript
define("DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction"
```

검색된 `define(...)` 호출 전체를 위 표의 **ChgCreateChangeAction 모듈 전체**로 교체합니다. 파일 전체를 이 코드로 덮어쓰면 다른 Governance 기능이 없어지므로 해당 AMD 블록 하나만 교체합니다.

확인한 2025 소스에서 다음 AMD 모듈은 아래 이름입니다.

```text
DS/ENOChgGovernanceUX/scripts/model/changeRequest/facets/impactBasis/ChgCRImpactBasisDataGridModel
```

즉, 검색한 `define(".../ChgCreateChangeAction", ...)`부터 위 다음 모듈 직전까지가 대상입니다. **다음 모듈 앞의 `,define(...)` 구분 쉼표를 유지합니다.** 제공 파일은 끝에 세미콜론을 넣지 않은 define 표현식입니다. 앞뒤 모듈을 잇는 쉼표까지 지우거나 `;,define`으로 만들지 않습니다.

설치 소스의 다음 모듈이 다르면 이름이 같은 CA define 블록을 기준으로 잡습니다. 전체 모듈 교체가 어려우면 아래 두 군데만 수정해도 같습니다.

1. [entry-guard.js](entry-guard.js)의 `function sdxECCA2025TryLaunch(...) { ... }` 전체를 해당 AMD **factory 안의 `return { ... }` 앞**에 붙여넣습니다. 다른 factory나 파일 맨 끝에 넣지 않습니다.
2. 같은 factory의 `launchCreateChangeActionDialog:function(r){` 바로 뒤에 아래 한 줄을 넣습니다.

```javascript
if (sdxECCA2025TryLaunch(r, s, typeof widget === "undefined" ? null : widget)) return;
```

여기서 `s`는 확인한 2025 원본의 마지막 factory 인자인 AMD `require`입니다. factory 인자 이름이 다른 설치 소스에서는 의존성 배열의 `"require"`와 대응하는 인자를 사용합니다. 의존성 배열에 `DS/sdxECCA2025/...`를 넣지 않습니다. 전체 모듈 교체와 두 군데 삽입 방식 중 하나만 적용합니다.

## 3번의 핵심 설정

기존 설정에 이번에 추가되는 옵션은 다음입니다.

```javascript
widget.setValue("sdxECCAUsePrivateCreate2025", true);
```

이 값은 우리 커스텀 위젯에서만 설정합니다. 공용 HTML이나 다른 위젯에는 넣지 않습니다. 기존 자동 분류 옵션과 실제 type/policy 설정도 필요하므로 전체 예시는 [widget-settings.js](widget-settings.js)를 사용합니다.

CO/CR 생성 모듈이나 기존 버튼 호출부는 수정하지 않습니다. 앞서 안내했던 별도 CA 버튼 파일을 찾아 바꾸는 작업도 이 방식에서는 필요 없습니다.

## 이렇게 실행됩니다

- 우리 위젯: 위 옵션이 true → 전용 모듈을 비동기로 로딩 → 전용 CA 생성창.
- 일반 위젯: 옵션 없음/false → 전용 모듈을 요청하지 않고 원래 CA 생성 코드 실행.
- 전용 파일 누락/로딩 실패: 우리 위젯에서 오류를 기록하고 종료. 일반 위젯의 필수 의존성은 변하지 않음.

## 검증과 남은 확인

실제 2025 원본과 비교하여 옵션이 꺼진 경로의 기존 동작, 대상에서만 전용 require 실행, 로딩/실행 실패 처리, 원래 AMD 의존성 유지, 전체 번들 교체 후 다른 AMD 모듈의 factory와 의존성 불변을 검사했습니다. 전용 번들의 이벤트 분리와 원래 모듈 유지 검사도 통과했습니다.

실제 서버에서는 아직 실행하지 않았습니다. 적용 뒤 대상 CA 생성·분류 저장·필수입력·policy·Text 복사·검색과 일반 위젯의 팝업, CO/CR 생성을 확인합니다. 현재 서버의 2025 핫픽스가 참고 원본과 다르면 조정이 필요할 수 있습니다. 서버의 type/policy/trigger 변경까지 분리하는 기능은 아닙니다.
