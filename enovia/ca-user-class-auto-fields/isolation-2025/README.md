# 2025 전용 생성 모듈 분리

2025 원본을 기준으로 CA 생성에 필요한 AMD 모듈을 `DS/sdxECCA2025/private/...`에 복제하여 연결합니다. 2024는 비교 참고용이며 빌드 입력으로 지원하지 않습니다.

공통 OOTB 파일 변경, 공통 모듈 이름 재등록, RequireJS 전역 map/paths 변경, `undef`, 공통 prototype 수정은 사용하지 않습니다. 전용 모듈 실패 시 커스텀 생성창만 실패하도록 의존성 경로를 분리합니다. 서버의 type/policy/trigger 같은 데이터 모델 변경을 격리하는 기능은 아닙니다.

## 이전 설치에서 전환

1. 먼저 현재 배포 파일을 백업합니다.
2. 기존에 수정했던 공통 `ENONewWidget.js`, `ClassificationsFacet.js`, `ClassificationProp.js`, `ENOChgGovernanceUX.js`를 **현재 서버와 동일한 2025 릴리스/핫픽스의 원본**으로 복원합니다. 예전 `zca*`/`sdxECCA*` 의존성·호출·함수와 공용 HTML 설정을 남기지 않습니다. 이 단계가 빠지면 과거 공통 의존성의 영향이 남습니다. 2024 파일로 복원하지 않습니다.
3. 아래 빌드 결과를 **새 경로** `3dspace/webapps/sdxECCA2025/sdxECCA2025.js`에 배포합니다. 기존 OOTB 디렉터리에 덮어쓰지 않습니다.
4. 대상 커스텀 위젯의 CA 생성 버튼만 아래 전용 진입점으로 바꿉니다. 공용 `ChgCreateChangeAction`은 수정하지 않습니다. 같은 위젯의 CO/CR 버튼은 기존 진입점을 사용합니다.
5. 배포 환경의 기존 캐시 갱신 절차를 수행하고 대상·일반 위젯을 각각 새로 엽니다.

기존 `ca-isolated-kit`과 `ca-user-class-auto-fields/webapps/{ENONewWidget,ClassificationsFacet,ClassificationProp,ENOChgGovernanceUX}`의 공통 수정 메모는 이전 방식입니다. 이번 방식과 함께 적용하지 않습니다. 기존 커스텀 `webapps/sdxECCAAutoClass`의 다섯 파일은 빌드 입력으로만 사용하고, 실행 시에는 생성된 전용 번들 안의 복제본을 사용합니다.

## 준비할 원본

Node.js 18 이상을 사용합니다. 외부 npm 패키지는 필요하지 않습니다.

임의의 입력 폴더에 다음 **변경 전 2025 파일**을 모읍니다. 각 JS는 `3dspace/webapps/<파일명에서 .js를 뺀 이름>/<파일명>`에 있습니다.

```text
ENONewWidget.js
ClassificationsFacet.js
ClassificationProp.js
EditPropWidget.js
IPClassifyUtil.js
IPClassifyActive.js
PLMNewLibraryActive.js
PLMNewFolderActive.js
ENOChgGovernanceUX.js
classificationAppsRequire_setting.json
```

JSON 원본 위치는 `ClassificationsFacet/assets/classificationAppsRequire_setting.json`입니다.

공급사 소스는 이 공개 저장소에 복사하지 않습니다. 생성물도 공개 GitHub에 올리지 말고 서버 배포에만 사용합니다. 입력 파일을 덮어쓰지 않으며, 알려진 2025 연결 위치가 다르거나 누락되면 결과를 생성하기 전에 빌드를 중단합니다. 모든 2025 핫픽스에서 자동 호환된다는 뜻은 아닙니다.

PowerShell 예시:

```powershell
node .\enovia\ca-user-class-auto-fields\isolation-2025\build.cjs C:\sdx-ca\original-2025 C:\sdx-ca\output
node .\enovia\ca-user-class-auto-fields\isolation-2025\test.cjs C:\sdx-ca\original-2025
```

출력은 `output/webapps/sdxECCA2025/sdxECCA2025.js`와 `output/manifest.json`입니다. Manifest에는 입력 SHA-256, 원래 ID와 전용 ID의 대응, 결과 SHA-256을 기록합니다. 이번에 대조한 2025 원본에서는 187개 모듈이 생성됩니다.

## 대상 위젯의 CA 생성 버튼

대상 위젯의 기존 초기화 위치에만 설정합니다. 공용 HTML에 넣지 않습니다.

```javascript
widget.setValue("sdxECCAEnableAutoClassByOrganization", true);
widget.setValue("sdxECCAAutoClassType", "sdxECChangeAction");
widget.setValue("sdxECCAClassRuleMode", "code");
widget.setValue("sdxECCAClassCode", "EC_MX");
widget.setValue("sdxECCALibraryTitle", "EC Library");
widget.setValue("sdxECCATypeDisplay", "hidden");
widget.setValue("sdxECCACreatePolicy", "sdxECR"); // 실제 생성할 policy
widget.setValue("sdxECCAEnableModelSearch", true);
widget.setValue("sdxECCAModelSearchTypes", ""); // 실제 검색 타입 확정 후 제한
widget.setValue("sdxECCAModelSearchValueField", "name");
```

대상 CA 버튼에서 기존 공용 `launchCreateChangeActionDialog(command)` 호출 대신 아래 함수를 호출합니다. 이전 호출을 동시에 실행하지 않습니다. `command`는 기존 버튼이 넘기던 객체이며, 없으면 생략할 수 있습니다.

```javascript
function launchPrivateChangeAction(command) {
    require(["DS/sdxECCA2025/sdxECCA2025"], function (CreateCA) {
        try {
            CreateCA.launch(command);
        } catch (error) {
            if (command) command.isClickProcessing = false;
            console.error("[sdxECCA2025] 생성창 초기화 실패", error);
            // 대상 위젯의 기존 오류 표시 함수로 error.message를 표시합니다.
        }
    }, function (error) {
        if (command) command.isClickProcessing = false;
        console.error("[sdxECCA2025] 전용 모듈 로딩 실패", error);
        // 공용 CA 생성으로 자동 우회하지 않습니다. 대상 위젯에서 오류를 표시합니다.
    });
}
```

번들이 전용 모듈을 모두 먼저 정의한 뒤 진입점을 해석하므로 전역 RequireJS `bundles` 설정은 필요하지 않습니다. 별도의 이름으로 `CreateCA`를 공용 AMD 모듈에 덮어쓰거나 alias하지 않습니다.

## 유지한 동작과 변경점

- 자동 분류, 필수입력 검증, 타입 고정, `Text` 속성 숨김과 저장 전 복사, policy 전달, 모델 돋보기 검색은 기존 커스텀 모듈을 재사용합니다.
- 분류 탭은 `visible=false`로 버튼만 숨깁니다. `alwaysCalled=true`와 facet 자체는 유지하여 검증·postCreation·분류 저장이 실행됩니다.
- 2025의 `onCreateBtnClick` 이벤트를 유지합니다. 입력 검증 거절 시 `resetButtonLabel()`과 `disableFormInput(false,false,true)`로 복원합니다. 2024의 `resetButtons()`를 추가하지 않습니다.
- 분류 이벤트 관리자, provider, 관련 생성/속성 모델은 전용 ID를 사용합니다. 분류 facet의 문맥도 인스턴스에 저장합니다.
- 공용 CA 기본 타입 설정(`CA_DEF_TYPE`)을 커스텀 생성으로 갱신하지 않습니다.
- 이 전용 진입점은 기존 CA의 Library/Bookmark 설정을 유지합니다. Export Control 생성 기능은 포함하지 않으며, 이를 켜면 전용 초기화를 거부합니다.
- 네트워크·인증·검색·표준 UI와 서버 API는 기존 플랫폼 서비스를 사용합니다. 플랫폼 전체 장애나 서버 데이터 모델 변경의 영향을 차단하는 기능은 아닙니다.

## 검증 범위

`test.cjs`는 실제 입력 원본으로 번들을 만든 뒤 아래를 검사합니다.

- 원본 파일 바이트와 원본 AMD 등록 객체가 변하지 않음.
- 전용 모듈 정의와 내부 의존성이 전용 이름을 사용하며 누락되지 않음.
- 활성화/타입 조건, 팝업별 별도 세션, 분류 탭 숨김과 facet 유지.
- 실제 패치된 2025 submit 함수의 검증 거절·복원 및 성공 시 원래 생성 이벤트 전달.
- 전용 의존성 누락 이후에도 원래 launcher를 실행할 수 있음.
- 실제 원본/전용 이벤트 관리자 간 `getAttributesDone` 구독·발행이 분리됨.
- 2024 형태나 연결 위치 변경을 감지하면 출력 전에 중단함.

이 검사는 브라우저/서버 통합 검사를 대신하지 않습니다. 실제 서버에서 대상 CA 생성·분류 저장·policy·Text 복사·검색을 확인하고, 일반 위젯의 CA 및 다른 객체 생성과 CO/CR 생성을 확인해야 합니다. 복원 전 공통 파일에 어떤 수동 수정이 남아 있는지는 이 생성기가 판단하지 않습니다.
