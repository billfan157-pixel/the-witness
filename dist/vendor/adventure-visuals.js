(() => {
  "use strict";

  const atmospheres = {
    lands:     { time: "Cuối chiều", elevation: 14, azimuth: -.55, sky: "#3d6c9f", haze: "#e5ba88", light: "#ffe4c2", bounce: "#7a6248", clouds: .46 },
    desert:    { time: "Nắng sớm", elevation: 26, azimuth: -.68, sky: "#4c7fae", haze: "#eec59e", light: "#ffebd0", bounce: "#927453", clouds: .64 },
    courtyard: { time: "Xế trưa", elevation: 44, azimuth: -.58, sky: "#4b7ea8", haze: "#e8cfab", light: "#fff3d6", bounce: "#8b765a", clouds: .56 },
    spring:    { time: "Giữa ngày", elevation: 50, azimuth: -.46, sky: "#3f84ac", haze: "#d8e1be", light: "#fff6dc", bounce: "#6f7d5c", clouds: .54 },
    field:     { time: "Đêm", elevation: 28, azimuth: -.46, sky: "#0c1830", haze: "#3d5066", light: "#b9d3fb", bounce: "#2d3434", clouds: .56, night: true },
    shore:     { time: "Sáng ven hồ", elevation: 28, azimuth: .54, sky: "#3a7cb2", haze: "#c0dcd8", light: "#fff0d8", bounce: "#668078", clouds: .50 },
    hill:      { time: "Nắng sườn núi", elevation: 39, azimuth: -.72, sky: "#4383b8", haze: "#c8ded0", light: "#fff4d8", bounce: "#6e7558", clouds: .48 },
    road:      { time: "Cuối chiều", elevation: 18, azimuth: -.71, sky: "#4a749d", haze: "#e2b388", light: "#ffe0b8", bounce: "#83654b", clouds: .52 },
    room:      { time: "Buổi tối", elevation: 30, azimuth: -.40, sky: "#0f1b2e", haze: "#404655", light: "#c8d6ef", bounce: "#3f332a", clouds: .62, night: true },
    olive:     { time: "Canh đêm", elevation: 23, azimuth: .56, sky: "#0c1b30", haze: "#3d5266", light: "#bad1f5", bounce: "#2d3730", clouds: .54, night: true },
    ridge:     { time: "Trời âm u", elevation: 24, azimuth: -.63, sky: "#47576b", haze: "#b4a696", light: "#ebd7bf", bounce: "#5e574d", clouds: .30 },
    dawn:      { time: "Rạng đông", elevation: 8, azimuth: .47, sky: "#43648c", haze: "#e8b88d", light: "#ffd9a8", bounce: "#7c5f4b", clouds: .51 },
    evening:   { time: "Chạng vạng", elevation: 10, azimuth: -.54, sky: "#475d7c", haze: "#e8a773", light: "#ffd29c", bounce: "#7c5a41", clouds: .43 }
  };

  const atmosphere = biome => atmospheres[biome] ?? atmospheres.lands;
  globalThis.__registerWitnessAtmospheres = values => Object.assign(atmospheres, values);

  function randomFrom(seed) {
    return () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  const noise = `
    float grainHash(vec2 point) {
      vec3 p = fract(vec3(point.xyx) * .1031);
      p += dot(p, p.yzx + 33.33);
      return fract((p.x + p.y) * p.z);
    }
    float grainNoise(vec2 point) {
      vec2 cell = floor(point);
      vec2 f = fract(point);
      vec2 blend = f * f * (3. - 2. * f);
      return mix(mix(grainHash(cell), grainHash(cell + vec2(1., 0.)), blend.x),
                 mix(grainHash(cell + vec2(0., 1.)), grainHash(cell + 1.), blend.x), blend.y);
    }
    float fbmNoise(vec2 p) {
      float v = grainNoise(p) * .54;
      p = p * 2.07 + vec2(13.1, 7.7);
      v += grainNoise(p) * .28;
      p = p * 2.13 + vec2(-5.4, 19.3);
      v += grainNoise(p) * .13;
      p = p * 2.21 + vec2(9.2, -11.8);
      v += grainNoise(p) * .05;
      return v;
    }`;

  function sunDirection(T, climate) {
    const angle = climate.elevation * Math.PI / 180;
    return new T.Vector3(Math.sin(climate.azimuth) * Math.cos(angle), Math.sin(angle),
      -Math.cos(climate.azimuth) * Math.cos(angle));
  }

  // Shared wind clock + player footfall trail for all flora shaders.
  let windState = null;
  function windUniforms(T) {
    if (!windState) windState = {
      uWindTime: { value: 0 },
      uTrail: { value: Array.from({ length: 5 }, () => new T.Vector4(0, -100, 0, -10)) }
    };
    return windState;
  }
  const windGLSL = `
    vec3 windMod289(vec3 x){return x-floor(x*(1./289.))*289.;}
    vec4 windMod289(vec4 x){return x-floor(x*(1./289.))*289.;}
    vec4 windPerm(vec4 x){return windMod289(((x*34.)+1.)*x);}
    vec4 windTaylor(vec4 r){return 1.79284291400159-.85373472095314*r;}
    float windSimplex(vec3 v){
      const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
      vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
      i=windMod289(i);
      vec4 p=windPerm(windPerm(windPerm(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
      float n_=1./7.;vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
      vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=windTaylor(inversesqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3))));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
      return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }
    uniform float uWindTime;
    uniform vec4 uTrail[5];
    vec2 windPush(vec2 base){
      vec2 push=vec2(0.);
      for(int i=0;i<5;i++){
        vec4 tp=uTrail[i];
        float age=uWindTime-tp.w;
        if(age<0.||age>1.5)continue;
        vec2 d=base-tp.xz;
        float infl=smoothstep(.85,.05,length(d))*(1.-age/1.5);
        push+=normalize(d+vec2(1e-4))*infl;
      }
      return push;
    }
    vec2 windGust(vec2 base){
      float gust=windSimplex(vec3(base*.07,uWindTime*.25))*.5+.5;
      float sway=windSimplex(vec3(base*.18,uWindTime*.45));
      return vec2(sway*.7+gust*.9,sway*.4-gust*.5);
    }`;

  function light(T, scene, sun, ambient, fill, biome) {
    const climate = atmosphere(biome);
    const direction = sunDirection(T, climate);
    scene.background = new T.Color(climate.haze);
    scene.fog = new T.FogExp2(climate.haze, climate.night ? .0080 : biome === "lands" ? .0042 : .0050);
    sun.color.set(climate.light);
    sun.position.copy(sun.target.position).addScaledVector(direction, 66);
    sun.intensity = climate.night ? (biome === "room" ? 1.05 : 1.55) : biome === "ridge" ? 2.45 : 3.35;
    ambient.color.set(climate.night ? "#7b98cb" : "#a2c1e4");
    ambient.groundColor.set(climate.bounce ?? (climate.night ? "#282a2b" : "#6a543e"));
    ambient.intensity = climate.night ? .72 : .60;
    fill.color.set(climate.night ? "#6f8ec9" : "#b8d0e8");
    fill.intensity = climate.night ? .18 : .22;
    fill.position.set(-direction.x * 24 + 10, 14, -direction.z * 24 + 8);
    scene.environmentIntensity = climate.night ? .52 : .58;
    globalThis.WitnessGraphics?.configureScene(T, scene, biome);
  }

  const envCache = new WeakMap();
  // The active engine pipeline; water registers its planar-reflection pass here.
  let currentPipeline = null;
  function isSoftwareGL(renderer) {
    try {
      const gl = renderer?.getContext?.();
      if (!gl) return false;
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      const name = (gl.getParameter(gl.RENDERER) || "") + " " + (ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || "" : "");
      return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(name);
    } catch { return false; }
  }

  function environment(T, renderer, scene, biome) {
    if (!T.PMREMGenerator || !renderer) return null;
    const envClimate=atmosphere(biome);
    const cacheKey=[biome,envClimate.sky,envClimate.haze,envClimate.light,envClimate.elevation,envClimate.azimuth,!!envClimate.night].join('|');
    let map = envCache.get(renderer);
    if (!map) {
      map = new Map();
      envCache.set(renderer, map);
    }
    if (map.has(cacheKey)) {
      const tex = map.get(cacheKey);
      scene.environment = tex;
      scene.environmentIntensity = atmosphere(biome).night ? .52 : .58;
      return tex;
    }
    try {
      const climate = atmosphere(biome);
      const pmrem = new T.PMREMGenerator(renderer);
      const envScene = new T.Scene();
      const dome = new T.Mesh(new T.SphereGeometry(20, 24, 14), new T.ShaderMaterial({
        uniforms: {
          zenith: { value: new T.Color(climate.sky) },
          horizon: { value: new T.Color(climate.haze) },
          sunlight: { value: new T.Color(climate.light) },
          ground: { value: new T.Color(climate.bounce ?? "#7c654d") },
          sun: { value: sunDirection(T, climate) },
          dark: { value: climate.night ? 1 : 0 }
        },
        side: T.BackSide,
        depthWrite: false,
        toneMapped: false,
        vertexShader: `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
          }`,
        fragmentShader: `
          varying vec3 vDir;
          uniform vec3 zenith, horizon, sunlight, ground, sun;
          uniform float dark;
          void main() {
            vec3 d = normalize(vDir);
            float h = d.y;
            vec3 skyCol = mix(horizon, zenith, smoothstep(-.04, .62, max(0., h)));
            float facing = max(0., dot(d, sun));
            skyCol += sunlight * (pow(facing, 18.) * mix(.55, .18, dark) + smoothstep(.996, .9996, facing) * mix(5.5, 2.2, dark));
            vec3 bounce = mix(ground * .65, ground * 1.15, max(0., dot(vec3(0., 1., 0.), sun)));
            vec3 col = mix(bounce, skyCol, smoothstep(-.16, .08, h));
            gl_FragColor = vec4(col, 1.);
          }`
      }));
      envScene.add(dome);
      const rt = pmrem.fromScene(envScene, .03);
      dome.geometry.dispose();
      dome.material.dispose();
      pmrem.dispose();
      rt.texture.userData.sharedMap = true;
      map.set(cacheKey, rt.texture);
      scene.environment = rt.texture;
      scene.environmentIntensity = climate.night ? .52 : .58;
      return rt.texture;
    } catch {
      return null;
    }
  }

  function sky(T, scene, biome) {
    const climate = atmosphere(biome);
    const sunDir = sunDirection(T, climate);
    const material = new T.ShaderMaterial({
      uniforms: {
        zenith: { value: new T.Color(climate.sky) },
        horizon: { value: new T.Color(climate.haze) },
        sunlight: { value: new T.Color(climate.light) },
        sun: { value: sunDir },
        cover: { value: climate.clouds },
        dark: { value: climate.night ? 1 : 0 },
        time: { value: 0 }
      },
      side: T.BackSide, depthWrite: false, fog: false, toneMapped: false,
      vertexShader: `
        varying vec3 vDirection;
        void main() {
          vDirection = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }`,
      fragmentShader: `
        varying vec3 vDirection;
        uniform vec3 zenith, horizon, sunlight, sun;
        uniform float cover, dark, time;
        ${noise}
        void main() {
          vec3 direction = normalize(vDirection);
          float altitude = max(0., direction.y);
          float facing = max(0., dot(direction, sun));
          // Rayleigh vertical scatter + golden horizon belt
          float rayleigh = smoothstep(-.05, .68, direction.y);
          vec3 deepZenith = zenith * mix(1.06, .82, smoothstep(.4, .95, altitude));
          vec3 color = mix(horizon, deepZenith, pow(rayleigh, .78));
          // Warm Mie atmospheric scatter around sun
          float mie = pow(facing, 5.) * exp(-altitude * 1.45);
          float tightMie = pow(facing, 34.) * exp(-altitude * .9);
          color = mix(color, sunlight * 1.18, mie * mix(.48, .12, dark));
          color += sunlight * tightMie * mix(.45, .16, dark);
          // Solar / Lunar disc & corona
          float disc = smoothstep(.99958, .99985, facing);
          color += sunlight * (disc * mix(2.1, .95, dark) + pow(facing, 130.) * mix(.42, .16, dark));
          // Volumetric FBM cloud strata with directional silver lining
          vec2 uvC = direction.xz * 4.2 / (altitude + .19);
          vec2 warp = vec2(grainNoise(uvC * .55 + time * .005), grainNoise(uvC * .55 + 17.3 - time * .004)) * .65;
          uvC += warp + vec2(time * .014, time * .004);
          float cDensity = grainNoise(uvC) * .54 + grainNoise(uvC * 2.15) * .28 +
            grainNoise(uvC * 4.65) * .12 + grainNoise(uvC * 9.8) * .06;
          float cEdge = grainNoise(uvC + normalize(sun.xz + vec2(.001)) * .12) * .6 + grainNoise(uvC * 2.2) * .4;
          float cloudAlpha = smoothstep(cover - .07, cover + .24, cDensity) * smoothstep(.008, .18, altitude);
          float litEdge = clamp((cDensity - cEdge) * 2.6 + .5, 0., 1.);
          vec3 cloudShadow = mix(vec3(.42, .45, .53), zenith * .68, .35);
          vec3 cloudSun = mix(cloudShadow, sunlight * 1.12, .28 + .58 * litEdge + .35 * pow(facing, 3.));
          cloudSun = mix(cloudSun, color * .68, dark * .92);
          // Night starfield + soft Milky Way nebula band
          if (dark > .5) {
            vec2 grid = direction.xz * 195. / (1. + altitude);
            float h = grainHash(floor(grid));
            float star = step(.984, h) * (1. - smoothstep(.02, .15, length(fract(grid) - .5)));
            float twinkle = .72 + .28 * sin(time * (1.6 + fract(h * 19.) * 2.4) + h * 40.);
            float band = exp(-pow((direction.x * .62 - direction.z * .78 + .15) * 3.1, 2.));
            float milky = fbmNoise(direction.xz * 6.5 + 3.1) * band;
            color += vec3(.58, .70, .95) * star * twinkle * smoothstep(.04, .28, altitude);
            color += vec3(.11, .16, .28) * milky * smoothstep(.06, .35, altitude);
          }
          color = mix(color, cloudSun, cloudAlpha * mix(.84, .46, dark));
          // Subtle horizon atmospheric mist blend
          color = mix(color, horizon, (1. - smoothstep(0., .085, max(0., direction.y))) * .20);
          gl_FragColor = vec4(color, 1.);
          #include <colorspace_fragment>
        }`
    });
    const dome = new T.Mesh(new T.SphereGeometry(128, 42, 24), material);
    dome.renderOrder = -10;
    scene.add(dome);
    return time => { material.uniforms.time.value = time; };
  }

  function ridges(T, scene, biome, seed) {
    const climate = atmosphere(biome);
    const random = randomFrom(seed);
    const sunDir = sunDirection(T, climate);
    const steps = 168;
    const layers = biome === "room" ? 2 : 3;
    const haze = new T.Color(climate.haze);
    const sunCol = new T.Color(climate.light);
    const rockDark = new T.Color(climate.night ? "#1d2a3d" : "#64564d");
    const tmp = new T.Color();
    for (let layer = layers - 1; layer >= 0; layer--) {
      const radius = 58 + layer * 19;
      const phase = random() * Math.PI * 2;
      const tint = haze.clone().lerp(rockDark, .56 - layer * .15);
      const geometry = new T.BufferGeometry();
      const vertices = [];
      const colors = [];
      const indices = [];
      for (let step = 0; step <= steps; step++) {
        const angle = step / steps * Math.PI * 2;
        const wave = Math.sin(angle * 3 + phase) * 2.4 + Math.sin(angle * 7 - phase * 1.8) * 1.9 +
          Math.sin(angle * 15 + phase) * 1.45 + Math.sin(angle * 27 - phase * 2.1) * .68;
        const relief = Math.max(0, Math.sin(angle * 2 - phase)) * (layer * 1.7 + 3.9);
        const peak = (biome === "desert" || biome === "hill" ? 5.2 : 2.3) +
          layer * 1.4 + wave + relief + Math.sin(angle * 21 + phase) * .48;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        vertices.push(x, -9.5, z, x, peak, z);
        const slopeDot = Math.max(0, Math.sin(angle) * sunDir.x + Math.cos(angle) * sunDir.z);
        const rimGlow = Math.pow(slopeDot, 2.2) * (.22 - layer * .05);
        const base = tmp.copy(tint).lerp(haze, .58 + layer * .12);
        colors.push(base.r, base.g, base.b);
        const crest = tint.clone().lerp(sunCol, rimGlow).multiplyScalar(.88 + .12 * slopeDot);
        colors.push(crest.r, crest.g, crest.b);
        if (step < steps) indices.push(step * 2, step * 2 + 2, step * 2 + 1, step * 2 + 1, step * 2 + 2, step * 2 + 3);
      }
      geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      const ridge = new T.Mesh(geometry, new T.MeshBasicMaterial({
        vertexColors: true, fog: false, side: T.DoubleSide, toneMapped: false
      }));
      ridge.userData.isSkyRidge = true;
      scene.add(ridge);
    }
  }

  const surfaceColor = {
    earth: `
      vec2 p = vSurface.xz;
      float macro = fbmNoise(p * .16);
      float micro = grainNoise(p * 3.6);
      float detail = fbmNoise(p * 1.1 + vec2(macro * 1.4, -macro * 1.1));
      float surfRelief = macro * .38 + detail * .45 + micro * .17;
      float damp = 1. - smoothstep(-.25, .45, vSurface.y);
      diffuseColor.rgb *= mix(.84, 1.16, surfRelief);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * .72, damp * .35);`,
    stone: `
      vec2 p = vSurface.xz + vec2(vSurface.y * .73, vSurface.y * 1.48);
      float strata = fbmNoise(p * 1.8);
      float groundAO = smoothstep(-.15, .52, vSurface.y);
      float dustNoise = grainNoise(vSurface.xz * 2.2);
      float groundDust = (1. - smoothstep(0., .42 + dustNoise * .15, vSurface.y)) * .52;
      vec3 dustColor = vec3(.76, .69, .55);
      float surfRelief = strata * .60;
      diffuseColor.rgb *= mix(.82, 1.15, strata);
      diffuseColor.rgb = mix(diffuseColor.rgb * mix(.78, 1., groundAO), dustColor, groundDust);`,
    masonry: `
      vec3 gdx = dFdx(vSurface);
      vec3 gdy = dFdy(vSurface);
      vec3 fc = cross(gdx, gdy);
      vec3 nAbs = length(fc) > 1e-8 ? abs(normalize(fc)) : vec3(0., 1., 0.);
      vec2 p = nAbs.y > .68 ? vSurface.xz : vec2(nAbs.z > nAbs.x ? vSurface.x : vSurface.z, vSurface.y);
      vec2 block = p / vec2(.72, .32);
      block.x += floor(block.y) * .5;
      vec2 seam = abs(fract(block) - .5);
      float mortar = max(smoothstep(.43, .498, seam.x), smoothstep(.41, .498, seam.y));
      float chisel = fbmNoise(p * 2.8);
      float blockVar = grainHash(floor(block));
      float aoBase = smoothstep(-.12, .56, vSurface.y);
      float dustNoiseM = grainNoise(vSurface.xz * 2.4);
      float groundDustM = (1. - smoothstep(0., .38 + dustNoiseM * .12, vSurface.y)) * .48;
      vec3 dustColorM = vec3(.77, .71, .58);
      float surfRelief = (1. - mortar) * (.50 + chisel * .50);
      diffuseColor.rgb *= mix(.82 + chisel * .18 + blockVar * .14, .64 + chisel * .12, mortar * .65);
      diffuseColor.rgb = mix(diffuseColor.rgb * mix(.78, 1., aoBase), dustColorM, groundDustM);`,
    bark: `
      vec2 p = vec2(vSurface.x + vSurface.z * 1.35, vSurface.y);
      float furrows = fbmNoise(p * vec2(15., 1.7));
      float ridge = smoothstep(.40, .80, fbmNoise(p * vec2(26., 2.4)));
      float crack = smoothstep(.60, .72, fbmNoise(p * vec2(34., 3.2)));
      float rings = grainNoise(p * vec2(8., 4.5));
      float surfRelief = furrows * .50 + ridge * .35 + rings * .15 - crack * .30;
      diffuseColor.rgb *= mix(.60, 1.24, furrows);
      diffuseColor.rgb *= mix(1., .66, crack * .55);
      float moss = smoothstep(.55, .85, furrows) * smoothstep(.40, .70, grainNoise(p * vec2(5., 2.5)));
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(.70, .84, .60), moss * .45);`,
    wood: `
      vec3 wdx = dFdx(vSurface);
      vec3 wdy = dFdy(vSurface);
      vec3 wfc = cross(wdx, wdy);
      vec3 wn = length(wfc) > 1e-8 ? abs(normalize(wfc)) : vec3(0., 1., 0.);
      vec2 wp = wn.y > .65 ? vSurface.xz : vec2(wn.z > wn.x ? vSurface.x : vSurface.z, vSurface.y);
      float fiber = fbmNoise(vec2(wp.x * 6. + fbmNoise(wp * 1.2) * .8, wp.y * 1.1));
      float seamX = smoothstep(.975, .998, abs(sin(wp.x * 4.8)));
      float plankTone = grainHash(vec2(floor(wp.x * 1.52789 + .5), floor(wp.y * .45)));
      float grain = clamp(fiber, 0., 1.);
      float plank = seamX;
      float surfRelief = grain * .50 - seamX * .40;
      diffuseColor.rgb *= mix(.88, 1.10, grain) * (.94 + plankTone * .10) * mix(1., .72, seamX * .55);`,
    terracotta: `
      float kiln = fbmNoise(vSurface.xz * 3.5 + vSurface.y * 2.2);
      float surfRelief = kiln * .60;
      diffuseColor.rgb *= mix(.88, 1.12, kiln);`,
    bronze: `
      float hammer = fbmNoise(vSurface.xz * 12. + vSurface.y * 10.);
      float patina = smoothstep(.65, .90, fbmNoise(vSurface.xz * 4. + vSurface.y * 3.));
      float surfRelief = hammer * .50;
      diffuseColor.rgb = mix(diffuseColor.rgb * (.90 + hammer * .20), vec3(.34, .48, .40), patina * .22);`,
    linen: `
      float folds = grainNoise(vSurface.xy * vec2(4.2, 1.8) + vSurface.z * 1.5);
      float surfRelief = folds * .40;
      diffuseColor.rgb *= .92 + folds * .12;`,
    wool: `
      float coarse = grainNoise(vSurface.xy * vec2(5.5, 2.8) + vSurface.z * 2.2);
      float surfRelief = coarse * .40;
      diffuseColor.rgb *= .90 + coarse * .14;`,
    skin: `
      float tint = grainNoise(vSurface.xy * 8. + vSurface.z * 6.);
      diffuseColor.rgb *= .98 + tint * .03;
      float surfRelief = 0.;`
  };

  const surfaceRoughness = {
    earth: `roughnessFactor = clamp(mix(.94, .78, damp * .50), .68, .98);`,
    stone: `roughnessFactor = clamp(mix(.92, .80, strata * .50), .72, .96);`,
    masonry: `roughnessFactor = clamp(mix(.82, .96, mortar), .76, .98);`,
    bark: `roughnessFactor = clamp(.94 - furrows * .06, .84, .98);`,
    wood: `roughnessFactor = clamp(mix(.66, .82, plank * .4), .55, .90);`,
    terracotta: `roughnessFactor = clamp(mix(.58, .74, kiln * .3), .48, .82);`,
    bronze: `roughnessFactor = clamp(mix(.32, .60, patina * .70), .28, .70);`,
    linen: `roughnessFactor = clamp(.92 - folds * .06, .80, .96);`,
    wool: `roughnessFactor = .95;`
  };

  const surfaceRim = {
    linen: `
      vec3 lV = normalize(vEyeDir);
      float lNdotV = clamp(dot(normal, lV), 0.001, 1.0);
      float lSinTheta = sqrt(max(0.0, 1.0 - lNdotV * lNdotV));
      float charlieLinen = pow(lSinTheta, 3.4) * 0.159;
      vec3 sheenTintLinen = mix(diffuseColor.rgb, vec3(0.96, 0.92, 0.85), 0.45);
      diffuseColor.rgb += sheenTintLinen * charlieLinen * 0.52;`,
    wool: `
      vec3 wV = normalize(vEyeDir);
      float wNdotV = clamp(dot(normal, wV), 0.001, 1.0);
      float wSinTheta = sqrt(max(0.0, 1.0 - wNdotV * wNdotV));
      float charlieWool = pow(wSinTheta, 2.6) * 0.159;
      vec3 sheenTintWool = mix(diffuseColor.rgb, vec3(0.88, 0.84, 0.78), 0.55);
      diffuseColor.rgb += sheenTintWool * charlieWool * 0.68;`,
    skin: `
      vec3 sV = normalize(vEyeDir);
      float sRim = 1. - max(0., dot(normal, sV));
      diffuseColor.rgb += vec3(.18, .08, .04) * pow(sRim, 2.4) * .28;`
  };

  const bumpStrength = {
    earth: .006, stone: .012, masonry: .016, bark: .030, wood: .006, terracotta: .006, bronze: .006, linen: .002, wool: .003, skin: 0.0
  };

  function surface(material, kind, local = false, extra = null) {
    if (!material || (!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial)) return material;
    const key = kind + (local ? "-local" : "") + (extra?.key ? "-" + extra.key : "");
    if (material.userData.surface === key) return material;
    material.userData.surface = key;
    material.customProgramCacheKey = () => "journey-v2-" + key;
    const bump = bumpStrength[kind] ?? .025;
    material.onBeforeCompile = shader => {
      if (extra?.uniforms) Object.assign(shader.uniforms, extra.uniforms);
      const varying = extra?.varying ? "\n" + extra.varying : "";
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vSurface;\nvarying vec3 vEyeDir;" + varying)
        .replace("#include <begin_vertex>", `
          #include <begin_vertex>
          vEyeDir = - (modelViewMatrix * vec4(position, 1.0)).xyz;
          ${local ? "vSurface = position;" : `
            vec4 groundPoint = vec4(position, 1.);
            #ifdef USE_INSTANCING
              groundPoint = instanceMatrix * groundPoint;
            #endif
            vSurface = (modelMatrix * groundPoint).xyz;`}
          ${extra?.vertex ?? ""}`);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vSurface;\nvarying vec3 vEyeDir;\n" + noise + varying)
        .replace("#include <color_fragment>", "#include <color_fragment>\n" + (surfaceColor[kind] ?? "float surfRelief = 0.;"))
        .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n" +
          (surfaceColor[kind]?.includes("damp") ? "" : "") +
          (surfaceRoughness[kind] ?? "") +
          (extra?.roughness ? "\n" + extra.roughness : ""))
        .replace("#include <normal_fragment_maps>", `
          #include <normal_fragment_maps>
          {
            vec3 spDx = dFdx(-vViewPosition);
            vec3 spDy = dFdy(-vViewPosition);
            vec3 r1 = cross(spDy, normal);
            vec3 r2 = cross(normal, spDx);
            float fDet = dot(spDx, r1);
            if (abs(fDet) > 1e-8) {
              vec3 vGrad = sign(fDet) * (dFdx(surfRelief * ${bump.toFixed(4)}) * r1 + dFdy(surfRelief * ${bump.toFixed(4)}) * r2);
              normal = normalize(abs(fDet) * normal - vGrad);
            }
            ${surfaceRim[kind] ?? ""}
          }
          ${extra?.normal ?? ""}`);
      if (extra?.declarations) shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\n" + extra.declarations);
    };
    return material;
  }

  function rocks(T) {
    const geometry = new T.DodecahedronGeometry(1, 2);
    const points = geometry.attributes.position;
    const colors = [];
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const fracture = Math.sin(x * 11.4 + z * 8.2) * Math.cos(y * 10.6 - z * 7.1);
      const strata = Math.sin(y * 18. + x * 4.) * .045;
      const edge = 1 + .12 * fracture + .07 * Math.sin((x + y + z) * 7.5) + strata;
      points.setXYZ(i, x * edge + .12 * y, Math.max(-.48, y * edge), z * edge);
      const ao = .66 + .34 * Math.max(0, y * .5 + .5);
      const shade = ao * (.85 + fracture * .09 + strata * .5);
      colors.push(shade, shade * .96, shade * .90);
    }
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  function treeTrunk(T) {
    const geometry = new T.CylinderGeometry(.24, .62, 1, 14, 10);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const angle = Math.atan2(z, x);
      const rootFlare = y < -.22 ? Math.pow((-.22 - y) / .28, 1.35) * (.26 + .20 * Math.cos(angle * 5)) : 0;
      const knot = .05 * Math.sin(y * 9 + angle * 3) + .035 * Math.sin(y * 17 + angle * 7);
      const twist = Math.sin(y * 3.9 + x * 6.1 + z * 5.2) * .09;
      const leanX = (y + .5) * .44 + .09 * Math.sin(y * 4.5);
      const leanZ = -y * .20 + .05 * Math.cos(y * 3.7);
      const girth = 1 + rootFlare + knot;
      points.setXYZ(i, x * girth + twist + leanX, y, z * girth + leanZ);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  // Tán lá nhiều tầng: lá thật có gân gấp, cụm lá vỏ ngoài + lõi tối bên trong,
  // silhouette bất đối xứng và cành tối tạo chiều sâu. Kèm aFlex/aPhase cho gió phân cấp.
  function canopy(T, seed) {
    const random = randomFrom(seed);
    const vertices = [], colors = [], indices = [], flex = [], phase = [];
    const lobeSeed = random() * 6.283;

    function leaf(cx, cy, cz, ax, ay, az, nx, ny, nz, length, width, cr, cg, cb, ph, fold) {
      let al = Math.hypot(ax, ay, az) || 1; ax /= al; ay /= al; az /= al;
      let nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      let sx = ny * az - nz * ay, sy = nz * ax - nx * az, sz = nx * ay - ny * ax;
      const sl = Math.hypot(sx, sy, sz) || 1; sx /= sl; sy /= sl; sz /= sl;
      const mx = ay * sz - az * sy, my = az * sx - ax * sz, mz = ax * sy - ay * sx;
      const L = length, W = width, b = vertices.length / 3;
      vertices.push(
        cx, cy, cz,
        cx + ax * L * .42 + sx * W * .5 + mx * fold, cy + ay * L * .42 + sy * W * .5 + my * fold, cz + az * L * .42 + sz * W * .5 + mz * fold,
        cx + ax * L + mx * fold * .4, cy + ay * L - L * .16 + my * fold * .4, cz + az * L + mz * fold * .4,
        cx + ax * L * .42 - sx * W * .5 + mx * fold, cy + ay * L * .42 - sy * W * .5 + my * fold, cz + az * L * .42 - sz * W * .5 + mz * fold,
        cx + ax * L * .45 + mx * fold * 1.6, cy + ay * L * .45 + my * fold * 1.6, cz + az * L * .45 + mz * fold * 1.6);
      const f = [0, .45, 1, .45, .5];
      for (let k = 0; k < 5; k++) {
        const tip = 1 + f[k] * .10;
        colors.push(cr * tip, cg * tip, cb * tip);
        flex.push(f[k]); phase.push(ph);
      }
      indices.push(b, b + 1, b + 4, b + 1, b + 2, b + 4, b + 2, b + 3, b + 4, b + 3, b, b + 4);
    }

    function tangent(rx, ry, rz) {
      const tx = ry * (random() - .5) - rz * (random() - .5);
      const ty = rz * (random() - .5) - rx * (random() - .5);
      const tz = rx * (random() - .5) - ry * (random() - .5);
      const tl = Math.hypot(tx, ty, tz) || 1;
      return [tx / tl, ty / tl, tz / tl];
    }

    const clusters = 140;
    for (let i = 0; i < clusters; i++) {
      const theta = i * 2.39996 + random() * .2;
      const y = 1 - 2 * (i + .5) / clusters;
      const shell = Math.sqrt(Math.max(0, 1 - y * y));
      const lobe = 1 + .14 * Math.sin(theta * 3 + lobeSeed) + .08 * Math.sin(theta * 5 + y * 3);
      const inward = random() < .18 ? .55 : 1;
      const cx = Math.cos(theta) * shell * lobe * .95 * inward;
      const cz = Math.sin(theta) * shell * lobe * .95 * inward;
      const cy = y * .80 * inward + .06;
      let rx = cx, ry = cy * 1.15 + .15, rz = cz;
      const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl;
      const droop = Math.max(0, -y) * .6;
      const sun = Math.min(1, Math.max(0, .45 + y * .45 + (inward === 1 ? .2 : -.35) + random() * .15));
      const shade = .55 + sun * .75;
      const cr = shade * (.85 + sun * .25), cg = shade * (1.0 + sun * .25), cb = shade * (.95 - sun * .25);
      const ph = random();
      for (let l = 0; l < 3; l++) {
        const t = tangent(rx, ry, rz);
        const ax = t[0] * .8 + rx * .18, ay = t[1] * .8 - droop + ry * .18, az = t[2] * .8 + rz * .18;
        const length = .16 + random() * .12;
        leaf(cx, cy, cz, ax, ay, az, rx, ry, rz, length, length * .55, cr, cg, cb, ph, length * .12);
      }
    }
    for (let i = 0; i < 44; i++) {
      const theta = random() * 6.283;
      const y = (random() * 2 - 1) * .7;
      const shell = Math.sqrt(Math.max(0, 1 - y * y)) * .62;
      const cx = Math.cos(theta) * shell, cy = y * .62, cz = Math.sin(theta) * shell;
      let rx = cx, ry = cy + .1, rz = cz;
      const rl = Math.hypot(rx, ry, rz) || 1; rx /= rl; ry /= rl; rz /= rl;
      const t = tangent(rx, ry, rz);
      const shade = .34 + random() * .16;
      leaf(cx, cy, cz, t[0], t[1] - .25, t[2], rx, ry, rz, .34 + random() * .16, .22,
        shade * .85, shade, shade * .72, random(), .05);
    }
    for (let i = 0; i < 5; i++) {
      const theta = i * 1.256 + lobeSeed;
      const ex = Math.cos(theta) * .7, ez = Math.sin(theta) * .7, ey = .1 + random() * .4;
      const b = vertices.length / 3, w = .05;
      vertices.push(0, -.7, 0, ex * .5 - w, ey * .5, ez * .5, ex, ey, ez, ex * .5 + w, ey * .5, ez * .5);
      for (let k = 0; k < 4; k++) { colors.push(.20, .18, .15); flex.push(k / 3 * .5); phase.push(random()); }
      indices.push(b, b + 1, b + 2, b, b + 2, b + 3);
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("aFlex", new T.Float32BufferAttribute(flex, 1));
    geometry.setAttribute("aPhase", new T.Float32BufferAttribute(phase, 1));
    geometry.setIndex(indices);
    // Dome-normal transfer: shade leaves as one smooth volume, not faceted cards.
    const normals = [];
    for (let i = 0; i < vertices.length; i += 3) {
      const nx = vertices[i], ny = vertices[i + 1], nz = vertices[i + 2];
      const l = Math.hypot(nx, ny, nz) || 1;
      normals.push(nx / l, ny / l, nz / l);
    }
    geometry.setAttribute("normal", new T.Float32BufferAttribute(normals, 3));
    return geometry;
  }

  function grass(T, dry) {
    const random = randomFrom(dry ? 1041 : 3407);
    const vertices = [];
    const colors = [];
    const indices = [];
    const flex = [];
    const phase = [];
    for (let blade = 0; blade < 12; blade++) {
      const direction = blade * 2.39996;
      const lean = .24 + random() * .96;
      const height = .34 + random() * .70;
      const width = .052 + random() * (dry ? .032 : .085);
      const baseX = Math.cos(direction) * .33;
      const baseZ = Math.sin(direction) * .33;
      const ph = random();
      const index = vertices.length / 3;
      for (let step = 0; step < 4; step++) {
        const fraction = step / 3;
        const bend = fraction * fraction * lean;
        const half = width * (1 - fraction);
        const green = .38 + .67 * fraction;
        const x = baseX + Math.cos(direction) * bend;
        const z = baseZ + Math.sin(direction) * bend;
        vertices.push(x - Math.sin(direction) * half, height * fraction, z + Math.cos(direction) * half,
          x + Math.sin(direction) * half, height * fraction, z - Math.cos(direction) * half);
        for (let side = 0; side < 2; side++) {
          colors.push(green * (dry ? 1.15 : .88), green, green * .76);
          flex.push(fraction); phase.push(ph);
        }
        if (step) {
          const base = index + step * 2 - 2;
          indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setAttribute("aFlex", new T.Float32BufferAttribute(flex, 1));
    geometry.setAttribute("aPhase", new T.Float32BufferAttribute(phase, 1));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function vegetation(T, color, blades) {
    const time = { value: 0 };
    const material = new T.MeshStandardMaterial({
      color, vertexColors: true, side: T.DoubleSide, roughness: blades ? .90 : .86
    });
    material.customProgramCacheKey = () => blades ? "journey-grass-3" : "journey-canopy-3";
    material.onBeforeCompile = shader => {
      shader.uniforms.windTime = time;
      const shared = windUniforms(T);
      shader.uniforms.uWindTime = shared.uWindTime;
      shader.uniforms.uTrail = shared.uTrail;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>
          uniform float windTime;
          attribute float aFlex;
          attribute float aPhase;
          varying float vTint;
          ${windGLSL}`)
        .replace("#include <begin_vertex>", `
          #include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 base = instanceMatrix[3].xyz;
          #else
            vec3 base = vec3(0.);
          #endif
          float treePhase = base.x * .37 + base.z * .29;
          float distFade = 1. - smoothstep(38., 68., length(cameraPosition - base));
          float gust = sin(windTime * .55 - (base.x + base.z) * .10) * .5 + .5;
          gust *= gust;
          float sway = sin(windTime * 1.15 + treePhase) * .6 + sin(windTime * .63 + treePhase * 1.7) * .4;
          float branch = sin(windTime * 1.21 + treePhase * 2.3) * .5 + sin(windTime * 2.36 + treePhase) * .5;
          float crownFlex = ${blades ? "position.y * position.y" : "(position.y + 1.) * .5"};
          transformed.x += (sway * (.04 + gust * .06) + branch * .02) * crownFlex * distFade;
          transformed.z += (sway * .5 * (.03 + gust * .04) + branch * .012) * crownFlex * distFade;
          float fl = sin(windTime * 4.98 + aPhase * 6.2831 + treePhase * 2.0);
          float fl2 = cos(windTime * 12.4 + aPhase * 12.566);
          transformed.x += fl * aFlex * ${blades ? ".02" : ".012"} * (.5 + gust) * distFade;
          transformed.y += fl2 * aFlex * ${blades ? ".008" : ".010"} * (.5 + gust) * distFade;
          transformed.z += fl2 * aFlex * ${blades ? ".016" : ".010"} * (.5 + gust) * distFade;
          vec2 windPushV = windPush(base.xz);
          vec2 windGustV = windGust(base.xz);
          transformed.x += (windGustV.x * .05 + windPushV.x * .30) * crownFlex * distFade;
          transformed.z += (windGustV.y * .05 + windPushV.y * .30) * crownFlex * distFade;
          transformed.y -= length(windPushV) * .10 * crownFlex * distFade;
          vTint = fract(sin(dot(base.xz, vec2(12.9898, 78.233))) * 43758.5453);`);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>
          varying float vTint;`)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float tintAmt = (vTint - .5) * ${blades ? ".10" : ".16"};
          diffuseColor.rgb *= vec3(1. + tintAmt * .6, 1. + tintAmt, 1. + tintAmt * .3);`)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          vec3 leafV = normalize(vViewPosition);
          float leafRim = pow(1. - abs(dot(normal, leafV)), 2.5);
          diffuseColor.rgb += diffuseColor.rgb * leafRim * ${blades ? ".06" : ".14"};`);
    };
    return { material, animate: elapsed => { time.value = elapsed; windUniforms(T).uWindTime.value = elapsed; } };
  }

  // Tileable water detail-normal map, generated once per Three instance.
  const waterNormalCache = new WeakMap();
  function waterNormalTexture(T) {
    if (waterNormalCache.has(T)) return waterNormalCache.get(T);
    const size = 256, height = new Float32Array(size * size);
    const lattice = (freq, seed) => {
      const grid = new Float32Array(freq * freq);
      let s = seed;
      for (let i = 0; i < grid.length; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; grid[i] = s / 4294967296; }
      return (x, y) => {
        const gx = x / size * freq, gy = y / size * freq;
        const x0 = Math.floor(gx) % freq, y0 = Math.floor(gy) % freq;
        const fx = gx - Math.floor(gx), fy = gy - Math.floor(gy);
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        const at = (xx, yy) => grid[((yy + freq) % freq) * freq + ((xx + freq) % freq)];
        return at(x0, y0) * (1 - sx) * (1 - sy) + at(x0 + 1, y0) * sx * (1 - sy)
          + at(x0, y0 + 1) * (1 - sx) * sy + at(x0 + 1, y0 + 1) * sx * sy;
      };
    };
    const octaves = [[4, 911, .5], [8, 337, .26], [16, 577, .15], [32, 229, .09]]
      .map(([freq, seed, amp]) => [lattice(freq, seed), amp]);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let h = 0;
      for (const [sample, amp] of octaves) h += sample(x, y) * amp;
      h += Math.sin((x * 3 + y * 7) / size * Math.PI * 2) * .05;
      height[y * size + x] = h;
    }
    const data = new Uint8Array(size * size * 4), strength = 2.4;
    const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (at(x - 1, y) - at(x + 1, y)) * strength;
      const dy = (at(x, y - 1) - at(x, y + 1)) * strength;
      const len = Math.sqrt(dx * dx + dy * dy + 1);
      const i = (y * size + x) * 4;
      data[i] = Math.round((dx / len * .5 + .5) * 255);
      data[i + 1] = Math.round((dy / len * .5 + .5) * 255);
      data[i + 2] = Math.round((1 / len * .5 + .5) * 255);
      data[i + 3] = 255;
    }
    const texture = new T.DataTexture(data, size, size, T.RGBAFormat);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.minFilter = T.LinearMipmapLinearFilter; texture.magFilter = T.LinearFilter;
    texture.generateMipmaps = true; texture.needsUpdate = true;
    texture.userData.sharedMap = true;
    waterNormalCache.set(T, texture);
    return texture;
  }

  // Physical water: Gerstner swell, dual scrolling detail normals, Beer-Lambert
  // absorption over real bed depth, planar reflection and depth-based foam.
  function water(T, color, width, length, night, biome, opts = {}) {
    const climate = atmosphere(biome);
    const time = { value: 0 };
    const foamEdge = opts.foamEdge ?? .09;
    const waveScale = opts.waveScale ?? .055;
    const segW = Math.max(24, Math.min(96, Math.round(width * 1.4)));
    const segL = Math.max(24, Math.min(96, Math.round(length * 1.4)));
    const uniforms = {
      waterColor: { value: new T.Color(color).multiplyScalar(night ? .34 : .64) },
      shallowColor: { value: new T.Color(color).lerp(new T.Color(night ? "#365f66" : "#67aba3"), .52) },
      skyColor: { value: new T.Color(climate.sky) },
      horizonColor: { value: new T.Color(climate.haze) },
      sunlight: { value: new T.Color(climate.light) },
      sun: { value: sunDirection(T, climate) },
      fogColor: { value: new T.Color(climate.haze) },
      foamEdge: { value: foamEdge },
      waveScale: { value: waveScale },
      uFragmentWaves: { value: opts.fragmentWaves ? 1 : 0 },
      uWhitecapStrength: { value: opts.whitecapStrength ?? .35 },
      uNormalMap: { value: waterNormalTexture(T) },
      uBedTex: { value: null },
      uBedRect: { value: new T.Vector4(0, 0, 1, 1) },
      uHasBed: { value: 0 },
      uLevelY: { value: 0 },
      uReflection: { value: null },
      uTexMatrix: { value: new T.Matrix4() },
      uHasReflection: { value: 0 },
      uAbsorption: { value: new T.Vector3(night ? 2.6 : 1.9, night ? 1.5 : .95, night ? .9 : .48) },
      time
    };
    const material = new T.ShaderMaterial({
      uniforms,
      vertexShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        varying vec3 vWaveNormal;
        varying vec4 vReflCoord;
        varying float vCrest;
        uniform float time, waveScale, uHasBed, uLevelY;
        uniform sampler2D uBedTex;
        uniform vec4 uBedRect;
        uniform mat4 uTexMatrix;
        float bedDepth(vec2 xz) {
          if (uHasBed < .5) return 2.;
          vec2 buv = clamp((xz - uBedRect.xy) * uBedRect.zw, 0., 1.);
          vec4 tap = texture2D(uBedTex, buv);
          float bed = -8. + (tap.r * 255. * 256. + tap.g * 255.) / 65535. * 16.;
          return max(0., uLevelY - bed);
        }
        vec3 gerstner(vec2 dir, float steepness, float wavelength, float speed,
                      vec3 p, inout vec3 tangent, inout vec3 binormal) {
          float k = 6.2831853 / wavelength;
          float c = sqrt(9.8 / k);
          float f = k * (dot(dir, p.xz) - c * speed * time);
          float a = steepness / k;
          float sf = sin(f), cf = cos(f);
          tangent += vec3(-dir.x * dir.x * steepness * sf, dir.x * steepness * cf, -dir.x * dir.y * steepness * sf);
          binormal += vec3(-dir.x * dir.y * steepness * sf, dir.y * steepness * cf, -dir.y * dir.y * steepness * sf);
          return vec3(dir.x * a * cf, a * sf, dir.y * a * cf);
        }
        void main() {
          vUv = uv;
          vec3 wPos = (modelMatrix * vec4(position, 1.)).xyz;
          float damp = smoothstep(0., .55, bedDepth(wPos.xz));
          float amp = waveScale * 1.35;
          vec3 tangent = vec3(1., 0., 0.), binormal = vec3(0., 0., 1.);
          vec3 disp = vec3(0.);
          disp += gerstner(normalize(vec2(.85, .52)), amp * 1.1, 9.5, 1., wPos, tangent, binormal);
          disp += gerstner(normalize(vec2(-.42, .91)), amp * .8, 5.6, 1.12, wPos, tangent, binormal);
          disp += gerstner(normalize(vec2(.23, -.97)), amp * .5, 3.1, 1.3, wPos, tangent, binormal);
          disp += gerstner(normalize(vec2(-.88, -.3)), amp * .3, 1.7, 1.6, wPos, tangent, binormal);
          wPos += disp * damp;
          vWaveNormal = normalize(cross(binormal, tangent));
          vCrest = disp.y / max(amp * 2.2, 1e-4);
          vWater = wPos;
          vReflCoord = uTexMatrix * vec4(wPos, 1.);
          gl_Position = projectionMatrix * viewMatrix * vec4(wPos, 1.);
        }`,
      fragmentShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        varying vec3 vWaveNormal;
        varying vec4 vReflCoord;
        varying float vCrest;
        uniform vec3 waterColor, shallowColor, skyColor, horizonColor, sunlight, sun, fogColor, uAbsorption;
        uniform float time, foamEdge, uHasBed, uLevelY, uHasReflection, waveScale, uFragmentWaves, uWhitecapStrength;
        uniform sampler2D uNormalMap, uBedTex, uReflection;
        uniform vec4 uBedRect;
        ${noise}
        float bedDepth(vec2 xz) {
          if (uHasBed < .5) return 2.;
          vec2 buv = clamp((xz - uBedRect.xy) * uBedRect.zw, 0., 1.);
          vec4 tap = texture2D(uBedTex, buv);
          float bed = -8. + (tap.r * 255. * 256. + tap.g * 255.) / 65535. * 16.;
          return max(0., uLevelY - bed);
        }
        float swell(vec2 dir, float steepness, float wavelength, float speed, vec2 point,
                    inout vec3 tangent, inout vec3 binormal) {
          float k = 6.2831853 / wavelength;
          float f = k * (dot(dir, point) - sqrt(9.8 / k) * speed * time);
          float sf = sin(f), cf = cos(f);
          tangent += vec3(-dir.x * dir.x * steepness * sf, dir.x * steepness * cf, -dir.x * dir.y * steepness * sf);
          binormal += vec3(-dir.x * dir.y * steepness * sf, dir.y * steepness * cf, -dir.y * dir.y * steepness * sf);
          return steepness / k * sf;
        }
        void main() {
          vec2 point = vWater.xz;
          vec3 waveNormal = vWaveNormal;
          float crest = vCrest;
          vec3 toCam = cameraPosition - vWater;
          float viewDist = length(toCam);
          vec3 view = toCam / max(viewDist, 1e-4);
          // Large harbour surfaces exceed the vertex sampling rate of short
          // waves. Analytic fragment shading avoids a visible triangle lattice
          // while distance attenuation prevents horizon scanline aliasing.
          if(uFragmentWaves > .5) {
            float amp = waveScale * 1.35 / (1. + max(0., viewDist - 12.) * .042), displacement = 0.;
            vec3 tangent = vec3(1., 0., 0.), binormal = vec3(0., 0., 1.);
            displacement += swell(normalize(vec2(.85, .52)), amp * 1.1, 9.5, 1., point, tangent, binormal);
            displacement += swell(normalize(vec2(-.42, .91)), amp * .8, 5.6, 1.12, point, tangent, binormal);
            displacement += swell(normalize(vec2(.23, -.97)), amp * .5 / (1. + viewDist * .03), 3.1, 1.3, point, tangent, binormal);
            displacement += swell(normalize(vec2(-.88, -.3)), amp * .3 / (1. + viewDist * .05), 1.7, 1.6, point, tangent, binormal);
            waveNormal = normalize(cross(binormal, tangent));
            crest = displacement / max(waveScale * 1.35 * 2.2, 1e-4);
          }
          // Dual scrolling normal maps moving against each other.
          vec3 n1 = texture2D(uNormalMap, point * .16 + vec2(time * .023, time * .017)).xyz * 2. - 1.;
          vec3 n2 = texture2D(uNormalMap, point * .37 - vec2(time * .031, time * .013)).xyz * 2. - 1.;
          vec2 detail = n1.xy * .55 + n2.xy * .45;
          float detailGain = .45 / (1. + viewDist * .032);
          vec3 normal = normalize(vec3(waveNormal.x + detail.x * detailGain, waveNormal.y, waveNormal.z + detail.y * detailGain));
          float facing = max(.001, dot(view, normal));
          float fresnel = .02 + .98 * pow(1. - facing, 4.2);

          // Beer-Lambert extinction over measured bed depth.
          float depth = bedDepth(point);
          vec3 transmittance = exp(-uAbsorption * depth * 1.35);
          float caustic = smoothstep(.52, .88, grainNoise(point * 2.8 + vec2(time * .36, -time * .24)))
            * smoothstep(2.4, .3, depth);
          vec3 bedColor = shallowColor * (1. + caustic * .38);
          vec3 body = bedColor * transmittance + waterColor * (1. - transmittance);
          float sss = pow(max(0., dot(view, -sun + normal * .35)), 3.) * .25 * (1. - transmittance.g);
          body += shallowColor * sss;

          // Planar reflection with sky-gradient fallback.
          vec3 reflDir = reflect(-view, normal);
          vec3 reflSky = mix(horizonColor, skyColor, smoothstep(0., .52, max(0., reflDir.y)));
          vec3 reflected = reflSky;
          if (uHasReflection > .5) {
            vec2 ruv = vReflCoord.xy / max(vReflCoord.w, 1e-4) + detail * .035;
            if (ruv.x > 0. && ruv.x < 1. && ruv.y > 0. && ruv.y < 1.)
              reflected = mix(reflSky, texture2D(uReflection, ruv).rgb, .85);
          }
          vec3 color = mix(body, reflected, clamp(.10 + fresnel * .78, 0., .92));

          vec3 halfV = normalize(sun + view);
          color += sunlight * (pow(max(0., dot(normal, halfV)), 260.) * 1.45
            + pow(max(0., dot(normal, halfV)), 32.) * .22);

          // Shoreline foam from real water depth plus lap and crest whitecaps.
          float shore = 1. - smoothstep(.04, max(.18, foamEdge * 4.2), depth);
          float lap = .5 + .5 * sin(time * 2.1 - depth * 26. + point.y * 1.3);
          float foamNoise = fbmNoise(point * 4.6 - vec2(time * .35, time * .2));
          float foam = shore * smoothstep(.30, .72, foamNoise + lap * .38);
          foam += smoothstep(.62, .95, crest) * smoothstep(.4, 1.2, depth) * uWhitecapStrength;
          color = mix(color, mix(horizonColor, vec3(.96), .75), clamp(foam * .88, 0., 1.));

          float fogDist = length(cameraPosition - vWater) * .0055;
          gl_FragColor = vec4(mix(color, fogColor, 1. - exp(-fogDist * fogDist)), 1.);
          #include <colorspace_fragment>
        }`
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(width, length, segW, segL), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    // Planar reflection pass, driven by the engine pipeline's pre-render hook.
    const reflRes = currentPipeline?.isSoftware ? 256 : 512;
    const reflectionRT = new T.WebGLRenderTarget(reflRes, reflRes, {
      minFilter: T.LinearFilter, magFilter: T.LinearFilter, depthBuffer: true
    });
    reflectionRT.texture.userData.sharedMap = true;
    const virtualCamera = new T.PerspectiveCamera();
    const _reflMatrix = new T.Matrix4(), _reflFrustum = new T.Frustum();
    const reflectorWorldPosition = new T.Vector3(), cameraWorldPosition = new T.Vector3();
    const rotationMatrix = new T.Matrix4(), normal = new T.Vector3(), view = new T.Vector3();
    const lookAtPosition = new T.Vector3(), target = new T.Vector3();
    const reflectorPlane = new T.Plane(), clipPlane = new T.Vector4(), q = new T.Vector4();
    const textureMatrix = new T.Matrix4();
    let frame = 0, removeHook = null, disposed = false;
    function updateReflection(renderer, scene, camera) {
      if (disposed || currentPipeline?.quality === "balanced") { uniforms.uHasReflection.value = 0; return; }
      let node = mesh;
      while (node && node !== scene) {
        if (!node.visible) { uniforms.uHasReflection.value = 0; return; }
        node = node.parent;
      }
      if (node !== scene) { uniforms.uHasReflection.value = 0; return; }
      if (currentPipeline?.isSoftware) {
        if (uniforms.uHasReflection.value > .5 && ++frame % 3) return;
      } else if (currentPipeline?.quality === "high" && ++frame % 2) return;
      camera.updateMatrixWorld();
      _reflMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      _reflFrustum.setFromProjectionMatrix(_reflMatrix);
      mesh.updateWorldMatrix(true, false);
      if (!_reflFrustum.intersectsObject(mesh)) return;
      mesh.getWorldPosition(reflectorWorldPosition);
      camera.getWorldPosition(cameraWorldPosition);
      rotationMatrix.extractRotation(mesh.matrixWorld);
      normal.set(0, 0, 1).applyMatrix4(rotationMatrix);
      view.subVectors(reflectorWorldPosition, cameraWorldPosition);
      if (view.dot(normal) > 0) { uniforms.uHasReflection.value = 0; return; }
      view.reflect(normal).negate().add(reflectorWorldPosition);
      rotationMatrix.extractRotation(camera.matrixWorld);
      lookAtPosition.set(0, 0, -1).applyMatrix4(rotationMatrix).add(cameraWorldPosition);
      target.subVectors(reflectorWorldPosition, lookAtPosition);
      target.reflect(normal).negate().add(reflectorWorldPosition);
      virtualCamera.position.copy(view);
      virtualCamera.up.set(0, 1, 0).applyMatrix4(rotationMatrix).reflect(normal);
      virtualCamera.lookAt(target);
      virtualCamera.near = camera.near; virtualCamera.far = camera.far;
      virtualCamera.updateMatrixWorld();
      virtualCamera.projectionMatrix.copy(camera.projectionMatrix);
      textureMatrix.set(.5, 0, 0, .5, 0, .5, 0, .5, 0, 0, .5, .5, 0, 0, 0, 1);
      textureMatrix.multiply(virtualCamera.projectionMatrix);
      textureMatrix.multiply(virtualCamera.matrixWorldInverse);
      uniforms.uTexMatrix.value.copy(textureMatrix);
      reflectorPlane.setFromNormalAndCoplanarPoint(normal, reflectorWorldPosition);
      reflectorPlane.applyMatrix4(virtualCamera.matrixWorldInverse);
      clipPlane.set(reflectorPlane.normal.x, reflectorPlane.normal.y, reflectorPlane.normal.z, reflectorPlane.constant);
      const projectionMatrix = virtualCamera.projectionMatrix;
      q.x = (Math.sign(clipPlane.x) + projectionMatrix.elements[8]) / projectionMatrix.elements[0];
      q.y = (Math.sign(clipPlane.y) + projectionMatrix.elements[9]) / projectionMatrix.elements[5];
      q.z = -1;
      q.w = (1 + projectionMatrix.elements[10]) / projectionMatrix.elements[14];
      clipPlane.multiplyScalar(2 / clipPlane.dot(q));
      projectionMatrix.elements[2] = clipPlane.x;
      projectionMatrix.elements[6] = clipPlane.y;
      projectionMatrix.elements[10] = clipPlane.z + 1 - .003;
      projectionMatrix.elements[14] = clipPlane.w;
      const prevTarget = renderer.getRenderTarget();
      const prevVisible = mesh.visible;
      mesh.visible = false;
      renderer.setRenderTarget(reflectionRT);
      renderer.clear();
      renderer.render(scene, virtualCamera);
      renderer.setRenderTarget(prevTarget);
      mesh.visible = prevVisible;
      uniforms.uReflection.value = reflectionRT.texture;
      uniforms.uHasReflection.value = 1;
    }
    if (currentPipeline?.addBeforeRender) removeHook = currentPipeline.addBeforeRender(updateReflection);

    function setBed(bed, levelY) {
      uniforms.uBedTex.value = bed.texture;
      uniforms.uBedRect.value.set(...bed.rect);
      uniforms.uHasBed.value = 1;
      uniforms.uLevelY.value = levelY;
    }
    mesh.userData.disposeWater = () => {
      disposed = true;
      removeHook?.();
      reflectionRT.dispose();
    };
    return { water: mesh, animate: elapsed => { time.value = elapsed; }, setBed };
  }

  function mesh(T, group, geometry, material, position) {
    const object = new T.Mesh(geometry, material);
    object.position.set(...position);
    object.castShadow = object.receiveShadow = true;
    group.add(object);
    return object;
  }

  function beam(T, group, from, to, radius, material) {
    const start = new T.Vector3(...from);
    const end = new T.Vector3(...to);
    const direction = end.clone().sub(start);
    const object = mesh(T, group, new T.CylinderGeometry(radius * .77, radius, direction.length(), 8), material,
      start.lerp(end, .5).toArray());
    object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
    return object;
  }

  function tent(T) {
    const group = new T.Group();
    const cloth = surface(new T.MeshStandardMaterial({ color: "#856a4d", roughness: .94, side: T.DoubleSide, vertexColors: true }), "wool", true);
    const wood = surface(new T.MeshStandardMaterial({ color: "#68513a", roughness: .88 }), "bark");
    const rope = surface(new T.MeshStandardMaterial({ color: "#bfa882", roughness: .94 }), "linen", true);
    const bronze = surface(new T.MeshStandardMaterial({ color: "#9c7c48", roughness: .42, metalness: .65 }), "bronze", true);
    const length = 1.28, width = 1.21, peak = 1.54;
    for (const side of [-1, 1]) {
      const canvas = new T.PlaneGeometry(2, 2, 22, 16);
      const points = canvas.attributes.position;
      const tones = [];
      for (let i = 0; i < points.count; i++) {
        const u = (points.getX(i) + 1) * .5;
        const z = points.getY(i);
        const folds = Math.sin(z * 29 + side) * .026 + Math.sin(z * 12 - u * 5) * .034;
        points.setXYZ(i, side * width * u, peak * (1 - u) + .16 * u -
          Math.sin(u * Math.PI) * .14 - .10 * (1 - z * z) + folds * u, z * length);
        const stripe = Math.abs((u * 7.7) % 1 - .5) < .11 ? .74 : 1;
        const hemTrim = Math.abs(z) > .88 || u > .91 ? .84 : 1;
        tones.push(stripe * hemTrim, stripe * .96 * hemTrim, stripe * .86 * hemTrim);
      }
      canvas.setAttribute("color", new T.Float32BufferAttribute(tones, 3));
      canvas.computeVertexNormals();
      mesh(T, group, canvas, cloth, [0, 0, 0]);
      for (const end of [-1, 1]) {
        beam(T, group, [side * width, .18, end * length], [side * 1.55, .035, end * 1.56], .010, rope);
        beam(T, group, [side * 1.55, 0, end * 1.56], [side * 1.58, .13, end * 1.59], .027, wood);
      }
    }
    for (const end of [-1, 1]) {
      beam(T, group, [0, .01, end * length], [0, peak + .07, end * length], .043, wood);
      mesh(T, group, new T.TorusGeometry(.045, .009, 6, 14), bronze, [0, peak - .02, end * length]).rotation.x = Math.PI / 2;
    }
    beam(T, group, [0, peak - .075, -length - .06], [0, peak - .075, length + .06], .031, wood);
    return group;
  }

  function accessory(T, elbow, kind) {
    if (!kind) return null;
    const group = new T.Group();
    group.position.set(0, -.25, .029);
    elbow.add(group);
    const matKind = kind === "jar" ? "terracotta" : kind === "basin" ? "bronze" : "linen";
    const material = surface(new T.MeshStandardMaterial({
      color: { staff: "#594431", bag: "#65523b", jar: "#af6648", tablet: "#9e8157",
        basket: "#a38150", lantern: "#805c39", rope: "#b89d6b", net: "#a99b78", "oil-lamp": "#a46e4c",
        scroll: "#6a4f38", basin: "#8a5d3b" }[kind] ?? "#65523b",
      roughness: kind === "basin" ? .42 : .88,
      metalness: kind === "basin" ? .65 : 0
    }), matKind, true);
    if (kind === "staff") {
      beam(T, group, [0, -.70, .03], [.05, .42, -.05], .019, material);
      const crook = new T.TorusGeometry(.07, .017, 6, 16, Math.PI * 1.25);
      crook.rotateZ(-.45);
      mesh(T, group, crook, material, [.07, .46, -.05]);
    } else if (kind === "jar") {
      const shape = [[0, -.20], [.05, -.20], [.115, -.11], [.118, .02], [.078, .11], [.046, .14], [.058, .155], [.059, .17]]
        .map(([radius, height]) => new T.Vector2(radius, height));
      mesh(T, group, new T.LatheGeometry(shape, 24), material, [-.046, -.145, .07]);
      for (const side of [-1, 1]) {
        const handle = mesh(T, group, new T.TorusGeometry(.045, .011, 6, 16, Math.PI * .9), material,
          [-.046 + side * .085, -.02, .07]);
        handle.rotation.z = side * Math.PI / 2;
      }
    } else if (kind === "scroll") {
      const parchmentMat = surface(new T.MeshStandardMaterial({ color: "#dfd3bc", roughness: .85 }), "linen", true);
      const woodRodMat = surface(new T.MeshStandardMaterial({ color: "#543e2b", roughness: .75 }), "wood", true);
      const scrollCore = mesh(T, group, new T.CylinderGeometry(.026, .026, .26, 16), parchmentMat, [-.01, -.11, .05]);
      scrollCore.rotation.z = Math.PI / 4;
      const spindle = mesh(T, group, new T.CylinderGeometry(.009, .009, .34, 10), woodRodMat, [-.01, -.11, .05]);
      spindle.rotation.z = Math.PI / 4;
      mesh(T, group, new T.SphereGeometry(.016, 8, 8), woodRodMat, [-.13, -.23, .05]);
      mesh(T, group, new T.SphereGeometry(.016, 8, 8), woodRodMat, [.11, .01, .05]);
      const band = mesh(T, group, new T.TorusGeometry(.028, .004, 4, 16), material, [-.01, -.11, .05]);
      band.rotation.y = Math.PI / 4;
    } else if (kind === "basin") {
      const bronzeMat = surface(new T.MeshStandardMaterial({ color: "#9c7045", roughness: .38, metalness: .72 }), "bronze", true);
      mesh(T, group, new T.CylinderGeometry(.16, .11, .11, 24, 1, true), bronzeMat, [0, -.18, .08]);
      const rim = mesh(T, group, new T.TorusGeometry(.16, .012, 6, 24), bronzeMat, [0, -.125, .08]);
      rim.rotation.x = Math.PI / 2;
      const bottom = mesh(T, group, new T.CircleGeometry(.11, 18), bronzeMat, [0, -.235, .08]);
      bottom.rotation.x = Math.PI / 2;
    } else if (kind === "tablet") {
      mesh(T, group, new T.BoxGeometry(.157, .216, .029), material, [-.02, -.116, .055]).rotation.z = -.13;
    } else if (kind === "rope") {
      for (let loop = 0; loop < 3; loop++) {
        const coil = mesh(T, group, new T.TorusGeometry(.067 + loop * .009, .008, 6, 21), material,
          [-.025 - loop * .008, -.083 - loop * .018, .042 + loop * .015]);
        coil.scale.y = 1.34;
      }
    } else if (kind === "net") {
      for (let row = 0; row < 6; row++) for (let column = 0; column < 6; column++) {
        const x = (column - 2.5) * .032, y = -.05 - row * .035;
        beam(T, group, [x, y, .035], [x + .032, y - .035, .04], .0018, material);
        beam(T, group, [x + .032, y, .035], [x, y - .035, .04], .0018, material);
      }
    } else if (kind === "oil-lamp") {
      const bowl = mesh(T, group, new T.SphereGeometry(1, 18, 12), material, [0, -.06, .06]);
      bowl.scale.set(.082, .032, .095);
      const rim = mesh(T, group, new T.TorusGeometry(.046, .007, 6, 18), material, [0, -.035, .04]);
      rim.rotation.x = Math.PI / 2;
      const spout = mesh(T, group, new T.ConeGeometry(.028, .075, 12), material, [0, -.048, .155]);
      spout.rotation.x = Math.PI / 2;
      const lampHandle = mesh(T, group, new T.TorusGeometry(.022, .006, 4, 12, Math.PI), material, [0, -.04, -.025]);
      lampHandle.rotation.y = Math.PI / 2;
      const flame = mesh(T, group, new T.SphereGeometry(1, 10, 8), new T.MeshBasicMaterial({ color: "#ffb454" }), [0, -.016, .175]);
      flame.scale.set(.009, .024, .009);
    } else if (kind === "basket" || kind === "lantern") {
      mesh(T, group, new T.CylinderGeometry(.115, .084, .107, 16, 2, true), material, [0, -.165, .035]);
      const rim = mesh(T, group, new T.TorusGeometry(.115, .012, 6, 20), material, [0, -.11, .035]);
      rim.rotation.x = Math.PI / 2;
      for (let ring = 0; ring < 5; ring++) {
        const weave = mesh(T, group, new T.TorusGeometry(.087 + ring * .005, .0034, 4, 24), material, [0, -.207 + ring * .021, .035]);
        weave.rotation.x = Math.PI / 2;
      }
      mesh(T, group, new T.TorusGeometry(.107, .013, 6, 19, Math.PI), material, [0, -.106, .035]);
      if (kind === "lantern") mesh(T, group, new T.SphereGeometry(.032, 8, 6),
        new T.MeshBasicMaterial({ color: "#ffca79" }), [0, -.083, .035]);
    } else {
      const pouch = mesh(T, group, new T.SphereGeometry(1, 13, 9), material, [-.022, -.131, .046]);
      pouch.scale.set(.092, .116, .041);
    }
    return group;
  }

  function createPipeline(T, renderer, quality = "ultra") {
    let mode = quality;
    let enabled = true;
    let width = 800, height = 600;
    const isSoftware = isSoftwareGL(renderer);
    const gl = renderer.getContext();
    const extFloat = renderer.extensions?.has?.("EXT_color_buffer_half_float") ||
      renderer.extensions?.has?.("EXT_color_buffer_float");
    const targetType = extFloat && T.HalfFloatType ? T.HalfFloatType : T.UnsignedByteType;
    const targetOpts = {
      type: targetType,
      format: T.RGBAFormat,
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      depthBuffer: true,
      stencilBuffer: false
    };
    const bloomOpts = {
      type: targetType,
      format: T.RGBAFormat,
      minFilter: T.LinearFilter,
      magFilter: T.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false
    };
    const sceneRT = new T.WebGLRenderTarget(800, 600, targetOpts);
    // Canvas antialiasing does not cover offscreen postprocessing targets.
    const format = targetType === T.HalfFloatType ? gl.RGBA16F : gl.RGBA8;
    const sampleCounts = Array.from(gl.getInternalformatParameter(gl.RENDERBUFFER, format, gl.SAMPLES) || []).filter(samples => samples > 0 && samples <= 4).sort((a, b) => a - b);
    sceneRT.samples = sampleCounts.length ? (isSoftware ? sampleCounts[0] : sampleCounts[sampleCounts.length - 1]) : 0;
    sceneRT.depthTexture = new T.DepthTexture(800, 600, T.UnsignedIntType);
    sceneRT.depthTexture.minFilter = sceneRT.depthTexture.magFilter = T.NearestFilter;
    let framebufferChecked = false;
    const aoA = new T.WebGLRenderTarget(400, 300, {...bloomOpts, type:T.UnsignedByteType});
    const aoB = aoA.clone();
    const gtao = globalThis.WitnessGTAO(T);
    const noiseTexture = gtao.generateMagicSquareNoise();
    const aoMat = new T.ShaderMaterial({
      ...gtao.GTAOShader,
      uniforms:T.UniformsUtils.clone(gtao.GTAOShader.uniforms),
      defines:{...gtao.GTAOShader.defines,NORMAL_VECTOR_TYPE:0,SAMPLES:isSoftware?12:24},
      depthTest:false,depthWrite:false,toneMapped:false,blending:T.NoBlending
    });
    Object.assign(aoMat.uniforms.tDepth,{value:sceneRT.depthTexture});
    aoMat.uniforms.tNoise.value = noiseTexture;
    aoMat.uniforms.radius.value = .85;
    aoMat.uniforms.thickness.value = .8;
    aoMat.uniforms.distanceExponent.value = 1.6;
    aoMat.uniforms.distanceFallOff.value = 1;
    const pdSamples = isSoftware ? 4 : 8;
    const denoiseMat = new T.ShaderMaterial({
      ...gtao.PoissonDenoiseShader,
      uniforms:T.UniformsUtils.clone(gtao.PoissonDenoiseShader.uniforms),
      defines:{...gtao.PoissonDenoiseShader.defines,NORMAL_VECTOR_TYPE:0,SAMPLES:pdSamples,
        SAMPLE_VECTORS:gtao.generatePdSamplePointInitializer(pdSamples,2,1)},
      depthTest:false,depthWrite:false,toneMapped:false,blending:T.NoBlending
    });
    denoiseMat.uniforms.tDepth.value = sceneRT.depthTexture;
    denoiseMat.uniforms.tNoise.value = noiseTexture;
    denoiseMat.uniforms.tDiffuse.value = aoA.texture;
    denoiseMat.uniforms.radius.value = 5;
    denoiseMat.uniforms.depthPhi.value = .25;
    denoiseMat.uniforms.normalPhi.value = 8;
    denoiseMat.uniforms.lumaPhi.value = .8;
    const bloomA = new T.WebGLRenderTarget(200, 150, bloomOpts);
    const bloomB = new T.WebGLRenderTarget(200, 150, bloomOpts);
    const postCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new T.PlaneGeometry(2, 2);

    const screenVert = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0., 1.);
      }`;

    const brightMat = new T.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        threshold: { value: 1.18 },
        knee: { value: .22 }
      },
      depthTest: false, depthWrite: false, toneMapped: false,
      vertexShader: screenVert,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform float threshold, knee;
        void main() {
          vec3 col = texture2D(tDiffuse, vUv).rgb;
          float lum = max(col.r, max(col.g, col.b));
          float soft = clamp(lum - threshold + knee, 0., 2. * knee);
          soft = (soft * soft) / (4. * knee + 1e-5);
          float weight = max(soft, lum - threshold) / max(lum, 1e-4);
          gl_FragColor = vec4(col * max(weight, 0.), 1.);
        }`
    });

    const blurMat = new T.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        texelDir: { value: new T.Vector2(1 / 200, 0) }
      },
      depthTest: false, depthWrite: false, toneMapped: false,
      vertexShader: screenVert,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform vec2 texelDir;
        void main() {
          vec3 sum = texture2D(tDiffuse, vUv).rgb * .227027;
          sum += texture2D(tDiffuse, vUv + texelDir * 1.3846).rgb * .316216;
          sum += texture2D(tDiffuse, vUv - texelDir * 1.3846).rgb * .316216;
          sum += texture2D(tDiffuse, vUv + texelDir * 3.2307).rgb * .070270;
          sum += texture2D(tDiffuse, vUv - texelDir * 3.2307).rgb * .070270;
          gl_FragColor = vec4(sum, 1.);
        }`
    });

    const compositeMat = new T.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        tBloom: { value: null },
        tAO: { value: aoB.texture },
        tDepth: { value: sceneRT.depthTexture },
        tLUT: { value: null },
        aoIntensity: { value: .8 },
        lutIntensity: { value: 0 },
        aoResolution: { value: new T.Vector2(400,300) },
        projectionInverse: { value: new T.Matrix4() },
        cameraWorld: { value: new T.Matrix4() },
        fogColor: { value: new T.Color() },
        fogDensity: { value: 0 },
        fogHeight: { value: 1.5 },
        fogFalloff: { value: .14 },
        bloomIntensity: { value: .18 },
        exposure: { value: 1.10 },
        sunScreen: { value: new T.Vector2(.5, .7) },
        sunScatter: { value: 0 },
        sunTint: { value: new T.Color("#ffd59c") },
        vignette: { value: .08 }
      },
      depthTest: false, depthWrite: false, toneMapped: false,
      vertexShader: screenVert,
      fragmentShader: `
        varying vec2 vUv;
        uniform sampler2D tDiffuse, tBloom, tAO, tDepth, tLUT;
        uniform float bloomIntensity, exposure, sunScatter, vignette;
        uniform float aoIntensity, lutIntensity, fogDensity, fogHeight, fogFalloff;
        uniform mat4 projectionInverse, cameraWorld;
        uniform vec3 fogColor;
        uniform vec2 aoResolution;
        uniform vec2 sunScreen;
        uniform vec3 sunTint;
        vec3 acesFilmic(vec3 x) {
          const float a = 2.51;
          const float b = 0.03;
          const float c = 2.43;
          const float d = 0.59;
          const float e = 0.14;
          return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0., 1.);
        }
        // Henyey-Greenstein phase function for Levant atmospheric dust (g ≈ 0.65)
        float hgPhase(float cosTheta, float g) {
          float g2 = g * g;
          return (1.0 - g2) / (4.0 * 3.14159265 * pow(max(1e-4, 1.0 + g2 - 2.0 * g * cosTheta), 1.5));
        }
        vec3 viewPosition(vec2 uv, float d) {
          vec4 v=projectionInverse*vec4(vec3(uv,d)*2.-1.,1.);
          return v.xyz/v.w;
        }
        // Bilateral upsampling prevents half-resolution AO leaking over silhouettes.
        float contactAO(float depth) {
          vec2 pixel=vUv*aoResolution-.5;
          vec2 base=floor(pixel), f=fract(pixel);
          float centerZ=viewPosition(vUv,depth).z;
          float sum=0., weights=0.;
          for(int y=0;y<2;y++)for(int x=0;x<2;x++) {
            vec2 corner=vec2(float(x),float(y));
            vec2 uv=clamp((base+corner+.5)/aoResolution,vec2(0.),vec2(1.));
            float z=viewPosition(uv,texture2D(tDepth,uv).r).z;
            vec2 bilinear=mix(1.-f,f,corner);
            float w=bilinear.x*bilinear.y*exp(-abs(z-centerZ)*12.);
            sum+=texture2D(tAO,uv).r*w;weights+=w;
          }
          return weights>.00001 ? sum/weights : 1.;
        }
        vec3 grade(vec3 color) {
          vec3 c=clamp(color,0.,1.)*15.;
          float low=floor(c.b), high=min(low+1.,15.);
          vec2 uv=vec2((low*16.+c.r+.5)/256.,(c.g+.5)/16.);
          vec2 uv2=vec2((high*16.+c.r+.5)/256.,uv.y);
          return mix(texture2D(tLUT,uv).rgb,texture2D(tLUT,uv2).rgb,fract(c.b));
        }
        void main() {
          vec3 hdr = texture2D(tDiffuse, vUv).rgb;
          float depth = texture2D(tDepth,vUv).r;
          if(aoIntensity>.001 && depth<.999999)hdr*=mix(1.,contactAO(depth),aoIntensity);
          vec3 bloom = texture2D(tBloom, vUv).rgb;
          vec3 col = hdr + bloom * bloomIntensity;
          if(fogDensity>0. && depth<.999999) {
            vec3 viewPos=viewPosition(vUv,depth);
            vec3 worldPos=(cameraWorld*vec4(viewPos,1.)).xyz;
            vec3 eye=cameraWorld[3].xyz;
            float dy=(worldPos.y-eye.y)*fogFalloff;
            // Analytic integral through exponential height density; stable at a level ray.
            float integral=abs(dy)<.001 ? 1.-dy*.5 : (1.-exp(clamp(-dy,-30.,30.)))/dy;
            float opticalDepth=fogDensity*length(viewPos)*exp(clamp(-(eye.y-fogHeight)*fogFalloff,-10.,10.))*integral;
            col=mix(col,fogColor,clamp(1.-exp(-max(0.,opticalDepth)),0.,.94));
          }
          if (sunScatter > .001) {
            vec2 sunOffset = (vUv - sunScreen) * vec2(1.35, 1.0);
            float d = length(sunOffset);
            float cosTheta = clamp(1.0 - d * 0.9, -1.0, 1.0);
            float dustHG = hgPhase(cosTheta, 0.65) * 12.5;
            float shaft = exp(-d * 3.2) * dustHG * sunScatter;
            col += sunTint * shaft;
          }
          col *= exposure;
          col = acesFilmic(col);
          if(lutIntensity>.001)col=mix(col,grade(col),lutIntensity);
          vec2 vc = vUv - .5;
          col *= 1. - dot(vc, vc) * vignette;
          // Blue-noise style interleaved gradient dither removes 8-bit banding
          float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715))));
          col += (dither - .5) / 255.;
          gl_FragColor = vec4(col, 1.);
          #include <colorspace_fragment>
        }`
    });

    const postScene = new T.Scene();
    const postQuad = new T.Mesh(quadGeo, brightMat);
    postQuad.frustumCulled = false;
    postScene.add(postQuad);

    const sunVec = new T.Vector3();
    const camDir = new T.Vector3();
    const savedClearColor = new T.Color();
    const beforeHooks = [];
    const diagnostics = {enabled:true,msaaSamples:sceneRT.samples,gtao:false,aoSize:[400,300],scene:null,fallback:null};

    function setSize(w, h, pr = 1) {
      width = Math.max(2, Math.floor(w * pr));
      height = Math.max(2, Math.floor(h * pr));
      sceneRT.setSize(width, height);
      framebufferChecked = false;
      const aw=Math.max(2,Math.ceil(width*.5)), ah=Math.max(2,Math.ceil(height*.5));
      aoA.setSize(aw,ah);aoB.setSize(aw,ah);
      aoMat.uniforms.resolution.value.set(aw,ah);
      denoiseMat.uniforms.resolution.value.set(aw,ah);
      compositeMat.uniforms.aoResolution.value.set(aw,ah);
      diagnostics.aoSize=[aw,ah];
      const bw = Math.max(64, width >> 2);
      const bh = Math.max(48, height >> 2);
      bloomA.setSize(bw, bh);
      bloomB.setSize(bw, bh);
    }

    function setQuality(q) {
      mode = q || "ultra";
      brightMat.uniforms.threshold.value = mode === "ultra" ? 1.18 : 1.28;
      brightMat.uniforms.knee.value = .22;
      compositeMat.uniforms.bloomIntensity.value = mode === "ultra" ? .18 : .12;
      compositeMat.uniforms.vignette.value = mode === "ultra" ? .08 : .05;
      const samples=isSoftware?12:(mode==='ultra'?24:12);
      if(aoMat.defines.SAMPLES!==samples){aoMat.defines.SAMPLES=samples;aoMat.needsUpdate=true;}
      compositeMat.uniforms.aoIntensity.value = mode==='balanced'?0:mode==='ultra'?.8:.65;
      if(mode==='balanced')compositeMat.uniforms.bloomIntensity.value=0;
      diagnostics.gtao=mode!=='balanced';
    }

    let exposureTime=0;const exposureDirection=new T.Vector3();
    function render(scene, camera, sun, climateNight = false) {
      scene.userData.graphicsStatus=diagnostics;
      const qExposure=scene.userData.q01Exposure,ar=scene.userData.architecture,p=camera.position;
      const inStore=qExposure&&ar&&p.x>-27.25&&p.x<-18.75&&p.z>-17.25&&p.z<-9.5&&p.y<ar.roof-.05;
      let interiorMeter=inStore?1:0;
      if(qExposure&&ar&&!inStore&&p.x>-24.25&&p.x<-21.75&&p.z>-9.5&&p.z<-6.3&&p.y<ar.roof-.05){camera.getWorldDirection(exposureDirection);interiorMeter=Math.max(0,Math.min(1,(-6.3-p.z)/1.8))*Math.max(0,Math.min(1,(-exposureDirection.z-.25)/.55));}
      const targetExposure=qExposure?qExposure.outside+((scene.userData.q01?.lighting==='evening'?qExposure.insideEvening:qExposure.insideDay)-qExposure.outside)*interiorMeter:1.10;
      const now=performance.now(),exposureDelta=Math.min(.1,Math.max(0,(now-exposureTime)/1000));exposureTime=now;
      if(!qExposure)compositeMat.uniforms.exposure.value=1.10;else compositeMat.uniforms.exposure.value+=(targetExposure-compositeMat.uniforms.exposure.value)*(1-Math.exp(-exposureDelta*3.5));
      if (!enabled) {
        const savedExposure=renderer.toneMappingExposure;renderer.toneMappingExposure=savedExposure*(qExposure?compositeMat.uniforms.exposure.value/1.10:1);
        try{for (const hook of beforeHooks) hook(renderer, scene, camera);renderer.render(scene, camera);}finally{renderer.toneMappingExposure=savedExposure;}
        return;
      }
      const prevTone = renderer.toneMapping;
      const prevTarget = renderer.getRenderTarget();
      const oldDensity = scene.fog?.isFogExp2 ? scene.fog.density : null;
      const clearAlpha=renderer.getClearAlpha();
      renderer.getClearColor(savedClearColor);
      renderer.toneMapping = T.NoToneMapping ?? 0;
      try {
        if(oldDensity!==null)scene.fog.density=0; // Height fog is integrated once, in linear HDR.
        for (const hook of beforeHooks) hook(renderer, scene, camera);
        renderer.setRenderTarget(sceneRT);
        renderer.clear(true, true, true);
        renderer.render(scene, camera);
        // Budget instrumentation: the scene pass includes the shadow pass, so the
        // counters are captured before the post chain resets renderer.info.
        diagnostics.calls=renderer.info.render.calls;
        diagnostics.triangles=renderer.info.render.triangles;
        diagnostics.programs=renderer.info.programs?.length ?? null;
        diagnostics.textures=renderer.info.memory.textures;
        diagnostics.geometries=renderer.info.memory.geometries;
        if(oldDensity!==null)scene.fog.density=oldDensity;
        if (!framebufferChecked) {
          if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('Incomplete HDR framebuffer');
          framebufferChecked=true;
        }
        // The target switch resolves the multisampled color AND depth attachments.
        if(mode!=='balanced') {
          for(const material of [aoMat,denoiseMat])material.uniforms.cameraProjectionMatrixInverse.value.copy(camera.projectionMatrixInverse);
          aoMat.uniforms.cameraProjectionMatrix.value.copy(camera.projectionMatrix);
          aoMat.uniforms.cameraWorldMatrix.value.copy(camera.matrixWorld);
          aoMat.uniforms.cameraNear.value=camera.near;aoMat.uniforms.cameraFar.value=camera.far;
          renderer.setClearColor(0xffffff,1);
          postQuad.material=aoMat;renderer.setRenderTarget(aoA);renderer.clear();renderer.render(postScene,postCam);
          postQuad.material=denoiseMat;renderer.setRenderTarget(aoB);renderer.clear();renderer.render(postScene,postCam);
          renderer.setClearColor(savedClearColor,clearAlpha);
        }
        // Bright pass -> bloomA
        if(mode!=='balanced') {
        postQuad.material = brightMat;
        brightMat.uniforms.tDiffuse.value = sceneRT.texture;
        renderer.setRenderTarget(bloomA);
        renderer.render(postScene, postCam);

        // Separable blur passes
        const passes = !isSoftware && mode === "ultra" ? 2 : 1;
        postQuad.material = blurMat;
        const dx = 1 / Math.max(1, bloomA.width);
        const dy = 1 / Math.max(1, bloomA.height);
        for (let p = 0; p < passes; p++) {
          const step = 1 + p * .85;
          blurMat.uniforms.tDiffuse.value = bloomA.texture;
          blurMat.uniforms.texelDir.value.set(dx * step, 0);
          renderer.setRenderTarget(bloomB);
          renderer.render(postScene, postCam);

          blurMat.uniforms.tDiffuse.value = bloomB.texture;
          blurMat.uniforms.texelDir.value.set(0, dy * step);
          renderer.setRenderTarget(bloomA);
          renderer.render(postScene, postCam);
        }
        }

        // Screen sun scatter factor
        let scatter = 0;
        if (mode === "ultra" && sun && !climateNight) {
          sunVec.copy(sun.position).sub(sun.target.position).normalize();
          camera.getWorldDirection(camDir);
          const facing = Math.max(0, camDir.dot(sunVec));
          if (facing > .12) {
            sunVec.multiplyScalar(80).add(camera.position).project(camera);
            compositeMat.uniforms.sunScreen.value.set(sunVec.x * .5 + .5, sunVec.y * .5 + .5);
            scatter = Math.pow(facing, 3.5) * .08;
          }
        }
        compositeMat.uniforms.sunScatter.value = scatter;
        if (sun) compositeMat.uniforms.sunTint.value.copy(sun.color);
        const profile=scene.userData.graphics;
        diagnostics.scene=profile?.key??null;
        compositeMat.uniforms.lutIntensity.value=profile?1:0;
        if(profile) {
          compositeMat.uniforms.tLUT.value=profile.lut;
          compositeMat.uniforms.fogColor.value.copy(profile.fogColor);
          compositeMat.uniforms.fogDensity.value=profile.fogDensity;
          compositeMat.uniforms.fogHeight.value=profile.fogHeight;
          compositeMat.uniforms.fogFalloff.value=profile.fogFalloff;
        }else compositeMat.uniforms.fogDensity.value=0;
        compositeMat.uniforms.projectionInverse.value.copy(camera.projectionMatrixInverse);
        compositeMat.uniforms.cameraWorld.value.copy(camera.matrixWorld);

        postQuad.material = compositeMat;
        compositeMat.uniforms.tDiffuse.value = sceneRT.texture;
        compositeMat.uniforms.tBloom.value = bloomA.texture;
        renderer.setRenderTarget(prevTarget);
        renderer.render(postScene, postCam);
      } catch(error) {
        enabled = false;
        diagnostics.enabled=false;diagnostics.fallback=error.message;
        console.warn('Witness postprocessing disabled:',error);
        if(oldDensity!==null)scene.fog.density=oldDensity;
        renderer.setClearColor(savedClearColor,clearAlpha);
        renderer.setRenderTarget(prevTarget);
        renderer.toneMapping = prevTone;
        renderer.render(scene, camera);
        return;
      }
      renderer.toneMapping = prevTone;
    }

    function dispose() {
      if (currentPipeline === api) currentPipeline = null;
      sceneRT.dispose();
      aoA.dispose();aoB.dispose();noiseTexture.dispose();aoMat.dispose();denoiseMat.dispose();
      bloomA.dispose();
      bloomB.dispose();
      quadGeo.dispose();
      brightMat.dispose();
      blurMat.dispose();
      compositeMat.dispose();
    }

    setQuality(quality);
    const api = {
      setSize, setQuality, render, dispose, diagnostics, renderer, isSoftware,
      get quality() { return mode; },
      addBeforeRender(fn) {
        beforeHooks.push(fn);
        return () => { const i = beforeHooks.indexOf(fn); if (i >= 0) beforeHooks.splice(i, 1); };
      }
    };
    currentPipeline = api;
    return api;
  }

  globalThis.AdventureVisuals = {
    atmosphere, sunDirection, light, environment, sky, ridges, surface,
    rocks, treeTrunk, canopy, grass, vegetation, water, tent, accessory,
    createPipeline, getRenderer: () => currentPipeline?.renderer ?? null,
    isSoftware: () => !!currentPipeline?.isSoftware,
    windUniforms, windGLSL
  };
})();
