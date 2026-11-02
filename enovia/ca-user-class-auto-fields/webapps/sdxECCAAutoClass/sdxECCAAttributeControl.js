/** 현재 CA 등록창 인스턴스에만 제어 규칙을 적용합니다. OOTB prototype은 변경하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeControl", ["require"], function (require) {
    "use strict";
    function get(field, key) {
        var value = field && typeof field.get === "function" ? field.get(key) : undefined;
        return value !== undefined ? value : field && field[key];
    }
    function install(facet, session, options) {
        if (!session || session.type !== "sdxECChangeAction" || session.disposed) return Promise.resolve(function () {});
        var view = facet.listview, disposed = false, applying = false, observer = null, rules = null;
        var names = new Set(), ranks = new Map(), restores = [], restoreModel = null;
        function closed() { return disposed || session.disposed || session.transitioning || session.status === "error"; }
        function collect(data) {
            ["publicAttributes", "extensionAttributes"].forEach(function (group) {
                var rows = data && data.attributes && data.attributes[group];
                (Array.isArray(rows) ? rows : []).forEach(function (row) { if (row && row.name) names.add(row.name); });
            });
        }
        collect(view.data);
        function visible(name) {
            var rule = rules && rules.get(name);
            // 이전 Text 복사/EC Type 저장 규칙은 계속 숨깁니다.
            return !!rule && rule.read && name !== "sdxECType" && !/Text$/.test(name);
        }
        function controlled(field) {
            var name = get(field, "name");
            if (!field || get(field, "defaultAttribute") || typeof field.getIdentifier !== "function" ||
                    typeof name !== "string" || !name) return false;
            // BL이 typeinfo 목록 밖의 모델을 추가해도 허용 목록을 우회하지 못합니다.
            names.add(name);
            return true;
        }
        function apply(field) {
            var name = get(field, "name");
            if (!controlled(field) || typeof field.set !== "function") return;
            var rule = rules && rules.get(name), show = visible(name);
            var flags = {visible: show, readOnly: !show || !rule.edit,
                mandatory: show && rule.mandatoryCheck, positionUI: "2-1-" + (ranks.get(name) || 1000000),
                // 필수 여부/인터페이스에 따른 OOTB 구획 분리를 없애 설정 순서를 그대로 사용합니다.
                facet: "", section: "", form: "DSDefault", group: "Default"};
            Object.keys(flags).forEach(function (key) {
                if (get(field, key) !== flags[key]) field.set(key, flags[key]);
            });
        }
        function all() {
            var model = view.propModel;
            return model && model.getAllAttributes ? model.getAllAttributes() : {};
        }
        function enforce() {
            if (closed() || applying) return;
            applying = true;
            try { var fields = all(); Object.keys(fields).forEach(function (key) { apply(fields[key]); }); }
            finally { applying = false; }
        }
        function decorate() {
            if (closed()) return;
            var ui = view.propUI, section = ui && ui.getFormSection && ui.getFormSection();
            var organizers = section && section.getOrganizers && section.getOrganizers();
            var fields = all();
            Object.keys(organizers || {}).forEach(function (key) {
                (organizers[key]._forms || []).forEach(function (form) {
                    (form.fields || []).forEach(function (line) {
                        var field = fields[line._idAttr], name = get(field, "name");
                        if (!controlled(field)) return;
                        var flex = line.elements && line.elements.flexLine;
                        var label = flex && flex.querySelector(".formLabel");
                        if (!label) return;
                        if (!label.classList.contains("sdxECCAControlledLabel")) label.classList.add("sdxECCAControlledLabel");
                        var icon = label.querySelector(".sdxECCAControlMandatory");
                        var rule = rules && rules.get(name), show = visible(name) && rule.mandatory;
                        if (show && !icon) {
                            icon = document.createElement("span");
                            icon.className = "mandIcon wux-ui3ds wux-ui-3ds-new-create sdxECCAControlMandatory";
                            icon.setAttribute("aria-hidden", "true");
                            label.appendChild(icon);
                        } else if (!show && icon) icon.parentNode.removeChild(icon);
                    });
                });
            });
        }
        function wrap(object, key, handler) {
            var original = object[key];
            if (typeof original !== "function") throw new Error("OOTB " + key + " 연결을 확인해 주세요.");
            var wrapped = handler(original);
            object[key] = wrapped;
            restores.push(function () { if (object[key] === wrapped) object[key] = original; });
        }
        function bindModel() {
            if (restoreModel) restoreModel();
            var model = view.propModel, original = model && model.set;
            if (typeof original !== "function") throw new Error("OOTB 속성 모델 set을 확인해 주세요.");
            // BL/검색이 새 AttributeModel을 넣을 때도 규칙을 먼저 적용합니다.
            var wrapped = function (key, value) {
                if (!closed()) {
                    var values = arguments.length > 1 ? [value] :
                        Array.isArray(key) ? key : key && typeof key.getIdentifier === "function" ? [key] : Object.values(key || {});
                    values.forEach(apply);
                }
                return original.apply(this, arguments);
            };
            model.set = wrapped;
            restoreModel = function () { if (model.set === wrapped) model.set = original; };
        }
        function validate(result) {
            if (closed() || !rules) throw new Error("속성 제어 설정이 준비되지 않았습니다.");
            var fields = all(), missing = [];
            Object.keys(fields).forEach(function (key) {
                var field = fields[key], name = get(field, "name"), rule = rules.get(name);
                if (!controlled(field) || !visible(name) || !rule.mandatoryCheck) return;
                var value = get(field, "valueDB");
                if (value === undefined) value = get(field, "value");
                if (result && result.attributes) {
                    var saved;
                    ["publicAttributes", "extensionAttributes"].some(function (group) {
                        var rows = result.attributes[group];
                        saved = Array.isArray(rows) && rows.find(function (row) { return row && row.name === name; });
                        return !!saved;
                    });
                    value = saved ? saved.value : undefined;
                }
                if (value === undefined || value === null || (Array.isArray(value) ?
                        !value.length || value.every(function (item) { return item == null || String(item).trim() === ""; }) :
                        String(value).trim() === "")) {
                    missing.push(get(field, "label") || name);
                }
            });
            if (missing.length) throw new Error("필수 항목을 입력해 주세요: " + missing.join(", "));
        }
        function cleanup() {
            disposed = true;
            if (observer) observer.disconnect();
            if (restoreModel) restoreModel();
            restores.reverse().forEach(function (restore) { restore(); });
            if (style.parentNode) style.parentNode.removeChild(style);
            if (session.validateAttributeControl === validate) session.validateAttributeControl = null;
        }
        var style = document.createElement("style");
        style.textContent = ".sdxECCAControlledLabel .mandIcon,.sdxECCAControlledLabel .attrMand{display:none!important}" +
            ".sdxECCAControlledLabel .sdxECCAControlMandatory{display:inline!important;font-size:7px;font-family:DSFontIcon;color:rgb(234,79,55)!important}";
        facet.skeleton.appendChild(style);
        session.validateAttributeControl = validate;
        session.cleanupAttributeControl = cleanup;
        try {
            bindModel();
            wrap(view, "buildModel", function (original) { return function (data) {
                collect(data);
                var result = original.apply(this, arguments);
                bindModel(); enforce(); return result;
            }; });
            ["refresh", "loadView"].forEach(function (key) {
                wrap(view, key, function (original) { return function () {
                    enforce();
                    var result = original.apply(this, arguments);
                    decorate(); return result;
                }; });
            });
            wrap(view, "addAttributeOnUI", function (original) { return function (id, show) {
                var field = view.propModel.get(id), name = get(field, "name");
                // BL이 재표시를 요청해도 제어 설정의 숨김을 유지합니다.
                if (controlled(field)) show = visible(name);
                return original.call(this, id, show);
            }; });
            wrap(view, "onSubmit", function (original) { return function (callback) {
                try { enforce(); validate(); }
                catch (error) { if (session.showMessage) session.showMessage(error.message); callback(false); return; }
                return original.call(this, function (result) {
                    if (result) {
                        try { enforce(); validate(result); }
                        catch (error) { if (session.showMessage) session.showMessage(error.message); callback(false); return; }
                    }
                    callback(result);
                });
            }; });
            if (typeof MutationObserver !== "undefined") {
                observer = new MutationObserver(decorate);
                observer.observe(facet.skeleton, {childList: true, subtree: true});
            }
        } catch (error) { cleanup(); return Promise.reject(error); }
        // 조회 완료 전에는 prepareFixedType에서 모든 제어 대상 모델을 숨겨 두었습니다.
        return new Promise(function (resolve, reject) {
            require(["DS/sdxECCAAutoClass/sdxECCAAttributeControlService"], resolve, reject);
        }).then(function (Service) {
            if (closed()) return null;
            return Service.read({securityContext: session.context, tenant: session.tenant,
                url: options && options.url, isCancelled: closed});
        }).then(function (result) {
            if (closed() || !result) { cleanup(); return function () {}; }
            rules = result;
            Array.from(rules.values()).sort(function (a, b) {
                return a.order - b.order || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
            }).forEach(function (rule, index) { ranks.set(rule.name, index + 1); });
            enforce();
            view.refresh();
            session.attributeControlReady = true;
            session.refreshReady(); session.notify();
            return cleanup;
        }).catch(function (error) { cleanup(); throw error; });
    }
    return {install: install};
});
