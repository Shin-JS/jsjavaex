# ENONewWidget 원본을 유지하는 구조로 전환

브랜치: `feature/ca-enonewwidget-untouched-2026`. master는 변경하지 않습니다.
이전 `feature/ca-ootb-entry-only-2026`의 전체 무수정 실험과 구분합니다.
위젯 관련 수정 조각은 R2026x 원본 기준입니다. 원본은 서버와 같은 릴리스·핫픽스를 사용합니다.

## 현재 서버가 master 정상 버전인 경우

1. 현재 파일을 보관하고 열린 생성창을 닫습니다.
2. **ENONewWidget.js에서만** 예전 A/B/C 연결을 제거합니다. 아래 복구 기준을 확인합니다.
3. ClassificationsFacet의 F/M과 ClassificationProp의 P 연결은 유지합니다.
   현재 가이드와 대조해 2026 변수·추가 가드·문맥 provider를 갱신합니다. 같은 연결을 중복 추가하지 않습니다.
4. 커스텀 CreateService/AutoClassService/DataService 세 파일을 이 브랜치 버전으로 함께 교체합니다.
5. Governance G0에서 `entry.launch(options, callback)`을 `entry.launch(options)`로 갱신합니다.
   G1/G2는 현재 메모를 따릅니다. 일반 위젯 Launcher와 2026 setDialogEventForLoader는 유지합니다.
6. 중단점을 해제하고 페이지 전체를 새로고침해 새 생성창으로 확인합니다.

## 현재 서버가 이전 전체 무수정 실험 버전인 경우

1. ENONewWidget.js는 원본 상태를 유지합니다.
2. ClassificationsFacet/ClassificationProp에 F/M/P 연결을 복구합니다.
   같은 버전의 변경 전 원본 기준으로 가이드 조각을 적용하거나 정상 배포본의 연결과 대조합니다.
3. 커스텀 세 파일을 이 브랜치 버전으로 함께 교체합니다. CreateService만 바꾸면 안 됩니다.
4. Governance G0의 `entry.launch(options)`는 그대로 사용합니다. 기존 G1/G2도 유지합니다.
   분류 facet 옵션을 임시로 바꿨다면 원래 CA 옵션(isBookmark/isLibrary=true)과 대조해 복원합니다.
5. 중단점을 해제하고 페이지 전체를 새로고침합니다.

## ENONewWidget 복구 기준

| 예전 연결 | 커스텀 소스로 이동한 위치 |
|---|---|
| A: getFacetList의 attachBridge | Dialog.buildContent에서 helper 결과의 복사본에 적용 |
| B: prepareFixedType/installFields/문맥·타입 확인/정리 | PropertiesFacet 상속 클래스 |
| C: bindDialog/제출 전 검사/버튼 복원/정리 | Dialog 상속 클래스 |

ENONewWidget의 `sdxECCAGetApi`, A/B/C에서 추가한 연결만 제거합니다.
다른 업무 코드가 섞여 있으면 해당 코드는 보존합니다. 공급사 참조 파일 전체를 서버에 덮어쓰지 않습니다.

getFacetList는 앞의 return과 끝의 `, a`가 한 표현식입니다. 원본 데이터 전달까지 지우지 않습니다.
아래는 확인한 R2026x 해당 메서드입니다.

```js
getFacetList: function (e, t, i) {
    var a = [], o = this.getDefaultFacet();
    return o.options.data = e, i.buttons && (o.options.buttons = i.buttons), a.push(o), t && t.forEach((function (e) {
        var t = n.getFacetDefinition(e.name);
        t && (t.options = null != e.facetoptions ? e.facetoptions : {}, i.securityContext && (t.options.securityContext = i.securityContext), i.tenant && (t.options.tenant = i.tenant), a.push(t))
    })), a
},
```

## F/M/P 갱신 시 확인

가이드 메모 전체를 OOTB 파일로 덮어쓰지 않습니다. 각 대상 AMD factory 안에서만 적용합니다.
AMD 의존성 배열/인자는 변경하지 않습니다. 2025 축약 변수를 2026에 그대로 붙이지 않습니다.

- F: 원본 init/북마크·라이브러리 초기화와 postCreation 유지, 세션 연결/문맥별 UI 재생성/종료 연결.
  저장 문맥 provider는 대상 생성창에만 closure로 연결합니다. 전역 문맥 변경으로 기존 생성창 문맥을 바꾸지 않습니다.
- M: R2026x는 `r.classifPropModels.push(n),w.publish(...)`입니다. 소비자 호출 전에 `tagClassModel(r,n,e)`를 넣습니다.
- P: R2026x는 컨트롤러 `a`, 클래스 모델 `i`, 응답 `r`입니다. 기존 `buildBehavior` 옵션을 유지합니다.
  `prepareAttributes → 원본 _onCompleteLoadModel → notifyAttributesLoaded` 순서와 폐기/문맥 전환 가드를 적용합니다.
- 일반 위젯/표식 없는 모델은 원래 코드 경로를 유지합니다.

## 서버 확인

- 기본/추가 정보 펼치기와 속성 표시·순서·편집/필수 제어.
- 자동분류 클래스 선택, 분류 필드 입력, 필수 누락 시 저장 차단.
- 생성 후 분류 연결과 분류 속성 값 저장.
- 협업공간 변경 후 재조회와 이전 응답 차단, 최종 생성/분류 저장 문맥 일치.
- 모델 검색·선택값 저장, Text 복사·policy/EC Type·조직값 처리.
- 일반 Change Action 및 Change Request/Change Order 생성 회귀.

서버 복구가 필요하면 master의 정상 배포 파일 세트를 기준으로 합니다. 이 브랜치는 master에 병합하지 않습니다.
