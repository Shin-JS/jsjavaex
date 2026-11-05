'use strict';
// pluginDS의 package 대기가 미완료여도 raw common 선로딩은 가능한 상황을 재현합니다.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const requirejs=require('requirejs');
const common='DS/ClassificationsFacet/PLMNewCommomCmpUXController';
const moduleId='DS/PLMNewLibraryActive/PLMNewLibraryActiveController',bundle='DS/PLMNewLibraryActive/PLMNewLibraryActive';
const packageId='DS/ClassificationsFacet/ClassificationsFacet';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ecca-plugin-'));
for(const dir of ['DS/ClassificationsFacet','DS/PLMNewLibraryActive'])fs.mkdirSync(path.join(root,dir),{recursive:true});
fs.writeFileSync(path.join(root,common+'.js'),`define('${common}',[],function(){return function Common(){};});`);
fs.writeFileSync(path.join(root,packageId+'.js'),`define('${packageId}',['hold!package'],function(){});`);
fs.writeFileSync(path.join(root,bundle+'.js'),`define('${moduleId}',['pluginDS!${common}'],function(Common){return function(options){this.options=options;this.common=Common;};});`);
let pluginFactory;
if(process.argv[2]) {
 const source=fs.readFileSync(process.argv[2],'utf8');
 const start=source.indexOf('define("pluginDS",'),end=source.indexOf(',define("webrecord"',start);
 assert(start>=0&&end>start);
 vm.runInNewContext(source.slice(start,end)+';',{window:{},console,define(id,deps,factory){pluginFactory=factory;}});
}
const factoryDefs=new Map();vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{
 define(id,deps,factory){factoryDefs.set(id,factory);}
});
let holds=0;
function context(name){
 requirejs.define('hold',[],()=>({load(){holds++;}}));
 requirejs.define('text',[],()=>({load(name,req,done){done(JSON.stringify({facets:{library:{require:moduleId}}}));}}));
 requirejs.define('pluginDS',['module'],pluginFactory||function(){return {load(id,req,done){
  if(req.specified(id))req([id],done,done.error);
  else req([packageId],()=>req([id],done,done.error),done.error);
 }};});
 return requirejs.config({context:name,baseUrl:root,waitSeconds:0,config:{pluginDS:{dsModulePattern:'^(DS|DSPARTNERS)/([^/]+)/(.+)'}}});
}
const load=(req,ids)=>new Promise((resolve,reject)=>req(ids,(...items)=>resolve(items),reject));
async function until(predicate){
 const started=Date.now();
 while(!predicate()){
  if(Date.now()-started>1500)throw Error('fixture did not reach expected state');
  await new Promise(resolve=>setTimeout(resolve,5));
 }
}
class UI {getUI(){return {};}getController(){return {plmNewLibraryActive:this.plmNewLibraryActive};}}
(async()=>{
 // 이전 순서: library -> pluginDS!common -> 미완료 package. raw common은 직접 로딩 가능합니다.
 const before=context('ecca-plugin-before');await load(before,[bundle]);
 let completed=false;before([moduleId],()=>{completed=true;});
 await until(()=>holds===1);assert.equal(completed,false);assert.equal(before.defined(common),false);
 await load(before,[common]);assert.equal(before.defined(common),true);assert.equal(completed,false,'pending plugin callback is not repaired retroactively');
 // 수정 순서: 새 페이지 컨텍스트에서 raw common -> bundle -> library. package 대기 경로 진입 없음.
 const after=context('ecca-plugin-after');
 const s={status:'loading',fail(error){this.error=error;this.status='error';}};
 const initializer=factoryDefs.get('DS/sdxECCACreate/ClassificationInitializer')(after,UI);
 const result=initializer.create({securityContext:'A',tenant:'T',sdxECCAAutoSession:s});
 await until(()=>s.error||result.ui.plmNewLibraryActive);if(s.error)throw s.error;
 assert.equal(holds,1,'new context never enters blocked package path');
 assert.equal(result.ui.plmNewLibraryActive.options.securityContext,'A');
 assert.equal(typeof result.ui.plmNewLibraryActive.common,'function');
 console.log('PASS: reproduces pluginDS package wait + successful raw common load; common preloading initializes library in fresh context without package wait'+(pluginFactory?'; actual R2026x pluginDS executed':''));
 // 대기 재현 컨텍스트의 의도적 미완료 모듈을 종료해 RequireJS 폴링을 정리합니다.
 const ctx=requirejs.s.contexts['ecca-plugin-before'];ctx.registry['hold!package'].init([],()=>({}),null,{enabled:true});
 await until(()=>completed);
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>fs.rmSync(root,{recursive:true,force:true}));
