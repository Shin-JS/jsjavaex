// 서버/WUX 대역 검사입니다. 실제 플랫폼 UI·저장 검증을 대신하지 않습니다.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
let config = {}, seq = 0, validateError = null;
const timers = new Map();
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
 require(ids, done){assert.deepEqual(Array.from(ids),['DS/ClassificationProp/utils/AttributesUtils']);
  done({validateAttributes:()=>validateError?[{message:validateError}]:null});}
});
let api;
context.define = function (id, dependencies, factory) {
 assert.equal(id, 'DS/sdxECCAAutoClass/sdxECCAAutoClass');
 assert.deepEqual(Array.from(dependencies), ['require']);
 api = factory(context.require);
};
vm.runInContext(fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8'),context);
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
 const model={get:key=>key==='objectId'?session.classId:undefined,getAttributeFromField:()=>[]};
 ctrl.classifPropModels.push(model);api.tagClassModel(ctrl,model,session.classId);}}},
 PLMNewCommonWebService:{getClassPaths(opts){request=opts},constructPath:response=>response.chains,extractPath:()=> 'Library > Class'}
 };
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
const facet={initUI:{getController:()=>({plmNewLibraryActive:ui.ctrl})}};
api.connectClassification(facet,{sdxECCAAutoSession:session,securityContext:session.context});timers.get(facet.sdxECCAAutoTimer)();
const dialog={View:{facets:activeFacets}};
assert.equal(api.canSubmitDialog(dialog),false);assert.equal(ui.ctrl.container.style.display,'none');
assert.equal(props.sdxECCAAutoRoot.children.length,2); // 상태와 폼뿐, 검색 컴포넌트 없음
ui.request().onComplete({chains:new Map([['C1',[{physicalid:'L1',type:'General Library',label:'Library'},{physicalid:'C1',type:'General Class',label:'Class'}]]])});
assert.equal(ui.selectedCount(),1);assert.equal(session.status,'loading');assert.equal(api.canSubmitDialog(dialog),false);
api.notifyAttributesLoaded(ui.ctrl.classifPropModels[0],{attribute:[]});
assert.equal(session.status,'ready');assert.equal(props.sdxECCAAutoHost.style.display,'');assert.equal(ui.form.parentNode,props.sdxECCAAutoHost);
let blurred=false;const input=new Element();input.blur=()=>blurred=true;ui.form.appendChild(input);document.activeElement=input;
assert.equal(api.canSubmitDialog(dialog),true);assert.equal(blurred,true);
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
