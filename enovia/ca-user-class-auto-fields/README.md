# 지정 클래스 자동 표시 · 유형 고정 — AMD 모듈 분리

기존 추가 함수 17개를 [sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js)의 `define("DS/sdxECCAAutoClass/sdxECCAAutoClass", ...)` 안으로 옮겼습니다. OOTB 파일에는 커스텀 모듈 의존성과 연결 호출만 남깁니다.

이번 작업은 구조 분리입니다. 부서 조회는 주석으로 보류하고, 지정 클래스 자동 적용·유형 숨김/읽기 전용·대화상자별 세션의 기존 동작을 유지했습니다. **현장에서 “지정 클래스 속성을 준비하고 있습니다…”에 머무르던 문제는 해결 완료되지 않았습니다.** 모델 생성/속성 완료 연결 호출을 확인하는 작업이 남아 있습니다. 별도로 보류한 서버 저장 오류도 이번 변경에서 수정하지 않았습니다.

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
| [ENONewWidget.js](webapps/ENONewWidget/ENONewWidget.js) | 기존 OOTB의 세 모듈에 넣을 의존성/인자/호출 변경 메모 |
| [ClassificationsFacet.js](webapps/ClassificationsFacet/ClassificationsFacet.js) | 기존 분류 컨트롤러 연결과 모델 생성 호출 변경 메모 |
| [ClassificationProp.js](webapps/ClassificationProp/ClassificationProp.js) | 실제 속성 로딩·폼 반영 뒤 완료 호출 변경 메모 |
| [ENOChgGovernanceUX.js](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) | CreateNew 전 유형 지정과 사용자 기본 유형 저장 조건 변경 메모 |
| [ENOChgGovernance.html](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) | 대상 위젯의 기존 스크립트에 넣는 설정 예시 |

**sdxECCAAutoClass.js만 새 전체 파일**입니다. 원래 OOTB 파일명으로 된 나머지 JS는 전체 교체용이 아닙니다. 각 파일에 설명한 해당 define의 헤더와 본문 호출만 바꿉니다. 기존 OOTB 모듈명은 유지합니다.

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
| ClassifPropController의 실제 _onCompleteLoadModel 뒤 | `sdxECCAAutoClass.notifyAttributesLoaded(e,t)` |
| ChgCreateChangeAction의 CreateNew 인자 | `sdxECCAAutoClass.configureCreateType(d)` |
| 같은 onSuccess의 기본 유형 저장 조건 | `!sdxECCAAutoClass.isEnabled()` |

변수명은 참조 소스 기준입니다. 문맥/유형 변경 검사와 인스턴스별 문맥 반환도 각 변경 파일의 주석대로 유지합니다.

현재 설치 소스의 onChangeAttribute가 `for(var t in e){var n=e[t];i.publishAttributeInfo(n)}o(e)` 형태이면, [ENONewWidget.js 적용 메모](webapps/ENONewWidget/ENONewWidget.js)의 새 콜백 본문을 사용합니다. `publishAttributeInfo(n)` 앞에서 sdxECCAAutoSession의 문맥/유형 검사를 실행하고, 항목별 발행과 반복문 뒤의 원래 `o(e)` 호출은 유지합니다. 이벤트 키는 New-SecurityContext/New-Type, 실제 값은 n.valueDB 기준입니다. 예전 publishInfo 분기를 함께 넣지 않습니다.

함수를 define으로 옮겨도 연결 호출이 자동 설치되지는 않습니다. 특히 모델 생성 뒤의 tagClassModel과 실제 속성 반영 뒤의 notifyAttributesLoaded는 여전히 OOTB 내부에 넣어야 합니다.

## 기존 로컬 함수 방식에서 옮기기

1. 커스텀 모듈 전체 파일을 webapps/sdxECCAAutoClass/sdxECCAAutoClass.js로 배포합니다.
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
widget.setValue("sdxECCATypeDisplay", "hidden");
```

CLASS_PHYSICALID는 실제 General Class physicalid로 바꿉니다. 자동으로 적용할 유형은 실제 환경에서 지원하는 이름으로 설정합니다. sdxEcChangeAction은 현재 사용자 환경에서 설정한 이름이며 다른 환경에는 해당하지 않을 수 있습니다.

- sdxECCATypeDisplay가 hidden이면 유형을 숨깁니다.
- disabled이면 OOTB isReadOnly로 편집을 막습니다. 실제 모양은 렌더러에 따라 비활성 드롭다운 또는 읽기 전용 값입니다.
- sdxECCAFixedLibraryId를 추가하면 선택한 라이브러리 경로에 해당 클래스가 포함되는지도 확인합니다.
- 활성화 옵션의 ByOrganization 이름은 호환상 유지한 것이며 현재 부서/조직 조회는 실행하지 않습니다.

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

모듈의 정적 의존성은 AMD의 지역 require뿐입니다. AttributesUtils는 화면 설치 때 지연 로드하여 OOTB 모듈과의 정적 의존 순환을 피했습니다. 공유 객체에 현재 세션을 저장하지 않으며, 각 대화상자의 options.sdxECCAAutoSession을 계속 사용합니다.

## 보류 중인 확인과 검증 한계

현장에서는 준비 메시지만 표시되고 네트워크 응답은 있으며, 이전 tag/완료 로그는 없었습니다. 이번 구조에서 다음 확인 지점은 ClassificationsFacet.js의 모델 push 뒤 `sdxECCAAutoClass.tagClassModel(r,o,e)` 호출입니다. 그다음 커스텀 모듈 안의 sdxECCATagAutoClassModel과 sdxECCANotifyAutoClassAttributes에서 실제 진입을 확인합니다.

기존 postCreation을 유지하며 클래스 연결·값 저장을 새로 구현하지 않았습니다. 커스터마이징 없는 서버에서도 발생한 ClassificationAttributeUtil.java:95 오류는 계속 별도 확인 대상입니다.

[VALIDATION.md](VALIDATION.md)에 검사 결과를, [REFERENCES.md](REFERENCES.md)에 기준 소스를 정리했습니다. [DESIGN.md](DESIGN.md)는 최초 조직 기준 검토 기록입니다. 실제 플랫폼 실행과 저장이 검증된 완성 배포본은 아닙니다.
