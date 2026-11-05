'use strict';
// 테스트 전용: 설치본 원본에 가이드의 정확한 수정 조각을 적용합니다. 서버 소스는 쓰지 않습니다.
const vm=require('node:vm'),assert=require('node:assert/strict');
module.exports=function apply(row,spec,globals){
 let source=row.factory.toString();
 for(const change of spec.changes){assert.equal(source.split(change.from).length,2,'unique native patch match: '+change.from);source=source.replace(change.from,change.to);}
 const opening=source.indexOf('{')+1;
 const strict=source.slice(opening).match(/^\s*["']use strict["'];/);
 const insertion=opening+(strict?strict[0].length:0);
 source=source.slice(0,insertion)+'\n'+spec.setup+'\n'+source.slice(insertion);
 const factory=vm.runInNewContext('('+source+')',globals);
 return {...row,factory};
};
