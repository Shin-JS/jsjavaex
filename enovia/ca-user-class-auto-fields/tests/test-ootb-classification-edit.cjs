'use strict';
// NODE_PATH=<linkedom/node_modules> is not required here.
// node tests/test-ootb-classification-edit.cjs <2025-original-directory>
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const dir=process.argv[2];if(!dir)throw Error('Specify 2025 original directory');
const defs=new Map(),window={top:{perfoIncrem:0}};
for(const file of ['ClassificationProp','EditPropWidget'])vm.runInNewContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),{
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
