'use strict';
const readSource = require('./read-source.cjs');
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
let api,config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction',
 sdxECCAAttributeControlState:'In Work',sdxECCACreatePolicy:'sdxECR'};
vm.runInNewContext(readSource(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8'),{
 widget:{getValue:key=>config[key]},setTimeout:()=>1,clearTimeout(){},
 define(id,deps,factory){api=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});}
});
function session(settings={}){
 const data={defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'ctx'}}};
 const facets=[{facet:{name:'ENOCreate'}},{facet:{name:'classificationFacet'}}];
 api.attachBridge(data,facets,settings);return facets[0].options.sdxECCAAutoSession;
}
let s=session();assert.equal(s.attributeControlState,'In Work');
config.sdxECCAAttributeControlState='Approved';assert.equal(s.attributeControlState,'In Work'); // per-dialog snapshot
assert.equal(session().attributeControlState,'Approved');
assert.equal(session({attributeControlState:'ECR_CREATE'}).attributeControlState,'ECR_CREATE');
s.classId='C1';s.mandatory=true;
const model={sdxECCAAutoSession:s,sdxECCAAutoClassId:'C1'};
const original=[{name:'ACCMAttr',extension:'C1',mandatory:true,readOnly:false,value:['keep']},
 {name:'Other',extension:'C2',mandatory:true,readOnly:false}];
const response={attribute:[{name:'ACCMAttr'}],results:[{data:original}]};
assert.equal(api.prepareAttributes(model,response),true);
assert.equal(response.results[0].data[0].mandatory,false);assert.equal(response.results[0].data[0].readOnly,false);
assert.equal(original[0].mandatory,true);assert.equal(original[0].readOnly,false);
assert.deepEqual(response.results[0].data[0].value,['keep']);assert.equal(response.results[0].data[1],original[1]);
// Preserve server readonly flags too; waiting must not invent or remove access.
const locked={name:'ACCMAttr',extension:'C1',readOnly:true};
const lockedResponse={attribute:[{name:'ACCMAttr'}],results:[{data:[locked]}]};
assert.equal(api.prepareAttributes(model,lockedResponse),true);
assert.equal(lockedResponse.results[0].data[0].readOnly,true);
assert.equal(s.classificationControlReady,false);assert.equal(s.classificationControlNames.has('A'),true);assert.equal(s.classificationControlNames.has('ACCMAttr'),false);
const root={style:{}},rendered={get:key=>key==='objectId'?'C1':undefined,values:()=>[]};
const propertiesUI={elements:{UIController:{validateModels(){}}}};
s.controller={accordeonCon:root,classifPropertiesView:{controller:{skeleton:{getFacetContent:()=>({
 getModel:()=>rendered,editPropertiesUI:propertiesUI
})}}}};
api.notifyAttributesLoaded(model,response);
assert.equal(s.attributesLoaded,true);assert.equal(root.style.visibility,'hidden');
assert.equal(s.classControlForm.model,rendered);assert.equal(s.classControlForm.propertiesUI,propertiesUI);
let attached;
s.attachClassificationControl=form=>{attached=form;};
api.notifyAttributesLoaded(model,response);assert.equal(attached.model,rendered);
s.disposed=true;attached=null;api.notifyAttributesLoaded(model,response);assert.equal(attached,null);
console.log('PASS: per-dialog state/config precedence, classification pre-render cloning, legacy class-mandatory override, post-render queue/attach, value preservation and disposed scope');
