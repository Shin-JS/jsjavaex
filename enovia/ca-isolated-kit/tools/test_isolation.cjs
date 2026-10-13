const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../web/ZCAChangeAction');
function load(name, dependencies = {}) {
  let exported;
  vm.runInNewContext(fs.readFileSync(path.join(root, name + '.js'), 'utf8'), {
    define(id, deps, factory) {
      exported = factory(...deps.map(dep => dependencies[dep]));
    }
  });
  return exported;
}
const Session = load('SelectionSession');
const BaseHelper = {
  getDefaultFacetName() { return 'ENOCreate'; },
  getDefaultFacet() { return {require: 'DS/originalProperties', facet: {name: 'ENOCreate'}, options: {}}; },
  getFacetDefinition(name) {
    return {require: 'DS/originalClassification', facet: {name}, alwaysCalled: true, options: {}};
  }
};
const Helper = load('FacetHelper', {
  'DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper': BaseHelper,
  'ZCAChangeAction/SelectionSession': Session
});
const a = Helper.getFacetList({}, [{name: 'classificationFacet'}], {});
const b = Helper.getFacetList({}, [{name: 'classificationFacet'}], {});
assert.equal(a[0].options.zcaSession, a[1].options.zcaSession);
assert.notEqual(a[0].options.zcaSession, b[0].options.zcaSession);
assert.equal(BaseHelper.getDefaultFacet().require, 'DS/originalProperties');
assert.equal(BaseHelper.getFacetDefinition('classificationFacet').require, 'DS/originalClassification');

const Adapter = load('LibraryAdapter');
const session = a[0].options.zcaSession;
const calls = [];
let complete;
const ctrl = {
  autoComplete: {selectedItems: [], _model: {
    prepareUpdate() { calls.push('prepare'); },
    pushUpdate() { calls.push('push'); }
  }},
  autocompleteLibrary: {},
  _classPathMap: new Map(), _classNameMap: new Map(), _classUsageMap: new Map(), _nodesData: {},
  couldBeSelected(type) { return type === 'General Class'; },
  getClassPath() { return this._classPathMap; }, getClassUsage() { return this._classUsageMap; },
  classifPropertiesUI: {setClassPath() {}, setClassUsage() {}},
  PLMNewCommonWebService: {
    getClassPaths(options) { complete = options.onComplete; },
    constructPath() { return new Map([['class-1', 'Library > Class']]); }
  },
  insertInAutocomplete(component, node) {
    assert.equal(component, this.autocompleteLibrary);
    calls.push('insert');
    return {select() { calls.push('select'); ctrl.autoComplete.selectedItems.push(node); }};
  }
};
const node = {id: 'class-1', plmType: 'General Class', options: {},
  getID() { return this.id; }, getLabel() { return 'Class'; }};
session.attach(ctrl);
async function main() {
  const adapter = new Adapter(session);
  const pending = adapter.add(node);
  assert.equal(ctrl.autoComplete.selectedItems.length, 0);
  complete({});
  await pending;
  assert.equal(ctrl.autoComplete.selectedItems.length, 1);
  assert.deepEqual(calls, ['prepare', 'insert', 'push', 'select']);
  await adapter.add(node);
  assert.equal(ctrl.autoComplete.selectedItems.length, 1);
  assert.equal(b[0].options.zcaSession.controller, null);
  const secondNode = {...node, id: 'class-2'};
  const abandoned = adapter.add(secondNode);
  session.dispose();
  complete({});
  await abandoned;
  assert.equal(ctrl.autoComplete.selectedItems.length, 1);
  console.log('OK: per-dialog isolation, unchanged OOTB helper, shared-controller selection, duplicate prevention, cancelled response');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
