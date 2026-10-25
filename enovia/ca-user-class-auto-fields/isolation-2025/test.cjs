'use strict';
const assert = require('node:assert/strict'), fs = require('fs'), path = require('path');
const os = require('os'), vm = require('vm');
const {build, collect} = require('./build.cjs');
const sourceDir = process.argv[2];
if (!sourceDir) throw new Error('Usage: node test.cjs <2025-input-directory>');
const customDir = path.join(__dirname, '../webapps/sdxECCAAutoClass');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sdx-ca-isolation-'));
try {
    const before = Object.fromEntries(fs.readdirSync(sourceDir).filter(n=>n.endsWith('.js')).map(n => [n, fs.readFileSync(path.join(sourceDir,n))]));
    const result = build({sourceDir, customDir, outDir});
    for (const [name, bytes] of Object.entries(before)) assert.deepEqual(fs.readFileSync(path.join(sourceDir,name)), bytes, 'input changed: '+name);
    const privateRows = collect(result.outFile), rows = new Map(privateRows.map(r=>[r.id,r]));
    assert(privateRows.length > 100);
    assert(privateRows.every(r=>r.id.startsWith('DS/sdxECCA2025/')));
    for (const row of privateRows) for (const dep of row.deps) {
        if (dep.startsWith('DS/sdxECCA2025/')) assert(rows.has(dep), 'missing private dependency: '+dep);
        assert(!/^DS\/(ENONewWidget|ClassificationsFacet|ClassificationProp|EditPropWidget|IPClassifyUtil|IPClassifyActive|PLMNewLibraryActive|PLMNewFolderActive)\//.test(dep), 'unisolated dependency: '+dep);
    }
    // Register originals, then the private bundle in the same loader. No redefinition is allowed.
    const registry = new Map();
    const sandbox = {define:(id,deps,factory)=>{assert(!registry.has(id),'redefinition: '+id);registry.set(id,{deps,factory});}};
    for (const name of ['ENONewWidget','ClassificationsFacet','ClassificationProp','EditPropWidget','IPClassifyUtil','IPClassifyActive','PLMNewLibraryActive','PLMNewFolderActive','ENOChgGovernanceUX'])
        new vm.Script(before[name+'.js'].toString()).runInNewContext(sandbox);
    const originalRegistry = new Map(registry);
    new vm.Script(result.code).runInNewContext(sandbox);
    for (const [id,value] of originalRegistry) assert.equal(registry.get(id),value,'original registration changed: '+id);
    const map = result.manifest.modules, id = suffix => map['DS/'+suffix];
    function factory(moduleId, globals={}) {return vm.runInNewContext('('+rows.get(moduleId).source+')',globals);}
    function deps(moduleId, overrides) {return rows.get(moduleId).deps.map(d=>overrides[d]||{});}
    const autoId = id('sdxECCAAutoClass/sdxECCAAutoClass');
    const widgetValues = {};
    const auto = factory(autoId, {widget:{getValue:key=>widgetValues[key]},setTimeout:()=>1,clearTimeout(){},Set,Map})(...deps(autoId,{}));
    const helperId = id('ENONewWidget/ENONew/View/Facet/ENONewFacetHelper');
    const constants = {ENONewFACET_CLASSIFICATION:'classificationFacet'};
    const helper = factory(helperId)(...deps(helperId, {
        [id('ENONewWidget/utils/ENONewFacetConstants')]:constants,
        ['i18n!DS/ENONewWidget/assets/nls/ENONewFacetNls']:{get:key=>key},[autoId]:auto
    }));
    const data=()=>({defaultAttributes:{Type:{value:'sdxECChangeAction'},SecurityContext:{value:'ctx'}}});
    let facets=helper.getFacetList(data(),[{name:'classificationFacet'}],{securityContext:'ctx'});
    assert(!facets[0].options.sdxECCAAutoSession,'inactive widget received a session');
    widgetValues.sdxECCAEnableAutoClassByOrganization=true;widgetValues.sdxECCAAutoClassType='sdxECChangeAction';
    facets=helper.getFacetList(data(),[{name:'classificationFacet'}],{securityContext:'ctx'});
    assert(facets[0].options.sdxECCAAutoSession);
    assert.equal(facets[1].visible,false,'classification tab must be hidden');
    assert.equal(facets[1].alwaysCalled,true,'classification facet must still load');
    assert.equal(facets[0].options.sdxECCAAutoSession,facets[1].options.sdxECCAAutoSession);
    const second=helper.getFacetList(data(),[{name:'classificationFacet'}],{securityContext:'ctx'});
    assert.notEqual(second[0].options.sdxECCAAutoSession,facets[0].options.sdxECCAAutoSession);
    const other=data();other.defaultAttributes.Type.value='Change Request';
    assert(!helper.getFacetList(other,[{name:'classificationFacet'}],{} )[0].options.sdxECCAAutoSession);
    // Exercise the actual patched 2025 submit method: reject before event/service, recover UI.
    const dialogId=id('ENONewWidget/ENONew/Controller/ENONewDialogController');
    const controls={extend:definition=>definition},calls=[];
    const dialogAuto={canSubmitDialog:()=>false,preserveValidationState:()=>calls.push('preserve')};
    const dialog=factory(dialogId)(...deps(dialogId,{'UWA/Controls/Abstract':controls,[autoId]:dialogAuto}));
    const rejected={resetButtonLabel:()=>calls.push('label'),disableFormInput:()=>calls.push('restore')};
    dialog.onSubmitDialog.call(rejected,'createClose');
    assert.deepEqual(calls,['label','restore']);
    dialogAuto.canSubmitDialog=()=>true;
    const accepted={viewType:'tabView',onSubmit:(event,callback)=>{calls.push('submit');callback({saved:true});},
        dispatchEvent:(name,args)=>{assert.equal(name,'onCreateBtnClick');assert.equal(args[1].eventID,'createClose');calls.push('event');},getUserPreferences:()=>({})};
    dialog.onSubmitDialog.call(accepted,'createClose');assert.deepEqual(calls.slice(-2),['submit','event']);
    // Private dependency failure leaves the original launcher registration and implementation intact.
    const originalLauncher=registry.get('DS/ENONewWidget/ENONewLauncher');
    assert.throws(()=>{const missing=new Map(registry);missing.delete(autoId);function load(id,seen=new Set()){
        if(seen.has(id))return;seen.add(id);const row=missing.get(id);if(!row)throw new Error('missing '+id);
        for(const dep of row.deps)if(dep.startsWith('DS/sdxECCA2025/'))load(dep,seen);
    }load(result.manifest.entry);},/missing/);
    assert.equal(registry.get('DS/ENONewWidget/ENONewLauncher'),originalLauncher);
    let launched=false;
    // The original uses a global RequireJS call, so evaluate it with an explicit loader stub.
    const launcherSource=collect(path.join(sourceDir,'ENONewWidget.js')).find(r=>r.id==='DS/ENONewWidget/ENONewLauncher').source;
    const actualLauncher=vm.runInNewContext('('+launcherSource+')',{require:(names,callback)=>callback(function(opts){launched=opts.type==='Change Action';})})({extend:x=>x},{service_initialization:fn=>fn()});
    actualLauncher.CreateNew({type:'Change Action'});assert(launched);
    // Event bus/provider modules are separate definitions, rather than aliases to original singletons.
    for(const name of ['ClassificationProp/comm/EventManager','ClassificationProp/utils/ClassifPropControl','IPClassifyUtil/IPClassifyAlert','IPClassifyUtil/IPClassifyPreference'])
        assert(registry.has(id(name))&&registry.get(id(name))!==registry.get('DS/'+name));
    const singletonClass={singleton(definition){const instance=Object.assign({_parent(){}},definition);instance.init();return instance;}};
    const originalBus=registry.get('DS/ClassificationProp/comm/EventManager').factory(singletonClass);
    const privateBus=registry.get(id('ClassificationProp/comm/EventManager')).factory(singletonClass);
    let originalEvents=0,privateEvents=0;
    originalBus.subscribe('getAttributesDone',()=>originalEvents++);
    privateBus.subscribe('getAttributesDone',()=>privateEvents++);
    privateBus.publish('getAttributesDone',true);
    assert.equal(privateEvents,1);assert.equal(originalEvents,0);
    originalBus.publish('getAttributesDone',true);
    assert.equal(privateEvents,1);assert.equal(originalEvents,1);
    // Signature drift fails before output. Do not partially build from a 2024 or unknown baseline.
    const drift=path.join(outDir,'drift');fs.mkdirSync(drift);
    for(const [name,bytes] of Object.entries(before))fs.writeFileSync(path.join(drift,name),bytes);
    fs.copyFileSync(path.join(sourceDir,'classificationAppsRequire_setting.json'),path.join(drift,'classificationAppsRequire_setting.json'));
    fs.writeFileSync(path.join(drift,'ENONewWidget.js'),before['ENONewWidget.js'].toString().replaceAll('resetButtonLabel','resetButtons'));
    const driftOut=path.join(outDir,'rejected');assert.throws(()=>build({sourceDir:drift,customDir,outDir:driftOut}),/2025 dialog signatures/);assert(!fs.existsSync(driftOut));
    fs.writeFileSync(path.join(drift,'ENONewWidget.js'),before['ENONewWidget.js'].toString()+'\n/* DS/sdxECCAAutoClass/sdxECCAAutoClass */');
    assert.throws(()=>build({sourceDir:drift,customDir,outDir:driftOut}),/unmodified 2025/);assert(!fs.existsSync(driftOut));
    console.log('PASS: '+privateRows.length+' private modules; original sources/registrations unchanged; scoped sessions; 2025 submit/recovery; dependency failure isolation; baseline drift rejected.');
} finally {fs.rmSync(outDir,{recursive:true,force:true});}
