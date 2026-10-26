// 2025의 실제 ENONewWidget 버튼 처리(Ok/Save/콤보)를 검사합니다.
// node tests/test-ootb-button-state.cjs /실제/ENONewWidget.js
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
if(!process.argv[2])throw new Error('OOTB ENONewWidget.js 경로를 지정해 주세요.');
const source=fs.readFileSync(process.argv[2],'utf8'),modules={};
const names=['DS/ENONewWidget/ENONew/View/Facet/ENONewFacetBase','DS/ENONewWidget/ENONew/Controller/ENONewDialogController'];
for(const id of names){
 const begin=source.indexOf('define("'+id+'"');assert.ok(begin>=0);
 let end=source.indexOf(',define(',begin);if(end<0)end=source.length;
 vm.runInNewContext(source.slice(begin,end),{console,define(name,deps,factory){modules[name]=factory(...Array.from(deps,(dep,i)=>i===0?{extend:obj=>obj}:dep.startsWith('i18n!')?{get:key=>key}:{}));}});
}
const base=modules[names[0]], methods=modules[names[1]];
const property={facetValidation:true};
const dialog=Object.assign({},methods,{viewType:'tabView',isPropertiesFormValid:true,footerButtons:{Ok:{value:'Ok',disabled:false},Save:{value:'Save',disabled:false},createBtnCombo:{disabled:false},Discard:{value:'Discard',disabled:false}},myDialog:{elements:{_checkbox:{disabled:false}}},removeLoadingOverlay(){}});
const classification={options:{tabId:'classificationFacet'},facetValidation:true,setFacetValidation:base.setFacetValidation,getOccurrence(){return {setValidation(){dialog.evaluateValidationStatus();}};}};
dialog.View={facets:[{content:property},{content:classification}],evaluateFacetValidation(){return !this.facets.some(entry=>entry.content.facetValidation===false);}};
classification.setFacetValidation(false);
for(const key of ['Ok','Save','createBtnCombo'])assert.equal(dialog.footerButtons[key].disabled,true);
assert.equal(dialog.footerButtons.Discard.disabled,false);
classification.setFacetValidation(true);assert.equal(dialog.footerButtons.Ok.disabled,false);
property.facetValidation=false;classification.setFacetValidation(false);classification.setFacetValidation(true);
assert.equal(dialog.footerButtons.Ok.disabled,true); // 기본 facet의 무효 상태 유지
property.facetValidation=true;dialog.evaluateValidationStatus();assert.equal(dialog.footerButtons.Ok.disabled,false);
// 변경 후 경로: 탭 표시 함수를 거치지 않고 실제 OOTB 버튼 집계만 호출합니다.
classification.icon='classification-book';
classification.setFacetValidation=()=>{throw new Error('tab error icon update must not run');};
classification.facetValidation=false;dialog.evaluateValidationStatus();
assert.equal(dialog.footerButtons.Ok.disabled,true);assert.equal(classification.icon,'classification-book');
classification.facetValidation=true;dialog.evaluateValidationStatus();
assert.equal(dialog.footerButtons.Ok.disabled,false);assert.equal(classification.icon,'classification-book');
console.log('PASS: actual OOTB setFacetValidation -> evaluateValidationStatus disables all create buttons, preserves cancel and other facet validity');

