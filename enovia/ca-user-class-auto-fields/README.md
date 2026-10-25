# 2025 복사·붙여넣기 적용 방식 (2026-10-26)

Node나 빌드 없이 적용하려면 **[수동 적용 안내](isolation-2025/manual/README.md)**를 사용합니다. 미리 생성한 전체 JS, 교체할 CA 진입 모듈, 위젯 설정을 GitHub에서 복사할 수 있습니다. 2025 원본을 기준으로 하며 2024는 비교 참고용입니다.

기존 공통 수정은 동일 버전 원본으로 정리한 뒤 새 방식 하나만 적용합니다. 이번 방식은 공통 CA 진입 모듈에 대상 위젯 옵션을 검사하는 분기만 두고, 생성·분류·속성 처리는 전용 모듈을 사용합니다. 실제 서버 통합 검증은 아직 미완료입니다.

---

# 클래스 자동 표시 · 유형 고정 · 부서 조회 연결 준비

## sdxECModel 돋보기 검색 연동 (2026-10-23)

생성 팝업이 로딩 상태에 머무는 현상 보고 후, 검색 모듈을 main의 필수 AMD 의존성에서
제거했습니다. 기존 폼 초기화를 완료한 뒤 비동기로 버튼을 설치하며, 모듈 로딩/버튼 설치
실패는 콘솔의 `[sdxECCAObjectSearch]` 메시지로 남기고 기존 생성창 초기화를 중단하지 않습니다.
이는 코드에서 확인한 초기화 중단 가능성에 대한 수정이며 실제 서버의 중단 지점은 아직 미확인입니다.
`node tests/test-search-initialization.cjs`로 모듈 누락/설치 예외/종료 후 응답을 검사했습니다.

기존 자동 분류 세션이 적용되는 전용 위젯의 `sdxECChangeAction` 생성창에서
`sdxECModel` 입력 옆에 돋보기 버튼을 추가합니다. `publicAttributes`/`extensionAttributes`의
기존 모델을 사용하므로 검색 선택값은 OOTB 검증·BL·직렬화를 거쳐 생성 요청에 포함됩니다.
문자열 속성값 저장이며 객체 간 relationship을 생성하는 기능은 아닙니다.

이번 배포는 아래 **두 파일을 함께** 적용합니다. 기존 OOTB 연결 위치는 그대로 사용합니다.

- `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js` 교체
- `webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js` 추가

대상 위젯의 기존 설정 위치에서 필요 시 다음을 지정합니다.

```js
widget.setValue("sdxECCAEnableModelSearch", true);
widget.setValue("sdxECCAModelSearchTypes", ""); // 전체 타입. 확정된 실제 타입명으로 제한 가능
widget.setValue("sdxECCAModelSearchValueField", "name"); // 검색 결과의 최상위 문자열 필드
```

버튼은 기본 활성화되며 `false`로 끌 수 있습니다. 검색 대상 타입은 아직 확정되지 않아
기본값은 전체 타입입니다. `sdxECModel`은 속성명이므로 검색 타입명으로 가정하지 않습니다.
타입 제한은 실제 타입명 문자열 또는 배열로 지정합니다. 기본 저장값은 선택 결과의 `name`이며,
실제 응답에서 확인된 `id` 등을 저장하려면 `sdxECCAModelSearchValueField`를 변경합니다.
지정한 필드가 결과에 없으면 값을 바꾸지 않고 안내합니다. 다른 필드로 임의 대체하지 않습니다.
표시값과 저장값은 같은 문자열입니다. 검색 취소 시 기존 입력값을 유지합니다.

`ObjectOpenSearchUtil`을 버튼 클릭 시 로딩하여 단일 선택 6W 검색을 엽니다.
기존 입력은 계속 사용할 수 있고, 검색 실패 안내는 해당 필드 아래에 표시합니다.
숨김/읽기 전용 속성에는 버튼을 붙이지 않습니다. 폼이 다시 생성되면 버튼을 다시 연결하고,
팝업 종료 시 observer·버튼 이벤트·검색 소켓을 정리합니다. 종료/문맥 오류 후의 선택 결과는 무시합니다.
검색 모듈이 참조하는 tenant는 OOTB 그대로 `widget.data.x3dPlatformId`를 사용합니다.
3DDashboard의 검색 서비스/SearchComServer가 준비된 환경이 필요합니다.

검사: `node tests/test-object-search.cjs` 및 기존 auto-fields/class-mandatory/class-code/amd-headers 검사.
실제 서버에서 검색창 표시, 응답의 `name`/`id` 구조, `sdxECModel` 최종 Payload 및 저장값은 미확인입니다.

## 클래스 코드와 활성 상태로 자동 선택 (2026-10-21)

`sdxClassCode`가 정확히 `EC_MX`이고 활성 상태인 `General Class`의 ID를 조회하여
기존 자동 선택·속성 표시 흐름에 전달합니다. Class Attributes의 입력 기본값이 아닌
**클래스 객체 자체의 속성**을 확인합니다. N개 선택은 추가하지 않았습니다.
0건·여러 건·조회 오류는 생성을 막으며 기존 고정 ID로 우회하지 않습니다.
Policy 파라미터와 `typeName = Change Action` 분기는 유지합니다.

**배포할 파일:**

- `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js`
- `webapps/sdxECCAAutoClass/sdxECCAClassAttributeService.js`

대상 위젯의 기존 설정 위치에서 `fixed` 설정이 있다면 아래 설정으로 바꿉니다.

```js
widget.setValue("sdxECCAClassRuleMode", "code");
widget.setValue("sdxECCAClassCode", "EC_MX");
widget.setValue("sdxECCALibraryTitle", "EC Library");
```

code가 현재 기본 모드입니다. 이 모드에는 `sdxECCAFixedClassId`가 필요하지 않습니다.
기존 ID 방식은 명시적으로 `fixed` 모드를 지정할 때만 사용합니다.
**JSP·새 REST 서버·JPO 배포는 필요하지 않습니다.** 현재 위젯에서 사용하는 OOTB API를 호출합니다.

조회 흐름:

1. `POST /resources/IPClassificationReuse/Search/search`에 MQL where 조건
   `type == "General Library" && attribute[Title] == "EC Library"`를 전달합니다.
   제목(`attribute[Title]`)이 정확히 일치하는 루트 라이브러리 하나만 사용하며, 없거나 여러 개이면 중단합니다.
2. 해당 라이브러리를 `root_physicalid`로 지정하고 `rels_to_fetch: ["Subclass"]`,
   `query: 'type == "General Class"'`로 바로 아래 1뎁스 클래스만 조회합니다. 클래스 아래는 탐색하지 않습니다.
3. `select_predicate`에 `physicalid`, `ds6w:type`, `current`, `attribute[sdxClassCode]`를 넣습니다.
   `current === "Active"`이고 코드가 `EC_MX`와 정확히 같은 클래스만 남깁니다.
4. 서버의 `infos.next_start`와 `nhits`로 각 단계의 모든 페이지를 확인합니다.
   조회 범위에서 정확히 1개이면 기존
   getClassPaths → 클래스 필수 설정 조회 → 자동 선택·속성 표시 순서로 진행합니다.

이 API의 query는 서버에서 MQL where로 직접 사용됩니다. `flattenedtaxonomies:...` 같은 검색 엔진
문법을 보내면 `RESULT_FETCH_ERROR`가 발생할 수 있습니다. 또한 root_physicalid를 생략한 호출은
전역 General Class 검색이 아니라 루트 라이브러리 조회입니다. 이 두 계약을 반영했습니다.
조회 범위는 사용자 권한에서 보이고 제목(`attribute[Title]`)이 `EC Library`인 루트 라이브러리 바로 아래 1뎁스 클래스입니다.
라이브러리 제목의 기본값은 `EC Library`이며 `sdxECCALibraryTitle` 설정으로 변경할 수 있습니다.
검색과 반환값 검사는 모두 `attribute[Title]` 기준이며 내부 `name`과는 무관합니다.
이전 `sdxECCALibraryName` 설정도 제목 값으로 해석하여 호환합니다. 새 설정에는 `sdxECCALibraryTitle`을 사용합니다.
다른 라이브러리로 자동 전환하지 않으며 라이브러리 ID를 고정하지도 않습니다.
손자 이하의 클래스는 코드가 일치해도 선택하지 않습니다.
`EC_MX`·`Active` 조건과 1뎁스 범위의 중복 검사는 유지합니다. 오류나 팝업 종료 시 후속 조회를 중단합니다.
페이지가 각각 하나라면 검색 호출 수는 라이브러리 검색 1회 + 해당 라이브러리의 클래스 조회 1회로 총 2회입니다.
이후 선택된 클래스의 경로·필수 설정·속성 조회는 기존대로 진행합니다.

루트 조회의 `RESULT_SETPROCESSING_ERROR` 확인 후, 정렬은 OOTB 기본값인
`order_field: "ds6w:modified"`, `order_by: "desc"`로 맞췄습니다.
유형은 서버가 자동 추가하는 `ds6w:type`으로 통일하여 raw `type`과의 중복 선택을 피합니다.
이 변경이 설치 서버의 오류를 해소하는지는 실제 요청으로 확인해야 합니다.
상태는 번역된 ds6w:status가 아닌 raw `current = Active`로 비교합니다.
권한 문맥과 tenant는 팝업 세션에서 가져오며 다른 팝업의 설정을 공유하지 않습니다.
팝업이 닫히거나 문맥이 바뀌면 이후 페이지를 요청하지 않습니다.
라이브러리/클래스가 많으면 경로 조회 횟수에 따라 로딩 시간이 늘어날 수 있습니다.

검사: `node tests/test-class-code.cjs` 및 기존 auto-fields/class-mandatory/amd-headers 검사를 통과했습니다.
참조 R2024x의 classificationWidgetServices.jar와 libraryrestservices.jar에서
실제 MQL 처리, raw 속성 선택 및 페이지/빈 응답 구조를 확인했습니다.
사용자 설치 서버의 실제 API 응답과 자동 선택·저장은 아직 실행 확인하지 못했습니다.

## Text 접미사 속성 숨김과 저장 전 복사 (2026-10-22)

전용 위젯의 `sdxECChangeAction` 생성 시 `publicAttributes`와 `extensionAttributes`에서
속성 **name**이 대소문자를 구분하여 `Text`로 끝나면 입력 필드를 숨깁니다.
분류 클래스 속성은 대상이 아닙니다. 정의는 삭제하지 않고 `visible:false`, `forUI:true`로
숨긴 모델을 유지하며 조건부 표시와 로컬 기본값 복원은 해제합니다.
복사 전 숨긴 필드의 빈값 검증에 걸리지 않도록 UI의 `mandatory`만 해제합니다.
서버 속성 정의와 원본 필드의 검증은 유지합니다.

같은 속성 그룹에 `Text`를 뺀 이름의 원본이 있으면, OOTB 검증·BL·모델 직렬화가 끝난
`onSubmit` 콜백에서 최신 `value`를 복사합니다. 예: `ECPlanText ← ECPlan`.
표시 라벨 대신 실제 저장 값을 사용하며 빈 문자열·배열·숫자·boolean도 그대로 유지합니다.
대상 항목이 직렬화에서 빠졌으면 추가하고 `modified:true`로 지정합니다.
원본 이름이 없는 Text 속성은 숨기기만 하고, 원본 정의는 있지만 저장 결과에 값이 없으면
초기값으로 대체하지 않고 오류를 표시하여 제출을 막습니다.

Text 처리 자체의 변경 파일은 `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js`입니다.
최신 버전은 위 검색 연동 모듈도 함께 배포해야 합니다. 기존 Policy 처리와 `sdxECType` 고정은 유지합니다.
로컬 대역 검사로 숨김·최신값 복사·빈값·대상 누락 복원·다른 타입 제외를 검증했습니다.
실제 플랫폼에서 팝업 표시와 최종 요청 Payload 및 저장된 속성값 확인은 별도로 필요합니다.

## Payload의 basicAttributes.policy 지정

최신 main 모듈은 `installFields`에서 해당 팝업의 `ENOListView.onSubmit` 콜백을 연결합니다.
기존 BL·검증·`_parseModel`이 끝난 결과를 받은 뒤, 원래 생성 콜백으로 넘기기 직전에
해당 세션의 Policy를 `basicAttributes.policy` 문자열에 반영합니다.
사용자 환경에서 확인한 실제 형태는 `basicAttributes: { policy: "Change Action" }`입니다.
이전에 `attributes.publicAttributes`의 policy 항목을 수정하던 처리는 잘못된 위치여서 제거했습니다.
OOTB `_parseModel`은 basicAttributes를 결과에서 생략할 수 있으므로 원래 데이터의
기본 속성과 직렬화 결과의 기본 속성을 보존해 합친 뒤 policy만 지정합니다.
`createContent`는 이 basicAttributes를 rawTypeInfo에 복사하므로 실제 요청에도 반영됩니다.
기존 검증 실패는 그대로 전달하며 종료한 팝업의 지연 결과는 제출하지 않습니다.
종료 시 원래 메서드를 복원합니다. 기존 `installFields`/`destroyFields` 연결이 있으면
추가 OOTB 수정 없이 최신 `sdxECCAAutoClass.js`를 교체합니다.

## 생성 서비스 typeName 유지

`configureCreateType()`에서 생성 타입이 `sdxECChangeAction`이면 `options.typeName`만
`Change Action`으로 전달합니다. `type`과 `options.preferedType`은 `sdxECChangeAction`을
유지합니다. 이 분기는 저장 성공을 확인했던 설정이며 Policy 파라미터 변경과 함께 유지합니다.
Change Order, Change Request 및 다른 타입은 기존 타입 이름을 그대로 전달합니다.

## sdxECType 고정 및 숨김 (2026-10-21)

생성 Policy는 고정 문자열 대신 파라미터로 받습니다. 대상 위젯의 기존 설정 위치에서
`widget.setValue("sdxECCACreatePolicy", "sdxECR")` 또는
`widget.setValue("sdxECCACreatePolicy", "sdxECO")`를 설정합니다.
기존 `attachBridge(e,a,i)` 호출은 유지할 수 있습니다. 호출부에 Policy 변수가 있다면
`attachBridge(e,a,i,createPolicy)`의 네 번째 인자로 직접 넘길 수도 있으며 직접 인자가 우선합니다.
Policy는 세션 생성 시 복사하므로 열린 대화상자의 값이 다른 호출의 설정으로 바뀌지 않습니다.
미지정 또는 다른 값이면 준비 오류로 알려주며 기본 정책으로 대체하지 않습니다.

전달한 Policy는 `basicAttributes.policy`에 문자열로 지정합니다.
`attributes` 배열에는 policy 항목이나 별도 플래그를 추가하지 않습니다.
타입은 `sdxECChangeAction` 그대로이며
`sdxECType`의 `ECR` 고정·숨김도 유지합니다.
이 변경은 정책 자체나 서버의 타입-정책 연결을 수정하지 않습니다.
실제 생성 요청과 생성된 객체의 Policy 확인은 필요합니다.

활성화한 전용 위젯에서 생성 타입이 정확히 `sdxECChangeAction`이면 `sdxECType`을
`ECR`로 지정하고 입력 필드를 숨깁니다. 기존 `prepareFixedType(data, session)` 연결에서
폼 모델 생성 전에 적용하므로 추가 OOTB 호출은 필요하지 않습니다.
최신 `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js`를 교체합니다.

속성 정의를 배열에서 삭제하지 않고 `value: "ECR"`, `modified: true`,
`isReadOnly: true`, `visible: false`, `forUI: true`로 유지합니다.
R2024x 모델 빌더의 `visible || forUI` 조건을 사용해 숨긴 모델도 생성하며,
이전 로컬 기본값과 조건부 표시 설정은 해당 필드에서 해제합니다.
속성 정의가 없으면 준비 오류로 알려줍니다. 다른 타입에는 적용하지 않습니다.
서버의 타입 정의를 수정하는 기능은 아니며 실제 브라우저 생성 및 저장 확인은 필요합니다.

기존 추가 함수 17개를 [sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js)의 `define("DS/sdxECCAAutoClass/sdxECCAAutoClass", ...)` 안으로 옮겼습니다. OOTB 파일에는 커스텀 모듈 의존성과 연결 호출만 남깁니다.

2026-10-19 현장에서 지정 클래스의 속성 필드가 표시되는 것을 확인했습니다. 완료 알림에는 **클래스 모델과 응답을 이 순서로** 전달해야 합니다. 현재 설치 소스가 `modelList:[i]`, `onAttributesLoad:function(r)`이면 `notifyAttributesLoaded(i,r)`입니다. R2024x 예시의 축약 변수명을 그대로 사용하지 않습니다.

기존 fixed 방식도 명시적 설정으로 지원합니다. 로그인 사용자 부서와 General Type의 부서 값을 매칭하는 department 방식은 Provider 연결 준비 단계이며, **실제 부서 조회 두 함수는 아직 연결하지 않았습니다.** [부서 조회 설명](DEPARTMENT.md)을 참고합니다.

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
widget.setValue("sdxECCAAutoClassType", "sdxECChangeAction");
widget.setValue("sdxECCAClassRuleMode", "code");
widget.setValue("sdxECCAClassCode", "EC_MX");
widget.setValue("sdxECCATypeDisplay", "hidden");
```

자동으로 적용할 유형은 실제 환경에서 지원하는 이름으로 설정합니다. 현재 설정은 sdxECChangeAction입니다.

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


필수 아이콘 중복 보완: 같은 속성 행(.flexLine)에 mandIcon이 여러 개이면 DOM 순서상
맨 앞의 하나만 남기고 뒤의 중복을 제거합니다. 라벨에 mandIcon이 이미 있으면 새 아이콘을
추가하지 않습니다. 분류 탭/헤더 아이콘과 서버 생성 응답은 이 변경에서 처리하지 않습니다.


## 분류 탭의 원래 아이콘 유지

미입력 오류를 분류 탭 제목의 빨간 X로 표시하지 않도록, 커스텀 버튼 연결에서는
`classificationFacet.setFacetValidation` / occurrence.setValidation을 호출하지 않습니다.
facetValidation 값은 실제 검증 결과로 유지하고, 연결한 DialogController의
OOTB `evaluateValidationStatus()`로 생성 버튼 상태만 집계합니다.
필수 검증이나 서버 오류를 무시하거나 유효성 값을 true로 강제하지 않습니다.

추가 적용: [ENONewWidget.js 연결 메모](webapps/ENONewWidget/ENONewWidget.js)의
DialogController `setup()`에서 myDialog 생성 및 footer 구성 완료 후 다음 호출을 넣습니다.

```javascript
sdxECCAAutoClass.bindDialog(o);
```

o는 R2024x setup의 then 콜백이 캡처한 DialogController 변수입니다.
설치 코드의 실제 컨트롤러 변수명으로 바꾸세요. 콜백 내부의 this를 임의로 사용하지 않습니다.
main 파일 교체와 이 연결을 함께 적용하고 화면을 닫았다 다시 여세요.
기존 onSubmitDialog/resetButtons 연결은 유지합니다. 연결 전에도 비활성 상태를 보관하고
bindDialog 시점에 최신 상태를 버튼 집계로 전달합니다.

로컬 대역 및 실제 R2024x 버튼 집계 코드로 검증했습니다. 실제 설치 버전에서의 아이콘 유지는 미확인입니다.


### 필수 아이콘 표시

대상 폼에만 sdxECCAClassFields 클래스를 붙이고 다음 규칙을 대화상자 생성 시 함께 삽입합니다.

```css
.sdxECCAClassFields .flexLine .formLabel .mandIcon {
    font-size: 7px;
    font-family: DSFontIcon;
    color: rgb(234, 79, 55) !important;
}
```

사용자 환경의 정상 OOTB 필수 아이콘에서 확인한 7px / DSFontIcon을 적용합니다.
색상은 사용자 환경의 정상 OOTB 아이콘에서 확인한 rgb(234, 79, 55)를 대상 폼에만 적용합니다. 필수 여부와 버튼 상태는 변경하지 않습니다.
별도 CSS 파일을 배포할 필요 없이 최신 main 모듈에 포함되어 있습니다.
종료 시 삽입한 스타일과 추가한 폼 클래스를 정리합니다.


### bindDialog 초기화 간섭 보완

bindDialog는 setup 콜백 안에서 즉시 OOTB 버튼 갱신을 호출하지 않고 setTimeout(0)으로
현재 초기화 스택이 끝난 뒤 한 번만 연결합니다. 같은 대화상자의 중복/재진입 호출은 무시합니다.
화면 종료 시 아직 실행되지 않은 연결 작업은 취소합니다.
설치 버전에 evaluateValidationStatus가 없으면 준비 상태에 명시적인 오류를 남깁니다.
기존 setup의 bindDialog 위치는 유지하고 최신 main으로 교체하세요.


### 설치 버전의 버튼 집계 함수 사용

사용자 환경에서 확인한 evaluateValidationStatus()만 호출합니다. 커스텀 코드의
disableFormSubmit() 직접 호출과 permanentDisable 직접 변경은 제거했습니다.
필수 검증 결과는 facetValidation에 반영하고 OOTB가 전체 버튼 상태를 집계합니다.
resetButtons 훅으로 재진입하면 중복 집계를 차단합니다. 기존 bindDialog 훅을 유지하고
최신 sdxECCAAutoClass.js를 교체하세요.


