// Reproducible AI-authored source for the first pipeline asset and loader.
const fs=require('node:fs'),path=require('node:path');
async function main(){
const T=await import('three');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'assets/environment-kit/cae');
fs.mkdirSync(out,{recursive:true});
// Separate ashlar blocks give real mortar recesses; this is a pipeline sample.
const positions=[],normals=[],indices=[];
function block(x,y,z,w,h,d){
 const g=new T.BoxGeometry(w,h,d);g.translate(x,y,z);
 const base=positions.length/3;positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);
 indices.push(...Array.from(g.index.array,n=>n+base));g.dispose();
}
for(let row=0;row<6;row++)for(let col=0;col<4;col++)block(-1.5+col,row*.5+.25,0,.98,.48,.38);
const buffers=[Buffer.from(new Float32Array(positions).buffer),Buffer.from(new Float32Array(normals).buffer),Buffer.from(new Uint16Array(indices).buffer)];
const binary=Buffer.concat(buffers),verts=positions.length/3;
const gltf={asset:{version:'2.0',generator:'THE WITNESS reproducible AI kit source'},scene:0,scenes:[{nodes:[0]}],
 nodes:[{name:'ENV_CAE_Wall_Ashlar_4m_A_LOD0',mesh:0,extras:{assetId:'CAE-WALL-PIPELINE-01',evidence:'H',access:'closed',footprint:[[-1.5,0,.55],[-.5,0,.55],[.5,0,.55],[1.5,0,.55]]}}],
 meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0}]}],
 materials:[{name:'Limestone pipeline placeholder',pbrMetallicRoughness:{baseColorFactor:[.63,.55,.43,1],metallicFactor:0,roughnessFactor:.9}}],
 buffers:[{byteLength:binary.length}],bufferViews:buffers.map((b,i)=>({buffer:0,byteOffset:buffers.slice(0,i).reduce((n,x)=>n+x.length,0),byteLength:b.length,target:i===2?34963:34962})),
 accessors:[{bufferView:0,componentType:5126,count:verts,type:'VEC3',min:[-1.99,.01,-.19],max:[1.99,2.99,.19]},
 {bufferView:1,componentType:5126,count:verts,type:'VEC3'},{bufferView:2,componentType:5123,count:indices.length,type:'SCALAR'}]};
let json=Buffer.from(JSON.stringify(gltf));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);
const bin=Buffer.concat([binary,Buffer.alloc((4-binary.length%4)%4)]),header=Buffer.alloc(12),jh=Buffer.alloc(8),bh=Buffer.alloc(8);
header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);
jh.writeUInt32LE(json.length);jh.writeUInt32LE(0x4e4f534a,4);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);
const file=path.join(out,'ENV_CAE_Wall_Ashlar_4m_A_LOD0.glb');fs.writeFileSync(file,Buffer.concat([header,jh,json,bh,bin]));
await import('./bundle-loader.mjs');
await import('./compress-kit.mjs');
console.log(JSON.stringify({asset:file,triangles:indices.length/3,bytes:fs.statSync(file).size}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
