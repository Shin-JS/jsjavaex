'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../webapps'),file=(pkg)=>path.join(root,pkg,pkg+'.js');
assert.equal(fs.existsSync(file('ENONewWidget')),false,'ENONewWidget must have no patch note or replacement');
for(const pkg of ['ENOChgGovernanceUX','ClassificationsFacet','ClassificationProp'])assert(fs.existsSync(file(pkg)));
const dir=path.join(root,'sdxENOChgGovernanceUX/custom/services'),ids=new Set();
assert.deepEqual(fs.readdirSync(dir).filter(n=>n.endsWith('.js')).sort(),['sdxECCAAutoClassService.js','sdxECCACreateService.js','sdxECCADataService.js']);
for(const name of fs.readdirSync(dir).filter(n=>n.endsWith('.js'))){
 const source=fs.readFileSync(path.join(dir,name),'utf8');
 assert(!/require(?:js)?\.(config|undef)\s*\(/.test(source));
 vm.runInNewContext(source,{define(id,deps,factory){assert(id.startsWith('DS/sdx'));assert(!ids.has(id));ids.add(id);}});
}
const create=fs.readFileSync(path.join(dir,'sdxECCACreateService.js'),'utf8');
assert(create.includes('widget.sdxECCARuntime = AutoClass'));
assert(!create.includes('classification.require ='));
for(const id of ['ClassificationFacet','ClassificationInitializer','ClassifPropController'])assert(!ids.has('DS/sdxECCACreate/'+id));
assert(!/InitClassificationCmpUI|flattenedSearch|classificationAppsRequire_setting|require\(\[bundleId\]/.test(create));
const auto=fs.readFileSync(path.join(dir,'sdxECCAAutoClassService.js'),'utf8');
assert(!auto.includes('sdxECCAConfigureClassPropertyFacet'));assert(!auto.includes('DS/sdxECCACreate/ClassifPropController'));
console.log('PASS: ENONewWidget untouched; only Governance/F/M/P native patches; native classification IDs retained; no direct initializer, bundle workarounds, copied natives or global RequireJS remapping');
