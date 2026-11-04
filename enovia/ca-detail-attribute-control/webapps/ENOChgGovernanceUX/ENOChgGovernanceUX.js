/* 2026 CA 상세 속성창 전용 수정 메모입니다. 서버 파일 전체 교체본이 아닙니다. */
/* ============================================================
 * D0 — 2026 상세 속성창 연결 (생성창 G0~G2와 별도)
 * 파일: 3dspace/webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js
 * 대상 AMD: DS/ENOChgGovernanceUX/scripts/components/propertiesView/ChgGovPropertiesPanel
 * 원본 생성자: function r(){var e=o.getpropOptions(i);this._informationPanel=new t(e)}
 * getpropOptions(i) 다음, new t(e) 직전에 아래 조건 블록만 추가합니다.
 * 의존성/factory 인자/그 밖의 start·setState·reRender는 변경하지 않습니다.
 * EditPropWidget.js/ConstantsMapping/Form/공통 prototype 수정은 없습니다.
 * 일반 위젯은 이 옵션을 설정하지 않으므로 기존 모듈을 그대로 사용합니다.
 * ============================================================ */
/* [D0 삽입 후 생성자 전체 — 이 모듈의 생성자만 교체]
function r() {
    var e = o.getpropOptions(i);
    if (typeof widget !== "undefined" &&
            (widget.getValue("sdxECCAEnableDetailAttributeControl") === true ||
             widget.getValue("sdxECCAEnableDetailAttributeControl") === "true")) {
        var detailOptions = Object.assign({}, e, {
            sdxEccaDetail: true,
            sdxEccaDetailTypes: ["sdxECChangeAction"]
        });
        e.facets = [{
            id: i.FACET_PROPERTIES,
            require: "DS/sdxENOChgGovernanceUX/custom/services/sdxECCADetailService",
            options: detailOptions
        }];
    }
    this._informationPanel = new t(e);
}
*/
/* 우리 위젯 초기화에서만 설정 (공용 HTML에는 설정하지 않습니다):
widget.setValue("sdxECCAEnableDetailAttributeControl", true);

파생 DB 타입도 처리하려면 위 sdxEccaDetailTypes 배열에 정확한 타입명을 명시합니다.
일반 ChangeAction/isKindOfType만으로 우리 타입이라고 판정하지 않습니다.
*/


