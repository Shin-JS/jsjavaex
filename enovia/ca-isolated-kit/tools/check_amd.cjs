// Static module checks. No DS platform or browser session required.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(process.argv[2] || path.join(__dirname, '../web/ZCAChangeAction'));
const modules = new Map();
function visit(dir) {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    if (fs.statSync(file).isDirectory()) { visit(file); continue; }
    if (!file.endsWith('.js')) continue;
    const code = fs.readFileSync(file, 'utf8');
    let calls = 0;
    vm.runInNewContext(code, {define(id, deps, factory) {
      calls++;
      if (!id.startsWith('ZCAChangeAction/')) throw Error('Non-private module: ' + id);
      if (modules.has(id)) throw Error('Duplicate module: ' + id);
      if (!Array.isArray(deps) || typeof factory !== 'function') throw Error('Invalid AMD shape: ' + id);
      modules.set(id, {deps, file});
    }}, {filename: file});
    if (calls !== 1) throw Error('Expected one AMD module in ' + file);
  }
}
visit(root);
for (const [id, entry] of modules) {
  for (const dep of entry.deps) {
    if (dep.startsWith('ZCAChangeAction/') && !modules.has(dep)) {
      throw Error('Missing local dependency: ' + id + ' -> ' + dep + '; run prepare_dialog.py');
    }
    if (dep.startsWith('css!ZCAChangeAction/')) {
      const cssFile = path.join(root, dep.slice('css!ZCAChangeAction/'.length));
      if (!fs.existsSync(cssFile)) throw Error('Missing stylesheet: ' + cssFile);
    }
  }
}
const dialog = modules.get('ZCAChangeAction/vendor/DialogController');
if (!dialog || !dialog.deps.includes('ZCAChangeAction/FacetHelper')) {
  throw Error('Custom dialog helper is not connected');
}
if (dialog.deps.includes('DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper')) {
  throw Error('Custom dialog still uses OOTB facet mapping');
}
console.log('OK: ' + modules.size + ' unique private AMD modules; dependencies resolved');
