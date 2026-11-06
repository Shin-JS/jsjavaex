'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
let api;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8'),{
 widget:{getValue:key=>({sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction'})[key]},
 setTimeout:()=>1,clearTimeout(){},define(id,deps,factory){if(id.endsWith('/sdxECCAAutoClassService'))api=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});}
});
function makeSession(){
 const facets=[{facet:{name:'ENOCreate'},options:{}},{facet:{name:'classificationFacet'},options:{}}];
 api.attachBridge({defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'A'}}},facets,{});
 const s=facets[0].options.sdxECCAAutoSession;s.classId='C1';s.mandatory=true;return s;
}
const calls=[];
class Form {
 loadModels(model,options){calls.push(['load',this,model,options]);this.model=model;return 'loaded';}
 getModel(){return this.model;}
 _onCompleteLoadModel(response,options){if(response.attribute)assert.equal(response.results[0].data[0].mandatory,false,'prepared before native render');calls.push(['render',this,response,options]);if(response.throw)throw Error('native failure');return 'rendered';}
}
const original=Object.getOwnPropertyDescriptors(Form.prototype);
function setup(delayed=false){
 const s=makeSession(),form=new Form();form.editPropertiesUI={elements:{UIController:{validateModels:()=>[]}}};
 let current=delayed?null:form;
 const events=[];
 const skeleton={getFacetContent(){return current;},publishEvt(event,entry){events.push([event,entry]);
  if(event==='classifAttributeLoaded')assert(Object.hasOwn(entry.content,'loadModels'),'bound before original event consumers');return 'published';}};
 const ctrl={sdxECCAAutoSession:s,accordeonCon:{style:{},querySelectorAll:()=>[]},classifPropertiesView:{controller:{skeleton}}};
 s.controller=ctrl;api.bindClassificationProperties(ctrl,s);
 return {s,form,skeleton,ctrl,events,setCurrent(f){current=f;}};
}
function model(s){return {sdxECCAAutoSession:s,sdxECCAAutoClassId:'C1',get:key=>key==='objectId'?'C1':undefined,values:()=>[]};}
function response(){return {attribute:[{name:'ACCMAttr'}],results:[{data:[{name:'ACCMAttr',extension:'C1',mandatory:true,readOnly:true,value:['kept']}]}]};}
const eager=setup(),m=model(eager.s),options={source:'native'};
assert.equal(eager.form.loadModels(m,options),'loaded');assert.equal(calls.at(-1)[1],eager.form);assert.equal(calls.at(-1)[3],options);
const r=response(),before=r.results[0].data[0];assert.equal(eager.form._onCompleteLoadModel(r,options),'rendered');
assert.equal(r.results[0].data[0].mandatory,false);assert.equal(before.mandatory,true);assert.equal(r.results[0].data[0].readOnly,true);
assert.deepEqual(Array.from(r.results[0].data[0].value),['kept']);assert.equal(eager.s.attributesLoaded,true);
assert.equal(eager.s.classControlForm.model,m);assert.equal(calls.at(-1)[1],eager.form);
const load=eager.form.loadModels,complete=eager.form._onCompleteLoadModel,publish=eager.skeleton.publishEvt;
assert.equal(api.bindClassificationProperties(eager.ctrl,eager.s),true);assert.equal(eager.form.loadModels,load);
assert.equal(eager.form._onCompleteLoadModel,complete);assert.equal(eager.skeleton.publishEvt,publish);
assert.throws(()=>api.bindClassificationProperties(eager.ctrl,makeSession()),/재사용/);
const plain=new Form();assert.equal(plain.loadModels,Form.prototype.loadModels);assert.equal(plain._onCompleteLoadModel,Form.prototype._onCompleteLoadModel);
const blank={results:[]};assert.equal(eager.form._onCompleteLoadModel(blank,options),'rendered');assert.equal(calls.at(-1)[2],blank);
const delayed=setup(true);assert(!Object.hasOwn(delayed.form,'loadModels'));
const entry={facet:{name:'classificationAttiProp'},content:delayed.form};delayed.setCurrent(delayed.form);
assert.equal(delayed.skeleton.publishEvt('classifAttributeLoaded',entry),'published');
assert(Object.hasOwn(delayed.form,'loadModels'));delayed.form.loadModels(model(delayed.s));delayed.form._onCompleteLoadModel(response());
assert.equal(delayed.s.attributesLoaded,true);
for(const flag of ['disposed','transitioning']){
 const f=setup();f.form.loadModels(model(f.s));const n=calls.length;f.s[flag]=true;
 f.form._onCompleteLoadModel(response());f.form.loadModels(model(f.s));assert.equal(calls.length,n,flag+' must block old instance response');
}
const errored=setup();errored.form.loadModels(model(errored.s));errored.s.status='error';const n=calls.length;
errored.form._onCompleteLoadModel(response());assert.equal(calls.length,n);
const late=setup(true);late.s.dispose();late.setCurrent(late.form);late.skeleton.publishEvt('classifAttributeLoaded',{facet:{name:'classificationAttiProp'},content:late.form});
const oldCount=calls.length;late.form.loadModels(model(late.s));late.form._onCompleteLoadModel(response());assert.equal(calls.length,oldCount);
const wrong=setup();assert.equal(wrong.form.loadModels(model(makeSession())),undefined);
wrong.form.loadModels({get:()=> 'C1'});const prior=calls.length;wrong.form._onCompleteLoadModel(response());assert.equal(calls.length,prior);assert.match(wrong.s.error.message,/M 세션/);
const throwing=setup();throwing.form.loadModels(model(throwing.s));assert.throws(()=>throwing.form._onCompleteLoadModel({...response(),throw:true}),/native failure/);
assert.equal(throwing.s.attributesLoaded,false);
assert.equal(api.bindClassificationProperties({classifPropertiesView:{}},makeSession()),false);
assert.deepEqual(Object.getOwnPropertyDescriptors(Form.prototype),original);
console.log('PASS: existing/lazy instance bridge; original this/options/return/throws preserved; prepare before render and notify after; empty reset preserved; same-session idempotence; foreign/stale responses blocked; normal instances and native prototype unchanged');
