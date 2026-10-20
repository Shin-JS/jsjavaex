// 공급사 코드를 복사하지 않고 실제 ENONewWidget의 버튼 상태 처리를 실행합니다.
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
const dialog=Object.assign({},methods,{footerButtons:{Ok:{value:'Ok',disabled:false},Apply:{value:'Apply',disabled:false},createBtnCombo:{disabled:false},Discard:{value:'Discard',disabled:false}},myDialog:{elements:{_checkbox:{disabled:false}}},removeLoadingOverlay(){}});
const classification={facetValidation:true,setFacetValidation:base.setFacetValidation,getOccurrence(){return {setValidation(){dialog.evaluateValidationStatus();}};}};
dialog.View={facets:[{content:property},{content:classification}]};
classification.setFacetValidation(false);
for(const key of ['Ok','Apply','createBtnCombo'])assert.equal(dialog.footerButtons[key].disabled,true);
assert.equal(dialog.footerButtons.Discard.disabled,false);
classification.setFacetValidation(true);assert.equal(dialog.footerButtons.Ok.disabled,false);
property.facetValidation=false;classification.setFacetValidation(false);classification.setFacetValidation(true);
assert.equal(dialog.footerButtons.Ok.disabled,true); // 기본 facet의 무효 상태 유지
property.facetValidation=true;dialog.evaluateValidationStatus();assert.equal(dialog.footerButtons.Ok.disabled,false);
console.log('PASS: actual OOTB setFacetValidation -> evaluateValidationStatus disables all create buttons, preserves cancel and other facet validity');
