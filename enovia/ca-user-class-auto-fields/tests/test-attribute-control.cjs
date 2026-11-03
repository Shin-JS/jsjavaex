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
 const session={type:'sdxECChangeAction',context:'ctx::Leader.Org.A',tenant:'OnPremise',status:'loading',attributeControlState:'CREATE',classificationControlNames:new Set(),
  refreshReady(){this.refreshes=(this.refreshes||0)+1;},notify(){},showMessage(message){this.message=message;}};
 const facet={listview:view,skeleton};
 return {fields,field:name=>Object.values(fields).find(f=>f.name===name),classField,view,model,session,facet,
  label:name=>{const line=organizers.Attributes._forms[0].fields.find(l=>l._idAttr===Object.values(fields).find(f=>f.name===name).getIdentifier());return line.elements.flexLine.querySelector('.formLabel');},
  renders:()=>renders,submits:()=>submits,events:()=>events};
}
function classificationFixture(f) {
 const root=document.createElement('div');root.style.visibility='hidden';f.facet.skeleton.appendChild(root);
 const fields={};['DisplayOnly','CheckOnly','Both','Neither','Denied','Unlisted'].forEach((name,i)=>{
  const field=new Field(name+'CCMAttr',{extension:'C1',facet:'C1',section:'Class',positionUI:'0',value:[],valueDB:[],mandatory:true,visible:true});
  fields[field.getIdentifier()]=field;
 });
 let lines=[],renders=0;
 const model={getAllAttributes:()=>fields,get:id=>id==='objectId'?'C1':fields[id],
  values:()=>Object.values(fields),set(id,value){fields[id]=value;}};
 const section={getOrganizers:()=>({C1:{_forms:[{fields:lines}]}})};
 const ui={elements:{formSection:section},updateTableManager(){
  renders++;root.querySelector('.class-lines')?.remove();const body=document.createElement('div');body.className='class-lines';lines=[];
  Object.values(fields).sort((a,b)=>a.positionUI.localeCompare(b.positionUI,undefined,{numeric:true})).forEach(field=>{
   // OOTB ClassificationProp does not consume visible; control must hide its DOM line explicitly.
   const flex=document.createElement('div'),label=document.createElement('div');flex.className='flexLine';label.className='formLabel';flex.appendChild(label);
   if(field.mandatory){const icon=document.createElement('span');icon.className='attrMand';label.appendChild(icon);}
   body.appendChild(flex);lines.push({_idAttr:field.getIdentifier(),elements:{flexLine:flex},getContent:()=>flex});
  });root.appendChild(body);
 }};
 ui.updateTableManager();
 const original=ui.updateTableManager;
 f.session.classId='C1';
 return {form:{root,model,propertiesUI:ui},fields,ui,original,root,model,
  field:name=>Object.values(fields).find(v=>v.name===name+'CCMAttr'),
  line:name=>lines.find(l=>fields[l._idAttr].name===name+'CCMAttr').elements.flexLine,
  names:()=>lines.filter(l=>l.elements.flexLine.style.display!=='none').map(l=>fields[l._idAttr].name.replace(/CCMAttr$/,''))};
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
 // Rules arriving before the classification controller must not leave the entire basic form blank.
 f=fixture();delete f.session.classificationControlNames;f.field('DisplayOnly').valueDB='early-value';
 const baseOnly=new Field('BaseOnly',{visible:false});f.model.set(baseOnly.getIdentifier(),baseOnly);
 const early=api.install(f.facet,f.session,{});await tick();const earlyRules=rules();earlyRules.set('BaseOnly',rule('BaseOnly',50));resolveRules(earlyRules);const earlyCleanup=await early;
 assert.equal(f.field('DisplayOnly').visible,true);assert.equal(f.field('DisplayOnly').readOnly,true);assert.equal(f.field('Unlisted').visible,false);assert.equal(baseOnly.visible,true);assert.equal(baseOnly.readOnly,true);
 const lateClass=classificationFixture(f);f.session.attachClassificationControl(lateClass.form);await tick();
 assert.equal(f.field('DisplayOnly').visible,false);assert.equal(f.field('DisplayOnly').valueDB,'early-value');
 assert.equal(lateClass.field('DisplayOnly').visible,true);assert.equal(f.session.classificationControlReady,true);assert.equal(baseOnly.visible,true);assert.equal(baseOnly.readOnly,false);
 earlyCleanup();
 // Classification arriving before rules uses the same rule snapshot, with no second request.
 f=fixture();f.field('DisplayOnly').valueDB='base-original';f.field('Both').valueDB='base-value';const cf=classificationFixture(f);f.session.attributeControlState='In Work';f.session.classControlForm=cf.form;delete f.session.classificationControlNames;
 const base=api.install(f.facet,f.session,{});await tick();assert.equal(f.field('Both').visible,false);assert.equal(seenRequest.state,'In Work');
 assert.equal(cf.root.style.visibility,'hidden');const classRules=rules();classRules.set('Neither',{...classRules.get('Neither'),edit:false});classRules.set('BothExtra',rule('BothExtra',50));resolveRules(classRules);const remove=await base;await tick();
 assert.equal(f.session.classificationControlReady,true);assert.equal(f.field('DisplayOnly').visible,false);assert.equal(f.field('CheckOnly').mandatory,false);assert.equal(f.field('Neither').readOnly,true);assert.equal(cf.root.style.visibility,'');
 assert.deepEqual(cf.names(),['CheckOnly','DisplayOnly','Both','Neither']);assert.equal(cf.field('Both').name,'BothCCMAttr');assert.equal(f.field('DisplayOnly').valueDB,'base-original');assert.equal(f.field('Both').valueDB,'base-value');assert.doesNotThrow(()=>f.session.validateAttributeControl());assert.equal(cf.field('Neither').readOnly,true);
 assert.equal(cf.line('Denied').style.display,'none');assert.equal(cf.line('Unlisted').style.display,'none');
 for(const [name,show,check] of [['DisplayOnly',true,false],['CheckOnly',false,true],['Both',true,true],['Neither',false,false]]){
  assert.equal(cf.field(name).mandatory,check);assert.equal(cf.field(name).facet,'C1');
  assert.equal(!!cf.line(name).querySelector('.sdxECCAControlMandatory'),show);
 }
 assert.throws(()=>f.session.validateClassificationControl(),/CheckOnly.*Both/);
 cf.field('CheckOnly').valueDB=['typed'];cf.field('Both').valueDB=[false];
 assert.doesNotThrow(()=>f.session.validateClassificationControl());
 const denied=new Field('DeniedCCMAttr',{extension:'C1',facet:'C1',visible:true,mandatory:true,valueDB:['keep']});
 cf.model.set(denied.getIdentifier(),denied);assert.equal(denied.mandatory,false);assert.equal(denied.readOnly,true);
 cf.ui.updateTableManager();await tick();assert.equal(cf.line('Denied').style.display,'none');assert.deepEqual(denied.valueDB,['keep']);assert.equal(denied.name,'DeniedCCMAttr');
 const notSuffix=new Field('BothCCMAttrExtra',{extension:'C1',facet:'C1',visible:true,valueDB:['keep']});
 cf.model.set(notSuffix.getIdentifier(),notSuffix);assert.equal(notSuffix.visible,false); // strip trailing suffix only
 // A regenerated class form after rules have arrived is also controlled, while IDs/values stay intact.
 const replacement=classificationFixture(f);f.session.attachClassificationControl(replacement.form);await tick();
 assert.equal(cf.ui.updateTableManager,cf.original);assert.equal(replacement.line('Unlisted').style.display,'none');
 remove();assert.equal(replacement.ui.updateTableManager,replacement.original);assert.equal(f.session.validateClassificationControl,null);
 console.log('PASS: dynamic state, CCMAttr suffix mapping, classification-first duplicates/value preservation, shared base/classification rules, native class-row hiding, ready-order races, rebuild/cleanup,  pending-submit guard, allowlist, Read/Edit, global order across interfaces, four indicator/check combinations, 0/false, BL/model rebuild, values, cleanup, empty/failure/late responses');
})().catch(error=>{console.error(error);process.exitCode=1;});
