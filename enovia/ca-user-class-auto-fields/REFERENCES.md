# 참조 소스와 판단 근거

## ENONewWidget만 원본 유지 — 2026-11-05

사용자 지시에 따라 위젯 코드는 private-rag의 `references/enovia-r2026x`를 우선 기준으로 합니다.
R2025x는 호환 경로 확인용, R2024x는 이전 설계와 비교용입니다.
공급사 소스는 이 저장소에 복제하지 않습니다.

| R2026x 참조 파일 | 확인한 blob SHA |
|---|---|
| 3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js | 2e8f017f2471ff3fd657b862f2c4e201f9932906 |
| 3dspace/webapps/ENONewWidget/ENONewWidget.js | 7d7b8caf4dc7feb43cf9851883ddde3eade34ca6 |
| 3dspace/webapps/ClassificationsFacet/ClassificationsFacet.js | 784a202ef4e84bdf42c974dce03c24a626f21e4e |
| 3dspace/webapps/ClassificationProp/ClassificationProp.js | e00ba512f45957a21e37bad935029d29ac93045d |
| 3dspace/webapps/EditPropWidget/EditPropWidget.js | 67f66cbe31bab6939f625d96b0c76b413e93c661 |

R2026x에서 확인한 차이: 생성 모델의 getSecurityContext 기반 저장,
project/organisation/role 자격증명 이벤트, 생성 모델을 전달하는 displayDialog,
refreshDialog의 모델 누락, checkForMandatoryAttributes의 초기 오류 상태 변경입니다.
ENONewWidget의 연결만 전용 상속 클래스에서 보완하고, 분류 두 파일은 master와 같은 F/M/P 연결을 유지합니다.
F/M/P 가이드의 헤더와 축약 변수도 위 R2026x 원본으로 다시 생성하고 적용·실행했습니다.

### 생성 진입 원본 확인 정정

R2026x ENOChgGovernanceUX.js는 빈 파일이 아니라 **1,835,141바이트의 대용량 번들**입니다.
이전 파일 조회 응답의 빈 content를 원본 파일이 비어 있는 것으로 해석한 것은 잘못이었습니다.
Git blob으로 원본 전체를 읽어 ChgCreateChangeAction 모듈을 직접 확인했습니다.
수정 메모의 헤더/함수 인자와 G1/G2 원문을 해당 R2026x 소스에 일치시켰습니다.

- G2 원문은 `let p={};p[n.keys.createKeys.CA_DEF_TYPE]=...saveUserPreference(p)`입니다.
- G1은 `(new e).CreateNew(d)` 뒤에 `t.setDialogEventForLoader()`가 이어집니다.
- context, draft 설정, classificationFacet 옵션, 분석 이벤트, 목록/상세 갱신과 실패/취소 콜백을 유지합니다.
- 원본 생성 모듈에 실제 변경 조각을 적용한 실행 검사로 확인합니다.
- 클래스 필수 플래그의 bus POST도 R2026x ClassificationProp/3DSpaceAjaxRequests.getListOfAttributes와 대조했습니다.

아래 R2024x/R2025x 내용은 이전 조사 기록입니다. 현재 프런트엔드 기준은 위 R2026x 소스와 실행 검사입니다.

## 클래스 코드·활성 상태 조회 (2026-10-21)

API 호출 위치는 [R2024x LibraryEditor.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/LibraryEditor/LibraryEditor.js)의
LibraryEditorWebService._performSearchQuery에서 확인했습니다. HTTP 500 RESULT_FETCH_ERROR 조사 후
다음 참조 JAR의 바이트코드를 추가로 확인하여 서버 계약에 맞췄습니다. 벤더 파일은 이 저장소에 복제하지 않았습니다.

- [classificationWidgetServices.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/classificationWidgetServices.jar), blob `e5d2a547fad2d263f58a1540cc7b920d5e849b28`.
  SearchUtil.listRootContentsToSet/listContentsToSet: query를 MQL where에 그대로 사용합니다.
  루트 조회는 모델의 root types만, root_physicalid 지정 시 Subclass 관계를 한 단계 확장합니다.
  rels_to_fetch를 지정하면 해당 관계만 조회합니다.
  PredicateAttrManager: physicalid/type/current/attribute[...] 등의 raw DB 선택자를 그대로 사용할 수 있습니다.
  ClassificationSearchManager: infos.nhits/nresults/next_start 및 빈 응답 시 results 생략을 확인했습니다.
- [libraryrestservices.jar](https://github.com/Ignim94/R2024x/blob/master/3dspace/WEB-INF/lib/libraryrestservices.jar), blob `1785eddd3a404e44329408b307fd6848d6fc9c2f`.
  LibrarySearchService와 LibraryModelProvider: 루트 유형 General Library, 하위 유형 General Class와 관계 Subclass를 확인했습니다.

설치 서버의 실제 API 실행 및 응답은 추가 확인이 필요합니다.

공개 R2024x 런타임 소스의 해당 모듈을 직접 확인했습니다. 벤더의 공식 확장 API 계약이나 현재 설치 버전의 보증 자료는 아닙니다.

| 원본 | 확인한 부분 |
|---|---|
| [ENONewWidget.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENONewWidget/ENONewWidget.js) | getFacetList, SecurityContext 전달, 문맥/타입 발행, onSubmitDialog/resetButtons/destroy |
| [ClassificationsFacet.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ClassificationsFacet/ClassificationsFacet.js) | getClassPaths/constructPath, 노드·모델 생성, getAttributesDone, postCreation |
| [PLMNewLibraryActive.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/PLMNewLibraryActive/PLMNewLibraryActive.js) | General Class 선택, insertInAutocomplete, 경로/이름 Map, select |
| [ClassificationProp.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ClassificationProp/ClassificationProp.js) | loadModels/onAttributesLoad/_onCompleteLoadModel, ClassifPropModel, AttributesUtils |

검사에 사용한 blob SHA:

- ClassificationsFacet.js: 823f42cd0704aa2eab1dcaee4856c79f6f884053
- PLMNewLibraryActive.js: e0de153899a2ac645cd05c7308e9dfb1bf32dedc
- ClassificationProp.js: 8b5987bbc7751e8c8b4715e144519bd6aabe5039

[Dassault 공식 커뮤니티의 SecurityContext 설명](https://3dswym.3dexperience.3ds.com/post/catia-user-community/ekl-quick-tips-retrieve-security-context-informations_T5jRjfPKQZKvO0At-6t0ew)은 role, organization, collaborative space 분리 형식을 설명합니다. 해당 예제는 EKL이며 위젯 API로 사용하지 않았습니다.

[Dassault CAA 3DSpace REST 문서 미러](https://library.plmcoach.com/caa3dx/win_b64.doc/English/CAA3DSpaceREST/CAAi3DXTa3DSpaceWService.htm)의 SecurityContext 헤더도 같은 구조를 설명합니다.

현재 문맥 취득은 ENONew 기존 데이터/이벤트를 사용합니다. 기본 사용자 문맥 조회를 현재 조직이라고 가정하지 않습니다.

[ca-isolated-kit](../ca-isolated-kit/README.md)의 대화상자별 bridge, 폼 이동·복원을 참고했습니다. 새 폴더는 검색창 없는 자동 방식이며 이전 UI 설치 호출과 동시에 적용하지 않습니다.

## 유형 고정 확인

- ENONewWidget.js의 ENONewServices가 Type에 value/range/rangeNLS/persistData를 구성하는 부분과 ENONewController.onSubmit이 원래 subtype 정의를 선택하는 부분.
- ENONewAttributeUtil._buildAttributesModel이 isReadOnly를 readOnly로, visible을 모델 표시 옵션으로 전달하는 부분.
- [ENOChgGovernanceUX.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js)의 ChgCreateChangeAction.launchCreateChangeActionDialog에서 초기 생성 옵션과 CreateNew(d), 사용자 기본 유형 저장을 확인했습니다. 참조 blob: bca4fca6e283453698ec2579da10c936fb4175d6.

## AMD 분리의 기준

기존 커스텀 함수는 이 저장소의 98b1dc20e812a81ad50bf3a4227536af1dd460ee 커밋을 기준으로 그대로 이동했습니다. OOTB 7개 모듈의 실제 define 헤더를 대조했습니다. ClassificationsFacet의 두 모듈은 CSS 의존성보다 factory 인자가 하나 적어, 커스텀 의존성을 마지막에 놓으면서 CSS 자리 인자 sdxECCACss를 추가했습니다.

커스텀 main의 정적 의존성은 AMD 지역 require와 ClassRuleService/OrganizationProvider/ClassAttributeService입니다. OOTB 모듈들을 정적으로 요구하지 않습니다. 검증은 실제 분류 폼 facet의 UIController.validateModels를 사용하며 별도 로딩하지 않습니다. 이 파일들의 새로운 변경 방식은 현재 README와 OOTB 연결 메모를 따릅니다.

## 설치 소스의 onChangeAttribute 구조 반영

2026-10-19 사용자가 제공한 `e => {for(var t in e){var n=e[t];i.publishAttributeInfo(n)}o(e)}` 콜백을 기준으로 ENOListViewFacet의 적용 조각을 수정했습니다. 기존 publishAttributeInfo 앞에 세션 검사를 넣고, 원래 발행과 콜백 호출 순서를 유지합니다. 이벤트 키와 valueDB는 기존 구조를 가정하며 실제 설치 파일 전체를 확보해 검증한 것은 아닙니다.


2026-10-20 필수 표시 변경 근거: 위 ClassificationProp.js의
`3DSpaceAjaxRequests.getListOfAttributes`(busIDs, attributes/op/read),
`ClassifPropController.loadModels`(분류 응답 → results.data),
`ClassifPropAttributeModel`의 mandatory 변환, Form의 `mandAttr`,
`AttributesUtils`의 MandatoryAttribute 검증을 확인했습니다.
이 소스 확인은 실제 설치 서버에서 해당 클래스의 sdxClassAttrMandatory 응답을 확인한 결과와 구별합니다.


실제 폼 모델 경로 근거: ClassificationsFacet의 classifPropertiesView에 생성한
ClassifPropWidget과 IDCardSkeleton.getFacetContent, ClassifPropController.getModel/editPropertiesUI,
ClassifPropUIController.validateModels → AttributesUtils.validateModels → model.values를 확인했습니다.
ClassificationsFacet의 별도 classifPropertiesUI 보조 인스턴스와 구별합니다.


버튼 상태 근거: R2024x ENONewWidget.js의 ENONewFacetBase.setFacetValidation,
ENOTabView sharedContext.setValidation → refreshValidationStatus,
ENONewDialogController.evaluateValidationStatus/disableFormSubmit/resetButtons를 확인했습니다.
ClassifPropModel의 onChangeAttributes 이벤트를 사용하고 화면 종료 시 removeEvent로 해제합니다.


## sdxECModel 검색 연동 (2026-10-23)

- [ENOXSearchUIController.js](https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENOXSearchUIController/ENOXSearchUIController.js), blob `18e4a1e11da160952f54fab683d4872f88996951`:
  번들 내부 `DS/ENOXSearchUIController/ObjectOpenSearchUtil`의 initialize/launchSearch/destroy와
  in_apps_callback 배열, allowedTypes, multiSel, widget.data.x3dPlatformId 계약 확인.
  ObjectOpenSearchUtil.js라는 별도 파일 경로가 아니라 이 번들에 정의된 AMD 모듈입니다.
- R2024x `ENONewWidget.js`: `ENOListView.propModel`, `_parseModel`의 isModified/valueDB 처리 확인.
- R2024x `EditPropWidget.js`: `getFormSection().getOrganizers()`, `_forms[].fields[]`,
  `_idAttr`와 `.formValue`, TweakerManager._modelChangeValue의 새 AttributeModel 생성 후
  부모 모델 set(identifier, model) 방식 확인. 같은 방식으로 입력 검증과 변경 이벤트를 연결합니다.

참조 저장소 기본 브랜치 main에는 소스가 없으므로 원본은 명시적으로 master에서 조회했습니다.
이는 공개 런타임 소스 대조이며 설치 서버의 검색 서비스/응답 실행 검증은 아닙니다.

## 2026-10-27 검색 선택 전용 자동완성

사용자가 지정한 private-rag의 2025/2024 Route Management와 2025 WUX/속성/6W 검색 모듈을
읽고 대조했습니다. 정확한 경로·blob SHA·실행 검사 및 적용 범위는 [MODEL-SEARCH.md](MODEL-SEARCH.md)에 정리했습니다.
