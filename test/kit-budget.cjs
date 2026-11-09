const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const progress=require('../docs/environment-kit/progress.json');
assert(progress.documentRevision>=2);
for(const file of [progress.roadmap,progress.standards,progress.catalog])assert(fs.existsSync(path.join(root,file)),'Missing governing development document: '+file);
for(const gate of progress.gates)if(gate.status==='passed')assert.equal(gate.remaining.length,0,'Gate marked passed with unfinished requirements: '+gate.id);
const manifest=require('../assets/environment-kit/cae/manifest.json');
assert.equal(manifest.schemaVersion,1);
const rows=fs.readFileSync(path.join(root,'docs/environment-kit/catalog.csv'),'utf8').trim().split(/\r?\n/).slice(1).map(row=>row.split(','));
const results=[];
for(const p of manifest.pieces){
 const row=rows.find(r=>r[0]===p.id);assert(row,'Missing catalog record: '+p.id);
 assert(fs.existsSync(path.join(root,p.source)),'Missing reproducible asset source');
 const b=fs.readFileSync(path.resolve(root,p.url));assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
 const len=b.readUInt32LE(12);assert.equal(b.readUInt32LE(16),0x4e4f534a);
 const g=JSON.parse(b.subarray(20,20+len).toString());
 const triangles=g.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+g.accessors[p.indices].count/3,0);
 assert(triangles<=Number(row[5]),'Triangle budget exceeded for '+p.id);
 for(const view of g.bufferViews)assert(view.byteOffset+view.byteLength<=g.buffers[view.buffer].byteLength,'Invalid buffer bounds');
 assert(g.nodes.some(n=>n.extras?.assetId===p.id&&n.extras.footprint.length>0),'Missing collision metadata');
 assert.equal(row[11],String(p.artAccepted));
 results.push({id:p.id,triangles,budget:Number(row[5]),bytes:b.length,artAccepted:p.artAccepted});
}
const pbr=require('../assets/environment-kit/cae/manifest-v2.json');
assert.equal(pbr.schemaVersion,2);assert.equal(pbr.artAccepted,false);
for(const piece of pbr.pieces){
 const row=rows.find(r=>r[0]===piece.id);assert(row,'Missing PBR catalog row');
 assert(fs.existsSync(path.join(root,piece.source)));assert.equal(String(piece.artAccepted),row[11]);
 for(const [quality,variant]of Object.entries(piece.variants)){
  const b=fs.readFileSync(path.resolve(root,variant.url));
  assert.equal(b.length,variant.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),variant.sha256);
  assert(variant.url.includes(variant.sha256.slice(0,12)),'Mutable asset filename');
  assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
  const jsonLength=b.readUInt32LE(12),g=JSON.parse(b.subarray(20,20+jsonLength)),bin=b.subarray(28+jsonLength);
  const triangles=g.meshes.flatMap(m=>m.primitives).reduce((n,p)=>n+g.accessors[p.indices].count/3,0);
  assert(triangles<=Number(row[5]));assert.equal(g.scenes[0].extras.assetId,piece.id);assert.equal(g.scenes[0].extras.footprintSpace,'asset');assert(g.scenes[0].extras.footprint.length);
  const material=g.materials[0];assert.equal(material.pbrMetallicRoughness.metallicFactor,0);assert(material.normalTexture&&material.occlusionTexture);
  const images=g.images.map(img=>{const v=g.bufferViews[img.bufferView];assert((v.byteOffset??0)+v.byteLength<=bin.length);return bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength);});
  let mips=1;
  if(quality==='full'){
   for(const ext of ['EXT_meshopt_compression','KHR_texture_basisu'])assert(g.extensionsRequired.includes(ext));
   for(const [i,image]of images.entries()){
    assert.equal(image.subarray(0,12).toString('hex'),'ab4b5458203230bb0d0a1a0a');assert.equal(image.readUInt32LE(20),512);assert.equal(image.readUInt32LE(24),512);
    mips=image.readUInt32LE(40);assert.equal(mips,10);
    const dfd=image.readUInt32LE(48);assert.equal(image[dfd+14],i===0?2:1,'Incorrect KTX2 transfer function');
    for(let level=0;level<mips;level++){const pos=80+24*level;assert(Number(image.readBigUInt64LE(pos)+image.readBigUInt64LE(pos+8))<=image.length,'Truncated mip payload');}
   }
   for(const view of g.bufferViews){const ext=view.extensions?.EXT_meshopt_compression;if(ext)assert((ext.byteOffset??0)+ext.byteLength<=g.buffers[ext.buffer].byteLength);}
  }else for(const image of images){assert.equal(image.subarray(1,4).toString(),'PNG');assert.equal(image.readUInt32BE(16),quality==='lite'?256:512);}
  results.push({id:piece.id,quality,triangles,budget:Number(row[5]),bytes:b.length,mips,artAccepted:false});
 }
}
assert.equal(pbr.material.ormMetallicChannel,0);assert.equal(pbr.material.license,'CC0-1.0');
const dependencies=require('../tools/environment-kit/package.json').dependencies;assert.equal(dependencies.three,'0.187.0');assert.equal(dependencies.meshoptimizer,'1.3.0');
for(const name of ['basis_transcoder.js','basis_transcoder.wasm','LICENSE','NOTICE','MESHOPT-LICENSE'])assert(fs.statSync(path.join(root,'vendor/basis',name)).size>100);
const refs=require('../docs/environment-kit/research/references.json');assert.equal(new Set(refs.cards.map(c=>c.id)).size,16);
for(const scene of ['Q01','L04'])assert.equal(refs.cards.filter(c=>c.scene===scene).length,8);
for(const c of refs.cards){assert(refs.sources[c.source]?.url.startsWith('https://'));for(const key of ['locator','period','confidence','claim','assetDecision','limitation','visualFocus'])assert(c[key]?.trim().length>0,'Empty reference contract '+c.id+':'+key);}
console.log(JSON.stringify({status:'passed',scope:'static hashes, geometry budgets, texture mip/transfer metadata, codec files, catalog and reference contracts; no FPS certification',assets:results,regionalReferences:refs.cards.length}));
