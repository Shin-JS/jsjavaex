# CA 등록창의 제어 객체 기반 속성 구성

2026-11-02 요청 기준입니다. 기존 Searchable=false 방식은 제거했습니다.
현재 작업 범위는 우리 위젯의 sdxECChangeAction **등록창**입니다.
생성 후 조회/수정 화면의 상태별 숨김은 이번 등록창 구현에 포함하지 않습니다.

## 조회 기준과 동작

- 제어 객체 타입: **sdxECAtrributeControl**. 사용자가 지정한 실제 철자(Atrribute)를 사용합니다.
- DB where 조건: sdxECAttributeOrganization=MX AND sdxECAttributeState=CREATE.
- 현재 사용자 인증 Context에서 조회하며 관리자 권한으로 전환하지 않습니다.
- 조회 상태 CREATE는 제어 객체의 기준값입니다. Policy의 실제 초기 상태명을 조회하거나 ECR_CREATE로 치환하지 않습니다.
- Policy 필드는 제어 객체에 정의되지 않았으므로 ECR/ECO별 규칙을 임의로 구분하지 않습니다.
- 조회 목록에 없거나 Read=N인 기본/확장 속성은 숨깁니다.
- 현재 typeinfo에 없는 속성명은 새 입력창을 생성하지 않고 무시합니다.
- 제어 객체가 0개이면 기본/확장 속성을 전부 숨깁니다. 조회 실패와 빈 정상 응답은 구분합니다.
- 이름 중복, 잘못된 순서, Y/N 이외 값은 설정 오류(409)입니다. 다른 규칙을 임의로 선택하지 않습니다.
- 순서는 0~999999999의 정수입니다. 같은 순서는 속성명으로 정렬하여 결과를 고정합니다.
- 제어 대상은 typeinfo의 publicAttributes/extensionAttributes 및 같은 생성 폼에 BL이 추가한 속성 모델입니다.
  Type/SecurityContext 같은 defaultAttributes 제어와 별도 자동 분류 클래스 폼은 대상이 아닙니다.
- 기존 sdxECType과 *Text 저장 보조 필드는 목록에 있어도 계속 숨깁니다. Text 값 복사/조직 자동 채움은 유지합니다.

| 제어 속성 | 의미 |
|---|---|
| sdxECAttributeName | typeinfo의 실제 속성 name. NLS 라벨/객체 name이 아닙니다. |
| sdxECAttributeOrder | 화면 표시 순서. 인터페이스가 달라도 하나의 순서로 정렬합니다. |
| sdxECAttributeOrganization | 현재 MX 고정 |
| sdxECAttributeState | 현재 CREATE 고정 |
| sdxECAttributeRead | Y=표시, N=숨김 |
| sdxECAttributeEdit | Y=편집 허용, N=읽기 전용 |
| sdxECAttributeMandatory | Y=필수 아이콘 표시, N=아이콘 없음 |
| sdxECAttributeMandatoryCheck | Y=필수 빈값 검증, N=빈값 필수 검증 안 함 |

Read=N 및 목록 밖 필드는 프런트의 필수 빈값 검증도 해제합니다. 숨긴 값은 삭제하지 않습니다.
Edit=N과 MandatoryCheck=Y를 함께 지정하면 자동값/기존값이 없을 때 저장이 막힙니다.
MandatoryCheck는 필수 빈값 검증입니다. 자료형·길이·범위·서버 제약과 실제 접근 권한을 해제하는 옵션이 아닙니다.

| Mandatory | MandatoryCheck | 표시 / 검증 |
|---|---|---|
| Y | N | 아이콘만 표시 |
| N | Y | 아이콘 없이 필수 검증 |
| Y | Y | 아이콘 및 필수 검증 |
| N | N | 아이콘 및 필수 검증 없음 |

## API

GET /3dspace/resources/v1/modeler/sdxECCA/attributes/control

본문과 속성명 배열은 보내지 않습니다. 기존 POST /attributes/visibility는 제거했습니다.
CSRF가 필요한 쓰기 작업은 하지 않습니다. WAFData의 인증된 GET에 SecurityContext를 전달합니다.
각 생성 세션/협업공간 문맥에서 다시 조회하며 전역 캐시는 두지 않습니다.

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

기존에 배포한 커스텀 파일을 갱신합니다. **이번 작업을 위한 OOTB JS 수정은 0곳입니다.**
기존 ENONewWidget의 prepareFixedType/installFields/저장 연결은 그대로 사용합니다.

| 파일 | 작업 |
|---|---|
| server/src/com/sdx/ecca/rest/SdxEccaAttributeService.java | 기존 클래스 교체·컴파일·배포 |
| webapps/sdxECCAAutoClass/sdxECCAAutoClass.js | 커스텀 AutoClassService 갱신 |
| webapps/sdxECCAAutoClass/sdxECCAAttributeControl.js | 신규 UI/규칙 적용 모듈 |
| webapps/sdxECCAAutoClass/sdxECCAAttributeControlService.js | 신규 조회 전용 모듈 |

SdxEccaModeler.java의 기존 서비스 등록을 그대로 사용합니다. 새 JPO/JSP/web.xml은 필요 없습니다.
실제 서버 라이브러리로 Java를 컴파일하고 기존 방식으로 배포한 뒤 TomEE를 재시작합니다.
테스트용 java-stubs와 tests는 배포하지 않습니다.

사용자 PC에서 sdxECCAAutoClassService.js라는 이름으로 운영한다면 해당 커스텀 파일에 변경 내용을 반영합니다.
DS/sdxENOChgGovernanceUX/custom/services 구조를 쓴다면 다음 세 경로를 함께 맞춥니다.

1. AutoClassService 안의 require: DS/.../services/sdxECCAAttributeControl
2. AttributeControl의 define과 내부 Service require: DS/.../services/sdxECCAAttributeControlService
3. AttributeControlService의 define

공통 OOTB define 의존성에는 추가하지 않습니다.

기존 설정 sdxECCAAttributeVisibilityUrl과 별도 복사해 둔 sdxECCAScheduleAttributeVisibility/V1~V3 연결은 제거합니다.
기존 sdxECCAAttributeVisibility.js는 더 이상 배포하지 않습니다.
새 URL은 기본값이 있으므로 별도 설정 없이 실행됩니다. 다른 경로가 필요하면 우리 위젯 초기화에서만 지정합니다.

~~~javascript
widget.setValue(
    "sdxECCAAttributeControlUrl",
    "/resources/v1/modeler/sdxECCA/attributes/control"
);
~~~

현재 예제 HTML은 실행 파일 교체본이 아니라 위 설정을 넣을 위치를 설명하는 메모입니다.

## 폼 처리와 저장

1. 기존 prepareFixedType 연결에서 대상 속성을 복제해 일단 숨기고 forUI=true로 모델/값을 보존합니다.
2. 기존 installFields 연결에서 조회 모듈을 로딩합니다. 조회 중에는 생성 준비 완료로 처리하지 않습니다.
3. 응답을 받은 뒤 현재 AttributeModel의 visible/readOnly/mandatory/positionUI만 적용하고 OOTB refresh로 그립니다.
   필수 여부와 인터페이스 때문에 순서가 나뉘지 않도록 제어 속성은 기존 Attributes 구역으로 모읍니다.
4. 필수 아이콘은 별도 표시하고 OOTB mandatory에는 MandatoryCheck를 적용합니다.
5. 현재 view/model 인스턴스에만 BL 갱신/폼 재생성 연결을 둡니다. 전역 prototype은 변경하지 않습니다.
6. 필수 검증은 생성 전과 OOTB/BL/자동 채움 직렬화가 끝난 최종 결과에서도 확인합니다.
7. 창 종료/협업공간 변경 시 연결·DOM 관찰을 정리하고 이전 조회 응답을 버립니다.

설정 조회/모듈 로딩 실패 때는 기본/확장 속성을 숨긴 상태로 오류를 표시하고 생성을 막습니다.
임의의 전체 속성 표시로 복귀하지 않습니다. 다시 열어 재조회합니다.
프런트의 숨김·읽기 전용은 서버 보안 권한을 대체하지 않습니다.

## 검증 및 배포 환경 확인

자동 검사:
- JS 서비스: MX/CREATE 응답 계약, 인증 GET, 3DSpace/tenant, 잘못된 응답/중복/실패/시간 초과/늦은 응답.
- DOM/모델: 목록 밖·Read=N 숨김, Edit=N, 인터페이스 간 순서, 필수 표시/검증 4조합,
  0/false와 null, 최종 직렬화 검증, 값 보존, BL의 미등록 속성 추가, 폼 재생성, 정리/늦은 응답.
- Java: 실제 Jakarta API/JSON/Response로 서비스 컴파일 및 실행.
  인증 Context와 DomainObject DB 접근은 대역입니다. 현재 사용자/정확한 where/8개 selects/정렬/Y/N/오류/정리를 검사했습니다.
- 기존 자동 분류·Text·조직·검색·SecurityContext 회귀 검사, 실제 2025 OOTB 네 묶음의 연결 검사.

실제 ENOVIA DB/UI/저장은 이 실행 환경에서 검증하지 못했습니다.
배포 후 Network의 GET 200과 MX/CREATE 응답, 각 Y/N 조합, 저장,
협업공간 변경, 기존 자동 분류/검색/CO·CR을 확인합니다.

개발자용 DOM 검사에는 linkedom이 필요합니다. 서버/사용자 PC에는 Node 설치가 필요하지 않습니다.

~~~sh
NODE_PATH=/임시/node_modules node tests/test-attribute-control.cjs
node tests/test-attribute-control-service.cjs
node tests/test-runtime-hooks.cjs /2025-원본-폴더
~~~

Java 테스트는 실제 Jakarta JSON API/Parsson, WS-RS API/Response Provider, Servlet API를 클래스패스로 지정하여
server/src, tests/java-stubs, tests/java를 컴파일하고 com.sdx.ecca.rest.AttributeControlTest를 실행합니다.
