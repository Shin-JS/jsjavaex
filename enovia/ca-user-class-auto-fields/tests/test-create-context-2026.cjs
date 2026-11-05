'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs'),defs=new Map();
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{
 define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});}
});
const Original=Base.extend({destroyComponent(){this.destroyed=true;}});
const Controller=defs.get('DS/sdxECCACreate/Controller').factory(Original,function(){});
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function deferred(){let resolve,reject;const promise=new Promise((ok,fail)=>{resolve=ok;reject=fail;});return {promise,resolve,reject};}
(async function(){
 let context='A',refreshed=0,notified=0;
 const requests=[],credentials=[];
 const controller=Object.assign(new Controller({}),{
  model:{getSecurityContext:()=>context},defaultAttributes:{Type:{value:'sdxECChangeAction'}},
  dialog:{disableFormInput(){},reloadContent(data){assert.equal(data.model,controller.model);refreshed++;}},
  _getTypeInfo(options){const pending=deferred();requests.push({context:options.securityContext,...pending});return pending.promise;},
  credentialsManager:{getCredentialsAttribute(){const pending=deferred();credentials.push(pending);return pending.promise;}},
  postFetchAttributes(){notified++;},dispatchEvent(){assert.fail('stale failures must not close current dialog');}
 });
 context='B';const first=controller.onChangeSecurityContext('B');
 context='C';const second=controller.onChangeSecurityContext('C');
 requests[0].resolve({type:'sdxECChangeAction',attributes:{stale:true}});await first;
 assert.equal(credentials.length,0);assert.equal(refreshed,0);
 requests[1].resolve({type:'sdxECChangeAction',attributes:{current:true},basicAttributes:{policy:'sdxECR'}});await tick();
 assert.equal(credentials.length,1);
 context='D';const third=controller.onChangeSecurityContext('D');
 credentials[0].resolve({project:{value:'old'}});await second;assert.equal(refreshed,0);
 requests[2].resolve({type:'sdxECChangeAction',attributes:{latest:true},basicAttributes:{policy:'sdxECR'}});await tick();
 credentials[1].resolve({project:{value:'D'},organisation:{value:'O'},role:{value:'Leader'}});await third;
 assert.equal(refreshed,1);assert.equal(notified,1);assert.equal(controller.defaultAttributes.project.value,'D');
 assert.equal(controller.attributes.latest,true);
 // A로 돌아간 후에도 이전 A 요청과 최신 A 요청은 revision으로 구분합니다.
 context='A';const oldA=controller.onChangeSecurityContext('A');
 context='B';const oldB=controller.onChangeSecurityContext('B');
 context='A';const newA=controller.onChangeSecurityContext('A');
 requests[3].reject(Error('old A failed'));requests[4].resolve({});await Promise.all([oldA,oldB]);
 assert.equal(refreshed,1);
 controller.destroyComponent();requests[5].resolve({});await newA;
 assert.equal(controller.destroyed,true);assert.equal(refreshed,1);
 console.log('PASS: 2026 model retained on refresh; stale typeInfo and credentials ignored; A-B-A revision isolation; stale rejection and close do not update current dialog');
})().catch(error=>{console.error(error);process.exitCode=1;});
