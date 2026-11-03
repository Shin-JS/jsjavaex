'use strict';
const readSource = require('./read-source.cjs');
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
let api,mode='ok',payload,request,lookup,held;
const row=(name='A')=>({name,order:1,read:true,edit:false,mandatory:true,mandatoryCheck:false});
const response=attributes=>({success:true,type:'sdxECChangeAction',organization:'MX',state:'CREATE',attributes});
vm.runInNewContext(readSource(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAttributeControlService.js'),'utf8'),{
 define(id,deps,factory){api=factory({authenticatedRequest(url,options){
  request={url,options};if(mode==='failure')options.onFailure();else if(mode==='timeout')options.onTimeout();
  else if(mode==='late')held=options;else options.onComplete(payload);
 }},{getServiceUrl(options){lookup=options;if(mode==='discovery')options.onFailure();
  else options.onComplete([{platformId:'Other',url:'https://wrong'},{platformId:'OnPremise',url:'https://space/3dspace/'}]);
 }});}
});
const scope={tenant:'OnPremise',securityContext:'ctx::Leader.Org.Space',state:'CREATE'};
(async()=>{
 payload=response([row()]);const rules=await api.read(scope);
 assert.equal(lookup.serviceName,'3DSpace');assert.equal(lookup.platformId,'OnPremise');
 assert.equal(request.url,'https://space/3dspace/resources/v1/modeler/sdxECCA/attributes/control?state=CREATE');
 assert.equal(request.options.method,'GET');assert.equal(request.options.headers.SecurityContext,encodeURIComponent(scope.securityContext));
 assert.equal(rules.get('A').edit,false);assert.equal(request.options.data,undefined);
 for(const bad of [response([row(),row()]),response([{...row(),read:'Y'}]),response([{...row(),order:-1}]),
  response([{...row(),order:1.2}]),{...response([]),organization:'VD'},'<html>login</html>',{success:false}]){
  payload=bad;await assert.rejects(api.read(scope));
 }
 for(mode of ['failure','timeout','discovery'])await assert.rejects(api.read(scope));
 mode='ok';payload=response([]);assert.equal((await api.read(scope)).size,0);
 payload=JSON.stringify(response([row()]));assert.equal((await api.read(scope)).size,1);
 for(const changes of [{state:''},{state:'  '},{state:undefined},{url:'https://external/control'},{securityContext:''},{tenant:''}])await assert.rejects(api.read({...scope,...changes}));
 payload={...response([row()]),state:'In Work'};
 assert.equal((await api.read({...scope,state:'In Work'})).size,1);
 assert.match(request.url,/state=In%20Work$/);
 payload=response([row()]);await assert.rejects(api.read({...scope,state:'Approved'}));
 request=null;assert.equal(await api.read({...scope,isCancelled:()=>true}),null);assert.equal(request,null);
 mode='late';let cancelled=false;const late=api.read({...scope,isCancelled:()=>cancelled});
 await new Promise(r=>setImmediate(r));cancelled=true;held.onComplete(response([row()]));assert.equal(await late,null);
 console.log('PASS: scoped 3DSpace discovery, GET control endpoint, strict flags/order/duplicates/scope, empty rules, failed/timeout/discovery and stale-response rejection');
})().catch(error=>{console.error(error);process.exitCode=1;});
