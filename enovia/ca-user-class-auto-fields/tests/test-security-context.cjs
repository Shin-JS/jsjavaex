'use strict';
// 생성 진입 메모만 OOTB에 적용합니다. 문맥 재초기화는 상속/세션 회귀 검사에서 확인합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const specs=JSON.parse(fs.readFileSync(path.join(__dirname,'runtime-hooks.json'),'utf8'));
assert.equal(Object.keys(specs).length,1);
for(const [id,spec] of Object.entries(specs)) {
 const note=fs.readFileSync(path.join(root,'webapps/ENOChgGovernanceUX/ENOChgGovernanceUX.js'),'utf8');
 assert(note.includes(spec.setup),id);
 for(const edit of spec.changes){assert(note.includes(edit.from));assert(note.includes(edit.to));}
 let enabled=true,created=0,ordinary=0,command={isClickProcessing:true};
 const launcher=function(){};launcher.prototype.CreateNew=()=>ordinary++;
 const runtime=vm.runInNewContext('(function(){'+spec.setup+';return sdxECCALaunch;})()',{
  widget:{getValue:()=>enabled},console:{error(){}},
 });
 runtime({},launcher,(ids,done)=>{assert.equal(ids[0],'DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService');done({launch(){created++;}});},command);
 assert.equal(created,1);assert.equal(ordinary,0);
 enabled=false;runtime({},launcher,()=>assert.fail(),command);assert.equal(ordinary,1);
 enabled=true;runtime({},launcher,(ids,done,fail)=>fail(Error('missing')),command);assert.equal(command.isClickProcessing,false);
}
console.log('PASS: only Governance entry fragments; target uses custom engine, normal uses original Launcher, load failure restores command');

// Optional public runtime source: prove the final value reaches the create HTTP header.
if(process.argv[2]) {
 const rows={};
 vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),{define(id,deps,factory){rows[id]={deps,factory};}});
 const extend={extend:obj=>obj};
 const controller=rows['DS/ENONewWidget/ENONew/Controller/ENONewController'];
 const methods=controller.factory(...Array.from(controller.deps,(_,i)=>i===0?extend:{}));
 const service=rows['DS/ENONewWidget/ajaxRequests/ENONewServices'];
 let sent;
 const services=service.factory(...Array.from(service.deps,(dep,i)=>i===0?extend:dep.endsWith('/ENONewAjaxRequests')?{_post(body,options){sent={body,options};}}:{}));
 const instance=Object.assign({},services,{service:'https://example/3dspace',tenant:'OnPremise',header:{SecurityContext:'GLOBAL-B'},rawTypeInfo:[{}],enrichWithMetrics(){}});
 const create=Object.assign({},methods,{model:{getSecurityContext:()=> 'DIALOG-A'},_create(data,options){instance.createContent(data,options,()=>{},()=>{});}});
 const result={defaultAttributes:{Type:{name:'Type',value:'sdxECChangeAction',persistData:[{name:'sdxECChangeAction'}]},SecurityContext:{name:'SecurityContext',value:'DIALOG-A'}},attributes:{publicAttributes:[]}};
 create.onSubmit(result,{eventID:'createClose'});
 assert.equal(sent.options.header.SecurityContext,'DIALOG-A');
 assert.equal(sent.body.create[0].type,'sdxECChangeAction');
 console.log('PASS: supplied OOTB Controller.onSubmit -> Services.createContent sends dialog context as HTTP header despite different global/header context');
}
