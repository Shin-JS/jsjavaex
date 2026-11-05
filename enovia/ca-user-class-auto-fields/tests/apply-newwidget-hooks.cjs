'use strict';
// 배포 메모의 연결 조각을 원본 factory에 적용하는 개발 검사용 도구입니다. 서버 배포에는 사용하지 않습니다.
const assert=require('node:assert/strict');
const specs=require('./runtime-hooks.json');
function pattern(source) {
 return new RegExp(source.replace(/\s/g,'').split('').map(char=>char.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('\\s*'),'g');
}
module.exports=function(id,factory,globals={}) {
 const spec=specs[id];if(!spec)return factory;
 let source=factory.toString();
 for(const edit of spec.changes) {
  let from=edit.from,to=edit.to;
  // 2026은 draft 버튼을 먼저 만듭니다. 공통 연결 위치까지만 대체하고 이후 2026 구문을 보존합니다.
  if(from.endsWith(',t.activateDraftMode')) {from=from.slice(0,-'t.activateDraftMode'.length);to=to.slice(0,-'t.activateDraftMode'.length);}
  // 2026 destroy는 View부터 정리합니다. 기존 정리 순서를 보존하고 메서드 시작에 연결만 넣습니다.
  if(from==='destroy:function(){this.myDialog' && !pattern(from).test(source)) {
   from='destroy:function(){';to=to.slice(0,-'this.myDialog'.length);
  }
  const regex=pattern(from),matches=[...source.matchAll(regex)];
  assert.equal(matches.length,1,id+': '+from.slice(0,65));
  source=source.replace(regex,()=>to);
 }
 const start=source.indexOf('{')+1;source=source.slice(0,start)+'\n'+spec.setup+'\n'+source.slice(start);
 return require('node:vm').runInNewContext('('+source+')',globals);
};
