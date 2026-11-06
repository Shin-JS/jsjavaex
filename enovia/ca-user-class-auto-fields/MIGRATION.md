# 1단계: ClassificationProp만 추가로 원본 유지

새 실험 브랜치: `feature/ca-classificationprop-untouched-2026`.
정상 확인된 기준 브랜치 `feature/ca-enonewwidget-untouched-2026`와 master는 변경하지 않습니다.
이번 단계에서는 ClassificationsFacet의 F/M을 유지합니다. 두 파일을 동시에 원복하지 않습니다.

## 정상 확인된 기준 버전에서 적용

기준: `de46aa5`의 생성·저장·재조회가 정상인 상태.

1. 현재 AutoClassService와 ClassificationProp.js를 보관하고 생성창을 닫습니다.
2. 커스텀 `sdxECCAAutoClassService.js`만 새 브랜치 버전으로 교체합니다.
3. `ClassificationProp.js`에서 아래 P 연결만 원복합니다. 서버와 같은 릴리스·핫픽스 원본을 기준으로 합니다.
4. **ENONewWidget 원본 / ClassificationsFacet F/M / Governance / CreateService / DataService는 그대로 유지**합니다.
5. 중단점을 해제하고 페이지 전체를 새로고침한 뒤 새 생성창으로 확인합니다.

다른 상태의 서버라면 먼저 정상 확인된 기준 버전을 맞춥니다. 이전 전체 무수정 실험 파일을 섞지 않습니다.
이 저장소에는 공급사 전체 파일 교체본을 제공하지 않습니다. 가이드 메모 전체를 서버 JS로 덮어쓰지 않습니다.

## ClassificationProp에서 제거할 P 연결

대상 AMD factory: `DS/ClassificationProp/facets/Properties/ClassifPropController`.
다른 factory나 다른 업무 코드는 그대로 둡니다.

- P0의 `sdxECCAGetApi`와 `sdxECCAIsClassModelActive` 보조 함수를 제거합니다.
- loadModels 시작의 `if (!sdxECCAIsClassModelActive(t)) return;`를 제거합니다.
- onAttributesLoad 시작의 `if (!sdxECCAIsClassModelActive(i)) return;`를 제거합니다.
- 렌더링 호출 주변의 `prepareAttributes`/`notifyAttributesLoaded`와 그 API 변수·가드를 제거합니다.
  원래 `getListHandle.handle` 정리와 `_onCompleteLoadModel` 호출 및 옵션은 유지합니다.

확인한 R2026x 원본의 해당 호출 조각:

```js
a.getListHandle.handle=null,a._onCompleteLoadModel(r,{initTable:!e,buildBehavior:t?f.FORCE_DEFAULT:f.NO_CHANGES})
```

앞뒤 원본 쉼표/괄호/중괄호를 유지합니다. **메서드나 원본 데이터 변환 코드를 통째로 지우지 않습니다.**
2026 축약 변수는 컨트롤러 a / 클래스 모델 i / 응답 r입니다. 설치본의 변수명이 다르면 원본을 따릅니다.
기준 버전의 전체 P 적용 메모는 이전 브랜치의 `webapps/ClassificationProp/ClassificationProp.js`에 남아 있습니다.

## 내부 동작

기존 ClassificationsFacet F가 세션과 원본 분류 UI를 연결하고 M이 모델에 세션 표식을 붙입니다.
AutoClassService는 클래스 자동 선택 전에 기존 폼 인스턴스를 연결합니다.
지연 생성되는 폼은 원본의 classifAttributeLoaded 이벤트가 발행되기 전에 인스턴스 메서드를 연결합니다.
`prepare → 원래 렌더링 → notify` 순서를 유지하며 공통 prototype·모듈 경로·생성자를 바꾸지 않습니다.
클래스 검색/분류 초기화/번들 로딩을 직접 대체하지 않습니다.

## 이번 단계의 서버 확인

- 자동 클래스 선택, 속성 표시·순서·편집/필수 제어와 추가 정보 펼치기.
- 필수값 누락 시 저장 차단과 입력 후 저장 활성화.
- 생성 후 분류 연결/속성 저장 및 재조회 값 일치.
- 협업공간 변경 후 새 조회, 이전 응답으로 새 폼/준비 상태가 바뀌지 않는지 확인.
- 모델 검색·선택값, Text 복사·policy·EC Type·조직값 처리 회귀.

이 항목이 정상 확인된 뒤에만 다음 ClassificationsFacet 무수정 단계를 검토합니다.

## 되돌리기

문제가 있으면 기준 브랜치 `feature/ca-enonewwidget-untouched-2026`의 AutoClassService와
보관한 정상 ClassificationProp P 수정본을 함께 복구합니다. 다른 파일은 변경하지 않습니다.
master에는 병합하지 않습니다.
