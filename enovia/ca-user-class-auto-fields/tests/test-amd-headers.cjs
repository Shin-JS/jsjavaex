// 기존 의존성 순서를 유지하면서 커스텀 모듈을 마지막 인자로 받는지 검사합니다.
const fs=require('fs'), path=require('path'), assert=require('assert/strict');
const root=path.resolve(__dirname,'..');
const fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'amd-headers.json'),'utf8'));
const customId='DS/sdxECCAAutoClass/sdxECCAAutoClass';
const fileByModule=name=>name.startsWith('DS/ENONewWidget/')?'ENONewWidget/ENONewWidget.js':
 name.startsWith('DS/ClassificationsFacet/')?'ClassificationsFacet/ClassificationsFacet.js':
 name.startsWith('DS/ClassificationProp/')?'ClassificationProp/ClassificationProp.js':'ENOChgGovernanceUX/ENOChgGovernanceUX.js';
for(const row of fixtures){
 const {originalDependencies:oldDeps,originalArguments:oldArgs,modifiedDependencies:deps,modifiedArguments:args}=row;
 assert.deepEqual(deps.slice(0,-1),oldDeps);assert.equal(deps.at(-1),customId);
 assert.deepEqual(args.slice(0,oldArgs.length),oldArgs);assert.equal(args.at(-1),'sdxECCAAutoClass');
 assert.equal(args.length,deps.length);
 const values=deps.map(id=>({id})), custom=values.at(-1);
 const factory=new Function(...args,'return {custom:sdxECCAAutoClass,original:['+oldArgs.join(',')+']};');
 const result=factory(...values);
 assert.equal(result.custom,custom);
 for(let i=0;i<oldArgs.length;i++)assert.equal(result.original[i],values[i]);
 if(oldDeps.length>oldArgs.length){assert.equal(oldDeps.at(-1).startsWith('css!'),true);assert.equal(args.at(-2),'sdxECCACss');}
 // 적용 메모의 실제 헤더와 fixture를 대조합니다.
 const text=fs.readFileSync(path.join(root,'webapps',fileByModule(row.module)),'utf8');
 const start=text.indexOf('/* [의존성/인자] '+row.module);assert.ok(start>=0);
 const block=text.slice(start,text.indexOf('*/',start));
 assert.deepEqual(JSON.parse(block.match(/\n \* (\[[^\n]+\])/)[1]),deps);
 assert.deepEqual(block.match(/function\(([^)]*)\)/)[1].split(','),args);
}
console.log('PASS: 7 OOTB dependency/factory mappings, custom module last, CSS placeholders, original argument bindings');
