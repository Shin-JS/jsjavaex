'use strict';
// NODE_PATH=<linkedom/node_modules> node tests/test-attribute-control.cjs
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const {document,MutationObserver}=parseHTML('<html><body></body></html>').window;
const root=path.resolve(__dirname,'..');
let api,loadMode='ok',resolveRules,seenRequest;
vm.runInNewContext(fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass/sdxECCAAttributeControl.js'),'utf8'),{
 document,MutationObserver,console,Map,Set,Promise,
 define(id,deps,factory){api=factory((ids,done,fail)=>{
  assert.equal(ids[0],'DS/sdxECCAAutoClass/sdxECCAAttributeControlService');
  if(loadMode==='missing'){fail(Error('module missing'));return;}
  done({read(request){seenRequest=request;return new Promise(resolve=>{resolveRules=resolve;});}});
 });}
});
class Field {
 constructor(name,extra={}){Object.assign(this,{name,label:name,value:'',valueDB:'',visible:false,mandatory:false,readOnly:false,extension:'ItfA'},extra);}
 get(key){return this[key];}set(key,value){this[key]=value;}getIdentifier(){return this.extension+'-'+this.name;}
}
function fixture(){
 const names=['First','DisplayOnly','CheckOnly','Both','Neither','Denied','Unlisted','sdxECType','PlanText'];
 const fields={};names.forEach((name,i)=>{const f=new Field(name,{extension:i%2?'ItfB':'ItfA'});fields[f.getIdentifier()]=f;});
 const special=new Field('Type',{defaultAttribute:true,visible:true});fields[special.getIdentifier()]=special;
 const classField=new Field('ClassificationOnly',{visible:true,mandatory:true});
 let renders=0,submits=0,events=0,organizers={};
 const model={getAllAttributes:()=>fields,get:id=>fields[id],set(id,value){fields[id]=value;events++;}};
 const skeleton=document.createElement('div');document.body.appendChild(skeleton);
 const view={data:{attributes:{publicAttributes:names.slice(0,4).map(name=>({name})),
  extensionAttributes:names.slice(4).map(name=>({name}))}},propModel:model,
  propUI:{getFormSection:()=>({getOrganizers:()=>organizers})},
  buildModel(data){this.data=data;},
  loadView(){this.refresh();},
  refresh(){renders++;const container=document.createElement('div');const lines=[];
   Object.values(fields).sort((a,b)=>a.positionUI?.localeCompare(b.positionUI,undefined,{numeric:true})||0).forEach(field=>{
    const flex=document.createElement('div');flex.className='flexLine';
    const label=document.createElement('div');label.className='formLabel';
    if(field.mandatory){const native=document.createElement('span');native.className='attrMand';label.appendChild(native);}
    flex.appendChild(label);container.appendChild(flex);lines.push({_idAttr:field.getIdentifier(),elements:{flexLine:flex}});
   });
   skeleton.querySelector('.rendered')?.remove();container.className='rendered';skeleton.appendChild(container);
   organizers={Attributes:{_forms:[{fields:lines}]}};
  },
  addAttributeOnUI(id,show){fields[id].visible=show;},
  onSubmit(callback){submits++;callback(this.nextResult || {saved:true,attributes:{publicAttributes:Object.values(fields).map(f=>({name:f.name,value:f.valueDB}))}});}
 };
 const session={type:'sdxECChangeAction',context:'ctx::Leader.Org.A',tenant:'OnPremise',status:'loading',
  refreshReady(){this.refreshes=(this.refreshes||0)+1;},notify(){},showMessage(message){this.message=message;}};
 const facet={listview:view,skeleton};
 return {fields,field:name=>Object.values(fields).find(f=>f.name===name),classField,view,model,session,facet,
  label:name=>{const line=organizers.Attributes._forms[0].fields.find(l=>l._idAttr===Object.values(fields).find(f=>f.name===name).getIdentifier());return line.elements.flexLine.querySelector('.formLabel');},
  renders:()=>renders,submits:()=>submits,events:()=>events};
}
const rule=(name,order,mandatory=false,mandatoryCheck=false,read=true,edit=true)=>({name,order,read,edit,mandatory,mandatoryCheck});
const rules=()=>new Map([
 rule('DisplayOnly',20,true,false),rule('CheckOnly',10,false,true),
 rule('Both',30,true,true),rule('Neither',40),rule('Denied',0,true,true,false),
 rule('First',1,false,false,true,false),rule('sdxECType',2),rule('PlanText',3),
 rule('NotInTypeInfo',4)
].map(r=>[r.name,r]));
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 let f=fixture(),originalSet=f.model.set,originalRefresh=f.view.refresh;
 const pending=api.install(f.facet,f.session,{});await tick();
 assert.equal(seenRequest.securityContext,f.session.context);assert.equal(f.session.attributeControlReady,undefined);
 let out;f.view.onSubmit(r=>{out=r;});assert.equal(out,false);assert.equal(f.submits(),0);
 resolveRules(rules());const cleanup=await pending;await tick();
 assert.equal(f.session.attributeControlReady,true);
 assert.equal(f.field('Unlisted').visible,false);assert.equal(f.field('Denied').visible,false);
 assert.equal(f.field('sdxECType').visible,false);assert.equal(f.field('PlanText').visible,false);
 assert.equal(f.field('Type').visible,true);assert.equal(f.classField.mandatory,true);
 assert.equal(f.field('First').readOnly,true);
 const shown=Object.values(f.fields).filter(v=>v.visible&&!v.defaultAttribute).sort((a,b)=>a.positionUI.localeCompare(b.positionUI,undefined,{numeric:true})).map(v=>v.name);
 assert.deepEqual(shown,['First','CheckOnly','DisplayOnly','Both','Neither']);
 for(const [name,mandatory,check] of [['DisplayOnly',true,false],['CheckOnly',false,true],['Both',true,true],['Neither',false,false]]){
  assert.equal(f.field(name).mandatory,check);
  assert.equal(!!f.label(name).querySelector('.sdxECCAControlMandatory'),mandatory);
 }
 assert.throws(()=>f.session.validateAttributeControl(),/CheckOnly.*Both/);
 f.field('CheckOnly').valueDB=0;f.field('Both').valueDB=false;
 assert.doesNotThrow(()=>f.session.validateAttributeControl()); // 0/false are valid
 f.view.onSubmit(r=>{out=r;});assert.equal(out.saved,true);
 f.field('CheckOnly').valueDB=null;f.field('CheckOnly').value='stale';
 assert.throws(()=>f.session.validateAttributeControl(),/CheckOnly/);f.field('CheckOnly').valueDB=0;
 f.view.nextResult={attributes:{publicAttributes:[{name:'CheckOnly',value:''},{name:'Both',value:false}]}};
 f.view.onSubmit(r=>{out=r;});assert.equal(out,false);delete f.view.nextResult;
 // BL replaces a model with conflicting flags; policy applies before original model.set.
 const unlisted=new Field('Unlisted',{visible:true,mandatory:true,valueDB:'keep-hidden'});
 f.model.set(unlisted.getIdentifier(),unlisted);assert.equal(unlisted.visible,false);assert.equal(unlisted.mandatory,false);assert.equal(unlisted.valueDB,'keep-hidden');
 const injected=new Field('InjectedByBL',{visible:true,mandatory:true,valueDB:'keep'});
 f.model.set(injected.getIdentifier(),injected);assert.equal(injected.visible,false);assert.equal(injected.mandatory,false);
 const first=new Field('First',{visible:true,readOnly:false,valueDB:'unchanged'});
 f.model.set(first.getIdentifier(),first);assert.equal(first.readOnly,true);assert.equal(first.valueDB,'unchanged');
 f.view.addAttributeOnUI(unlisted.getIdentifier(),true);assert.equal(unlisted.visible,false);
 f.view.refresh();await tick();assert.equal(f.label('Both').querySelectorAll('.sdxECCAControlMandatory').length,1);
 // New OOTB model on refresh retains policy and no new network request.
 f.view.buildModel(f.view.data);f.view.loadView();await tick();assert.equal(f.field('First').readOnly,true);
 cleanup();assert.equal(f.model.set,originalSet);assert.equal(f.view.refresh,originalRefresh);
 assert.equal(f.session.validateAttributeControl,null);assert.equal(f.facet.skeleton.querySelector('style'),null);
 // Closing/context change before a response cannot expose fields; cleanup is available while pending.
 for(const change of ['disposed','transitioning']){
  f=fixture();const p=api.install(f.facet,f.session,{});await tick();
  const renders=f.renders();f.session[change]=true;f.session.cleanupAttributeControl();
  resolveRules(rules());await p;assert.equal(f.renders(),renders);assert.equal(f.field('First').visible,false);
 }
 loadMode='missing';f=fixture();await assert.rejects(api.install(f.facet,f.session,{}),/missing/);
 assert.equal(f.field('First').visible,false);assert.equal(f.session.attributeControlReady,undefined);
 loadMode='ok';f=fixture();const empty=api.install(f.facet,f.session,{});await tick();resolveRules(new Map());await empty;
 assert(Object.values(f.fields).filter(v=>!v.defaultAttribute).every(v=>v.visible===false));
 f.session.cleanupAttributeControl();
 console.log('PASS: MX/CREATE request scope, pending-submit guard, allowlist, Read/Edit, global order across interfaces, four indicator/check combinations, 0/false, BL/model rebuild, values, cleanup, empty/failure/late responses');
})().catch(error=>{console.error(error);process.exitCode=1;});
