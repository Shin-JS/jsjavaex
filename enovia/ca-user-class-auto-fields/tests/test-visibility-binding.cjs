const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
let api,config={},loads=0,installs=0,cleanups=0,warnings=0,fail=false;
const source=fs.readFileSync(path.join(__dirname,'../webapps/sdxECCAAutoClass/sdxECCAAutoClass.js'),'utf8')
    .replace('installFields: sdxECCAInstallAutoFields,',
        'installFields: sdxECCAInstallAutoFields, testVisibility: sdxECCAScheduleAttributeVisibility,');
vm.runInNewContext(source,{
    widget:{getValue:key=>config[key]},console:{warn(){warnings++;}},
    define(id,deps,factory){api=factory((ids,done)=>{
        loads++;assert.equal(ids[0],'DS/sdxECCAAutoClass/sdxECCAAttributeVisibility');
        done({install(){installs++;if(fail)throw new Error('failed');return Promise.resolve(()=>{cleanups++;});}});
    },{},{},{});}
});
function session(type='sdxECChangeAction') {
    let callback;
    return {type,status:'ready',subscribe(fn){callback=fn;fn(this);return ()=>{callback=null;};},
        notify(){if(callback)callback(this);}};
}
const flush=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
    let s=session();api.testVisibility({},s);assert.equal(loads,0);
    config.sdxECCAAttributeVisibilityUrl='/resources/v1/modeler/sdxECCA/attributes/visibility';
    api.testVisibility({},session('Change Action'));assert.equal(loads,0);
    s=session();api.testVisibility({},s);assert.equal(loads,0);
    s.controller={PLMNewCommonWebService:{}};s.notify();s.notify();await flush();
    assert.equal(loads,1);assert.equal(installs,1);assert.equal(typeof s.cleanupAttributeVisibility,'function');
    s.cleanupAttributeVisibility();assert.equal(cleanups,1);
    s=session();s.controller={PLMNewCommonWebService:{}};fail=true;
    api.testVisibility({},s);await flush();assert.equal(warnings,1);assert.equal(s.status,'ready');
    fail=false;s=session();s.controller={PLMNewCommonWebService:{}};
    api.testVisibility({},s);s.disposed=true;await flush();assert.equal(cleanups,2);
    console.log('PASS: URL/type gating, wait for service, install once, failure does not fail dialog, disposed session cleanup');
})().catch(error=>{console.error(error);process.exitCode=1;});
