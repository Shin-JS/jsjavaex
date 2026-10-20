// 사용법: node tests/test-ootb-validation.cjs /실제/ClassificationProp.js
// 공급사 소스를 저장소에 복사하지 않고 실제 AttributesUtils 구현을 실행합니다.
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
if(!process.argv[2])throw new Error('검증할 OOTB ClassificationProp.js 경로를 지정해 주세요.');
const text=fs.readFileSync(process.argv[2],'utf8');
const start=text.indexOf('define("DS/ClassificationProp/utils/AttributesUtils"');
assert.ok(start>=0,'OOTB AttributesUtils 모듈이 필요합니다.');
let end=text.indexOf(',define(',start);if(end<0)end=text.length;
let validator;
vm.runInNewContext(text.slice(start,end),{define(id,deps,factory){validator=factory({isArray:Array.isArray},{commonChar:()=>0},{get:key=>key,replace:text=>text});}});
function field(mandatory,value){return {name:'Length',label:'Length',mandatory,value,valueDB:value,type:'string',maxlength:-1,minval:'',maxval:'',
 get(key){if(key==='error')return {};if(key==='readOnly')return false;return this[key];},resetError(){this.error=null;},
 setError(message,type){this.error={message,type};},getIdentifier(){return 'Length';}};}
function validate(attr){return validator.validateModels([{values:()=>[attr],isMergedModel:()=>false}]);}
for(const value of ['',[],[''],['  ']]){const attr=field(true,value);assert.ok(validate(attr).length);assert.ok(attr.error);}
assert.equal(validate(field(true,'Steel')),null);
assert.equal(validate(field(false,'')),null);
console.log('PASS: actual OOTB validateModels rejects empty required values and sets model errors; entered and optional values pass');
