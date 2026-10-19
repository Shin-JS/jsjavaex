/** 클래스 결정 전용 서비스. UI/OOTB 컨트롤러를 변경하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAClassRuleService", [], function () {
    "use strict";

    function required(value, message) {
        if (typeof value !== "string" || !value.trim()) throw new Error(message);
        return value.trim();
    }

    function resolveFixed(rule) {
        return {
            classId: required(rule.classId, "sdxECCAFixedClassId에 클래스 physicalid를 지정해 주세요."),
            libraryId: rule.libraryId == null || rule.libraryId === "" ? null :
                required(rule.libraryId, "라이브러리 physicalid를 확인해 주세요.")
        };
    }

    /**
     * Provider가 실제 서버 응답을 아래 계약으로 변환합니다.
     * 사용자: {departmentCode: "부서 코드"}
     * 클래스 후보: [{departmentCode: "부서 코드", classId: "General Class physicalid", libraryId: null}]
     * 표시명/문맥 문자열의 Organization을 사용자 부서로 간주하지 않습니다.
     * General Type의 실제 속성명/API는 확정되지 않았으므로 여기에 추정 URL을 넣지 않습니다.
     */
    function resolveDepartment(request, provider) {
        return Promise.resolve().then(function () {
            if (!provider || typeof provider.loadCurrentUser !== "function" ||
                typeof provider.findDepartmentClasses !== "function") {
                throw new Error("부서 조회 Provider를 연결해 주세요.");
            }
            var securityContext = required(request.securityContext, "부서 조회 권한 문맥을 확인해 주세요.");
            // 원래 options 객체나 위젯 인스턴스 전체를 서버 조회 계층에 전달하지 않습니다.
            var scope = {securityContext: securityContext, tenant: request.tenant};
            return Promise.resolve(provider.loadCurrentUser(scope)).then(function (user) {
                var departmentCode = required(user && user.departmentCode, "로그인 사용자의 부서 코드가 없습니다.");
                return Promise.resolve(provider.findDepartmentClasses({
                    securityContext: scope.securityContext,
                    tenant: scope.tenant,
                    departmentCode: departmentCode
                })).then(function (candidates) {
                    if (!Array.isArray(candidates)) throw new Error("부서별 클래스 조회 응답은 배열이어야 합니다.");
                    // 조회 구현에서 누락된 부서 필터 때문에 다른 부서가 자동 선택되는 것을 막습니다.
                    var matches = candidates.filter(function (item) {
                        return item && typeof item.departmentCode === "string" &&
                            item.departmentCode.trim() === departmentCode;
                    });
                    if (!matches.length) throw new Error("사용자 부서에 해당하는 클래스가 없습니다.");
                    if (matches.length !== 1) throw new Error("사용자 부서에 해당하는 클래스가 여러 개입니다. 매핑을 확인해 주세요.");
                    var rule = resolveFixed(matches[0]);
                    rule.departmentCode = departmentCode;
                    return rule;
                });
            });
        });
    }

    return {resolveFixed: resolveFixed, resolveDepartment: resolveDepartment};
});
