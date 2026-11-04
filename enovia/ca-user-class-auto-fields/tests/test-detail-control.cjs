'use strict';
// node tests/test-detail-control.cjs /path/to/2026/EditPropWidget.js
// 공급사 원본은 커밋하지 않습니다. 실제 2026 모델 변환/검증/컨트롤러를 실행합니다.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const path = require('node:path');
process.on('uncaughtException', error=>{console.error(error.stack);process.exitCode=1;});
const definitions = new Map();
const services = {getWidgetValue(){}, setWidgetValue(){}, getTenantID:()=> 'OnPremise'};
const globals = {window:{top:{performance:{mark(){}}}}, UWA:{
 is:(v,t)=>t===undefined ? v!==undefined && v!==null : typeof v===t,
 clone:v=>structuredClone(v)
}, define(id,deps,factory){definitions.set(id,{deps:Array.from(deps),factory});}, console, setTimeout};
vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),globals);
function definition(name){return definitions.get('DS/EditPropWidget/'+name);}
function factory(name, dependencies){const d=definition(name);return d.factory(...d.deps.map(x=>dependencies[x]||{}));}
function Root(){}
Root.extend=function(methods){const Parent=this; function Child(){} Child.prototype=Object.create(Parent.prototype);
 for(const [key,fn] of Object.entries(methods)){
  Child.prototype[key]=typeof fn==='function'?function(...args){const old=this._parent;
   this._parent=Parent.prototype[key]||function(){};try{return fn.apply(this,args);}finally{this._parent=old;}}:fn;
 } Child.extend=Root.extend;return Child;
};
const Field=factory('models/EditPropAttributeModel',{});
const constants={FORCE_DEFAULT:0,FORCE_READWRITE:1,FORCE_READONLY:2,MODEL_DS_ATTR:'_DS_ATTR_',FACET_PROPERTIES:'properties'};
const nls={get:k=>k,replace:s=>s};
const util=factory('utils/EditPropUtils',{
 'DS/EditPropWidget/models/EditPropAttributeModel':Field,
 'DS/EditPropWidget/constants/EditPropConstants':constants,
 'DS/WidgetServices/WidgetServices':services,
 'i18n!DS/EditPropWidget/assets/nls/langEditProp':nls
});
const validator=factory('utils/AttributesUtils',{
 'UWA/Array':{isArray:Array.isArray},'DS/EditPropWidget/utils/EditPropUtils':util,
 'DS/WidgetServices/WidgetServices':services,'i18n!DS/EditPropWidget/assets/nls/langEditProp':nls
});
const Parent=factory('facets/Properties/EditPropController',{
 'DS/EditPropWidget/facets/Common/FacetsBase':Root,
 'DS/EditPropWidget/utils/EditPropUtils':util,
 'DS/EditPropWidget/constants/EditPropConstants':constants,
 'DS/EditPropWidget/models/EditPropAttributeModel':Field,
 'DS/WidgetServices/WidgetServices':services,
 'i18n!DS/EditPropWidget/assets/nls/langEditProp':nls
});
let read, requests=[], saved=0, destroyed=0;
// 실제 OOTB onSave에서 검증 후 commit에 도달하는지 검사합니다.
let Custom;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCADetailService.js'),'utf8'),{
 define(id,deps,fn){Custom=fn((ids,done)=>{
  if(ids[0].endsWith('/sdxECCADataService'))done({});
  else done({read:r=>{requests.push(r.state);return read(r);}});
 },Parent);}, console
});
function makeModel(id='A'){
 const attrs={objectId:id,tenant:'OnPremise'};let changed={};
 return {get:k=>attrs[k],set(k,v){if(typeof k==='object')Object.assign(attrs,k);else attrs[k]=v;},
  getAllAttributes:()=>attrs,values:()=>Object.values(attrs),getTenant:()=>attrs.tenant,
  getChangedValues:()=>changed,setChangedValues:v=>{changed=v;},clearChangedValue:()=>{changed={};},
  isMergedModel:()=>false,addEvent(){},getOptions:()=>({objectId:id}),destroy(){}};
}
function label(){const icons=[];const result={icons,ownerDocument:{createElement:()=>({style:{}})},
 querySelectorAll:selector=>icons.filter(i=>selector==='.mandIcon'&&i.className.includes('mandIcon')),
 querySelector:selector=>icons.find(i=>selector==='.sdxEccaDetailMandatory'&&i.className.includes('sdxEccaDetailMandatory')),
 appendChild:icon=>icons.push(icon)};return result;}
function controller({enabled=true,types=['sdxECChangeAction']}={}){
 const c=Object.create(Custom.prototype);c.model=makeModel();c.context='ctx';c._sdxRevision=1;
 c._sdxDisposed=false;c._sdxPending=false;c._sdxRules=null;c.notifs=[];c.builds=0;
 c.options={sdxEccaDetail:enabled,sdxEccaDetailTypes:types,context:{getSecurityContext:()=>({SecurityContext:c.context})}};
 c.getModel=id=>!id||id===c.model.get('objectId')?c.model:null;c.setModel=m=>{c.model=m;};
 c.hideLoader=c.showLoader=c.updateReadWriteAccess=c.switchSaveButton=c.trackPropInitUXEvent=c.showUXnotifs=()=>{};
 c._setError=m=>c.notifs.push(m);c.getTabId=()=> 'properties';c.isReadOnly=()=>false;
 c._cancelPreviewUrlHandle=()=>{};c.getOccurrence=()=>({getAllModels:()=>[c.model]});
 let organizers={};
 c.editPropertiesUI={editMode:false,isReadOnly:false,elements:{},
  _ManageValidButton(){},setAccordionProperties(){},isReadonly(){return this.isReadOnly;},
  switchComponentMode(v){this.isReadOnly=v;},setOption(){},
  updateTable(){c.builds++;const fields=[];for(const f of c.model.values()){
   if(!(f instanceof Field)||f.isTransient)continue;const l=label();
   if(f.mandatory)l.appendChild({className:'mandIcon',style:{}});
   fields.push({_model:c.model,_idAttr:f.getIdentifier(),getContent:()=>({querySelector:()=>l}),label:l});
  }organizers={default:{_forms:[{fields}]}};},
  initData(models){if(!models.length){organizers={};return;}this.updateTable();},
  getFormSection:()=>({getOrganizers:()=>organizers}),
  _switchEditionMode(){if(!this.isReadOnly)this.editMode=!this.editMode;return true;},
  validateModel:()=>!validator.validateModels([c.model]),
  saveIsNeeded:()=>true
 };
 c._installDetailUI();
 c._commitModels=()=>saved++;c.runBLForUI=()=>Promise.resolve(false);
 c._raiseEvent=()=>{};c._cancelCommitHandle=c._cancelListRequest=()=>{};
 c.clearAllDatas=()=>{destroyed++;};
 return c;
}
function row(type='sdxECChangeAction',state='ECR_CREATE',id='A'){
 const attr=(name,extra={})=>({name,nls:name,path:name,selectable:name,type:'string',value:'',valueDB:'',readOnly:false,UIPosition:1,...extra});
 return {success:true,results:[{physicalID:id,type,current:state,preview_url:'preview',modifyAccess:true,
  data:[attr('Both'),attr('Icon'),attr('Check'),attr('Optional'),attr('Denied',{readOnly:true}),
   attr('Hidden'),attr('Unknown'),attr('NativeHidden',{visible:false}),attr('PlanCCMAttr')],
  basicData:[attr('Basic')],groupData:[attr('Group',{group:'Ext'})]}]};
}
function rules(){return new Map([
 ['Both',{order:10,read:true,edit:true,mandatory:true,mandatoryCheck:true}],
 ['Icon',{order:20,read:true,edit:true,mandatory:true,mandatoryCheck:false}],
 ['Check',{order:30,read:true,edit:true,mandatory:false,mandatoryCheck:true}],
 ['Optional',{order:40,read:true,edit:true,mandatory:false,mandatoryCheck:false}],
 ['Denied',{order:50,read:true,edit:true,mandatory:true,mandatoryCheck:true}],
 ['Hidden',{order:60,read:false,edit:true,mandatory:true,mandatoryCheck:true}],
 ['NativeHidden',{order:70,read:true,edit:true,mandatory:true,mandatoryCheck:true}],
 ['Plan',{order:80,read:true,edit:true,mandatory:false,mandatoryCheck:false}],
 ['Basic',{order:90,read:true,edit:true,mandatory:false,mandatoryCheck:false}],
 ['Group',{order:100,read:true,edit:false,mandatory:false,mandatoryCheck:false}]
]);}
const find=(c,name)=>c.model.values().find(f=>f instanceof Field&&f.name===name);
async function load(c,response=row()){return c._onCompleteLoadModel(response);}
async function flush(){await new Promise(setImmediate);}
(async()=>{
 globals.UWA.Class=Root;
 const hook=fs.readFileSync(path.join(__dirname,'../webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js'),'utf8');
 const d0=hook.slice(hook.indexOf('/* [D0 삽입 후 생성자 전체'));
 const ctor=d0.slice(d0.indexOf('function r()'),d0.indexOf('\n*/'));
 for(const enabled of [false,true]){
  let received;const original={facets:['properties'],context:{},readOnly:false};
  vm.runInNewContext(ctor+';new r();',{
   widget:{getValue:()=>enabled},o:{getpropOptions:()=>original},i:{FACET_PROPERTIES:'properties'},
   t:function(options){received=options;}
  });
  if(enabled){assert.equal(received.facets[0].id,'properties');assert.equal(received.facets[0].options.sdxEccaDetail,true);}
  else {assert.equal(received,original);assert.deepEqual(received.facets,['properties']);}
 }
 // 실제 2026 OOTB가 인스턴스별 facet require 옵션을 처리하는지 확인합니다.
 const Main=factory('controllers/EditPropMainController',{'UWA/Class':Root});
 const mapping={properties:{require:'original',facet:{name:'properties'}}};
 const selected=Main.prototype._getFacet(mapping,{id:'properties',require:'custom',options:{sdxEccaDetail:true}});
 assert.equal(selected.require,'custom');assert.equal(selected.options.sdxEccaDetail,true);
 const otherMapping={properties:{require:'original'}};
 assert.equal(Main.prototype._getFacet(otherMapping,'properties').require,'original');

 read=()=>Promise.resolve(rules());requests=[];
 const c=controller(),input=row(),before=JSON.stringify(input);
 await load(c,input);assert.deepEqual(requests,['ECR_CREATE']);
 assert.equal(JSON.stringify(input),before,'원래 응답을 변경하지 않음');
 assert.equal(find(c,'Both').visible,true);assert.equal(find(c,'Hidden').visible,false);
 assert.equal(find(c,'Unknown').visible,false);assert.equal(find(c,'NativeHidden').visible,false);
 assert.equal(find(c,'Denied').readOnly,true);assert.equal(find(c,'Group').readOnly,true);
 assert.equal(find(c,'Basic').readOnly,false);assert.equal(find(c,'PlanCCMAttr').visible,true);
 assert.equal(validator.validateModels([c.model]),null,'조회 모드에서는 초기 필수 오류 없음');
 assert.equal(Object.keys(c.model.getChangedValues()).length,0,'UI 규칙으로 값 변경을 만들지 않음');
 c.editPropertiesUI._switchEditionMode();
 assert.equal(find(c,'Both').mandatory,true);assert.equal(find(c,'Icon').mandatory,false);
 assert.equal(find(c,'Check').mandatory,true);assert.equal(find(c,'Optional').mandatory,false);
 assert.equal(find(c,'Denied').mandatory,false);assert.equal(find(c,'Hidden').mandatory,false);
 const lines=c.editPropertiesUI.getFormSection().getOrganizers().default._forms[0].fields;
 const iconVisible=name=>lines.find(l=>l._model.get(l._idAttr).name===name).label.icons.filter(i=>i.style.display!=='none').length;
 assert.equal(iconVisible('Both'),1);assert.equal(iconVisible('Icon'),1);assert.equal(iconVisible('Check'),0);
 assert.equal(iconVisible('Denied'),0);
 assert.ok(validator.validateModels([c.model]).length,'실제 2026 OOTB 필수 검증');
 await c.onSave();await flush();assert.equal(saved,0,'필수 빈값 저장 불가');
 for(const name of ['Both','Check']){find(c,name).set('value','ok');find(c,name).set('valueDB','ok');}
 assert.equal(validator.validateModels([c.model]),null);
 await c.onSave();await flush();assert.equal(saved,1,'입력 후 OOTB 저장 경로 사용');
 c.editPropertiesUI._switchEditionMode();assert.equal(find(c,'Both').mandatory,false);assert.equal(iconVisible('Both'),0);

 requests=[];read=r=>Promise.resolve(r.state==='ECR_CREATE'?new Map():rules());
 const fallback=controller();await load(fallback);assert.deepEqual(requests,['ECR_CREATE','CREATE']);
 assert.equal(fallback._sdxRuleState,'CREATE');
 requests=[];read=()=>Promise.resolve(rules());
 const noState=row();delete noState.results[0].current;await load(controller(),noState);
 assert.deepEqual(requests,['ECR_CREATE'],'상태 없는 응답의 1단계 기본값');
 const locked=controller(),lockedResponse=row();lockedResponse.results[0].modifyAccess=false;
 await load(locked,lockedResponse);locked.editPropertiesUI._switchEditionMode();
 assert.equal(locked.editPropertiesUI.isReadonly(),true);assert.equal(find(locked,'Both').mandatory,false);
 const duplicates=controller(),duplicateResponse=row(),duplicateRules=rules();
 duplicateResponse.results[0].data.push(...['Plan','sdxECType','PlanText'].map(name=>({
  name,nls:name,path:name,type:'string',value:'stored',valueDB:'stored',readOnly:false,UIPosition:1
 })));
 for(const name of ['sdxECType','PlanText'])duplicateRules.set(name,{order:1,read:true,edit:true,mandatory:true,mandatoryCheck:true});
 read=()=>Promise.resolve(duplicateRules);await load(duplicates,duplicateResponse);
 assert.equal(find(duplicates,'Plan').visible,false);assert.equal(find(duplicates,'PlanCCMAttr').visible,true);
 assert.equal(find(duplicates,'PlanText').visible,false);assert.equal(find(duplicates,'sdxECType').visible,false);
 assert.equal(find(duplicates,'PlanText').valueDB,'stored');
 requests=[];read=()=>Promise.resolve(new Map());const empty=controller();await load(empty);
 assert.deepEqual(requests,['ECR_CREATE','CREATE']);assert.equal(find(empty,'Both').visible,false);
 requests=[];read=()=>Promise.reject(Error('403 denied'));const failed=controller();await load(failed);
 assert.deepEqual(requests,['ECR_CREATE']);assert.equal(failed._sdxPending,true);assert.equal(failed.notifs[0],'403 denied');
 await failed.onSave();await flush();assert.equal(saved,1);
 requests=[];read=()=>Promise.resolve(new Map());await load(controller(),row('sdxECChangeAction','ECR_REVIEW'));
 assert.deepEqual(requests,['ECR_REVIEW'],'다른 상태는 CREATE로 대체하지 않음');
 requests=[];read=()=>Promise.resolve(rules());
 for(const type of ['Change Action','Change Order','Change Request']){
  const other=controller();await load(other,row(type));assert.equal(find(other,'Unknown').visible,undefined);
 }
 await load(controller({enabled:false}));
 const multi=controller();multi.model.isMergedModel=()=>true;
 multi._buildFromResponse=()=>({modifyAccess:false,allAttributeAreRO:true,oneSuccess:false});await load(multi);
 assert.deepEqual(requests,[],'다른 타입·명시적 표시 없는 창·병합 모델은 제어 조회 없음');

 let resolve;requests=[];read=()=>new Promise(r=>{resolve=r;});
 const late=controller();const pending=load(late);await flush();late.model=makeModel('B');resolve(rules());await pending;
 assert.equal(late.builds,0,'객체 전환 뒤 이전 응답 미적용');
 const contextChange=controller();const pending2=load(contextChange);await flush();contextChange.context='new';resolve(rules());await pending2;
 assert.equal(contextChange.builds,0,'권한 문맥 변경 뒤 이전 응답 미적용');
 const dead=controller();const pending3=load(dead);await flush();dead.destroyComponent();resolve(rules());await pending3;
 assert.equal(dead.builds,0);assert.equal(destroyed,1);
 console.log('PASS: 2026 OOTB facet options, response/model conversion, permission preservation, all four mandatory combinations, OOTB validation/save, empty-only fallback, other-task isolation, stale responses and cleanup');
})().catch(e=>{console.error(e);process.exitCode=1;});
