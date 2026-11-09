(() => {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (a, b, x) => { const t = clamp((x-a)/(b-a), 0, 1); return t*t*(3-2*t); };
  const indoor = biome => ['room', 'courtyard', 'spring'].includes(biome);

  function relief(x, z, biome, clearance) {
    if (indoor(biome)) return 0;
    const dry = ['desert', 'road', 'ridge', 'lands'].includes(biome);
    const hills = 1.9*Math.sin(x*.075+.7)*Math.cos(z*.081-.3)
      + 1.1*Math.sin(x*.133+z*.062) + .42*Math.sin(x*.29-z*.17);
    // A meandering dry drainage channel and its eroded banks, in actual geometry.
    const channel = x - (11 + Math.sin(z*.071)*7 + Math.sin(z*.17)*1.8);
    const wadi = -(dry ? 1.65 : .9)*Math.exp(-channel*channel/12)
      + .45*Math.exp(-Math.pow(Math.abs(channel)-5.8, 2)/8);
    return (hills*(dry ? 1.15 : .72) + wadi)*smooth(2.8, 8.5, clearance);
  }

  // Shared immutable textures survive chapter disposal. No runtime CDN requests.
  const textureCache = new WeakMap();
  function terrainTextures(T) {
    if (textureCache.has(T)) return textureCache.get(T);
    const loader = new T.TextureLoader();
    const maps = ['albedo', 'normal', 'orm-height'].map(name => {
      const key = 'terrain/'+name+'.webp';
      const tex = loader.load(globalThis.AdventureAssets?.[key] ?? './assets/'+key);
      tex.colorSpace = name === 'albedo' ? T.SRGBColorSpace : T.NoColorSpace;
      tex.minFilter = T.LinearMipmapLinearFilter;
      tex.magFilter = T.LinearFilter;
      tex.anisotropy = 4;
      tex.userData.sharedMap = true;
      return tex;
    });
    textureCache.set(T, maps);
    return maps;
  }

  function terrain(T, geometry, {biome, pathDistance, protectedDistance, flat}) {
    const p = geometry.attributes.position, n = geometry.attributes.normal;
    const weights = new Float32Array(p.count*4);
    const green = ['shore', 'hill', 'olive', 'dawn'].includes(biome);
    for (let i=0; i<p.count; i++) {
      const x=p.getX(i), z=p.getZ(i), y=p.getY(i);
      const slope=1-n.getY(i);
      const patch=.5+.5*Math.sin(x*.29+Math.sin(z*.19)*2)*Math.cos(z*.25);
      const path=1-smooth(.8, 2.6, Math.min(pathDistance(x,z), protectedDistance(x,z)));
      const rock=clamp(.14+slope*2.4+smooth(.3,3.5,y)*.34+patch*.13, 0, .85);
      const grass=indoor(biome) ? .015 : (green ? .56 : .15)*patch*(1-rock);
      const w=[(1-rock-grass)*(1-path), rock*(1-path), grass*(1-path), path];
      weights.set(w, i*4);
    }
    geometry.setAttribute('terrainSplat', new T.Float32BufferAttribute(weights,4));
    const [albedo, normal, orm]=terrainTextures(T);
    const material=new T.MeshStandardMaterial({color:0xffffff,roughness:.91});
    material.userData.terrainMaps=[albedo,normal,orm];
    material.customProgramCacheKey=()=> 'witness-pbr-splat-1';
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms, {terrainAlbedo:{value:albedo},terrainNormal:{value:normal},terrainORM:{value:orm}});
      shader.vertexShader=shader.vertexShader
        .replace('#include <common>',`#include <common>
          attribute vec4 terrainSplat;
          varying vec4 vTerrainSplat;
          varying vec3 vTerrainWorld;`)
        .replace('#include <begin_vertex>',`#include <begin_vertex>
          vTerrainSplat=terrainSplat;
          vTerrainWorld=(modelMatrix*vec4(transformed,1.)).xyz;`);
      shader.fragmentShader=shader.fragmentShader
        .replace('#include <common>',`#include <common>
          varying vec4 vTerrainSplat;
          varying vec3 vTerrainWorld;
          uniform sampler2D terrainAlbedo, terrainNormal, terrainORM;
          vec4 terrainTap(sampler2D atlas, vec2 uv, vec2 slot) {
            // TextureLoader flips images: upper atlas row is soil/limestone.
            vec2 at=(fract(uv)*512.+8.5)/1056.+slot*.5;
            return textureGrad(atlas,at,dFdx(uv)*(512./1056.),dFdy(uv)*(512./1056.));
          }
          vec4 terrainMix(sampler2D atlas, vec2 p, vec4 w) {
            return terrainTap(atlas,p/3.,vec2(0.,1.))*w.x
              +terrainTap(atlas,p/3.5,vec2(1.,1.))*w.y
              +terrainTap(atlas,p/4.,vec2(0.,0.))*w.z
              +terrainTap(atlas,p/3.,vec2(1.,0.))*w.w;
          }`)
        .replace('#include <map_fragment>',`
          vec2 terrainUV=vTerrainWorld.xz;
          vec4 terrainWeights=max(vTerrainSplat,vec4(0.));
          vec4 heights=vec4(terrainTap(terrainORM,terrainUV/3.,vec2(0.,1.)).b,
            terrainTap(terrainORM,terrainUV/3.5,vec2(1.,1.)).b,
            terrainTap(terrainORM,terrainUV/4.,vec2(0.,0.)).b,
            terrainTap(terrainORM,terrainUV/3.,vec2(1.,0.)).b);
          vec4 blendHeight=terrainWeights+heights*.18;
          float topHeight=max(max(blendHeight.x,blendHeight.y),max(blendHeight.z,blendHeight.w));
          terrainWeights*=max(vec4(.001),blendHeight-vec4(topHeight-.30));
          terrainWeights/=max(dot(terrainWeights,vec4(1.)),.0001);
          vec3 terrainPacked=terrainMix(terrainORM,terrainUV,terrainWeights).rgb;
          diffuseColor.rgb*=terrainMix(terrainAlbedo,terrainUV,terrainWeights).rgb;
        `)
        .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          roughnessFactor=clamp(terrainPacked.g,.45,1.);`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          vec3 mappedNormal=terrainMix(terrainNormal,terrainUV,terrainWeights).xyz*2.-1.;
          mappedNormal.xy*=.65;
          vec3 dp1=dFdx(-vViewPosition), dp2=dFdy(-vViewPosition);
          vec2 duv1=dFdx(terrainUV), duv2=dFdy(terrainUV);
          vec3 p2=cross(dp2,normal), p1=cross(normal,dp1);
          vec3 tangent=p2*duv1.x+p1*duv2.x;
          vec3 bitangent=p2*duv1.y+p1*duv2.y;
          float invScale=inversesqrt(max(max(dot(tangent,tangent),dot(bitangent,bitangent)),1e-8));
          normal=normalize(mat3(tangent*invScale,bitangent*invScale,normal)*normalize(mappedNormal));`)
        .replace('#include <aomap_fragment>',`#include <aomap_fragment>
          reflectedLight.indirectDiffuse*=mix(1.,terrainPacked.r,.72);`);
    };
    return material;
  }

  const lutCache=new WeakMap();
  function lut(T, key, profile) {
    let cache=lutCache.get(T);
    if(!cache){cache=new Map();lutCache.set(T,cache);}
    if(cache.has(key))return cache.get(key);
    const size=16, data=new Uint8Array(size*size*size*4);
    for(let b=0;b<size;b++)for(let g=0;g<size;g++)for(let r=0;r<size;r++){
      const c=[r/(size-1),g/(size-1),b/(size-1)];
      const l=c[0]*.2126+c[1]*.7152+c[2]*.0722;
      const shadow=(1-l)*(1-l), highlight=l*l;
      const i=(g*size*size+b*size+r)*4;
      for(let ch=0;ch<3;ch++) {
        let v=l+(c[ch]-l)*profile.saturation;
        v=(v-.18)*profile.contrast+.18;
        v+=profile.shadows[ch]*shadow+profile.highlights[ch]*highlight;
        data[i+ch]=Math.round(clamp(v,0,1)*255);
      }
      data[i+3]=255;
    }
    const texture=new T.DataTexture(data,size*size,size,T.RGBAFormat,T.UnsignedByteType);
    texture.minFilter=texture.magFilter=T.LinearFilter;
    texture.generateMipmaps=false;texture.needsUpdate=true;
    texture.userData.sharedMap=true;
    cache.set(key,texture);return texture;
  }

  // Authored scene looks: saturation, contrast, warm/cool balance and mist density.
  const sceneLooks={
    Q01:[1.04,1.015,-.10,.95], Q02:[1.00,1.025,-.18,1.00],
    Q03:[1.05,1.030,.35,1.05], Q04:[.96,1.035,-.40,1.10],
    Q05:[1.06,1.020,.08,.90], Q06:[1.04,1.040,.16,.90],
    Q07:[1.02,1.025,-.05,1.00], Q08:[1.00,1.035,-.25,1.20],
    Q09:[.99,1.040,.10,1.00], Q10:[.98,1.045,-.10,1.00],
    Q11:[1.04,1.015,.20,1.05], Q12:[1.01,1.010,.28,1.10],
    L01:[1.04,1.040,.35,1.20], L02:[.98,1.045,-.16,1.10],
    L03:[.96,1.025,.30,.80], L04:[1.05,1.010,.20,1.20],
    L05:[.93,1.035,-.20,.80],
    V01:[.88,1.025,-.35,1.25], V02:[.94,1.010,-.15,1.40],
    V03:[.90,1.030,-.30,1.20], V04:[.91,1.020,.10,1.20]
  };
  function configureScene(T, scene, biome, sceneId=biome) {
    const climate=globalThis.AdventureVisuals.atmosphere(biome);
    const night=climate.night || ['L03','V03'].includes(sceneId);
    const dry=['desert','road','ridge','lands'].includes(biome);
    const green=['shore','hill','olive','dawn'].includes(biome);
    const profile={saturation:night?.94:dry?1.03:1.06,contrast:night?1.015:1.025,
      shadows:night?[-.004,.002,.012]:green?[-.005,.003,.006]:[.004,.001,-.003],
      highlights:night?[-.003,.002,.008]:dry?[.018,.006,-.009]:[.006,.008,.002]};
    const look=sceneLooks[sceneId];
    if(look){
      profile.saturation=look[0];profile.contrast=look[1];
      profile.shadows[0]+=look[2]*.006;profile.shadows[2]-=look[2]*.006;
      profile.highlights[0]+=look[2]*.012;profile.highlights[2]-=look[2]*.009;
    }
    const key=biome+':'+sceneId;
    scene.userData.graphics={sceneId,key,lut:lut(T,key,profile),
      fogColor:(scene.fog?.color??new T.Color(climate.haze)).clone(),
      fogDensity:(indoor(biome)?.0015:night?.009:dry?.0062:.005)*(look?.[3]??1),
      fogHeight:1.5,fogFalloff:indoor(biome)?.28:dry?.11:.16};
  }

  function followShadow(T, sun, player, camera) {
    if(!sun?.castShadow||!player)return;
    let state=sun.userData.shadowFollow;
    if(!state){
      const direction=new T.Vector3().subVectors(sun.position,sun.target.position).normalize();
      const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),direction).normalize();
      state={direction,right,up:new T.Vector3().crossVectors(direction,right).normalize(),
        desired:new T.Vector3(),forward:new T.Vector3(),snapped:new T.Vector3(),last:new T.Vector3(Infinity,Infinity,Infinity)};
      sun.userData.shadowFollow=state;
      Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:.5,far:145});
      sun.shadow.camera.updateProjectionMatrix();
      sun.shadow.normalBias=.022;sun.shadow.bias=-.00012;
    }
    camera.getWorldDirection(state.forward);state.forward.y=0;state.forward.normalize();
    state.desired.copy(player).addScaledVector(state.forward,5);state.desired.y+=2;
    const texel=44/sun.shadow.mapSize.x;
    state.snapped.copy(state.desired)
      .addScaledVector(state.right,Math.round(state.desired.dot(state.right)/texel)*texel-state.desired.dot(state.right))
      .addScaledVector(state.up,Math.round(state.desired.dot(state.up)/texel)*texel-state.desired.dot(state.up));
    if(state.last.distanceToSquared(state.snapped)<texel*texel*.25)return;
    state.last.copy(state.snapped);
    sun.target.position.copy(state.snapped);
    sun.position.copy(state.snapped).addScaledVector(state.direction,72);
    sun.target.updateMatrixWorld();sun.updateMatrixWorld();sun.shadow.needsUpdate=true;
  }

  globalThis.WitnessGraphics={relief,terrain,configureScene,followShadow};
})();
