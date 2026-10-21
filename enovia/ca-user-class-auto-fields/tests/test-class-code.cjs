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
const library=id=>({attributes:[attr('physicalid',id),attr('ds6w:type','General Library')]});
const cls=(id,code='EC_MX',current='Active')=>({attributes:[attr('physicalid',id),attr('ds6w:type','General Class'),attr('current',current),attr('attribute[sdxClassCode]',code)]});
function fixture(roots,graph){
 requests=[];
 handler=({url,body,options})=>{
  assert.ok(url.includes('/IPClassificationReuse/Search/search?'));
  assert.equal(body.query,body.root_physicalid?'type == "General Class"':'type == "General Library"');
  assert.equal(body.query.includes('flattenedtaxonomies'),false);
  assert.equal(body.order_field,'ds6w:modified');assert.equal(body.order_by,'desc');
  assert.equal(body.select_predicate.includes('ds6w:type'),true);assert.equal(body.select_predicate.includes('type'),false);
  if(!body.root_physicalid)assert.deepEqual(body.select_predicate,['physicalid','ds6w:type']);
  assert.equal(body.states_to_fetch,undefined); // 비활성 중간 클래스 아래의 활성 클래스를 누락하지 않음
  if(body.root_physicalid)assert.deepEqual(body.rels_to_fetch,['Subclass']);
  const rows=body.root_physicalid?(graph[body.root_physicalid]||[]):roots.map(library);
  const start=body.next_start?Number(body.next_start.split(' ')[0]):body.start;
  if(start)assert.equal(typeof body.next_start,'string');
  const page=rows.slice(start,start+2);
  const response={infos:{nhits:rows.length,nresults:page.length,next_start:(start+page.length)+' '+(Math.floor(start/2)+1)}};
  if(page.length)response.results=page; // 실제 서버는 빈 결과일 때 results 자체를 생략합니다.
  options.onComplete(response);
 };
}
(async()=>{
 fixture(['L1','L2','L3'],{
  L1:[cls('P','', 'Inactive'),cls('X','EC_MX_EXTRA')],L2:[cls('X','EC_MX_EXTRA'),cls('A')],
  P:[cls('B'),cls('C','EC_MX','Inactive')],B:[cls('P','', 'Inactive')]
 });
 assert.equal((await api.findActiveClassByCode(service,scope)).classId,'A');
 assert.ok(requests.some(r=>r.body.next_start==='2 1')); // 루트 라이브러리 다음 페이지
 assert.equal(requests.filter(r=>r.body.root_physicalid==='P').length,0); // 손자 클래스는 조회하지 않음
 assert.equal(requests.filter(r=>r.body.root_physicalid==='X').length,0);
 assert.equal(requests.length,5); // 루트 2페이지 + 라이브러리 3개만 조회
 assert.equal(new Set(requests.map(r=>r.body.label)).size,requests.length); // 팝업별 set 이름 충돌 방지
 for(const req of requests){assert.equal(req.options.method,'POST');assert.equal(decodeURIComponent(req.options.headers.SecurityContext),scope.securityContext);assert.ok(req.url.endsWith('?tenant=OnPremise'));assert.equal(req.url.includes('.jsp'),false);}
 fixture(['L'],{L:[cls('A','OTHER'),cls('B',''),cls('C')]});
 assert.equal((await api.findActiveClassByCode(service,scope)).classId,'C'); // 클래스 다음 페이지의 일치 항목
 fixture(['L1','L2'],{L1:[cls('A')],L2:[cls('B')]});await assert.rejects(api.findActiveClassByCode(service,scope),/여러 개/);
 fixture(['L1','L2'],{L1:[cls('A')],L2:[cls('A')]});assert.equal((await api.findActiveClassByCode(service,scope)).classId,'A');
 // 응답 지연 상황에서 동시 실행 수와 전체 탐색 완료를 검증합니다.
 fixture(['L1','L2','L3','L4','L5','L6'],{L1:[cls('A')],L2:[cls('X','OTHER')],X:[cls('Y','OTHER')]});
 const completeRequest=handler;let active=0,peak=0;
 handler=req=>{active++;peak=Math.max(peak,active);setImmediate(()=>{active--;completeRequest(req);});};
 assert.equal((await api.findActiveClassByCode(service,scope)).classId,'A');
 assert.equal(peak,4);assert.equal(active,0);
 assert.equal(requests.some(r=>r.body.root_physicalid==='X'||r.body.root_physicalid==='Y'),false);
 fixture(['L'],{L:[cls('P','OTHER')],P:[cls('B')]});
 await assert.rejects(api.findActiveClassByCode(service,scope),/1뎁스/);
 assert.equal(requests.length,2); // 일치하는 손자가 있어도 탐색하지 않음
 // 다른 경로 실패 뒤, 이미 진행 중인 경로의 다음 페이지는 요청하지 않습니다.
 fixture(['L1','L2'],{});const rootRequest=handler;let pending=[];
 handler=req=>{if(!req.body.root_physicalid)rootRequest(req);else pending.push(req);};
 const failedLookup=api.findActiveClassByCode(service,scope);
 const checkedFailure=assert.rejects(failedLookup,/RESULT_FETCH_ERROR/);
 await new Promise(setImmediate);assert.equal(pending.length,2);
 pending[0].options.onFailure({error:{code:'RESULT_FETCH_ERROR'}});
 await checkedFailure;
 pending[1].options.onComplete({results:[cls('A','OTHER')],infos:{nhits:2,nresults:1,next_start:'1 1'}});
 await new Promise(setImmediate);assert.equal(pending.length,2);
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
 console.log('PASS: one-depth library classes, no class expansion, request count, pagination/empty results, exact code/current, duplicate errors, cancellation, bounded parallelism and failure stop');
})().catch(error=>{console.error(error);process.exitCode=1;});
