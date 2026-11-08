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
  }

  const envCache = new WeakMap();

  function environment(T, renderer, scene, biome) {
    if (!T.PMREMGenerator || !renderer) return null;
    let map = envCache.get(renderer);
    if (!map) {
      map = new Map();
      envCache.set(renderer, map);
    }
    if (map.has(biome)) {
      const tex = map.get(biome);
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
      map.set(biome, rt.texture);
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
      float macro = fbmNoise(p * .22);
      float damp = 1. - smoothstep(-.25, .45, vSurface.y);
      float surfRelief = macro * .45;
      diffuseColor.rgb *= mix(.82, 1.14, macro);
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * .72, damp * .35);`,
    stone: `
      vec2 p = vSurface.xz + vec2(vSurface.y * .73, vSurface.y * 1.48);
      float strata = fbmNoise(p * 1.8);
      float groundAO = smoothstep(-.05, .42, vSurface.y);
      float surfRelief = strata * .60;
      diffuseColor.rgb *= mix(.82, 1.15, strata);
      diffuseColor.rgb *= mix(.82, 1., groundAO);`,
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
      float aoBase = smoothstep(0., .58, vSurface.y);
      float surfRelief = (1. - mortar) * (.50 + chisel * .50);
      diffuseColor.rgb *= mix(.82 + chisel * .18 + blockVar * .14, .64 + chisel * .12, mortar * .65);
      diffuseColor.rgb *= mix(.82, 1., aoBase);`,
    bark: `
      vec2 p = vec2(vSurface.x + vSurface.z * 1.35, vSurface.y);
      float furrows = fbmNoise(p * vec2(16., 1.8));
      float rings = grainNoise(p * vec2(8., 4.5));
      float surfRelief = furrows * .70 + rings * .30;
      diffuseColor.rgb *= mix(.72, 1.18, furrows);`,
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
      vec3 cV = normalize(vEyeDir);
      float cRim = 1. - max(0., dot(normal, cV));
      diffuseColor.rgb += diffuseColor.rgb * pow(cRim, 3.2) * .12;`,
    wool: `
      vec3 wV = normalize(vEyeDir);
      float wRim = 1. - max(0., dot(normal, wV));
      diffuseColor.rgb += vec3(.14, .13, .11) * pow(wRim, 2.6) * .20;`,
    skin: `
      vec3 sV = normalize(vEyeDir);
      float sRim = 1. - max(0., dot(normal, sV));
      diffuseColor.rgb += vec3(.18, .08, .04) * pow(sRim, 2.4) * .28;`
  };

  const bumpStrength = {
    earth: .006, stone: .012, masonry: .016, bark: .018, wood: .006, terracotta: .006, bronze: .006, linen: .002, wool: .003, skin: 0.0
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
    const geometry = new T.CylinderGeometry(.27, .60, 1, 12, 8);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const angle = Math.atan2(z, x);
      const rootFlare = y < -.2 ? Math.pow((-.2 - y) / .3, 1.5) * (.18 + .14 * Math.cos(angle * 4)) : 0;
      const twist = Math.sin(y * 3.9 + x * 6.1 + z * 5.2) * .11;
      points.setXYZ(i, x * (1 + rootFlare) + twist + (y + .5) * .48, y, z * (1 + rootFlare) - y * .22);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  function canopy(T, seed) {
    const random = randomFrom(seed);
    const vertices = [];
    const colors = [];
    const indices = [];
    const count = 216;
    for (let i = 0; i < count; i++) {
      const angle = i * 2.39996;
      const latitude = 2 * (i + .5) / count - 1;
      const radius = Math.sqrt(1 - latitude * latitude) * (.48 + random() * .48);
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = latitude * (.55 + random() * .43);
      const ao = .42 + (latitude + 1) * .20 + radius * .18;
      const shade = ao + random() * .26;
      for (let leaf = 0; leaf < 2; leaf++) {
        const direction = angle + leaf * 1.58 + random() * .5;
        const length = .065 + random() * .155;
        const dx = Math.cos(direction) * length, dz = Math.sin(direction) * length;
        const bend = random() * .30 - .15;
        const start = vertices.length / 3;
        vertices.push(x - dx, y - bend, z - dz, x + dz * .34, y, z - dx * .34,
          x + dx, y + bend, z + dz, x - dz * .34, y, z + dx * .34, x, y + .028, z);
        for (let vertex = 0; vertex < 5; vertex++) colors.push(shade * .89, shade, shade * .78);
        indices.push(start, start + 1, start + 4, start + 1, start + 2, start + 4,
          start + 2, start + 3, start + 4, start + 3, start, start + 4);
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function grass(T, dry) {
    const random = randomFrom(dry ? 1041 : 3407);
    const vertices = [];
    const colors = [];
    const indices = [];
    for (let blade = 0; blade < 12; blade++) {
      const direction = blade * 2.39996;
      const lean = .24 + random() * .96;
      const height = .34 + random() * .70;
      const width = .052 + random() * (dry ? .032 : .085);
      const baseX = Math.cos(direction) * .33;
      const baseZ = Math.sin(direction) * .33;
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
        for (let side = 0; side < 2; side++) colors.push(green * (dry ? 1.15 : .88), green, green * .76);
        if (step) {
          const base = index + step * 2 - 2;
          indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }

  function vegetation(T, color, blades) {
    const time = { value: 0 };
    const material = new T.MeshStandardMaterial({
      color, vertexColors: true, side: T.DoubleSide, roughness: blades ? .90 : .86
    });
    material.customProgramCacheKey = () => blades ? "journey-grass-2" : "journey-canopy-2";
    material.onBeforeCompile = shader => {
      shader.uniforms.windTime = time;
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float windTime;")
        .replace("#include <begin_vertex>", `
          #include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 base = instanceMatrix[3].xyz;
            float breeze = sin(windTime * 1.55 + base.x * .31 + base.z * .20);
            float gust = sin(windTime * .72 + base.z * .37 - base.x * .14);
            float flex = ${blades ? "position.y * position.y * .42" : "(position.y + 1.) * .048"};
            transformed.x += (breeze * .62 + gust * .38) * flex;
            transformed.z += breeze * flex * .32;
          #endif`);
    };
    return { material, animate: elapsed => { time.value = elapsed; } };
  }

  function water(T, color, width, length, night, biome, opts = {}) {
    const climate = atmosphere(biome);
    const time = { value: 0 };
    const foamEdge = opts.foamEdge ?? .09;
    const waveScale = opts.waveScale ?? .055;
    const segW = Math.max(16, Math.min(64, Math.round(width * 1.2)));
    const segL = Math.max(16, Math.min(64, Math.round(length * 1.2)));
    const material = new T.ShaderMaterial({
      uniforms: {
        waterColor: { value: new T.Color(color).multiplyScalar(night ? .34 : .64) },
        shallowColor: { value: new T.Color(color).lerp(new T.Color(night ? "#365f66" : "#67aba3"), .52) },
        skyColor: { value: new T.Color(climate.sky) },
        horizonColor: { value: new T.Color(climate.haze) },
        sunlight: { value: new T.Color(climate.light) },
        sun: { value: sunDirection(T, climate) },
        fogColor: { value: new T.Color(climate.haze) },
        foamEdge: { value: foamEdge },
        waveScale: { value: waveScale },
        time
      },
      vertexShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        uniform float time, waveScale, foamEdge;
        void main() {
          vUv = uv;
          vec3 pos = position;
          float shoreDamp = smoothstep(0., max(.08, foamEdge * 1.6), uv.x);
          vec3 wPos = (modelMatrix * vec4(pos, 1.)).xyz;
          float swell = (sin(wPos.x * .9 + time * 1.4) + cos(wPos.z * .75 - time * 1.15)) * .5;
          pos.z += swell * waveScale * shoreDamp;
          vWater = (modelMatrix * vec4(pos, 1.)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWater, 1.);
        }`,
      fragmentShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        uniform vec3 waterColor, shallowColor, skyColor, horizonColor, sunlight, sun, fogColor;
        uniform float time, foamEdge;
        ${noise}
        void main() {
          vec2 point = vWater.xz;
          float a = point.x * 2.5 + point.y * .92 - time * 1.75;
          float b = point.x * -.78 + point.y * 4.3 + time * 1.92;
          float c = point.x * 8.4 + point.y * 5.2 - time * 2.75;
          float d = fbmNoise(point * 1.35 + vec2(time * .18, -time * .14));
          vec3 normal = normalize(vec3(
            .082 * cos(a) + .034 * cos(b) + .024 * cos(c) + (d - .5) * .12,
            1.,
            .068 * cos(b) + .038 * cos(a) + .022 * cos(c) + (d - .5) * .12
          ));
          vec3 view = normalize(cameraPosition - vWater);
          float facing = max(.001, dot(view, normal));
          float fresnel = .02 + .98 * pow(1. - facing, 4.2);
          float shallows = 1. - smoothstep(0., .24, vUv.x);
          // Beer-Lambert color + subsurface turquoise glow
          float caustic = smoothstep(.52, .88, grainNoise(point * 2.8 + vec2(time * .36, -time * .24)));
          vec3 body = mix(waterColor, shallowColor * (1. + caustic * .24), shallows * .82);
          float sss = pow(max(0., dot(view, -sun + normal * .35)), 3.0) * .25;
          body += shallowColor * sss;
          // Environment sky gradient reflection
          vec3 reflDir = reflect(-view, normal);
          vec3 reflSky = mix(horizonColor, skyColor, smoothstep(0., .52, max(0., reflDir.y)));
          vec3 color = mix(body, reflSky, clamp(.10 + fresnel * .78, 0., .92));
          // Crisp dual-lobe solar specular path
          vec3 halfV = normalize(sun + view);
          float specTight = pow(max(0., dot(normal, halfV)), 260.);
          float specSoft = pow(max(0., dot(normal, halfV)), 32.);
          color += sunlight * (specTight * 1.45 + specSoft * .22);
          // Animated shoreline foam
          if (foamEdge > .001) {
            float lap = .5 + .5 * sin(time * 2.1 - vUv.x * 38. + point.y * 1.3);
            float foamNoise = grainNoise(point * 5.5 - vec2(time * .35, time * .2));
            float foam = smoothstep(foamEdge, 0., vUv.x) * smoothstep(.34, .76, foamNoise + lap * .35);
            color = mix(color, mix(horizonColor, vec3(.96), .7), clamp(foam * .85, 0., 1.));
          }
          float depth = length(cameraPosition - vWater) * .0055;
          gl_FragColor = vec4(mix(color, fogColor, 1. - exp(-depth * depth)), 1.);
          #include <colorspace_fragment>
        }`
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(width, length, segW, segL), material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    return { water: mesh, animate: elapsed => { time.value = elapsed; } };
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
        uniform sampler2D tDiffuse, tBloom;
        uniform float bloomIntensity, exposure, sunScatter, vignette;
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
        void main() {
          vec3 hdr = texture2D(tDiffuse, vUv).rgb;
          vec3 bloom = texture2D(tBloom, vUv).rgb;
          vec3 col = hdr + bloom * bloomIntensity;
          if (sunScatter > .001) {
            float d = length((vUv - sunScreen) * vec2(1.4, 1.));
            float shaft = exp(-d * 3.6) * sunScatter;
            col += sunTint * shaft;
          }
          col *= exposure;
          col = acesFilmic(col);
          // Crisp contrast and vivid Mediterranean vibrance
          float lum = dot(col, vec3(.2126, .7152, .0722));
          col = mix(vec3(lum), col, 1.14);
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

    function setSize(w, h, pr = 1) {
      width = Math.max(2, Math.floor(w * pr));
      height = Math.max(2, Math.floor(h * pr));
      sceneRT.setSize(width, height);
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
    }

    function render(scene, camera, sun, climateNight = false) {
      if (!enabled || mode === "balanced") {
        renderer.render(scene, camera);
        return;
      }
      const prevTone = renderer.toneMapping;
      renderer.toneMapping = T.NoToneMapping ?? 0;
      try {
        renderer.setRenderTarget(sceneRT);
        renderer.clear(true, true, true);
        renderer.render(scene, camera);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
          enabled = false;
          renderer.setRenderTarget(null);
          renderer.toneMapping = prevTone;
          renderer.render(scene, camera);
          return;
        }
        // Bright pass -> bloomA
        postQuad.material = brightMat;
        brightMat.uniforms.tDiffuse.value = sceneRT.texture;
        renderer.setRenderTarget(bloomA);
        renderer.render(postScene, postCam);

        // Separable blur passes
        const passes = mode === "ultra" ? 2 : 1;
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

        postQuad.material = compositeMat;
        compositeMat.uniforms.tDiffuse.value = sceneRT.texture;
        compositeMat.uniforms.tBloom.value = bloomA.texture;
        renderer.setRenderTarget(null);
        renderer.render(postScene, postCam);
      } catch {
        enabled = false;
        renderer.setRenderTarget(null);
        renderer.toneMapping = prevTone;
        renderer.render(scene, camera);
        return;
      }
      renderer.toneMapping = prevTone;
    }

    function dispose() {
      sceneRT.dispose();
      bloomA.dispose();
      bloomB.dispose();
      quadGeo.dispose();
      brightMat.dispose();
      blurMat.dispose();
      compositeMat.dispose();
    }

    setQuality(quality);
    return { setSize, setQuality, render, dispose };
  }

  globalThis.AdventureVisuals = {
    atmosphere, sunDirection, light, environment, sky, ridges, surface,
    rocks, treeTrunk, canopy, grass, vegetation, water, tent, accessory,
    createPipeline
  };
})();
