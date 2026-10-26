// 공통 OOTB 모듈의 의존성/인자에 커스텀 모듈을 추가하지 않는지 검사합니다.
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'amd-headers.json'),'utf8'));
const fileByModule=name=>name.startsWith('DS/ENONewWidget/')?'ENONewWidget/ENONewWidget.js':
 name.startsWith('DS/ClassificationsFacet/')?'ClassificationsFacet/ClassificationsFacet.js':
 name.startsWith('DS/ClassificationProp/')?'ClassificationProp/ClassificationProp.js':'ENOChgGovernanceUX/ENOChgGovernanceUX.js';
for(const row of fixtures){
 assert.deepEqual(row.modifiedDependencies,row.originalDependencies);
 assert.deepEqual(row.modifiedArguments,row.originalArguments);
 assert(!row.modifiedDependencies.some(id=>id.startsWith('DS/sdxECCA')));
 const text=fs.readFileSync(path.join(root,'webapps',fileByModule(row.module)),'utf8');
 const start=text.indexOf('/* [2025 OOTB 헤더 유지] '+row.module);assert(start>=0);
 const block=text.slice(start,text.indexOf('*/',start));
 assert.deepEqual(JSON.parse(block.match(/\n \* (\[[^\n]+\])/)[1]),row.originalDependencies);
 assert.deepEqual(block.match(/function\(([^)]*)\)/)[1].split(','),row.originalArguments);
}
console.log('PASS: 7 original 2025 AMD headers preserved; no mandatory custom dependencies.');
