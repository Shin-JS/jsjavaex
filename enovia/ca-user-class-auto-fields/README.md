# 조직별 클래스 속성 자동 표시 — OOTB 변경 조각

새 Change Action 화면에서 현재 사용자가 선택한 권한 문맥의 조직으로 클래스를 결정하고, 검색창 없이 해당 클래스의 속성과 입력 필드를 속성 탭에 표시합니다. 기존 분류 모델·입력 폼·postCreation을 활용하는 move 방식입니다.

**전체 OOTB 파일 교체용이 아닙니다.** 각 파일의 주석에 적힌 factory 안에 추가 함수와 호출만 적용합니다. 새 AMD 모듈을 등록하지 않습니다. 기존 ca-isolated-kit의 검색창 방식과 별도로 적용하는 방식입니다.

## 파일과 적용 위치

| 파일 | 수정할 OOTB 모듈 | 역할 |
|---|---|---|
| [ENONewWidget.js](webapps/ENONewWidget/ENONewWidget.js) [1] | ENONewFacetHelper | 위젯/타입 조건, 조직 매핑, 대화상자별 세션 |
| 같은 파일 [2] | ENOListViewFacet | 검색 UI 없는 폼 영역, 폼 이동·복원, 속성 검증 |
| 같은 파일 [3] | ENONewDialogController | 준비 전 생성 차단과 종료 |
| [ClassificationsFacet.js](webapps/ClassificationsFacet/ClassificationsFacet.js) [1] | PLMNewClassificationFacet | 컨트롤러 준비, 클래스 조회와 자동 선택 |
| 같은 파일 [2] | PLMNewCommomCmpUXController | 자동 대상 모델에 세션 표식 부착 |
| [ClassificationProp.js](webapps/ClassificationProp/ClassificationProp.js) | ClassifPropController | 실제 속성 응답·폼 반영 뒤 완료 통지 |
| [ENOChgGovernance.html](webapps/ENOChgGovernanceUX/ENOChgGovernance.html) | 대상 위젯 전용 onLoad | 활성화, 적용 타입, 조직별 클래스 ID 설정 |

각 소스 첫 주석에 삽입 위치와 기존 코드에서 찾을 지점을 적었습니다. 미니파이된 지역 변수명은 설치 버전마다 다를 수 있습니다. PLMNewCommomCmpUXController 철자는 참조 소스 그대로입니다.

## 실제 조직과 클래스 설정

대상 위젯 전용 onLoad에 다음 형식으로 설정합니다. 이름과 ID는 실제 업무값으로 바꾸세요.

```js
widget.setValue("zcaEnableAutoClassByOrganization", true);
widget.setValue("zcaAutoClassType", "Change Action");
widget.setValue("zcaClassByOrganization", JSON.stringify({
    "ORGANIZATION_NAME": {
        classId: "CLASS_PHYSICALID",
        libraryId: "LIBRARY_PHYSICALID"
    }
}));
```

조직은 표시명이 아닌 SecurityContext의 실제 Organization 이름입니다. 조직 항목을 여러 개 등록할 수 있습니다. 조직 하나에 클래스 하나를 적용합니다. classId는 **General Class의 physicalid**이며 General Library ID이면 거부합니다. libraryId는 선택적인 경로 검사 항목이므로 필요 없으면 생략합니다.

실제 조직명과 클래스 ID는 아직 제공받지 않아 임의의 업무값을 넣지 않았습니다. 매핑 누락·조회 실패 시 메시지를 표시하고 생성을 막습니다. 이 설정 이름들은 이번 코드에서 정의한 옵션이며 OOTB 옵션은 아닙니다.

기존 Change Governance 생성 옵션의 classificationFacet와 isLibrary:true를 유지합니다. subtype을 사용한다면 zcaAutoClassType과 기존 type/typeName/preferedType을 실제 타입명으로 맞춥니다.

## 이전 선택창 방식에서 변경할 호출

기존 zcaAttachBridge(e,a)는 zcaAttachAutoBridge(e,a,i)로 바꿉니다. i는 getFacetList의 세 번째 인자인 settings입니다.

속성 facet의 zcaInstallPropertiesPicker/zcaDestroyPropertiesPicker 호출은 zcaInstallAutoFields/zcaDestroyAutoFields로 바꿉니다. 분류 facet의 연결·종료 호출도 새 소스의 자동 방식으로 바꿉니다. 두 방식의 설치 함수를 함께 실행하지 않습니다.

기존 zcaEnableLibraryInProperties 활성화와 검색창 설치 호출은 제거합니다. 자동 방식에는 zcaOpenClassSelector 수신 함수나 사용자 조회 버튼이 필요하지 않습니다. 기존 함수 선언이 남아 있어도 이전 연결 호출은 제거해야 합니다.

## 조직 취득과 자동 표시 흐름

data.defaultAttributes.SecurityContext.value를 우선 사용하고, 없으면 settings.securityContext를 사용합니다. ctx::Role.Organization.CollaborativeSpace에서 조직을 얻습니다. 사용자의 기본 preferredCredentials를 현재 조직으로 대신 사용하지 않습니다. 따라서 zcaGetCurrentUserParameters가 호출되지 않아도 자동 방식은 실행됩니다.

이름에 점이 포함되어 세 부분으로 해석할 수 없는 문맥은 오류로 처리합니다. 해당 환경에서는 zcaOrganizationFromContext를 구조화된 문맥 정보에 맞춰 수정해야 합니다.

1. 위젯 활성화와 타입을 함께 검사하고 조직 매핑을 읽습니다.
2. 세션을 두 facet에 전달하고 기존 분류 컨트롤러를 기다립니다.
3. OOTB getClassPaths로 클래스의 경로·ID·제목·타입을 조회합니다.
4. OOTB 노드 생성 함수를 사용하고 기존 모델에 넣어 select를 실행합니다.
5. 기존 change 처리가 ClassifPropModel과 속성 폼을 로딩합니다.
6. 실제 폼 반영 완료와 검증 모듈 준비를 확인한 뒤 생성을 허용합니다.

검색창과 찾아보기 버튼은 만들지 않습니다. 내부 AutoComplete 모델은 선택 이벤트와 저장에 필요하므로 유지합니다. 속성 입력 컨트롤과 표시 순서는 OOTB 처리를 사용합니다.

## ClassificationProp에도 완료 호출이 필요한 이유

클래스 선택 완료는 속성 로딩 완료가 아닙니다. 참조 소스의 전역 getAttributesDone 이벤트는 클래스 ID를 충분히 구분하지 않고 실제 폼 반영보다 먼저 발행됩니다.

자동 대상 모델에만 표식을 붙이고 그 모델의 _onCompleteLoadModel 뒤 완료를 알립니다. 다른 모델은 표식이 없어 즉시 반환합니다. 빈 attribute 배열은 정상 완료이고 배열 누락은 오류입니다. 설치 버전의 콜백·응답 형태가 다르면 실제 폼 반영 완료 지점으로 옮겨야 합니다. 완료 호출이 빠지면 타임아웃으로 생성을 막습니다.

## 검증·저장·문맥 변경

onSubmitDialog의 시작에서 준비 상태와 선택한 클래스가 맞는지 검사합니다. 활성 입력에 blur를 호출하고 OOTB AttributesUtils.validateAttributes로 모델을 검증합니다. 실패하면 기존 resetButtons로 버튼/로딩 상태를 복원하고 서버 생성 호출로 넘어가지 않습니다.

검증은 실제 OOTB 모델에 내려온 필수 여부·자료형·범위 메타데이터에 따릅니다. 설치 환경의 값 커밋·필수값 검사와 서버 검증은 확인해야 합니다.

기존 postCreation을 유지합니다. 참조 저장 코드에는 비동기 속성 저장 완료/오류 전파가 완전히 보장되지 않는 부분이 있어 생성 성공 로그만으로 속성이 저장됐다고 판단하면 안 됩니다. 실제 클래스 연결과 값 저장은 통합 확인이 필요합니다.

화면을 연 뒤 타입이나 SecurityContext가 바뀌면 생성을 막고 다시 열도록 안내합니다. 입력값을 지우거나 다른 조직의 클래스를 임의로 적용하지 않습니다. 역할/Collaborative Space 변경에도 같은 정책을 적용합니다.

종료 시 타이머·구독을 해제하고 기존 폼을 원래 부모/순서로 복원합니다. 닫힌 화면의 늦은 응답은 무시합니다. 대상 설정 없는 위젯과 다른 타입에는 세션을 붙이지 않습니다.

## 검증과 참조

[VALIDATION.md](VALIDATION.md)에 통과한 검사와 현장 확인 항목을, [REFERENCES.md](REFERENCES.md)에 참고 소스를 정리했습니다. 최초 검토 기록은 [DESIGN.md](DESIGN.md)에 보존했습니다.

참조 구현은 공개 R2024x 기준입니다. 설치된 2025x/2026x 내부 필드·콜백·응답과 같다고 보장하지 않습니다. 실제 플랫폼에서 실행한 완성 배포본이 아니라 적용 위치를 명시하고 대역 검사한 변경 조각입니다.
