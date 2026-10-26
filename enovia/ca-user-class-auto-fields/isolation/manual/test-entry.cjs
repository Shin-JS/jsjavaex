'use strict';
// Maintainer test against real 2025 sources. The user does not run this to deploy.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const {collect}=require('../build.cjs');
const sourceDir=process.argv[2];if(!sourceDir)throw new Error('2025 source directory required');
const id='DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction';
const original=collect(sourceDir+'/ENOChgGovernanceUX.js').find(r=>r.id===id);
const helper=fs.readFileSync(__dirname+'/entry-guard.js','utf8');
let source=original.source.replace('{','{'+helper+'\n');
const anchor='launchCreateChangeActionDialog:function(r){';
assert.equal(source.split(anchor).length,2);
source=source.replace(anchor,anchor+'if(sdxECCATryLaunch(r,s,typeof widget==="undefined"?null:widget))return;');
function run(factorySource,enabled,mode){
 const events=[],widget={getValue:key=>key==='sdxECCAUsePrivateCreate'?enabled:undefined};
 const localRequire=(names,success,failure)=>{
  if(typeof names==='string')return {cloudProbeUtils:{genericCommandClickEventForAnalytics(){events.push('analytics');}}};
  events.push('private-require');assert.equal(names[0],'DS/sdxECCA/sdxECCA');
  if(mode==='throw')throw Error('loader failed');
  if(mode==='missing')failure(Error('module missing'));
  else success({launch(){events.push('private-launch');if(mode==='launch-error')throw Error('private failed');}});
 };
 const Launcher=function(){};Launcher.prototype.CreateNew=function(options){events.push('original-launch');assert.equal(options.type,'Change Action');};
 const deps=[Launcher,{getGlobalVariable:()=>({tenant:'OnPremise',getSecurityContext:()=> 'ctx'})},
  {getUserPreference:()=> 'Change Action'}, {keys:{createKeys:{CA_DEF_TYPE:'CA_DEF_TYPE'}}}, {},{},localRequire];
 const factory=vm.runInNewContext('('+factorySource+')',{widget,console:{log(){},error(){events.push('error');}}});
 const command={isClickProcessing:true};factory(...deps).launchCreateChangeActionDialog(command);return {events,command};
}
for(const value of [undefined,false,'false'])assert.deepEqual(run(source,value),run(original.source,value));
assert.deepEqual(run(source,true).events,['private-require','private-launch']);
assert.deepEqual(run(source,'true').events,['private-require','private-launch']);
for(const mode of ['missing','throw','launch-error']){
 const r=run(source,true,mode);assert(r.events.includes('error'));assert(!r.events.includes('original-launch'));assert.equal(r.command.isClickProcessing,false);
}
// A missing private bundle never becomes a mandatory dependency of the shared AMD entry.
assert(!original.deps.some(d=>d.includes('sdxECCA')));
const expression='define('+JSON.stringify(id)+','+JSON.stringify(original.deps)+',('+source+'))';
const bundle=fs.readFileSync(sourceDir+'/ENOChgGovernanceUX.js','utf8');
const start=bundle.indexOf('define('+JSON.stringify(id)+',');
const end=bundle.indexOf(',define(',start+1);assert(start>=0&&end>start);
const registrations=new Map();new vm.Script(bundle.slice(0,start)+expression+bundle.slice(end)).runInNewContext({define:(id,deps,factory)=>registrations.set(id,{deps:Array.from(deps),source:factory.toString()})});
const originalRows=collect(sourceDir+'/ENOChgGovernanceUX.js');assert.equal(registrations.size,originalRows.length);
for(const row of originalRows)if(row.id!==id){assert.equal(registrations.get(row.id).source,row.source);assert.deepEqual(registrations.get(row.id).deps,row.deps);}
if(process.argv[3])fs.writeFileSync(process.argv[3],'/* Complete 2025 AMD define expression. Preserve the bundle separator after this call. */\n'+expression+'\n');
console.log('PASS: inactive path equals original; target-only loading; missing/throwing private module handled; original dependencies retained.');
