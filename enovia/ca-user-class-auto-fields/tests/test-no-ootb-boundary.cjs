'use strict';
// 허용한 Governance 진입 외의 OOTB 수정/동일 모듈 재정의가 패키지에 섞이지 않도록 검사합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const webapps=path.resolve(__dirname,'../webapps');
for(const name of ['ENONewWidget','ClassificationsFacet','ClassificationProp']) {
 assert.equal(fs.existsSync(path.join(webapps,name,name+'.js')),false,'OOTB patch note must not be deployed: '+name);
}
const services=path.join(webapps,'sdxENOChgGovernanceUX/custom/services');
const files=fs.readdirSync(services).filter(name=>name.endsWith('.js'));
assert.deepEqual(files.sort(),['sdxECCAAutoClassService.js','sdxECCACreateService.js','sdxECCADataService.js'].sort());
const ids=new Set();
for(const file of files) {
 const source=fs.readFileSync(path.join(services,file),'utf8');
 assert(!source.includes('widget.sdxECCARuntime'),'no legacy OOTB runtime hook');
 assert(!/require(?:js)?\.config\s*\(|require(?:js)?\.undef\s*\(/.test(source),'no global RequireJS remapping');
 vm.runInNewContext(source,{define(id,deps,factory){
  assert(id.startsWith('DS/sdx'),file+': must not redefine OOTB module '+id);
  assert(!ids.has(id),'duplicate AMD id: '+id);ids.add(id);
 }});
}
const entry=fs.readFileSync(path.join(webapps,'ENOChgGovernanceUX/ENOChgGovernanceUX.js'),'utf8');
assert(entry.includes('entry.launch(options);'));
console.log('PASS: only Governance entry patch; 3 custom bundles; unique custom AMD IDs; no OOTB redefinitions, global loader remapping, or legacy runtime hooks');
