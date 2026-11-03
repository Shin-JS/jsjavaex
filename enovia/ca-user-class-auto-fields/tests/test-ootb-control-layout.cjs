'use strict';
// Run against the vendor originals without copying them into the repository.
// NODE_PATH=<linkedom/node_modules> node tests/test-ootb-control-layout.cjs <2025-original-directory>
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const {parseHTML}=require('linkedom');
const dir=process.argv[2];if(!dir)throw Error('Specify the 2025 original directory');
const {document,MutationObserver}=parseHTML('<html><body></body></html>').window;
const definitions=new Map(),window={top:{perfoIncrem:0,performance:{mark(){}}}};
const globals={document,window,UWA:{clone:obj=>structuredClone(obj)},define(id,deps,factory){definitions.set(id,{deps:Array.from(deps),factory});}};
for(const file of ['EditPropWidget','ENONewWidget'])vm.runInNewContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),globals);
const Field=definitions.get('DS/EditPropWidget/models/EditPropAttributeModel').factory();
const extend={extend:obj=>obj};
const services={compareValue:(a,b)=>String(b).localeCompare(String(a),undefined,{numeric:true})};
const Sections=definitions.get('DS/EditPropWidget/form/FormSections').factory(extend,Field,{}, {},services,{}, {},
 {ACCORDION:{ATTRIBUTES:'Attributes'}},{get:key=>key});
const formDef=definitions.get('DS/EditPropWidget/form/Form');
const Form=formDef.factory(...formDef.deps.map(dep=>dep.endsWith('/CommonAbstract')?extend:
 dep.endsWith('/EditPropAttributeModel')?Field:dep==='DS/WidgetServices/WidgetServices'?services:{}));
const listDef=definitions.get('DS/ENONewWidget/ENONew/View/ENOListView');
const List=listDef.factory(...listDef.deps.map(dep=>dep==='UWA/Controls/Abstract'?extend:
 dep.startsWith('i18n!')?{expandExtension:'EXPAND',collapseExtension:'COLLAPSE',get:key=>key}:{}));
let Control;
const rules=new Map([
 ['ShownRequired',{name:'ShownRequired',order:20,read:true,edit:true,mandatory:true,mandatoryCheck:false}],
 ['CheckedRequired',{name:'CheckedRequired',order:10,read:true,edit:true,mandatory:false,mandatoryCheck:true}],
 ['Optional',{name:'Optional',order:30,read:true,edit:true,mandatory:false,mandatoryCheck:false}],
 ['Readonly',{name:'Readonly',order:40,read:true,edit:false,mandatory:false,mandatoryCheck:false}]
]);
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAttributeControl.js'),'utf8'),{
 document,MutationObserver,define(id,deps,factory){Control=factory((ids,done)=>done({read:()=>Promise.resolve(rules)}));}
});
const fields={};
for(const name of rules.keys()){
 const field=new Field({name,path:name,label:name,visible:false,facet:'ExtensionsFacet',readOnly:false,mandatory:false});
 fields[field.getIdentifier()]=field;
}
const model={getAllAttributes:()=>fields,get:id=>fields[id],set(id,value){fields[id]=value;}};
let sections,headersHidden=0,accordionCalls=0;
const skeleton=document.createElement('div');document.body.appendChild(skeleton);
const view={data:{},propModel:model,propUI:{getFormSection:()=>({getOrganizers:()=>({})})},
 buildModel(){},loadView(){this.refresh();},addAttributeOnUI(){},onSubmit(callback){callback(false);},
 refresh(){
  sections=[];
  const sectionContext={options:{showSections:true},_accordionProperties:{ExtensionsFacet:{name:'ExtensionsFacet',nameNLS:'Extensions',weight:-10}},
   _openedSections:['Attributes'],clear(){},addSection(section){sections.push(section);},openSections(){}};
  Sections.setModel.call(sectionContext,model);
  for(const section of sections){
   const sorted=[];
   Form.setModel.call({clear(){},_addLine(m,field){sorted.push(field);}},model,{attrs:section.list});
   section.sorted=sorted;
  }
  // The unchanged OOTB list-view code must still find the second ExtensionsFacet expander.
  const callbacks={};
  const accordion={_expanderItems:[
   {elements:{header:{hide(){headersHidden++;}}}},
   {domId:'ExtensionsFacet',expandedFlag:false,header:''}
  ],getContent:()=>({addEventListener:(name,fn)=>{callbacks[name]=fn;}})};
  List.manageAccordion.call({}, {elements:{formSection:{elements:{accordion}}}});
  accordionCalls++;assert.equal(accordion._expanderItems[1].header,'EXPAND');
 }
};
const session={type:'sdxECChangeAction',context:'ctx',tenant:'OnPremise',attributeControlState:'CREATE',status:'loading',
 refreshReady(){},notify(){}};
(async()=>{
 const cleanup=await Control.install({listview:view,skeleton},session,{});
 assert.deepEqual(sections.map(s=>s.name),['Attributes','ExtensionsFacet']);
 assert.deepEqual(sections[0].sorted.map(f=>f.name),['CheckedRequired','ShownRequired']);
 assert.deepEqual(sections[1].sorted.map(f=>f.name),['Optional','Readonly']);
 for(const name of ['ShownRequired','CheckedRequired','Optional']){
  const field=Object.values(fields).find(f=>f.name===name);assert.equal(field.get('readOnly'),false);
 }
 assert.equal(Object.values(fields).find(f=>f.name==='Readonly').get('readOnly'),true);
 assert.equal(Object.values(fields).find(f=>f.name==='ShownRequired').mandatory,false); // display only
 assert.equal(headersHidden,accordionCalls);
 cleanup();
 console.log('PASS: actual OOTB AttributeModel/FormSections/Form/manageAccordion preserve main/ExtensionsFacet, per-section order, collapsed header, Edit=Y inputs metadata and independent required indication');
})().catch(e=>{console.error(e);process.exitCode=1;});
