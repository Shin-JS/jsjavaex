'use strict';
// node tests/test-amdloader-2026.cjs <R2026x AmdLoader.js>
// 원본 define/require 래퍼와 pluginDS를 함께 실행합니다. UI/서버 의존성만 대역입니다.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs'),file=process.argv[2];if(!file)throw Error('Specify actual R2026x AmdLoader.js');
const root=path.resolve(__dirname,'../webapps'),requests=[],logs=[];let context;
const sandbox={dsDefaultWebappsBaseUrl:root,dsRequireWaitSeconds:2,
 console:{log(...v){logs.push(v.join(' '));},info(...v){logs.push(v.join(' '));},warn(...v){logs.push(v.join(' '));},error(...v){logs.push(v.join(' '));}},
 location:{pathname:'/tests/worker.js',toString:()=> '/tests/worker.js'},
 setTimeout,clearTimeout,setInterval,clearInterval,
 widget:{getValue:key=>({sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction'})[key]}};
sandbox.self=sandbox;
sandbox.importScripts=url=>{requests.push(url);vm.runInContext(fs.readFileSync(url.split('?')[0],'utf8'),context,{filename:url});};
context=vm.createContext(sandbox);vm.runInContext(fs.readFileSync(file,'utf8'),context);
for(const id of ['DS/ENONewWidget/ENONew/ENONewEngine','DS/ENONewWidget/ENONew/Controller/ENONewController',
 'DS/ENONewWidget/ENONew/Controller/ENONewDialogController','DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet'])
 sandbox.define(id,[],()=>Base.extend({objInfo:{options:{},events:{}}}));
const load=ids=>new Promise((resolve,reject)=>sandbox.require(ids,(...items)=>resolve(items),reject));
(async()=>{
 const [entry]=await load(['DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService']);
 const engine=entry.launch({type:'Change Action',options:{},context:{tenant:'T'}});
 assert.equal(engine.options.type,'sdxECChangeAction');assert.equal(typeof sandbox.widget.sdxECCARuntime.connectClassification,'function');
 const [properties]=await load(['DS/sdxECCACreate/PropertiesFacet']);assert.equal(typeof properties.prototype.init,'function');
 const actual=requests.filter(url=>/custom\/services\//.test(url));assert.equal(actual.length,3);
 assert(actual.every(url=>/sdxECCA(CreateService|AutoClassService|DataService)\.js$/.test(url)));
 assert(!requests.some(url=>/sdxECCACreate\/|ClassificationProp\/|ClassificationsFacet\/|PLMNewLibraryActive\//.test(url)));
 assert(!Object.keys(sandbox.requirejs.s.contexts._.registry).some(id=>/ClassificationInitializer|DS\/sdxECCACreate\/ClassifPropController/.test(id)));
 console.log('PASS: actual 2026 AmdLoader define/require wrappers + pluginDS cold-load 3 custom files; internal classes resolve; classification initialization/bundles are not imported by CreateService');
})().catch(error=>{console.error(error);process.exitCode=1;});
