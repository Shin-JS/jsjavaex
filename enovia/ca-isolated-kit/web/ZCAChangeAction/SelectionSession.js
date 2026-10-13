define("ZCAChangeAction/SelectionSession", [], function () {
    "use strict";
    function Session() {
        this.controller = null;
        this.listeners = new Set();
        this.disposed = false;
        this.cleanup = null;
        this.error = null;
    }
    Session.prototype.subscribe = function (listener) {
        this.listeners.add(listener);
        listener(this);
        var self = this;
        return function () { self.listeners.delete(listener); };
    };
    Session.prototype.notify = function () {
        if (!this.disposed) this.listeners.forEach(function (fn) { fn(this); }, this);
    };
    Session.prototype.attach = function (controller) {
        if (this.disposed) return;
        if (this.controller && this.controller !== controller) {
            throw new Error("한 생성 대화상자에 두 분류 컨트롤러를 연결할 수 없습니다.");
        }
        this.controller = controller;
        this.error = null;
        this.notify();
    };
    Session.prototype.selected = function () {
        var ctrl = this.controller;
        return ctrl && ctrl.autoComplete ? ctrl.autoComplete.selectedItems || [] : [];
    };
    Session.prototype.dispose = function () {
        if (this.disposed) return;
        this.disposed = true;
        if (this.cleanup) this.cleanup();
        this.listeners.forEach(function (fn) { fn(this); }, this);
        this.listeners.clear();
        this.controller = null;
    };
    return Session;
});
