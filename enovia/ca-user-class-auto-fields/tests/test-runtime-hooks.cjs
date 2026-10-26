'use strict';
// Developer verification against local 2025 originals. Users do not run this to deploy.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),sourceDir=process.argv[2];
if(!sourceDir)throw Error('Usage: node tests/test-runtime-hooks.cjs <2025-original-directory>');
const specs=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-hooks.json'),'utf8'));
function collect(text){const rows=[];new vm.Script(text).runInNewContext({define:(id,deps,factory)=>rows.push({id,deps:Array.from(deps),source:factory.toString()})});return rows;}
function replace(source,from,to){assert.equal(source.split(from).length,2,'source mismatch: '+from.slice(0,80));return source.replace(from,()=>to);}
const original=new Map(),patched=new Map();
for(const bundle of ['ENONewWidget','ClassificationsFacet','ClassificationProp','ENOChgGovernanceUX']){
 let text=fs.readFileSync(path.join(sourceDir,bundle+'.js'),'utf8');const rows=collect(text);
 for(const row of rows){original.set(row.id,row);const spec=specs[row.id];if(!spec)continue;let changed=row.source;
  for(const edit of spec.changes)changed=replace(changed,edit.from,edit.to);
  const strict=/^function\([^)]*\)\{["']use strict["'];/.exec(changed);
  if(strict)changed=changed.slice(0,strict[0].length)+'\n'+spec.setup+'\n'+changed.slice(strict[0].length);
  else {const index=changed.indexOf('{')+1;changed=changed.slice(0,index)+'\n'+spec.setup+'\n'+changed.slice(index);}
  text=replace(text,row.source,changed);
 }
 for(const row of collect(text)){assert(!patched.has(row.id));patched.set(row.id,row);}
}
assert.equal(patched.size,original.size);
for(const [id,row] of patched){assert.deepEqual(row.deps,original.get(id).deps,'OOTB dependency changed: '+id);assert(!row.deps.some(d=>/DS\/sdxECCA/.test(d)));if(!specs[id])assert.equal(row.source,original.get(id).source);}
const widgetValues={},widget={getValue:key=>widgetValues[key]};
function run(id,args,globals={}){return vm.runInNewContext('('+patched.get(id).source+')',{widget,console:{log(){},debug(){},error(){}},...globals})(...args);}
const helperId='DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper';
const helper=run(helperId,[{ENONewFACET_CLASSIFICATION:'classificationFacet'},{get:key=>key},{get:key=>key}]);
const data=()=>({defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'ctx'}}});
let facets=helper.getFacetList(data(),[{name:'classificationFacet'}],{});assert(!facets[0].options.sdxECCAAutoSession);
// Real AutoClass: the common helper was already initialized before the custom runtime exists.
const autoRows=collect(fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8'));
const auto=vm.runInNewContext('('+autoRows[0].source+')',{widget,setTimeout:()=>1,clearTimeout(){},Set,Map})(()=>{}, {},{},{});
widgetValues.sdxECCAEnableAutoClassByOrganization=true;widgetValues.sdxECCAAutoClassType='sdxECChangeAction';widget.sdxECCARuntime=auto;
facets=helper.getFacetList(data(),[{name:'classificationFacet'}],{});assert(facets[0].options.sdxECCAAutoSession);assert.equal(facets[1].visible,false);assert.equal(facets[1].alwaysCalled,true);
const next=helper.getFacetList(data(),[{name:'classificationFacet'}],{});assert.notEqual(next[0].options.sdxECCAAutoSession,facets[0].options.sdxECCAAutoSession);
const other=data();other.defaultAttributes.Type.value='Change Request';assert(!helper.getFacetList(other,[{name:'classificationFacet'}],{})[0].options.sdxECCAAutoSession);
delete widget.sdxECCARuntime;widgetValues.sdxECCAEnableAutoClassByOrganization=false;
const dialogId='DS/ENONewWidget/ENONew/Controller/ENONewDialogController';
const dialogArgs=patched.get(dialogId).deps.map(()=>({}));dialogArgs[0]={extend:definition=>definition};const dialog=run(dialogId,dialogArgs);
const calls=[];const normal={viewType:'tabView',onSubmit:(event,callback)=>callback({result:true}),dispatchEvent:(name,args)=>{assert.equal(name,'onCreateBtnClick');assert.equal(args[1].eventID,'createClose');calls.push('original-create');},getUserPreferences:()=>({})};
dialog.onSubmitDialog.call(normal,'createClose');assert.deepEqual(calls,['original-create']);
widget.sdxECCARuntime={canSubmitDialog:()=>false};
dialog.onSubmitDialog.call({resetButtonLabel:()=>calls.push('label'),disableFormInput:()=>calls.push('restore')},'createClose');assert.deepEqual(calls.slice(-2),['label','restore']);
delete widget.sdxECCARuntime;
// New custom entry keeps the caller's options and installs the runtime before CreateNew.
let entryFactory;new vm.Script(fs.readFileSync(path.join(root,'webapps/sdxECCA/sdxECCA.js'),'utf8')).runInNewContext({define:(id,deps,factory)=>{assert.equal(id,'DS/sdxECCA/sdxECCA');assert.deepEqual(Array.from(deps),['DS/sdxECCAAutoClass/sdxECCAAutoClass']);entryFactory=factory;},widget});
const runtime={isEnabled:()=>true,configureCreateType:opts=>{opts.type='sdxECChangeAction';opts.options.typeName='Change Action';}};
const entry=entryFactory(runtime),options={type:'Change Action',options:{preferedType:'Change Action'},events:{}};
entry.launch(options,configured=>{assert.equal(widget.sdxECCARuntime,runtime);assert.equal(configured.type,'sdxECChangeAction');assert.equal(configured.events,options.events);});assert.equal(options.type,'Change Action');assert.equal(options.options.typeName,undefined);
runtime.isEnabled=()=>false;assert.throws(()=>entry.launch(options,()=>assert.fail()),/설정/);delete widget.sdxECCARuntime;
// Actual CA module: no custom file requested for normal widgets; target load failure is contained.
const caId='DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction';
function caRun(enabled,mode){widgetValues.sdxECCAEnableAutoClassByOrganization=enabled;const events=[];
 const Launcher=function(){};Launcher.prototype.CreateNew=function(o){events.push('original-create');assert.equal(o.type,'Change Action');};
 const req=(names,ok,fail)=>{if(typeof names==='string')return {cloudProbeUtils:{genericCommandClickEventForAnalytics(){}}};events.push('custom-request');assert.equal(names[0],'DS/sdxECCA/sdxECCA');if(mode==='missing')fail(Error('missing'));else if(mode==='throw')throw Error('loader');else ok({launch:(o,create)=>create(o)});};
 const args=[Launcher,{getGlobalVariable:()=>({tenant:'OnPremise',getSecurityContext:()=> 'ctx'})},{getUserPreference:()=> 'Change Action'},{keys:{createKeys:{CA_DEF_TYPE:'key'}}},{},{},req];
 const command={isClickProcessing:true};run(caId,args).launchCreateChangeActionDialog(command);return {events,command};}
for(const flag of [undefined,false,'false'])assert.deepEqual(caRun(flag).events,['original-create']);
assert.deepEqual(caRun(true).events,['custom-request','original-create']);
for(const mode of ['missing','throw']){const result=caRun(true,mode);assert.deepEqual(result.events,['custom-request']);assert.equal(result.command.isClickProcessing,false);assert.deepEqual(caRun(false).events,['original-create']);}
console.log('PASS: four actual 2025 bundles parse; original AMD dependencies retained; normal creation works without custom files; late runtime loading; scoped sessions; 2025 submit recovery; custom failure contained.');
