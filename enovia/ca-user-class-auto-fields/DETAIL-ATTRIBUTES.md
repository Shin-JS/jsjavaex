# CA 상세보기 우측 속성 제어 — 2026

우리 위젯의 우측 속성 패널에만 제어 bus 규칙을 적용합니다. 공통 속성 위젯을 수정하지 않고
OOTB의 `facets` 옵션에서 속성 탭 컨트롤러를 지정합니다. 실제 필드 구성·권한 계산·편집 전환·검증·저장은
기존 `EditPropController`를 상속해 사용합니다.

## 배포 및 연결

1. `webapps/sdxENOChgGovernanceUX/custom/services/sdxECCADetailService.js`를 같은 경로에 배포합니다.
2. 기존 `sdxECCADataService.js`도 필요합니다. 생성창과 동일한 S4 제어 bus 조회 서비스를 사용합니다.
3. `webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js` 수정 메모의 **D0**를 적용합니다.
   실제 2026 `ChgGovPropertiesPanel` 생성자에서 `getpropOptions(i)`와 `new t(e)` 사이에 옵션 블록만 추가합니다.
   기존 생성창 G0~G2 연결은 그대로 둡니다. 이 메모 파일 전체로 서버 파일을 교체하지 않습니다.
4. **우리 위젯 초기화에서만** 아래 값을 지정합니다. 공용 위젯 HTML에는 지정하지 않습니다.

```javascript
widget.setValue("sdxECCAEnableDetailAttributeControl", true);
```

새 옵션은 패널 생성 시 적용됩니다. 배포 후 이미 열린 상세창은 닫고 위젯을 다시 로드합니다.
정보 아이콘 클릭 전에 상세 화면 진입 과정에서 패널이 만들어질 수 있습니다.
`EditPropWidget.js`, `ConstantsMapping`, `Form`과 공통 prototype 수정은 필요 없습니다.
OOTB 변경은 `ENOChgGovernanceUX.js` 안 D0의 한 생성자에 한정됩니다.

## 대상과 격리

- 위 전용 옵션이 없는 위젯은 OOTB 속성 탭 모듈을 그대로 사용하며 커스텀 파일도 로딩하지 않습니다.
- 옵션을 켠 위젯에서도 응답의 실제 DB 타입이 `sdxECChangeAction`인 단일 객체에만 적용합니다.
- 일반 CA, CO, CR, 병합/다중 선택 모델은 원래 컨트롤러로 전달하며 제어 bus를 조회하지 않습니다.
- D0의 `sdxEccaDetailTypes` 배열에 실제 파생 타입명을 명시하면 해당 타입도 포함할 수 있습니다.
  `ChangeAction`이라는 상위 구분이나 `isKindOfType`만으로 대상이라고 판정하지 않습니다.
- 적용 상태·규칙은 상세창 인스턴스에만 보관합니다. 전역 캐시와 공통 prototype 변경이 없습니다.
- 대상 객체·tenant·권한 문맥 변경 또는 종료 뒤 도착한 이전 규칙 응답은 적용하지 않습니다.
  권한 문맥이 바뀐 경우 현재 문맥으로 상세 정보를 새로고침해야 합니다.

## 상태 및 CREATE 대체 규칙

조회 응답의 실제 `current` 값을 우선 사용합니다. 응답에 상태가 없을 때의 1단계 기본값은
D0에 명시한 `ECR_CREATE`입니다. 상태 추출은 응답의 `current` 또는 속성 목록의 `current.valueDB`를 확인합니다.

| 첫 조회 | 결과 | 처리 |
|---|---|---|
| ECR_CREATE | 정상 1건 이상 | ECR_CREATE 규칙 사용 |
| ECR_CREATE | 정상 0건 | CREATE로 한 번 더 조회 |
| CREATE 대체 조회 | 정상 0건 | 제어 대상 필드 숨김, 임의로 전체 표시하지 않음 |
| ECR_CREATE | 실패·권한 오류·잘못된 응답 | 오류 표시, 편집/저장 차단, CREATE로 대체하지 않음 |
| 다른 실제 상태 | 정상 0건 | 해당 상태의 빈 규칙 적용, CREATE로 대체하지 않음 |

대체는 속성 하나씩 합치는 방식이 아닙니다. ECR_CREATE에 규칙이 하나라도 있으면 그 상태의 목록만 사용합니다.
기존 서버 API는 그대로 사용하며 Java/JPO/MQL 스키마 변경이 없습니다.
조직은 기존 서비스 계약과 동일하게 현재 MX 고정입니다. 사용자 정보 연동은 별도 조회 계층에서 연결할 수 있도록 유지합니다.

## 속성 처리

`data`, `basicData`, `groupData`에 이미 내려온 속성의 표시 메타데이터를 복제해 적용합니다.
값·실제 속성명·path·select·분류/확장 식별자와 OOTB 섹션 구분은 유지합니다.
속성 탭에 없는 속성을 제어 bus 이름만 보고 새로 만들지는 않습니다.
분류 탭을 이동하거나 분류를 새로 연결하는 작업은 포함하지 않습니다.
현재 속성 응답에 CCMAttr 속성이 포함된 경우에만 그 필드에 같은 규칙을 적용합니다.

| 제어 항목 | 조회 모드 | 편집 모드 |
|---|---|---|
| Read | Y만 표시, 목록 밖/false는 숨김 | 동일 |
| Edit | 값 표시 | 기존 OOTB 권한도 허용하고 Edit=Y일 때만 편집 |
| Mandatory | 아이콘 없음 | 표시 가능한 편집 필드에 필수 아이콘 |
| MandatoryCheck | 필수 빈값 검증 없음 | 기존 OOTB mandatory 모델 속성에 연결 |
| Order | 기존 OOTB 구획 안에서 순서 적용 | 동일 |

기존 서버 `visible=false`/읽기 전용/객체 수정 권한을 풀지 않습니다.
UI 위치가 없어 OOTB가 표시 대상에서 제외하는 기본/그룹 속성도 임의로 되살리지 않습니다.
Mandatory와 MandatoryCheck의 네 조합을 독립 적용합니다. 읽기 전용/숨김 필드의 필수 검증은 제외합니다.
숨김은 값 삭제나 서버 권한 변경이 아닙니다. sdxECType과 Text 보조 필드는 생성창과 같이 숨깁니다.
속성 응답에 기본 속성과 같은 이름의 CCMAttr 분류 속성이 함께 있으면 분류 필드를 우선 표시합니다.
분류 규칙 조회 이름에서만 끝의 CCMAttr을 제외하며 실제 저장 이름은 바꾸지 않습니다.

규칙 조회 중에는 이전 폼을 비우고 편집/저장을 막습니다. 실패 시 전체 필드 표시로 돌아가지 않습니다.
실제 편집 모드에 들어갈 때만 mandatory를 켜며, OOTB 입력 검증과 onSave/commit 경로를 유지합니다.
초기 화면에서 별도의 validateModel 호출로 필수 오류를 만들지 않습니다.
필수 표시만 Y인 필드는 아이콘만, MandatoryCheck만 Y인 필드는 아이콘 없이 검증합니다.

## 검증과 한계

확인한 2026 참조 원본:

- private-rag `references/enovia-r2026x/3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js`
  blob `2e8f017f2471ff3fd657b862f2c4e201f9932906` — ChgGovPropertiesPanel 생성자.
- 같은 버전의 `EditPropWidget/EditPropWidget.js`
  blob `67f66cbe31bab6939f625d96b0c76b413e93c661` — `_getFacet` 옵션 병합,
  `_onCompleteLoadModel`/`_buildFromResponse`/`fillFromServer`, mandatory 검증과 `onSave`.

```sh
node tests/test-detail-control.cjs /2026-원본/EditPropWidget.js
```

검사는 실제 2026 OOTB 컨트롤러·속성 모델 변환·검증기를 실행합니다.
통신·객체 모델의 이벤트 계층·WUX 입력 컴포넌트/DOM·DB 저장은 대역입니다.
필수 표시/검증 네 조합, Read/Edit 및 기존 권한 보존, 기존 응답/값 보존,
정상 0건 대체와 오류 미대체, CO/CR/일반 CA·옵션 없는 창·병합 모델 격리,
객체/문맥 변경·종료 후 늦은 응답 차단과 OOTB onSave의 검증/commit 도달 여부를 검사합니다.

설치 서버에서는 기본 응답의 실제 타입/상태 값, WUX 필수 아이콘과 편집·취소·새로고침,
필수 빈값 저장 차단 및 정상 저장, ECR_CREATE/CREATE 각 조회 결과,
일반 CA·CO·CR과 다른 위젯·동시 창을 확인해야 합니다. 실제 서버 UI/DB 실행 검증은 완료하지 않았습니다.
