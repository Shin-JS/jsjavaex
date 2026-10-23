/** ENOCreate의 기존 문자열 모델에 OOTB 6W 객체 검색을 연결합니다. */
define("DS/sdxECCAAutoClass/sdxECCAObjectSearch", [
    "require"
], function (require) {
    "use strict";

    function install(facet, session, config) {
        if (session.type !== "sdxECChangeAction" || config.enabled === false || config.enabled === "false") return function () {};
        var disposed = false, search = null, loading = false, observer = null, mounted = null, AttributeModel;
        var valueField = config.valueField || "name";
        function fieldModel() {
            var model = facet.listview && facet.listview.propModel;
            var fields = model && typeof model.getAttributeFromField === "function" &&
                model.getAttributeFromField("name", "sdxECModel");
            return fields && fields[0];
        }
        function message(text) { if (mounted) mounted.error.textContent = text; }
        function select(objects) {
            if (disposed || session.disposed || session.status === "error") return;
            if (!objects || !objects.length) return; // 취소 시 기존 값 유지
            if (objects.length !== 1) { message("객체를 하나만 선택해 주세요."); return; }
            var value = objects[0][valueField];
            if (typeof value !== "string" || !value) {
                message("검색 결과에 저장할 " + valueField + " 값이 없습니다. 검색 설정을 확인해 주세요.");
                return;
            }
            var view = facet.listview, current = fieldModel();
            if (!current || current.readOnly || current.visible === false) return;
            // OOTB TweakerManager._modelChangeValue와 같은 교체 방식으로 onChange/검증을 실행합니다.
            var updated = new AttributeModel(current);
            updated.set("value", value);
            updated.set("valueDB", value);
            updated.set("isModified", true);
            updated.set("isUIModified", true);
            view.propModel.set(current.getIdentifier(), updated);
            message("");
        }
        function launch() {
            if (disposed || session.disposed || session.status === "error" || loading) return;
            message("");
            function open() {
                if (disposed || session.disposed) return;
                try {
                    search.launchSearch({
                        title: "모델 선택", allowedTypes: config.allowedTypes || "",
                        criteria: "", multiSel: false, defaultMode: false,
                        default_with_precond: true, in_apps_callback: select
                    });
                } catch (error) { message("객체 검색을 열지 못했습니다: " + error.message); }
            }
            if (search) { open(); return; }
            loading = true;
            // ObjectOpenSearchUtil은 이 번들 안에 정의됩니다. 번들을 먼저 로드해야
            // RequireJS가 존재하지 않는 ObjectOpenSearchUtil.js를 요청하지 않습니다.
            require(["DS/ENOXSearchUIController/ENOXSearchUIController"], function () {
                if (disposed || session.disposed) { loading = false; return; }
                require(["DS/ENOXSearchUIController/ObjectOpenSearchUtil", "DS/EditPropWidget/models/EditPropAttributeModel"], function (SearchUtil, Model) {
                    AttributeModel = Model;
                    loading = false;
                    if (disposed || session.disposed) return;
                    try {
                        // AMD export를 직접 초기화하면 다른 화면의 callback/socket을 덮어쓰므로 인스턴스 분리.
                        search = Object.create(SearchUtil);
                        search.initialize();
                        open();
                    } catch (error) { message("객체 검색 초기화에 실패했습니다: " + error.message); }
                }, function () {
                    loading = false;
                    if (!disposed) message("객체 검색 모듈을 불러오지 못했습니다.");
                });
            }, function () {
                loading = false;
                if (!disposed && !session.disposed) message("객체 검색 번들을 불러오지 못했습니다.");
            });
        }
        function unmount() {
            if (!mounted) return;
            mounted.button.removeEventListener("click", launch);
            [mounted.button, mounted.error].forEach(function (node) {
                if (node.parentNode) node.parentNode.removeChild(node);
            });
            mounted.target.classList.remove("sdxECCAObjectSearchValue");
            mounted = null;
        }
        function mount() {
            if (disposed || session.disposed) return;
            var current = fieldModel(), target = null;
            var ui = facet.listview && facet.listview.propUI;
            var section = ui && ui.getFormSection && ui.getFormSection();
            var organizers = section && typeof section.getOrganizers === "function" && section.getOrganizers();
            if (current && current.visible !== false && !current.readOnly) {
                Object.keys(organizers || {}).forEach(function (key) {
                    (organizers[key]._forms || []).forEach(function (form) {
                        (form.fields || []).forEach(function (line) {
                            if (line._idAttr === current.getIdentifier()) {
                                var flexLine = line.elements && line.elements.flexLine;
                                target = flexLine && flexLine.querySelector(".formValue");
                            }
                        });
                    });
                });
            }
            if (mounted && mounted.target === target && mounted.button.parentNode === target) return;
            unmount();
            if (!target) return;
            var button = document.createElement("button");
            button.type = "button";
            button.className = "sdxECCAObjectSearchButton";
            button.title = "모델 검색";
            button.setAttribute("aria-label", "모델 검색");
            var icon = document.createElement("span");
            icon.className = "fonticon fonticon-search";
            icon.setAttribute("aria-hidden", "true");
            button.appendChild(icon);
            var error = document.createElement("span");
            error.className = "sdxECCAObjectSearchError";
            error.setAttribute("role", "alert");
            target.classList.add("sdxECCAObjectSearchValue");
            mounted = {target: target, button: button, error: error};
            button.addEventListener("click", launch);
            target.appendChild(button);
            target.appendChild(error);
        }
        // Form의 비동기 tweaker 생성과 updateFacet 후 폼 교체를 함께 처리합니다.
        if (typeof MutationObserver !== "undefined") {
            observer = new MutationObserver(function () {
                try { mount(); }
                catch (error) {
                    observer.disconnect();
                    console.error("[sdxECCAObjectSearch] 검색 버튼 연결 실패.", error);
                }
            });
            observer.observe(facet.skeleton, {childList: true, subtree: true});
        }
        try { mount(); }
        catch (error) {
            if (observer) observer.disconnect();
            unmount();
            throw error;
        }
        return function () {
            disposed = true;
            if (observer) observer.disconnect();
            unmount();
            if (search && search.socket) search.destroy();
            search = null;
        };
    }
    return {install: install};
});
