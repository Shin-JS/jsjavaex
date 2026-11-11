'use strict';
// node tests/test-runtime-hooks.cjs <동일 릴리스의 원본 JS 디렉터리>
// ENONewWidget은 원본 그대로, 분류 두 파일은 가이드 F/M/P 조각만 적용해 실행합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs'),dir=process.argv[2];
const patch=require('./apply-native-hooks.cjs'),fixtures=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-hooks.json'),'utf8'));
const widget={getValue:key=>values[key]};
if(!dir)throw Error('Specify original ENONewWidget/ClassificationsFacet/ClassificationProp directory');
const defs=new Map(),window={top:{performance:{mark(){}}}},UWA={Promise,
 is:(value,type)=>typeof value===type,createElement:()=>({inject(){}})};
for(const file of ['ENONewWidget','ClassificationsFacet','ClassificationProp'])vm.runInNewContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),{
 define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});},window,UWA,console
});
let runtime,request,renderCount=0,notified=0,taggedModel;
const values={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction'};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8'),{
 widget:{getValue:key=>values[key]},setTimeout:()=>1,clearTimeout(){},define(id,deps,factory){
  if(id.endsWith('/sdxECCAAutoClassService'))runtime=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});
 }
});
const constants=defs.get('DS/ClassificationProp/constants/ClassifPropConstants').factory();
// 클래스 필수 플래그를 읽는 bus POST 계약도 2026 원본에서 확인합니다.
const readRow=defs.get('DS/ClassificationProp/ajaxRequests/3DSpaceAjaxRequests');
let busRead;
const reads=readRow.factory(...readRow.deps.map(id=>id==='DS/WidgetServices/WidgetServices'?{getWidgetValue(){},isDebug:()=>false}:
 id.endsWith('/ServicesAjaxRequests')?{createRequest(options,method,url,body){busRead={method,url,body};}}:
 id.endsWith('/ClassifPropConstants')?constants:{}));
reads.getListOfAttributes({modelList:[{get:key=>({objectId:'C1',metatype:'bus'})[key],isMergedModel:()=>false}],readonly:true,attributes:true});
assert.equal(busRead.method,'POST');assert.equal(busRead.url,'/resources/v1/collabServices/attributes/op/read');
assert.deepEqual(Array.from(busRead.body.busIDs),['C1']);assert.equal(busRead.body.readonly,'true');
assert.equal(busRead.body.attributes,'true');assert.equal(busRead.body.plmparameters,'false');
const nls={get:key=>key,replace:value=>value};
const helperRow=defs.get('DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper');
const helper=helperRow.factory({ENONewFACET_CLASSIFICATION:'classificationFacet'},nls,nls);
const beforeHelper=Object.getOwnPropertyDescriptors(helper);
class TabView { constructor(options){this.facets=options.facets;this.skeleton={inject(){}};}loadView(done){done();} }
const dialogRow=defs.get('DS/ENONewWidget/ENONew/Controller/ENONewDialogController');
const OriginalDialog=dialogRow.factory(...dialogRow.deps.map(id=>id==='UWA/Controls/Abstract'?Base:
 id.endsWith('/ENOTabView')?TabView:id.endsWith('/ENONewFacetHelper')?helper:id.startsWith('i18n!')?nls:{}));
const modelInstances=[];
class Model {
 constructor(id){this._attributes=typeof id==='object'?id:{objectId:id};modelInstances.push(this);}
 get(key){return this._attributes[key];}getTenant(){return 'OnPremise';}set(key,value){this._attributes[key]=value;}
 keys(){return [];}clearChangedValue(){}getChangedValues(){return {};}setChangedValues(){}isMergedModel(){return false;}
}
const api=Object.assign({},runtime,{notifyAttributesLoaded(model,response){
 assert.equal(renderCount,1,'notify after native initData');assert.equal(model,taggedModel);
 assert(Array.isArray(response.results));notified++;
}});
widget.sdxECCARuntime=api;
const propId='DS/ClassificationProp/facets/Properties/ClassifPropController';
const controllerRow=patch(defs.get(propId),fixtures[propId],{window,UWA,console,widget});
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
 widget:{},define(id,deps,factory){derived.set(id,{deps:Array.from(deps),factory});}
});
const dialogDef=derived.get('DS/sdxECCACreate/Dialog');
const Dialog=dialogDef.factory(OriginalDialog,api);
const data={defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'A'}}};
const input=helper.getFacetList(data,[{name:'classificationFacet'}],{securityContext:'A'});
const dialog=Object.assign(Object.create(Dialog.prototype),{
 options:{sdxECCATenant:'OnPremise'},viewType:'tabView',facets:input,identifier:'test',footerButtons:{}
});
(async function(){
 await dialog.buildContent(data,{securityContext:'A'});
 assert.equal(dialog.View.facets,dialog.facets);assert.equal(dialog.facets[0].require,'DS/sdxECCACreate/PropertiesFacet');
 assert.equal(input[0].require,'DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet');
 assert.equal(input[0].options.sdxECCAAutoSession,undefined);
 const session=dialog.facets[0].options.sdxECCAAutoSession;
 // 실제 2026 Engine.init -> Controller.displayDialog -> Dialog.setup도 통과시킵니다.
 // 기존 검사는 helper 결과와 tabView를 직접 주입해 호출부 옵션 누락을 놓쳤습니다.
 const engineRow=defs.get('DS/ENONewWidget/ENONew/ENONewEngine');
 const NativeEngine=engineRow.factory(UWA,Base,{},function(){},function(){},{DIALOG:{LIST_VIEW:'listView'}});
 class CaptureController {constructor(options){Object.assign(this,options);}}
 const CustomEngine=derived.get('DS/sdxECCACreate/Engine').factory(NativeEngine,CaptureController);
 const entry=derived.get('DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService').factory(api,CustomEngine);
 const nativeControllerRow=defs.get('DS/ENONewWidget/ENONew/Controller/ENONewController');
 const NativeController=nativeControllerRow.factory(...nativeControllerRow.deps.map(id=>id==='UWA/Controls/Abstract'?Base:{}));
 for(const inputOptions of [
  {context:{tenant:'OnPremise'},options:{}},
  {context:{tenant:'OnPremise'},options:{},viewType:'listView',facets:[]},
  {context:{tenant:'OnPremise'},options:{},viewType:'tabView',facets:[{name:'classificationFacet'}]}
 ]) {
  const captured=entry.launch(inputOptions).controller;
  const rendered=Object.assign(Object.create(Dialog.prototype),{
   options:{sdxECCATenant:'OnPremise'},elements:{},footerButtons:{},addEvent(){},
   getDefaultButtons(){return {};},buildToolbar(){return Promise.resolve(null);},
   buildDialog(){return {};},manageButtons(){}
  });
  Object.assign(captured,{
   defaultAttributes:data.defaultAttributes,model:{getSecurityContext:()=> 'A',getTenant:()=> 'OnPremise'},
   labelTopBar:'CA',id:'pipeline',dialog:rendered,buttons:{}
  });
  NativeController.prototype.displayDialog.call(captured);
  await Promise.resolve();await Promise.resolve();
  assert.equal(rendered.viewType,'tabView');
  assert.equal(rendered.facets[0].require,'DS/sdxECCACreate/PropertiesFacet');
  assert.equal(rendered.facets[1].require,'DS/ClassificationsFacet/PLMNewClassificationFacet');
  assert(rendered.facets[0].options.sdxECCAAutoSession);
  assert(rendered.myDialog,'native setup finishes creating the dialog');
 }
 session.classId='C1';session.mandatory=true;session.controller={sdxECCAAutoSession:session};
 const prop=Object.assign(Object.create(OriginalProp.prototype),{
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
 // 실제 2026 Common 컨트롤러의 선택 처리 함수(M)를 실행합니다.
 const commonId='DS/ClassificationsFacet/PLMNewCommomCmpUXController';
 const commonRow=patch(defs.get(commonId),fixtures[commonId],{window,UWA,console,widget});
 const methods=commonRow.factory(...commonRow.deps.map((id,i)=>i===0?{extend(...args){return args.at(-1);}}:{}));
 const selectSource=methods.createAutocompleteComponent.toString();
 const start=selectSource.indexOf('var v=function'),end=selectSource.indexOf(';return r.autoComplete.addEventListener',start);
 assert(start>=0&&end>start);
 let done;
 const selectionController={sdxECCAAutoSession:session,options:{getClassificationAttributes:true},
  autoComplete:{selectedItems:[]},classifPropModels:[],classifPropertiesUI:{setClassIDandTitle(){}},
  classifPropertiesView:{initDatas(models,facet){assert.equal(facet,'classificationAttiProp');taggedModel=models[0];
   assert.equal(taggedModel.sdxECCAAutoSession,session,'M must tag before initDatas consumes model');done();}}};
 const select=vm.runInNewContext('(function(){'+fixtures[commonId].setup+';'+selectSource.slice(start,end)+';return v;})()',{
  widget,r:selectionController,C:Model,P:{getInformationPanel:()=>false},
  w:{publish(){},subscribe(event,fn){assert.equal(event,'getAttributesDone');done=fn;}}
 });
 await select('C1',true,'Class');
 const model=taggedModel;prop.loadModels(model);
 assert.equal(request.modelList[0],model);assert.equal(model.sdxECCAAutoSession,session);
 request.onComplete({id:'C1',attribute:[{name:'ACCMAttr',nls_label:'A',default:'',type:'string'}]});
 assert.equal(renderCount,1);assert.equal(notified,1);assert.equal(session.mandatoryPrepared,true);
 // 같은 classId여도 폐기된 세션의 늦은 응답은 원래 렌더링 함수에 전달하지 않습니다.
 session.disposed=true;
 request.onComplete({id:'C1',attribute:[{name:'ACCMAttr',nls_label:'old',default:'late',type:'string'}]});
 assert.equal(renderCount,1);assert.equal(notified,1);
 assert.deepEqual(Object.getOwnPropertyDescriptors(helper),beforeHelper);
 assert.deepEqual(Object.getOwnPropertyDescriptors(OriginalProp.prototype),originalSnapshot);
 const ordinary=helper.getFacetList(data,[{name:'classificationFacet'}],{});
 assert.equal(ordinary[1].require,'DS/ClassificationsFacet/PLMNewClassificationFacet');
 assert.equal(ordinary[0].options.sdxECCAAutoSession,undefined);
 // 실제 원본 F init/문맥 재초기화/postCreation 저장 경로를 유지하는지 확인합니다.
 let connected=0,disconnected=0,receivedOptions,association,save;
 const lib={autoComplete:{selectedItems:[{id:'C1'}]},classifPropModels:[model],
  saveRespectiveAssociations(id,ids,provider){association={id,ids,context:provider()};return Promise.resolve([]);},
  classifPropertiesView:{controller:{skeleton:{saveClassificationFacet(...args){save=args;return Promise.resolve();}}}}};
 class InitUI {getUI(options){this.options=options;return {parentNode:null};}getController(){return {plmNewLibraryActive:lib};}}
 const oldConnect=api.connectClassification,oldDisconnect=api.disconnectClassification;
 api.connectClassification=(facet,options)=>{if(!options.sdxECCAAutoSession)return;connected++;receivedOptions=options;
  facet.sdxECCAAutoSession=options.sdxECCAAutoSession;facet.sdxECCAAutoContext=options.securityContext;};
 api.disconnectClassification=()=>disconnected++;
 const facetId='DS/ClassificationsFacet/PLMNewClassificationFacet';
 const facetRow=patch(defs.get(facetId),fixtures[facetId],{window,UWA,console,widget,securityContext:'GLOBAL'});
 const facetBase=Base.extend({listenToPublishedInfo(fn){this.receiveInfo=fn;}});
 const args=row=>row.deps.map((id,i)=>i===0?facetBase:id==='UWA/Core'?UWA:
  id.endsWith('/ClassifPropControl')?{setIsPLMNewCreation(){}}:id.endsWith('/InitClassificationCmpUI')?InitUI:
  id.endsWith('/IPClassifyUtility')?{get3DSpaceUrl(){}}:id.endsWith('/ClassifPropModel')?Model:id.startsWith('i18n!')?nls:{});
 const NativeFacet=facetRow.factory(...args(facetRow)),UnmodifiedFacet=defs.get(facetId).factory(...args(facetRow));
 const nativeOptions={isBookmark:true,isLibrary:true,tenant:'T',securityContext:'A',sdxECCAAutoSession:{context:'A'}};
 const nativeFacet=new NativeFacet(nativeOptions);
 assert.equal(connected,1);assert.equal(receivedOptions,nativeOptions);assert.equal(nativeFacet.initUI.options.isBookmark,true);
 const provider=nativeFacet.plmNewContextProvider;assert.equal(provider(),'A','unbound save provider stays per-dialog');
 nativeFacet.sdxECCAAutoContext='B';nativeFacet.sdxECCAAutoSession={context:'B'};nativeFacet.sdxECCARebuildUI('B');
 assert.equal(nativeFacet.initUI.options.securityContext,'B');assert.equal(nativeFacet.initUI.options.sdxECCAAutoSession.context,'B');
 nativeFacet.receiveInfo('currentSecurityContext',{value:'GLOBAL-C'});assert.equal(provider(),'B');
 assert.equal(NativeFacet.prototype.postCreation.toString(),UnmodifiedFacet.prototype.postCreation.toString());
 await nativeFacet.postCreation([{identifier:'NEW-CA'}]);
 assert.equal(association.id,'NEW-CA');assert.deepEqual(Array.from(association.ids),['C1']);assert.equal(association.context,'B');
 assert.equal(save[0],'NEW-CA');assert.equal(save[3],'B','original classification attribute save uses dialog context');
 nativeFacet.destroy();assert.equal(disconnected,1);
 const ordinaryFacet=new NativeFacet({securityContext:'NORMAL'});assert.equal(connected,1);
 assert.equal(ordinaryFacet.plmNewContextProvider(),'NORMAL');
 api.connectClassification=oldConnect;api.disconnectClassification=oldDisconnect;
 console.log('PASS: ENONewWidget original Engine/Controller/Dialog/helper; custom basic facet only; native 2026 F init/rebuild/postCreation, M tag before consumer, P prepare/native render/notify; stale callbacks blocked; unbound save context isolated; normal facet unchanged');
})().catch(error=>{console.error(error);process.exitCode=1;});
