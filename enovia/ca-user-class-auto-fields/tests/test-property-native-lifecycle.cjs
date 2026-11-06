'use strict';
// 실제 R2026x IDCardSkeleton._loadFacet에서 이벤트→완료 콜백 순서를 검사합니다.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const file=process.argv[2];if(!file)throw Error('Specify original R2026x ClassificationProp.js');
const defs=new Map(),window={top:{performance:{mark(){}}}};
vm.runInNewContext(fs.readFileSync(file,'utf8'),{window,define(id,deps,factory){defs.set(id,{deps:Array.from(deps),factory});}});
let api;vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8'),{
 widget:{getValue:key=>({sdxECCAEnableAutoClassByOrganization:true,sdxECCAAutoClassType:'sdxECChangeAction'})[key]},
 setTimeout:()=>1,clearTimeout(){},define(id,deps,factory){if(id.endsWith('/sdxECCAAutoClassService'))api=factory(()=>{},{classRule:{},organization:{},classAttribute:{}});}
});
const facets=[{facet:{name:'ENOCreate'},options:{}},{facet:{name:'classificationFacet'},options:{}}];
api.attachBridge({defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'A'}}},facets,{});
const session=facets[0].options.sdxECCAAutoSession;session.classId='C1';session.mandatory=true;
const trace=[],node={addClassName(){return this;},inject(){return this;}};
class NativeProperty {
 constructor(options){this.options=options;trace.push('construct');}
 getUI(){return node;}
 hide(){trace.push('hide');}
 getModel(){return this.model;}
 loadModels(model){trace.push('load');this.model=model;return 'native-result';}
 _onCompleteLoadModel(){}
}
const row=defs.get('DS/ClassificationProp/UI/IDCardSkeleton');assert(row);
const methods=row.factory(...row.deps.map((id,index)=>index===1?{extend(...args){return args.at(-1);}}:
 id==='DS/ClassificationProp/facets/Properties/ClassifPropController'?NativeProperty:{}));
const originalMethods=Object.getOwnPropertyDescriptors(methods);
const entry={facet:{name:'classificationAttiProp'},require:'DS/ClassificationProp/facets/Properties/ClassifPropController',options:{}};
const skeleton=Object.assign(Object.create(methods),{
 options:{eventThread:'TEST'},elements:{bottomArea:{}},_sharedOptions:{},
 _getCurrentSelectedFacet:()=>entry,_getFacetName:item=>item.facet.name,
 getFacetContent(){return this._getFacetContent(entry);},
 publishEvt(event,loaded){assert.equal(event,'classifAttributeLoaded');assert.equal(loaded,entry);
  assert(Object.hasOwn(loaded.content,'loadModels'),'must bind before existing event listeners');trace.push('publish');}
});
const controller={classifPropertiesView:{controller:{skeleton}}};session.controller=controller;
assert.equal(api.bindClassificationProperties(controller,session),true);
const model={sdxECCAAutoSession:session};
skeleton._loadFacet(entry,false,function(){
 trace.push('callback');assert.equal(this,skeleton);
 assert.equal(entry.content.sdxECCAPropertyBridge,session);
 assert.equal(entry.content.loadModels(model),'native-result');
});
assert.deepEqual(trace,['construct','publish','callback','load']);
assert.equal(entry.content.options.tabId,'classificationAttiProp');
assert.equal(entry.require,'DS/ClassificationProp/facets/Properties/ClassifPropController');
assert.equal(entry.content.constructor,NativeProperty);
assert.deepEqual(Object.getOwnPropertyDescriptors(methods),originalMethods);
assert.equal(NativeProperty.prototype.loadModels.toString().includes('closed()'),false);
console.log('PASS: actual unmodified R2026x _loadFacet constructs original facet, binds before native event and model callback; native constructor/module ID and prototype retained');
