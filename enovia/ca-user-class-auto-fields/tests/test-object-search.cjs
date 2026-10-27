// 실제 WUX/검색 서버를 대체한 UI 계약 검사입니다. 설치본 렌더링은 별도 확인합니다.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass/sdxECCAObjectSearch.js'),'utf8');
let normalizer;
vm.runInNewContext(fs.readFileSync(path.join(root,'webapps/sdxECCAAutoClass/sdxECCAModelSearchService.js'),'utf8'),{define(id,deps,factory){normalizer=factory({},{}).normalize;}});
class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;this.style={display:''};this.events=new Map();this.value='';this.readOnly=false;const c=new Set();this.classList={add:x=>c.add(x),remove:x=>c.delete(x)};}
 appendChild(n){if(n.parentNode)n.parentNode.removeChild(n);this.children.push(n);n.parentNode=this;}
 removeChild(n){this.children.splice(this.children.indexOf(n),1);n.parentNode=null;}
 setAttribute(){}
 addEventListener(name,fn){if(!this.events.has(name))this.events.set(name,new Set());this.events.get(name).add(fn);}
 removeEventListener(name,fn){this.events.get(name)?.delete(fn);}
 fire(name,event={}){for(const fn of this.events.get(name)||[])fn(event);}
 querySelector(selector){if(selector==='.formValue')return this.formValue;return null;}
 querySelectorAll(){const values=[];function walk(n){for(const c of n.children){if(c.tagName==='INPUT'||c.tagName==='TEXTAREA')values.push(c);walk(c);}}walk(this);return values;}
 click(){if(!this.disabled)this.fire('click');}
}
class Node {constructor(options){this.options=options;}}
class Tree {constructor(){this.roots=[];}addRoot(node){this.roots.push(node);}}
class Model {
 constructor(m){Object.assign(this,m);}
 get(k){return this[k];}set(k,v){this[k]=v;}
 getIdentifier(){return 'ExtensionsFacet-sdxECModel';}
}
function fixture(mode={}) {
 let api,observer,current=new Model({name:'sdxECModel',value:'unselected-default',valueDB:'unselected-default',visible:true,mandatory:false});
 const autos=[],requests=[],pending=[],searches=[];let destroyed=0,changes=0,bundle=false;
 class Auto {
  constructor(options){this.options=options;this.content=new Element();this.input=new Element('input');this.content.appendChild(this.input);this.events=new Map();autos.push(this);}
  inject(host){host.appendChild(this.content);return this;}
  getContent(){return this.content;}
  addEventListener(n,fn){this.events.set(n,fn);}removeEventListener(n){this.events.delete(n);}
  get selectedItems(){return this.selected;}set selectedItems(n){this.selected=n;this.input.value=n?n.options.label:'';this.events.get('change')?.();}
  type(text){this.input.value=text;this.content.fire('input',{target:this.input});this.lastQuery=this.input.value;}
  destroy(){this.destroyed=true;if(this.content.parentNode)this.content.parentNode.removeChild(this.content);}
 }
 const service={normalize:normalizer,search(scope){return new Promise((resolve,reject)=>pending.push({scope,resolve,reject}));}};
 const util={initialize(){this.socket={};},launchSearch(opts){searches.push(opts);},destroy(){destroyed++;}};
 const target=new Element(),nativeBox=new Element(),nativeInput=new Element('input');nativeBox.style.display='flex';nativeBox.appendChild(nativeInput);target.appendChild(nativeBox);
 const line={_idAttr:current.getIdentifier(),elements:{flexLine:new Element()}};line.elements.flexLine.formValue=target;
 const form={fields:[line]};
 const session={type:mode.type||'sdxECChangeAction',context:'ctx::Leader.Org.Space',tenant:'OnPremise',status:'ready'};
 const facet={skeleton:new Element(),listview:{
  propModel:{getAttributeFromField:()=>[current],set(id,m){assert.equal(id,current.getIdentifier());current=m;changes++;}},
  propUI:{getFormSection:()=>({getOrganizers:()=>({Default:{_forms:[form]}})})}
 }};
 vm.runInNewContext(source,{console:{error(){}},Map,Promise,document:{createElement:tag=>new Element(tag)},MutationObserver:class{constructor(fn){observer=fn;}observe(){}disconnect(){observer=null;}},
  define(id,deps,factory){api=factory((ids,done,fail)=>{
   requests.push(Array.from(ids));
   if(ids[0]==='DS/WUXAutoComplete/AutoComplete'){
    if(mode.failCore){fail(new Error('missing WUX'));return;}
    done(Auto,Tree,Node,Model,service);return;
   }
   if(ids[0]==='DS/ENOXSearchUIController/ENOXSearchUIController'){
    if(mode.failBundle){fail(new Error('bundle unavailable'));return;}
    bundle=true;done();return;
   }
   assert(bundle,'6W internal module was requested before its bundle');
   assert.deepEqual(Array.from(ids),['DS/ENOXSearchUIController/ObjectOpenSearchUtil']);done(util);
  });}
 });
 const cleanup=api.install(facet,session,{enabled:mode.enabled,allowedTypes:'IGNORED',valueField:'name'});
 return {session,facet,line,autos,pending,searches,requests,target,nativeBox,nativeInput,mode,cleanup,observe:()=>observer?.(),current:()=>current,destroyed:()=>destroyed,changes:()=>changes};
}
const record=(name='MODEL-1')=>({id:'ID-'+name,name,title:'Title '+name,type:'sdxMTopAssy'});
(async()=>{
 const f=fixture(),auto=f.autos[0];
 assert.equal(auto.options.allowFreeInputFlag,false);assert.equal(auto.options.multiSearchMode,false);assert.equal(auto.options.minLengthBeforeSearch,3);
 assert.equal(auto.options.typeDelayBeforeSearch,300);assert.equal(f.current().mandatory,false);
 assert.equal(f.current().valueDB,'');assert.equal(f.nativeInput.readOnly,true);assert.equal(f.nativeBox.style.display,'none');
 assert.equal((await auto.options.elementsTree('ab')).roots.length,0);assert.equal(f.pending.length,0);
 auto.type('MOD');const p=auto.options.elementsTree('MOD');
 assert.equal(f.current().valueDB,'');assert.equal(auto.lastQuery,'MOD');
 assert.equal(f.pending[0].scope.securityContext,f.session.context);assert.equal(f.pending[0].scope.tenant,'OnPremise');
 f.pending[0].resolve([record()]);const tree=await p;auto.selectedItems=tree.roots[0];
 assert.equal(f.current().valueDB,'MODEL-1');assert.equal(f.session.modelSearchSelection.id,'ID-MODEL-1');
 assert.equal(f.current().isModified,true);assert.equal(f.current().isUIModified,true);
 auto.type('edited');assert.equal(f.current().valueDB,'');assert.equal(f.session.modelSearchSelection,null);assert.equal(auto.selectedItems,undefined);assert.equal(auto.lastQuery,'edited');
 // Unregistered/free-input nodes cannot become saved values.
 auto.selectedItems=new Node({label:'manual',value:'manual'});assert.equal(f.current().valueDB,'');
 // Out-of-order suggestions are discarded and cannot select an old object.
 auto.type('old');const old=auto.options.elementsTree('old');auto.type('new');const fresh=auto.options.elementsTree('new');
 f.pending[2].resolve([record('NEW')]);const latest=await fresh;f.pending[1].resolve([record('OLD')]);assert.equal((await old).roots.length,0);
 auto.selectedItems=latest.roots[0];assert.equal(f.current().valueDB,'NEW');
 const button=f.target.children.find(n=>n.className==='sdxECCAObjectSearchButton');button.click();
 assert.equal(f.searches[0].allowedTypes,'sdxMTopAssy');assert.equal(f.searches[0].multiSel,false);
 f.searches[0].in_apps_callback([]);assert.equal(f.current().valueDB,'NEW');
 f.searches[0].in_apps_callback([record('A'),record('B')]);assert.equal(f.current().valueDB,'NEW');
 f.searches[0].in_apps_callback([{...record(),type:'OtherType'}]);assert.equal(f.current().valueDB,'NEW');
 f.searches[0].in_apps_callback([{id:'id-only'}]);assert.equal(f.current().valueDB,'NEW');
 f.searches[0].in_apps_callback([{'ds6w:identifier':'CHOOSER','ds6w:label':'Chooser title',id:'CHOOSER-ID','ds6w:type':'sdxMTopAssy'}]);
 assert.equal(f.current().valueDB,'CHOOSER');assert.equal(auto.selectedItems.options.label,'Chooser title');
 button.click();const beforeClear=f.searches.at(-1);auto.selectedItems=undefined;assert.equal(f.current().valueDB,'');assert.equal(f.session.modelSearchSelection,null);beforeClear.in_apps_callback([record('BEFORE-CLEAR')]);assert.equal(f.current().valueDB,'');
 auto.type('another');f.searches[0].in_apps_callback([record('LATE-CHOOSER')]);assert.equal(f.current().valueDB,'');
 let stopped=false;auto.content.fire('keydown',{keyCode:13,stopPropagation(){stopped=true;}});assert(stopped);
 const children=f.target.children.length;f.observe();assert.equal(f.target.children.length,children);
 const replaced=new Element();f.target.appendChild(replaced);f.observe();assert.equal(replaced.style.display,'none');
 auto.type('pending');const closing=auto.options.elementsTree('pending');f.session.transitioning=true;
 f.pending[3].resolve([record('WRONG-CONTEXT')]);assert.equal((await closing).roots.length,0);
 f.searches[0].in_apps_callback([record('WRONG-CONTEXT')]);assert.equal(f.current().valueDB,'');
 f.cleanup();assert.equal(f.nativeBox.style.display,'flex');assert.equal(f.nativeInput.readOnly,false);assert.equal(f.destroyed(),1);assert.equal(auto.destroyed,true);
 assert.equal(f.target.children.length,2); // original editor plus the later OOTB replacement
 const remount=fixture();remount.target.children.find(n=>n.className==='sdxECCAObjectSearchButton').click();remount.searches[0].in_apps_callback([record('PRESERVED')]);
 const newTarget=new Element(),newBox=new Element(),newInput=new Element('input');newBox.appendChild(newInput);newTarget.appendChild(newBox);
 remount.line.elements.flexLine.formValue=newTarget;remount.observe();assert.equal(remount.autos.length,2);assert.equal(remount.autos[1].selectedItems.options.label,'Title PRESERVED');assert.equal(remount.current().valueDB,'PRESERVED');assert.equal(remount.nativeBox.style.display,'flex');remount.cleanup();assert.equal(newBox.style.display,'');
 const failed=fixture();failed.autos[0].type('failure');const failedTree=failed.autos[0].options.elementsTree('failure');failed.pending[0].reject(new Error('unavailable'));assert.equal((await failedTree).roots.length,0);assert.equal(failed.current().valueDB,'');failed.cleanup();
 const optional=fixture({failCore:true});assert.equal(optional.autos.length,0);assert.equal(optional.nativeInput.readOnly,true);optional.cleanup();
 const retry=fixture({failBundle:true}),retryButton=retry.target.children.find(n=>n.className==='sdxECCAObjectSearchButton');
 retryButton.click();assert.equal(retry.searches.length,0);retry.mode.failBundle=false;retryButton.click();assert.equal(retry.searches.length,1);retry.cleanup();
 const other=fixture({type:'Change Action'});assert.equal(other.requests.length,0);assert.equal(other.nativeInput.readOnly,false);
 const disabled=fixture({enabled:false});assert.equal(disabled.requests.length,0);
 console.log('PASS: OOTB selection-only autocomplete + fixed-type chooser, optional empty value, query invalidation, typed/free/late result rejection, scope propagation, remount/cleanup, core failure isolation and bundle retry');
})().catch(error=>{console.error(error);process.exitCode=1;});
