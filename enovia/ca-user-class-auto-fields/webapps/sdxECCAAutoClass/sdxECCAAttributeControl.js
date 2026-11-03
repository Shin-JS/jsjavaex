/** 현재 CA 등록창 인스턴스에만 제어 규칙을 적용합니다. OOTB prototype은 변경하지 않습니다. */
define("DS/sdxECCAAutoClass/sdxECCAAttributeControl", ["require"], function (require) {
    "use strict";
    function get(field, key) {
        var value = field && typeof field.get === "function" ? field.get(key) : undefined;
        return value !== undefined ? value : field && field[key];
    }
    // 같은 OOTB 검증기를 사용하되 버튼 판단용 검사에서는 실제 필드의 오류 상태를 바꾸지 않습니다.
    function validateWithoutMessages(ui, model) {
        var snapshot = Object.create(model);
        snapshot.values = function () {
            return model.values().map(function (field) {
                var copy = Object.create(field);
                copy.resetError = function () {};
                copy.setError = function () {};
                return copy;
            });
        };
        return ui.validateModels([snapshot]);
    }
    function install(facet, session, options) {
        if (!session || session.type !== "sdxECChangeAction" || session.disposed) return Promise.resolve(function () {});
        var classification = options && options.classification === true;
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
        function ruleName(name) { return classification && typeof name === "string" ? name.replace(/CCMAttr$/, "") : name; }
        function visible(name) {
            var rule = rules && rules.get(ruleName(name));
            // 규칙 조회가 완료되면 기본 폼을 먼저 표시합니다.
            // 분류 목록이 도착하면 알려진 중복만 숨깁니다. 분류 대기가 기본 폼을 막지 않습니다.
            if (!classification && session.classificationControlNames && session.classificationControlNames.has(name)) return false;
            // 이전 Text 복사/EC Type 저장 규칙은 계속 숨깁니다.
            return !!rule && rule.read && (classification || (name !== "sdxECType" && !/Text$/.test(name)));
        }
        function controlled(field) {
            var name = get(field, "name");
            if (!field || get(field, "defaultAttribute") || typeof field.getIdentifier !== "function" ||
                    typeof name !== "string" || !name ||
                    (classification && get(field, "facet") !== session.classId)) return false;
            // BL이 typeinfo 목록 밖의 모델을 추가해도 허용 목록을 우회하지 못합니다.
            names.add(name);
            return true;
        }
        function apply(field) {
            var name = get(field, "name");
            if (!controlled(field) || typeof field.set !== "function") return;
            var rule = rules && rules.get(ruleName(name)), show = visible(name);
            var flags = {visible: show, readOnly: !show || !rule.edit,
                mandatory: show && rule.mandatoryCheck, positionUI: "2-1-" + (ranks.get(ruleName(name)) || 1000000),
                // 분류의 class ID와 기존 section/form/group은 유지합니다.
                // 기본 폼은 OOTB 기본 영역/ExtensionsFacet(펼치기) 구획을 사용합니다.
                facet: classification ? get(field, "facet") :
                    show && (rule.mandatory || rule.mandatoryCheck) ? "" : "ExtensionsFacet"};
            Object.keys(flags).forEach(function (key) {
                if (get(field, key) !== flags[key]) field.set(key, flags[key]);
            });
        }
        function all() {
            var model = view.propModel;
            return model && model.getAllAttributes ? model.getAllAttributes() : {};
        }
        function syncClassificationNames() {
            if (!classification || closed()) return;
            var current = new Set(), fields = all();
            Object.keys(fields).forEach(function (id) {
                var field = fields[id];
                if (controlled(field)) current.add(ruleName(get(field, "name")));
            });
            var previous = session.classificationControlNames;
            var changed = !previous || current.size !== previous.size ||
                Array.from(current).some(function (name) { return !previous.has(name); });
            if (changed) {
                session.classificationControlNames = current;
                if (session.refreshBaseAttributeControl) session.refreshBaseAttributeControl();
            }
        }
        function refreshBase() {
            if (!closed()) { enforce(); view.refresh(); }
        }
        function enforce() {
            if (closed() || applying) return;
            applying = true;
            try { syncClassificationNames(); var fields = all(); Object.keys(fields).forEach(function (key) { apply(fields[key]); }); }
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
                        if (classification && flex) {
                            var content = typeof line.getContent === "function" ? line.getContent() : flex;
                            var display = visible(name) ? "" : "none";
                            if (content.style.display !== display) content.style.display = display;
                        }
                        var label = flex && flex.querySelector(".formLabel");
                        if (!label) return;
                        if (!label.classList.contains("sdxECCAControlledLabel")) label.classList.add("sdxECCAControlledLabel");
                        var icon = label.querySelector(".sdxECCAControlMandatory");
                        var rule = rules && rules.get(ruleName(name)), show = visible(name) && rule.mandatory;
                        if (show && !icon) {
                            icon = document.createElement("span");
                            icon.className = "mandIcon wux-ui3ds wux-ui-3ds-new-create sdxECCAControlMandatory";
                            icon.setAttribute("aria-hidden", "true");
                            // OOTB 제목 텍스트와 같은 인라인 컨테이너에 둡니다.
                            var title = label.querySelector(".textContainer") || label.querySelector(".attrLabel") || label;
                            title.appendChild(icon);
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
                var result = original.apply(this, arguments);
                syncClassificationNames();
                return result;
            };
            model.set = wrapped;
            restoreModel = function () { if (model.set === wrapped) model.set = original; };
        }
        function cleanup() {
            disposed = true;
            if (observer) observer.disconnect();
            if (restoreModel) restoreModel();
            restores.reverse().forEach(function (restore) { restore(); });
            if (style.parentNode) style.parentNode.removeChild(style);
            if (!classification) {
                if (session.cleanupClassificationControl) session.cleanupClassificationControl();
                session.attachClassificationControl = null;
                if (session.refreshBaseAttributeControl === refreshBase) session.refreshBaseAttributeControl = null;
            }
        }
        var style = document.createElement("style");
        style.textContent = ".sdxECCAControlledLabel .mandIcon,.sdxECCAControlledLabel .attrMand{display:none!important}" +
            ".sdxECCAControlledLabel .sdxECCAControlMandatory{display:inline!important;margin-left:3px;vertical-align:middle;font-size:7px;font-family:DSFontIcon;color:rgb(234,79,55)!important}";
        facet.skeleton.appendChild(style);
        if (classification) {
            session.cleanupClassificationControl = cleanup;
        } else {
            session.cleanupAttributeControl = cleanup;
            session.refreshBaseAttributeControl = refreshBase;
        }
        try {
            bindModel();
            if (classification) {
                wrap(options.propertiesUI, "updateTableManager", function (original) { return function () {
                    enforce();
                    var result = original.apply(this, arguments);
                    decorate(); return result;
                }; });
            } else {
                wrap(view, "dispatchEvent", function (original) { return function (event, args) {
                    if (!closed() && rules && event === "onValidActivation" && args && args[0] === true) {
                        var errors = validateWithoutMessages(this.propUI.elements.UIController, this.propModel);
                        var forwarded = Array.prototype.slice.call(arguments);
                        forwarded[1] = [!errors || !errors.length];
                        return original.apply(this, forwarded);
                    }
                    return original.apply(this, arguments);
                }; });
                wrap(view, "buildModel", function (original) { return function (data) {
                    collect(data);
                    var result = original.apply(this, arguments);
                    bindModel(); enforce(); return result;
                }; });
                ["refresh", "loadView"].forEach(function (key) {
                    wrap(view, key, function (original) { return function () {
                        enforce();
                        var result = original.apply(this, arguments);
                        decorate();
                        // 초기 전체 검증은 오류 문구를 만들지 않고 버튼 상태에만 반영합니다.
                        if (typeof this.updateValidStatus === "function") this.updateValidStatus();
                        return result;
                    }; });
                });
                wrap(view, "addAttributeOnUI", function (original) { return function (id, show) {
                    var field = view.propModel.get(id), name = get(field, "name");
                    // BL이 재표시를 요청해도 제어 설정의 숨김을 유지합니다.
                    if (controlled(field)) show = visible(name);
                    return original.call(this, id, show);
                }; });
            }
            if (typeof MutationObserver !== "undefined") {
                observer = new MutationObserver(decorate);
                observer.observe(facet.skeleton, {childList: true, subtree: true});
            }
        } catch (error) { cleanup(); return Promise.reject(error); }
        // 조회 완료 전에는 prepareFixedType에서 모든 제어 대상 모델을 숨겨 두었습니다.
        var query = classification ? Promise.resolve(options.rules) : new Promise(function (resolve, reject) {
            require(["DS/sdxECCAAutoClass/sdxECCAAttributeControlService"], resolve, reject);
        }).then(function (Service) {
            if (closed()) return null;
            return Service.read({securityContext: session.context, tenant: session.tenant,
                url: options && options.url, state: session.attributeControlState, isCancelled: closed});
        });
        return query.then(function (result) {
            if (closed() || !result) { cleanup(); return function () {}; }
            rules = result;
            Array.from(rules.values()).sort(function (a, b) {
                return a.order - b.order || (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
            }).forEach(function (rule, index) { ranks.set(rule.name, index + 1); });
            enforce();
            view.refresh();
            if (classification) {
                session.classificationControlReady = true;
                facet.skeleton.style.visibility = "";
            } else {
                session.attributeControlRules = rules;
                session.attributeControlReady = true;
                session.attachClassificationControl = function (form) {
                    if (closed()) return;
                    if (session.cleanupClassificationControl) session.cleanupClassificationControl();
                    session.classificationControlReady = false;
                    installClassification(form, session, rules).catch(function (error) {
                        if (!closed()) session.fail(error);
                    });
                };
                if (session.classControlForm) session.attachClassificationControl(session.classControlForm);
            }
            session.refreshReady(); session.notify();
            return cleanup;
        }).catch(function (error) { cleanup(); throw error; });
    }
    /** 분류 폼도 같은 규칙·검증·라벨 처리를 사용하고 원래 모델/저장 경로는 유지합니다. */
    function installClassification(form, session, rules) {
        var ui = form.propertiesUI;
        if (!ui || !ui.elements || !ui.elements.formSection || typeof ui.updateTableManager !== "function" || typeof ui.initData !== "function") {
            return Promise.reject(new Error("분류 속성 UI의 initData/updateTableManager 연결을 확인해 주세요."));
        }
        // Properties 생성에 이미 사용된 OOTB 상수입니다. 기본 폼 로딩에는 추가 의존성을 만들지 않습니다.
        var ClassifConstants;
        try { ClassifConstants = require("DS/ClassificationProp/constants/ClassifPropConstants"); }
        catch (error) { return Promise.reject(error); }
        var view = {propModel: form.model, data: {},
            propUI: {getFormSection: function () { return ui.elements.formSection; }},
            // updateTableManager만 호출하면 기존 조회 모드가 유지되어 입력창이 생기지 않습니다.
            refresh: function () { return ui.initData([form.model], {edition: ClassifConstants.FORCE_READWRITE}); }};
        return install({listview: view, skeleton: form.root}, session,
            {classification: true, rules: rules, propertiesUI: ui});
    }
    return {install: install, validateWithoutMessages: validateWithoutMessages};
});
