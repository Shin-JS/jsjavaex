'use strict';
// 단위 검사용으로 통합 파일에서 named AMD 정의를 선택합니다. 실제 파일 로딩은 별도 검사합니다.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const serviceNames = new Set(['sdxECCAService', 'sdxECCADataService', 'sdxECCAClassRuleService', 'sdxECCAOrganizationProvider',
 'sdxECCAClassAttributeService', 'sdxECCAAttributeControlService', 'sdxECCAModelSearchService']);
const directory = path.resolve(__dirname, '../webapps/sdxENOChgGovernanceUX/custom/service');
const primaryIds = {
 sdxECCAAutoClass: 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCAAutoClassService',
 sdxECCAAutoClassService: 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCAAutoClassService',
 sdxECCAService: 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCADataService',
 sdxECCADataService: 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCADataService'
};
module.exports = function readSource(file, encoding) {
 const location = String(file).replaceAll('\\', '/');
 if (!location.includes('/webapps/sdxECCAAutoClass/') && !location.includes('/webapps/sdxENOChgGovernanceUX/custom/service/')) {
  return fs.readFileSync(file, encoding);
 }
 const name = path.basename(file, '.js');
 const bundle = serviceNames.has(name) ? 'sdxECCADataService' : 'sdxECCAAutoClassService';
 const source = fs.readFileSync(path.join(directory, bundle + '.js'), 'utf8');
 const wanted = primaryIds[name] || 'DS/sdxECCAAutoClass/' + name;
 let selected;
 vm.runInNewContext(source, {define(id, deps, factory) {
  if (id === wanted) selected = {id, deps: Array.from(deps), factory};
 }});
 if (!selected) throw Error('Unknown custom AMD module: ' + name);
 return 'define(' + JSON.stringify(selected.id) + ',' + JSON.stringify(selected.deps) + ',' + selected.factory.toString() + ');';
};
