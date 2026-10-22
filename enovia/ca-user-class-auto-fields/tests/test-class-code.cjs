// SearchUtil의 MQL where/루트·하위 분기/페이지 응답 계약 대역 검사입니다.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
let api,handler,requests=[];
const context=vm.createContext({Promise,Error,Set,define(id,deps,factory){api=factory((ids,done)=>done({authenticatedRequest(url,options){
 const request={url,options,body:JSON.parse(options.data)};requests.push(request);handler(request);
}}));}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAClassAttributeService.js'),'utf8'),context);
const service={get3DSpaceUrl:()=>Promise.resolve('https://example.test/3dspace/')};
const scope={classCode:'EC_MX',securityContext:'ctx::Leader.Org.Space',tenant:'OnPremise'};
const attr=(name,value)=>({name,value});
const library=(id,title='EC Library')=>({attributes:[attr('physicalid',id),attr('ds6w:type','General Library'),attr('name','AUTO_'+id),attr('attribute[Title]',title)]});
const cls=(id,code='EC_MX',current='Active')=>({attributes:[attr('physicalid',id),attr('ds6w:type','General Class'),attr('current',current),attr('attribute[sdxClassCode]',code)]});
function fixture(roots,graph,libraryTitle='EC Library'){
 requests=[];
 handler=({url,body,options})=>{
  assert.ok(url.includes('/IPClassificationReuse/Search/search?'));
  assert.equal(body.query,body.root_physicalid?'type == "General Class"':'type == "General Library" && attribute[Title] == "'+libraryTitle+'"');
  assert.equal(body.query.includes('flattenedtaxonomies'),false);
  assert.equal(body.order_field,'ds6w:modified');assert.equal(body.order_by,'desc');
  assert.equal(body.select_predicate.includes('ds6w:type'),true);assert.equal(body.select_predicate.includes('type'),false);
  if(!body.root_physicalid)assert.deepEqual(body.select_predicate,['physicalid','ds6w:type','attribute[Title]']);
  assert.equal(body.states_to_fetch,undefined); // 내부 current 값으로 활성 여부를 확인
  if(body.root_physicalid)assert.deepEqual(body.rels_to_fetch,['Subclass']);
  const rows=body.root_physicalid?(graph[body.root_physicalid]||[]):roots.map(id=>library(id,libraryTitle));
  const start=body.next_start?Number(body.next_start.split(' ')[0]):body.start;
  if(start)assert.equal(typeof body.next_start,'string');
  const page=rows.slice(start,start+2);
  const response={infos:{nhits:rows.length,nresults:page.length,next_start:(start+page.length)+' '+(Math.floor(start/2)+1)}};
  if(page.length)response.results=page; // 실제 서버는 빈 결과일 때 results 자체를 생략합니다.
  options.onComplete(response);
 };
}
(async()=>{
 fixture(['L'],{L:[cls('P','OTHER'),cls('A')],P:[cls('B')]});
 let rule=await api.findActiveClassByCode(service,scope);
 assert.equal(rule.classId,'A');assert.equal(rule.libraryId,'L');
 assert.equal(requests.length,2); // 이름으로 라이브러리 1회 + 해당 라이브러리 1뎁스 1회
 assert.equal(requests.filter(r=>r.body.root_physicalid==='P').length,0);
 assert.equal(new Set(requests.map(r=>r.body.label)).size,requests.length);
 for(const req of requests){assert.equal(req.options.method,'POST');assert.equal(decodeURIComponent(req.options.headers.SecurityContext),scope.securityContext);assert.ok(req.url.endsWith('?tenant=OnPremise'));assert.equal(req.url.includes('.jsp'),false);}
 fixture(['L'],{L:[cls('A','OTHER'),cls('B',''),cls('C')]});
 assert.equal((await api.findActiveClassByCode(service,scope)).classId,'C');
 assert.equal(requests.length,3); // 클래스 다음 페이지도 검사
 fixture(['L'],{L:[cls('A'),cls('B')]});await assert.rejects(api.findActiveClassByCode(service,scope),/여러 개/);
 fixture(['L1','L2'],{});await assert.rejects(api.findActiveClassByCode(service,scope),/라이브러리가 여러 개/);
 assert.equal(requests.length,1); // 라이브러리 중복이면 분류 조회를 시작하지 않음
 fixture(['L1','L2','L3'],{});await assert.rejects(api.findActiveClassByCode(service,scope),/라이브러리가 여러 개/);
 assert.equal(requests.length,1);
 fixture(['L'],{L:[cls('P','OTHER')],P:[cls('B')]});
 await assert.rejects(api.findActiveClassByCode(service,scope),/1뎁스/);assert.equal(requests.length,2);
 fixture(['L'],{L:[cls('A')]},'Another Library');
 assert.equal((await api.findActiveClassByCode(service,{...scope,libraryTitle:'Another Library'})).classId,'A');
 requests=[];handler=({options})=>options.onComplete({results:[library('L','Wrong Library')],infos:{nhits:1,nresults:1,next_start:'1 1'}});
 await assert.rejects(api.findActiveClassByCode(service,scope),/지정값/);assert.equal(requests.length,1);
 for(const libraryTitle of ['',null,'EC" || true','EC\\Library',"EC'Library",'EC\nLibrary']){
  requests=[];await assert.rejects(api.findActiveClassByCode(service,{...scope,libraryTitle}),/라이브러리 제목/);assert.equal(requests.length,0);
 }
 fixture([],{});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 fixture(['L'],{L:[cls('A','OTHER'),cls('B','EC_MX','Inactive'),cls('C',[])]});await assert.rejects(api.findActiveClassByCode(service,scope),/없습니다/);
 for(const response of [null,{},'html login page',{error:{code:'RESULT_FETCH_ERROR'}},{success:false,results:[]},
  {results:[library('L')],infos:{nhits:1,nresults:0,next_start:'1 1'}},
  {results:[library('L')],infos:{nhits:2,nresults:1,next_start:'0 1'}},
  {results:[library('L')],infos:{nhits:2,nresults:1,next_start:'bad'}},
  {infos:{nhits:1,nresults:0,next_start:'0 1'}}]){
  handler=({options})=>options.onComplete(response);await assert.rejects(api.findActiveClassByCode(service,scope));
 }
 handler=({options})=>options.onFailure({error:{code:'RESULT_FETCH_ERROR'}});
 await assert.rejects(api.findActiveClassByCode(service,scope),/RESULT_FETCH_ERROR/);
 handler=({options})=>options.onTimeout();await assert.rejects(api.findActiveClassByCode(service,scope),/초과/);
 requests=[];await assert.rejects(api.findActiveClassByCode(service,{...scope,isCancelled:()=>true}),/취소/);assert.equal(requests.length,0);
 let cancelled=false;handler=({options})=>{cancelled=true;options.onComplete({infos:{nhits:0,nresults:0}});};
 await assert.rejects(api.findActiveClassByCode(service,{...scope,isCancelled:()=>cancelled}),/취소/);
 await assert.rejects(api.findActiveClassByCode(service,{...scope,classCode:"EC_MX' || true"}),/sdxClassCode/);
 await assert.rejects(api.findActiveClassByCode(service,{...scope,securityContext:''}),/권한 문맥/);
 console.log('PASS: library-title scope, two-request lookup, no class expansion, exact code/current, library/class duplicates, pagination, invalid response/title, failure and cancellation');
})().catch(error=>{console.error(error);process.exitCode=1;});
