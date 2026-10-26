'use strict';
// Maintainer-only verification of the documented copy/paste edits. Not required to deploy.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const {build,collect,once}=require('../build.cjs');
const sourceDir=process.argv[2];if(!sourceDir)throw Error('2025 source directory required');
const customDir=path.join(__dirname,'../../webapps/sdxECCAAutoClass');
const spec=JSON.parse(fs.readFileSync(path.join(__dirname,'source-patches/patches.json')));
const bundles=['ENONewWidget','ClassificationsFacet','ClassificationProp','EditPropWidget','IPClassifyUtil','IPClassifyActive','PLMNewLibraryActive','PLMNewFolderActive'];
const ca='DS/ENOChgGovernanceUX/scripts/view/changeAction/ChgCreateChangeAction';
const custom=['sdxECCAAutoClass','sdxECCAClassRuleService','sdxECCAOrganizationProvider','sdxECCAClassAttributeService','sdxECCAObjectSearch'];
const rows=[];for(const bundle of bundles)rows.push(...collect(path.join(sourceDir,bundle+'.js')));
rows.push(collect(path.join(sourceDir,'ENOChgGovernanceUX.js')).find(r=>r.id===ca));
for(const name of custom)rows.push(...collect(path.join(customDir,name+'.js')));
for(const row of rows){const edits=spec[row.id];if(!edits)continue;
 if(edits.dependencies){assert.deepEqual(row.deps,edits.dependencies.before);row.deps=edits.dependencies.after;assert(row.source.startsWith(edits.arguments.before));row.source=edits.arguments.after+row.source.slice(edits.arguments.before.length);}
 if(edits.dependencyChange){const item=edits.dependencyChange;assert(row.deps.includes(item.from));row.deps=row.deps.map(d=>d===item.from?item.to:d);}
 for(const change of edits.changes)row.source=once(row.source,change.from,change.to,row.id);
}
const rename=source=>source.replace(/(["'])DS\/(ENONewWidget|ClassificationsFacet|ClassificationProp|EditPropWidget|IPClassifyUtil|IPClassifyActive|PLMNewLibraryActive|PLMNewFolderActive|sdxECCAAutoClass)\/(?!assets\/|ENONew\/View\/facet\/wizardView["'])/g,'$1DS/sdxECCA2025/private/$2/')
 .replaceAll('"'+ca+'"','"DS/sdxECCA2025/private/'+ca.slice(3)+'"');
const text=rows.map(r=>'define('+JSON.stringify(r.id)+','+JSON.stringify(r.deps)+',('+r.source+'));').join('\n;\n');
const final=rename(text)+'\n;\n'+fs.readFileSync(path.join(__dirname,'tail-modules.js'),'utf8');
const captured=new Map();new vm.Script(final).runInNewContext({define:(id,deps,factory)=>{assert(!captured.has(id));captured.set(id,{deps:Array.from(deps),source:factory.toString()});}});
const outDir=fs.mkdtempSync(require('os').tmpdir()+'/sdx-manual-');
try{
 const generated=build({sourceDir,customDir,outDir});const baseline=new Map(collect(generated.outFile).map(r=>[r.id,r]));
 assert.equal(captured.size,187);
 for(const [oldId,newId] of Object.entries(generated.manifest.modules)){
  const actual=captured.get(newId),expected=baseline.get(newId);assert(actual,'missing '+newId);
  assert.deepEqual(actual.deps,expected.deps,newId+' dependency mismatch');
  assert.equal(actual.source,expected.source,newId+' factory mismatch');
 }
 const entry=captured.get('DS/sdxECCA2025/sdxECCA2025');assert.equal(entry.deps[0],generated.manifest.modules[ca]);
 const settings=vm.runInNewContext('('+captured.get('DS/sdxECCA2025/appSettings').source+')')();
 const apps=JSON.parse(settings);assert(captured.has(apps.facets.library.require));assert(captured.has(apps.facets.bookmarks.require));
 // Apply the replacements to the actual bundle text, preserving all original separators.
 const rawRows=new Map();for(const bundle of bundles)for(const r of collect(path.join(sourceDir,bundle+'.js')))rawRows.set(r.id,r);
 const bundleText=fs.readFileSync(path.join(sourceDir,'ENOChgGovernanceUX.js'),'utf8');const start=bundleText.indexOf('define('+JSON.stringify(ca)+',');const end=bundleText.indexOf(',define(',start+1);
 const originalRows=collect(path.join(sourceDir,'ENOChgGovernanceUX.js'));assert(start>=0&&end>start);
 const pasted=[];for(const bundle of bundles){let code=fs.readFileSync(path.join(sourceDir,bundle+'.js'),'utf8');for(const row of collect(path.join(sourceDir,bundle+'.js'))){const changed=rows.find(r=>r.id===row.id);if(!spec[row.id])continue;
  const header=JSON.stringify(row.deps);const target='define('+JSON.stringify(row.id)+','+header+',(';
  assert(code.includes(target),'unexpected actual header '+row.id);
  code=code.replace(target,'define('+JSON.stringify(row.id)+','+JSON.stringify(changed.deps)+',(');
  code=once(code,row.source,changed.source,row.id+' source');
 }pasted.push(code);}
 const caRow=rows.find(r=>r.id===ca);pasted.push('define('+JSON.stringify(caRow.id)+','+JSON.stringify(caRow.deps)+',('+caRow.source+'))');
 for(const name of custom)pasted.push(fs.readFileSync(path.join(customDir,name+'.js'),'utf8'));
 const rawPasted=rename(pasted.join('\n;\n'))+'\n;\n'+fs.readFileSync(path.join(__dirname,'tail-modules.js'),'utf8');
 const actualIds=[];new vm.Script(rawPasted).runInNewContext({define:(id)=>actualIds.push(id)});assert.equal(actualIds.length,187);assert.equal(new Set(actualIds).size,187);assert(actualIds.every(id=>id.startsWith('DS/sdxECCA2025/')));
 console.log('PASS: all documented fragments reconstruct 185 factories/dependencies identically; 187 private modules register from the actual copied bundle text.');
}finally{fs.rmSync(outDir,{recursive:true,force:true});}
