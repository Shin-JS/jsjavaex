# 부서 기준 클래스 조회를 연결하는 이유와 위치

현재 고정 클래스의 속성 필드 표시를 유지하면서, 클래스 ID를 고르는 부분만 교체할 수 있도록 분리했습니다. 실제 로그인 사용자 조회 API, 분류의 General Type 이름, 부서 속성명, 클래스 연결 방식은 아직 확정되지 않았습니다. 부서를 조회하는 척하는 예시 사용자나 추정 API는 실행 코드에 넣지 않았습니다.

## 현재 동작

대상 위젯의 기존 설정 위치에서 `sdxECCAClassRuleMode`를 `fixed`로 두거나 생략하면 `sdxECCAFixedClassId`를 사용합니다. OrganizationProvider의 조회 함수는 실행되지 않습니다. 새 서비스 두 파일은 main의 AMD 의존성이므로 세 파일 모두 배포해야 합니다.

```js
widget.setValue("sdxECCAEnableAutoClassByOrganization", true);
widget.setValue("sdxECCAAutoClassType", "sdxEcChangeAction");
widget.setValue("sdxECCAClassRuleMode", "fixed");
widget.setValue("sdxECCAFixedClassId", "실제 General Class physicalid");
widget.setValue("sdxECCATypeDisplay", "hidden");
```

기존 HTML 최상단 등 실제 실행을 확인한 위치를 유지합니다. 예시의 physicalid 문자열은 실제 값으로 교체해야 합니다.

## 향후 연결할 두 함수

[sdxECCAOrganizationProvider.js](webapps/sdxECCAAutoClass/sdxECCAOrganizationProvider.js)의 두 함수 본문에 실제 서비스 호출을 연결합니다. 서비스용 AMD 의존성이 필요하면 이 파일에서 추가하고 배열/인자의 순서를 맞춥니다. Vue나 OOTB 화면 콜백 안에 서버 조회 코드를 넣지 않습니다.

| 함수 | 입력 | 반환 계약 |
|---|---|---|
| `loadCurrentUser(scope)` | `securityContext`, `tenant` | `{departmentCode: "부서 코드"}` 또는 그 Promise |
| `findDepartmentClasses(request)` | 위 문맥/tenant와 `departmentCode` | `[{departmentCode, classId, libraryId}]` 또는 그 Promise |

로그인 사용자는 서버 세션을 기준으로 식별합니다. SecurityContext에 포함된 Organization 이름이 실제 인사 부서라는 가정은 하지 않습니다. 부서 코드와 General Type의 부서 속성을 같은 기준으로 변환하여 반환합니다. 코드 비교는 앞뒤 공백만 제거하며 대소문자/다른 코드를 임의로 같게 취급하지 않습니다.

`classId`는 General Type 매핑 객체 ID나 라이브러리 ID가 아닌 **자동 선택할 General Class의 physicalid**입니다. `libraryId`는 해당 General Library의 physicalid이며 생략/null이 가능합니다. General Type 객체와 General Class 사이에 별도 관계가 있다면 Provider가 그 관계까지 조회하여 classId를 반환해야 합니다.

조회 결과는 첫 페이지만 보고 하나라고 판단하지 않도록 구현해야 합니다. 조회가 실패하면 reject/throw하며, 오류를 빈 배열로 숨기지 않습니다. 현재 두 함수는 명확한 미구현 오류를 내므로, 연결 전 department 모드로 바꾸면 생성이 차단됩니다.

## 연결 후의 흐름

두 조회 함수를 구현하고 실제 응답을 검증한 뒤에만 설정을 전환합니다.

```js
widget.setValue("sdxECCAClassRuleMode", "department");
```

대화상자별 세션 생성 → 기존 분류 컨트롤러 준비 및 속성 폼 배치 → 사용자 부서 조회 → General Type 부서 값에 따른 클래스 후보 조회 → 동일 부서 후보 한 개 검증 → 기존 getClassPaths/클래스 선택 → 기존 OOTB 속성 폼 로딩 → 생성 검증 순서로 실행합니다.

department 모드는 고정 클래스 ID를 요구하지 않으며 조회 실패 시 고정 클래스로 우회하지 않습니다. 동일 부서 후보가 없거나 여러 개면 오류를 안내합니다. 선택된 클래스가 General Class인지와 선택 라이브러리 경로 검증은 기존 OOTB 조회 결과로 다시 확인합니다.

조회 도중 대화상자를 닫거나 문맥/유형이 변경되면 늦은 응답으로 클래스를 선택하지 않습니다. Provider의 네트워크 요청 자체를 취소하는 기능은 아직 없으며, 응답의 UI 반영을 차단합니다. 사용자/부서 결과를 전역 캐시에 저장하지 않습니다.

## 오늘 확인한 속성 완료 처리

ClassificationsFacet.js에서 모델 생성 직후 `tagClassModel(컨트롤러, 모델, 클래스ID)`를 호출해 모델에 세션을 표시합니다. ClassificationProp.js에서는 실제 폼 반영 뒤 **동일 모델**과 응답으로 `notifyAttributesLoaded(모델, 응답)`를 호출합니다.

현재 설치 소스의 `modelList:[i]`, `onAttributesLoad:function(r)` 구조에서는 다음이 맞습니다.

```js
sdxECCAAutoClass.notifyAttributesLoaded(i, r);
```

`notifyAttributesLoaded(r,e)`로 전달하면 응답을 모델로 읽어 세션을 찾지 못하며 준비 메시지가 계속 표시됩니다. 여기의 축약 변수명은 다른 버전에 그대로 적용하지 않습니다. 세션 속성명은 모두 `sdxECCAAutoSession`입니다.

검증 모듈은 기존 분류 컨트롤러 준비 후 ClassifPropWidget → AttributesUtils 순서로 지연 로드하며 구독 알림당 반복 로드를 막습니다. 문맥 검사에는 옵션 객체 전체 대신 실제 securityContext 문자열을 전달합니다. 조사에 사용한 공유 디버그 모델/컨트롤러 변수는 추가하지 않았습니다.

## 확정이 필요한 정의

실제 구현 연결에는 사용자 부서 조회 경로와 응답 필드, General Type의 정확한 의미/타입명, 부서 속성의 내부 이름, General Class와 연결하는 방식이 필요합니다. 이 정의가 정해지면 Provider 두 함수의 실제 조회를 구현하면 되며 UI 이동/검증 코드를 다시 작성할 필요는 없습니다.

현장에서는 기존 고정 클래스 필드 표시가 확인됐습니다. 이번 서비스 분기의 플랫폼 실행 및 저장 성공까지 확인한 것은 아닙니다. 커스터마이징 없는 서버에서도 재현된 ClassificationAttributeUtil.java:95 저장 오류는 별도 조사 대상입니다.
