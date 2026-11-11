'use strict';
// node tests/test-governance-2026.cjs <R2026x ENOChgGovernanceUX.js 또는 원본 AMD 모듈>
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=process.argv[2];if(!file)throw Error('Specify R2026x Governance source');
const id='DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction';
const source=fs.readFileSync(file,'utf8'),defs=new Map();
function collect(text){const found=new Map();vm.runInNewContext(text,{define(name,deps,factory){found.set(name,{deps:Array.from(deps),factory});}});return found;}
for(const [name,def] of collect(source))defs.set(name,def);
const row=defs.get(id);assert(row,'R2026x CA creation module');
const spec=require('./runtime-hooks.json')[id],headers=require('./amd-headers.json').find(x=>x.module===id);
assert.equal(spec.referenceVersion,'R2026x');assert.equal(spec.referenceBlob,'2e8f017f2471ff3fd657b862f2c4e201f9932906');
assert.deepEqual(row.deps,headers.originalDependencies);
assert.deepEqual(row.factory.toString().match(/^function\(([^)]*)\)/)[1].split(','),headers.originalArguments);
let changed=row.factory.toString();
for(const edit of spec.changes){assert.equal(changed.split(edit.from).length,2,'R2026x source mismatch: '+edit.from);changed=changed.replace(edit.from,()=>edit.to);}
const start=changed.indexOf('{')+1;changed=changed.slice(0,start)+'\n'+spec.setup+'\n'+changed.slice(start);
const patched=source.replace(row.factory.toString(),()=>changed),after=collect(patched);
assert.equal(after.size,defs.size);
for(const [name,original] of defs){assert.deepEqual(after.get(name).deps,original.deps);if(name!==id)assert.equal(after.get(name).factory.toString(),original.factory.toString());}
let enabled=false,mode='ok';
function run(flag,loadMode='ok') {
 enabled=flag;mode=loadMode;
 const calls=[],preferences=[],command={isClickProcessing:true};let options;
 const Launcher=function(){};Launcher.prototype.CreateNew=value=>{calls.push('native-create');options=value;};
 const globalService={getGlobalVariable:()=>({tenant:'OnPremise',getSecurityContext:()=> 'ctx::Leader.Org.Space'}),
  setDialogEventForLoader(){calls.push('native-loader');}};
 const loader=(names,done,fail)=>{
  if(typeof names==='string') {
   if(names.endsWith('/ChgCloudProbeUtils'))return {cloudProbeUtils:{genericCommandClickEventForAnalytics(){calls.push('analytics');}}};
   if(names.endsWith('/ChgChangeOrderHome'))return {launchPropertyPanelContext(){calls.push('panel');}};
   if(names.endsWith('/ChgChangeActionUtil'))return {displayObjectInfoInsideIDcard(){calls.push('idcard');}};
   assert.fail('Unexpected native dependency: '+names);
  }
  assert.equal(names[0],'DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService');calls.push('custom-request');
  if(mode==='fail')return fail(Error('custom module failed'));
  done({launch(value){calls.push('custom-create');options=value;}});
 };
 const factory=vm.runInNewContext('('+changed+')',{
  widget:{getValue:()=>enabled},console:{log(){},error(){}},document:{getElementsByClassName:()=>[]}
 });
 const module=factory(Launcher,globalService,{getUserPreference:()=> 'Change Action',saveUserPreference:value=>preferences.push(value)},
  {keys:{createKeys:{CA_DEF_TYPE:'default-type'}}},{CHG_NEW_CHANGE_ACTION_FORM:'New CA'},{mask(){}},loader);
 module.launchCreateChangeActionDialog(command);
 return {calls,preferences,command,options};
}
for(const flag of [false,undefined,'false']) {
 const result=run(flag);assert.deepEqual(result.calls,['analytics','native-create','native-loader']);
 result.options.events.onSuccess({result:[{identifier:'CA',type:'Change Action'}]});
 assert.equal(result.preferences.length,1);assert.deepEqual(result.calls.slice(-2),['panel','idcard']);
}
for(const flag of [true,'true']) {
 const result=run(flag);assert.deepEqual(result.calls,['analytics','custom-request','custom-create','native-loader']);
 assert.equal(result.options.context.header.SecurityContext,'ctx::Leader.Org.Space');
 assert.equal(result.options.viewType,'tabView');assert.equal(result.options.activateDraftMode.preference,'IN_WORK');
 assert.equal(result.options.facets[0].facetoptions.isLibrary,true);
 result.options.events.onSuccess({result:[{identifier:'CA',type:'sdxECChangeAction'}]});
 assert.equal(result.preferences.length,0);assert.equal(result.command.isClickProcessing,false);
 assert.deepEqual(result.calls.slice(-2),['panel','idcard']);
}
const failed=run(true,'fail');assert.equal(failed.command.isClickProcessing,false);assert(!failed.calls.includes('custom-create'));
assert.equal(failed.calls.at(-1),'native-loader');
for(const event of ['onFailure','onCancel']){const result=run(true);result.options.events[event]({});assert.equal(result.command.isClickProcessing,false);}
console.log('PASS: actual R2026x Governance header/factory and p preference fragment; native loader/analytics/context/facets/events preserved; target and normal creation separated; other modules unchanged');
