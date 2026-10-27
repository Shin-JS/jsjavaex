'use strict';
// Execute the distributed OOTB replacement fragments, without vendor bundles.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const specs=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-hooks.json'),'utf8'));
for(const [id,spec] of Object.entries(specs)) {
 const bundle=id.split('/')[1],note=fs.readFileSync(path.join(root,'webapps',bundle,bundle+'.js'),'utf8');
 const start=note.indexOf('[대상 AMD 모듈] '+id),next=note.indexOf('/* [2025 OOTB 헤더 유지]',start);
 const block=note.slice(start,next<0?undefined:next);
 assert(start>=0);assert(block.includes(spec.setup),id);
 spec.changes.forEach((edit,index)=>{
  assert(block.includes('/* [변경 '+(index+1)+' — 원본에서 찾을 부분]\n'+edit.from+'\n*/'),id);
  assert(block.includes('/* [변경 '+(index+1)+' — 아래 코드로 교체]\n'+edit.to+'\n*/'),id);
 });
}
const facetSpec=specs['DS/ClassificationsFacet/PLMNewClassificationFacet'];
const subscription=facetSpec.changes[1].to;
const provider=facetSpec.changes[2].to;
// F2 has the closing brace of init; F3 has that of plmNewContextProvider.
const setup=vm.runInNewContext('(function(){let securityContext="A";return {init:function(e){'+
 'var sdxECCAFacet=this;'+subscription+',provider:function(){'+provider+'};})()',{
 sdxECCAGetApi:()=>({connectClassification(facet,options){
  if(options.sdxECCAAutoSession){facet.sdxECCAAutoSession=options.sdxECCAAutoSession;facet.sdxECCAAutoContext=options.sdxECCAAutoSession.context;}
 }})
});
let published;
const checks=[];
const facet=Object.assign({},setup,{listenToPublishedInfo(fn){published=fn;}});
facet.init({sdxECCAAutoSession:{context:'A',checkContext:value=>checks.push(value)}});
for(const value of ['B','C','A']){published('currentSecurityContext',{value});assert.equal(facet.provider(),'A');}
assert.deepEqual(checks,[]);
// Non-target CO/CR facets retain OOTB global credential behavior.
for(const type of ['Change Order','Change Request']) {
 const ordinary=Object.assign({},setup,{listenToPublishedInfo(fn){published=fn;}});
 ordinary.init({});published('currentSecurityContext',{value:type});assert.equal(ordinary.provider(),type);
}
const listSpec=specs['DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet'];
const changes=[],order=[];
const options={events:{onChangeAttribute(){order.push('original');}}};
const properties={sdxECCAAutoSession:{checkContext:value=>changes.push(value),checkType(){}},publishAttributeInfo(){order.push('publish');}};
vm.runInNewContext('(function(){'+listSpec.changes[3].to+'}).call(i)',{t:options,i:properties});
options.events.onChangeAttribute({'New-SecurityContext':{valueDB:'B'}});
assert.deepEqual(changes,['B']);assert.deepEqual(order,['publish','original']);
console.log('PASS: every distributed hook matches fixture; global credentials preserve active CA context; New-SecurityContext still checks; CO/CR retain OOTB publishing');

// Optional public runtime source: prove the final value reaches the create HTTP header.
if(process.argv[2]) {
 const rows={};
 vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),{define(id,deps,factory){rows[id]={deps,factory};}});
 const extend={extend:obj=>obj};
 const controller=rows['DS/ENONewWidget/ENONew/Controller/ENONewController'];
 const methods=controller.factory(...Array.from(controller.deps,(_,i)=>i===0?extend:{}));
 const service=rows['DS/ENONewWidget/ajaxRequests/ENONewServices'];
 let sent;
 const services=service.factory(...Array.from(service.deps,(_,i)=>i===0?extend:i===4?{_post(body,options){sent={body,options};}}:i===5?{enrichRequestWithMetrics(){}}:{}));
 const instance=Object.assign({},services,{service:'https://example/3dspace',tenant:'OnPremise',header:{SecurityContext:'GLOBAL-B'},rawTypeInfo:[{}]});
 const create=Object.assign({},methods,{_create(data,options){instance.createContent(data,options,()=>{},()=>{});}});
 const result={defaultAttributes:{Type:{name:'Type',value:'sdxECChangeAction',persistData:[{name:'sdxECChangeAction'}]},SecurityContext:{name:'SecurityContext',value:'DIALOG-A'}},attributes:{publicAttributes:[]}};
 create.onSubmit(result,{eventID:'createClose'});
 assert.equal(sent.options.header.SecurityContext,'DIALOG-A');
 assert.equal(sent.body.create[0].type,'sdxECChangeAction');
 console.log('PASS: supplied OOTB Controller.onSubmit -> Services.createContent sends dialog context as HTTP header despite different global/header context');
}
