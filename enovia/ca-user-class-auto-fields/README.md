# 클래스 자동 표시 · 유형 고정 · 부서 조회 연결 준비

기존 추가 함수 17개를 [sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js)의 `define("DS/sdxECCAAutoClass/sdxECCAAutoClass", ...)` 안으로 옮겼습니다. OOTB 파일에는 커스텀 모듈 의존성과 연결 호출만 남깁니다.

2026-10-19 현장에서 지정 클래스의 속성 필드가 표시되는 것을 확인했습니다. 완료 알림에는 **클래스 모델과 응답을 이 순서로** 전달해야 합니다. 현재 설치 소스가 `modelList:[i]`, `onAttributesLoad:function(r)`이면 `notifyAttributesLoaded(i,r)`입니다. R2024x 예시의 축약 변수명을 그대로 사용하지 않습니다.

기본값은 기존 고정 클래스 방식입니다. 향후 로그인 사용자 부서와 분류에 추가할 General Type의 부서 값을 매칭하도록 별도 조회 서비스와 Provider 연결 지점을 추가했습니다. 실제 General Type/속성/API는 미확정이므로 **실제 부서 조회 두 함수는 아직 연결하지 않았습니다.** [부서 조회 설명](DEPARTMENT.md)을 참고합니다. 서버 저장 오류는 별도 보류 상태입니다.

## 접두사 변경: zca → sdxECCA

현재 폴더의 함수명, 세션/컨트롤러 속성, 위젯 설정 키와 AMD 모듈명을 sdxECCA로 통일했습니다. 공개 메서드 attachBridge/installFields 등의 이름은 그대로이며, 커스텀 의존성은 여전히 마지막입니다.

| 이전 이름 | 새 이름 |
|---|---|
| DS/ZCAAutoClass/ZCAAutoClass | DS/sdxECCAAutoClass/sdxECCAAutoClass |
| webapps/ZCAAutoClass/ZCAAutoClass.js | webapps/sdxECCAAutoClass/sdxECCAAutoClass.js |
| factory 인자 ZcaAutoClass | sdxECCAAutoClass |
| zcaEnableAutoClassByOrganization | sdxECCAEnableAutoClassByOrganization |
| zcaAutoClassType | sdxECCAAutoClassType |
| zcaFixedClassId | sdxECCAFixedClassId |
| zcaFixedLibraryId | sdxECCAFixedLibraryId |
| zcaTypeDisplay | sdxECCATypeDisplay |
| zcaAutoSession | sdxECCAAutoSession |

기존 HTML의 setValue 키도 새 이름으로 함께 바꿔야 합니다. 이전 키를 자동으로 읽는 호환 처리는 넣지 않았습니다. 구형/신형 모듈과 연결 코드를 섞지 않습니다. 실제 타입명 sdxEcChangeAction과 클래스 physicalid 값은 바꾸지 않았습니다. 과거 ca-isolated-kit 폴더는 이번 변경 대상이 아니며 이전 접두사가 남아 있습니다.

## 파일 구분

| 파일 | 용도 |
|---|---|
| [webapps/sdxECCAAutoClass/sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js) | 새로 배포할 전체 커스텀 AMD 모듈. 실제 추가 로직과 주석이 있음 |
| [sdxECCAClassRuleService.js](webapps/sdxECCAAutoClass/sdxECCAClassRuleService.js) | 고정 클래스 또는 부서별 클래스 결정과 결과 검증 |
| [sdxECCAOrganizationProvider.js](webapps/sdxECCAAutoClass/sdxECCAOrganizationProvider.js) | 실제 사용자/General Type 조회를 연결할 두 함수 |
| [ENONewWidget.js](webapps/ENONewWidget/ENONewWidget.js) | 기존 OOTB의 세 모듈에 넣을 의존성/인자/호출 변경 메모 |
| [ClassificationsFacet.js](webapps/ClassificationsFacet/ClassificationsFacet.js) | 기존 분류 컨트롤러 연결과 모델 생성 호출 변경 메모 |
| [ClassificationProp.js](webapps/ClassificationProp/ClassificationProp.js) | 실제 속성 로딩·폼 반영 뒤 완료 호출 변경 메모 |
| [ENOChgGovernanceUX.js](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) | CreateNew 전 유형 지정과 사용자 기본 유형 저장 조건 변경 메모 |
| [ENOChgGovernance.html](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) | 대상 위젯의 기존 스크립트에 넣는 설정 예시 |

**webapps/sdxECCAAutoClass 아래 세 JS가 새 전체 파일**입니다. 원래 OOTB 파일명으로 된 나머지 JS는 전체 교체용이 아닙니다. 각 파일에 설명한 해당 define의 헤더와 본문 호출만 바꿉니다. 기존 OOTB 모듈명은 유지합니다.

## 커스텀 의존성은 마지막에 추가

각 OOTB define에서 기존 의존성 배열을 유지한 뒤 맨 마지막에 다음을 추가합니다.

```js
"DS/sdxECCAAutoClass/sdxECCAAutoClass"
```

factory 인자의 마지막에는 `sdxECCAAutoClass`를 추가합니다. 의존성 배열과 factory 인자는 같은 인덱스로 대응해야 합니다.

특히 아래 두 모듈은 참조 OOTB의 마지막 CSS 의존성에 대응하는 factory 인자가 원래 없습니다.

- DS/ClassificationsFacet/PLMNewClassificationFacet
- DS/ClassificationsFacet/PLMNewCommomCmpUXController

이 두 곳은 CSS 값을 받는 `sdxECCACss` 자리 인자도 추가한 뒤 **마지막에 sdxECCAAutoClass**를 넣습니다.

```js
// 의존성 마지막 두 항목
"css!DS/ClassificationsFacet/ClassificationsFacet.css",
"DS/sdxECCAAutoClass/sdxECCAAutoClass"

// PLMNewClassificationFacet의 factory 인자 예시
function(e,t,i,o,n,s,a,r,l,sdxECCACss,sdxECCAAutoClass) { /* 기존 본문 */ }
```

sdxECCACss를 빼면 sdxECCAAutoClass 인자가 CSS 결과를 받습니다. 다른 다섯 모듈은 기존 인자 뒤에 sdxECCAAutoClass 하나만 추가합니다. 각 변경 메모에는 참조 R2024x의 전체 의존성/인자 배열을 적었으니 설치 버전의 실제 배열과 대조합니다.

## OOTB 본문에 남길 연결

| OOTB 모듈/지점 | 호출 |
|---|---|
| ENONewFacetHelper.getFacetList, 최종 facet 배열 반환 직전 | `sdxECCAAutoClass.attachBridge(e,a,i)` |
| ENOListViewFacet.init, 모델 build 전 | `sdxECCAAutoClass.prepareFixedType(t.data,t.sdxECCAAutoSession)` |
| 같은 init, loadView 뒤 | `sdxECCAAutoClass.installFields(this,t)` |
| 같은 updateFacet 첫 줄 | `sdxECCAAutoClass.checkFacetContext(this,e)` |
| 같은 destroy, listview 파괴 전 | `sdxECCAAutoClass.destroyFields(this)` |
| ENONewDialogController.onSubmitDialog 첫 줄 | `if(!sdxECCAAutoClass.canSubmitDialog(this)){this.resetButtons();return;}` |
| 같은 destroy 첫 줄 | `sdxECCAAutoClass.disposeDialog(this)` |
| PLMNewClassificationFacet.init, initUI/구독 설정 뒤 | `sdxECCAAutoClass.connectClassification(this,e)` |
| 같은 destroy 첫 줄 | `sdxECCAAutoClass.disconnectClassification(this)` |
| PLMNewCommomCmpUXController의 모델 push 직후 | `sdxECCAAutoClass.tagClassModel(r,o,e)` |
| ClassifPropController의 실제 _onCompleteLoadModel 직전 | `if (!sdxECCAAutoClass.prepareAttributes(e,t)) return;` |
| ClassifPropController의 실제 _onCompleteLoadModel 뒤 | `sdxECCAAutoClass.notifyAttributesLoaded(e,t)` |
| ChgCreateChangeAction의 CreateNew 인자 | `sdxECCAAutoClass.configureCreateType(d)` |
| 같은 onSuccess의 기본 유형 저장 조건 | `!sdxECCAAutoClass.isEnabled()` |

변수명은 참조 소스 기준입니다. 문맥/유형 변경 검사와 인스턴스별 문맥 반환도 각 변경 파일의 주석대로 유지합니다.

현재 설치 소스의 onChangeAttribute가 `for(var t in e){var n=e[t];i.publishAttributeInfo(n)}o(e)` 형태이면, [ENONewWidget.js 적용 메모](webapps/ENONewWidget/ENONewWidget.js)의 새 콜백 본문을 사용합니다. `publishAttributeInfo(n)` 앞에서 sdxECCAAutoSession의 문맥/유형 검사를 실행하고, 항목별 발행과 반복문 뒤의 원래 `o(e)` 호출은 유지합니다. 이벤트 키는 New-SecurityContext/New-Type, 실제 값은 n.valueDB 기준입니다. 예전 publishInfo 분기를 함께 넣지 않습니다.

함수를 define으로 옮겨도 연결 호출이 자동 설치되지는 않습니다. 특히 모델 생성 뒤의 tagClassModel과 실제 속성 반영 뒤의 notifyAttributesLoaded는 여전히 OOTB 내부에 넣어야 합니다.

## 기존 로컬 함수 방식에서 옮기기

1. webapps/sdxECCAAutoClass 아래 세 JS를 함께 배포합니다. main 모듈이 서비스와 Provider를 의존하므로 fixed 모드에서도 세 파일이 필요합니다.
2. 일곱 OOTB define의 마지막 의존성/인자를 추가합니다. CSS 자리 인자가 필요한 두 곳을 확인합니다.
3. 이 폴더에서 이전에 추가했던 sdxECCA... 함수 본문을 OOTB factory에서 제거하고 호출을 위 공개 메서드로 바꿉니다. 원래 OOTB 함수는 제거하지 않습니다.
4. 기존 init/destroy/선택/완료 위치의 호출을 빠뜨리거나 중복 적용하지 않습니다.
5. 위젯 설정은 이미 실행을 확인한 위치에 그대로 둡니다.

예전 ca-isolated-kit 검색창 이동 방식의 UI 설치 함수와 이번 자동 방식은 함께 실행하지 않습니다.

## 설정은 유지

실제로 실행되는 **대상 위젯 전용 기존 스크립트의 설정 위치**에 다음을 둡니다. 현장에서는 onLoad 안의 설정이 실행되지 않아 스크립트 최상단으로 옮긴 뒤 값이 확인된 상태였으므로, 이번 분리 때문에 다시 onLoad로 옮기지 않습니다. widget이 사용 가능한 기존 위치를 유지합니다.

```js
widget.setValue("sdxECCAEnableAutoClassByOrganization", true);
widget.setValue("sdxECCAAutoClassType", "sdxEcChangeAction");
widget.setValue("sdxECCAFixedClassId", "CLASS_PHYSICALID");
widget.setValue("sdxECCAClassRuleMode", "fixed");
widget.setValue("sdxECCATypeDisplay", "hidden");
```

CLASS_PHYSICALID는 실제 General Class physicalid로 바꿉니다. 자동으로 적용할 유형은 실제 환경에서 지원하는 이름으로 설정합니다. sdxEcChangeAction은 현재 사용자 환경에서 설정한 이름이며 다른 환경에는 해당하지 않을 수 있습니다.

- sdxECCATypeDisplay가 hidden이면 유형을 숨깁니다.
- disabled이면 OOTB isReadOnly로 편집을 막습니다. 실제 모양은 렌더러에 따라 비활성 드롭다운 또는 읽기 전용 값입니다.
- sdxECCAFixedLibraryId를 추가하면 선택한 라이브러리 경로에 해당 클래스가 포함되는지도 확인합니다.
- 활성화 옵션의 ByOrganization 이름은 유지합니다. fixed 모드에서는 사용자/부서 조회가 실행되지 않습니다. department 모드는 Provider를 구현한 뒤 사용합니다.

유형은 CreateNew 전부터 지정하여 속성 정의와 실제 생성 타입을 일치시킵니다. 유형 모델 생성 전 표시/편집 옵션을 바꾸고, 원래 persistData 정의는 유지합니다.

## AMD 로딩 확인과 배포 경로

기존 플랫폼의 RequireJS 경로 규칙에서 DS/sdxECCAAutoClass/sdxECCAAutoClass가 새 파일 URL로 해석되어야 합니다. 다른 커스텀 패키지 이름으로 배포한다면 모듈 ID와 일곱 의존성 ID를 함께 맞춥니다. 로컬 URL을 임의로 추측해 require.config를 추가하지 않습니다. 현재 환경의 기존 커스텀 모듈 경로 설정을 따릅니다.

해당 위젯 iframe 문맥에서 로딩 확인:

```js
require(["DS/sdxECCAAutoClass/sdxECCAAutoClass"], function (sdxECCAAutoClass) {
    console.log("AMD loaded", typeof sdxECCAAutoClass.attachBridge);
}, function (error) {
    console.error(error);
});
```

function이면 모듈을 받은 것입니다. 이 확인만으로 OOTB 연결 호출까지 적용됐다는 뜻은 아닙니다. 새 파일 요청 실패나 RequireJS 오류가 있으면 배포 URL과 경로 매핑부터 확인합니다.

main 모듈의 정적 의존성은 지역 require, ClassRuleService, OrganizationProvider, ClassAttributeService입니다. 검증 모듈을 별도로 로드하지 않고 이미 생성된 실제 분류 폼의 UIController를 사용합니다. OOTB 번들을 main의 정적 의존성으로 추가하지 않습니다. 공유 객체에 현재 세션을 저장하지 않으며, 각 대화상자의 options.sdxECCAAutoSession을 계속 사용합니다.

## 보류 중인 확인과 검증 한계

현장에서 표시 완료를 확인한 순서는 컨트롤러 세션 연결 → ClassificationsFacet의 tagClassModel → ClassificationProp의 notifyAttributesLoaded(동일 모델, 응답)입니다. 세션 속성명은 sdxECCAAutoSession으로 통일합니다. 문맥 검사에는 옵션 객체 전체가 아닌 securityContext 문자열을 전달합니다. 디버깅용 전역/모듈 공유 모델 참조나 console 로그는 배포 코드에 넣지 않았습니다.

현재 설치 소스의 완료 콜백은 [ClassificationProp.js 적용 메모](webapps/ClassificationProp/ClassificationProp.js)의 2026-10-19 항목을 우선 참고합니다. 로컬에서 사용한 커스텀 경로 `DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService`를 유지한다면 main의 define ID와 모든 OOTB 의존성 ID를 그 경로로 함께 맞춥니다. 서비스 파일들의 define ID와 main의 의존성도 실제 배포 경로와 일치해야 합니다.

기존 postCreation을 유지하며 클래스 연결·값 저장을 새로 구현하지 않았습니다. 커스터마이징 없는 서버에서도 발생한 ClassificationAttributeUtil.java:95 오류는 계속 별도 확인 대상입니다.

[VALIDATION.md](VALIDATION.md)에 검사 결과를, [REFERENCES.md](REFERENCES.md)에 기준 소스를 정리했습니다. [DESIGN.md](DESIGN.md)는 최초 조직 기준 검토 기록입니다. 실제 플랫폼 실행과 저장이 검증된 완성 배포본은 아닙니다.


## 클래스 값에 따른 전체 필수 표시 (2026-10-20)

자동 선택한 **클래스 객체 자체**의 `sdxClassAttrMandatory` 값이 `Y`이면,
해당 클래스에서 입력 폼으로 불러온 모든 Class Attributes를 필수로 표시합니다.
상속되어 같은 클래스의 속성 응답에 포함된 항목도 대상입니다. 하위 클래스를 재귀 조회하는 기능은 아닙니다.
값이 `N` 또는 빈 문자열이면 원래 속성의 필수 설정을 유지합니다. 비교는 공백을 제거한 대문자 `Y`입니다.
CA 기본 속성이나 다른 위젯에는 추가 필수 설정을 적용하지 않습니다.

`sdxECCAClassAttributeService.js`가 현재 클래스 ID와 권한 문맥으로 클래스 자체의 값을 읽습니다.
R2024x `3DSpaceAjaxRequests.getListOfAttributes`에서 확인한
`POST /resources/v1/collabServices/attributes/op/read`의 `busIDs` 조회를 사용합니다.
`navigateToMain:false`로 클래스 객체를 조회하며 `getclassificationattributes`의 입력 기본값을 제어 값으로 사용하지 않습니다.
응답에서 클래스 ID가 일치하는 `results[].data[]`의 속성 값을 확인합니다.
속성이 응답에 없거나 조회에 실패하면 오류를 표시하고 생성을 막습니다.
설치 환경에서 클래스의 해당 속성이 이 조회 응답에 노출되는지 확인해야 합니다.

클래스 값을 먼저 읽고 기존 자동 선택을 진행합니다. 이후 OOTB가 속성 응답을
`results[].data[]`로 변환한 뒤 `prepareAttributes(model,response)`를 호출하여 해당 클래스의
분류 속성에 `mandatory:true`를 넣습니다. OOTB 모델/폼은 이를 통해 필수 표시와 기존 생성 시 검증을 사용합니다.
현재 폼의 메타데이터만 바꾸며 서버 속성 정의를 수정하지 않습니다.

**배포:** main 모듈 변경과 새 `sdxECCAClassAttributeService.js`를 함께 배포하고,
[ClassificationProp 연결 메모](webapps/ClassificationProp/ClassificationProp.js)의
폼 생성 전 `prepareAttributes` + 생성 후 `notifyAttributesLoaded` 쌍으로 기존 연결을 교체하세요.
기존 완료 통지만 유지하면 준비 오류가 발생합니다. OOTB 파일들은 전체 파일 교체용이 아닌 변경 위치 메모입니다.

검사: `node tests/test-auto-fields.cjs`, `node tests/test-class-mandatory.cjs`, `node tests/test-amd-headers.cjs`.
실제 서버에서 플래그 조회, 필수 표시, 빈 값 생성 차단과 입력 후 생성은 별도 확인이 필요합니다.


### OOTB 모델·폼·검증 연결

별도로 추가했던 `validateMandatoryFields`와 빈 값 판정은 제거했습니다.
필수 여부는 폼 생성 전의 `mandatory:true` 메타데이터로 전달하고,
필수 여부는 OOTB 모델이 관리하고, 필수 라벨의 구형 별표만 기본 생성 폼의 mandIcon으로 교체합니다.

분류 폼은 속성 탭으로 이동해도 기본 속성의 ENOListView.propModel과 별도 모델을 사용합니다.
따라서 생성 직전 `canSubmitDialog`에서 **실제 이동한 분류 폼**의 기본 검증도 호출합니다.
`classifPropertiesView.controller.skeleton.getFacetContent("classificationAttiProp")`로
실제 facet을 가져오고, `facet.getModel()`을 `facet.editPropertiesUI.elements.UIController.validateModels([model])`에 전달합니다.
선택 시의 classifPropModels 배열이나 별도 보조 classifPropertiesUI 인스턴스로 모델을 추정하지 않습니다.
`getAttributeFromField()`도 전체 속성 열거 API로 사용하지 않습니다.
오류 판정과 속성별 오류 설정은 OOTB가 담당하며 기존 생성 공통 입구는 그 결과로 생성을 중단합니다.

속성 로딩 완료 시 실제 폼 모델의 각 대상 속성에 `mandatory === true`가 전달됐는지도 확인합니다.
반영되지 않았으면 준비 오류로 처리하여 빈 모델을 검증하고 통과하는 일을 막습니다.
기존 `prepareAttributes` → `_onCompleteLoadModel` → `notifyAttributesLoaded` 연결은 유지합니다.
배포 시 main 파일을 최신 버전으로 교체하고 이전에 수동으로 넣은 별표·빈 값 검사 코드가 있다면 제거하세요.

검사에는 `node tests/test-ootb-validation.cjs /실제/ClassificationProp.js`도 사용할 수 있습니다.
R2024x의 실제 AttributesUtils 구현으로 빈 필수값 오류 설정과 입력 후 통과를 확인했습니다.
이 검사는 브라우저 UI를 실행하지 않으며 서버 저장을 검증하지 않습니다.
설치 서버에서 별표가 여전히 두 개라면 실제 라벨 DOM/CSS를 확인해야 합니다. 중복이 해결됐다고 검증한 상태는 아닙니다.


## 입력 중 생성 버튼 활성화 (2026-10-20)

분류 폼 준비가 끝나기 전과 OOTB 검증 오류가 있는 동안에는 생성 버튼을 비활성화합니다.
필수값을 모두 입력한 뒤 OOTB 모델의 `onChangeAttributes`가 발생하면 같은 폼 모델을 다시 검증하고,
분류 facet의 `setFacetValidation(valid)`에 결과를 전달합니다.
이 값은 OOTB `evaluateValidationStatus`로 연결되므로 다른 facet이 무효하면 생성 버튼도 계속 비활성화됩니다.
생성/생성 후 닫기/생성 옵션 버튼의 처리는 OOTB가 담당하며 취소 버튼을 따로 막지 않습니다.
입력 컨트롤의 모델 반영 시점은 OOTB tweaker의 change/debounce 동작을 따릅니다.
별도 DOM 입력값 판정이나 주기적 polling은 하지 않습니다.

필수 표시도 폼 생성 전에 `mandatory:true`를 전달하여 OOTB Form/tweaker에 맡깁니다.
기존 수동 별표 코드가 있다면 제거하세요. 기본 생성 폼의 mandIcon 마크업으로 표시를 통일합니다.
기존 화면의 중복 별표가 제거됐는지는 서버 DOM 확인 없이 확정할 수 없습니다.

### 이번 배포 변경

1. `sdxECCAAutoClass.js`를 최신 버전으로 교체합니다.
2. [ENONewWidget.js 연결 메모](webapps/ENONewWidget/ENONewWidget.js)의 DialogController
   `resetButtons()` 기존 처리 마지막에 `sdxECCAAutoClass.preserveValidationState(this);`를 추가합니다.
   원래 reset 처리로 잠시 복원되는 버튼도 필수값이 없으면 다시 비활성화합니다.
3. 기존 ClassificationProp before/after, ClassificationsFacet connect/disconnect, onSubmitDialog 연결은 유지합니다.
   숨긴 classificationFacet의 getOccurrence/setValidation 연결을 제거하지 않습니다.

분류 모델 변경 구독과 지연 작업은 화면 종료 시 해제합니다. 세션이 없는 다른 위젯은 변경하지 않습니다.
검사: 기존 세 검사와 실제 OOTB 소스를 입력하는 test-ootb-validation/test-ootb-button-state를 실행했습니다.
실제 서버 브라우저의 버튼 상태/필수 표시/저장은 별도 확인이 필요합니다.


### occurrence 초기화 대기

facet init 중에는 getOccurrence()가 null일 수 있습니다. 이때는 facetValidation 값만 보관하고
setFacetValidation 호출은 occurrence.setValidation이 준비될 때까지 미룹니다.
기존 컨트롤러 준비 타이머에서 occurrence도 확인하며, 준비되면 보관한 상태를 한 번 발행합니다.
단순히 null일 때 return하여 초기 비활성 상태 전달을 누락하지 않습니다.
준비 제한시간을 넘기면 오류로 남기며, 화면 종료 시 기존 타이머를 정리합니다.


## 기본 생성 폼과 동일한 필수 아이콘

`sdxECCAAutoClass.js`의 renderMandatoryIcons가 대상 폼 내부의
`.attrLabel.mandAttr`에 있는 구형 `.attrMand` 요소만 아래 마크업으로 교체합니다.

```html
<span class="mandIcon wux-ui3ds wux-ui-3ds-new-create" aria-hidden="true"></span>
```

구형 라벨의 mandAttr 클래스도 제거하여 해당 클래스의 pseudo-element와 중복되지 않게 합니다.
필수 여부를 담는 속성 모델의 mandatory 값은 유지합니다. 전역 스타일이나 OOTB 공용 파일은 변경하지 않습니다.
폼 생성 완료와 기존 폼 배치 시 실행하며, 반복 통지에서 중복 추가하지 않습니다.
앞서 수동으로 추가한 `.attrMand` 내부 span 코드가 있다면 최신 모듈의 처리로 대체할 수 있습니다.
이번 수정은 검증/버튼 동작을 변경하지 않습니다.

분류 아이콘이 로딩 후 빨간 X로 바뀌는 현상은 별도 확인 중입니다.
확인한 R2024x setFacetValidation 및 대화상자 상태 집계에는 직접 아이콘을 바꾸는 코드가 없었습니다.
탭 제목/클래스 섹션/필드 오류 중 어느 위치인지와 실제 설치 DOM/스택 확인이 필요합니다.
이 수정은 분류/오류 아이콘을 선택하지 않으며 X를 강제로 숨기거나 원래 아이콘으로 덮어쓰지 않습니다.
