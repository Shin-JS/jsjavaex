/**
 * CA 우측 속성창 전용 facet. 공통 OOTB prototype/전역 설정은 변경하지 않습니다.
 * OOTB의 facets 옵션으로 이 모듈을 지정한 창만 사용합니다.
 * 서버 조회는 기존 DataService S4, 편집/검증/저장은 EditPropController를 사용합니다.
 */
define("DS/sdxENOChgGovernanceUX/custom/services/sdxECCADetailService", [
    "require",
    "DS/EditPropWidget/facets/Properties/EditPropController"
], function (require, EditPropController) {
    "use strict";

    function value(item) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
            item = item.valueDB !== undefined ? item.valueDB : item.value;
        }
        if (Array.isArray(item)) item = item.length === 1 ? item[0] : null;
        return typeof item === "string" ? item : "";
    }

    function attributes(row) {
        return ["data", "basicData", "groupData"].reduce(function (all, key) {
            return all.concat(Array.isArray(row[key]) ? row[key] : []);
        }, []);
    }

    function property(row, name) {
        var direct = value(row[name]);
        if (direct) return direct;
        var field = attributes(row).find(function (item) { return item.name === name; });
        return value(field);
    }

    // OOTB fillFromServer의 읽기 전용 해석을 유지합니다. 생략된 권한도 임의로 풀지 않습니다.
    function readonly(field) {
        return !(field.readOnly === false || field.readOnly === "No" ||
            (!field.readOnly && field.selectable === "owner"));
    }

    function ruleFor(rules, name) {
        return rules.get(typeof name === "string" ? name.replace(/CCMAttr$/, "") : name);
    }

    function readRules(request) {
        return new Promise(function (resolve, reject) {
            // 통합 파일부터 로딩해야 내부 named AMD 모듈의 별도 URL 요청이 생기지 않습니다.
            require(["DS/sdxENOChgGovernanceUX/custom/services/sdxECCADataService"], function () {
                require(["DS/sdxECCAAutoClass/sdxECCAAttributeControlService"], resolve, reject);
            }, reject);
        }).then(function (service) {
            return service.read(request).then(function (rules) {
                if (!rules || request.isCancelled()) return null;
                if (rules.size || request.state !== "ECR_CREATE") {
                    return {rules: rules, state: request.state};
                }
                // 정상 0건일 때만 대체합니다. 통신/권한/설정 오류는 catch로 대체하지 않습니다.
                var fallback = Object.assign({}, request, {state: "CREATE"});
                return service.read(fallback).then(function (legacy) {
                    return legacy && !request.isCancelled() ? {rules: legacy, state: "CREATE"} : null;
                });
            });
        });
    }

    function controlledResponse(response, rules) {
        var copy = Object.assign({}, response);
        copy.results = response.results.map(function (row) {
            var result = Object.assign({}, row);
            var classificationNames = new Set(attributes(row).filter(function (field) {
                return typeof field.name === "string" && /CCMAttr$/.test(field.name);
            }).map(function (field) { return field.name.replace(/CCMAttr$/, ""); }));
            ["data", "basicData", "groupData"].forEach(function (key) {
                if (!Array.isArray(row[key])) return;
                result[key] = row[key].map(function (field) {
                    var next = Object.assign({}, field), rule = ruleFor(rules, field.name);
                    var show = !!rule && rule.read && field.visible !== false &&
                        field.name !== "sdxECType" && !/Text$/.test(field.name) &&
                        !classificationNames.has(field.name);
                    next.visible = show;
                    next.readOnly = !show || readonly(field) || !rule.edit;
                    // 조회 모드의 초기 빈값 오류를 만들지 않습니다. 편집 시 모델에 설정합니다.
                    next.mandatory = false;
                    if (rule && field.UIPosition !== undefined && field.UIPosition !== null) next.UIPosition = rule.order;
                    return next;
                });
            });
            return result;
        });
        return copy;
    }

    return EditPropController.extend({
        init: function () {
            this._sdxRevision = 0;
            this._sdxDisposed = false;
            this._sdxRules = null;
            this._sdxPending = false;
            this._parent.apply(this, arguments);
            this._installDetailUI();
        },

        loadModels: function () {
            this._sdxRevision++;
            this._sdxRules = null;
            this._sdxPending = true;
            return this._parent.apply(this, arguments);
        },

        _securityContext: function () {
            var context = this.options.context;
            var result = context && typeof context.getSecurityContext === "function" && context.getSecurityContext();
            return result && result.SecurityContext || "";
        },

        _onCompleteLoadModel: function (response, options) {
            var self = this, parent = EditPropController.prototype._onCompleteLoadModel;
            var rows = response && response.results;
            var row = Array.isArray(rows) && rows.length === 1 ? rows[0] : null;
            var types = this.options.sdxEccaDetailTypes || ["sdxECChangeAction"];
            var model = this.getModel();
            if (row && model && !model.isMergedModel() && this._getID(row) &&
                    this._getID(row) !== model.get("objectId")) return;
            // 상위 ChangeAction/isKindOfType이 아니라 실제 DB 타입이 대상일 때만 적용합니다.
            if (this.options.sdxEccaDetail !== true || !row || response.success === false ||
                    response.transactionid || row.ids || !Array.isArray(types) ||
                    types.indexOf(property(row, "type")) < 0 || !model || model.isMergedModel()) {
                this._sdxRules = null;
                this._sdxPending = false;
                return parent.apply(this, arguments);
            }
            var id = this._getID(row);
            if (id !== model.get("objectId")) return; // 이전 선택 객체의 늦은 응답
            var revision = this._sdxRevision, context = this._securityContext();
            var tenant = model.getTenant();
            var state = property(row, "current") || this.options.sdxEccaDetailState || "ECR_CREATE";
            function cancelled() {
                var current = self.getModel();
                return self._sdxDisposed || revision !== self._sdxRevision ||
                    !current || current.get("objectId") !== id || current.getTenant() !== tenant ||
                    self._securityContext() !== context;
            }
            this._sdxPending = true;
            this.editPropertiesUI.initData([]);
            this.editPropertiesUI.switchComponentMode(true);
            this.updateReadWriteAccess(false);
            this.switchSaveButton(false);
            this.showLoader();
            return readRules({
                state: state, securityContext: context, tenant: tenant,
                url: this.options.sdxEccaDetailControlUrl,
                isCancelled: cancelled
            }).then(function (result) {
                if (!result || cancelled()) {
                    if (!self._sdxDisposed && revision === self._sdxRevision) self.hideLoader();
                    return;
                }
                self._sdxRules = result.rules;
                self._sdxRuleState = result.state;
                self._sdxPending = false;
                // 기존 모델 구성·권한 계산·화면 구성으로 돌아갑니다.
                parent.call(self, controlledResponse(response, result.rules), options);
            }).catch(function (error) {
                if (cancelled()) return;
                self._sdxRules = null;
                self._sdxPending = true;
                self.hideLoader();
                self.editPropertiesUI.initData([]);
                self.editPropertiesUI.switchComponentMode(true);
                self.updateReadWriteAccess(false);
                self.switchSaveButton(false);
                self._setError(error.message || "상세 속성 설정을 조회하지 못했습니다.", "error");
            });
        },

        _installDetailUI: function () {
            var self = this, ui = this.editPropertiesUI;
            // 이 인스턴스만 연결합니다. OOTB prototype은 변경하지 않습니다.
            var update = ui.updateTable, mode = ui._switchEditionMode;
            ui.updateTable = function () {
                self._applyMandatory();
                var result = update.apply(this, arguments);
                self._drawMandatory();
                return result;
            };
            ui._switchEditionMode = function () {
                var result = mode.apply(this, arguments);
                self._applyMandatory();
                self._drawMandatory();
                return result;
            };
            this._sdxRestoreUI = function () {
                ui.updateTable = update;
                ui._switchEditionMode = mode;
            };
        },

        _applyMandatory: function () {
            var rules = this._sdxRules, model = this.getModel();
            if (!rules || !model) return;
            var edit = this.editPropertiesUI.editMode === true && !this.editPropertiesUI.isReadonly();
            var all = model.getAllAttributes();
            Object.keys(all).forEach(function (id) {
                var field = all[id];
                if (!field || typeof field.get !== "function") return;
                var rule = ruleFor(rules, field.get("name"));
                field.set("mandatory", !!(edit && rule && rule.mandatoryCheck &&
                    field.get("visible") !== false && !field.get("readOnly")));
            });
        },

        _drawMandatory: function () {
            var rules = this._sdxRules, ui = this.editPropertiesUI;
            if (!rules) return;
            var section = ui.getFormSection(), organizers = section && section.getOrganizers();
            var edit = ui.editMode === true && !ui.isReadonly();
            Object.keys(organizers || {}).forEach(function (key) {
                (organizers[key]._forms || []).forEach(function (form) {
                    (form.fields || []).forEach(function (line) {
                        var field = line._model.get(line._idAttr);
                        var rule = ruleFor(rules, field.get("name"));
                        var root = line.getContent(), label = root.querySelector(".attrLabel");
                        if (!label) return;
                        // MandatoryCheck만 Y일 때도 생기는 OOTB 아이콘을 숨겨 표시 규칙과 분리합니다.
                        Array.prototype.forEach.call(label.querySelectorAll(".mandIcon"), function (icon) {
                            icon.style.display = "none";
                        });
                        var icon = label.querySelector(".sdxEccaDetailMandatory");
                        if (!icon) {
                            icon = label.ownerDocument.createElement("span");
                            icon.className = "sdxEccaDetailMandatory mandIcon wux-ui-3ds wux-ui-3ds-new-create";
                            icon.style.color = "rgb(234,79,55)";
                            label.appendChild(icon);
                        }
                        icon.style.display = edit && rule && rule.mandatory &&
                            field.get("visible") !== false && !field.get("readOnly") ? "" : "none";
                    });
                });
            });
        },

        onSave: function () {
            if (!this._sdxPending) return this._parent.apply(this, arguments);
        },

        onAction: function () {
            if (!this._sdxPending) return this._parent.apply(this, arguments);
        },

        destroyComponent: function () {
            this._sdxDisposed = true;
            this._sdxRevision++;
            if (this._sdxRestoreUI) this._sdxRestoreUI();
            this._sdxRules = null;
            return this._parent.apply(this, arguments);
        }
    });
});
