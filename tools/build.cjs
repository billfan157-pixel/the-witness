const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
// A checkout policy must not change what the build produces: text is copied and inlined
// with LF endings, and the revision hash covers the normalised content.
const TEXT_FILE=/\.(js|mjs|cjs|html|css|json|md|txt|csv|svg)$/i;
const textBytes=file=>Buffer.from(fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),'utf8');
const readText=file=>textBytes(file).toString('utf8');
const root=path.resolve(__dirname,'..');
const {prepareOutput,verifiedDossier}=require('./build-output.cjs');
const dossier=verifiedDossier(root),out=prepareOutput(root,'dist');
const files=['environment-references.html','index.html','kit-lab.html','kit-lab.js','witness.css','witness-content.js','witness-spine.js','witness-depth.js','witness-relationships.js','witness-craft.js','witness-workshop-ui.js','witness-q01-state.js','witness-model.js','witness-craft-renderer.js','witness-field-ui.js','witness-architecture.js','witness-q01.js','witness-modular-kit.js','witness-world.js','witness-ambience.js','witness-compass.js','witness-audio-library.js','witness-audio.js','witness-cloud.js','witness-app.js'];
files.push('witness-q01-environment.js','witness-q01-greybox.js','q01-greybox.html','q01-greybox-lab.js');
for(const f of files){const target=path.join(out,f);if(TEXT_FILE.test(f))fs.writeFileSync(target,textBytes(f));else fs.copyFileSync(path.join(root,f),target);}
for(const dir of ['assets','vendor']){
 fs.cpSync(path.join(root,dir),path.join(out,dir),{recursive:true});
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)]);
 for(const p of walk(path.join(out,dir)))if(TEXT_FILE.test(p))fs.writeFileSync(p,textBytes(path.relative(root,p)));
}
if(dossier){
  const docsOut=path.join(out,'tai-lieu');fs.mkdirSync(docsOut,{recursive:true});
  for(const f of ['THE-WITNESS-Design-Compendium.html','THE-WITNESS-v3-Pitch.html'])fs.copyFileSync(path.join(dossier,f),path.join(docsOut,f));
  fs.copyFileSync(path.join(dossier,'THE-WITNESS-Design-Compendium.html'),path.join(docsOut,'index.html'));
  fs.cpSync(path.join(dossier,'sources'),path.join(docsOut,'sources'),{recursive:true});
}
const walk=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(dir+'/'+e.name):[dir+'/'+e.name]);
const all=[...files,...['assets','vendor'].flatMap(walk)];
const fileHash=f=>crypto.createHash('sha256').update(TEXT_FILE.test(f)?textBytes(f):fs.readFileSync(path.join(root,f))).digest('hex');
const revision=crypto.createHash('sha256').update([...all,'tools/build.cjs','tools/service-worker-template.cjs','tools/kit-offline-assets.cjs'].map(f=>f+':'+fileHash(f)).join('|')).digest('hex').slice(0,12);
// Avoid mixing a fresh HTML shell with scripts retained by an older Service Worker.
const webHtml=readText('index.html').replace(/((?:src|href)="\.\/[^"?]+\.(?:js|css))"/g,(_,link)=>link+'?v='+revision+'"');
fs.writeFileSync(path.join(out,'index.html'),webHtml);
const shellFiles=all.filter(f=>!f.startsWith('assets/environment-kit/')&&!f.startsWith('vendor/basis/'));
const sw=require('./service-worker-template.cjs')({revision,files:shellFiles.map(f=>'./'+f)});
fs.writeFileSync(path.join(root,'witness-sw.js'),sw);fs.writeFileSync(path.join(out,'witness-sw.js'),sw);
const mime={'.ttf':'font/ttf','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.ogg':'audio/ogg','.glb':'model/gltf-binary','.ktx2':'image/ktx2','.json':'application/json','.wasm':'application/wasm','.js':'application/javascript'};
const uri=f=>'data:'+(mime[path.extname(f)]||'application/octet-stream')+';base64,'+(TEXT_FILE.test(f)?textBytes(f):fs.readFileSync(path.join(root,f))).toString('base64');
let html=readText('index.html');let css=readText('witness.css').replace(/url\(['"]?\.\/([^'")]+)['"]?\)/g,(_,f)=>'url("'+uri(f)+'")');
html=html.replace(/<link rel="stylesheet"[^>]+>/,()=>'<style>'+css+'</style>');
html=html.replace(/<link rel="icon" href="\.\/([^\"]+)"[^>]+>/,(_,f)=>'<link rel="icon" href="'+uri(f)+'">');
// Embed only player-resolved images; nested architecture material candidates are web/precache-only.
const assets=Object.fromEntries(walk('assets').filter(f=>/\.(jpg|webp)$/.test(f)&&(f.split('/').length===2||f.startsWith('assets/terrain/')||f.startsWith('assets/architecture/lite/')||f.startsWith('assets/architecture/phase-b/lite/'))).flatMap(f=>{const key=f.slice(7);return [[key,uri(f)],...(key.startsWith('land-')?[[key.slice(5,-4),uri(f)]]:[])];}));
const scripts=[...html.matchAll(/<script src="\.\/([^\"]+)"[^>]*><\/script>/g)].map(m=>m[1]);
const audioAssets=Object.fromEntries(all.filter(f=>/\.(mp3|wav|ogg)$/.test(f)).map(f=>[f,uri(f)]));
let js='globalThis.WitnessAudioAssets='+JSON.stringify(audioAssets)+';\n'+'globalThis.AdventureAssets='+JSON.stringify(assets)+';\n'+scripts.map(f=>readText(f)).join('\n');
const kitAssets=require('./kit-offline-assets.cjs')(root,uri);
const labAssets=require('./kit-offline-assets.cjs')(root,uri,{full:true});
js='globalThis.WitnessKitOfflineQuality="lite";globalThis.WitnessKitAssets='+JSON.stringify(kitAssets)+';\n'+js;
html=html.replace(/<script src="[^\"]+"[^>]*><\/script>/g,'').replace(/^[\t ]+$/gm,'').replace('</body>',()=>'<script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></body>');
fs.writeFileSync(path.join(out,'ban-choi-ngoai-tuyen.html'),html);
let lab=readText('kit-lab.html');
const labScripts=[];lab=lab.replace(/<script src="\.\/([^\"]+)"[^>]*><\/script>/g,(_,f)=>{labScripts.push(readText(f));return '';});
lab=lab.replace('</body>',()=>'<script>'+labScripts.join('\n').replace(/<\/script/gi,'<\\/script')+'</script></body>');
lab=lab.replace('<head>','<head><script>globalThis.WitnessKitAssets='+JSON.stringify(labAssets)+'</script>');
fs.writeFileSync(path.join(out,'kit-lab-offline.html'),lab);
// The playable PR-04 level is also a cold-open, self-contained candidate.
// Reuse the same pinned engine/character sources; never substitute a viewer.
let greybox=readText('q01-greybox.html');
const greyboxScripts=[];
greybox=greybox.replace(/<script src="\.\/([^\"]+)"[^>]*><\/script>/g,(_,f)=>{greyboxScripts.push(readText(f));return '';});
greybox=greybox.replace(/<link rel="icon" href="\.\/([^\"]+)"[^>]*>/,(_,f)=>'<link rel="icon" href="'+uri(f)+'">');
greybox=greybox.replace('</body>',()=>'<script>globalThis.AdventureAssets='+JSON.stringify(assets)+';\n'+greyboxScripts.join('\n').replace(/<\/script/gi,'<\\/script')+'</script></body>');
fs.writeFileSync(path.join(out,'q01-greybox-offline.html'),greybox);
fs.writeFileSync(path.join(out,'build-info.json'),JSON.stringify({release:'0.7.0',cloudSaves:true,cloudSlots:3,cloudHistory:10,spatialAudio:true,offlineVoice:true,design:'3.2',contractVersion:'3.0',revision,bridgeQuests:12,requiredLegends:['L01','L02','L04'],legends:5,coreBeats:16,veils:4,relationshipQuests:6,rpgSkills:4,witnessTenets:3,dualTierPersona:true,depthEncounters:31,chapterEncounters:25,relationshipEncounters:6,depthOwners:27,depthMechanicFamilies:7,physicalDetails:44,fieldPlay:true,productionDurationTargetMet:false,expertReview:'unassigned'},null,2));
console.log(JSON.stringify({output:out,revision,standaloneBytes:Buffer.byteLength(html),scripts:scripts.length}));
