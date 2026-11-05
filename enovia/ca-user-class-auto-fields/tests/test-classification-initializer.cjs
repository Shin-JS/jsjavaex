'use strict';
// 원본 경로를 주면 실제 R2026x InitClassificationCmpUI/PLMNewClassificationFacet도 실행합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs'),defs=new Map(),pending=[],nativeRequests=[],connected=[];
const config=JSON.stringify({facets:{library:{require:'native-library'},bookmarks:{require:'native-bookmark'}}});
function node(){return {style:{},inject(parent){this.parentNode=parent;return this;},replaceChild(next){next.parentNode=this;}};}
let NativeUI=class {
 constructor(){this.container=node();this.controller={};}
 getUI(options){this.initialOptions=options;return this.container;}
 getController(){this.controller.plmNewLibraryActive=this.plmNewLibraryActive;return this.controller;}
};
let nativeReads=0,nativeLibraryOptions;
const uwa={createElement:node,is:(value,type)=>typeof value===type};
let NativeFacet;
if(process.argv[2]) {
 const original=new Map();
 vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),{
  define(id,deps,factory){original.set(id,{deps:Array.from(deps),factory});},UWA:uwa,Promise,console,
  setInterval(){return 1;},clearInterval(){},securityContext:'A',window:{},
  require(ids,done){nativeRequests.push(ids[0]);if(ids[0]==='native-library')done(class {constructor(options){nativeLibraryOptions=options;}});}
 });
 const uiDef=original.get('DS/ClassificationsFacet/InitClassificationCmpUI');
 NativeUI=uiDef.factory({},Base,{flattenedSearch(options){nativeReads++;options.onComplete({results:[{id:'C1'}]});}},config);
 const facetDef=original.get('DS/ClassificationsFacet/PLMNewClassificationFacet');
 NativeFacet=facetDef.factory(Base.extend({listenToPublishedInfo(){}}),uwa,{}, {},{},
  {setIsPLMNewCreation(){}},{},NativeUI,{get3DSpaceUrl(){}});
} else NativeFacet=Base.extend({
 init(options){this._parent(options);this.initUI=new NativeUI();this.elements.container=this.initUI.getUI(options);},
 destroy(){}
});
const nativeSnapshot=Object.getOwnPropertyDescriptors(NativeUI.prototype);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{
 define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});}
});
const loader=(ids,done,fail)=>pending.push({id:ids[0],done,fail});
const initializer=defs.get('DS/sdxECCACreate/ClassificationInitializer').factory(loader,NativeUI);
function session(){return {status:'loading',fail(error){this.error=error;this.status='error';}};}
function options(s=session()){return {isBookmark:true,isLibrary:true,isExportControl:true,securityContext:'A',tenant:'T',sdxECCAAutoSession:s};}
function flushConfig(){const call=pending.shift();assert(call.id.startsWith('text!'));call.done(config);}
let created=0,seenOptions;
class Library {constructor(options){created++;seenOptions=options;this.autoComplete={};this.classifPropertiesView={};this.accordeonCon={};}}
(async()=>{
 if(process.argv[2]) {
  new NativeUI().getUI({isBookmark:true,isLibrary:true});
  for(let i=0;i<8;i++)await Promise.resolve();
  assert(nativeRequests.includes('native-bookmark'));assert.equal(nativeReads,0,'native library waits indefinitely for bookmark callback');
  new NativeUI().getUI({isBookmark:false,isLibrary:true,securityContext:'A',tenant:'T'});
  for(let i=0;i<8;i++)await Promise.resolve();
  assert(nativeLibraryOptions,'original library constructor contract captured');
  nativeRequests.length=0;nativeReads=0;
 }
 const first=initializer.create(options());
 assert.equal(first.ui.getController().plmNewLibraryActive,undefined);
 flushConfig();assert.equal(pending[0].id,'native-library');pending.shift().done(Library);
 assert(first.ui.getController().plmNewLibraryActive instanceof Library);
 assert.equal(seenOptions.securityContext,'A');assert.equal(seenOptions.tenant,'T');
 assert.equal(seenOptions.getClassificationAttributes,true);assert.equal(seenOptions.attributesReadOnly,false);
 if(nativeLibraryOptions)assert.deepEqual(JSON.parse(JSON.stringify({...seenOptions,container:null})),JSON.parse(JSON.stringify({...nativeLibraryOptions,container:null})));
 for(const flag of ['disposed','transitioning']) {
  const s=session();initializer.create(options(s));flushConfig();s[flag]=true;
  const before=created;pending.shift().done(Library);assert.equal(created,before,'late module callback blocked: '+flag);
 }
 const closed=initializer.create(options());flushConfig();closed.ui.sdxECCAClosed=true;
 const before=created;pending.shift().done(Library);assert.equal(created,before);
 const configFail=session();initializer.create(options(configFail));pending.shift().fail(Error('config404'));
 assert.match(configFail.error.message,/설정 로딩.*config404/);
 const parseFail=session();initializer.create(options(parseFail));pending.shift().done('{}');assert.match(parseFail.error.message,/초기화 설정/);
 const moduleFail=session();initializer.create(options(moduleFail));flushConfig();pending.shift().fail(Error('dependency missing'));
 assert.match(moduleFail.error.message,/native-library.*dependency missing/);
 const ctorFail=session();initializer.create(options(ctorFail));flushConfig();pending.shift().done(class {constructor(){throw Error('ctor failed');}});
 assert.match(ctorFail.error.message,/컨트롤러 생성.*ctor failed/);
 const canonical=JSON.stringify({facets:{library:{require:'DS/PLMNewLibraryActive/PLMNewLibraryActiveController'}}});
 function reachCommon(s) {
  initializer.create(options(s));pending.shift().done(canonical);
  assert.equal(pending[0].id,'DS/ClassificationProp/ClassificationProp');pending.shift().done();
  assert.equal(pending[0].id,'DS/ClassificationProp/ClassifPropWidget');pending.shift().done(function(){});
 }
 const commonFail=session();reachCommon(commonFail);
 assert.equal(pending[0].id,'DS/ClassificationsFacet/PLMNewCommomCmpUXController');
 pending.shift().fail(Error('common failed'));assert.match(commonFail.error.message,/공통 컨트롤러 로딩.*common failed/);
 const lateCommon=session();reachCommon(lateCommon);
 lateCommon.disposed=true;pending.shift().done(function(){});assert.equal(pending.length,0,'disposed common callback cannot start bundle loading');
 const bundleFail=session();initializer.create(options(bundleFail));pending.shift().done(canonical);
 pending.shift().fail(Error('bundle404'));assert.match(bundleFail.error.message,/번들 로딩.*ClassificationProp.*bundle404/);
 const widgetFail=session();initializer.create(options(widgetFail));pending.shift().done(canonical);pending.shift().done();
 pending.shift().fail(Error('widget failed'));assert.match(widgetFail.error.message,/속성 위젯 로딩.*widget failed/);
 const CustomFacet=defs.get('DS/sdxECCACreate/ClassificationFacet').factory(NativeFacet,initializer,{
  connectClassification(facet,opts){connected.push({facet,opts});},disconnectClassification(){}
 });
 const input=options(),facet=new CustomFacet(input);
 assert.equal(input.isBookmark,true);assert.equal(facet.options.isLibrary,true);
 flushConfig();pending.shift().done(Library);
 const firstUI=facet.initUI;assert(firstUI.getController().plmNewLibraryActive instanceof Library);
 assert.equal(connected.length,1);assert.equal(connected[0].opts,input);
 facet.sdxECCAAutoSession=session();facet.sdxECCARebuildUI('B');
 assert.equal(firstUI.sdxECCAClosed,true);flushConfig();pending.shift().done(Library);
 assert.equal(seenOptions.securityContext,'B');assert.notEqual(firstUI,facet.initUI);
 assert.equal(facet.plmNewContextProvider(),'A'); // restart service updates the context before rebuild
 facet.destroy();assert.equal(facet.initUI.sdxECCAClosed,true);
 for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(nativeReads,0,'custom creation does not invoke flattenedSearch prerequisite');
 assert.equal(nativeRequests.length,0,'custom creation does not request bookmark/export controller');
 assert.deepEqual(Object.getOwnPropertyDescriptors(NativeUI.prototype),nativeSnapshot);
 console.log('PASS: direct native library initialization; original constructor contract; native facet init/save retained; no bookmark/search gating; module/constructor failures surfaced; context rebuild and stale callbacks isolated'+(process.argv[2]?'; actual 2026 originals executed':''));
})().catch(error=>{console.error(error);process.exitCode=1;});
