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
