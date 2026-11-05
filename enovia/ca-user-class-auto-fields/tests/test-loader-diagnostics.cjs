'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js');
const definitions=new Map(),timers=new Map(),logs=[],requests=[];
const stageId='DS/ClassificationProp/ClassifPropWidget';
const registry={
 [stageId]:{enabled:true,inited:true,depMaps:[{id:'ready'},{id:'pluginDS!DS/Test/Blocked'}],depMatched:[true,false]},
 'pluginDS!DS/Test/Blocked':{enabled:true,inited:false,depMaps:[{id:'pluginDS'}],depMatched:[true]},
 ready:{enabled:true,inited:true,depMaps:[],depMatched:[]},
 unused:{enabled:false,inited:true,depMaps:[{id:'unrelated'}]},
 broken:{enabled:true,inited:false,error:{requireType:'scripterror',message:'private value must not be read'},depMaps:[]}
};
const contexts={_:{registry,defined:{ready:{}}},empty:{}};
vm.runInNewContext(fs.readFileSync(file,'utf8'),{
 define(id,deps,factory){definitions.set(id,factory);},requirejs:{s:{contexts}},
 setTimeout(fn,ms){const id={fn,ms};timers.set(id,id);return id;},clearTimeout(id){timers.delete(id);},
 console:{warn(value){logs.push(value);}}
});
class UI {getUI(){return {};}}
const loader=(ids,done,fail)=>requests.push({ids,done,fail});
const api=definitions.get('DS/sdxECCACreate/ClassificationInitializer')(loader,UI);
const report=api.capture('properties: '+stageId);
assert.equal(report.contexts[0].targetRegistered,true);assert.equal(report.contexts[0].targetDefined,false);
assert.equal(report.pending.length,3);assert.deepEqual(Array.from(report.pending[0].waiting),['pluginDS!DS/Test/Blocked']);
assert.equal(report.pending[2].errorType,'scripterror');assert(!JSON.stringify(report).includes('private value'));
assert.equal(api.capture('module: X',{invalid:null}).pending.length,0);
function session(){return {status:'loading',fail(error){this.status='error';this.error=error;},
 subscribe(fn){this.listener=fn;fn();return ()=>{this.listener=null;};}};}
const config=JSON.stringify({facets:{library:{require:'native-library'}}});
const s=session(),instance=api.create({sdxECCAAutoSession:s});
instance.ui.sdxECCAInitStage='properties: '+stageId;
const firstTimer=Array.from(timers.values())[0];assert.equal(firstTimer.ms,25000);firstTimer.fn();
assert.equal(timers.size,0);assert.equal(s.status,'loading','diagnostics must not change existing failure timing');
assert.equal(logs.length,1);assert(logs[0].includes(stageId));assert.equal(s.listener,null);
registry[stageId].depMatched[1]=true;assert(logs[0].includes('pluginDS!DS/Test/Blocked'),'log is an immutable snapshot');
requests.shift().done(config);requests.shift().done(class {});assert.equal(instance.ui.sdxECCAInitStage,'controller');
const good=api.create({sdxECCAAutoSession:session()});requests.shift().done(config);requests.shift().done(class {});
assert.equal(timers.size,0);assert.equal(good.ui.sdxECCAInitStage,'controller');
const closed=api.create({sdxECCAAutoSession:session()});closed.ui.sdxECCAClosed=true;closed.ui.sdxECCACancelDiagnostics();
assert.equal(timers.size,0);requests.shift().fail(Error('late'));assert.equal(logs.length,1);
const failed=api.create({sdxECCAAutoSession:session()});requests.shift().fail({requireType:'scripterror',requireModules:['bad'],message:'404'});
assert.equal(failed.ui.sdxECCAInitReport.errorType,'scripterror');assert.equal(timers.size,0);
const disposed=session();api.create({sdxECCAAutoSession:disposed});disposed.disposed=true;disposed.listener();
assert.equal(timers.size,0);assert.equal(disposed.listener,null);
const large={};for(let i=0;i<130;i++)large['m'+i]={enabled:true,inited:false};
const bounded=api.capture('module: X',{_:{registry:large}});assert.equal(bounded.pending.length,120);assert.equal(bounded.omitted,10);
console.log('PASS: automatic immutable loader report before existing timeout; waits/errors captured without form values; no timing changes; success/failure/close/dispose cleanup; bounded output');
