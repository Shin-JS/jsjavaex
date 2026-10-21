// OOTB authoring API 통신 대역 검사입니다. 실제 설치 서버의 응답/권한 검증을 대신하지 않습니다.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
let api,handler,requests=[];
const context=vm.createContext({Promise,Error,Set,define(id,deps,factory){api=factory((ids,done)=>done({authenticatedRequest(url,options){
 const request={url,options,body:JSON.parse(options.data)};requests.push(request);handler(request);
}}));}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAClassAttributeService.js'),'utf8'),context);
const service={get3DSpaceUrl:()=>Promise.resolve('https://example.test/3dspace/')};
const scope={classCode:'EC_MX',securityContext:'ctx::Leader.Org.Space',tenant:'OnPremise'};
const attr=(name,value)=>({name,value});
const searchRow=id=>({attributes:[attr('physicalid',id)]});
const detail=(id,code='EC_MX',state='Classification.Active')=>({attributes:[attr('physicalid',id),attr('ds6w:type','General Class'),attr('ds6w:status',state),attr('attribute[sdxClassCode]',code)]});
function fixture(pages,details){
 requests=[];
 handler=({url,body,options})=>{
  if(url.includes('/Search/search?')) {
   const rows=pages[body.start];assert.ok(rows,'Unexpected start '+body.start);
   assert.equal(body.query,'flattenedtaxonomies:"types/General Class"');assert.deepEqual(body.states_to_fetch,['Active']);
   options.onComplete({results:rows.map(searchRow)});
  } else {
   assert.ok(url.includes('/classifiedItem/getContentDetails?'));assert.ok(body.select_predicate.includes('attribute[sdxClassCode]'));
   options.onComplete({results:body.physicalid.map(id=>details[id])});
  }
 };
}
(async()=>{
 fixture({0:['A','B'],2:['C'],3:[]},{A:detail('A','EC_MX_EXTRA'),B:detail('B'),C:detail('C','EC_MX','Classification.Inactive')});
 assert.equal((await api.findActiveClassByCode(service,scope)).classId,'B');
 assert.deepEqual(requests.filter(r=>r.url.includes('/Search/search?')).map(r=>r.body.start),[0,2,3]);
 for(const req of requests){assert.equal(req.options.method,'POST');assert.equal(decodeURIComponent(req.options.headers.SecurityContext),scope.securityContext);assert.ok(req.url.endsWith('?tenant=OnPremise'));assert.equal(req.url.includes('.jsp'),false);}
 fixture({0:['A'],1:['B']},{A:detail('A'),B:detail('B')});
 await assert.rejects(api.findActiveClassByCode(service,scope),/여러 개/);
 fixture({0:[]},{});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 fixture({0:['A'],1:[]},{A:detail('A','OTHER')});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 fixture({0:['A'],1:[]},{A:detail('A',[])});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 fixture({0:['A'],1:[]},{A:detail('A','EC_MX','Inactive')});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 fixture({0:['A'],1:['A']},{A:detail('A')});await assert.rejects(api.findActiveClassByCode(service,scope),/페이지 진행/);
 for(const invalid of [
  {attributes:[attr('physicalid','A'),attr('ds6w:type','General Class'),attr('ds6w:status','Active')]},
  {attributes:[attr('physicalid','A'),attr('ds6w:type','General Library'),attr('ds6w:status','Active'),attr('sdxClassCode','EC_MX')]},
  detail('WRONG'),{attributes:[attr('physicalid','A'),attr('sdxClassCode',['EC_MX','OTHER'])]}
 ]){fixture({0:['A']},{A:invalid});await assert.rejects(api.findActiveClassByCode(service,scope));}
 for(const response of [null,{},'html login page',{error:'Denied'},{success:false,results:[]}]){
  handler=({options})=>options.onComplete(response);await assert.rejects(api.findActiveClassByCode(service,scope));
 }
 for(const method of ['onFailure','onTimeout']){handler=({options})=>options[method]();await assert.rejects(api.findActiveClassByCode(service,scope));}
 handler=({url,options})=>options.onComplete({results:url.includes('/Search/search?')?[searchRow('A')]:[]});
 await assert.rejects(api.findActiveClassByCode(service,scope),/누락/);
 requests=[];await assert.rejects(api.findActiveClassByCode(service,{...scope,isCancelled:()=>true}),/취소/);assert.equal(requests.length,0);
 let cancelled=false;handler=({options})=>{cancelled=true;options.onComplete({results:[]});};
 await assert.rejects(api.findActiveClassByCode(service,{...scope,isCancelled:()=>cancelled}),/취소/);
 await assert.rejects(api.findActiveClassByCode(service,{...scope,classCode:"EC_MX' || true"}),/sdxClassCode/);
 await assert.rejects(api.findActiveClassByCode(service,{...scope,securityContext:''}),/권한 문맥/);
 console.log('PASS: OOTB API routes, active filter, exact DB attribute matching, all pages, duplicates, malformed/partial responses, errors and cancellation');
})().catch(error=>{console.error(error);process.exitCode=1;});
