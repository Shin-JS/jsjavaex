// 서버/WUX 대역 검사입니다. 실제 플랫폼 UI·저장 검증을 대신하지 않습니다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
(async function () {
const flush=()=>new Promise(resolve=>setImmediate(resolve));
let config = {}, seq = 0, validateError = null;
const timers = new Map();
const loadedModules = [];
class Element {
 constructor(){const classes=new Set();this.classList={add:name=>classes.add(name),remove:name=>classes.delete(name),contains:name=>classes.has(name)};this.nodeType=1;this.children=[];this.parentNode=null;this.style={};this.textContent='';}
 appendChild(node){if(node.parentNode)node.parentNode.removeChild(node);this.children.push(node);node.parentNode=this;}
 removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;}
 insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);this.children.splice(this.children.indexOf(next),0,node);node.parentNode=this;}
 setAttribute(){}
 querySelectorAll(){return [];}
 contains(node){return node===this||this.children.some(c=>c.contains(node));}
}
const document = {createElement:()=>new Element(),activeElement:null};
const context = vm.createContext({console,document,Error,Map,Set,Promise,
 widget:{getValue:key=>config[key]},
 setTimeout:fn=>{const id=++seq;timers.set(id,fn);return id;},clearTimeout:id=>timers.delete(id),
 setInterval:fn=>{const id=++seq;timers.set(id,fn);return id;},clearInterval:id=>timers.delete(id),
 require(ids, done){if(ids[0]==='DS/WAFData/WAFData'){done({authenticatedRequest(url,opts){const id=JSON.parse(opts.data).busIDs[0];opts.onComplete({results:[{physicalID:id,data:[{name:'sdxClassAttrMandatory',value:['N']}]}]});}});return;}loadedModules.push(ids[0]);if(ids[0]==='DS/ClassificationProp/ClassifPropWidget'){done({});return;}
  assert.deepEqual(Array.from(ids),['DS/ClassificationProp/utils/AttributesUtils']);
  done({validateAttributes:()=>validateError?[{message:validateError}]:null});}
});
const modules = {};
context.define = function (id, dependencies, factory) {
 modules[id] = factory(...Array.from(dependencies, dep => dep === 'require' ? context.require : modules[dep]));
};
for (const file of ['sdxECCAClassRuleService', 'sdxECCAOrganizationProvider', 'sdxECCAClassAttributeService', 'sdxECCAAutoClass']) {
 vm.runInContext(fs.readFileSync(path.join(root, 'webapps/sdxECCAAutoClass', file + '.js'),'utf8'),context);
}
const api = modules['DS/sdxECCAAutoClass/sdxECCAAutoClass'];
delete context.require; // 지역 require를 캡처했으므로 전역 require 없이도 이후 지연 로딩 가능
assert.ok(api);assert.equal(timers.size,0); // AMD를 로드하는 것만으로 세션을 만들지 않음
assert.equal(context.sdxECCAAttachAutoBridge,undefined); // 전역 함수로 노출되지 않음

function metadata(){return [{facet:{name:'ENOCreate'},options:{}},{facet:{name:'classificationFacet'},options:{}}];}
function data(org='Engineering'){return {defaultAttributes:{Type:{value:'Change Action',range:['Change Action','Other'],rangeNLS:['설계변경','다른 유형'],persistData:[{name:'Change Action',schema:'real'},{name:'Other'}]},SecurityContext:{value:`ctx::Leader.${org}.Space`}}};}
function makeSession(classId='C1',mode='hidden'){
 config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAClassRuleMode:'fixed',sdxECCAFixedClassId:classId,sdxECCAFixedLibraryId:'L1',sdxECCATypeDisplay:mode};
 const facets=metadata();api.attachBridge(data(),facets,{});return {session:facets[0].options.sdxECCAAutoSession,facets};
}
function eventModel(model){
 const events=new Map();
 model.addEvent=(name,fn)=>{if(!events.has(name))events.set(name,new Set());events.get(name).add(fn);};
 model.removeEvent=(name,fn)=>{if(events.has(name))events.get(name).delete(fn);};
 model.emit=name=>{if(events.has(name))for(const fn of events.get(name))fn();};
 model.listenerCount=()=>Array.from(events.values()).reduce((sum,set)=>sum+set.size,0);
 return model;
}
function classificationFacet(ui){return {facetValidation:true,states:[],baseValid:true,occurrenceReady:true,
 getOccurrence(){return this.occurrenceReady?{setValidation(){}}:null;},
 icon:'classification-book',setFacetValidation(){throw new Error('Do not update classification-tab error presentation');},
 initUI:{getController:()=>({plmNewLibraryActive:ui.ctrl})}};}
function makeController(session){
 const parent=new Element(), form=new Element(), sibling=new Element();parent.appendChild(form);parent.appendChild(sibling);form.nextSibling=sibling;
 let request, selectedCount=0;
 const ctrl={accordeonCon:form,container:new Element(),classifPropertiesView:{onInnerResize(){}},
 classifPropModels:[],classifPropertiesUI:{setClassPath(){},setClassUsage(){}},getClassPath(){return []},getClassUsage(){return []},
 _nodesData:{},_classPathMap:new Map(),_classNameMap:new Map(),autoComplete:{selectedItems:[],_model:{prepareUpdate(){},pushUpdate(){}}},
 couldBeSelected:type=>type==='General Class',_getIcon:()=>({iconName:'library-class'}),
 plmNewClassificationFacetData:{createAutocompleteDataTree(){return {}},_createTreeNodeModel(opts){return {options:opts,getID:()=>opts.id}}},
 insertInAutocomplete(_,node){return {getID:node.getID,select(){selectedCount++;ctrl.autoComplete.selectedItems=[this];
 const model=eventModel({get:key=>key==='objectId'?session.classId:undefined,values:()=>[]});
 ctrl.classifPropModels.push(model);api.tagClassModel(ctrl,model,session.classId);}}},
 PLMNewCommonWebService:{get3DSpaceUrl:()=>Promise.resolve('https://example/3dspace'),getClassPaths(opts){request=opts},constructPath:response=>response.chains,extractPath:()=> 'Library > Class'}
 };
 ctrl.classifPropertiesView.controller={skeleton:{getFacetContent(name){assert.equal(name,'classificationAttiProp');return {
 getModel:()=>ctrl.renderedModel || ctrl.classifPropModels[0],
 editPropertiesUI:{elements:{UIController:{validateModels(models){assert.equal(models[0],ctrl.renderedModel || ctrl.classifPropModels[0]);return validateError?[{message:validateError}]:null;}}}}
 };}}};
 return {ctrl,parent,form,sibling,request:()=>request,selectedCount:()=>selectedCount};
}
// 필수 라벨만 기본 아이콘으로 교체하며 분류/오류 아이콘은 건드리지 않습니다.
{
 let required=true, count=0;const classificationIcon={className:'original-classification-icon'};
 const old={textContent:' *'},label={querySelector:selector=>selector==='.attrMand'?old:null,
 classList:{remove(name){assert.equal(name,'mandAttr');required=false;}},
 replaceChild(icon,node){assert.equal(node,old);assert.equal(icon.className,'mandIcon wux-ui3ds wux-ui-3ds-new-create');count++;}};
 old.parentNode=label;
 const form={querySelectorAll(selector){if(selector==='.flexLine')return [];assert.equal(selector,'.attrLabel.mandAttr');return required?[label]:[];}};
 api.renderMandatoryIcons(form);api.renderMandatoryIcons(form);
 assert.equal(count,1);assert.equal(classificationIcon.className,'original-classification-icon');
}
// 필수 아이콘이 두 개면 뒤의 것만 제거하고 첫 번째는 보존합니다.
{
 const first={id:'first'},second={id:'second'},third={id:'third'};
 const icons=[first,second,third];const parent={removeChild(icon){icons.splice(icons.indexOf(icon),1);icon.parentNode=null;}};
 icons.forEach(icon=>icon.parentNode=parent);
 const row={querySelectorAll(selector){assert.equal(selector,'.mandIcon');return icons.slice();}};
 const form={querySelectorAll(selector){return selector==='.flexLine'?[row]:[];}};
 api.renderMandatoryIcons(form);api.renderMandatoryIcons(form);
 assert.deepEqual(icons,[first]);
}
// 비활성 위젯과 다른 타입의 공용 호출에는 세션을 추가하지 않습니다.
config={};let facets=metadata();api.attachBridge(data(),facets,{});assert.equal(facets[0].options.sdxECCAAutoSession,undefined);
config={sdxECCAEnableAutoClassByOrganization:true};facets=metadata();const other=data();other.defaultAttributes.Type.value='Part';api.attachBridge(other,facets,{});assert.equal(facets[0].options.sdxECCAAutoSession,undefined);
// 부서 조회와 조직 파싱 없이도 지정 클래스만으로 동작합니다.
let {session,facets:activeFacets}=makeSession();const second=makeSession('C2').session;
assert.notEqual(session,second);assert.equal(second.rule.classId,'C2');second.dispose();
const ui=makeController(session), props={skeleton:new Element(),listview:{data:data(),propModel:{get(){return undefined}}}};
api.prepareFixedType(props.listview.data,session);
assert.equal(props.listview.data.defaultAttributes.Type.visible,false);
api.installFields(props,{sdxECCAAutoSession:session});
assert.equal(loadedModules.length,0); // 컨트롤러 생성 전에 검증 모듈을 요청하지 않음
const facet=classificationFacet(ui);facet.occurrenceReady=false;
api.connectClassification(facet,{sdxECCAAutoSession:session,securityContext:session.context});
assert.equal(facet.facetValidation,false);assert.equal(facet.states.length,0);
timers.get(facet.sdxECCAAutoTimer)();assert.equal(ui.request(),undefined); // ctrl ready, occurrence not ready
facet.occurrenceReady=true;timers.get(facet.sdxECCAAutoTimer)();
assert.equal(facet.states.length,0);
const dialog={View:{facets:activeFacets},myDialog:{},evaluateValidationStatus(){api.bindDialog(this);facet.states.push(facet.facetValidation);facet.buttonDisabled=!(facet.facetValidation&&facet.baseValid);}};
api.bindDialog(dialog);api.bindDialog(dialog);assert.equal(session.dialog,undefined);
assert.equal(facet.states.length,0);
const bindingTask=session.dialogBindTimer;timers.get(bindingTask)();timers.delete(bindingTask);
assert.equal(facet.states.length,1);assert.equal(facet.icon,'classification-book');
assert.equal(api.canSubmitDialog(dialog),false);assert.equal(facet.buttonDisabled,true);assert.equal(ui.ctrl.container.style.display,'none');
assert.equal(props.sdxECCAAutoRoot.children.length,3); // 범위 제한 스타일, 상태, 폼. 검색 컴포넌트 없음
assert.match(props.sdxECCAAutoRoot.children[0].textContent,/\.sdxECCAClassFields .*font-size: 7px; font-family: DSFontIcon;/);
ui.request().onComplete({chains:new Map([['C1',[{physicalid:'L1',type:'General Library',label:'Library'},{physicalid:'C1',type:'General Class',label:'Class'}]]])});
await flush();assert.equal(ui.selectedCount(),1);assert.equal(session.status,'loading');assert.equal(api.canSubmitDialog(dialog),false);
api.prepareAttributes(ui.ctrl.classifPropModels[0],{attribute:[]});
api.notifyAttributesLoaded(ui.ctrl.classifPropModels[0],{attribute:[]});
assert.deepEqual(loadedModules,[]); // 반복 알림에도 각 한 번
assert.equal(session.status,'ready');assert.equal(props.sdxECCAAutoHost.style.display,'');assert.equal(ui.form.parentNode,props.sdxECCAAutoHost);assert.equal(ui.form.classList.contains('sdxECCAClassFields'),true);
// 버튼을 누르기 전 모델 변경으로 OOTB facet validation을 갱신합니다.
function flushButton(){for(const fn of Array.from(timers.values())){if(fn.name==='')fn();}}
assert.equal(facet.buttonDisabled,false);
const watched=ui.ctrl.classifPropModels[0];
assert.equal(watched.listenerCount(),1);
validateError='필수';watched.emit('onChangeAttributes');flushButton();
assert.equal(facet.buttonDisabled,true);assert.equal(facet.icon,'classification-book');
validateError=null;watched.emit('onChangeAttributes');flushButton();
assert.equal(facet.buttonDisabled,false);
// 기본 속성이 유효하지 않으면 분류가 유효해져도 생성 버튼을 활성화하지 않습니다.
facet.baseValid=false;validateError='필수';watched.emit('onChangeAttributes');flushButton();
validateError=null;watched.emit('onChangeAttributes');flushButton();assert.equal(facet.buttonDisabled,true);
facet.baseValid=true;
// resetButtons 복원 후에도 무효 상태는 생성 버튼만 다시 차단합니다.
let recoveryCalls=0;
const recovery={View:{facets:activeFacets},evaluateValidationStatus(){recoveryCalls++;api.preserveValidationState(this);}};
assert.equal(typeof recovery.disableFormSubmit,'undefined');
session.fieldsValid=false;api.preserveValidationState(recovery);assert.equal(recoveryCalls,1);
assert.equal(facet.facetValidation,false);
session.fieldsValid=true;api.preserveValidationState(recovery);assert.equal(recoveryCalls,1);
assert.equal(facet.facetValidation,true);


let blurred=false;const input=new Element();input.blur=()=>blurred=true;ui.form.appendChild(input);document.activeElement=input;
assert.equal(api.canSubmitDialog(dialog),true);assert.equal(blurred,true);
// 선택 시 모델과 화면 모델이 달라도 OOTB 폼의 현재 모델을 검증합니다.
ui.ctrl.renderedModel={get:key=>key==='objectId'?'C1':undefined,values:()=>[]};
validateError='OOTB 필수 입력 오류';assert.equal(api.canSubmitDialog(dialog),false);
validateError=null;assert.equal(api.canSubmitDialog(dialog),true);
delete ui.ctrl.renderedModel;
props.listview.data.defaultAttributes.Type.value='Other';assert.equal(api.canSubmitDialog(dialog),false);props.listview.data.defaultAttributes.Type.value='Change Action';
validateError='필수 속성';assert.equal(api.canSubmitDialog(dialog),false);validateError=null;
session.checkContext('ctx::Leader.Manufacturing.Space');assert.equal(session.status,'error');assert.equal(api.canSubmitDialog(dialog),false);
api.disconnectClassification(facet);assert.equal(ui.form.parentNode,ui.parent);assert.equal(ui.form.classList.contains('sdxECCAClassFields'),false);assert.equal(ui.parent.children[0],ui.form);assert.equal(ui.ctrl.sdxECCAAutoSession,undefined);assert.equal(watched.listenerCount(),0);
// 늦게 도착한 조회가 닫힌 화면을 변경하지 않아야 합니다.
({session}=makeSession());const late=makeController(session);late.ctrl.sdxECCAAutoSession=session;session.controller=late.ctrl;
api.applyClass(late.ctrl,session);session.dispose();late.request().onComplete({});assert.equal(late.selectedCount(),0);
// 클래스 ID 없음/클래스 종류 오류/경로 불일치/응답 오류는 준비 완료가 되지 않아야 합니다.
({session}=makeSession(''));assert.equal(session.status,'error');session.dispose();
for(const [type,library] of [['General Library','L1'],['General Class','WRONG']]){
 ({session}=makeSession());const bad=makeController(session);bad.ctrl.sdxECCAAutoSession=session;session.controller=bad.ctrl;
 api.applyClass(bad.ctrl,session);
 bad.request().onComplete({chains:new Map([['C1',[{physicalid:library,type:'General Library'},{physicalid:'C1',type,label:'Bad'}]]])});
 assert.equal(session.status,'error');assert.equal(bad.selectedCount(),0);session.dispose();
}
({session}=makeSession());session.classId='C1';api.notifyAttributesLoaded({sdxECCAAutoSession:session,sdxECCAAutoClassId:'C1'},{});assert.equal(session.status,'error');session.dispose();
({session}=makeSession());timers.get(session.timer)();assert.equal(session.status,'error');session.dispose();
// 늦춘 dialog 연결은 닫힌 화면에 적용하지 않습니다.
{
 const closed=makeSession();let calls=0;
 const dialog={View:{facets:closed.facets},myDialog:{},evaluateValidationStatus(){calls++;}};
 api.bindDialog(dialog);const deferred=timers.get(closed.session.dialogBindTimer);
 closed.session.dispose();deferred();assert.equal(calls,0);
}
// 타입 표시와 원래 생성 스키마가 함께 유지되는지 확인합니다.
for(const mode of ['hidden','disabled']){
 ({session}=makeSession('C1',mode));const typed=data();const descriptor=typed.defaultAttributes.Type.persistData[0];
 api.prepareFixedType(typed,session);
 assert.equal(typed.defaultAttributes.Type.isReadOnly,true);
 assert.equal(typed.defaultAttributes.Type.visible,mode==='disabled');
 assert.deepEqual(Array.from(typed.defaultAttributes.Type.range),['Change Action']);
 assert.deepEqual(Array.from(typed.defaultAttributes.Type.rangeNLS),['설계변경']);
 assert.equal(typed.defaultAttributes.Type.persistData[0],descriptor);
 session.dispose();
}
// EC Type은 대상 타입에서만 ECR로 고정하고 숨겨도 요청 데이터에서 제거하지 않습니다.
for (const typeName of ['sdxECChangeAction', 'Change Action', 'Change Order', 'Change Request']) {
 const typed=data();const field={name:'sdxECType',type:'string',value:'ECN',visible:true,storeLocalPreference:true,visibility:{Other:['Y']}};
 typed.defaultAttributes.Type={value:typeName,range:[typeName],persistData:[{name:typeName}]};
 typed.attributes={publicAttributes:[field]};
 const state={type:typeName,createPolicy:'sdxECR',typeDisplay:'hidden',fail(error){this.error=error;}};
 api.prepareFixedType(typed,state);assert.equal(state.error,undefined);
 if(typeName==='sdxECChangeAction') {
  assert.equal(field.value,'ECR');assert.equal(field.visible,false);assert.equal(field.isReadOnly,true);
  assert.equal(field.modified,true);assert.equal(field.forUI,true);assert.equal(field.storeLocalPreference,false);
  assert.equal(field.visibility,undefined);assert.equal(typed.attributes.publicAttributes[0],field);
  assert.equal(typed.basicAttributes.policy,'sdxECR');
  field.value='ECN';api.prepareFixedType(typed,state);assert.equal(field.value,'ECR');
  assert.equal(typed.attributes.publicAttributes.some(attr=>attr.name==='policy'),false);
 } else {assert.equal(field.value,'ECN');assert.equal(field.visible,true);assert.equal(field.storeLocalPreference,true);
  assert.equal(typed.attributes.publicAttributes.some(attr=>attr.name==='policy'),false);}
}
// 모델 직렬화 후 정책이 Change Action으로 돌아가도 최종 콜백에서 복구합니다.
{
 const cases=[];
 for (const policyName of ['sdxECR','sdxECO']) {
  config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction',sdxECCAFixedClassId:'C1'};
  const typed=data();typed.defaultAttributes.Type.value='sdxECChangeAction';
  typed.basicAttributes={policy:'Change Action',vault:'Original Vault'};
  const facets=metadata();api.attachBridge(typed,facets,{},policyName);
  const state=facets[0].options.sdxECCAAutoSession;
  let finish;
  const original=function(callback){assert.equal(this,view);finish=callback;return 'pending';};
  const view={data:typed,onSubmit:original};const facet={listview:view,skeleton:new Element()};
  api.installFields(facet,{sdxECCAAutoSession:state});
  cases.push({state,view,facet,original,finish:()=>finish});
  let received;
  assert.equal(view.onSubmit(result=>{received=result;}),'pending');
  const outgoing={defaultAttributes:typed.defaultAttributes,attributes:{publicAttributes:[]},basicAttributes:{policy:'Change Action',description:'Keep description'}};
  finish(outgoing);assert.equal(received,outgoing);
  assert.equal(outgoing.basicAttributes.policy,policyName);
  assert.equal(outgoing.basicAttributes.vault,'Original Vault');
  assert.equal(outgoing.basicAttributes.description,'Keep description');
  assert.equal(outgoing.attributes.publicAttributes.length,0);
  view.onSubmit(result=>{received=result;});
  const parsed={defaultAttributes:typed.defaultAttributes,attributes:{publicAttributes:[]}};
  finish(parsed);assert.equal(received.basicAttributes.policy,policyName);assert.equal(received.basicAttributes.vault,'Original Vault');
  view.onSubmit(result=>{received=result;});finish(false);assert.equal(received,false);
 }
 assert.notEqual(cases[0].view.onSubmit,cases[1].view.onSubmit);
 for(const item of cases) {
  let received;item.view.onSubmit(result=>{received=result;});const late=item.finish();
  item.state.dispose();assert.equal(item.view.onSubmit,item.original);
  late({defaultAttributes:item.view.data.defaultAttributes,attributes:{publicAttributes:[]}});assert.equal(received,false);
 }
}
for (const typeName of ['sdxECChangeAction','Change Order','Change Request']) {
 const typed=data();typed.defaultAttributes.Type={value:typeName,range:[typeName],persistData:[{name:typeName}]};
 const policy={name:'policy',value:'Old Policy',visible:true,storeLocalPreference:true};
 typed.attributes={publicAttributes:[{name:'sdxECType',value:'ECN'}],extensionAttributes:[policy]};
 typed.basicAttributes={policy:'Change Action',vault:'Keep Vault'};
 const state={type:typeName,createPolicy:'sdxECO',fail(error){throw error;}};
 api.prepareFixedType(typed,state);
 assert.equal(policy.value,'Old Policy');
 assert.equal(typed.basicAttributes.policy,typeName==='sdxECChangeAction'?'sdxECO':'Change Action');
 assert.equal(typed.basicAttributes.vault,'Keep Vault');
 assert.equal(typed.attributes.publicAttributes.some(attr=>attr.name==='policy'),false);
 if(typeName==='sdxECChangeAction') {
  assert.equal(policy.visible,true);assert.equal(policy.storeLocalPreference,true);
 }
}
// Policy 파라미터는 대화상자별로 보존하며 기본값으로 조용히 대체하지 않습니다.
{
 config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction',sdxECCAFixedClassId:'C1'};
 const sessions=[];
 for (const policyName of ['sdxECR','sdxECO',undefined,'sdxEC']) {
  const typed=data();typed.defaultAttributes.Type={value:'sdxECChangeAction',range:['sdxECChangeAction'],persistData:[{name:'sdxECChangeAction'}]};
  typed.attributes={publicAttributes:[{name:'sdxECType',value:'ECN'}]};
  const facets=metadata();api.attachBridge(typed,facets,{},policyName);
  const state=facets[0].options.sdxECCAAutoSession;sessions.push(state);
  api.prepareFixedType(typed,state);
  if (policyName==='sdxECR'||policyName==='sdxECO') {
   assert.notEqual(state.status,'error');assert.equal(state.createPolicy,policyName);
   assert.equal(typed.basicAttributes.policy,policyName);
   assert.equal(typed.attributes.publicAttributes[0].value,'ECR');
  } else {assert.equal(state.status,'error');assert.match(state.error.message,/Policy/);}
 }
 assert.equal(sessions[0].createPolicy,'sdxECR');assert.equal(sessions[1].createPolicy,'sdxECO');
 sessions.forEach(state=>state.dispose());
 config.sdxECCACreatePolicy='sdxECR';
 const typed=data();typed.defaultAttributes.Type.value='sdxECChangeAction';
 const widgetFacets=metadata();api.attachBridge(typed,widgetFacets,{});
 const widgetSession=widgetFacets[0].options.sdxECCAAutoSession;
 config.sdxECCACreatePolicy='sdxECO';assert.equal(widgetSession.createPolicy,'sdxECR');
 const directFacets=metadata();api.attachBridge(typed,directFacets,{},'sdxECR');
 assert.equal(directFacets[0].options.sdxECCAAutoSession.createPolicy,'sdxECR');
 widgetSession.dispose();directFacets[0].options.sdxECCAAutoSession.dispose();
}
{
 const typed=data();typed.defaultAttributes.Type={value:'sdxECChangeAction',range:['sdxECChangeAction'],persistData:[{name:'sdxECChangeAction'}]};
 const state={type:'sdxECChangeAction',fail(error){this.error=error;}};
 api.prepareFixedType(typed,state);assert.match(state.error.message,/sdxECType/);
}
({session}=makeSession());const wrong=data();wrong.defaultAttributes.Type.value='Other';api.prepareFixedType(wrong,session);assert.equal(session.status,'error');session.dispose();
({session}=makeSession());const missing=data();missing.defaultAttributes.Type.persistData=[];api.prepareFixedType(missing,session);assert.equal(session.status,'error');session.dispose();
({session}=makeSession('C1','invalid'));assert.equal(session.status,'error');session.dispose();
config={};const normal={type:'Change Action',options:{preferedType:'Other'}};assert.equal(api.configureCreateType(normal),normal);assert.equal(normal.options.preferedType,'Other');
config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'Custom CA'};
const launch={type:'Change Action',options:{preferedType:'Other',select:[]},context:{},facets:[]};
const configured=api.configureCreateType(launch);assert.equal(configured,launch);assert.equal(launch.type,'Custom CA');assert.equal(launch.options.typeName,'Custom CA');assert.equal(launch.options.preferedType,'Custom CA');assert.equal(launch.options.select.length,0);
// 저장 성공을 확인한 typeName 분기는 Policy 수정 후에도 유지합니다.
for (const typeName of ['sdxECChangeAction','Change Action','Change Order','Change Request']) {
 config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:typeName};
 const options={options:{select:['physicalid']}};api.configureCreateType(options);
 assert.equal(options.type,typeName);assert.equal(options.options.preferedType,typeName);
 assert.equal(options.options.typeName,typeName==='sdxECChangeAction'?'Change Action':typeName);
 assert.deepEqual(options.options.select,['physicalid']);
}
config={sdxECCAEnableAutoClassByOrganization:false,sdxECCAAutoClassType:'sdxECChangeAction'};
const untouched={type:'Change Request',options:{typeName:'Change Request',preferedType:'Change Request'}};
api.configureCreateType(untouched);assert.equal(untouched.options.typeName,'Change Request');
console.log('PASS: widget/type isolation, fixed class without department lookup, asynchronous selection/loading, validation/blur, context change, form restore, late responses, config/type/library/response errors, timeout, hidden/read-only type with original schema, launch type isolation');

// 클래스 코드 조회 → 기존 경로/폼 흐름 연결, 지연 응답과 조회 실패 처리.
{
 const lookup=modules['DS/sdxECCAAutoClass/sdxECCAClassAttributeService'];
 const original=lookup.findActiveClassByCode;const pending=[];
 lookup.findActiveClassByCode=(service,scope)=>new Promise((resolve,reject)=>pending.push({scope,resolve,reject}));
 function byCode(){
  config={sdxECCAEnableAutoClassByOrganization:true}; // 기본 code 모드, EC_MX
  const facets=metadata();api.attachBridge(data(),facets,{tenant:'OnPremise'});
  const state=facets[0].options.sdxECCAAutoSession;assert.equal(state.ruleMode,'code');assert.equal(state.rule,null);
  const ui=makeController(state),facet=classificationFacet(ui);
  api.connectClassification(facet,{sdxECCAAutoSession:state,securityContext:state.context,tenant:'OnPremise'});
  timers.get(facet.sdxECCAAutoTimer)();
  return {state,ui};
 }
 const first=byCode(),second=byCode();
 assert.equal(pending[0].scope.classCode,'EC_MX');assert.equal(pending[0].scope.tenant,'OnPremise');
 assert.equal(pending[0].scope.libraryTitle,'EC Library');
 assert.equal(pending[0].scope.securityContext,first.state.context);
 pending[1].resolve({classId:'C2',libraryId:null});await flush();assert.equal(second.state.classId,'C2');assert.equal(first.ui.request(),undefined);
 pending[0].resolve({classId:'C1',libraryId:null});await flush();assert.equal(first.state.classId,'C1');
 first.state.dispose();second.state.dispose();
 const closed=byCode();closed.state.dispose();pending[2].resolve({classId:'C3'});await flush();assert.equal(closed.ui.request(),undefined);
 const failed=byCode();pending[3].reject(new Error('활성 클래스 없음'));await flush();assert.equal(failed.state.status,'error');assert.equal(failed.ui.request(),undefined);failed.state.dispose();
 const changed=byCode();changed.state.checkContext('changed');pending[4].resolve({classId:'C5'});await flush();assert.equal(changed.ui.request(),undefined);changed.state.dispose();
 lookup.findActiveClassByCode=original;
 console.log('PASS: code mode EC_MX, tenant/context propagation, dialog isolation, closed/changed late responses, no ID fallback');
}
// 부서 서비스와 기존 폼 흐름의 연결: 두 대화상자 격리, 늦은 응답, 오류 시 우회 금지.
await (async function () {
 const service=modules['DS/sdxECCAAutoClass/sdxECCAClassRuleService'];
 const provider=modules['DS/sdxECCAAutoClass/sdxECCAOrganizationProvider'];
 const scope={securityContext:'ctx::Leader.Engineering.Space',tenant:'OnPremise'};
 await assert.rejects(service.resolveDepartment(scope,provider),/아직 연결되지/);
 let calls=0;
 const good={loadCurrentUser(s){assert.equal(s.tenant,'OnPremise');calls++;return {departmentCode:' D1 '};},
  findDepartmentClasses(s){assert.equal(s.departmentCode,'D1');assert.equal(s.securityContext,scope.securityContext);
   return [{departmentCode:'OTHER',classId:'WRONG'},{departmentCode:'D1',classId:'C1',libraryId:'L1'}];}};
 assert.equal((await service.resolveDepartment(scope,good)).classId,'C1');assert.equal(calls,1);
 for(const [user,rows,pattern] of [
  [{},[],/부서 코드/],
  [{departmentCode:'D1'},[],/클래스가 없습니다/],
  [{departmentCode:'D1'},[{departmentCode:'D1',classId:'C1'},{departmentCode:'D1',classId:'C2'}],/여러 개/],
  [{departmentCode:'D1'},null,/배열/]
 ]) await assert.rejects(service.resolveDepartment(scope,{loadCurrentUser:()=>user,findDepartmentClasses:()=>rows}),pattern);
 await assert.rejects(service.resolveDepartment(scope,{loadCurrentUser:()=>Promise.reject(new Error('조회 실패')),findDepartmentClasses:()=>[]}),/조회 실패/);
 function dept(){
  config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAClassRuleMode:'department'};
  const facets=metadata();api.attachBridge(data(),facets,{});
  const session=facets[0].options.sdxECCAAutoSession;
  assert.equal(session.status,'loading');assert.equal(session.rule,null); // 고정 ID 없어도 설정 오류가 아님
  const ui=makeController(session),props={skeleton:new Element(),listview:{data:data()}};
  api.installFields(props,{sdxECCAAutoSession:session});
  const facet=classificationFacet(ui);
  api.connectClassification(facet,{sdxECCAAutoSession:session,securityContext:session.context,tenant:'OnPremise'});
  timers.get(facet.sdxECCAAutoTimer)();
  return {session,ui,facet,props};
 }
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 const pending=[];
 provider.loadCurrentUser=()=>new Promise(resolve=>pending.push(resolve));
 provider.findDepartmentClasses=req=>[{departmentCode:req.departmentCode,classId:req.departmentCode==='D1'?'C1':'C2'}];
 const first=dept(),second=dept();await flush();
 pending[1]({departmentCode:'D2'});await flush();
 assert.equal(second.session.classId,'C2');assert.equal(first.ui.request(),undefined);
 pending[0]({departmentCode:'D1'});await flush();assert.equal(first.session.classId,'C1');
 first.ui.request().onComplete({chains:new Map([['C1',[{physicalid:'C1',type:'General Class',label:'Class'}]]])});
 await flush();
 const model=first.ui.ctrl.classifPropModels[0];
 api.notifyAttributesLoaded({attribute:[]},model);assert.equal(first.session.status,'loading'); // 잘못된 순서는 완료되지 않음
 api.prepareAttributes(model,{attribute:[]});
 api.notifyAttributesLoaded(model,{attribute:[]});assert.equal(first.session.status,'ready');
 first.session.dispose();second.session.dispose();
 const closed=dept();await flush();closed.session.dispose();pending[2]({departmentCode:'D1'});await flush();assert.equal(closed.ui.request(),undefined);
 const changed=dept();await flush();changed.session.checkContext('different');pending[3]({departmentCode:'D1'});await flush();assert.equal(changed.ui.request(),undefined);changed.session.dispose();
 provider.loadCurrentUser=()=>({departmentCode:'D1'});provider.findDepartmentClasses=()=>[];
 const missing=dept();await flush();assert.equal(missing.session.status,'error');assert.equal(missing.ui.request(),undefined);missing.session.dispose();
 config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAClassRuleMode:'bad'};
 const bad=metadata();api.attachBridge(data(),bad,{});assert.equal(bad[0].options.sdxECCAAutoSession.status,'error');bad[0].options.sdxECCAAutoSession.dispose();
 console.log('PASS: department contract, tenant/context propagation, missing/duplicate/error handling, parallel dialog isolation, fixed-ID-free department mode, model/response order, closed/context-changed late response suppression, no fixed fallback');
})().catch(error=>{console.error(error);process.exitCode=1;});

})().catch(error=>{console.error(error);process.exitCode=1;});

