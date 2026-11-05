'use strict';
// UWA의 동기 _parent 호출 규약만 재현합니다. 실제 UI 렌더러를 대체하지 않습니다.
function Base() { if (this.init) this.init(...arguments); }
Base.prototype.init = function (options) { this.options = options || {}; this.elements = {}; };
Base.extend = function () {
 const Parent = this;
 function Child() { if (this.init) this.init(...arguments); }
 Child.prototype = Object.create(Parent.prototype);
 Child.prototype.constructor = Child;
 Child.extend = Parent.extend;
 for (const definition of arguments) for (const [key, value] of Object.entries(definition)) {
  if (typeof value !== 'function') { Child.prototype[key] = value; continue; }
  Child.prototype[key] = function () {
   const previous = this._parent;
   this._parent = Parent.prototype[key] || function () {};
   try { return value.apply(this, arguments); } finally { this._parent = previous; }
  };
 }
 return Child;
};
module.exports = Base;
