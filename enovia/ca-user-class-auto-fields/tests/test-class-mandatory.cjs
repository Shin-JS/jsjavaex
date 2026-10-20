// 실제 플랫폼 통합 검증을 대신하지 않는 클래스 필수 규칙/서비스 대역 검사입니다.
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert/strict');
const root=path.resolve(__dirname,'..'), modules={};
let request, nextResponse, nextError, disposed=false, fail=null;
const context=vm.createContext({console,Promise,Map,Set,Error,setTimeout,clearTimeout,
 define(id,deps,factory){modules[id]=factory(...Array.from(deps,d=>d==='require'?requireAMD:modules[d]));}});
function requireAMD(ids,done){assert.equal(ids[0],'DS/WAFData/WAFData');done({authenticatedRequest(url,opts){request={url,opts};if(nextError)opts.onFailure();else opts.onComplete(nextResponse);}});}
for(const name of ['sdxECCAClassRuleService','sdxECCAOrganizationProvider','sdxECCAClassAttributeService','sdxECCAAutoClass'])
 vm.runInContext(fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass',name+'.js'),'utf8'),context);
const service=modules['DS/sdxECCAAutoClass/sdxECCAClassAttributeService'], api=modules['DS/sdxECCAAutoClass/sdxECCAAutoClass'];
const response=value=>({results:[{physicalID:'C1',data:[{name:'sdxClassAttrMandatory',value}]}]});
for(const [value,expected] of [['Y',true],[['Y'],true],[' Y ',true],['N',false],['',false],[[],false],['y',false]])
 assert.equal(service.readMandatory(response(value),'C1'),expected);
for(const value of [null,undefined,1,['Y','N']]) assert.throws(()=>service.readMandatory(response(value),'C1'));
assert.throws(()=>service.readMandatory(response('Y'),'C2'));
assert.throws(()=>service.readMandatory({results:[{physicalID:'C1',data:[]}]},'C1'));
assert.throws(()=>service.readMandatory({success:false,results:[]},'C1'));
const db=response(['N']);db.results[0].data[0].valueDB=['Y'];assert.equal(service.readMandatory(db,'C1'),true);
function tagged(mandatory){
 const session={classId:'C1',mandatory,mandatoryPrepared:false,disposed:false,status:'loading',fail(e){this.status='error';this.error=e;}};
 const model={sdxECCAAutoSession:session,sdxECCAAutoClassId:'C1'};return {session,model};
}
function fields(){return {attribute:[{name:'Length'},{name:'Material'}],results:[{physicalID:'C1',data:[
 {name:'Length',extension:'C1',mandatory:false,value:[]},
 {name:'Material',extension:'C1',mandatory:false,value:['Steel']},
 {name:'title',extension:'',mandatory:false},
 {name:'Length',extension:'C2',mandatory:false}]}]};}
let {session,model}=tagged(true), r=fields(), original=r.results[0].data;
assert.equal(api.prepareAttributes(model,r),true);
assert.deepEqual(r.results[0].data.map(a=>a.mandatory),[true,true,false,false]);
assert.equal(original[0].mandatory,false); // shared definition not mutated
assert.equal(r.results[0].data[1].value[0],'Steel');assert.equal(session.mandatoryPrepared,true);
assert.equal(api.prepareAttributes(model,r),true); // repeated prepare is safe
({session,model}=tagged(false));r=fields();r.results[0].data[0].mandatory=true;
assert.equal(api.prepareAttributes(model,r),true);assert.deepEqual(r.results[0].data.map(a=>a.mandatory),[true,false,false,false]);
({session,model}=tagged(true));assert.equal(api.prepareAttributes(model,{attribute:[],results:[]}),true);
({session,model}=tagged(true));r=fields();r.results[0].data.shift();assert.equal(api.prepareAttributes(model,r),false);assert.equal(session.status,'error');
({session,model}=tagged(null));assert.equal(api.prepareAttributes(model,fields()),false);
({session,model}=tagged(true));session.disposed=true;r=fields();assert.equal(api.prepareAttributes(model,r),false);assert.equal(r.results[0].data[0].mandatory,false);
r=fields();assert.equal(api.prepareAttributes({},r),true);assert.equal(r.results[0].data[0].mandatory,false);
// after-only installation must not mark the session ready without the pre-render hook.
({session,model}=tagged(true));api.notifyAttributesLoaded(model,fields());assert.equal(session.status,'error');
(async()=>{
 nextResponse=response(['Y']);
 const scope={classId:'C1',tenant:'OnPremise',securityContext:'ctx::Leader.MX.Space'};
 assert.equal(await service.load({get3DSpaceUrl:()=>Promise.resolve('https://example/3dspace/')},scope),true);
 assert.equal(request.url,'https://example/3dspace/resources/v1/collabServices/attributes/op/read?tenant=OnPremise');
 assert.equal(request.opts.headers.SecurityContext,encodeURIComponent(scope.securityContext));
 assert.deepEqual(JSON.parse(request.opts.data).busIDs,['C1']);assert.equal(JSON.parse(request.opts.data).navigateToMain,'false');
 nextError=true;await assert.rejects(service.load({get3DSpaceUrl:()=>Promise.resolve('https://example')},scope),/조회에 실패/);
 await assert.rejects(service.load({},scope),/주소/);
 // close during class flag read: no selection after the late response.
 let complete;
 const session={rule:{classId:'C1'},context:scope.securityContext,tenant:scope.tenant,status:'loading',disposed:false,started:false,
 fail(e){fail=e;this.status='error';},notify(){}};
 const ctrl={couldBeSelected:()=>true,PLMNewCommonWebService:{
  getClassPaths(o){o.onComplete({});},constructPath(){return new Map([['C1',[{physicalid:'C1',type:'General Class'}]]]);},
  get3DSpaceUrl:()=>new Promise(resolve=>{complete=resolve;})}};
 api.applyClass(ctrl,session);await new Promise(resolve=>setImmediate(resolve));
 session.disposed=true;nextError=false;nextResponse=response('Y');complete('https://example');
 await new Promise(resolve=>setImmediate(resolve));assert.equal(fail,null);
 console.log('PASS: class flag Y/N, strict object/value checks, bound class read, all class fields mandatory before rendering, base/other widget isolation, existing mandatory preservation, empty fields, missing hook/errors, late disposal');
})().catch(e=>{console.error(e);process.exitCode=1;});

// null/undefined/빈 배열도 생성 전 차단하고 0/false는 정상값으로 처리합니다.
{
 const session={mandatory:true,classId:'C1',mandatoryNames:['Length']};
 let message;
 function field(valueDB,value){const data={name:'Length',facet:'C1',label:'길이',valueDB,value};return {get:key=>data[key],setError:m=>{message=m;}};}
 for(const value of [null,undefined,'','  ',[],[''],[null]]) {
  assert.throws(()=>api.validateMandatoryFields(session,[field(value,value)]),/필수 입력/);
  assert.match(message,/길이/);
 }
 for(const value of [0,false,'0','Steel',['A']]) api.validateMandatoryFields(session,[field(value,value)]);
 api.validateMandatoryFields(session,[field(null,'Steel')]);
 assert.throws(()=>api.validateMandatoryFields(session,[]),/속성 모델/);
 api.validateMandatoryFields({mandatory:false},[]);
 console.log('PASS: explicit required validation rejects null/undefined/blank/empty array and preserves 0/false');
}
