'use strict';
const readSource = require('./read-source.cjs');
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('node:assert/strict');
let api,mode='ok',loads=0,doneLoad,finishInstall,installs=0;
const source=readSource(path.join(__dirname,'../webapps/sdxENOChgGovernanceUX/custom/services/sdxECCAAutoClassService.js'),'utf8')
 .replace('installFields: sdxECCAInstallAutoFields,','installFields: sdxECCAInstallAutoFields, testSchedule: sdxECCAScheduleAttributeControl, testSession: sdxECCACreateAutoSession,');
const req=(ids,done,fail)=>{
 loads++;assert.equal(ids[0],'DS/sdxECCAAutoClass/sdxECCAAttributeControl');
 if(mode==='missing'){fail(Error('control missing'));return;}
 if(mode==='late'){doneLoad=done;return;}
 done({install(facet,session){installs++;return new Promise(resolve=>{finishInstall=()=>{
  session.attributeControlReady=true;session.refreshReady();session.notify();resolve(()=>{});
 };});}});
};
vm.runInNewContext(source,{widget:{getValue:()=>undefined},setTimeout:()=>1,clearTimeout(){},
 define(id,deps,factory){api=factory(req,{classRule:{},organization:{},classAttribute:{}});}});
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
 const make=()=>{const s=api.testSession('ctx','sdxECChangeAction',{});s.attributesLoaded=true;s.fieldsMounted=true;s.classificationControlReady=true;s.validateFields=()=>{};return s;};
 let s=make();s.refreshReady();assert.equal(s.status,'loading'); // class ready alone is insufficient
 api.testSchedule({},s);api.testSchedule({},s);await tick();assert.equal(loads,1);assert.equal(installs,1);
 assert.equal(s.status,'loading');finishInstall();await tick();assert.equal(s.status,'ready');
 assert.equal(typeof s.cleanupAttributeControl,'function');s.dispose();
 mode='missing';s=make();api.testSchedule({},s);await tick();assert.equal(s.status,'error');assert.match(s.error.message,/missing/);
 mode='late';s=make();api.testSchedule({},s);s.dispose();const before=installs;doneLoad({install(){installs++;}});
 await tick();assert.equal(installs,before);
 const previous=loads;api.testSchedule({},api.testSession('ctx','Change Request',{}));assert.equal(loads,previous);
 console.log('PASS: default-enabled CA-only control binding, install once, control+classification readiness gate, load failure blocks creation, closed-session cleanup');
})().catch(error=>{console.error(error);process.exitCode=1;});
