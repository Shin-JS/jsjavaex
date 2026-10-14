# 기존 파일 수정 방식: CA 속성 탭의 분류 선택 입력창

이 문서는 앞서 만든 별도 Launcher/Engine/facet 구성 대신, **기존 파일명과 기존 AMD 모듈을 유지하며 추가할 부분만** 정리한 버전입니다. 타입 생성 MQL은 기존 schema 폴더에 유지했습니다.

`webapps` 아래 파일은 전체 교체본이 아니라 수정용 코드 조각입니다. 원본 파일에 덮어쓰지 마세요. 파일의 주석에 표시한 AMD factory와 메서드를 찾아 해당 함수/호출만 넣습니다. 새 `define()`이나 새 모듈 경로 등록은 필요하지 않습니다.

2024x 공개 소스로 확인한 위치를 기준으로 합니다. 실제 환경의 파일이 여러 개의 개별 JS로 나뉘어 있으면 같은 AMD 모듈을 정의한 실제 파일에 적용합니다. 파일이 압축되어 있으면 먼저 작업용 복사본을 읽기 좋게 정리하고 메서드 단위로 반영하세요. 현재 환경의 전체 소스를 직접 수정한 상태는 아닙니다.

## 1. 수정 대상

| 기존 파일명 | 찾아야 하는 AMD 모듈/위치 | 수정 내용 |
|---|---|---|
| ENOChgGovernance.html | 커스텀 위젯의 초기화/onLoad | 이 위젯에만 기능 활성화 값 지정 |
| ENOChgGovernanceUX.js | ChgCreateChangeAction.launchCreateChangeActionDialog | 활성화된 위젯에서 신규 타입 사용; OOTB 기본 타입 설정 저장은 제외 |
| ENONewWidget.js | ENONewFacetHelper.getFacetList | 생성 대화상자마다 두 facet이 공유하는 bridge 추가 |
| ENONewWidget.js | ENOListViewFacet.init/destroy | 속성 탭의 검색 입력창 추가와 정리 |
| ENONewWidget.js | ENONewDialogController.destroy | 닫을 때 해당 bridge 정리 |
| ClassificationsFacet.js | PLMNewClassificationFacet.init/destroy | 기존 라이브러리 컨트롤러를 bridge에 연결 |

`EditPropWidget.js`, 부모 타입의 attribute, 공용 CSS, 별도 신규 Launcher/Engine/Controller는 이번 수정 대상이 아닙니다. 분류 속성 표시와 저장은 기존 로직을 유지합니다.

## 2. 타입 생성부터 진행

예시 타입명은 `ZCA Change Action`입니다. 실제 타입명으로 바꿀 때 schema의 명령, ENOChgGovernanceUX.js의 zcaType, ENONewWidget.js의 currentType 비교를 함께 바꿉니다.

1. schema/01-inspect.mql로 부모 타입, 신규 이름 충돌, 기존 CA의 정책을 확인합니다.
2. 신규 이름이 없을 때 schema/02-create-type.mql을 개별 실행합니다.
3. 프로젝트에서 요구하면 schema/03-symbolic-name.optional.mql을 적용합니다.
4. typeInfo와 CA 생성 서비스에서 신규 타입이 지원되는지 먼저 확인합니다.

핵심 명령:

```mql
add type "ZCA Change Action" derived "Change Action" abstract false;
```

정책 이름이나 정책의 하위 타입 허용을 추측해서 자동 수정하지 않습니다. 타입 생성만으로 CA 서비스 등록, 정책 선택, 이름 자동 생성, 국제화, 인덱싱이 모두 완료되는 것은 아닙니다. MQL 권한이 없다면 스키마 담당자가 실행해야 합니다.

라이브러리 입력창을 문자열 attribute로 타입에 추가하지 않습니다. 이것은 기존 클래스 선택 UI를 한 탭에 더 제공하는 작업입니다. 클래스의 속성 모델은 기존 분류 컨트롤러가 관리합니다.

## 3. 다른 위젯에 적용되지 않도록 조건 지정

기존 파일을 공용 경로에서 수정하면 그 파일은 다른 위젯도 로드합니다. 그래서 모든 추가 로직은 **커스텀 위젯의 활성화 값 + 선택한 신규 타입**을 확인해야 합니다.

커스텀 위젯 전용 진입 HTML의 기존 초기화/onLoad에서 생성 화면을 열기 전에 다음 한 줄을 넣습니다.

```javascript
widget.setValue("zcaEnableLibraryInProperties", true);
```

이 한 줄은 플랫폼 공용 OOTB HTML에 넣지 않습니다. 현재 커스텀 위젯의 진입 파일명이 ENOChangeAction.html 등이라면 실제 그 파일에 넣습니다. 제공한 ENOChgGovernance.html 조각은 위치 안내용입니다.

다른 위젯에서는 이 값을 지정하지 않습니다. 생성 옵션 변경은 활성화 값이 true인 경우만 실행하고, 속성 탭 입력창 추가는 신규 타입까지 일치하는 경우만 실행합니다. false 또는 미지정 상태에서는 기존 facet과 생성 타입 선택 경로를 그대로 사용합니다. OOTB CA_DEF_TYPE 사용자 설정에는 커스텀 타입을 저장하지 않습니다.

별도 위젯 인스턴스/iframe에서 값과 AMD 문맥이 분리되어 있는지 실제 대시보드에서 확인해야 합니다. 동일 iframe에서 OOTB 분류 화면과 커스텀 생성 화면을 동시에 실행하는 환경은 분류 유틸리티의 singleton/provider 상태까지 검토해야 합니다. 조건문만으로 동일 실행 문맥의 모든 부작용을 해결했다고 볼 수 없습니다.

신규 타입 자체는 공용 서버 스키마입니다. 다른 위젯의 하위 타입 목록이나 부모 타입 기반 검색에 나타날 수 있습니다. UI 추가 로직의 조건 분리와 타입 비노출은 별개의 문제입니다.

## 4. ENOChgGovernanceUX.js 적용

파일 안의 `ChgCreateChangeAction` AMD factory를 찾습니다. 제공한 js의 `zcaIsEnabledForThisWidget()`을 해당 factory 내부에 추가합니다.

`launchCreateChangeActionDialog()`에서 활성화 값과 신규 타입명을 변수로 둡니다. 기존 사용자 기본 타입 조회, 생성 옵션의 type/typeName을 조건부로 변경합니다. onSuccess의 `saveUserPreference()` 호출도 비활성화 위젯에서만 실행하도록 바꿉니다. 정확한 변경 식은 같은 이름의 코드 조각 파일 주석에 있습니다.

기존 tenant/SecurityContext, classificationFacet 등록, 목록/상세 갱신, 취소/실패 처리는 유지합니다. 실제 타입 선택 옵션과 생성 요청의 type이 새 타입인지 확인합니다. 기본 타입 설정만 바꾸고 요청이 부모 타입으로 나가는 상태를 통과로 판단하지 않습니다.

## 5. ENONewWidget.js 적용

이 파일에는 서로 다른 세 AMD 모듈의 수정 조각이 함께 있습니다. 각 블록은 주석에서 지정한 **해당 factory 내부**에만 넣습니다.

### 5-1. ENONewFacetHelper

`zcaCreateBridge()`와 `zcaAttachBridge()`를 해당 factory의 반환문 앞에 추가합니다. 기존 getFacetList가 최종 facet 배열을 만든 뒤 반환하기 전에 호출합니다.

```javascript
zcaAttachBridge(data, facetList);
return facetList;
```

참조 2024x 코드에서는 인자가 `e`, 최종 배열이 `a`이므로 호출은 `zcaAttachBridge(e, a)`입니다. 원본이 `return ..., a` 형태의 쉼표 표현식이면 배열 구성 후 `return a`로 읽기 좋게 풀고 그 직전에 호출합니다. 기존 배열 구성 로직을 삭제하면 안 됩니다.

bridge는 getFacetList 호출마다 새로 만들며, 현재 대화상자의 ENOCreate와 classificationFacet 옵션에만 같은 참조를 넣습니다. 모듈 전역 변수나 window.top에 선택 목록을 저장하지 않습니다. 기존 facet의 require 경로와 AMD ID는 바꾸지 않습니다.

### 5-2. ENOListViewFacet

ZcaLibraryAdapter, zcaInstallPropertiesPicker, zcaDestroyPropertiesPicker를 이 factory 내부에 추가합니다. 기존 init에서 listview.loadView() 다음에 추가합니다.

```javascript
zcaInstallPropertiesPicker(this, options);
```

참조 소스에서는 options 변수명이 `t`입니다. bridge가 없는 일반 위젯은 즉시 반환하여 UI를 추가하지 않습니다. 기존 destroy의 listview.destroy() 앞에서 zcaDestroyPropertiesPicker(this)를 호출합니다.

검색/선택은 추가된 adapter가 수행하고 기존 라이브러리 컨트롤러 한 개에 결과를 반영합니다. 분류 속성 모델을 별도로 만들지 않습니다. 입력창은 기존 분류 탭과 같은 DS/WUXAutoComplete/AutoComplete를 사용합니다. 찾아보기는 DS/Controls/Button의 lite 아이콘 버튼을 사용하고, 원래 NLS와 ClassificationsFacet.css의 배치 클래스를 재사용합니다. 선택 항목은 기존처럼 칩으로 표시되며 속성 탭의 칩 삭제도 분류 탭에 반영됩니다. 두 화면의 TreeNodeModel 인스턴스는 복제하여 한쪽 UI의 선택 상태가 다른쪽 모델을 직접 바꾸지 않게 합니다.

추가 CSS 파일은 만들지 않고 기존 ClassificationsFacet.css를 css! 로더로 가져옵니다. UI 컴포넌트도 zcaInstallPropertiesPicker 안에서 require하므로 기존 AMD factory의 의존성 배열/인자 순서를 바꿀 필요가 없습니다. 실제 설치 버전의 테마에 따른 최종 외형은 화면에서 확인하세요.

이미 적용한 코드에서는 ENONewWidget.js의 [2] 영역에 있는 zcaInstallPropertiesPicker/zcaDestroyPropertiesPicker 두 함수를 교체합니다. ZcaLibraryAdapter, [1] bridge 구성, [3] 닫기 처리는 유지합니다. 특히 사용자가 테스트하면서 바꾼 Change Action 타입 조건을 이번 UI 변경 때문에 이전 ZCA Change Action 예시로 되돌리지 마세요.

### 5-2-1. 클래스 선택창에 파라미터 전달

기존 찾아보기 동작은 그대로 사용합니다. 필요한 경우 속성 facet의 options에 `zcaSelectorParameters` 객체와 `zcaOpenClassSelector` 함수를 연결할 수 있습니다. 둘 다 이번 추가 코드가 정의한 전달 지점이며 OOTB 옵션명이 아닙니다.

```javascript
properties.options.zcaSelectorParameters = {
    libraryId: "전달할 라이브러리 ID",
    classId: "전달할 클래스 ID"
};
properties.options.zcaOpenClassSelector = function (controller, parameters) {
    // parameters를 기존 선택창 생성 옵션/검색 조건에 매핑하는 수신 로직
};
```

위 설정은 zcaAttachBridge에서 properties를 찾은 뒤 넣습니다. 실제로 전달할 값과 사용 목적에 맞춰 수신 함수를 구현해야 합니다. 기본 onClickSelector는 인자를 처리하지 않으므로 `controller.onClickSelector(parameters)`만 호출해도 검색 범위/초기 선택이 바뀌는 것은 아닙니다. 수신 로직은 PLMNewLibraryActiveController.onClickSelector에서 LibraryActive 생성 옵션 또는 검색 서비스 요청 조건에 값을 반영해야 합니다. 옵션 지원 여부는 설치 버전에서 확인합니다. 파라미터만 지정하고 수신 함수를 연결하지 않으면 조용히 무시하지 않고 안내를 표시합니다.

### 5-3. ENONewDialogController

zcaDisposeDialogBridge를 해당 factory에 추가하고 기존 destroy 첫 줄에서 호출합니다. 기존 프레임/대화상자 정리와 _parent 호출은 유지합니다. 이 호출이 취소 후 늦은 검색/선택 응답과 구독 상태를 정리합니다.

## 6. ClassificationsFacet.js 적용

PLMNewClassificationFacet factory에 두 함수를 추가합니다. init에서 기존 initUI 생성, getUI 호출, 보안 컨텍스트 구독을 마친 뒤 연결 함수를 호출합니다.

```javascript
zcaConnectClassificationFacet(this, options);
```

참조 소스의 options 변수명은 `e`입니다. 기존 destroy 첫 줄에서 zcaDisconnectClassificationFacet(this)를 호출합니다. **기존 postCreation은 그대로 유지합니다.** 생성된 객체에 분류 연결과 분류 속성을 저장하는 경로이기 때문입니다.

기존 라이브러리 컨트롤러의 준비 완료를 기다린 뒤 bridge에 연결합니다. 속성 입력창에서 선택하면 기존 노드 선택 이벤트를 통해 분류 속성 모델을 생성합니다. 라이브러리 루트 대신 최종 General Class를 선택해야 클래스 속성 필드를 만들 수 있습니다.

## 7. 확인할 동작

| 확인 | 통과 기준 |
|---|---|
| 기능 값이 없는 원래 위젯에서 CA 생성 | 새 입력창 없음, 기존 타입/기본 타입 설정 처리 유지 |
| 커스텀 위젯에서 신규 타입 생성 | 속성 탭에 입력창 표시 |
| 분류 탭을 열기 전에 클래스 선택 | 준비 완료 후 선택 가능; 분류 탭에서 속성 필드 표시 |
| 분류 탭에서 선택/삭제 | 속성 탭의 선택 요약과 일치 |
| 빠른 검색/중복 선택/취소 후 재실행 | 과거 응답이나 선택 상태가 남지 않음 |
| 클래스 속성값 입력 후 생성하고 재조회 | 분류 연결과 입력값 유지 |
| 두 위젯을 별도 iframe으로 동시 사용 | UI/선택/기본 타입 설정이 서로 바뀌지 않음 |

분류 속성 조회/저장이 완료되기 전에 생성 완료로 처리되는지 확인하세요. 참고 소스의 postCreation은 속성 저장 완료와 실패 전파를 추가 검토해야 합니다. 생성 후 분류 저장 실패는 CA가 이미 존재하는 부분 실패일 수 있습니다. 재시도 때 CA를 중복 생성하지 않도록 처리해야 합니다.

초기 적용은 한 대화상자에서 타입/보안 컨텍스트를 변경하지 않는 신규 생성 흐름을 기준으로 합니다. 타입/컨텍스트 변경, Create Another까지 필요하면 관련 updateFacet/재초기화 경로를 추가 연결해야 합니다.

기존 파일 수정 방식은 업데이트 시 덮어쓰기와 충돌 가능성이 있으므로 원본 백업과 수정 기록을 남깁니다. 배포 전 현재 설치 버전의 API/내부 필드를 대조하세요. 이 자료는 변경 지점과 코드 조각이며 현재 서버에서 실행 검증한 패치는 아닙니다.

## 8. 참고 소스

- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENONewWidget/ENONewWidget.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ClassificationsFacet/ClassificationsFacet.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/PLMNewLibraryActive/PLMNewLibraryActive.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js

소스의 내부 메서드가 공식 확장 API로 보장되는 것은 아닙니다. minified 변수명은 버전에 따라 달라질 수 있습니다.

