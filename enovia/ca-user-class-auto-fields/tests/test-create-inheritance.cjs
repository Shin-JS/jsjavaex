'use strict';
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), assert = require('node:assert/strict');
const Base = require('./uwa-class-stub.cjs');
const definitions = new Map(), cache = new Map(), calls = [], timers = [];
const prefix = 'DS/sdxECCACreate/';
const api = {
 isEnabled: () => true, configureCreateType(o) { o.type = 'sdxECChangeAction'; },
 attachBridge(data, facets) { const session = {context:data.context}; facets.forEach(f => f.options.sdxECCAAutoSession = session); },
 prepareFixedType(data, session) { calls.push(['prepare', data, session]); },
 installFields(facet, options) { calls.push(['install', facet, options]); },
 checkFacetContext(facet, options) { return options.accept; }, destroyFields(facet) { calls.push(['destroy-fields',facet]); },
 connectClassification(facet, options) { calls.push(['connect',facet,options]); },
 disconnectClassification(facet) { calls.push(['disconnect',facet]); },
 bindDialog(dialog) { calls.push(['bind',dialog]); }, canSubmitDialog: () => true,
 preserveValidationState(dialog) { calls.push(['validation',dialog]); }, disposeDialog(dialog) { calls.push(['dispose',dialog]); },
 tagClassModel(controller, model, id) { model.sdxECCAAutoSession = controller.sdxECCAAutoSession; model.sdxECCAAutoClassId = id; },
 prepareAttributes(model, response) { calls.push(['prepare-attributes', model, response]); return !response.reject; },
 notifyAttributesLoaded(model, response) { calls.push(['loaded',model,response]); }
};
cache.set('DS/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService', api);
function original(id, methods) { const cls = Base.extend(methods); cache.set(id,cls); return cls; }
const Engine = original('DS/ENONewWidget/ENONew/ENONewEngine', {objInfo:{options:{},events:{}},init(options) { this.options=options; this.controller=this._getController(options); }});
const Controller = original('DS/ENONewWidget/ENONew/Controller/ENONewController', {
 init(options) { this.context=options.context; }, getUI() { return this.dialog; }
});
const Dialog = original('DS/ENONewWidget/ENONew/Controller/ENONewDialogController', {
 buildContent() { return this.facets; }, manageButtons() { calls.push(['buttons']); },
 onSubmitDialog(event) { calls.push(['submit',event]); return 'submitted'; },
 resetButtonLabel() { calls.push(['label']); }, disableFormInput() { calls.push(['inputs',...arguments]); },
 destroy() { calls.push(['destroy-dialog']); }
});
const Properties = original('DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet', {
 init(options) { this._parent(options); this.preparedBeforeInit=calls.at(-1)[0]==='prepare'; },
 publishAttributeInfo(field) { calls.push(['publish',field]); }, updateFacet(options) { calls.push(['update',options]); },
 destroy() { calls.push(['destroy-properties']); }
});
const Classification = original('DS/ClassificationsFacet/PLMNewClassificationFacet', {
 init(options) { this._parent(options); this.initUI = new (cache.get('DS/ClassificationsFacet/InitClassificationCmpUI'))(); this.elements.container=this.initUI.getUI(options); },
 plmNewContextProvider() { return 'global'; }, postCreation(value) { return value; }, destroy() { calls.push(['destroy-classification']); }
});
const PropController = original('DS/ClassificationProp/facets/Properties/ClassifPropController', {
 loadModels(model) { this.model=model; calls.push(['load-models',model]); }, getModel() { return this.model; },
 _onCompleteLoadModel(response, options) { calls.push(['render',response,options]); return 'rendered'; }
});
cache.set('DS/ClassificationsFacet/InitClassificationCmpUI', class {
 getUI(options) { this.context=options.securityContext; return {context:this.context}; }
});
const snapshots = [Engine,Controller,Dialog,Properties,Classification,PropController].map(cls => Object.getOwnPropertyDescriptors(cls.prototype));
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'), {
 widget:{}, define(id,deps,factory) { definitions.set(id,{deps:Array.from(deps),factory}); }
});
function get(id) { if(cache.has(id))return cache.get(id); const d=definitions.get(id); assert(d,id); const value=d.factory(...d.deps.map(get)); cache.set(id,value); return value; }
const entry=get('DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService');
const options={context:{tenant:'tenant-A'},options:{keep:true},events:{onSuccess(){}}};
const engine=entry.launch(options), controller=engine.controller, dialog=controller.getUI();
assert(engine instanceof Engine);assert(controller instanceof Controller);assert(dialog instanceof Dialog);
assert.notEqual(engine.constructor,Engine);assert.notEqual(controller.constructor,Controller);assert.notEqual(dialog.constructor,Dialog);
assert.equal(dialog.options.sdxECCATenant,'tenant-A');assert.equal(controller.getUI(),dialog);
assert.equal(engine.options.events,options.events);assert.equal(options.type,undefined);
assert.equal(engine.options.viewType,'tabView');assert.equal(options.viewType,undefined);
assert.equal(engine.options.facets.length,1);assert.equal(engine.options.facets[0].name,'classificationFacet');
assert.equal(options.facets,undefined);
const sourceFacets=[{name:'otherFacet',facetoptions:{keep:true}},{name:'classificationFacet',facetoptions:{isLibrary:false}}];
const configured=entry.launch({...options,viewType:'listView',facets:sourceFacets}).options;
assert.equal(configured.viewType,'tabView');assert.equal(configured.facets.length,2);
assert.equal(configured.facets[0].facetoptions.keep,true);assert.equal(configured.facets[1].facetoptions.isLibrary,false);
assert.notEqual(configured.facets,sourceFacets);assert.notEqual(configured.facets[1],sourceFacets[1]);
assert.notEqual(configured.facets[1].facetoptions,sourceFacets[1].facetoptions);
const another=entry.launch(options);assert.notEqual(another.objInfo,engine.objInfo);assert.notEqual(another.objInfo.options,engine.objInfo.options);
assert.notEqual(engine.objInfo.events,Engine.prototype.objInfo.events);
const originalEntries=[{require:'original-properties',facet:{name:'ENOCreate'},options:{}},
 {require:'original-classification',facet:{name:'classificationFacet'},options:{}}];
dialog.viewType='tabView';dialog.facets=originalEntries;
const first=dialog.buildContent({context:'A'},{securityContext:'A'});
assert.equal(first[0].require,prefix+'PropertiesFacet');assert.equal(first[1].require,prefix+'ClassificationFacet');
assert.equal(first[0].options.sdxECCAAutoSession,first[1].options.sdxECCAAutoSession);
assert.equal(originalEntries[0].require,'original-properties');assert.equal(originalEntries[0].options.sdxECCAAutoSession,undefined);
const other=controller.getUI();other.facets=originalEntries;const second=other.buildContent({context:'B'},{});
assert.notEqual(second[0].options.sdxECCAAutoSession,first[0].options.sdxECCAAutoSession);
const changes=[];let session={context:'A',changeContext(value){changes.push(value);calls.push(['context',value]);},checkType(value){changes.push(value);}};
const properties=new (get(prefix+'PropertiesFacet'))({data:{},sdxECCAAutoSession:session});
assert(properties.preparedBeforeInit);assert.equal(calls.at(-1)[0],'install');
calls.length=0;properties.publishAttributeInfo({name:'SecurityContext',valueDB:'B'});
assert.equal(session.currentContext,'B');assert.deepEqual(calls.map(x=>x[0]),['context','publish']);
session={changeContext:session.changeContext,checkType:session.checkType};properties.sdxECCAAutoSession=session;
properties.publishAttributeInfo({name:'SecurityContext',valueDB:'C'});assert.equal(session.currentContext,'C');
calls.length=0;properties.updateFacet({accept:false});assert.equal(calls.length,0);
properties.updateFacet({accept:true});assert.equal(calls[0][0],'update');
calls.length=0;properties.destroy();assert.deepEqual(calls.map(x=>x[0]),['destroy-fields','destroy-properties']);
const classification=new (get(prefix+'ClassificationFacet'))({sdxECCAAutoSession:{},securityContext:'A'});
assert.equal(classification.plmNewContextProvider(),'A');assert.equal(classification.postCreation('original-save'),'original-save');
let replaced;const old=classification.elements.container;old.parentNode={replaceChild(next,previous){assert.equal(previous,old);replaced=next;}};
const previousUI=classification.initUI;classification.sdxECCARebuildUI('B');
assert.notEqual(classification.initUI,previousUI);assert.equal(previousUI.context,'A');assert.equal(classification.initUI.context,'B');
assert.equal(classification.elements.container,replaced);
calls.length=0;classification.destroy();assert.deepEqual(calls.map(x=>x[0]),['disconnect','destroy-classification']);
dialog.myDialog={};calls.length=0;dialog.manageButtons();assert.deepEqual(calls.map(x=>x[0]),['buttons','bind']);
assert.equal(dialog.onSubmitDialog('createClose'),'submitted');
api.canSubmitDialog=()=>false;calls.length=0;dialog.onSubmitDialog('createClose');
assert.deepEqual(calls.map(x=>x[0]),['label','inputs','validation']);assert.deepEqual(calls[1].slice(1),[false,false,true]);
calls.length=0;dialog.destroy();assert.deepEqual(calls.map(x=>x[0]),['dispose','destroy-dialog']);
session={status:'loading',fail(error){this.error=error;}};session.controller={sdxECCAAutoSession:session};
const prop=new (get(prefix+'ClassifPropController'))({sdxECCAAutoSession:session});
const model={get:()=> 'C1'};prop.loadModels(model);assert.equal(model.sdxECCAAutoSession,session);
calls.length=0;const response={attribute:[],results:[{}]},renderOptions={initTable:true};
assert.equal(prop._onCompleteLoadModel(response,renderOptions),'rendered');
assert.deepEqual(calls.map(x=>x[0]),['prepare-attributes','render','loaded']);assert.equal(calls[1][2],renderOptions);
calls.length=0;prop._onCompleteLoadModel({reject:true});assert.deepEqual(calls.map(x=>x[0]),['prepare-attributes']);
for(const flag of ['transitioning','disposed']) { calls.length=0;session[flag]=true;prop._onCompleteLoadModel(response);prop.loadModels(model);assert.equal(calls.length,0);session[flag]=false; }
session.status='error';calls.length=0;prop._onCompleteLoadModel(response);assert.equal(calls.length,0);
session.status='loading';calls.length=0;prop._onCompleteLoadModel({results:[]});assert.deepEqual(calls.map(x=>x[0]),['render']);
[Engine,Controller,Dialog,Properties,Classification,PropController].forEach((cls,i)=>assert.deepEqual(Object.getOwnPropertyDescriptors(cls.prototype),snapshots[i]));
console.log('PASS: isolated engine/controller/dialog/facets; no OOTB prototype writes; original save/events retained; context-before-publish; fresh UI closure; prepare/render/notify order; stale responses blocked');
