'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const Base=require('./uwa-class-stub.cjs');
const root=path.resolve(__dirname,'..'),defs=new Map();
const values={sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction',sdxECCACreatePolicy:'sdxECR',sdxECCAAttributeControlState:'ECR_CREATE'};
const widget={getValue:key=>values[key]};
let auto;
vm.runInNewContext(fs.readFileSync(path.join(root,'webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8'),{
 widget,setTimeout:()=>1,clearTimeout(){},define(id,deps,factory){if(id.endsWith('/sdxECCAAutoClassService'))auto=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});}
});
vm.runInNewContext(fs.readFileSync(path.join(root,'webapps/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService.js'),'utf8'),{widget,define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});}});
// 실제 Engine은 objInfo의 알려진 키만 복사합니다. 임의 root 옵션은 자동 전달되지 않습니다.
let Engine=Base.extend({objInfo:{options:{},events:{}},init(options){this.objInfo.context=options.context;Object.assign(this.objInfo.events,options.events);this.controller=this._getController(this.objInfo);}});
if(process.argv[3]) {
 let definition;
 vm.runInNewContext(fs.readFileSync(process.argv[3],'utf8'),{define(id,deps,factory){definition={deps:Array.from(deps),factory};}});
 Engine=definition.factory({is:(value,type)=>typeof value===type},Base,{},Base,function(){},{DIALOG:{LIST_VIEW:'listView'}});
}
const Controller=Base.extend({init(options){this._parent(options);this.context=options.context;},getUI(){return this.dialog;}});
const Dialog=Base.extend({buildContent(){return this.facets;}});
const entry=defs.get('DS/sdxENOChgGovernanceUX/custom/services/sdxECCACreateService').factory(auto,Engine,Controller,Dialog);
const caller={context:{tenant:'Tenant'},type:'Change Order',options:{keep:true},events:{onSuccess(){}}};
const settings={policy:'sdxECO',attributeControlState:'CREATE'};
const co=entry.launch(caller,settings);settings.policy='sdxECR';
const ca=entry.launch({...caller,type:'Change Action'});
function build(engine){
 const dialog=engine.controller.getUI();dialog.viewType='tabView';
 dialog.facets=[{facet:{name:'ENOCreate'},options:{}},{facet:{name:'classificationFacet'},options:{}}];
 const data={defaultAttributes:{Type:{value:'sdxECChangeAction',range:['sdxECChangeAction'],persistData:[{name:'sdxECChangeAction'}]},SecurityContext:{value:'ctx::Leader.Org.Space'}},attributes:{publicAttributes:[{name:'sdxECType',value:'OLD'}]}};
 dialog.buildContent(data,{});const session=dialog.facets[0].options.sdxECCAAutoSession;
 auto.prepareFixedType(data,session);assert.notEqual(session.status,'error');
 return {session,data,dialog};
}
const coState=build(co),caState=build(ca);
assert.equal(coState.session.createPolicy,'sdxECO');assert.equal(coState.session.attributeControlState,'CREATE');
assert.equal(coState.data.attributes.publicAttributes[0].value,'ECO');assert.equal(coState.data.basicAttributes.policy,'sdxECO');
assert.equal(caState.session.createPolicy,'sdxECR');assert.equal(caState.session.attributeControlState,'ECR_CREATE');
assert.equal(caState.data.attributes.publicAttributes[0].value,'ECR');
// 새 문맥으로 UI를 다시 만들 때도 해당 창의 policy/state를 유지합니다.
coState.dialog.buildContent(coState.data,{});assert.equal(coState.dialog.facets[0].options.sdxECCAAutoSession.createPolicy,'sdxECO');
assert.equal(caller.type,'Change Order');assert.equal(caller.options.typeName,undefined);assert.equal(caller.sdxECCACreateSettings,undefined);
assert.equal(values.sdxECCACreatePolicy,'sdxECR');assert.equal(co.objInfo.events.onSuccess,caller.events.onSuccess);
assert.equal(Engine.prototype.objInfo.sdxECCACreateSettings,undefined);
console.log('PASS: CO policy/ECO field/state survive Engine filtering and UI rebuild; parallel CA remains ECR; caller/widget/prototype settings unchanged');
if(process.argv[2]) {
 const id='DS/ENOChgGovernanceUX/scripts/view/ChgCreateChangeOrder',nativeDefs=new Map();
 vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),{define(name,deps,factory){nativeDefs.set(name,{deps:Array.from(deps),factory});}});
 const original=nativeDefs.get(id),spec=require('./runtime-hooks.json')[id];assert(original);
 let changed=original.factory.toString();for(const edit of spec.changes){assert.equal(changed.split(edit.from).length,2);changed=changed.replace(edit.from,()=>edit.to);}
 const start=changed.indexOf('{')+1;changed=changed.slice(0,start)+spec.setup+changed.slice(start);
 function run(enabled,mode='ok') {
  values.sdxECCAEnableAutoClassByOrganization=enabled;const calls=[],preferences=[];let captured,policy;
  const command={isClickProcessing:true};
  const Launcher=function(){};Launcher.prototype.CreateNew=options=>{calls.push('native');captured=options;};
  const loader=(names,done,fail)=>{
   if(typeof names==='string')return names.endsWith('ChgCloudProbeUtils')?{cloudProbeUtils:{genericCommandClickEventForAnalytics(){calls.push('analytics');}}}:
    names.endsWith('ChgChangeOrderHome')?{launchPropertyPanelContext(){calls.push('panel');}}:{displayObjectInfoInsideIDcard(){calls.push('idcard');}};
   calls.push('request');if(mode==='async-fail')return fail(Error('load failed'));if(mode==='throw')throw Error('sync failed');
   done({launch(options,settings){if(mode==='entry-fail')throw Error('entry failed');captured=options;policy=settings;calls.push('custom');}});
  };
  const factory=vm.runInNewContext('('+changed+')',{widget,console:{log(){},error(){}},document:{getElementsByClassName:()=>[]}});
  const module=factory({}, {}, {mask(){}}, {}, {}, {}, {}, {getGlobalVariable:()=>({tenant:'Tenant',getSecurityContext:()=> 'ctx'}),setDialogEventForLoader(){calls.push('loader');}},
   {getUserPreference:()=> 'Change Order',saveUserPreference:value=>preferences.push(value)},{keys:{createKeys:{CO_DEF_TYPE:'default-co'}}},Launcher,loader);
  module.createChangeOrder(command);return {calls,preferences,command,options:captured,settings:policy};
 }
 for(const flag of [false,undefined,'false']){const r=run(flag);assert.deepEqual(r.calls,['analytics','native','loader']);r.options.events.onSuccess({result:[{identifier:'CO',type:'Change Order'}]});assert.equal(r.preferences.length,1);}
 for(const flag of [true,'true']){
  const r=run(flag);assert.deepEqual(r.calls,['analytics','request','custom','loader']);assert.equal(r.settings.policy,'sdxECO');assert.equal(r.settings.attributeControlState,'CREATE');
  assert.equal(r.options.type,'Change Order');assert.equal(r.options.context.header.SecurityContext,'ctx');
  r.options.events.onSuccess({result:[{identifier:'CO',type:'sdxECChangeAction'}]});assert.equal(r.preferences.length,0);assert.deepEqual(r.calls.slice(-2),['panel','idcard']);assert.equal(r.command.isClickProcessing,false);
  for(const event of ['onFailure','onCancel']){const r=run(flag);r.options.events[event]({});assert.equal(r.command.isClickProcessing,false);}
 }
 values.sdxECCACOAttributeControlState='ECO_CREATE';assert.equal(run(true).settings.attributeControlState,'ECO_CREATE');
 for(const mode of ['async-fail','throw','entry-fail']){const r=run(true,mode);assert.equal(r.command.isClickProcessing,false);assert(!r.calls.includes('custom'));}
 console.log('PASS: actual R2026x CO creation patch; native path/events/loader/analytics preserved; ECO override/state and failure handling verified');
}
