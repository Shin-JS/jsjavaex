'use strict';
// 단위 검사는 배포 파일 안의 해당 named AMD 정의를 선택해 기존 대역과 실행합니다.
// 실제 파일 단위 로딩/의존성은 test-consolidated-loading.cjs에서 RequireJS로 별도 검사합니다.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const serviceNames = new Set(['sdxECCAService', 'sdxECCAClassRuleService', 'sdxECCAOrganizationProvider',
 'sdxECCAClassAttributeService', 'sdxECCAAttributeControlService', 'sdxECCAModelSearchService']);
module.exports = function readSource(file, encoding) {
 if (!String(file).replaceAll('\\', '/').includes('/webapps/sdxECCAAutoClass/')) return fs.readFileSync(file, encoding);
 const name = path.basename(file, '.js');
 const bundle = serviceNames.has(name) ? 'sdxECCAService' : 'sdxECCAAutoClass';
 const source = fs.readFileSync(path.join(path.dirname(file), bundle + '.js'), 'utf8');
 let selected;
 vm.runInNewContext(source, {define(id, deps, factory) {
  if (id === 'DS/sdxECCAAutoClass/' + name) selected = {id, deps: Array.from(deps), factory};
 }});
 if (!selected) throw Error('Unknown custom AMD module: ' + name);
 return 'define(' + JSON.stringify(selected.id) + ',' + JSON.stringify(selected.deps) + ',' + selected.factory.toString() + ');';
};
