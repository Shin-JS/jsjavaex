// 검색 연결 실패/지연이 생성창 초기화로 전파되지 않는지 확인합니다.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
let api, dependencies, pending=[], loads=0, installed=0, reports=0, mode='missing', config={};
let success;
const source=fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8')
 .replace('installFields: sdxECCAInstallAutoFields,','installFields: sdxECCAInstallAutoFields, testSchedule: sdxECCAScheduleObjectSearch,');
const requireStub=(ids,done,fail)=>{
 loads++;
 if(mode==='missing')fail(new Error('module missing'));
 else if(mode==='throws')done({install(){throw new Error('render differs');}});
 else if(mode==='late')success=done;
 else done({install(){installed++;return ()=>{};}});
};
vm.runInNewContext(source,{
 console:{error(){reports++;}},widget:{getValue:k=>config[k]},
 setTimeout(fn){pending.push(fn);return pending.length;},
 define(id,deps,factory){dependencies=Array.from(deps);api=factory(requireStub,{}, {}, {});}
});
assert.ok(!dependencies.includes('DS/sdxECCAAutoClass/sdxECCAObjectSearch'));
function session(){return {type:'sdxECChangeAction',disposed:false,status:'loading'};}
let s=session();api.testSchedule({},s);assert.equal(loads,0); // 호출자 초기화 중 로딩/렌더링 없음
assert.doesNotThrow(()=>pending.shift()());assert.equal(reports,1);assert.equal(s.status,'loading');
mode='throws';s=session();api.testSchedule({},s);assert.doesNotThrow(()=>pending.shift()());assert.equal(reports,2);
mode='late';s=session();api.testSchedule({},s);pending.shift()();s.disposed=true;
success({install(){installed++;}});assert.equal(installed,0);
mode='ok';s=session();api.testSchedule({},s);pending.shift()();assert.equal(installed,1);assert.equal(typeof s.cleanupObjectSearch,'function');
s=session();api.testSchedule({},s);s.disposed=true;const before=loads;pending.shift()();assert.equal(loads,before);
config.sdxECCAEnableModelSearch=false;api.testSchedule({},session());assert.equal(pending.length,0);
config={};api.testSchedule({},{type:'Change Action'});assert.equal(pending.length,0);
console.log('PASS: no mandatory search AMD dependency, deferred installation, missing module/render exception isolation, late result/closed session, disabled/other type exclusion');
