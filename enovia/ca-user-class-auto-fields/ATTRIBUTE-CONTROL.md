# CA 등록창의 제어 객체 기반 속성 구성

2026-11-05: R2026x 위젯 우선, ENONewWidget 원본 + Governance/F/M + P 인스턴스 연결 구조를 사용합니다.
배포와 기존 OOTB 연결 원복은 [전환 안내](MIGRATION.md)를 따릅니다. 속성 제어 규칙은 유지합니다.

2026-11-02 요청 기준입니다. 기존 Searchable=false 방식은 제거했습니다.
현재 작업 범위는 우리 위젯의 sdxECChangeAction **등록창**입니다.
생성 후 조회/수정 화면의 상태별 숨김은 이번 등록창 구현에 포함하지 않습니다.

## 조회 기준과 동작

- 제어 객체 타입: **sdxECAttributeControl**.
- DB where 조건: sdxECAttributeOrganization=MX AND sdxECAttributeState=<JS에서 전달한 상태>.
- 현재 사용자 인증 Context에서 조회하며 관리자 권한으로 전환하지 않습니다.
- JS의 sdxECCAAttributeControlState 값을 state 쿼리 파라미터로 전달합니다. 서버는 상태를 하드코딩하지 않습니다.
  별도 전달이 없는 기존 등록창은 JS에서 CREATE를 기본값으로 사용합니다.
  Policy의 상태를 계산/조회한 호출부는 이 값에 실제 state 이름을 지정합니다.
  각 생성 세션이 상태값을 보관하며 협업공간 변경 후에도 같은 상태로 다시 조회합니다.
- Policy 필드는 제어 객체에 정의되지 않았으므로 ECR/ECO별 규칙을 임의로 구분하지 않습니다.
- 조회 목록에 없거나 Read=N인 기본/확장 속성은 숨깁니다.
- 기본/확장/분류 어느 폼에도 정의되지 않은 속성명은 새 입력창을 생성하지 않고 무시합니다.
- 제어 객체가 0개이면 기본/확장 속성을 전부 숨깁니다. 조회 실패와 빈 정상 응답은 구분합니다.
- 이름 중복, 잘못된 순서, Y/N/X 이외 값은 설정 오류(409)입니다. 다른 규칙을 임의로 선택하지 않습니다.
- 순서는 0~999999999의 정수입니다. 같은 순서는 속성명으로 정렬하여 결과를 고정합니다.
- 제어 대상은 typeinfo의 publicAttributes/extensionAttributes, 같은 폼에 BL이 추가한 모델,
  자동 선택된 Classification의 속성 폼입니다. Type/SecurityContext 같은 defaultAttributes는 기존 처리를 유지합니다.
- 기본 폼은 OOTB의 기본 영역/추가 정보(ExtensionsFacet, 펼치기) 구획을 사용합니다.
  필수 표시 또는 필수 검증 대상은 기본 영역, 일반 속성은 추가 정보에 두고 각 구획 안에서 순서를 적용합니다.
  Classification은 기존 분류 구획과 class ID를 유지하고 해당 폼 안에서 정렬합니다.
- 분류 속성 sdxECPlanCCMAttr은 제어 객체의 sdxECAttributeName=sdxECPlan 규칙을 사용합니다.
  정확히 끝의 CCMAttr만 제외합니다. 실제 분류 속성명·path·ID·저장 값은 변경하지 않습니다.
- 같은 이름의 기본/확장 속성과 분류 속성이 중복되면 분류 속성이 우선합니다.
  기본 속성은 화면에서 숨기고 필수 빈값 검증도 하지 않으며 기존 모델·값은 보존합니다.
  분류 규칙의 Read=N/X이면 분류 속성도 숨깁니다. 기본 속성으로 자동 대체하지 않습니다.
- 제어 응답을 받으면 기본 속성을 표시하며 Edit=Y이면 바로 편집할 수 있습니다.
  분류 목록 도착 후 중복 기본 속성을 숨깁니다. 편집 가능 여부는 Edit 규칙을 사용합니다.
  분류 모델 추가/재생성 시 중복 목록을 다시 계산하며 기본 모델과 입력값은 보존합니다.
- sdxECChangeAction의 Classification에는 제어 객체의 속성별 Mandatory/MandatoryCheck를 적용합니다.
  기존 클래스 전체 필수 플래그 sdxClassAttrMandatory보다 제어 규칙이 우선합니다. 다른 생성 타입은 기존 처리를 유지합니다.
- 기존 sdxECType과 *Text 저장 보조 필드는 목록에 있어도 계속 숨깁니다. Text 값 복사/조직 자동 채움은 유지합니다.

| 제어 속성 | 의미 |
|---|---|
| sdxECAttributeName | 기본 속성은 실제 name, 분류 속성은 끝의 CCMAttr을 제외한 name. NLS 라벨/객체 name이 아닙니다. |
| sdxECAttributeOrder | OOTB 기본/추가 정보 구획 각각의 표시 순서. 분류는 분류 폼 안의 순서. |
| sdxECAttributeOrganization | 현재 MX 고정 |
| sdxECAttributeState | JS에서 전달한 Policy 상태명 |
| sdxECAttributeRead | Y=표시, N/X=숨김 |
| sdxECAttributeEdit | Y=편집 허용, N/X=읽기 전용 |
| sdxECAttributeMandatory | Y=필수 아이콘 표시, N/X=아이콘 없음 |
| sdxECAttributeMandatoryCheck | Y=필수 빈값 검증, N/X=빈값 필수 검증 안 함 |

Read=N/X 및 목록 밖 필드는 프런트의 필수 빈값 검증도 해제합니다. 숨긴 값은 삭제하지 않습니다.
MandatoryCheck는 OOTB 모델의 mandatory에 연결합니다. Edit=N/X인 읽기 전용 필드의 검증 제외 등도 OOTB 동작을 따릅니다.
MandatoryCheck는 필수 빈값 검증입니다. 자료형·길이·범위·서버 제약과 실제 접근 권한을 해제하는 옵션이 아닙니다.

| Mandatory | MandatoryCheck | 표시 / 검증 |
|---|---|---|
| Y | N | 아이콘만 표시 |
| N | Y | 아이콘 없이 필수 검증 |
| Y | Y | 아이콘 및 필수 검증 |
| N | N | 아이콘 및 필수 검증 없음 |

## API

GET /3dspace/resources/v1/modeler/sdxECCA/attributes/control?state=CREATE

본문과 속성명 배열은 보내지 않습니다. 기존 POST /attributes/visibility는 제거했습니다.
CSRF가 필요한 쓰기 작업은 하지 않습니다. WAFData의 인증된 GET에 SecurityContext를 전달합니다.
각 생성 세션/협업공간 문맥에서 다시 조회하며 전역 캐시는 두지 않습니다.
state는 필수이며 최대 128자의 상태명만 받습니다. 누락/빈값/따옴표 등 MQL 표현식 문자는 400으로 거절합니다.
응답의 state가 요청값과 다르면 JS가 적용하지 않습니다.

응답 예:

~~~json
{
    "success": true,
    "type": "sdxECChangeAction",
    "organization": "MX",
    "state": "CREATE",
    "attributes": [
        {"name":"sdxECModel","order":10,"read":true,"edit":true,"mandatory":true,"mandatoryCheck":false},
        {"name":"sdxECOrganization","order":20,"read":true,"edit":false,"mandatory":false,"mandatoryCheck":false}
    ]
}
~~~

서버는 DomainObject.findObjects의 type/where 조건으로 대상 제어 bus만 조회하고 필요한 8개 속성만 select합니다.
응답 최대 1000개를 확인합니다. 객체별 추가 조회, 전체 속성 메타데이터/Indexation 조회는 없습니다.

## 적용할 변경

현재 배포 파일 목록은 [README](README.md)를 기준으로 합니다. **이번 통합을 위한 OOTB 추가 수정은 0곳입니다.**
기존 ENONewWidget의 prepareFixedType/installFields/저장 연결은 그대로 사용합니다.

| 파일 | 역할 |
|---|---|
| server/src/com/sdx/ecca/rest/SdxEccaAttributeService.java | 기존 제어 객체 조회 서비스. 이번 통합에서 변경 없음 |
| webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js C6 | UI/규칙 적용. 이전 AttributeControl 모듈 포함 |
| webapps/sdxENOChgGovernanceUX/custom/services/sdxECCADataService.js S4 | 조회 전용. 이전 AttributeControlService 모듈 포함 |

SdxEccaModeler.java의 기존 서비스 등록을 그대로 사용합니다. 새 JPO/JSP/web.xml은 필요 없습니다.
테스트용 java-stubs와 tests는 배포하지 않습니다.
기존에 서버 Java 서비스를 배포한 환경은 이번 통합 때문에 다시 컴파일할 필요가 없습니다.
새로 설치하는 경우에만 실제 서버 라이브러리로 Java를 컴파일해 기존 방식으로 배포합니다.

별도 AMD 경로로 운영하는 설치본은 통합 파일의 named define과 require 이름을 함께 맞춥니다.
개별 AttributeControl/AttributeControlService 파일은 배포하지 않습니다. 공통 OOTB define 의존성에는 추가하지 않습니다.

기존 설정 sdxECCAAttributeVisibilityUrl과 별도 복사해 둔 sdxECCAScheduleAttributeVisibility/V1~V3 연결은 제거합니다.
기존 sdxECCAAttributeVisibility.js는 더 이상 배포하지 않습니다.
새 URL은 기본값이 있으므로 별도 설정 없이 실행됩니다. 다른 경로가 필요하면 우리 위젯 초기화에서만 지정합니다.

~~~javascript
// 실제 Policy 상태를 구한 호출부에서 생성창을 열기 전에 설정합니다.
widget.setValue("sdxECCAAttributeControlState", "ECR_CREATE");
widget.setValue(
    "sdxECCAAttributeControlUrl",
    "/resources/v1/modeler/sdxECCA/attributes/control"
);
~~~

세션 설정을 직접 전달하는 호출부는 attachBridge의 settings.attributeControlState로도 지정할 수 있습니다.
이 값이 위젯 설정보다 우선합니다. 이미 열린 생성창의 규칙은 해당 세션의 상태를 사용하며,
변경한 위젯 설정은 다음 생성창부터 반영합니다.
현재 예제 HTML은 실행 파일 교체본이 아니라 위 설정을 넣을 위치를 설명하는 메모입니다.

## 폼 처리와 저장

1. 기존 prepareFixedType 연결에서 대상 속성을 복제해 일단 숨기고 forUI=true로 모델/값을 보존합니다.
2. 기존 installFields 연결에서 조회 모듈을 로딩합니다. 조회 중에는 생성 준비 완료로 처리하지 않습니다.
3. 응답을 받은 뒤 현재 AttributeModel의 visible/readOnly/mandatory/positionUI만 적용하고 OOTB refresh로 그립니다.
   기본 폼의 facet은 기본/ExtensionsFacet 구획 규칙에 맞추고 기존 section/form/group은 보존합니다.
   펼치기·접기는 원래 OOTB FormSections/manageAccordion이 처리합니다.
4. 필수 아이콘은 별도 표시하고 OOTB mandatory에는 MandatoryCheck를 적용합니다.
5. 현재 view/model 인스턴스에만 BL 갱신/폼 재생성 연결을 둡니다. 전역 prototype은 변경하지 않습니다.
6. 기본 폼의 원래 onSubmit/검증을 유지하고, 분류는 실제 UIController.validateModels를 호출합니다.
   기본 폼의 규칙 적용/재렌더링 직후 updateValidStatus → onValidActivation으로 버튼을 갱신합니다.
   버튼 판단에는 실제 필드의 오류 상태를 변경하지 않는 임시 대상으로 OOTB validateModels를 실행합니다.
   초기 validateForm 호출은 하지 않으며, 입력/저장 시 오류 표시는 기존 OOTB가 처리합니다.
   별도 빈값 검사와 AttributeControl의 onSubmit 래퍼는 사용하지 않습니다.
7. 기존 prepareAttributes/notifyAttributesLoaded 연결에서 Classification 모델/값을 보존해 대기시킵니다.
   prepareAttributes에서 readOnly를 임의로 true로 바꾸지 않습니다. OOTB가 allAttributeAreRO로
   폼 전체의 편집 가능 여부를 결정하므로, 원래 응답의 readOnly를 보존합니다.
   분류 응답과 규칙 중 어느 쪽이 먼저 도착해도 준비 완료 후 같은 규칙을 적용합니다.
   ClassificationProp의 initData에 FORCE_READWRITE를 전달해 원래 편집 모드로 그립니다.
   필드별 readOnly와 실제 접근 권한은 유지하고, visible을 지원하지 않는 분류 행은 DOM 표시도 제어합니다.
   클래스 ID/facet/저장 모델을 유지하며 분류 재렌더링에도 규칙을 다시 적용합니다.
8. 기본·분류 규칙과 분류 속성 목록이 모두 준비되어야 생성할 수 있습니다.
   창 종료/협업공간 변경 시 두 폼의 연결·DOM 관찰을 정리하고 이전 조회 응답을 버립니다.

설정 조회/모듈 로딩 실패 때는 기본/확장 속성을 숨긴 상태로 오류를 표시하고 생성을 막습니다.
임의의 전체 속성 표시로 복귀하지 않습니다. 다시 열어 재조회합니다.
프런트의 숨김·읽기 전용은 서버 보안 권한을 대체하지 않습니다.

## 검증 및 배포 환경 확인

자동 검사:
- JS 서비스: MX/요청 상태 응답 계약, 인증 GET, 3DSpace/tenant, 잘못된 응답/중복/실패/시간 초과/늦은 응답.
- DOM/모델: 목록 밖·Read=N 숨김, Edit=N, 인터페이스 간 순서, 필수 표시/검증 4조합,
  원래 onSubmit 보존, 제목 안의 별표, 값 보존, BL의 미등록 속성 추가, 폼 재생성, 정리/늦은 응답.
- 실제 OOTB 원본: Properties.initData의 편집 전환/권한 유지와 기본·분류 AttributesUtils의 mandatory 검증.
- Java: 실제 Jakarta API/JSON/Response로 서비스 컴파일 및 실행.
  인증 Context와 DomainObject DB 접근은 대역입니다. 현재 사용자/정확한 where/8개 selects/정렬/Y/N/오류/정리를 검사했습니다.
- 동적 상태(공백 포함)·누락/잘못된 상태·분류 선후 도착/재생성/행 숨김/읽기 전용/필수 표시·검증,
  CCMAttr 접미어 조회·분류 우선 중복 숨김·실제 속성명/기본 값 보존·중복 기본 필수 검증 제외,
  기존 자동 분류·Text·조직·검색·SecurityContext 회귀 검사, 실제 2025 OOTB 네 묶음의 연결 검사.

실제 ENOVIA DB/UI/저장은 이 실행 환경에서 검증하지 못했습니다.
배포 후 Network의 GET 200과 MX/요청 상태 응답, 각 Y/N 조합, 저장,
협업공간 변경, 기존 자동 분류/검색/CO·CR을 확인합니다.

개발자용 DOM 검사에는 linkedom이 필요합니다. 서버/사용자 PC에는 Node 설치가 필요하지 않습니다.

~~~sh
NODE_PATH=/임시/node_modules node tests/test-attribute-control.cjs
node tests/test-attribute-control-service.cjs
node tests/test-class-control-hooks.cjs
node tests/test-runtime-hooks.cjs /2025-원본-폴더
~~~

Java 테스트는 실제 Jakarta JSON API/Parsson, WS-RS API/Response Provider, Servlet API를 클래스패스로 지정하여
server/src, tests/java-stubs, tests/java를 컴파일하고 com.sdx.ecca.rest.AttributeControlTest를 실행합니다.

## Y/N/X 제어값

Read/Edit/Mandatory/MandatoryCheck는 Y, N, X를 허용합니다.
네 항목 모두 X는 N과 동일합니다. 서버는 Y만 true, N/X는 false로 응답하여
기본·분류 폼이 동일한 boolean 규칙을 사용합니다. 네 항목별 N/X 응답 동일성과 전체 X 조합을 검사합니다.

## 초기화 순서 보완 — 2026-11-03

CA의 자동 분류 시작은 실제 라이브러리 컨트롤러(autoComplete/classifPropertiesView/accordeonCon)의
준비 상태만 기다립니다. 분류 선택에 사용하지 않는 occurrence.setValidation 준비와 분리했습니다.
기존 facetValidation/Dialog 집계와 기본·분류 준비 완료 후 저장 조건은 유지합니다.
컨트롤러 연결은 세션당 한 번만 시작하며, 실제 준비 실패 시 누락된 구성요소를 콘솔에 한 번 기록합니다.
제어 응답 선행/분류 응답 선행 모두 검사하며, 기본 폼의 표시를 분류 초기화와 분리했습니다.

## 기본 입력과 OOTB 펼치기 구획 복구 — 2026-11-03

분류 준비 여부를 이유로 기본 속성 전체를 읽기 전용으로 두던 조건을 제거했습니다.
Read=Y, Edit=Y인 일반 필드는 규칙을 받으면 입력할 수 있고, Edit=N/X는 읽기 전용입니다.
모든 필드의 facet/section/form/group을 하나로 덮어쓰던 코드를 제거하여 OOTB 추가 정보 구획을 복구했습니다.
Mandatory 또는 MandatoryCheck가 Y인 항목은 기본 영역에, 둘 다 N/X인 항목은 ExtensionsFacet에 두며,
분류 모델의 facet(class ID)과 원래 section/form/group은 변경하지 않습니다.

실제 2025 EditPropAttributeModel/FormSections/Form 및 ENONewWidget.manageAccordion을 실행하는
검사(test-ootb-control-layout.cjs)에서 구획 분리·구획 내 순서·펼치기 헤더·편집 메타데이터를 확인했습니다.
실제 WUX 입력 컴포넌트와 설치 서버의 최종 화면은 배포 후 확인해야 합니다.
