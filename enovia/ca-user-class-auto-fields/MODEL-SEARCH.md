# sdxECModel — 검색 선택 전용 필드

`sdxECChangeAction` 생성창의 `sdxECModel`은 **선택 사항**입니다. 값을 지정하는 경로는 입력창
아래 자동완성 후보 선택과 돋보기 6W 검색창 선택입니다. 두 경로 모두 검색 대상 타입은
`sdxMTopAssy`로 고정합니다. 키보드 입력·붙여넣기는 검색어일 뿐 저장값이 아닙니다.

## 동작

- 3글자부터 이름/제목으로 후보 조회, 300ms 입력 지연, 단일 선택.
- OOTB `WUXAutoComplete`의 `allowFreeInputFlag:false` 사용.
- 검색 선택 후 입력을 수정하면 선택을 해제하고 저장 모델을 빈 값으로 변경.
- 선택 삭제도 허용. 아무것도 선택하지 않거나 검색어만 입력한 경우 빈 값으로 저장.
- 돋보기 취소/복수 선택/저장 필드 누락/잘못된 타입은 기존의 유효한 선택을 임의로 덮어쓰지 않음.
- 늦은 후보/돋보기 응답은 입력 변경, 선택 삭제, 새 검색창, 문맥 전환, 창 종료 후 무시.
- 기본 OOTB 문자열 tweaker는 숨기고 자동완성 컨트롤로 대체. 폼 재렌더링 시 중복 연결을 막고,
  같은 세션에서 실제 선택한 값은 새 컨트롤에 복원.
- 최종 직렬화에서도 실제 선택한 값 또는 빈 값만 반영. BL/기본값/숨긴 tweaker에 남은 임의 값은
  저장하지 않음. `sdxECModelText`가 같은 그룹에 있으면 기존 Text 복사 규칙이 정제된 값을 복사.
- 검색 모듈/서비스 로딩 실패 시에도 선택 사항은 빈 값으로 저장 가능. 서비스 실패를 유효한 선택으로 처리하지 않음.

기존 `sdxECCAModelSearchValueField`는 유지하며 기본값은 `name`입니다. 타입 제한은 이 기능의
요구사항에 따라 `sdxMTopAssy`로 고정했고, 기존 `sdxECCAModelSearchTypes` 설정도 같은 값으로 갱신했습니다.
`sdxECCAEnableModelSearch=false`를 명시하면 기존처럼 검색 기능과 선택 전용 보완을 적용하지 않습니다.
이미 배포된 Searchable 서비스는 이 기능의 선행 조건이 아닙니다.

## 배포

기존 설치본의 다른 OOTB 블록을 다시 변경할 필요는 없습니다.

1. `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js` 갱신.
2. `webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js` 갱신.
3. 새 파일 `webapps/sdxECCAAutoClass/sdxECCAModelSearchService.js` 배포.
4. 우리 위젯 HTML 설정의 `sdxECCAModelSearchTypes`를 `sdxMTopAssy`로 갱신.

검색 후보 조회 계층은 ModelSearchService,
UI와 선택 상태는 ObjectSearch, 최종 저장값 검증은 AutoClass로 분리했습니다.
공통 ENORouteMgmt 서비스/Bootstrap 인스턴스를 재사용하거나 전역 자격증명을 변경하지 않습니다.

## 참조한 소스

사용자가 지정한 `Shin-JS/private-rag`의 저장된 두 버전을 읽었습니다. 원본 코드를 이 공개
프로젝트에 복사하지 않고, 컴포넌트/검색/모델 변경 계약을 참고해 커스텀 모듈을 작성했습니다.

| 버전·경로 (`references/` 이하) | blob SHA | 확인 내용 |
|---|---|---|
| `enovia-r2025x/3dspace/webapps/ENORouteMgmt/ENORouteMgmt.js` | `08c5781a75184358d1340b8fbd136b3bd806c08f` | ENORouteAutoComplete, InitiateRouteTemplateChooser, 3DSearch 조회 및 선택 |
| `enovia-r2024x/3dspace/webapps/ENORouteMgmt/ENORouteMgmt.js` | `6659771cf3a3d81d9d2a8f1fbaf72d78334d07a1` | 동일 자동완성/선택 계약 비교 |
| `enovia-r2025x/3dspace/webapps/WUXAutoComplete/WUXAutoComplete.js` | `3168036d24cb69ad1d30605727edadeb167f154c` | 자유 입력 금지, selectedItems, input/selection 이벤트, 지연 검색·종료 API |
| `enovia-r2025x/3dspace/webapps/EditPropWidget/EditPropWidget.js` | `04c1ca2a64a11fdef865b624e5c065035733667d` | 속성 모델 조회 및 새 모델 set을 통한 값 변경 |
| `enovia-r2025x/3dspace/webapps/ENOXSearchUIController/ENOXSearchUIController.js` | `18e4a1e11da160952f54fab683d4872f88996951` | 번들 내부 ObjectOpenSearchUtil 및 allowedTypes→type precond |

자동완성은 Route와 같은 3DSearch `/search` POST 계약을 사용하지만, 생성창의 tenant와
SecurityContext를 요청의 login 범위에 전달합니다. 돋보기는 기존 OOTB ObjectOpenSearchUtil의
위젯/검색창 계약을 유지하며 `allowedTypes:sdxMTopAssy`를 전달합니다.

## 검사 및 현장 확인

- 독립 대역 검사 10개 통과: 자동완성/돋보기 선택, 검색어 미저장, 선택 해제, 빈 값 허용,
  요청 타입/문맥, 응답 역순/취소/실패, 재렌더링/정리, 최종 저장값/짝 Text 및 기존 회귀.
- `test-model-search-reference.cjs`에 저장된 2024/2025 Route 번들을 각각 전달해 실제
  ENORouteAutoComplete 래퍼의 옵션·검색 요청·TreeNode 변환 계약을 실행해 통과.
- JavaScript 구문 및 배포 파일 경로 검사.

테스트는 실제 3DDashboard/WUX 전체 렌더링 또는 운영 검색 서버 실행을 대신하지 않습니다.
현장에서는 두 선택 경로, 한글/이름/제목 후보 조회, 선택 후 재입력·삭제, 검색어만 입력 후 저장,
아무 입력 없이 저장, 최종 Create 요청 및 실제 객체의 sdxECModel/짝 Text 값을 확인해야 합니다.
특히 캡처 단계에서 선택을 해제한 뒤 OOTB LineEditor가 검색어를 읽는 동작, 모달 내 후보 목록 위치,
설치 서버의 sdxMTopAssy 색인과 응답 필드, 돋보기의 실제 결과 구조를 확인하십시오.

## 선택 객체의 전체 속성 조회

자동완성/돋보기에서 하나를 선택하면 해당 ID로 다음 Java 서비스를 호출합니다.

`GET /resources/v1/modeler/sdxECCA/models/{objectId}/attributes`

현재 인증 사용자와 생성창의 SecurityContext로 `sdxMTopAssy` 객체를 읽습니다.
관리자 권한으로 전환하지 않습니다. `DomainObject.getAttributeMap(context)`으로
이 객체의 상속/부착 interface 속성값을 조회합니다. 관계 속성 및 연결 객체 속성은 포함하지 않습니다.
기본 정보는 `id`, `physicalid`, `type`, `name`이며 실제 속성값은 `attributes` 객체에 담습니다.

```json
{
  "success": true,
  "id": "1.2.3.4",
  "physicalid": "선택한 physical ID",
  "type": "sdxMTopAssy",
  "name": "MODEL-001",
  "attributes": {"sdxModelCode": "CODE-001", "Title": "모델명"}
}
```

### 필드별 값 반영 위치

`sdxECCAObjectSearch.js`의 `accept(record)` 내부 `then(function (details) {...})`에서
`record.attributes`를 설정한 다음 주석 위치에 필드별 반영 코드를 작성합니다.

```javascript
var modelCode = record.attributes["sdxModelCode"];
// 위 값을 대상 propModel의 value/valueDB에 설정합니다.
```

조회 완료 이후 `session.modelSearchSelection.record.attributes`로도 접근할 수 있습니다.
자동 매핑할 대상 필드/속성명은 아직 지정하지 않았으므로 매핑 코드는 추가하지 않았습니다.
조회 중에는 저장을 막고, 조회 실패 시 선택을 비웁니다. 다른 선택/입력 변경/문맥 전환/
창 종료/재렌더링 후 도착한 이전 응답은 적용하지 않습니다.

### 추가 배포 파일

- `server/src/com/sdx/ecca/rest/SdxEccaModelService.java` (신규)
- `server/src/com/sdx/ecca/rest/SdxEccaModeler.java` (서비스 등록 추가)
- `webapps/sdxECCAAutoClass/sdxECCAModelSearchService.js`
- `webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js`
- `webapps/sdxECCAAutoClass/sdxECCAAutoClass.js` (조회 중 저장 방지)

Java 파일은 기존 커스텀 REST 서비스와 같은 방식으로 컴파일/배포해야 합니다.
이 개발 환경에는 Java 컴파일러와 ENOVIA 라이브러리가 없어 Java 실제 컴파일/호출 검증은
수행하지 못했습니다. 현장에서 객체 읽기 권한, physical ID와 bus ID 조회, 한글/빈 속성,
상속/interface 속성 포함 여부를 확인하십시오. JavaScript 대역 검사에서는 두 선택 경로,
전체 속성 전달, 역순 응답, 선택 해제, 조회 실패, 권한 문맥 변경을 확인했습니다.
