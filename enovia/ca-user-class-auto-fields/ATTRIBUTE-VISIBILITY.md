# Searchable 설정으로 우리 등록창의 속성 숨기기

지금 정상 동작하는 OOTB 연결 코드는 유지합니다. **새 Java 웹서비스 + 새 커스텀 JS + 기존 커스텀 모듈의 세 위치**만 적용합니다. JSP는 사용하지 않습니다. Node로 소스를 다운로드하거나 조립할 필요도 없습니다.

2025를 기준으로 구현했습니다. 2024 Dictionary 구현에서도 `Indexation` 저장 항목을 비교 확인했습니다. DMC Searchable=true의 `TRUE`, false의 빈 값은 사용자 서버에서 확인한 규칙입니다.

## 1. 새 Java 파일 두 개

두 파일은 새로 만든 커스텀 코드이므로 **전체 내용**을 기존 Java 프로젝트에 추가합니다.

| 추가할 파일 | 역할 |
|---|---|
| [SdxEccaModeler.java](server/src/com/sdx/ecca/rest/SdxEccaModeler.java) | `@ApplicationPath`와 `getServices()`로 서비스 등록 |
| [SdxEccaAttributeService.java](server/src/com/sdx/ecca/rest/SdxEccaAttributeService.java) | 인증된 사용자 Context에서 대상 속성의 Indexation 일괄 조회 |

프로젝트의 소스 루트 아래 위치는 다음과 같습니다.

```text
com/sdx/ecca/rest/SdxEccaModeler.java
com/sdx/ecca/rest/SdxEccaAttributeService.java
```

기존 2025 서버 프로젝트의 클래스패스를 사용해 컴파일합니다. `ModelerBase`, `RestService`, `MQLServices`, `matrix.db.Context`, `jakarta.ws.rs`, `jakarta.json`, `jakarta.servlet`이 필요합니다. 저장소의 `tests/java-stubs`는 검사 대역이므로 서버에 배포하지 않습니다.

기존 배포 방식에 따라 컴파일 결과를 `3dspace/WEB-INF/classes/com/sdx/ecca/rest/`에 배포하거나 커스텀 JAR로 `WEB-INF/lib`에 배포한 뒤 서버를 재시작합니다. 같은 클래스를 두 위치에 중복 배포하지 않습니다. OOTB Java/JPO/JSP/web.xml은 수정하지 않습니다.

등록 구조는 2025의 `ENOattributesmngtmodeler extends ModelerBase` / `getServices()`를 따릅니다. 실제 설치 서버에서 새 Modeler가 등록되는지는 배포 후 확인해야 합니다. 404이면 Java 배포/Modeler 등록부터 확인하며 위젯에서 다른 URL로 우회하지 않습니다.

```text
POST /3dspace/resources/v1/modeler/sdxECCA/attributes/visibility
```

요청 본문은 속성 이름만 담은 JSON 배열입니다. 등록창의 기본/확장 속성명을 JS가 수집하며 타입명이나 typeInfo 전체는 보내지 않습니다.

```json
["sdxECModel", "실제속성명"]
```

응답 예시는 다음과 같습니다. 브라우저 주소창의 GET으로 JSON 본문을 보낼 수는 없습니다. 위젯에서 실행한 POST 요청을 Network에서 확인합니다.

```json
{
    "success": true,
    "type": "sdxECChangeAction",
    "attributes": [
        {"name": "sdxECModel", "searchable": true},
        {"name": "실제속성명", "searchable": false}
    ]
}
```

서버는 요청당 최대 300개 이름을 중복 제거하고, `MQLServices.getPropertiesOfAdminType`에 `name`, `property[Indexation].value`만 요청합니다. 전체 Dictionary 생성, 속성별 HTTP 호출, 관리자 권한 전환은 하지 않습니다. 조회되지 않은 속성은 응답에서 제외합니다. **존재가 확인된 속성의 빈 property**와 **속성 자체가 미조회된 경우**를 구분합니다.

## 2. 새 커스텀 JS 한 개

[sdxECCAAttributeVisibility.js](webapps/sdxECCAAutoClass/sdxECCAAttributeVisibility.js)를 전체 배포합니다.

저장소 기본 구조는 다음과 같습니다.

```text
파일: webapps/sdxECCAAutoClass/sdxECCAAttributeVisibility.js
define: DS/sdxECCAAutoClass/sdxECCAAttributeVisibility
```

사용자님 PC처럼 `sdxENOChgGovernanceUX/custom/services` 구조를 사용한다면 아래처럼 맞춥니다. Java 웹서비스 URL과 AMD 모듈 경로는 서로 다른 항목입니다.

```text
파일: webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAttributeVisibility.js
define: DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAttributeVisibility
```

이 경우 **새 JS의 define 이름**과 아래 V3의 **require 경로**를 둘 다 사용자님 경로로 바꿉니다. 이미 사용 중인 `sdxECCAAutoClassService`의 이름은 유지합니다.

## 3. 기존 커스텀 AutoClassService의 세 위치

수정 대상은 사용자님 PC의 `sdxECCAAutoClassService.js`입니다. 저장소에서는 [sdxECCAAutoClass.js](webapps/sdxECCAAutoClass/sdxECCAAutoClass.js)에 해당합니다. 이 절의 변경 부분만 적용하고 현재 정상 동작하는 파일 전체를 교체하지 않으셔도 됩니다.

### V1 — session.dispose의 정리 코드 뒤에 두 줄 추가

`session.dispose = function ()` 안에서 `session.cleanupObjectSearch`를 검색합니다.

```javascript
// [기존 유지]
if (session.cleanupObjectSearch) session.cleanupObjectSearch();

// [추가 시작]
if (session.unsubscribeAttributeVisibility) {
    session.unsubscribeAttributeVisibility();
}
if (session.cleanupAttributeVisibility) {
    session.cleanupAttributeVisibility();
}
// [추가 끝]

// [기존 유지]
if (session.cancelRequest) session.cancelRequest();
```

### V2 — sdxECCAInstallAutoFields 끝에 한 줄 추가

`sdxECCAInstallAutoFields(facet, options)` 맨 끝의 검색 연결 호출을 찾습니다.

```javascript
// [추가] 바로 아래 검색 연결 호출 앞에 넣습니다.
sdxECCAScheduleAttributeVisibility(facet, session);

// [기존 유지]
sdxECCAScheduleObjectSearch(facet, session);
```

### V3 — 새 연결 함수를 factory 내부에 추가

`sdxECCAScheduleObjectSearch` 함수 선언 바로 앞에 아래 함수를 추가합니다. AMD factory 밖이나 파일 끝의 `});` 뒤에 넣지 않습니다.

```javascript
function sdxECCAScheduleAttributeVisibility(facet, session) {
    if (session.type !== "sdxECChangeAction") return;

    var url = widget.getValue("sdxECCAAttributeVisibilityUrl");
    if (!url) return;

    var started = false;

    function report(error) {
        if (!session.disposed) {
            console.warn(
                "[sdxECCA] 속성 표시 설정을 적용하지 못해 기존 표시를 유지합니다.",
                error
            );
        }
    }

    session.unsubscribeAttributeVisibility = session.subscribe(function (state) {
        var service = state.controller && state.controller.PLMNewCommonWebService;
        if (started || state.disposed || state.status === "error" || !service) return;

        started = true;

        try {
            // 사용자님 PC의 services 경로 기준입니다.
            require([
                "DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAttributeVisibility"
            ], function (Visibility) {
                if (state.disposed || state.status === "error") return;

                Promise.resolve().then(function () {
                    return Visibility.install(facet, state, {
                        url: url,
                        service: service
                    });
                }).then(function (cleanup) {
                    if (state.disposed) {
                        cleanup();
                    } else {
                        state.cleanupAttributeVisibility = cleanup;
                    }
                }).catch(report);
            }, report);
        } catch (error) {
            report(error);
        }
    });
}
```

저장소의 기본 구조를 그대로 배포하시는 경우 V3의 require는 `DS/sdxECCAAutoClass/sdxECCAAttributeVisibility`로 사용합니다.

## 4. Java 배포 후 우리 위젯 설정 추가

기존 커스텀 위젯 HTML의 `widget.setValue(...)`들이 있는 초기화 위치에 한 번만 추가합니다. 공통 HTML에는 추가하지 않습니다.

```javascript
widget.setValue(
    "sdxECCAAttributeVisibilityUrl",
    "/resources/v1/modeler/sdxECCA/attributes/visibility"
);
```

URL 설정이 없으면 새 모듈/웹서비스를 요청하지 않습니다. 일시적으로 기존 표시로 되돌리려면 이 URL을 빈 문자열로 설정하고 생성창을 다시 엽니다.

## 적용 동작과 확인

- 우리 위젯의 세션이 있는 `sdxECChangeAction` 기본/확장 속성에만 적용합니다. 분류 클래스 속성, Type/SecurityContext 같은 기본 제어 모델, 다른 위젯과 CO/CR은 대상이 아닙니다.
- 생성창을 막지 않고 비동기로 적용하므로 조회 완료 전에는 필드가 잠깐 보일 수 있습니다.
- CSRF 조회 뒤 메타데이터 POST를 한 번 실행합니다. 각 요청은 5초 시간 초과를 사용합니다. 이 값은 브라우저 대기 제한이며 서버 쿼리를 강제 종료하는 설정은 아닙니다.
- `searchable: false`로 명시된 필드만 OOTB `addAttributeOnUI`로 숨깁니다. true 응답은 기존에 Text 규칙 등으로 숨긴 필드를 다시 보이게 하지 않습니다.
- 값, 필수 설정, 저장 모델은 유지합니다. 숨긴 필수 속성에 값이 없으면 기존 서버 검증으로 저장이 막힐 수 있습니다. 필수 제약을 임의로 해제하지 않습니다.
- 응답 누락/형식 오류/로그인 오류/조회 실패/시간 초과에는 기존 표시를 유지합니다. 닫힌 생성창이나 타입/문맥 변경으로 오류가 된 세션에는 늦은 응답을 적용하지 않습니다.
- 분류탭을 숨기는 `classification.visible = false`는 제거된 현재 상태를 유지합니다. 검색 타이머를 취소하던 `bindDialog`의 코드도 다시 추가하지 않습니다.

서버 배포 후 Network에서 POST가 빠르게 완료되는지와 false/true 속성 표시, 다른 생성창, 값 보존/저장을 확인합니다. 실제 서버의 처리 시간과 권한은 여기서 검증하지 못했습니다.

## 검사 범위

커스텀 JS의 대상 범위·요청 중복 제거·CSRF·응답 누락/실패 시 표시 유지·기존 값/필수 설정 보존·BL 갱신·지연 응답·세션 정리를 검사했습니다. Java는 실제 Jakarta API/JSON 구현으로 컴파일하고 서비스 흐름을 실행했지만 ENOVIA 인증/DB 호출은 테스트 대역입니다. 실제 2025 원본에 연결한 기존 검증도 수행했습니다. 서버 프로젝트의 실제 플랫폼 라이브러리를 사용한 컴파일, Modeler 등록, 권한, UI 저장은 배포 환경에서 확인해야 합니다.

## 6. 이전 버전에서 배열 수신 방식으로 변경하는 경우

이미 Searchable 조회 버전을 적용하셨다면 아래 두 파일의 변경 부분만 적용합니다. URL, Modeler, 기존 AutoClassService 연결 코드는 그대로 사용합니다.

### Java — readVisibility의 인자와 이름 처리 변경

`SdxEccaAttributeService.java`에서 `String body`를 `List<String> attributeNames`로 바꾸고 `java.util.List`를 import합니다.

```java
public Response readVisibility(
        @jakarta.ws.rs.core.Context HttpServletRequest request,
        List<String> attributeNames) {
```

`Set<String> names = readNames(body);` 한 줄을 같은 위치의 아래 코드로 교체합니다. 이후의 일괄 조회 코드는 유지합니다.

```java
            // 변경: 전달받은 배열의 최소 확인과 중복 제거
            if (attributeNames == null || attributeNames.isEmpty() || attributeNames.size() > 300) {
                return error(400, "INVALID_REQUEST");
            }
            Set<String> names = new LinkedHashSet<String>();
            for (String name : attributeNames) {
                if (name == null || name.trim().isEmpty() || name.length() > 256 ||
                        !name.matches("[\\p{L}\\p{N}_ .:-]+")) {
                    return error(400, "INVALID_REQUEST");
                }
                names.add(name);
            }
```

`readNames(String body)` 메소드는 전체 삭제합니다. 사용하지 않는 `JsonReader`, `StringReader` import도 삭제합니다. `JsonArray`, `JsonString`은 응답 메타데이터 처리에서 사용하므로 유지합니다.

### JS — POST 본문 한 곳 변경

`sdxECCAAttributeVisibility.js`에서 아래 부분을 찾습니다.

```javascript
JSON.stringify({type: session.type, attributes: Array.from(names)})
```

다음으로 교체합니다.

```javascript
// 변경: 속성 이름 배열만 전송
JSON.stringify(Array.from(names))
```

서버와 JS는 함께 적용합니다. 응답 구조와 false일 때만 숨기는 동작은 동일합니다.

`List<String>` 본문 변환은 설치 서버의 JSON Provider가 담당합니다. 배포 후 이 POST가 200인지 확인해야 합니다. 415 또는 MessageBodyReader 오류가 발생한다면 서버의 JSON Provider 등록을 확인합니다. 로컬 검사는 Java 메소드에 List를 직접 전달하는 단위 검사이며 실제 HTTP 본문 변환을 검증하지는 않습니다.
