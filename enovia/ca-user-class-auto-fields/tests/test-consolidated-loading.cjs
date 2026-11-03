'use strict';
// 실제 배포 파일 세 개만 RequireJS로 로드합니다. 단위 검사 소스 선택기는 사용하지 않습니다.
const assert = require('node:assert/strict'), path = require('node:path');
const requirejs = require('requirejs');
const root = path.resolve(__dirname, '../webapps');
const requested = [], instantiated = [];
const originalLoad = requirejs.load;
requirejs.load = function (context, id, url) { requested.push(id); return originalLoad.call(this, context, id, url); };
requirejs.onResourceLoad = (context, map) => instantiated.push(map.id);
const values = {sdxECCAEnableAutoClassByOrganization: true, sdxECCAAutoClassType: 'sdxECChangeAction'};
global.widget = {getValue: name => values[name]};
// ENOVIA 외부 의존성이 필요한 기능을 실행할 때만 로드되는지도 확인합니다.
requirejs.define('DS/WAFData/WAFData', [], () => ({}));
requirejs.define('DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices', [], () => ({}));
const req = requirejs.config({baseUrl: root, paths: {
 'DS/sdxENOChgGovernanceUX': path.join(root, 'sdxENOChgGovernanceUX')
}});
const load = ids => new Promise((resolve, reject) => req(ids, (...modules) => resolve(modules), reject));
(async function () {
 const [entry] = await load(['DS/sdxENOChgGovernanceUX/custom/service/sdxECCACreateService']);
 const result = entry.launch({options: {preserved: true}}, options => {
  assert.equal(options.type, 'sdxECChangeAction');
  assert.equal(options.options.typeName, 'Change Action');
  assert.equal(options.options.preserved, true);
  return 'created';
 });
 assert.equal(result, 'created');
 assert.equal(typeof widget.sdxECCARuntime.canSubmitDialog, 'function');
 assert.deepEqual(requested.slice().sort(), [
  'DS/sdxENOChgGovernanceUX/custom/service/sdxECCACreateService', 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCAAutoClassService', 'DS/sdxENOChgGovernanceUX/custom/service/sdxECCADataService'
 ].sort());
 assert.ok(!instantiated.includes('DS/WAFData/WAFData'), 'optional REST dependencies stay lazy');
 // 생성창/서비스 파일이 이미 등록한 내부 AMD 모듈은 별도 URL로 요청하지 않습니다.
 const [control, search, controlService, modelService] = await load([
  'DS/sdxECCAAutoClass/sdxECCAAttributeControl', 'DS/sdxECCAAutoClass/sdxECCAObjectSearch',
  'DS/sdxECCAAutoClass/sdxECCAAttributeControlService', 'DS/sdxECCAAutoClass/sdxECCAModelSearchService'
 ]);
 assert.equal(typeof control.install, 'function'); assert.equal(typeof search.install, 'function');
 assert.equal(typeof controlService.read, 'function'); assert.equal(typeof modelService.readAttributes, 'function');
 assert.equal(requested.length, 3);
 // 공통 모듈은 위젯 설정을 캐시하지 않고 현재 위젯만 확인합니다.
 values.sdxECCAEnableAutoClassByOrganization = false;
 assert.equal(widget.sdxECCARuntime.isEnabled(), false);
 assert.throws(() => entry.launch({}, () => {}), /설정/);
 delete global.widget;
 console.log('PASS: actual RequireJS cold load uses 3 files, internal modules need no old URLs, REST stays lazy, widget settings remain isolated');
})().catch(error => {console.error(error); process.exitCode = 1;});
