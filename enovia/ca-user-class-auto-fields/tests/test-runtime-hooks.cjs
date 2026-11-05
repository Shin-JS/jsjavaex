'use strict';
// node tests/test-runtime-hooks.cjs <동일 릴리스의 원본 JS 디렉터리>
// ENONewWidget의 기존 연결만 적용하고 Classification 두 원본의 조회/렌더링을 실행합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs'),applyHooks=require('./apply-newwidget-hooks.cjs'),dir=process.argv[2];
if(!dir)throw Error('Specify original ENONewWidget/ClassificationsFacet/ClassificationProp directory');
const defs=new Map(),window={top:{performance:{mark(){}}}},UWA={Promise},widget={};
for(const file of ['ENONewWidget','ClassificationsFacet','ClassificationProp'])vm.runInNewContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),{
 define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});},window,UWA,console
});
let runtime,request,renderCount=0,notified=0;
const values={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction'};
widget.getValue=key=>values[key];
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8'),{
 widget,setTimeout:()=>1,clearTimeout(){},define(id,deps,factory){
  if(id.endsWith('/sdxECCAAutoClassService'))runtime=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});
 }
});
const constants=defs.get('DS/ClassificationProp/constants/ClassifPropConstants').factory();
const nls={get:key=>key,replace:value=>value};
const helperRow=defs.get('DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper');
const helper=applyHooks('DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper',helperRow.factory,{widget})({ENONewFACET_CLASSIFICATION:'classificationFacet'},nls,nls);
const beforeHelper=Object.getOwnPropertyDescriptors(helper);
class TabView { constructor(options){this.facets=options.facets;}loadView(done){done();} }
const dialogRow=defs.get('DS/ENONewWidget/ENONew/Controller/ENONewDialogController');
const OriginalDialog=applyHooks('DS/ENONewWidget/ENONew/Controller/ENONewDialogController',dialogRow.factory,{widget,UWA})(...dialogRow.deps.map(id=>id==='UWA/Controls/Abstract'?Base:id.endsWith('/ENOTabView')?TabView:{}));
const modelInstances=[];
class Model {
 constructor(id){this._attributes={objectId:id};modelInstances.push(this);}
 get(key){return this._attributes[key];}getTenant(){return 'OnPremise';}set(key,value){this._attributes[key]=value;}
 keys(){return [];}clearChangedValue(){}getChangedValues(){return {};}setChangedValues(){}isMergedModel(){return false;}
}
const controllerRow=defs.get('DS/ClassificationProp/facets/Properties/ClassifPropController');
const OriginalProp=controllerRow.factory(...controllerRow.deps.map(id=>{
 if(id==='UWA/Class/Model')return Model;
 if(id.endsWith('/ClassifFacetsBase'))return Base;
 if(id.endsWith('/ClassifPropConstants'))return constants;
 if(id.endsWith('/ConstantsMapping'))return {getServiceForModel(){}};
 if(id.endsWith('/DistantAjax'))return {getAsyncRead(done){done(null);}};
 if(id.endsWith('/ClassifPropControl'))return {getInformationPanel:()=>false,getProvider:()=>({_getComponentName:()=> 'Libraries'})};
 if(id==='DS/WidgetServices/WidgetServices')return {getValue:()=>new Map()};
 if(id.endsWith('/EventManager'))return {subscribe(){},publish(){}};
 if(id.endsWith('/ClassifPropAjaxRequests'))return {getClassificationAttributes(options){request=options;}};
 if(id.startsWith('i18n!'))return nls;
 return {};
}));
const originalSnapshot=Object.getOwnPropertyDescriptors(OriginalProp.prototype);
const derived=new Map();
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{
 define(id,deps,factory){derived.set(id,{deps:Array.from(deps),factory});}
});
const api=Object.assign({},runtime,{notifyAttributesLoaded(model,response){
 assert.equal(renderCount,1,'notify occurs after native initData');assert.equal(model,modelInstances[0]);
 assert(Array.isArray(response.results));notified++;
}});
const Dialog=OriginalDialog;
widget.sdxECCARuntime=api;
const data={defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'A'}}};
const input=helper.getFacetList(data,[{name:'classificationFacet'}],{securityContext:'A'});
const dialog=Object.assign(Object.create(Dialog.prototype),{
 options:{sdxECCATenant:'OnPremise'},viewType:'tabView',facets:input,identifier:'test',footerButtons:{}
});
(async function(){
 await dialog.buildContent(data,{securityContext:'A'});
 assert.equal(dialog.View.facets,dialog.facets);assert.equal(dialog.facets[0].require,'DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet');
 assert.equal(dialog.facets[1].require,'DS/sdxECCACreate/ClassificationFacet');
 assert.equal(input[0].require,'DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet');
 assert(input[0].options.sdxECCAAutoSession);
 const session=dialog.facets[0].options.sdxECCAAutoSession;
 session.classId='C1';session.mandatory=true;session.controller={sdxECCAAutoSession:session};
 const CustomProp=derived.get('DS/sdxECCACreate/ClassifPropController').factory(OriginalProp,api);
 const prop=Object.assign(Object.create(CustomProp.prototype),{
  options:{sdxECCAAutoSession:session},alreadySelectedModels:[],getListHandle:{handle:null},
  showLoader(){},hideLoader(){},_resetModifFlag(){},getModel(){return this.model;},setModel(model){this.model=model;},
  getTabId:()=> 'classificationAttiProp',isReadOnly:()=>false,updateReadWriteAccess(){},_manageNotificationFromAnswer(){},
  _buildFromResponse(response){assert.equal(response.results[0].data[0].mandatory,false);return {modifyAccess:true,allAttributeAreRO:false,oneSuccess:true};},
  editPropertiesUI:{
   getExistingClassAttributes(){return null;},getUpdatedValueForAttribute(){},getClassUsage(){return 'Standard';},
   getClassTitleFromID(){return 'Class';},getClassPath(){return 'Library/Class';},isReadonly:()=>false,
   switchComponentMode(readonly){assert.equal(readonly,false);},setAccordionProperties(){},initData(){renderCount++;}
  }
 });
 const model=new Model('C1');prop.loadModels(model);
 assert.equal(request.modelList[0],model);assert.equal(model.sdxECCAAutoSession,session);
 request.onComplete({id:'C1',attribute:[{name:'ACCMAttr',nls_label:'A',default:'',type:'string'}]});
 assert.equal(renderCount,1);assert.equal(notified,1);assert.equal(session.mandatoryPrepared,true);
 // 같은 classId여도 폐기된 세션의 늦은 응답은 원래 렌더링 함수에 전달하지 않습니다.
 session.disposed=true;
 request.onComplete({id:'C1',attribute:[{name:'ACCMAttr',nls_label:'old',default:'late',type:'string'}]});
 assert.equal(renderCount,1);assert.equal(notified,1);
 // 유지한 B 연결을 실제 ListViewFacet init/update/destroy 경로에서 실행합니다.
 const order=[];
 widget.sdxECCARuntime={prepareFixedType(){order.push('prepare');},installFields(facet,options){facet.sdxECCAAutoSession=options.sdxECCAAutoSession;order.push('install');},
  checkFacetContext(facet,options){return options.accept;},destroyFields(){order.push('cleanup');},
  canSubmitDialog:()=>false,preserveValidationState(){order.push('validation');},disposeDialog(){order.push('dispose');}};
 const listRow=defs.get('DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet');
 const List=applyHooks('DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet',listRow.factory,{widget,console,setTimeout(){}})(
  {createElement:()=>({}),is:value=>value!=null},{},Base,
  function(){this.propUI={inject(){}};this.buildModel=()=>order.push('build');this.loadView=()=>order.push('load');this.destroy=()=>order.push('destroy');},helper);
 const listSession={changeContext:value=>order.push('context:'+value),checkType:value=>order.push('type:'+value)};
 const list=Object.assign(Object.create(List.prototype),{publishInfo:name=>order.push('publish:'+name)});
 const listOptions={data:{},events:{onResize(){},onChangeAttribute(){order.push('original-event');}},sdxECCAAutoSession:listSession};
 list.init(listOptions);assert.deepEqual(order,['prepare','build','load','install']);
 order.length=0;listOptions.events.onChangeAttribute({'New-SecurityContext':{name:'SecurityContext',valueDB:'B'}});
 assert.deepEqual(order,['context:B','publish:currentSecurityContext','original-event']);assert.equal(listSession.currentContext,'B');
 order.length=0;list.updateFacet({accept:false,data:{}});assert.equal(order.length,0);
 list.destroy();assert.deepEqual(order,['cleanup','destroy']);
 order.length=0;OriginalDialog.prototype.onSubmitDialog.call({resetButtonLabel(){order.push('label');},disableFormInput(){order.push('disabled');}},'createClose');
 assert.deepEqual(order,['label','disabled']);
 order.length=0;OriginalDialog.prototype.destroy.call({View:{destroy(){order.push('view');}},myDialog:{destroy(){order.push('dialog');}}});
 assert.equal(order[0],'dispose');assert.equal(order.at(-1),'dialog');
 assert.deepEqual(Object.getOwnPropertyDescriptors(helper),beforeHelper);
 assert.deepEqual(Object.getOwnPropertyDescriptors(OriginalProp.prototype),originalSnapshot);
 delete widget.sdxECCARuntime;
 const ordinary=helper.getFacetList(data,[{name:'classificationFacet'}],{});
 assert.equal(ordinary[1].require,'DS/ClassificationsFacet/PLMNewClassificationFacet');
 assert.equal(ordinary[0].options.sdxECCAAutoSession,undefined);
 console.log('PASS: retained ENONewWidget helper/dialog hooks + unmodified ClassifPropController.loadModels/_onCompleteLoadModel; custom paths and session tagging before AJAX; native render then notify; disposed response blocked; originals unchanged');
})().catch(error=>{console.error(error);process.exitCode=1;});
