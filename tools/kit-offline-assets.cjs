const fs=require('node:fs'),path=require('node:path');
module.exports=function kitOfflineAssets(root,uri,{full=false}={}){
 const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/environment-kit/cae/manifest-v2.json'),'utf8'));
 const names=new Set(['assets/environment-kit/cae/manifest.json','assets/environment-kit/cae/manifest-v2.json','assets/environment-kit/cae/ENV_CAE_Wall_Ashlar_4m_A_LOD0.glb']);
 for(const piece of manifest.pieces)for(const quality of full?['raw','full','lite']:['lite'])names.add(piece.variants[quality].url.replace(/^\.\//,''));
 if(full)for(const name of ['basis_transcoder.js','basis_transcoder.wasm'])names.add('vendor/basis/'+name);
 return Object.fromEntries([...names].map(name=>[name,uri(name)]));
};
