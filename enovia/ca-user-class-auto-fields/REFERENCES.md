# 참조 소스와 판단 근거

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
