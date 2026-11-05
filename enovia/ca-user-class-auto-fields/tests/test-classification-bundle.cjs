'use strict';
// 실제 RequireJS와 배포 형태(번들 파일 안의 named Controller define)로 cold load를 검사합니다.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const requirejs=require('requirejs'),Base=require('./uwa-class-stub.cjs');
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ecca-library-'));
const moduleId='DS/PLMNewLibraryActive/PLMNewLibraryActiveController',bundleId='DS/PLMNewLibraryActive/PLMNewLibraryActive';
const source=process.argv[2]?fs.readFileSync(process.argv[2],'utf8'):
 `define('${moduleId}',[],function(){return function(options){this.options=options;};});`;
const definitions=new Map();vm.runInNewContext(source,{define(id,deps,factory){definitions.set(id,{deps,factory});}});
assert(definitions.has(moduleId));assert(!definitions.has(bundleId),'2026 file defines Controller, not the bundle ID');
fs.mkdirSync(path.join(root,'DS/PLMNewLibraryActive'),{recursive:true});
fs.writeFileSync(path.join(root,bundleId+'.js'),source);
const factoryDefs=new Map();vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{
 define(id,deps,factory){factoryDefs.set(id,factory);}
});
function registerDependencies() {
requirejs.define('DS/ClassificationsFacet/PLMNewCommomCmpUXController',[],()=>Base);
requirejs.define('text',[],()=>({load(name,req,done){done(JSON.stringify({facets:{library:{require:moduleId}}}));}}));
requirejs.define('i18n',[],()=>({load(name,req,done){done({});}}));
for(const dependency of definitions.get(moduleId).deps.filter(id=>!id.startsWith('i18n!')&&id!=='DS/ClassificationsFacet/PLMNewCommomCmpUXController'))requirejs.define(dependency,[],()=>
 dependency==='DS/ClassificationsFacet/PLMNewCommomCmpUXController'?Base:
 dependency==='DS/ClassificationsFacet/service/PLMNewCommonWebService'?{setSecurityContext(){}}:{});
}
const requests=[],originalLoad=requirejs.load;
requirejs.load=function(context,id,url){requests.push({context:context.contextName,id,url});return originalLoad.call(this,context,id,url);};
class UI {getUI(){this.controller={};return {};}getController(){return {plmNewLibraryActive:this.plmNewLibraryActive};}}
const initializerFactory=factoryDefs.get('DS/sdxECCACreate/ClassificationInitializer');
async function run(context,config={}) {
 registerDependencies();
 const req=requirejs.config({context,baseUrl:root,...config}),initializer=initializerFactory(req,UI);
 const session={status:'loading',fail(error){this.status='error';this.error=error;}};
 const result=initializer.create({securityContext:'A',tenant:'T',sdxECCAAutoSession:session});
 await new Promise((resolve,reject)=>{
  const limit=setTimeout(()=>{clearInterval(timer);reject(Error('initialization timeout'));},3000);
  const timer=setInterval(()=>{if(result.ui.plmNewLibraryActive||session.error){clearTimeout(limit);clearInterval(timer);resolve();}},5);
 });
 if(session.error)throw session.error;
 assert.equal(result.ui.plmNewLibraryActive.options.securityContext,'A');
 assert.equal(result.ui.plmNewLibraryActive.options.tenant,'T');
 assert(requests.filter(r=>r.context===context).every(r=>!r.url.endsWith('PLMNewLibraryActiveController.js')));
}
(async()=>{
 await run('ecca-cold');
 await run('ecca-strict',{enforceDefine:true});
 console.log('PASS: actual RequireJS cold load requests PLMNewLibraryActive.js, resolves its named Controller, never requests nonexistent Controller.js'+(process.argv[2]?'; actual 2026 bundle factory executed':''));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{requirejs.load=originalLoad;fs.rmSync(root,{recursive:true,force:true});});
