// 실제 플랫폼 통합 검증을 대신하지 않는 클래스 필수 규칙/서비스 대역 검사입니다.
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert/strict');
const root=path.resolve(__dirname,'..'), modules={};
let request, nextResponse, nextError, disposed=false, fail=null;
const context=vm.createContext({console,Promise,Map,Set,Error,setTimeout,clearTimeout,
 define(id,deps,factory){modules[id]=factory(...Array.from(deps,d=>d==='require'?requireAMD:modules[d]));}});
function requireAMD(ids,done){assert.equal(ids[0],'DS/WAFData/WAFData');done({authenticatedRequest(url,opts){request={url,opts};if(nextError)opts.onFailure();else opts.onComplete(nextResponse);}});}
for(const name of ['sdxECCAClassRuleService','sdxECCAOrganizationProvider','sdxECCAClassAttributeService','sdxECCAObjectSearch','sdxECCAAutoClass'])
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
// 완료 통지는 실제 폼 모델의 mandatory 반영을 확인합니다. 선택 시 모델만으로 통과하지 않습니다.
for(const applied of [true,false]) {
 const taggedModel=tagged(true);const state=taggedModel.session;
 api.prepareAttributes(taggedModel.model,fields());let loaded=false;
 const rendered={get:key=>key==='objectId'?'C1':undefined,values:()=>['Length','Material'].map(name=>({get:key=>({name,facet:'C1',mandatory:applied})[key]}))};
 state.controller={classifPropertiesView:{controller:{skeleton:{getFacetContent(name){assert.equal(name,'classificationAttiProp');return {
 getModel:()=>rendered,editPropertiesUI:{elements:{UIController:{validateModels(){}}}}
 };}}}}};
 state.markAttributesLoaded=()=>{loaded=true;};
 api.notifyAttributesLoaded(taggedModel.model,fields());
 assert.equal(loaded,applied);assert.equal(state.status,applied?'loading':'error');
}
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

