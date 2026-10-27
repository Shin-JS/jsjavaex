'use strict';
// 공급사 코드를 커밋하지 않고 private-rag의 두 참조본을 인자로 받아 실제 래퍼 계약을 실행합니다.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
if(process.argv.length<4)throw Error('Usage: node tests/test-model-search-reference.cjs <2024-ENORouteMgmt.js> <2025-ENORouteMgmt.js>');
(async()=>{
 for(const file of process.argv.slice(2)) {
  const modules={},source=fs.readFileSync(file,'utf8');
  vm.runInNewContext(source,{widget:{data:{}},define(id,deps,factory){modules[id]={deps,factory};}});
  const definition=modules['DS/ENORouteMgmt/Views/Form/ENORouteAutoComplete'];assert(definition,file);
  let options,sent;
  class Auto {constructor(o){options=o;}addEventListener(){}getContent(){return {querySelector:()=>({addEventListener(){}})};}}
  class Tree {constructor(){this.roots=[];}addRoot(node){this.roots.push(node);}getFilterManager(){return {registerFilter(){}};}}
  class Node {constructor(o={}){this.options=o;}}
  const api=definition.factory(Auto,{makeWSCall(path,method,target,contentType,body,done){sent={path,method,target,body:JSON.parse(body)};done({results:[{attributes:[{name:'resourceid',value:'PID'},{name:'ds6w:identifier',value:'MODEL'},{name:'ds6w:label',value:'TITLE'},{name:'ds6w:type',value:'sdxMTopAssy'}]}]});}},
   {getTenantValue:()=> 'OnPremise',getSecurityContextValue:()=> 'ctx::Leader.Org.Space'},Node,Tree,{inherit:obj=>obj},{});
  api.drawAutoCompleteComponent({isMultiSearchMode:false,placeHolderValue:'모델 검색',minLengthToType:3,isFreeInputAllowed:false,toKeepSearchResultsFlag:false,getPrecond:()=>({precond:'type:"sdxMTopAssy"'})});
  assert.equal(options.allowFreeInputFlag,false);assert.equal(options.minLengthBeforeSearch,3);assert.equal(options.multiSearchMode,false);
  const result=await options.elementsTree('MOD');assert.equal(result.roots[0].options.name,'MODEL');assert.equal(result.roots[0].options.value,'PID');
  assert.equal(sent.path,'/search?xrequestedwith=xmlhttprequest');assert.equal(sent.body.login['3dspace'].SecurityContext,'ctx::Leader.Org.Space');assert.match(sent.body.query,/type:"sdxMTopAssy"/);
  console.log('PASS: actual Route autocomplete contract '+file);
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
