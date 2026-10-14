/* 전체 OOTB 파일 교체용이 아닙니다.
 * factory: DS/ClassificationProp/facets/Properties/ClassifPropController
 * 아래 함수를 기존 return 앞에 추가합니다.
 * loadModels 안의 내부 v(e,t) -> onAttributesLoad(t)에서 다음 기존 호출을 찾습니다:
 *     n._onCompleteLoadModel(t,{initTable:!r,buildBehavior:l?d.FORCE_DEFAULT:d.NO_CHANGES})
 * 실제 폼/모델 반영 뒤 완료를 알려야 하므로 위 호출 바로 뒤에 콤마로 추가합니다:
 *     n._onCompleteLoadModel(t,{initTable:!r,buildBehavior:l?d.FORCE_DEFAULT:d.NO_CHANGES}),
 *     zcaNotifyAutoClassAttributes(e,t)
 * 기존 getAttributesDone publish보다 뒤이며 _onCompleteLoadModel보다 뒤입니다.
 * 설치 버전의 지역 변수명이 다르면 e=현재 ClassifPropModel, t=속성 응답입니다.
 */

/** 자동 대상 클래스 모델에만 완료를 알립니다. 다른 위젯 모델에는 표식이 없어 즉시 반환합니다.
 * 빈 attribute 배열도 정상입니다. 배열 누락을 빈 폼 성공으로 취급하지 않습니다.
 * OOTB 서버 호출 실패로 여기까지 오지 않으면 세션 타임아웃이 생성을 막습니다.
 */
function zcaNotifyAutoClassAttributes(model, response) {
    var session = model && model.zcaAutoSession;
    if (!session || session.disposed || session.status === "error") return;
    if (!response || !Array.isArray(response.attribute)) {
        session.fail(new Error("클래스 속성 응답의 attribute 배열을 확인해 주세요."));
        return;
    }
    session.markAttributesLoaded(model.zcaAutoClassId);
}
