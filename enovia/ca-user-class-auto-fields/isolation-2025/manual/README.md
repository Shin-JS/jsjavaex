# 2025 수정 부분만 복사·붙여넣기

작업 코드는 **jsjavaex에서만** 관리합니다. 전체 OOTB 소스와 생성된 전체 번들은 올리지 않습니다. 기존 파일은 `[대상 AMD 모듈]`, `[수정 전]`, `[수정 후]` 주석으로 변경 위치를 표시하고, 새로 작성한 커스텀 함수만 전체 제공합니다. 사용자 PC에서 Node 실행·빌드·소스 자동 다운로드가 필요하지 않습니다. 2024는 비교 참고용이며 실제 수정 기준은 2025입니다.

## 어떤 파일을 수정하는가

| 대상 | 작업 | 제공 코드 |
|---|---|---|
| 새 `3dspace/webapps/sdxECCA2025/sdxECCA2025.js` | 아래 절차로 로컬 원본을 복사하고 필요한 부분만 수정 | [전용 복사본 변경 조각](source-patches/) |
| 공통 `ENOChgGovernanceUX.js`의 CA 진입 AMD 모듈 | 대상 옵션 검사 함수 추가와 진입부 한 줄 추가 | [entry-guard.js](entry-guard.js) |
| 우리 위젯 전용 HTML의 기존 설정 위치 | 기존 설정 갱신 및 전용 진입 옵션 추가 | [widget-settings.js](widget-settings.js) |

전용 복사본이 필요한 이유는 생성·분류 이벤트 관리자와 provider까지 일반 위젯에서 사용하는 인스턴스와 분리하기 위해서입니다. 공통 소스에 필수 커스텀 의존성을 추가하지 않습니다. 동일 이름의 공통 prototype이나 RequireJS 전역 설정도 바꾸지 않습니다.

## 0. 이전 공통 수정을 정리

현재 배포본을 백업합니다. 이전에 수정했던 공통 `ENONewWidget.js`, `ClassificationsFacet.js`, `ClassificationProp.js`, `ENOChgGovernanceUX.js`를 **현재 서버와 동일한 2025 릴리스/핫픽스의 변경 전 원본**으로 복원합니다. 과거 `zca*`/`sdxECCA*` 연결을 남기거나 중복 적용하지 않습니다. 서버의 다른 커스텀 수정이 함께 있는 파일은 무조건 덮어쓰지 말고 우리 변경 부분을 구분하여 제거합니다.

아래의 1~3번은 새 전용 파일 안의 복사본 작업이고, 공통 원본 수정은 4번의 CA 진입부뿐입니다.

## 1. 로컬 원본을 새 전용 파일에 복사

`3dspace/webapps/sdxECCA2025/sdxECCA2025.js`를 새로 만듭니다. 다음 순서로 **각 파일 내용**을 이어 붙입니다. 파일과 파일 사이에는 새 줄에 세미콜론 `;` 하나를 둡니다. 이는 텍스트 복사 작업이며 명령어를 실행하지 않습니다.

먼저 로컬의 변경 전 2025 원본에서 다음 8개 파일을 복사합니다. 각각 `3dspace/webapps/폴더명/파일명.js`에 있습니다.

```text
ENONewWidget/ENONewWidget.js
ClassificationsFacet/ClassificationsFacet.js
ClassificationProp/ClassificationProp.js
EditPropWidget/EditPropWidget.js
IPClassifyUtil/IPClassifyUtil.js
IPClassifyActive/IPClassifyActive.js
PLMNewLibraryActive/PLMNewLibraryActive.js
PLMNewFolderActive/PLMNewFolderActive.js
```

그다음 원본 `ENOChgGovernanceUX.js`에서 아래 **AMD define 호출 하나만** 복사하여 이어 붙입니다. Governance 파일 전체를 복사하지 않습니다.

```text
DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
```

확인한 2025 소스에서 다음 AMD 모듈은 `DS/ENOChgGovernanceUX/scripts/model/changeRequest/facets/impactBasis/ChgCRImpactBasisDataGridModel`입니다. 해당 다음 모듈 앞의 구분 쉼표는 새 전용 파일에 복사하지 않습니다. define 호출만 복사하고 끝에 세미콜론을 둡니다. **아직 entry-guard를 넣지 않은 원본 CA 모듈**을 복사합니다.

마지막으로 기존 커스텀 모듈 5개를 아래 순서로 이어 붙입니다. 이 파일들은 새로 작성한 커스텀 코드이므로 기존 저장소의 전체 파일을 그대로 사용합니다.

- [sdxECCAAutoClass.js](../../webapps/sdxECCAAutoClass/sdxECCAAutoClass.js)
- [sdxECCAClassRuleService.js](../../webapps/sdxECCAAutoClass/sdxECCAClassRuleService.js)
- [sdxECCAOrganizationProvider.js](../../webapps/sdxECCAAutoClass/sdxECCAOrganizationProvider.js)
- [sdxECCAClassAttributeService.js](../../webapps/sdxECCAAutoClass/sdxECCAClassAttributeService.js)
- [sdxECCAObjectSearch.js](../../webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js)

## 2. 전용 파일의 표시된 부분만 수정

새 `sdxECCA2025.js` 안에서 다음 변경 메모를 적용합니다. **메모 파일 전체를 기존 JS에 덮어쓰는 것이 아닙니다.** 각 메모의 대상 AMD 모듈을 찾아 `[수정 전]` 부분만 `[수정 후]` 코드로 바꿉니다. 설명 주석까지 실행 코드에 넣지 않아도 됩니다.

| 새 파일 안에서 찾을 원본 모듈 묶음 | 수정 부분 메모 |
|---|---|
| ENONewWidget | [ENONewWidget.js](source-patches/ENONewWidget.js) |
| ClassificationsFacet | [ClassificationsFacet.js](source-patches/ClassificationsFacet.js) |
| ClassificationProp | [ClassificationProp.js](source-patches/ClassificationProp.js) |
| 복사한 ChgCreateChangeAction | [ENOChgGovernanceUX.js](source-patches/ENOChgGovernanceUX.js) |

나머지 복사한 OOTB 묶음은 아래 전용 이름 치환 외에 로직 수정이 없습니다. 기존 `webapps/ENONewWidget` 등의 과거 공통 수정 메모는 함께 적용하지 않습니다. 2025의 `TabUtility`와 추가 provider 인자 등 기존 의존성 순서를 유지합니다.

## 3. 새 파일 안의 AMD 이름만 전용 이름으로 치환

VS Code에서 **새 `sdxECCA2025.js` 파일 하나만 열고**, 찾기·바꾸기의 정규식 옵션을 켭니다. 워크스페이스 전체 치환을 하지 않습니다.

찾기:

```regex
(["'])DS/(ENONewWidget|ClassificationsFacet|ClassificationProp|EditPropWidget|IPClassifyUtil|IPClassifyActive|PLMNewLibraryActive|PLMNewFolderActive|sdxECCAAutoClass)/(?!assets/|ENONew/View/facet/wizardView["'])
```

바꾸기:

```text
$1DS/sdxECCA2025/private/$2/
```

위 정규식은 모듈 이름과 의존성을 함께 변경합니다. `i18n!`, `css!`, `text!`로 시작하는 공유 리소스 경로와 `assets`는 기존 경로를 유지합니다. `wizardView` 문자열은 원본의 별도 조회 식별자이므로 치환에서 제외합니다. 이 패턴은 확인한 2025 원본에서 검사했습니다.

그다음 일반 문자열 치환으로 아래 이름 한 개도 변경합니다. **앞뒤 큰따옴표까지 포함하여** 찾아 바꿉니다.

찾기:

```text
"DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction"
```

바꾸기:

```text
"DS/sdxECCA2025/private/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction"
```

마지막에 세미콜론을 하나 두고 **[tail-modules.js](tail-modules.js) 전체**를 붙여넣습니다. 새로 작성한 설정·진입 모듈이므로 이 두 모듈만 전체 추가 코드로 제공합니다. 이 단계 이후에는 위 이름 치환을 다시 하지 않습니다.

새 파일은 전용 AMD 이름만 정의하며 공통 모듈 이름을 다시 정의하면 안 됩니다. `define("DS/ENONewWidget/` 등 원래 이름으로 남은 모듈 정의가 없는지 확인합니다. `i18n!DS/...` 같은 공유 리소스 참조가 남는 것은 정상입니다.

## 4. 공통 CA 진입부의 두 군데만 변경

공통 원본 `3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js`에서 다음 AMD 모듈을 찾습니다.

```text
DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction
```

해당 factory 안, `return { ... }`보다 앞에 **[entry-guard.js](entry-guard.js)의 함수 전체**를 추가합니다. 파일 맨 끝이나 다른 factory 안에 넣지 않습니다.

그리고 같은 모듈의 `launchCreateChangeActionDialog:function(r){` 바로 뒤에 아래 한 줄을 추가합니다.

```javascript
if (sdxECCA2025TryLaunch(r, s, typeof widget === "undefined" ? null : widget)) return;
```

여기서 `s`는 확인한 2025 원본의 마지막 factory 인자인 AMD `require`입니다. 설치 소스의 인자 이름이 다르면 의존성 배열의 `"require"`와 대응하는 인자를 사용합니다. **define 의존성 배열은 바꾸지 않습니다.** CA 모듈의 나머지 원래 코드는 유지합니다.

이 entry-guard는 공통 진입부에만 넣습니다. 1번에서 복사한 전용 CA 모듈에 넣으면 자기 자신을 재호출하므로 안 됩니다. CO/CR 생성 모듈과 별도 버튼 파일은 변경하지 않습니다.

## 5. 우리 위젯 설정

기존 `sdxECCA` 설정이 실행되는 우리 위젯 전용 HTML 위치에 [widget-settings.js](widget-settings.js)를 적용합니다. 같은 설정은 중복 추가하지 않고 갱신합니다.

이번에 추가되는 진입 옵션은 다음입니다.

```javascript
widget.setValue("sdxECCAUsePrivateCreate2025", true);
```

이 옵션은 우리 위젯에서만 설정합니다. 일반 위젯에서는 전용 모듈을 요청하지 않고 원래 생성 코드가 실행됩니다. 공용 HTML에 설정하지 않습니다.

## 검증 범위

개발자 측 검사에서 위 주석 조각을 실제 2025 원본에 적용하여 기존 생성기의 185개 factory/의존성과 일치함을 확인했습니다. 실제 파일 내용을 이어 붙이고 이름 치환을 수행한 결과 187개 전용 모듈이 구문 오류와 중복 없이 등록되는 것도 확인했습니다. 원본·전용 이벤트 분리, 전용 의존성 실패 후 원래 launcher 실행, 공통 진입 옵션이 꺼진 경로의 원본 유지 검사도 통과했습니다.

실제 서버 UI·저장 검증은 아직 미완료입니다. 적용 후 대상 CA의 분류·필수입력·policy·Text 복사·검색과 일반 위젯 팝업, CO/CR 생성을 확인합니다. 서버의 2025 릴리스/핫픽스가 다르면 조정이 필요할 수 있습니다. Export Control은 이번 전용 생성 모듈에서 지원하지 않습니다.

`test-*.cjs`, `build.cjs`, `patches.json`은 개발자 검증용입니다. 사용자가 실행하거나 서버에 배포하지 않습니다.
