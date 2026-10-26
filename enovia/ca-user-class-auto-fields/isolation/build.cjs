#!/usr/bin/env node
'use strict';
// Vendor sources stay on the deployment machine. This generator never overwrites them.
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = 'DS/sdxECCA/';
const bundles = ['ENONewWidget', 'ClassificationsFacet', 'ClassificationProp', 'EditPropWidget',
    'IPClassifyUtil', 'IPClassifyActive', 'PLMNewLibraryActive', 'PLMNewFolderActive'];
const customNames = ['sdxECCAAutoClass', 'sdxECCAClassRuleService', 'sdxECCAOrganizationProvider',
    'sdxECCAClassAttributeService', 'sdxECCAObjectSearch'];
const autoId = 'DS/sdxECCAAutoClass/sdxECCAAutoClass';
const caId = 'DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction';
function once(source, from, to, label) {
    if (source.split(from).length !== 2) throw new Error('2025 source mismatch: ' + label + ' [' + from + ']');
    return source.replace(from, () => to);
}
function collect(file) {
    const entries = [];
    const define = (id, deps, factory) => {
        if (typeof id !== 'string' || !Array.isArray(deps) || typeof factory !== 'function')
            throw new Error('Unsupported AMD declaration in ' + file);
        entries.push({ id, deps: Array.from(deps), source: factory.toString() });
    };
    define.amd = {};
    new vm.Script(fs.readFileSync(file, 'utf8'), {filename: file}).runInNewContext({define}, {timeout: 5000});
    return entries;
}
function build({sourceDir, customDir, outDir}) {
    const modules = new Map(), hashes = {};
    function load(file, filter = () => true) {
        const bytes = fs.readFileSync(file);
        if (path.resolve(path.dirname(file)) === path.resolve(sourceDir) &&
            /sdxECCA|zcaAttachBridge|zcaBridge|zcaEnableLibraryInProperties/.test(bytes.toString()))
            throw new Error('Use unmodified 2025 OOTB input: ' + file);
        hashes[file] = crypto.createHash('sha256').update(bytes).digest('hex');
        for (const row of collect(file).filter(filter)) {
            if (modules.has(row.id)) throw new Error('Duplicate AMD module: ' + row.id);
            modules.set(row.id, row);
        }
    }
    for (const name of bundles) load(path.join(sourceDir, name + '.js'));
    load(path.join(sourceDir, 'ENOChgGovernanceUX.js'), row => row.id === caId);
    for (const name of customNames) load(path.join(customDir, name + '.js'));
    if (!modules.has(caId)) throw new Error('Missing 2025 CA entry');
    // A 2024 bundle must never silently produce a nominal 2025 deployment.
    const dialogId = 'DS/ENONewWidget/ENONew/Controller/ENONewDialogController';
    const dialog = modules.get(dialogId).source;
    if (!dialog.includes('resetButtonLabel()') || !dialog.includes('disableFormInput:function(') ||
        !dialog.includes('dispatchEvent("onCreateBtnClick"')) throw new Error('2025 dialog signatures are required');
    const mappings = Object.fromEntries([...modules.keys()].map(id => [id, ROOT + 'private/' + id.slice(3)]));
    function patch(id, from, to) {
        const row = modules.get(id); if (!row) throw new Error('Missing module: ' + id);
        row.source = once(row.source, from, to, id);
    }
    function useAuto(id) {
        const row = modules.get(id);
        const match = /^function\s*\(([^)]*)\)/.exec(row.source);
        if (!match) throw new Error('Unsupported factory: ' + id);
        const args = match[1] ? match[1].split(',') : [];
        while (args.length < row.deps.length) args.push('sdxUnused' + args.length);
        args.push('sdxECCAAutoClass'); row.deps.push(autoId);
        row.source = row.source.replace(match[0], 'function(' + args.join(',') + ')');
    }
    const helper = 'DS/ENONewWidget/ENONew/View/Facet/ENONewFacetHelper';
    const list = 'DS/ENONewWidget/ENONew/View/Facet/ENOListViewFacet';
    const facet = 'DS/ClassificationsFacet/PLMNewClassificationFacet';
    const controller = 'DS/ClassificationsFacet/PLMNewCommomCmpUXController';
    const prop = 'DS/ClassificationProp/facets/Properties/ClassifPropController';
    for (const id of [helper, list, dialogId, facet, controller, prop, caId]) useAuto(id);
    patch(helper, '})),a},getDefaultFacet:', '})),sdxECCAAutoClass.attachBridge(e,a,i),a.forEach(function(f){if(f.facet.name==="classificationFacet"&&f.options.sdxECCAAutoSession)f.visible=false}),a},getDefaultFacet:');
    patch(list, 'this._parent(t),this.skeleton=', 'this._parent(t),sdxECCAAutoClass.prepareFixedType(t.data,t.sdxECCAAutoSession),this.skeleton=');
    patch(list, 'this.listview.loadView()},updateFacet:', 'this.listview.loadView(),sdxECCAAutoClass.installFields(this,t)},updateFacet:');
    patch(list, 'updateFacet:function(e){', 'updateFacet:function(e){sdxECCAAutoClass.checkFacetContext(this,e);');
    patch(list, 'var n=e[t];i.publishAttributeInfo(n)', 'var n=e[t];if(i.sdxECCAAutoSession){if(t==="New-SecurityContext")i.sdxECCAAutoSession.checkContext(n.valueDB);else if(t==="New-Type")i.sdxECCAAutoSession.checkType(n.valueDB)}i.publishAttributeInfo(n)');
    patch(list, 'destroy:function(){this.listview.destroy()', 'destroy:function(){sdxECCAAutoClass.destroyFields(this);this.listview.destroy()');
    patch(dialogId, 'o.myDialog=o.buildDialog(a),o.manageButtons(),', 'o.myDialog=o.buildDialog(a),o.manageButtons(),sdxECCAAutoClass.bindDialog(o),');
    patch(dialogId, 'onSubmitDialog:function(e){', 'onSubmitDialog:function(e){if(!sdxECCAAutoClass.canSubmitDialog(this)){this.resetButtonLabel();this.disableFormInput(!1,!1,!0);return;}');
    patch(dialogId, 'i?this.removeLoadingOverlay():this.addLoadingOverlay()},', 'i?this.removeLoadingOverlay():this.addLoadingOverlay();sdxECCAAutoClass.preserveValidationState(this)},');
    patch(dialogId, 'destroy:function(){this.myDialog', 'destroy:function(){sdxECCAAutoClass.disposeDialog(this);this.myDialog');
    patch(dialogId, 'for(eventID in ', 'for(var eventID in ');
    patch(dialogId, 'var p=e.extend(', 'var errorenousFacetsList;var p=e.extend(');
    // The vendor facet uses an unqualified securityContext. Keep ours on the instance.
    patch(facet, 'init:function(e){var i=e;', 'init:function(e){var i=e,sdxFacet=this;');
    patch(facet, 'i.securityContext&&(securityContext=i.securityContext)', 'i.securityContext&&(this.sdxECCAAutoContext=i.securityContext)');
    patch(facet, 'securityContext=e}}))}', 'sdxFacet.sdxECCAAutoContext=e;if(sdxFacet.sdxECCAAutoSession)sdxFacet.sdxECCAAutoSession.checkContext(e)}})),sdxECCAAutoClass.connectClassification(this,e)}');
    patch(facet, 'return securityContext}', 'return this.sdxECCAAutoContext}');
    patch(facet, 'destroy:function(){t.is(', 'destroy:function(){sdxECCAAutoClass.disconnectClassification(this);t.is(');
    patch(controller, 'r.classifPropModels.push(s),v.publish(', 'r.classifPropModels.push(s),sdxECCAAutoClass.tagClassModel(r,s,e),v.publish(');
    patch(prop, 'n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES})',
        'sdxECCAAutoClass.prepareAttributes(i,a)&&(n._onCompleteLoadModel(a,{initTable:!e,buildBehavior:t?h.FORCE_DEFAULT:h.NO_CHANGES}),sdxECCAAutoClass.notifyAttributesLoaded(i,a))');
    patch(caId, '(new e).CreateNew(d)', '(new e).CreateNew(sdxECCAAutoClass.configureCreateType(d))');
    patch(caId, 'u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u)',
        'sdxECCAAutoClass.isEnabled()||(u[n.keys.createKeys.CA_DEF_TYPE]=e.result[0].type,i.saveUserPreference(u))');
    // Private startup gets private app IDs even though the original JSON is shared.
    const init = modules.get('DS/ClassificationsFacet/InitClassificationCmpUI');
    const settings = JSON.parse(fs.readFileSync(path.join(sourceDir, 'classificationAppsRequire_setting.json'), 'utf8'));
    for (const name of ['library','bookmarks']) {
        const old = settings.facets[name].require;
        if (!mappings[old]) throw new Error('Missing app module: ' + old);
        settings.facets[name].require = mappings[old];
    }
    // This CA entry has never enabled export control. Prevent accidental use of an unisolated app.
    patch('DS/ClassificationsFacet/InitClassificationCmpUI', 'getUI:function(t){',
        'getUI:function(t){if(t.isExportControl)throw new Error("Export control is not enabled in this private CA build");');
    init.deps = init.deps.map(d => d === 'text!DS/ClassificationsFacet/assets/classificationAppsRequire_setting.json' ? ROOT + 'appSettings' : d);
    // No global aliases, RequireJS config, undef calls, or original prototype patches.
    const rewrite = source => source.replace(/(["'])(DS\/[^"']+)\1/g,
        (full, quote, id) => mappings[id] ? quote + mappings[id] + quote : full);
    const output = [];
    output.push('/* Generated from local 2025 sources. Do not deploy over OOTB files. */');
    for (const row of modules.values()) {
        const deps = row.deps.map(d => mappings[d] || d);
        for (const dep of deps) {
            if (/^DS\/(ENONewWidget|ClassificationsFacet|ClassificationProp|EditPropWidget|IPClassifyUtil|IPClassifyActive|PLMNewLibraryActive|PLMNewFolderActive)\//.test(dep))
                throw new Error('Unisolated dependency: ' + row.id + ' -> ' + dep);
        }
        const source = rewrite(row.source);
        output.push('define(' + JSON.stringify(mappings[row.id]) + ',' + JSON.stringify(deps) + ',(' + source + '));');
    }
    output.push('define(' + JSON.stringify(ROOT + 'appSettings') + ',[],function(){return ' + JSON.stringify(JSON.stringify(settings)) + ';});');
    output.push('define(' + JSON.stringify(ROOT + 'sdxECCA') + ',[' + JSON.stringify(mappings[caId]) + '],function(CreateCA){return {launch:function(command){if(typeof widget==="undefined"||![true,"true"].includes(widget.getValue("sdxECCAEnableAutoClassByOrganization")))throw new Error("Enable the private CA entry in the target widget only");return CreateCA.launchCreateChangeActionDialog(command);}};});');
    const code = output.join('\n');
    new vm.Script(code, {filename: 'sdxECCA.js'}); // validate syntax before creating output
    const outFile = path.join(outDir, 'webapps', 'sdxECCA', 'sdxECCA.js');
    const inputFiles = Object.keys(hashes).map(p => fs.realpathSync(p));
    if (inputFiles.includes(path.resolve(outFile))) throw new Error('Refusing to overwrite an input');
    fs.mkdirSync(path.dirname(outFile), {recursive: true});
    fs.writeFileSync(outFile, code + '\n');
    const manifest = {baseline: '2025', entry: ROOT + 'sdxECCA', inputHashes: hashes,
        modules: mappings, outputSha256: crypto.createHash('sha256').update(code + '\n').digest('hex')};
    fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    return {outFile, manifest, code};
}
module.exports = {build, collect, once};
if (require.main === module) {
    const [sourceDir, outDir] = process.argv.slice(2);
    if (!sourceDir || !outDir) {console.error('Usage: node build.cjs <2025-input-directory> <output-directory>'); process.exit(2);}
    try {const result=build({sourceDir, outDir, customDir:path.join(__dirname,'../webapps/sdxECCAAutoClass')});console.log(result.outFile);}
    catch (error) {console.error(error.message);process.exit(1);}
}
