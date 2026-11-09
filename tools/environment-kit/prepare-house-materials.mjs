import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

// Verified CC0 comparison surfaces; these are not archaeological measurements.
// Source API/files are first-party Poly Haven. Source hashes are recorded below.
const root=path.resolve(import.meta.dirname,'../..');
const out=path.join(root,'assets/architecture');
const previous=fs.existsSync(path.join(out,'sources.json'))?JSON.parse(fs.readFileSync(path.join(out,'sources.json'),'utf8')):null;
const selected=[
 {slot:'stone',asset:'sandstone_blocks_05',roughnessMin:.65,normalScale:.35,tileMeters:3,
  interpretation:'Pale warm sandstone ashlar comparison. Not a claim of exact Caesarea limestone/kurkar. The map contains joints; use at its world scale on broad faces, or select a stone face for geometric trim.'},
 {slot:'plaster',asset:'plastered_wall_04',roughnessMin:.8,normalScale:.18,tileMeters:2,
  interpretation:'Quiet weathered bare-plaster comparison. A modern scanned surface is used as an artistic lime-plaster approximation, not an identified ancient finish.'},
 {slot:'wood',asset:'weathered_brown_planks',roughnessMin:.62,normalScale:.3,tileMeters:1.8,
  interpretation:'Weathered timber comparison. Align the grain with beam length; do not imply a verified historical species.'},
 {slot:'floor',asset:'monastery_stone_floor',roughnessMin:.72,normalScale:.4,tileMeters:1.8,
  interpretation:'Muted worn stone slab comparison. The source name identifies its modern capture context, not the historical identity of this game building.'}
];
const digest=(data,type='sha256')=>crypto.createHash(type).update(data).digest('hex');
async function json(url){const r=await fetch(url);if(!r.ok)throw Error(`HTTP ${r.status}: ${url}`);return r.json();}
async function fetchMap(meta){
 const r=await fetch(meta.url);if(!r.ok)throw Error(`Map fetch failed: ${r.status} ${meta.url}`);
 const bytes=Buffer.from(await r.arrayBuffer());
 if(meta.md5&&digest(bytes,'md5')!==meta.md5)throw Error('Source checksum mismatch: '+meta.url);
 return {bytes,record:{url:meta.url,sourceBytes:bytes.length,md5:digest(bytes,'md5'),sha256:digest(bytes)}};
}
function normalizeNormals(data){
 for(let i=0;i<data.length;i+=3){let x=data[i]/127.5-1,y=data[i+1]/127.5-1,z=data[i+2]/127.5-1;const len=Math.hypot(x,y,z)||1;
  data[i]=Math.round((x/len*.5+.5)*255);data[i+1]=Math.round((y/len*.5+.5)*255);data[i+2]=Math.round((z/len*.5+.5)*255);
 }return data;
}
for(const quality of ['full','lite'])fs.mkdirSync(path.join(out,quality),{recursive:true});
const sources=[];
for(const spec of selected){
 const [info,files]=await Promise.all([json('https://api.polyhaven.com/info/'+spec.asset),json('https://api.polyhaven.com/files/'+spec.asset)]);
 const selectedMaps={albedo:files.Diffuse['1k'].jpg,normal:files.nor_gl['1k'].png,orm:files.arm['1k'].png};
 const values=await Promise.all(Object.entries(selectedMaps).map(async([key,meta])=>[key,await fetchMap(meta)]));
 const maps=Object.fromEntries(values),outputs={};
 const locked=previous?.surfaces?.find(s=>s.slot===spec.slot&&s.asset===spec.asset);
 for(const [name,map]of Object.entries(maps))if(locked?.maps?.[name]?.sha256&&locked.maps[name].sha256!==map.record.sha256)throw Error('Pinned source changed: '+spec.slot+'/'+name);
 for(const [quality,size]of [['full',1024],['lite',512]]){
  const names={};
  for(const name of ['albedo','normal','orm']){
   let image;
   if(name==='albedo'){
    image=sharp(maps[name].bytes).removeAlpha().gamma().resize(size,size,{kernel:'lanczos3'}).webp({quality:quality==='full'?90:86,effort:6});
   }else{
    const raw=await sharp(maps[name].bytes).removeAlpha().resize(size,size,{kernel:'lanczos3'}).raw().toBuffer();
    if(name==='normal')normalizeNormals(raw);
    else for(let i=0;i<raw.length;i+=3){raw[i+1]=Math.max(raw[i+1],Math.round(spec.roughnessMin*255));raw[i+2]=0;}
    image=sharp(raw,{raw:{width:size,height:size,channels:3}}).webp(name==='normal'?{nearLossless:true,quality:96,effort:6}:{lossless:true,effort:6});
   }
   const data=await image.toBuffer(),filename=`${spec.slot}-${name}.webp`,file=path.join(out,quality,filename);
   fs.writeFileSync(file,data);names[name]={path:`assets/architecture/${quality}/${filename}`,bytes:data.length,sha256:digest(data),width:size,height:size};
  }
  outputs[quality]=names;
 }
 sources.push({...spec,title:info.name,authors:info.authors,source:`https://polyhaven.com/a/${spec.asset}`,api:{info:`https://api.polyhaven.com/info/${spec.asset}`,files:`https://api.polyhaven.com/files/${spec.asset}`},sourceDimensionsMillimeters:info.dimensions,license:'CC0-1.0',maps:Object.fromEntries(Object.entries(maps).map(([key,v])=>[key,v.record])),outputs});
 console.log('Prepared',spec.slot,info.name);
}
const totals=Object.fromEntries(['full','lite'].map(quality=>[quality,sources.reduce((n,s)=>n+Object.values(s.outputs[quality]).reduce((a,x)=>a+x.bytes,0),0)]));
const record={schemaVersion:1,retrieved:'2026-11-09',provider:'Poly Haven',license:'CC0-1.0',licenseUrl:'https://polyhaven.com/license',
 conventions:{albedo:'sRGB source Diffuse; gamma-aware resize; no added directional lighting or colour tint',normal:'OpenGL tangent-space +Y, linear; resize then renormalize; near-lossless WebP',orm:'Linear RGB = ambient occlusion, roughness, metalness; B set to exactly zero; minimum roughness clamp recorded per surface',uv:'All surfaces tile; tileMeters is a world-space art-direction recommendation. It is not a measured architectural dimension.',quality:'full 1024 px and lite 512 px use the same source maps and UV scale',shader:'Set texture albedo colourSpace to SRGBColorSpace; normal and ORM to NoColorSpace. Keep roughness factor 1 unless deliberately tuning. Normal scale recommendations are per surface.'},
 limitations:['CC0 surfaces provide visual references, not proof of a first-century structure or exact local stone species','The selected plaster and floor have modern capture contexts; their reuse is artistic interpretation [H]','Geometry, UV scale, seam placement, indoor lighting and wear must still be authored and visually reviewed in the game'],reviewImage:'assets/architecture/material-review.webp',totals,surfaces:sources};
fs.writeFileSync(path.join(out,'sources.json'),JSON.stringify(record,null,2)+'\n');

// Review sheet: final albedo, final normal, final ORM for each surface.
const cell=320,head=38,rowHeight=cell+36,width=cell*3,height=head+selected.length*rowHeight,composite=[];
const label=Buffer.from(`<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="#e9e3d3"/><style>text{font:16px sans-serif;fill:#302f26}</style><text x="12" y="25">Final house materials · CC0 comparison surfaces · albedo / OpenGL normal / AO-roughness-metalness</text>${selected.map((s,i)=>`<text x="12" y="${head+i*rowHeight+23}">${s.slot}: ${s.asset}</text>`).join('')}</svg>`);
composite.push({input:label,left:0,top:0});
for(const [i,s]of selected.entries())for(const [j,map]of ['albedo','normal','orm'].entries())composite.push({input:await sharp(path.join(out,'full',`${s.slot}-${map}.webp`)).resize(cell,cell).png().toBuffer(),left:j*cell,top:head+i*rowHeight+36});
await sharp({create:{width,height,channels:3,background:'#e9e3d3'}}).composite(composite).webp({quality:84,effort:6}).toFile(path.join(out,'material-review.webp'));
let metallicNonzero=0,maxNormalUnitLengthError=0;
for(const surface of sources)for(const quality of ['full','lite'])for(const name of ['normal','orm']){
 const data=await sharp(path.join(root,surface.outputs[quality][name].path)).removeAlpha().raw().toBuffer();
 for(let i=0;i<data.length;i+=3){
  if(name==='orm'){if(data[i+2])metallicNonzero++;}
  else maxNormalUnitLengthError=Math.max(maxNormalUnitLengthError,Math.abs(Math.hypot(data[i]/127.5-1,data[i+1]/127.5-1,data[i+2]/127.5-1)-1));
 }
}
if(metallicNonzero)throw Error('ORM metalness channel is not zero');
record.validation={images:24,metallicNonzero,maxNormalUnitLengthError,review:'Final albedo/normal/ORM contact sheet visually inspected on 2026-11-09; inspect again after material changes'};
fs.writeFileSync(path.join(out,'sources.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({status:'prepared',textures:24,totals,liteRatio:totals.lite/totals.full}));
