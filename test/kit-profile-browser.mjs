import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {browserDriver} from './browser-driver.mjs';
const out=path.resolve('outputs/environment-kit/phase12-proof');fs.mkdirSync(out,{recursive:true});
const b=await browserDriver(out,19587,{hardware:true,url:'http://127.0.0.1:8034/kit-lab.html',width:1920,height:1200,ready:'!!globalThis.KitLab?.ready'});
try{
 const result=await b.evaluate(`(${(async function(){
  const lab=KitLab,{renderer,T}=lab,gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');
  const device=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER);
  if(/SwiftShader|software|llvmpipe|Microsoft Basic/i.test(device))throw Error('Hardware benchmark refused software renderer: '+device);
  lab.pause(true);renderer.setPixelRatio(1);renderer.setSize(1920,1080,false);lab.camera.aspect=1920/1080;lab.camera.updateProjectionMatrix();
  document.getElementById('count').value='200';lab.reset();
  const timer=gl.getExtension('EXT_disjoint_timer_query_webgl2'),runs=[];
  const stats=a=>{const s=[...a].sort((x,y)=>x-y),at=p=>s[Math.min(s.length-1,Math.floor((s.length-1)*p))];return {count:s.length,median:at(.5),p95:at(.95),p99:at(.99),max:s.at(-1),mean:s.reduce((n,x)=>n+x,0)/s.length};};
  function textureBytes(material){const unique=new Set([material.map,material.normalMap,material.roughnessMap]);let bytes=0;
   for(const tex of unique){if(tex.isCompressedTexture)bytes+=tex.mipmaps.reduce((n,m)=>n+m.data.byteLength,0);else bytes+=Math.ceil(tex.image.width*tex.image.height*4*4/3);}return bytes;}
  for(const quality of ['raw','full','lite','full','raw','lite']){
   await lab.mount(quality,200);
   for(let i=0;i<90;i++){await new Promise(requestAnimationFrame);lab.draw();}
   const intervals=[],cpu=[],gpu=[],queries=[];let last;
   function collect(){for(let i=queries.length-1;i>=0;i--){const q=queries[i];if(gl.getQueryParameter(q,gl.QUERY_RESULT_AVAILABLE)){
    if(!gl.getParameter(timer.GPU_DISJOINT_EXT))gpu.push(gl.getQueryParameter(q,gl.QUERY_RESULT)/1e6);gl.deleteQuery(q);queries.splice(i,1);
   }}}
   for(let i=0;i<240;i++){
    const now=await new Promise(requestAnimationFrame);if(last!==undefined)intervals.push(now-last);last=now;
    const query=timer?gl.createQuery():null;if(query)gl.beginQuery(timer.TIME_ELAPSED_EXT,query);
    const before=performance.now();lab.draw();cpu.push(performance.now()-before);
    if(query){gl.endQuery(timer.TIME_ELAPSED_EXT);queries.push(query);collect();}
   }
   if(timer)for(let i=0;i<120&&queries.length;i++){await new Promise(requestAnimationFrame);collect();}
   for(const q of queries)gl.deleteQuery(q);
   runs.push({quality,instances:lab.model.models[0].mesh.count,frameMs:stats(intervals),cpuSubmissionMs:stats(cpu),gpuMs:gpu.length?stats(gpu):null,
    calls:renderer.info.render.calls,trianglesAllPasses:renderer.info.render.triangles,textureUploadBytes:textureBytes(lab.model.models[0].mesh.material),memoryCounters:{...renderer.info.memory},loadMs:lab.loadMs});
  }
  const grouped={};for(const q of ['raw','full','lite']){const r=runs.filter(x=>x.quality===q);grouped[q]={gpuMedian:r.every(x=>x.gpuMs)?r.reduce((n,x)=>n+x.gpuMs.median,0)/r.length:null,cpuMedian:r.reduce((n,x)=>n+x.cpuSubmissionMs.median,0)/r.length,frameP95:Math.max(...r.map(x=>x.frameMs.p95)),textureUploadBytes:r[0].textureUploadBytes};}
  const gpuTolerance=grouped.raw.gpuMedian===null?null:Math.max(grouped.raw.gpuMedian*1.1,grouped.raw.gpuMedian+.5);
  const noRegression=gpuTolerance===null?null:grouped.full.gpuMedian<=gpuTolerance;
  const samples=gl.getParameter(gl.SAMPLES),error=gl.getError();renderer.setRenderTarget(null);lab.draw();
  return {renderer:device,vendor:debug?gl.getParameter(debug.UNMASKED_VENDOR_WEBGL):null,api:gl.getParameter(gl.VERSION),timerQuery:!!timer,
   drawingBuffer:[renderer.domElement.width,renderer.domElement.height],samples,runs,grouped,gpuToleranceMs:gpuTolerance,noRegression,error,
   conditions:{headless:true,hardware:true,viewport:[1920,1200],renderPixels:[1920,1080],devicePixelRatio:1,warmupFrames:90,sampleFrames:240,repeats:2,order:'raw/full/lite/full/raw/lite',shadowMap:1024},
   limits:['Headless rendering on actual laptop GPU; excludes physical screen presentation and human input latency','No physical phone result','Dedicated 200-module scene does not certify the future complete Q01 scene','Texture bytes are upload-size estimates; browser backbuffer and driver allocation are not measured','Background OS activity and thermal conditions were not controlled']};
 }).toString()})()`);
 assert(result.runs.every(r=>r.instances===200&&r.trianglesAllPasses>=57600));assert.equal(result.error,0);
 let system;
 try{system=JSON.parse(execFileSync('powershell.exe',['-NoProfile','-Command',"$s=Get-CimInstance Win32_ComputerSystem;$c=Get-CimInstance Win32_Processor;$g=Get-CimInstance Win32_VideoController;[pscustomobject]@{model=$s.Model;memoryBytes=$s.TotalPhysicalMemory;cpu=$c.Name;gpu=$g.Name;driver=$g.DriverVersion}|ConvertTo-Json -Compress"],{encoding:'utf8',windowsHide:true}));}catch{system={unavailable:true};}
 const files=['kit-lab.js','vendor/witness-loaders.js','vendor/adventure-3d.js','assets/environment-kit/cae/manifest-v2.json'];
 const hashes=Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));
 const report={status:result.noRegression===true?'passed':result.noRegression===null?'incomplete':'regression',date:'2026-11-09',system,hashes,...result};
 fs.writeFileSync(path.join(out,'hardware-profile.json'),JSON.stringify(report,null,2));await b.shot('hardware-200-modules.png');
 console.log(JSON.stringify({status:report.status,renderer:result.renderer,grouped:result.grouped,noRegression:result.noRegression,tolerance:result.gpuToleranceMs}));
 assert.equal(result.noRegression,true,'No-regression criterion not met or GPU timer unavailable');
}finally{b.close();}
