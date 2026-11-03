'use strict';
const readSource = require('./read-source.cjs');
// NODE_PATH=<linkedom/node_modules> is not required here.
// node tests/test-ootb-classification-edit.cjs <2025-original-directory>
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const dir=process.argv[2];if(!dir)throw Error('Specify 2025 original directory');
const defs=new Map(),window={top:{perfoIncrem:0,performance:{mark(){}}}};
for(const file of ['ClassificationProp','EditPropWidget','ENONewWidget'])vm.runInNewContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),{
 window,define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});}
});
const constants=defs.get('DS/ClassificationProp/constants/ClassifPropConstants').factory();
const propsDef=defs.get('DS/ClassificationProp/facets/Properties/Properties');
const stub={extend:(...args)=>args.at(-1),get:()=>'',setWidgetValue(){}};
const props=propsDef.factory(...propsDef.deps.map(dep=>dep.endsWith('/ClassifPropConstants')?constants:
 dep.startsWith('i18n!')?{get:key=>key}:stub));
for(const readonly of [false,true]){
 const models=[],classes=new Set(),events=[];
 const ctx={_sharedOptions:{editMode:false,readOnly:readonly},isReadOnly:readonly,
  options:{editMode:false,updateSession:false},
  elements:{UIController:{setModels(value){models.splice(0,models.length,...value);}},
   container:{addClassName:name=>classes.add(name),removeClassName:name=>classes.delete(name)}},
  resetUIValues(){},_clearAllLine(){},_activateAddingButton(){},
  publishEvt(name,value){events.push({name,value});},
  _switchEditionMode:props._switchEditionMode,
  addData(value){models.splice(0,models.length,...value);}
 };
 const model={values:['existing value'],changedValues:{A:'keep'}};
 props.initData.call(ctx,[model],{edition:constants.FORCE_READWRITE});
 assert.equal(ctx._sharedOptions.editMode,!readonly);
 assert.equal(models[0],model);assert.equal(model.values[0],'existing value');assert.equal(model.changedValues.A,'keep');
 if(!readonly)assert(events.some(e=>e.name==='editionSwitched'&&e.value===true));
}
const nls={get:key=>key,replace:text=>text};
function field(mandatory,readOnly=false){
 return {name:'A',label:'A',type:'string',visible:true,value:'',valueDB:'',mandatory,readOnly,
  maxlength:-1,minval:'',maxval:'',get(key){if(key==='error')return {};return this[key];},
  resetError(){},setError(message,type){this.error={message,type};},getIdentifier:()=> 'A'};
}
for(const id of ['DS/EditPropWidget/utils/AttributesUtils','DS/ClassificationProp/utils/AttributesUtils']){
 const validator=defs.get(id).factory({isArray:Array.isArray},{commonChar:()=>0},nls);
 for(const [display,check] of [[true,false],[false,true],[true,true],[false,false]]){
  const attr=field(check),model={values:()=>[attr],isMergedModel:()=>false};
  const errors=validator.validateModels([model]);
  assert.equal(!!(errors&&errors.length),check,id+' check='+check+' display='+display);
 }
 const attr=field(true,true);
 const errors=validator.validateModels([{values:()=>[attr],isMergedModel:()=>false}]);
 assert(!errors||!errors.length,'OOTB readonly behavior must be preserved');
}
console.log('PASS: actual Classification Properties.initData FORCE_READWRITE enables edit mode, preserves values and readonly access; actual base/classification OOTB validation follows mandatoryCheck');

// Exercise the real post-load access decision, including the pre-render custom hook.
let custom;
vm.runInNewContext(readSource(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8'),{
 define(id,deps,factory){custom=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});}
});
const controllerDef=defs.get('DS/ClassificationProp/facets/Properties/ClassifPropController');
const controller=controllerDef.factory(...controllerDef.deps.map(dep=>dep.endsWith('/ClassifPropConstants')?constants:stub));
for(const serverReadonly of [false,true]){
 const session={type:'sdxECChangeAction',classId:'C1',mandatory:true};
 const model={sdxECCAAutoSession:session,sdxECCAAutoClassId:'C1'};
 const response={attribute:[{name:'ACCMAttr'}],results:[{data:[{name:'ACCMAttr',extension:'C1',readOnly:serverReadonly}]}]};
 assert.equal(custom.prepareAttributes(model,response),true);
 let readonly=false,rendered=false;
 const ctx={hideLoader(){},_manageNotificationFromAnswer(){},isReadOnly:()=>false,updateReadWriteAccess(){},
  _buildFromResponse(){return {modifyAccess:true,allAttributeAreRO:response.results[0].data.every(a=>a.readOnly===true),oneSuccess:true};},
  getModel:()=>model,editPropertiesUI:{switchComponentMode(value){readonly=value;},setAccordionProperties(){},
   initData(){rendered=true;}}};
 controller._onCompleteLoadModel.call(ctx,response,{initTable:true,buildBehavior:constants.FORCE_DEFAULT});
 assert(rendered);assert.equal(readonly,serverReadonly,'staging must preserve native editable/readonly access');
}
// Initial button checks must use OOTB validation without changing real error state.
const basicUtils=defs.get('DS/EditPropWidget/utils/AttributesUtils').factory({isArray:Array.isArray},{commonChar:()=>0},nls);
const listDef=defs.get('DS/ENONewWidget/ENONew/View/ENOListView');
class Attribute {}
const list=listDef.factory(...listDef.deps.map(dep=>dep==='UWA/Controls/Abstract'?stub:
 dep.endsWith('/EditPropAttributeModel')?Attribute:dep.endsWith('/AttributesUtils')?basicUtils:{}));
const dialogDef=defs.get('DS/ENONewWidget/ENONew/Controller/ENONewDialogController');
const dialogMethods=dialogDef.factory(...dialogDef.deps.map((dep,i)=>i===0?stub:dep.startsWith('i18n!')?nls:{}));
const dialog=Object.assign({},dialogMethods,{viewType:'tabView',isPropertiesFormValid:true,
 View:{evaluateFacetValidation:()=>true},footerButtons:{Ok:{value:'Ok'},Save:{value:'Save'},createBtnCombo:{},Discard:{value:'Discard'}},
 myDialog:{elements:{_checkbox:{}}},removeLoadingOverlay(){}});
let control;
vm.runInNewContext(readSource(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAttributeControl.js'),'utf8'),{
 define(id,deps,factory){control=factory(()=>{});}
});
const attr=Object.assign(new Attribute(),field(true));
// Real EditPropModel.values includes metadata alongside AttributeModel entries.
const modelDef=defs.get('DS/EditPropWidget/models/EditPropModel');
const modelProto=modelDef.factory(...modelDef.deps.map(dep=>dep==='DS/WidgetServices/WidgetServices'?{getTenantID:()=> 'OnPremise'}:stub));
const metadata=Object.values(modelProto.defaults);
assert(metadata.some(value=>typeof value==='string'));
assert(metadata.some(value=>typeof value==='boolean'));
const model={values:()=>[...metadata,null,undefined,attr],getAllAttributes:()=>({...modelProto.defaults,A:attr}),isMergedModel:()=>false};
const view=Object.assign({},list,{propModel:model,isFormValid:true,propUI:{
 validateModel(models){const errors=basicUtils.validateModels(models);return !errors||!errors.length;},
 updateFormSection(){}},checkForUXBLValidation:()=>true,
 dispatchEvent(event,args){assert.equal(event,'onValidActivation');
  if(args[0]){const errors=control.validateWithoutMessages({validateModels:models=>basicUtils.validateModels(models)},model);args=[!errors||!errors.length];}
  dialog.isPropertiesFormValid=args[0];dialog.evaluateValidationStatus();}});
view.updateValidStatus();
assert.equal(attr.error,undefined,'initial button check must not create real validation messages');
assert.equal(view.isFormValid,true,'initial status must not force all fields into native error display');
for(const key of ['Ok','Save','createBtnCombo'])assert.equal(dialog.footerButtons[key].disabled,true);
attr.value=attr.valueDB='entered';view.updateValidStatus();assert.equal(dialog.footerButtons.Ok.disabled,false);
attr.value=attr.valueDB='';attr.isUIModified=true;view.updateValidStatus();assert.equal(dialog.footerButtons.Ok.disabled,true);
assert(attr.error,'native interaction validation must still display errors');
assert(!dialog.footerButtons.Discard.disabled);
attr.isUIModified=false;delete attr.error;view.validateForm();assert(attr.error,'native submit validation remains unchanged');
attr.error={server:true,message:'server error'};const existing=attr.error;control.validateWithoutMessages({validateModels:models=>basicUtils.validateModels(models)},model);assert.equal(attr.error,existing,'quiet checking must not erase existing errors');
console.log('PASS: custom preparation preserves native classification access; quiet native validation disables buttons without initial error messages; interaction and submit retain native messages');
