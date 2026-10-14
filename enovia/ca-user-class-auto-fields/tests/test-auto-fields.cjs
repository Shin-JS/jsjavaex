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
for (const file of ['ENONewWidget/ENONewWidget.js','ClassificationsFacet/ClassificationsFacet.js','ClassificationProp/ClassificationProp.js']) {
 vm.runInContext(fs.readFileSync(path.join(root,'webapps',file),'utf8'),context);
}
function metadata(){return [{facet:{name:'ENOCreate'},options:{}},{facet:{name:'classificationFacet'},options:{}}];}
function data(org='Engineering'){return {defaultAttributes:{Type:{value:'Change Action'},SecurityContext:{value:`ctx::Leader.${org}.Space`}}};}
function makeSession(org='Engineering'){
 config={zcaEnableAutoClassByOrganization:true,zcaClassByOrganization:JSON.stringify({Engineering:{classId:'C1',libraryId:'L1'},Manufacturing:{classId:'C2'}})};
 const facets=metadata();context.zcaAttachAutoBridge(data(org),facets,{});return {session:facets[0].options.zcaAutoSession,facets};
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
 ctrl.classifPropModels.push(model);context.zcaTagAutoClassModel(ctrl,model,session.classId);}}},
 PLMNewCommonWebService:{getClassPaths(opts){request=opts},constructPath:response=>response.chains,extractPath:()=> 'Library > Class'}
 };
 return {ctrl,parent,form,sibling,request:()=>request,selectedCount:()=>selectedCount};
}
// 비활성 위젯과 다른 타입의 공용 호출에는 세션을 추가하지 않습니다.
config={};let facets=metadata();context.zcaAttachAutoBridge(data(),facets,{});assert.equal(facets[0].options.zcaAutoSession,undefined);
config={zcaEnableAutoClassByOrganization:true};facets=metadata();const other=data();other.defaultAttributes.Type.value='Part';context.zcaAttachAutoBridge(other,facets,{});assert.equal(facets[0].options.zcaAutoSession,undefined);
assert.equal(context.zcaOrganizationFromContext('ctx::Leader.Engineering.Space'),'Engineering');
assert.throws(()=>context.zcaOrganizationFromContext('Role.Org.WithDot.Space'),/SecurityContext/);
let {session,facets:activeFacets}=makeSession();const second=makeSession('Manufacturing').session;
assert.notEqual(session,second);assert.equal(second.rule.classId,'C2');second.dispose();
const ui=makeController(session), props={skeleton:new Element()};
context.zcaInstallAutoFields(props,{zcaAutoSession:session});
const facet={initUI:{getController:()=>({plmNewLibraryActive:ui.ctrl})}};
context.zcaConnectAutoClassification(facet,{zcaAutoSession:session,securityContext:session.context});timers.get(facet.zcaAutoTimer)();
const dialog={View:{facets:activeFacets}};
assert.equal(context.zcaCanSubmitAutoDialog(dialog),false);assert.equal(ui.ctrl.container.style.display,'none');
assert.equal(props.zcaAutoRoot.children.length,2); // 상태와 폼뿐, 검색 컴포넌트 없음
ui.request().onComplete({chains:new Map([['C1',[{physicalid:'L1',type:'General Library',label:'Library'},{physicalid:'C1',type:'General Class',label:'Class'}]]])});
assert.equal(ui.selectedCount(),1);assert.equal(session.status,'loading');assert.equal(context.zcaCanSubmitAutoDialog(dialog),false);
context.zcaNotifyAutoClassAttributes(ui.ctrl.classifPropModels[0],{attribute:[]});
assert.equal(session.status,'ready');assert.equal(props.zcaAutoHost.style.display,'');assert.equal(ui.form.parentNode,props.zcaAutoHost);
let blurred=false;const input=new Element();input.blur=()=>blurred=true;ui.form.appendChild(input);document.activeElement=input;
assert.equal(context.zcaCanSubmitAutoDialog(dialog),true);assert.equal(blurred,true);
validateError='필수 속성';assert.equal(context.zcaCanSubmitAutoDialog(dialog),false);validateError=null;
session.checkContext('ctx::Leader.Manufacturing.Space');assert.equal(session.status,'error');assert.equal(context.zcaCanSubmitAutoDialog(dialog),false);
context.zcaDisconnectAutoClassification(facet);assert.equal(ui.form.parentNode,ui.parent);assert.equal(ui.parent.children[0],ui.form);assert.equal(ui.ctrl.zcaAutoSession,undefined);
// 늦게 도착한 조회가 닫힌 화면을 변경하지 않아야 합니다.
({session}=makeSession());const late=makeController(session);late.ctrl.zcaAutoSession=session;session.controller=late.ctrl;
context.zcaApplyOrganizationClass(late.ctrl,session);session.dispose();late.request().onComplete({});assert.equal(late.selectedCount(),0);
// 매핑 없음/클래스 종류 오류/경로 불일치/응답 오류는 준비 완료가 되지 않아야 합니다.
({session}=makeSession('Unknown'));assert.equal(session.status,'error');session.dispose();
for(const [type,library] of [['General Library','L1'],['General Class','WRONG']]){
 ({session}=makeSession());const bad=makeController(session);bad.ctrl.zcaAutoSession=session;session.controller=bad.ctrl;
 context.zcaApplyOrganizationClass(bad.ctrl,session);
 bad.request().onComplete({chains:new Map([['C1',[{physicalid:library,type:'General Library'},{physicalid:'C1',type,label:'Bad'}]]])});
 assert.equal(session.status,'error');assert.equal(bad.selectedCount(),0);session.dispose();
}
({session}=makeSession());session.classId='C1';context.zcaNotifyAutoClassAttributes({zcaAutoSession:session,zcaAutoClassId:'C1'},{});assert.equal(session.status,'error');session.dispose();
({session}=makeSession());timers.get(session.timer)();assert.equal(session.status,'error');session.dispose();
console.log('PASS: widget/type isolation, organization mapping, asynchronous selection/loading, validation/blur, context change, form restore, late responses, mapping/type/library/response errors, timeout');
