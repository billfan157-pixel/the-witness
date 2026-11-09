import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {browserDriver,delay} from './browser-driver.mjs';
const require=createRequire(import.meta.url), M=require('../witness-model.js'),D=require('../witness-content.js');
const out=path.resolve('test/artifacts/graphics');
const b=await browserDriver(out,19571);
const report={scenes:[],checks:[],errors:[]};
try {
  await b.send('Emulation.setDeviceMetricsOverride',{width:1000,height:720,deviceScaleFactor:1,mobile:false});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`
    globalThis.graphicsMessages=[];
    for(const kind of ['warn','error']){const old=console[kind];console[kind]=(...args)=>{
      graphicsMessages.push({kind,text:args.map(a=>a?.message??String(a)).join(' ')});old.apply(console,args);
    };}`});
  async function launch(state,name){
    const hook=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem(${JSON.stringify(M.STORE)},${JSON.stringify(JSON.stringify(state))})`});
    await b.send('Page.reload',{ignoreCache:true});
    await b.wait('!!document.querySelector("#title-actions [data-act=continue]")',45000);
    await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:hook.identifier});
    await b.click('#title-actions [data-act=continue]');
    await b.wait('!!document.querySelector("dialog")');
    await b.click('dialog [data-act=close]');
    await b.wait('!!WitnessWorld.getContext()?.scene.userData.graphicsStatus?.scene',45000);
    await delay(600);
    const status=await b.evaluate(`(()=>{const s=WitnessWorld.getContext().scene,g=s.getObjectByName('witness-terrain'),p=g.geometry.attributes.position;
      let min=Infinity,max=-Infinity;for(let i=0;i<p.count;i++){min=Math.min(min,p.getY(i));max=Math.max(max,p.getY(i));}
      const sun=s.children.find(x=>x.isDirectionalLight&&x.castShadow);
      return {graphics:s.userData.graphicsStatus,terrain:{splat:!!g.geometry.attributes.terrainSplat,range:max-min},
        shadow:sun?{width:sun.shadow.camera.right-sun.shadow.camera.left,follow:!!sun.userData.shadowFollow}:null,
        messages:graphicsMessages};})()`);
    assert.equal(status.graphics.enabled,true,JSON.stringify(status));
    assert.equal(status.graphics.fallback,null);
    assert.equal(status.terrain.splat,true);
    assert.equal(status.graphics.gtao,state.settings.graphics!=='balanced');
    assert(status.graphics.scene.endsWith(':'+(state.layer?.id??M.chapter(state).id)),JSON.stringify(status));
    assert(!status.messages.some(m=>/noSurface|noCast|Shader Error|VALIDATE_STATUS|GL_INVALID|GLSL|postprocessing disabled/.test(m.text)),JSON.stringify(status.messages));
    await b.shot(name+'.png');
    console.log('PASS '+name+' '+JSON.stringify(status.graphics));
    report.scenes.push({name,...status});
    return status;
  }
  const state=M.fresh();state.settings.graphics='ultra';
  const coast=await launch(state,'coast-ultra');
  assert.equal(coast.shadow.width,44);assert.equal(coast.shadow.follow,true);
  assert(coast.graphics.msaaSamples>0);
  const road=M.fresh();road.chapter=2;road.settings.graphics='high';
  const roadStatus=await launch(road,'road-high');
  assert(roadStatus.terrain.range>3,'Outdoor relief must be actual displaced geometry');
  const nightBase=M.fresh();nightBase.chapter=D.chapters.findIndex(c=>c.legend==='L05');
  let night=M.openLayer(nightBase,'legend','L05');night.settings.graphics='ultra';
  await launch(night,'night-ultra');
  await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  const mobile=M.fresh();mobile.settings.graphics='balanced';
  await launch(mobile,'mobile-balanced');
  assert.equal(await b.evaluate('document.documentElement.scrollWidth>innerWidth'),false);
  // A small controlled WebGL scene proves AO changes the image, beyond just flags.
  const probe=await b.evaluate(`(()=>{
    const {T}=WitnessWorld.getContext(),renderer=new T.WebGLRenderer({antialias:false});
    renderer.setSize(256,192);renderer.outputColorSpace=T.SRGBColorSpace;
    const scene=new T.Scene();scene.background=new T.Color('#8d969e');
    const floor=new T.Mesh(new T.PlaneGeometry(30,30),new T.MeshStandardMaterial({color:'#aaa59c',roughness:1}));
    floor.rotation.x=-Math.PI/2;scene.add(floor);
    const box=new T.Mesh(new T.BoxGeometry(1.6,1.6,1.6),new T.MeshStandardMaterial({color:'#918673'}));box.position.y=.8;scene.add(box);
    scene.add(new T.HemisphereLight(0xffffff,0xffffff,1.3));
    const camera=new T.PerspectiveCamera(48,256/192,.1,80);camera.position.set(4,3.5,5);camera.lookAt(0,.4,0);camera.updateMatrixWorld();
    WitnessGraphics.configureScene(T,scene,'road','AO-probe');scene.userData.graphics.fogDensity=0;
    const pipeline=AdventureVisuals.createPipeline(T,renderer,'balanced');pipeline.setSize(256,192);
    const target=new T.WebGLRenderTarget(256,192),a=new Uint8Array(256*192*4),c=new Uint8Array(a.length);
    renderer.setRenderTarget(target);pipeline.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,256,192,a);
    pipeline.setQuality('ultra');renderer.setRenderTarget(target);pipeline.render(scene,camera);renderer.readRenderTargetPixels(target,0,0,256,192,c);
    let darkened=0,maxDelta=0;for(let y=48;y<145;y++)for(let x=64;x<192;x++){
      const i=(y*256+x)*4,delta=(a[i]+a[i+1]+a[i+2]-c[i]-c[i+1]-c[i+2])/3;
      if(delta>4)darkened++;maxDelta=Math.max(maxDelta,delta);
    }
    const diagnostics={...pipeline.diagnostics};
    pipeline.setQuality('high');pipeline.setSize(193,145);camera.aspect=193/145;camera.updateProjectionMatrix();
    target.setSize(193,145);renderer.setRenderTarget(target);pipeline.render(scene,camera);
    const resized=[...pipeline.diagnostics.aoSize];
    const glError=renderer.getContext().getError();
    pipeline.dispose();target.dispose();floor.geometry.dispose();floor.material.dispose();box.geometry.dispose();box.material.dispose();renderer.dispose();
    return {darkened,maxDelta,diagnostics,resized,glError};
  })()`);
  assert(probe.darkened>40&&probe.maxDelta>8,JSON.stringify(probe));
  assert.equal(probe.glError,0,JSON.stringify(probe));
  assert.deepEqual(probe.resized,[97,73]);
  report.checks.push({name:'GTAO contact image, quality changes, odd-size resize and WebGL state',...probe});
  // The standalone build must load the same PBR maps with all network URLs blocked.
  await b.send('Network.setBlockedURLs',{urls:['http://*','https://*']});
  await b.send('Emulation.setDeviceMetricsOverride',{width:800,height:600,deviceScaleFactor:1,mobile:false});
  const offlineState=M.fresh();offlineState.chapter=2;offlineState.settings.graphics='high';
  const offlineHook=await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`localStorage.setItem(${JSON.stringify(M.STORE)},${JSON.stringify(JSON.stringify(offlineState))})`});
  await b.send('Page.navigate',{url:pathToFileURL(path.resolve('dist/ban-choi-ngoai-tuyen.html')).href});
  await b.wait('!!document.querySelector("#title-actions [data-act=continue]")',45000);
  await b.send('Page.removeScriptToEvaluateOnNewDocument',{identifier:offlineHook.identifier});
  await b.click('#title-actions [data-act=continue]');await b.wait('!!document.querySelector("dialog")');
  await b.click('dialog [data-act=close]');
  await b.wait('WitnessWorld.getContext()?.scene.userData.graphicsStatus?.scene==="road:Q03"',45000);
  const offline=await b.evaluate(`(()=>{const s=WitnessWorld.getContext().scene;return {graphics:s.userData.graphicsStatus,
    maps:s.getObjectByName('witness-terrain').material.userData.terrainMaps.map(t=>({width:t.image?.width,embedded:t.image?.src?.startsWith('data:')})),
    httpResources:performance.getEntriesByType('resource').filter(r=>/^https?:/.test(r.name)).map(r=>r.name),messages:graphicsMessages};})()`);
  assert.equal(offline.graphics.enabled,true);assert.equal(offline.graphics.gtao,true);
  assert(offline.maps.every(m=>m.width===1056&&m.embedded),JSON.stringify(offline));
  assert.deepEqual(offline.httpResources,[]);
  await b.shot('standalone-offline.png');
  report.checks.push({name:'Standalone file with network URLs blocked',...offline});
  console.log('PASS standalone-offline '+JSON.stringify(offline.graphics));
  report.errors=b.errors;
  assert.deepEqual(b.errors,[]);
  assert(!(await b.evaluate('graphicsMessages')).some(m=>m.kind==='error'),JSON.stringify(await b.evaluate('graphicsMessages')));
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:'passed',scenes:report.scenes.map(s=>({name:s.name,graphics:s.graphics})),probe}));
}catch(error){
  report.errors=[...b.errors,error.stack];fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  await b.shot('failure.png');console.error(JSON.stringify(await b.evaluate('({messages:globalThis.graphicsMessages,dialog:document.querySelector("dialog")?.innerText})')));throw error;
}finally{b.close();}
