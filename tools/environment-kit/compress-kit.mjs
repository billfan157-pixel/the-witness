import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression,KHRTextureBasisu} from '@gltf-transform/extensions';
import {meshopt} from '@gltf-transform/functions';import {MeshoptEncoder} from 'meshoptimizer';
const root=path.resolve(import.meta.dirname,'../..'),work=path.join(import.meta.dirname,'work');fs.mkdirSync(work,{recursive:true});
const out=path.join(root,'assets/environment-kit/cae'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const encoder=path.join(import.meta.dirname,'bin/basisu_st.wasm');
if(!fs.existsSync(encoder))throw Error('Missing pinned encoder. Run node tools/environment-kit/setup-encoder.mjs');
const encoderHash=sha(fs.readFileSync(encoder));
if(encoderHash!=='b42d951b1bf146133578e8c7927ad4a4a857552846a46a3ee33b541b2a06bc7d')throw Error('Unverified Basis encoder; rerun setup-encoder.mjs');
const maps=[['albedo','albedo',false],['normal','normal',true],['orm','orm-height',true]];
for(const [name,atlas,linear]of maps){
 let image=sharp(path.join(root,`assets/terrain/${atlas}.webp`)).extract({left:536,top:8,width:512,height:512}).removeAlpha();
 if(name==='orm')image=image.recomb([[1,0,0],[0,1,0],[0,0,0]]); // terrain B is height; glTF ORM B must be metalness.
 await image.png().toFile(path.join(work,name+'.png'));
 const args=['-file',`/work/tools/environment-kit/work/${name}.png`,'-output_file',`/work/tools/environment-kit/work/${name}.ktx2`,'-ktx2','-mipmap',
  ...(name==='normal'?['-uastc','-uastc_level','2','-normal_map']:['-q','255','-comp_level','2']),...(linear?['-linear']:['-srgb'])];
 const run=spawnSync(process.execPath,['--disable-warning=ExperimentalWarning',path.join(import.meta.dirname,'basisu-cli.cjs'),...args],{cwd:root,encoding:'utf8',maxBuffer:8e6});
 fs.writeFileSync(path.join(work,name+'-encode.log'),run.stdout+'\n'+run.stderr);
 if(run.status!==0)throw Error(`Basis encoding failed (${name}): ${run.stderr.slice(-500)}`);
 console.log('Encoded KTX2',name,fs.statSync(path.join(work,name+'.ktx2')).size);
}
await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
async function documentFor(kind){
 const doc=await io.read(path.join(out,'ENV_CAE_Wall_Ashlar_4m_A_LOD0.glb'));
 const primitive=doc.getRoot().listMeshes()[0].listPrimitives()[0];
 const authored=doc.getRoot().listNodes().find(n=>n.getExtras().footprint)?.getExtras();
 doc.getRoot().listScenes()[0].setExtras({...authored,assetId:'CAE-WALL-PBR-02',footprintSpace:'asset'});
 for(const node of doc.getRoot().listNodes())if(node.getExtras().assetId)node.setExtras({...node.getExtras(),assetId:'CAE-WALL-PBR-02'});
 const positions=primitive.getAttribute('POSITION').getArray(),normals=primitive.getAttribute('NORMAL').getArray();
 const uv=new Float32Array(positions.length/3*2);
 for(let i=0;i<positions.length/3;i++){const p=positions.subarray(i*3,i*3+3),n=normals.subarray(i*3,i*3+3);uv[i*2]=(Math.abs(n[0])>.5?p[2]:p[0])/2;uv[i*2+1]=(Math.abs(n[1])>.5?p[2]:p[1])/2;}
 primitive.setAttribute('TEXCOORD_0',doc.createAccessor('World scale UV',primitive.getAttribute('POSITION').getBuffer()).setType('VEC2').setArray(uv));
 const textures={};
 for(const [name]of maps){
  let data,mime;
  if(kind==='full'){data=fs.readFileSync(path.join(work,name+'.ktx2'));mime='image/ktx2';}
  else if(kind==='lite'){data=await sharp(path.join(work,name+'.png')).resize(256,256).png().toBuffer();mime='image/png';}
  else {data=fs.readFileSync(path.join(work,name+'.png'));mime='image/png';}
  textures[name]=doc.createTexture(name).setImage(data).setMimeType(mime);
 }
 const material=primitive.getMaterial();material.setName('Limestone PBR surface study').setBaseColorFactor([1,1,1,1]).setBaseColorTexture(textures.albedo)
  .setNormalTexture(textures.normal).setNormalScale(.6).setMetallicRoughnessTexture(textures.orm).setOcclusionTexture(textures.orm).setMetallicFactor(0).setRoughnessFactor(1);
 for(const info of [material.getBaseColorTextureInfo(),material.getNormalTextureInfo(),material.getMetallicRoughnessTextureInfo(),material.getOcclusionTextureInfo()])info.setWrapS(10497).setWrapT(10497);
 if(kind==='full'){doc.createExtension(KHRTextureBasisu).setRequired(true);doc.createExtension(EXTMeshoptCompression).setRequired(true);await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium'}));}
 return doc;
}
const variants={};
for(const kind of ['raw','full','lite']){
 const data=await io.writeBinary(await documentFor(kind));const hash=sha(data),file=`wall-pbr-${kind}-${hash.slice(0,12)}.glb`;
 // Old immutable versions may still be used by a live scene; keep them until an explicit release cleanup.
 fs.writeFileSync(path.join(out,file),data);variants[kind]={url:`./assets/environment-kit/cae/${file}`,sha256:hash,bytes:data.length};
}
const manifest={schemaVersion:2,id:'cae-pbr-pipeline-v2',region:'caesarea',status:'pipeline-surface-study',artAccepted:false,
 variants,pieces:[{id:'CAE-WALL-PBR-02',variants,position:[0,0,0],yaw:0,source:'tools/environment-kit/compress-kit.mjs',license:'CC0-1.0 + project-authored geometry',artAccepted:false}],
 material:{source:'https://polyhaven.com/a/coral_ground_02',license:'CC0-1.0',evidence:'H',interpretation:'Porous limestone surface study, not a claim of exact Caesarea kurkar.',atlasTile:[536,8,512,512],ormMetallicChannel:0,normal:'OpenGL',colorSpaces:{albedo:'srgb',normal:'linear',orm:'linear'}},
 build:{three:'0.187.0',encoder:'Basis Universal v2.50 WASI',encoderSha256:encoderHash,meshoptimizer:'1.3.0',source:'tools/environment-kit/compress-kit.mjs'}};
fs.writeFileSync(path.join(out,'manifest-v2.json'),JSON.stringify(manifest,null,2)+'\n');
const vendor=path.join(root,'vendor/basis');fs.mkdirSync(vendor,{recursive:true});
for(const name of ['basis_transcoder.js','basis_transcoder.wasm'])fs.copyFileSync(path.join(import.meta.dirname,'node_modules/three/examples/jsm/libs/basis',name),path.join(vendor,name));
fs.writeFileSync(path.join(out,'build-report.json'),JSON.stringify({variants,encoderSha256:encoderHash,fullComparedToRaw:variants.full.bytes/variants.raw.bytes,liteComparedToRaw:variants.lite.bytes/variants.raw.bytes},null,2)+'\n');
console.log(JSON.stringify({status:'built',variants}));
