import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {createRequire} from 'node:module';
import {browserDriver,delay} from './browser-driver.mjs';
const require=createRequire(import.meta.url),M=require('../witness-model.js');
const out=path.resolve('test/artifacts/flora');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out,19733);
const report={checks:[]};
try{
 const hook=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem(${JSON.stringify(M.STORE)},${JSON.stringify(JSON.stringify(M.fresh()))})`});
 await b.send('Page.reload',{ignoreCache:true});
 await b.wait('!!document.querySelector("#title-actions [data-act=continue]")',45000);
 await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});
 await b.click('#title-actions [data-act=continue]');await b.wait('!!document.querySelector("dialog")');await b.click('dialog [data-act=close]');
 await b.wait('!!WitnessWorld.getContext()?.scene.getObjectByName("witness-flora-grass")',45000);await delay(500);
 const structure=await b.evaluate(`(()=>{const s=WitnessWorld.getContext().scene,T=s.userData.T??WitnessWorld.getContext().T;
  const out={};for(const kind of ['grass','flower']){const g=s.getObjectByName('witness-flora-'+kind);
   out[kind]={meshes:g.children.length,instanced:g.children.every(m=>m.isInstancedMesh),
    pairs:g.children.filter((m,i)=>i%2===0).every((m,i)=>g.children[i*2+1]&&m.count===g.children[i*2+1].count&&m.geometry!==g.children[i*2+1].geometry),
    culled:g.children.every(m=>!!m.boundingSphere)};}
  return out;})()`);
 for(const kind of ['grass','flower']){assert(structure[kind].meshes>=4,kind+' needs chunked pairs');assert(structure[kind].instanced&&structure[kind].pairs&&structure[kind].culled,JSON.stringify(structure));}
 report.checks.push({name:'Chunked instanced HLOD pairs with bounding-sphere culling',...structure});
 const probe=await b.evaluate(`(async()=>{const ctx=WitnessWorld.getContext(),s=ctx.scene,T=ctx.T,player=s.getObjectByName('player');
  const grass=s.getObjectByName('witness-flora-grass'),m0=grass.children[0],mat=new T.Matrix4(),v=new T.Vector3();
  m0.getMatrixAt(0,mat);v.setFromMatrixPosition(mat);
  const cx=Math.floor(v.x/16)*16+8,cz=Math.floor(v.z/16)*16+8;
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const place=async(x,z)=>{player.position.x=x;player.position.z=z;await sleep(420);};
  const vis=()=>[grass.children[0].visible,grass.children[1].visible];
  await place(cx,cz);const near=vis();
  await place(cx+40,cz);const mid=vis();
  await place(cx+140,cz);const far=vis();
  await place(cx+2,cz+2);await sleep(200);await place(cx+3,cz+3);await sleep(420);
  const shared=AdventureVisuals.windUniforms(T);
  const trail=shared.uTrail.value.map(p=>({x:p.x,z:p.z,t:p.w}));
  const t0=shared.uWindTime.value;await sleep(350);const t1=shared.uWindTime.value;
  return {near,mid,far,trail,wind:[t0,t1],chunk:[cx,cz]};})()`);
 assert.deepEqual(probe.near,[true,false],'Near chunk must render LOD0: '+JSON.stringify(probe));
 assert.deepEqual(probe.mid,[false,true],'26-90m must swap to LOD1: '+JSON.stringify(probe));
 assert.deepEqual(probe.far,[false,false],'Beyond 90m both LODs culled: '+JSON.stringify(probe));
 assert(probe.trail.some(p=>Math.hypot(p.x-(probe.chunk[0]+3),p.z-(probe.chunk[1]+3))<.01&&p.t>0),'Footfall trail not recorded: '+JSON.stringify(probe.trail));
 assert(probe.wind[1]>probe.wind[0],'Wind time must advance');
 report.checks.push({name:'Distance LOD swap, footfall trail and advancing wind time',...probe});
 await b.shot('flora-shore.png');
 assert.deepEqual(b.errors,[]);report.status='passed';
 fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(error){report.error=error.stack;fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));await b.shot('failure.png');throw error;}finally{b.close();}