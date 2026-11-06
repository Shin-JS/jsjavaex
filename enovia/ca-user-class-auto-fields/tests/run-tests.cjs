'use strict';
// ENOVIA 원본 없이 실행 가능한 회귀 검사입니다.
// 개발자 의존성: linkedom, requirejs (NODE_PATH로 지정 가능). 서버에는 배포하지 않습니다.
const fs = require('node:fs'), path = require('node:path'), {spawnSync} = require('node:child_process');
const needsOriginal = new Set(['test-property-native-lifecycle.cjs', 'test-amdloader-2026.cjs', 'test-governance-2026.cjs', 'test-runtime-hooks.cjs', 'test-model-search-reference.cjs',
 'test-ootb-validation.cjs', 'test-ootb-control-layout.cjs', 'test-ootb-classification-edit.cjs', 'test-ootb-button-state.cjs']);
const files = fs.readdirSync(__dirname).filter(name => /^test-.*\.cjs$/.test(name) && !needsOriginal.has(name)).sort();
let failures = 0;
for (const file of files) {
 const result = spawnSync(process.execPath, [path.join(__dirname, file)], {encoding: 'utf8'});
 if (result.status !== 0) { failures++; process.stderr.write(file + '\n' + (result.stdout || '') + (result.stderr || '')); }
 else console.log('PASS ' + file);
}
console.log(`${files.length - failures}/${files.length} passed; ${needsOriginal.size} vendor-original checks require separate inputs`);
process.exitCode = failures ? 1 : 0;
