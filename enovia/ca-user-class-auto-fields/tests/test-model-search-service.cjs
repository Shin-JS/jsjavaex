'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
let api,lookup,request,body,mode='ok',response;
const data=()=>({results:[{attributes:[{name:'resourceid',value:'PID'},{name:'ds6w:identifier',value:'MODEL'},{name:'ds6w:label',value:'Model title'},{name:'ds6w:type',value:'sdxMTopAssy'}]}]});
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAModelSearchService.js'),'utf8'),{Map,Set,Promise,
 define(id,deps,factory){api=factory({authenticatedRequest(url,options){request={url,options};body=options.data?JSON.parse(options.data):null;if(mode==='failure')options.onFailure();else if(mode==='timeout')options.onTimeout();else options.onComplete(response);}},
 {getServiceUrl(options){lookup=options;if(mode==='service-failure')options.onFailure();else if(mode==='service-array')options.onComplete([{platformId:'OTHER',url:'https://wrong'},{platformId:'OnPremise',url:'https://search/'}]);else options.onComplete('https://search/');}});}
});
const scope={query:'MODEL',tenant:'OnPremise',securityContext:'ctx::Leader.Org.Space'};
(async()=>{
 response=data();let rows=await api.search(scope);assert.equal(rows[0].name,'MODEL');assert.equal(rows[0].id,'PID');assert.equal(rows[0].title,'Model title');
 assert.equal(lookup.serviceName,'3DSearch');assert.equal(lookup.platformId,scope.tenant);
 assert.equal(body.login['3dspace'].SecurityContext,scope.securityContext);assert.equal(body.tenant,scope.tenant);assert.deepEqual(body.source,['3dspace']);
 assert.match(body.query,/type:"sdxMTopAssy" AND/);assert.equal(body.nresults,20);assert.equal(request.options.method,'POST');assert.match(request.url,/tenant=OnPremise/);
 response={results:[...data().results,...data().results,{id:'other',name:'Other',type:'OtherType'},{name:'missing-id'}]};assert.equal((await api.search(scope)).length,1);
 mode='service-array';response=JSON.stringify(data());assert.equal((await api.search(scope))[0].name,'MODEL');assert.match(request.url,/^https:\/\/search\//);
 mode='ok';response={infos:{nhits:0}};assert.equal((await api.search(scope)).length,0);
 response={error:'bad'};await assert.rejects(api.search(scope),/응답 형식/);
 for(mode of ['failure','timeout','service-failure'])await assert.rejects(api.search(scope));
 mode='ok';request=null;response=data();assert.equal((await api.search({...scope,isCancelled:()=>true})).length,0);assert.equal(request,null);
 assert.equal((await api.search({...scope,query:'ab'})).length,0);assert.equal(request,null);
 await assert.rejects(api.search({...scope,securityContext:''}));await assert.rejects(api.search({...scope,tenant:''}));
 await api.search({...scope,query:'A") OR type:*'});assert.match(body.query,/A\\"\\\) OR type\\:\\\*/);
 assert.equal(api.normalize({id:'p',name:'N',type:'Wrong'}),null);assert.equal(api.normalize({id:'p'}),null);

 const detailScope={id:'PID',tenant:scope.tenant,securityContext:scope.securityContext};
 const detailResponse={success:true,id:'1.2.3.4',physicalid:'PID',name:'MODEL',type:'sdxMTopAssy',attributes:{Description:'한글',Empty:'',Codes:['A','B']}};
 response=detailResponse;let details=await api.readAttributes(detailScope);
 assert.equal(lookup.serviceName,'3DSpace');assert.equal(request.options.method,'GET');assert.equal(request.options.headers.SecurityContext,encodeURIComponent(scope.securityContext));
 assert.match(request.url,/models\/PID\/attributes$/);assert.equal(details.attributes.Description,'한글');assert.deepEqual(details.attributes.Codes,['A','B']);
 response=JSON.stringify(detailResponse);assert.equal((await api.readAttributes({...detailScope,id:'1.2.3.4'})).name,'MODEL');
 for(const changes of [{physicalid:'OTHER'},{type:'Other'},{success:false},{attributes:[]},{name:''}]){
   response={...detailResponse,...changes};await assert.rejects(api.readAttributes(detailScope));
 }
 request=null;assert.equal(await api.readAttributes({...detailScope,isCancelled:()=>true}),null);assert.equal(request,null);
 for(const changes of [{id:'bad/id'},{id:''},{tenant:''},{securityContext:''}])await assert.rejects(api.readAttributes({...detailScope,...changes}));
 response=detailResponse;
 for(mode of ['failure','timeout','service-failure'])await assert.rejects(api.readAttributes(detailScope));
 mode='ok';
 assert.equal(api.normalize({id:'PID',name:'MODEL','ds6w:type':'표시명','ds6w:type_value':'sdxMTopAssy'}).type,'sdxMTopAssy');
 console.log('PASS: scoped 3DSearch discovery, fixed model type, safe query terms, response normalization/deduplication, empty/error/timeout/cancellation handling');
})().catch(error=>{console.error(error);process.exitCode=1;});
