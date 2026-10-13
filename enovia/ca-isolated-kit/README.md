# Change Action 하위 타입과 전용 생성 화면 구현 키트

작성일: 2026-10-14. 예시 타입: `ZCA Change Action`. 커스텀 AMD 접두사: `ZCAChangeAction/`.

이 키트는 서버 스키마 생성 예시, 커스텀 생성 화면 코드, 설치된 소스에서 대화상자 모듈 한 개를 분리하는 도구를 제공합니다. 실제 서버에 타입을 생성하거나 위젯을 배포한 상태는 아닙니다. 2024x 공개 소스를 기준으로 작성했고, 현재 설치 버전에서의 통합 검증은 필요합니다. 타입명만 바꾸면 모든 환경에서 즉시 실행된다고 보장하지 않습니다.

## 1. 요구사항과 격리 범위

속성 탭에서도 라이브러리의 클래스를 검색/선택하고, 같은 선택을 기존 분류 탭에 반영합니다. 클래스 속성값은 분류 탭에서 입력합니다. 생성 후 기존 분류 facet의 저장 경로를 활용합니다.

| 대상 | 적용 방식 |
|---|---|
| 기존 `Change Action` 타입 | 부모 정의, 기존 객체, 트리거를 변경하지 않음 |
| 신규 타입 | 부모를 상속한 별도 타입 추가 |
| OOTB JavaScript | 원본 파일과 AMD 정의를 변경하지 않음 |
| 생성 대화상자 | 모듈 하나를 커스텀 ID로 분리하고 helper 의존성만 변경 |
| 속성/분류 facet | 기존 클래스를 상속한 전용 모듈 사용 |
| 선택 상태 | 대화상자별 SelectionSession 생성; 원래 분류 컨트롤러 한 개가 관리 |
| CSS | `.zca-library-picker` 내부에만 적용 |
| CA 기본 타입 사용자 설정 | OOTB CA_DEF_TYPE 설정을 저장/변경하지 않음 |
| 등록 | 별도 위젯 URL과 별도 앱 항목 사용 |

새 타입은 서버 공용 스키마에 존재합니다. 다른 위젯의 하위 타입 목록이나 부모 타입 기반 검색에 나타날 수 있습니다. 이 키트가 보장하도록 설계한 것은 커스텀 UI/모듈 변경의 분리이지, 신규 타입의 서버 전체 비노출이 아닙니다. 목록 노출까지 막으려면 실제 타입 선택/검색 설정을 별도 검토해야 하며, 숨김 설정을 무조건 적용하면 새 위젯도 생성할 수 없을 수 있습니다.

OOTB 분류 유틸리티에는 singleton/provider와 공용 컬렉션이 있습니다. 커스텀 위젯은 자체 iframe 및 RequireJS 실행 문맥에서 실행해야 합니다. 같은 iframe에서 OOTB 생성 화면과 이 커스텀 생성 화면을 동시에 열지 않습니다. Launcher는 전용 생성 화면의 중복 실행을 막습니다. 다른 위젯과 iframe을 공유하는 호스팅이라면 이 상태로 격리가 성립한다고 간주하지 마세요.

## 2. 실제 진행 순서: 먼저 타입만 생성

1. 예시 이름을 프로젝트 접두사/타입명으로 확정합니다. `schema`의 새 타입명과 `Config.js`의 typeName을 동일하게 바꿉니다. AMD 접두사는 이름을 바꾸지 않아도 동작하며, 바꾸려면 모든 참조와 준비 도구를 함께 변경해야 합니다.
2. 관리자 MQL에서 `schema/01-inspect.mql`을 개별 실행합니다. 권한이 없으면 동일 파일을 스키마 담당자에게 전달합니다.
3. 기존 CA 하나에서 실제 policy/vault를 조회합니다. policy 이름을 `Change Action`이라고 단정하지 않습니다. 부모 타입의 상속 속성, 트리거, 접근 조건도 출력으로 확인합니다.
4. 신규 이름이 존재하지 않을 때 `schema/02-create-type.mql`을 실행합니다. 이미 있다면 기존 정의와 비교하고 add를 반복 실행하지 않습니다.
5. 필요할 때만 `03-symbolic-name.optional.mql`을 적용합니다. 부모 타입에 property를 추가하는 작업이 아니라 새 타입의 symbolic name 연결입니다.

핵심 타입 생성 명령은 다음과 같습니다.

```mql
add type "ZCA Change Action" derived "Change Action" abstract false;
```

타입 정의에서 부모 속성을 상속하는 것과 CA 애플리케이션에서 지원되는 타입으로 생성 가능한 것은 별개입니다. MQL에서 만들었다는 사실만으로 typeInfo/생성 REST의 처리, 정책 선택, 이름 자동 생성, 검색 인덱스, 국제화까지 모두 구성되지는 않습니다.

기존 정책에 새 타입을 무조건 추가하거나 정책을 무조건 복사하지 않습니다. 정책이 상속 타입을 실제로 허용하는지, CA 생성 서비스가 새 타입을 지원하는지 먼저 확인합니다. 추가 설정이 필요한 경우 설치 버전의 Change Action 확장 절차에 따라 새 타입 대상으로 등록합니다. 타입 허용을 위해 정책 변경이 필요하다면 그것은 공용 서버 설정 변경으로 기록하고 영향 검증을 추가해야 합니다. 이 키트에는 추측한 정책 수정 명령을 넣지 않았습니다.

아직 화면을 수정하기 전에, 개발 환경의 생성 서비스/typeInfo에서 신규 타입이 조회되는지 확인하고 신규 타입의 기본 CA를 한 개 생성해 실제 type/policy/state를 확인하세요. 이 단계가 실패하면 프론트 연결 단계로 넘어가도 해결되지 않습니다.

## 3. 클래스 속성과 타입 속성을 구분

이번 기능의 라이브러리 필드는 DB attribute가 아니라 클래스 선택용 UI입니다. 해당 값을 일반 문자열 attribute로 새 타입에 추가하지 않습니다. 클래스별 속성은 기존 분류 메커니즘이 조회/표시/저장하게 합니다. 별도의 업무 속성을 신규 타입에 넣는 작업은 필요할 때 별도 설계합니다.

‘라이브러리’ UI에서 최종 선택하는 것은 `General Class`입니다. 라이브러리 루트만 고르면 해당 클래스의 속성 모델을 생성할 수 없습니다. 클래스 선택은 다른 객체의 기존 속성값 복사를 뜻하지 않습니다. 속성 필드와 초기값이 만들어지고, 사용자가 분류 탭에서 값을 입력합니다.

## 4. 설치 버전의 소스 한 개를 전용 모듈로 준비

준비 도구는 **사용자 환경에 설치된** `webapps/ENONewWidget/ENONewWidget.js`를 입력으로 받습니다. 공개 저장소의 전체 OOTB 번들을 배포하지 않습니다. 입력을 읽고 새 파일을 만드는 작업이며 원본은 편집하지 않습니다.

요구 도구: Python 3.9 이상, Node.js. Windows에서는 python3 대신 설치된 `python` 명령을 사용할 수 있습니다.

```bash
python tools/prepare_dialog.py "설치소스/ENONewWidget.js" "web/ZCAChangeAction/vendor"
node tools/check_amd.cjs
node tools/test_isolation.cjs
```

생성 결과는 `vendor/DialogController.js`, `vendor/source-manifest.json`입니다. manifest는 원본/출력 SHA-256과 변경 범위를 기록합니다. 준비 도구가 모듈을 찾지 못하거나 문법 검사에 실패하면 그 버전은 수동 대조가 필요합니다. 이름을 억지로 바꾸거나 검사를 우회하지 않습니다.

| 원래 대상 | 전용 연결 |
|---|---|
| ENONewEngine의 controller 선택 | `ZCAChangeAction/Controller` |
| Controller의 dialog 생성 | `ZCAChangeAction/vendor/DialogController` |
| 전용 Dialog의 facet helper | `ZCAChangeAction/FacetHelper` |
| 기본 속성 facet `ENOCreate` | `ZCAChangeAction/PropertiesFacet` |
| 분류 facet `classificationFacet` | `ZCAChangeAction/ClassificationFacet` |

`ENOCreate`와 `classificationFacet`이라는 facet 이름은 기존 인프라의 식별용으로 유지하고, 로딩할 모듈 경로만 전용 경로로 바꿉니다. `ENOTabView`가 기본 facet 이름을 참조하는 부분 때문에 이름까지 임의로 바꾸지 않습니다.

## 5. 기존 커스텀 위젯에 연결

이 키트는 Change Governance 전체를 복제하거나 목록/상세/권한 로직을 새로 구현하지 않습니다. 새로 만든 위젯의 ‘새 CA’ 버튼에서 기존 `ChgCreateChangeAction` 호출을 전용 Launcher 호출로 교체하는 범위입니다.

`web/ZCAChangeAction` 폴더를 별도 정적 경로에 배포합니다. 기존 공용 모듈 파일에 덮어쓰지 않습니다. 현재 커스텀 위젯 HTML에서 설정된 플랫폼 AMD 로더는 그대로 사용하고 다음 경로만 추가합니다.

```javascript
// 아래 URL은 실제 배포 URL로 교체해야 합니다.
require.config({
    paths: {
        ZCAChangeAction: "/3DSpace/custom/ZCAChangeAction"
    }
});
```

이 경로는 예시입니다. 실제 context root, 정적 자원 배포 규칙, 인증 경로에 따라 달라집니다. 별도 도메인에 배포한다면 로딩/CORS 정책도 확인합니다. 특정 파일 서버나 앱 등록 REST 주소를 추정하여 넣지 않았습니다.

버튼 이벤트에서는 다음처럼 호출합니다.

```javascript
require(["ZCAChangeAction/Launcher"], function (Launcher) {
    Launcher.open({
        service: "3DSpace",
        tenant: currentTenant,
        header: { SecurityContext: currentSecurityContext }
    }, {
        onSuccess: function (response) {
            // response.result[0].identifier로 본인 위젯의 목록/상세를 갱신
            refreshMyWidget(response.result[0].identifier);
        },
        onFailure: function (response) {
            console.error("커스텀 CA 생성 실패", response);
        },
        onCancel: function () {}
    }).catch(function (error) {
        console.error(error);
    });
});
```

currentTenant/currentSecurityContext/refreshMyWidget은 현재 위젯에서 가져오거나 구현할 부분입니다. 다른 위젯의 보안 컨텍스트나 window.top의 추측한 값을 사용하지 않습니다. 성공 콜백은 공용 Change Governance 상세 패널을 강제로 열거나 전역 기본 CA 타입 설정을 저장하지 않습니다.

typeName과 preferedType을 모두 신규 타입으로 지정해 생성 조회의 기준을 새 타입으로 둡니다. preferedType 하나만 지정해서 부모 타입 선택지가 그대로 남는 구성을 피합니다. 최종 생성 요청과 생성 객체의 실제 type은 통합 검사에서 반드시 확인합니다.

이 코드는 분류의 라이브러리 기능만 활성화합니다. 기존 생성 화면의 북마크 기능까지 유지하려면 Launcher의 `isBookmark`를 true로 설정하고 함께 검증합니다. IP Export Control 기능이 필요하면 해당 옵션과 권한/화면을 별도로 확인합니다.

## 6. 두 탭의 연결 동작

FacetHelper가 생성 대화상자마다 SelectionSession을 하나 만들고 두 facet 옵션에 같은 참조를 전달합니다. 분류 facet에서 라이브러리 컨트롤러가 준비되면 그 세션에 연결합니다. 속성 facet의 검색 입력창은 세션을 통해 해당 컨트롤러를 사용합니다.

속성 입력창에서 클래스를 선택하면 LibraryAdapter가 클래스 경로를 가져오고, 기존 자동완성 모델에 노드를 넣어 `select()`를 호출합니다. 그 뒤 기존 change 이벤트가 ClassifPropModel 생성과 분류 속성 조회/표시를 처리합니다. 독립적인 두 번째 분류 속성 모델은 만들지 않습니다.

‘찾아보기’는 같은 컨트롤러의 기존 onClickSelector를 호출합니다. 따라서 기존 탐색 UI를 통한 선택도 두 탭에 반영됩니다. 분류 탭에서 선택을 삭제하면 속성 탭의 선택 요약도 갱신됩니다. 속성 탭의 요약은 읽기 전용이며, 선택 삭제는 기존 분류 탭의 입력창에서 수행합니다. 전용 검색 UI는 기본 HTML 입력창과 결과 버튼을 사용하며, OOTB WUXAutoComplete의 외형을 그대로 복제한 것은 아닙니다.

준비 전에는 입력창을 비활성화합니다. alwaysCalled에 의한 백그라운드 facet 생성이 현재 설치 버전에서도 실행되는지 확인해야 합니다. 분류 탭을 열어야만 준비되는 버전이면 해당 버전의 loadFacet 호출 위치를 전용 Dialog에서 보완해야 합니다. 전역 모듈을 수정하는 방식으로 해결하지 않습니다.

검색은 LibraryAdapter에 분리했습니다. 세션별 검색 요청 순번을 두어 늦게 도착한 이전 검색 결과가 현재 화면을 덮지 않도록 했습니다. 클래스 경로 응답이 늦게 도착했을 때 중복 선택도 다시 검사합니다. 대화상자가 파괴되면 타이머/구독을 정리합니다.

분류 컨트롤러 내부 메서드/필드는 공개 확장 API로 보장된 것이 아닙니다. 버전별 확인 항목은 `getClassPaths`, `insertInAutocomplete`, `autocompleteLibrary`, `_model`, `_nodesData`, `getClassPath`, `getClassUsage`, `classifPropertiesUI`입니다. 타입/분류 정책에 따른 사용 가능 클래스 필터도 실제 서버 응답으로 확인해야 합니다.

## 7. 저장 동작과 현재 한계

ClassificationFacet은 기존 postCreation을 상속합니다. 생성된 CA ID로 클래스 연결 후 분류 속성을 저장하는 경로를 재사용합니다. 검색/선택 성공은 클래스 속성 로딩이나 서버 저장 완료를 의미하지 않습니다.

참고 소스의 postCreation은 속성 저장 완료/실패의 대기와 전파를 추가 확인해야 합니다. 따라서 성공 메시지만 보고 끝내지 말고 실제 객체를 재조회하여 분류와 값을 검증하세요. 설치 버전에서 저장 실패가 성공처럼 처리된다면 전용 ClassificationFacet의 postCreation에서 실패 전파를 보완해야 합니다. 생성 후 분류 실패는 이미 CA가 존재하는 부분 실패일 수 있으므로 재시도 때 새 CA를 중복 생성하면 안 됩니다.

현재 키트는 일반적인 신규 생성 후 닫기를 기준으로 합니다. ‘계속 생성/Create Another’, 다이얼로그 내부에서 타입/보안 컨텍스트 변경 후 재구성, 동일 iframe의 다른 생성 대화상자 동시 실행은 지원 검증 범위 밖입니다. 초기 적용에서는 컨텍스트를 확정하고 열며, 바꾸려면 닫고 다시 엽니다. 이러한 동작까지 필요하면 해당 재초기화 경로를 연결해야 합니다.

## 8. 확인 순서와 완료 기준

| 순서 | 확인할 작업 | 통과 기준 |
|---|---|---|
| 1 | 기존 CA 생성/기존 분류 입력을 먼저 기록 | 비교 가능한 기본 동작 확보 |
| 2 | 신규 타입 정의/생성 서비스 확인 | 신규 타입 CA 생성과 정상 정책/상태 확인 |
| 3 | prepare_dialog와 check_amd 실행 | 원본 미변경, 커스텀 AMD ID/의존성 일치 |
| 4 | 전용 생성 화면 열기 | 기본 속성 폼 유지, 속성 탭에 새 입력창 표시 |
| 5 | 분류 탭을 열지 않고 검색/선택 | 컨트롤러 준비, 이후 분류 탭에서 클래스 속성 표시 |
| 6 | 찾아보기로 선택 | 동일 컨트롤러의 기존 선택 이벤트 실행 |
| 7 | 분류 탭에서 선택/삭제 | 속성 탭 요약과 일치; 속성 모델 중복/잔존 없음 |
| 8 | 빠른 검색/중복 클릭 | 이전 응답이 화면을 덮지 않고 중복 클래스가 생기지 않음 |
| 9 | 필수 분류 속성 입력 및 저장 | 분류 연결과 입력한 속성값이 재조회 시 유지 |
| 10 | 필수값 미입력, 분류 저장 실패 | 오류 표시/부분 실패 처리 확인; CA 중복 재생성 없음 |
| 11 | 취소 후 다시 열기 | 이전 선택과 검색 결과가 남지 않음 |
| 12 | 원래 위젯과 커스텀 위젯을 별도 iframe으로 동시 사용 | 서로의 선택/기본 타입/화면에 UI 변경이 전파되지 않음 |
| 13 | 부모 타입 검색/하위 타입 목록 점검 | 신규 타입 노출 범위를 확인하고 요구사항에 부합 |

필수 속성 검증이 기존 postCreation 이전의 생성 단계에서 실행되지 않는 환경이라면, 해당 버전의 분류 facet validation을 전용 facet에 연결해야 합니다. 이 점이 통과되지 않으면 업무용 배포 완료로 판단하지 않습니다.

## 9. 배포와 되돌리기

서버 스키마 변경과 클라이언트 파일 배포를 각각 기록합니다. 새 위젯 URL로 별도 앱을 등록하고 개발 사용자부터 검증합니다. 기존 Change Governance 앱 항목의 URL을 교체하지 않습니다. 런타임 전역 require.config map으로 DS 모듈을 ZCA 모듈로 치환하지 않습니다.

되돌릴 때는 커스텀 위젯의 새 생성 버튼 연결을 이전으로 되돌리고 전용 앱 사용을 중지합니다. 신규 타입으로 생성한 업무 객체는 자동 삭제하지 않습니다. 스키마 삭제는 해당 객체/연결/참조를 확인한 뒤 별도 판단합니다. 이 키트에는 자동 삭제 스크립트를 포함하지 않습니다.

## 10. 근거와 검증 상태

직접 확인한 공개 소스(2024x 표시 저장소의 master 브랜치):

- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENONewWidget/ENONewWidget.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ClassificationsFacet/ClassificationsFacet.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/PLMNewLibraryActive/PLMNewLibraryActive.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js
- https://github.com/Ignim94/R2024x/blob/master/3dspace/webapps/EditPropWidget/EditPropWidget.js

공식 기능 자료(Web PLMNew 기반 변경 생성 대화상자):

- https://3dswym.3dexperience.3ds.com/wiki/3dexperience-platform-user-s-community/enovia-change-manager_UQAd86w9TPuJ-CAkEQvFFg

공개 소스는 현재 설치 버전이나 공식 지원 가능 범위를 보장하지 않습니다. 현재 환경의 OOTB 파일과 비교해야 합니다. 키트 자체의 문법/모듈 연결, 대화상자별 세션 격리, 복제 도구의 원본 미변경은 로컬에서 검증할 수 있습니다. MQL 적용, CA 서비스 호환, 실제 브라우저 UI, 라이선스/권한, 분류 값 저장 및 다른 위젯과의 동시 사용은 대상 환경에서 확인할 항목입니다.
