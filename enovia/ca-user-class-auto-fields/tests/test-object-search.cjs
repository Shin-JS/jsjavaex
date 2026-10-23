// OOTB 검색/모델 계약 대역 검사. 실제 대시보드의 6W 검색 실행은 별도 확인합니다.
const fs = require('fs'), vm = require('vm'), assert = require('assert/strict');
let api, selected, searches = [], destroyed = 0, changed = 0, observer;
let bundleLoaded=false, failBundle=false, failModule=false;
const requests=[];
class Element {
 constructor() { this.children=[]; this.parentNode=null; this.style={}; this.classList={add(){},remove(){}}; }
 appendChild(n){this.children.push(n);n.parentNode=this;}
 removeChild(n){this.children.splice(this.children.indexOf(n),1);n.parentNode=null;}
 setAttribute(){}
 addEventListener(name,fn){this[name]=fn;}
 removeEventListener(name){delete this[name];}
 querySelector(){return target;}
}
class Model {
 constructor(m){Object.assign(this,m);}
 set(k,v){this[k]=v;}
 getIdentifier(){return 'ExtensionsFacet-sdxECModel';}
}
let current = new Model({name:'sdxECModel',value:'old',valueDB:'old',visible:true});
const util={initialize(){this.socket={};},launchSearch(opts){searches.push(opts);selected=opts.in_apps_callback;},destroy(){destroyed++;}};
const target=new Element(), line={_idAttr:current.getIdentifier(),elements:{flexLine:new Element()}};
const form={fields:[line]}, session={type:'sdxECChangeAction'}, facet={skeleton:new Element(),listview:{
 propModel:{getAttributeFromField:(key,value)=>key==='name'&&value==='sdxECModel'?[current]:[],set(id,m){assert.equal(id,current.getIdentifier());current=m;changed++;}},
 propUI:{getFormSection:()=>({getOrganizers:()=>({Default:{_forms:[form]}})})}
}};
const context={document:{createElement:()=>new Element()},MutationObserver:class {
 constructor(fn){observer=fn;}observe(){}disconnect(){observer=null;}
},define(id,deps,factory){api=factory((ids,done,fail)=>{
 requests.push(Array.from(ids));
 if(ids[0]==='DS/ENOXSearchUIController/ENOXSearchUIController'){
  if(failBundle){fail(new Error('bundle 404'));return;}
  bundleLoaded=true;done();return;
 }
 assert.ok(bundleLoaded,'번들 로드 전에 내부 모듈을 요청하면 별도 파일 404 발생');
 assert.deepEqual(Array.from(ids),['DS/ENOXSearchUIController/ObjectOpenSearchUtil','DS/EditPropWidget/models/EditPropAttributeModel']);
 if(failModule){fail(new Error('module unavailable'));return;}
 done(util,Model);
});}};
vm.runInNewContext(fs.readFileSync(require('path').join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js'),'utf8'),context);
const cleanup=api.install(facet,session,{allowedTypes:'Model',valueField:'name'});
assert.equal(target.children.length,2);
target.children[0].click();
assert.equal(requests[0][0],'DS/ENOXSearchUIController/ENOXSearchUIController');
assert.equal(requests[1][0],'DS/ENOXSearchUIController/ObjectOpenSearchUtil');
assert.equal(searches[0].multiSel,false);assert.equal(searches[0].allowedTypes,'Model');
selected([{name:'MODEL-001',id:'PHYSICAL-ID'}]);
assert.equal(current.valueDB,'MODEL-001');assert.equal(current.value,'MODEL-001');
assert.equal(current.isModified,true);assert.equal(current.isUIModified,true);assert.equal(changed,1);
selected([]);assert.equal(changed,1);
selected([{id:'missing-name'}]);assert.equal(changed,1);assert.match(target.children[1].textContent,/name/);
selected([{name:'A'},{name:'B'}]);assert.equal(changed,1);
observer();assert.equal(target.children.length,2); // 같은 폼 재관찰 시 중복 버튼 없음
session.status='error';selected([{name:'stale-context'}]);assert.equal(changed,1);
cleanup();assert.equal(target.children.length,0);assert.equal(destroyed,1);
selected([{name:'late-result'}]);assert.equal(changed,1);
const before=target.children.length;
api.install(facet,{type:'Change Action'},{});assert.equal(target.children.length,before);
api.install(facet,{type:'sdxECChangeAction'},{enabled:false});assert.equal(target.children.length,before);
// 번들/내부 모듈 실패 후 재시도할 수 있고 생성 폼은 유지됩니다.
failBundle=true;
const retrySession={type:'sdxECChangeAction'}, retryCleanup=api.install(facet,retrySession,{});
const count=searches.length;
target.children[0].click();assert.match(target.children[1].textContent,/번들/);assert.equal(searches.length,count);
failBundle=false;failModule=true;
target.children[0].click();assert.match(target.children[1].textContent,/모듈/);assert.equal(searches.length,count);
failModule=false;target.children[0].click();assert.equal(searches.length,count+1);
retryCleanup();
console.log('PASS: bundle-first loading, bundle/module failure and retry, single selection, configured types, model change/serialization flags, cancel, missing value, multiple results, duplicate mount, context error, disposal/late result, type/setting isolation');
