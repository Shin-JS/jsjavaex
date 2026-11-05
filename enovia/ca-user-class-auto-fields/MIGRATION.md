# 생성 진입부 한 곳만 수정하는 구조로 전환

기준일: 2026-11-05. 위젯은 R2026x 소스를 우선 참고합니다.

검토 브랜치: `feature/ca-ootb-entry-only-2026`. 기본 브랜치에는 병합하지 않습니다.
아래 원복은 이 브랜치 버전을 서버에서 시험할 때의 절차입니다.
이 브랜치를 생성/푸시하는 것으로 서버나 기본 브랜치의 파일이 원복되지는 않습니다.

## 최종 파일 구성

| 파일 | 전환 후 |
|---|---|
| ENOChgGovernanceUX.js | 기존 커스텀 유지. G0에서 `entry.launch(options)` 호출 |
| ENONewWidget.js | 우리 자동 분류 연결을 제거한 설치 버전 원본 |
| ClassificationsFacet.js | 우리 자동 분류 연결을 제거한 설치 버전 원본 |
| ClassificationProp.js | 우리 자동 분류 연결을 제거한 설치 버전 원본 |
| custom/services의 커스텀 JS 3개 | 새 버전을 함께 배포 |

이 저장소에는 위 세 OOTB 파일의 교체본을 제공하지 않습니다.
예전 수정 메모도 제거했습니다. 잘못해서 메모 파일을 서버 원본 위에 덮어쓰지 않도록 하기 위함입니다.

## 적용 순서

1. 기존 배포본을 보관하고 열린 생성창을 닫습니다.
2. 서버와 같은 릴리스·핫픽스의 변경 전 파일을 기준으로 아래 연결을 제거합니다.
   다른 업무의 수정이 섞여 있다면 해당 수정은 보존하고 우리 자동 분류 연결만 원복합니다.
3. 커스텀 JS 세 파일을 같은 버전으로 배포합니다.
4. 기존 ENOChgGovernanceUX의 G0에서 CreateService 호출을 아래처럼 변경합니다.
5. 브라우저/위젯 캐시를 갱신하고 새 생성창에서 확인합니다.

기존 G0 내부 호출:

```js
entry.launch(options, function (configuredOptions) {
    return (new Launcher).CreateNew(configuredOptions);
});
```

변경 후:

```js
// 대상 생성창만 전용 상속 엔진을 사용합니다.
entry.launch(options);
```

현재 [생성 진입 메모](webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js)에 반영되어 있습니다.
일반 위젯의 `(new Launcher).CreateNew(options)` 분기와 G2 기본 타입 저장 분기는 유지합니다.

## 원복할 기존 연결

| 원복 대상 | 기존 위치·식별자 |
|---|---|
| ENONewWidget.js | A: getFacetList의 attachBridge, B: prepareFixedType/installFields/updateFacet 문맥 확인/문맥 이벤트/destroyFields, C: Dialog 연결·제출 확인·버튼 상태 보존·dispose |
| ClassificationsFacet.js | F: connectClassification/문맥 provider/새 UI 재생성/disconnectClassification, M: tagClassModel |
| ClassificationProp.js | P: prepareAttributes → 원래 폼 생성 → notifyAttributesLoaded |
| 위 세 파일의 보조 함수 | `sdxECCAGetApi` 및 우리 작업에서 추가한 연결 함수 |

이전 zca 연결이 남아 있으면 같은 기준으로 제거합니다.
다른 기능의 수정까지 전부 되돌리는 작업을 의미하지 않습니다.
`widget.sdxECCARuntime`를 사용하는 예전 연결과 새 상속 구조를 혼합하지 않습니다.

## 2026에서 달라진 문맥 경로

- 속성 폼에 전달되는 `data.model`의 `getSecurityContext()`를 먼저 사용합니다.
- project/organisation/role 선택이 모델 문맥을 바꾸면 새 분류 세션으로 재조회합니다.
- typeInfo와 자격증명 조회의 이전 응답은 세대/현재 모델 문맥을 확인해 무시합니다.
- 재조회한 기본 폼에도 같은 생성 모델을 전달합니다.
- 저장 때 같은 모델 문맥을 검증합니다. legacy SecurityContext 필드를 새로 만들어 넣지 않습니다.

## 설치 후 확인

- 기본 속성·추가 정보 펼치기·분류 입력창·돋보기가 표시되는지 확인합니다.
- 창을 처음 열 때 필수 오류 문구가 일괄 표시되지 않는지 확인합니다.
- 필수값을 채우기 전/후 저장 버튼 상태와 기존 입력 검증을 확인합니다.
- 생성 객체의 policy, Text 복사값, 모델 선택값, 분류 속성값을 확인합니다.
- 문맥 A→B 및 A→B→C→A 전환, 조회 중 종료를 확인합니다.
- 실제 생성 요청 헤더와 객체 협업공간이 최종 선택 문맥과 같은지 확인합니다.
- 일반 위젯과 Change Request/Change Order가 기존 경로로 실행되는지 확인합니다.

자동 검사는 실제 플랫폼 저장 성공을 보장하지 않습니다.
