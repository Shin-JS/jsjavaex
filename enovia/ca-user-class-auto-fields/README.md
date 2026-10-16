# 지정 클래스 자동 표시와 생성 유형 고정 — OOTB 변경 조각

현재 동작은 사용자 부서 조회 없이 **지정한 클래스 하나의 속성 정의와 입력 필드를 속성 탭에 자동 표시**하는 것입니다. 사용자 부서/general type 조회는 소스의 TODO 주석으로 보류했습니다.

유형(Type)은 지정값으로 초기 조회하고, 화면에서는 숨기거나 읽기 전용으로 표시합니다. 기존 분류 폼·모델·postCreation을 활용하는 move 방식입니다. 클래스 속성의 기본값은 OOTB 로딩 결과를 사용하며 다른 업무 객체의 저장값을 복사하지 않습니다.

**전체 OOTB 파일 교체용이 아닙니다.** 파일별 주석의 factory 안에 수정·추가 부분만 적용합니다. 새 AMD 모듈은 만들지 않습니다.

## 설정

대상 커스텀 위젯 전용 onLoad에 넣습니다.

```js
widget.setValue("zcaEnableAutoClassByOrganization", true);
widget.setValue("zcaAutoClassType", "Change Action");
widget.setValue("zcaFixedClassId", "CLASS_PHYSICALID");
widget.setValue("zcaTypeDisplay", "hidden");
```

- `zcaFixedClassId`: 자동 적용할 General Class의 실제 physicalid. General Library ID가 아닙니다.
- `zcaAutoClassType`: 실제 생성할 유형. subtype이면 실제 subtype 이름으로 바꿉니다.
- `zcaTypeDisplay`: `hidden`은 유형 필드를 숨깁니다. `disabled`는 OOTB isReadOnly로 표시하되 편집을 막습니다. 실제 모양은 설치 버전 렌더러에 따라 비활성 드롭다운 또는 읽기 전용 값일 수 있습니다.
- `zcaFixedLibraryId`: 선택적인 라이브러리 경로 검사. 필요한 경우에만 실제 General Library physicalid를 설정합니다.

활성화 옵션 이름 `zcaEnableAutoClassByOrganization`은 이전 연결 호환을 위해 유지했습니다. 현재는 조직 매핑이 아니라 고정 클래스 옵션을 읽습니다. 기존 `zcaClassByOrganization`은 읽지 않습니다. 모두 이번 코드의 커스텀 옵션이며 OOTB 기본 설정명이 아닙니다.

실제 클래스 ID와 유형이 아직 제공되지 않아 임의의 업무값은 넣지 않았습니다. 클래스 ID 누락·조회 실패 시 메시지를 표시하고 생성을 막습니다.

## 변경 파일과 순서

| 파일 | OOTB 모듈/변경 지점 | 역할 |
|---|---|---|
| [ENOChgGovernanceUX.js](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js) | ChgCreateChangeAction, CreateNew 호출 직전 | type/typeName/preferedType을 지정한 유형으로 일치시킴 |
| [ENONewWidget.js](webapps/ENONewWidget/ENONewWidget.js) [1] | ENONewFacetHelper | 대상 위젯/유형 검사, 고정 클래스 읽기, 세션 연결 |
| 같은 파일 [2] | ENOListViewFacet | 모델 생성 전 유형 표시/편집 제한, 검색창 없는 폼 이동·복원 |
| 같은 파일 [3] | ENONewDialogController | 준비·입력값·현재 유형 검증, 생성 차단, 종료 정리 |
| [ClassificationsFacet.js](webapps/ClassificationsFacet/ClassificationsFacet.js) [1] | PLMNewClassificationFacet | 컨트롤러 준비와 지정 클래스 자동 선택 |
| 같은 파일 [2] | PLMNewCommomCmpUXController | 자동 대상 속성 모델에 세션 표식 부착 |
| [ClassificationProp.js](webapps/ClassificationProp/ClassificationProp.js) | ClassifPropController | 실제 속성 응답·폼 반영 뒤 완료 통지 |
| [ENOChgGovernance.html](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) | 대상 위젯 전용 onLoad | 위 설정의 삽입 예시 |

각 파일 첫 주석에 삽입 위치와 원본에서 찾을 코드를 적었습니다. 미니파이된 지역 변수명은 설치 버전에 따라 다를 수 있습니다. PLMNewCommomCmpUXController 철자는 참조 소스 그대로입니다.

기존 Change Governance 생성 옵션의 classificationFacet와 isLibrary:true는 유지합니다. 대상 생성에서 CA_DEF_TYPE 저장을 건너뛰어 다른 화면의 사용자 기본 유형을 바꾸지 않도록 합니다.

## 이전 조직별 자동 방식에서 추가로 바뀐 지점

1. HTML에서 조직 매핑 대신 zcaFixedClassId를 설정합니다.
2. ENOChgGovernanceUX.js의 생성 옵션을 CreateNew 호출 전에 고정하는 함수와 호출을 추가합니다.
3. ENOListViewFacet.init(t)의 `_parent(t)` 뒤, `listview.buildModel(t.data)`보다 앞에 `zcaPrepareFixedType(t.data,t.zcaAutoSession)`을 넣습니다. 화면을 그린 뒤에 넣으면 첫 렌더링에는 적용되지 않습니다.
4. updateFacet에서 호출하는 기존 `zcaCheckAutoFacetContext`도 유형 표시 제한을 다시 적용하도록 수정했습니다.

예전 검색창 이동 방식(ca-isolated-kit)을 사용했다면 zcaAttachBridge는 zcaAttachAutoBridge로, zcaInstallPropertiesPicker/DestroyPropertiesPicker는 새 자동 방식 함수로 바꿉니다. 두 UI 설치 호출을 함께 실행하지 않습니다. 이전 분류 연결·종료 호출도 새 자동 방식으로 바꿉니다.

## 유형을 값만 바꾸지 않는 이유

CreateNew에 전달하는 type/typeName/preferedType을 먼저 설정하여 처음부터 그 유형의 속성 정의를 조회합니다. 이후 유형 필드의 값만 다른 유형으로 덮어쓰지 않습니다. 조회된 Type.value가 고정 유형과 다르면 설정/조회 경로 오류로 처리합니다.

OOTB Type의 range와 persistData에 해당 유형이 실제로 있는지 확인하고, 선택지는 하나로 제한합니다. 원래 persistData의 타입 정의와 기본값은 유지합니다. 유형 필드를 숨겨도 defaultAttributes.Type 정보가 남아 생성 시 사용됩니다.

표시 제한은 OOTB 원본 메타데이터의 `visible`과 `isReadOnly`를 모델 생성 전에 설정합니다. 참조 ENONewAttributeUtil은 isReadOnly를 EditPropAttributeModel.readOnly로 변환합니다. CSS로만 감추거나 DOM의 disabled 속성만 바꾸는 방식은 사용하지 않았습니다.

사용자가 UI를 편집할 수 없더라도 제출 시 현재 Type.valueDB/원본 값이 세션의 고정 유형과 같은지 확인합니다. 클라이언트의 UI 제한은 서버의 타입 권한/업무 검증을 대체하지 않습니다.

## 자동 표시 흐름

대상 위젯/유형 확인 → 고정 클래스 ID 읽기 → 기존 분류 컨트롤러 준비 → OOTB getClassPaths 조회 → OOTB 노드 생성과 select → 원래 change 처리의 속성 모델·폼 로딩 → 폼 이동·검증 준비 → 생성 허용 순서입니다.

검색창과 찾아보기 버튼은 만들지 않습니다. 내부 AutoComplete 모델은 선택 이벤트와 저장에 필요하므로 유지합니다. 클래스 속성의 입력 컨트롤과 정렬은 OOTB 처리를 사용합니다.

선택 완료는 속성 로딩 완료와 다릅니다. 전역 getAttributesDone만으로 판정하지 않고 자동 대상 모델의 _onCompleteLoadModel 뒤 완료를 알립니다. 다른 모델은 표식이 없어 추가 함수에서 즉시 반환합니다. 완료 호출이 빠지면 타임아웃으로 생성을 막습니다.

## 부서 조회를 나중에 연결할 위치

ENONewWidget.js의 zcaAttachAutoBridge 안에서 rule을 결정하는 try 블록에 TODO 주석을 남겼습니다. 향후 general type의 사용자 부서를 조회한 뒤 classId를 결정하는 흐름으로 바꿀 수 있습니다. 현재는 부서/조직 조회를 실행하지 않으며 사용자 기본 조직으로 대체하지 않습니다.

SecurityContext는 기존 조회·생성·저장 권한 문맥으로 계속 사용합니다. 부서 매핑을 보류했다고 권한 문맥까지 제거하는 것은 아닙니다.

## 검증·저장과 알려진 한계

준비 전 생성, 클래스 선택 불일치, 현재 유형 불일치를 onSubmitDialog에서 차단합니다. 활성 입력에 blur를 호출하고 OOTB AttributesUtils로 실제 모델의 속성을 검증합니다. 실패하면 resetButtons로 기존 로딩·버튼 상태를 복원합니다.

기존 postCreation을 유지합니다. **커스터마이징 없는 서버에서도 재현된 ClassificationAttributeUtil.java:95의 분류 속성 저장 오류는 별도로 보류 중이며, 이 변경에서 수정하지 않았습니다.** 자동 표시/유형 제한이 해당 서버 오류를 해결하는 것은 아닙니다. 실제 저장 결과를 확인해야 합니다.

타입이나 SecurityContext가 도중에 바뀌면 입력값을 임의로 지우지 않고 화면을 다시 열도록 안내합니다. 종료 시 구독·타이머를 정리하고 폼을 원래 부모/순서로 돌려놓습니다. 대상 설정 없는 위젯과 다른 유형에는 자동 세션을 붙이지 않습니다.

[VALIDATION.md](VALIDATION.md)에 통과 검사와 현장 확인 항목, [REFERENCES.md](REFERENCES.md)에 참조 소스를 적었습니다. [DESIGN.md](DESIGN.md)는 최초 조직 기준 검토 기록이며 현재 실행 방식과 구분해서 읽습니다.

참조 구현은 공개 R2024x 기준입니다. 설치된 2025x/2026x 내부 구조와 같다고 보장하지 않습니다. 실제 서버·WUX에서 실행한 배포본이 아니라 적용 위치를 명시하고 대역 검사한 OOTB 변경 조각입니다.
