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
 constructor(){this.nodeType=1;this.children=[];this.parentNode=null;this.style={};this.textContent='';}
 appendChild(node){if(node.parentNode)node.parentNode.removeChild(node);this.children.push(node);node.parentNode=this;}
 removeChild(node){this.children.splice(this.children.indexOf(node),1);node.parentNode=null;}
 insertBefore(node,next){if(node.parentNode)node.parentNode.removeChild(node);this.children.splice(this.children.indexOf(next),0,node);node.parentNode=this;}
 setAttribute(){}
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
 config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAFixedClassId:classId,sdxECCAFixedLibraryId:'L1',sdxECCATypeDisplay:mode};
 const facets=metadata();api.attachBridge(data(),facets,{});return {session:facets[0].options.sdxECCAAutoSession,facets};
}
function makeController(session){
 const parent=new Element(), form=new Element(), sibling=new Element();parent.appendChild(form);parent.appendChild(sibling);form.nextSibling=sibling;
 let request, selectedCount=0;
 const ctrl={accordeonCon:form,container:new Element(),classifPropertiesView:{onInnerResize(){}},
 classifPropModels:[],classifPropertiesUI:{setClassPath(){},setClassUsage(){}},getClassPath(){return []},getClassUsage(){return []},
 _nodesData:{},_classPathMap:new Map(),_classNameMap:new Map(),autoComplete:{selectedItems:[],_model:{prepareUpdate(){},pushUpdate(){}}},
 couldBeSelected:type=>type==='General Class',_getIcon:()=>({iconName:'library-class'}),
 plmNewClassificationFacetData:{createAutocompleteDataTree(){return {}},_createTreeNodeModel(opts){return {options:opts,getID:()=>opts.id}}},
 insertInAutocomplete(_,node){return {getID:node.getID,select(){selectedCount++;ctrl.autoComplete.selectedItems=[this];
 const model={get:key=>key==='objectId'?session.classId:undefined,values:()=>[]};
 ctrl.classifPropModels.push(model);api.tagClassModel(ctrl,model,session.classId);}}},
 PLMNewCommonWebService:{get3DSpaceUrl:()=>Promise.resolve('https://example/3dspace'),getClassPaths(opts){request=opts},constructPath:response=>response.chains,extractPath:()=> 'Library > Class'}
 };
 ctrl.classifPropertiesView.controller={skeleton:{getFacetContent(name){assert.equal(name,'classificationAttiProp');return {
 getModel:()=>ctrl.renderedModel || ctrl.classifPropModels[0],
 editPropertiesUI:{elements:{UIController:{validateModels(models){assert.equal(models[0],ctrl.renderedModel || ctrl.classifPropModels[0]);return validateError?[{message:validateError}]:null;}}}}
 };}}};
 return {ctrl,parent,form,sibling,request:()=>request,selectedCount:()=>selectedCount};
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
const facet={initUI:{getController:()=>({plmNewLibraryActive:ui.ctrl})}};
api.connectClassification(facet,{sdxECCAAutoSession:session,securityContext:session.context});timers.get(facet.sdxECCAAutoTimer)();
const dialog={View:{facets:activeFacets}};
assert.equal(api.canSubmitDialog(dialog),false);assert.equal(ui.ctrl.container.style.display,'none');
assert.equal(props.sdxECCAAutoRoot.children.length,2); // 상태와 폼뿐, 검색 컴포넌트 없음
ui.request().onComplete({chains:new Map([['C1',[{physicalid:'L1',type:'General Library',label:'Library'},{physicalid:'C1',type:'General Class',label:'Class'}]]])});
await flush();assert.equal(ui.selectedCount(),1);assert.equal(session.status,'loading');assert.equal(api.canSubmitDialog(dialog),false);
api.prepareAttributes(ui.ctrl.classifPropModels[0],{attribute:[]});
api.notifyAttributesLoaded(ui.ctrl.classifPropModels[0],{attribute:[]});
assert.deepEqual(loadedModules,[]); // 반복 알림에도 각 한 번
assert.equal(session.status,'ready');assert.equal(props.sdxECCAAutoHost.style.display,'');assert.equal(ui.form.parentNode,props.sdxECCAAutoHost);
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
api.disconnectClassification(facet);assert.equal(ui.form.parentNode,ui.parent);assert.equal(ui.parent.children[0],ui.form);assert.equal(ui.ctrl.sdxECCAAutoSession,undefined);
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
({session}=makeSession());const wrong=data();wrong.defaultAttributes.Type.value='Other';api.prepareFixedType(wrong,session);assert.equal(session.status,'error');session.dispose();
({session}=makeSession());const missing=data();missing.defaultAttributes.Type.persistData=[];api.prepareFixedType(missing,session);assert.equal(session.status,'error');session.dispose();
({session}=makeSession('C1','invalid'));assert.equal(session.status,'error');session.dispose();
config={};const normal={type:'Change Action',options:{preferedType:'Other'}};assert.equal(api.configureCreateType(normal),normal);assert.equal(normal.options.preferedType,'Other');
config={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'Custom CA'};
const launch={type:'Change Action',options:{preferedType:'Other',select:[]},context:{},facets:[]};
const configured=api.configureCreateType(launch);assert.equal(configured,launch);assert.equal(launch.type,'Custom CA');assert.equal(launch.options.typeName,'Custom CA');assert.equal(launch.options.preferedType,'Custom CA');assert.equal(launch.options.select.length,0);
console.log('PASS: widget/type isolation, fixed class without department lookup, asynchronous selection/loading, validation/blur, context change, form restore, late responses, config/type/library/response errors, timeout, hidden/read-only type with original schema, launch type isolation');

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
  const facet={initUI:{getController:()=>({plmNewLibraryActive:ui.ctrl})}};
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
