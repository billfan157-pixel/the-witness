(() => {
  "use strict";

  const atmospheres = {
    lands:     { time: "Cuối chiều", elevation: 15, azimuth: -.53, sky: "#617e9c", haze: "#edbc8b", light: "#ffdaaa", clouds: .47 },
    desert:    { time: "Nắng sớm", elevation: 28, azimuth: -.69, sky: "#7696b7", haze: "#edc4a0", light: "#ffe4bf", clouds: .68 },
    courtyard: { time: "Xế trưa", elevation: 48, azimuth: -.58, sky: "#6f97b3", haze: "#e9d1ac", light: "#fff0d1", clouds: .58 },
    spring:    { time: "Giữa ngày", elevation: 53, azimuth: -.45, sky: "#5898b4", haze: "#dbe0bb", light: "#fff2cf", clouds: .57 },
    field:     { time: "Đêm", elevation: 29, azimuth: -.46, sky: "#142340", haze: "#6c8090", light: "#c5d9fb", clouds: .58, night: true },
    shore:     { time: "Sáng ven hồ", elevation: 30, azimuth: .54, sky: "#5589af", haze: "#c5d6d4", light: "#ffebcd", clouds: .54 },
    hill:      { time: "Nắng sườn núi", elevation: 42, azimuth: -.72, sky: "#6299bd", haze: "#ccd9cc", light: "#fff0d2", clouds: .50 },
    road:      { time: "Cuối chiều", elevation: 20, azimuth: -.71, sky: "#758fa3", haze: "#e7be96", light: "#ffd9ab", clouds: .55 },
    room:      { time: "Buổi tối", elevation: 32, azimuth: -.40, sky: "#17243a", haze: "#636574", light: "#c4d4ed", clouds: .62, night: true },
    olive:     { time: "Canh đêm", elevation: 23, azimuth: .56, sky: "#14253d", haze: "#687d91", light: "#c1d4f0", clouds: .55, night: true },
    ridge:     { time: "Trời âm u", elevation: 27, azimuth: -.63, sky: "#626e80", haze: "#bdb3aa", light: "#e2d2bd", clouds: .32 },
    dawn:      { time: "Rạng đông", elevation: 9, azimuth: .45, sky: "#657f9d", haze: "#edc7a4", light: "#ffdbb1", clouds: .53 },
    evening:   { time: "Chạng vạng", elevation: 11, azimuth: -.53, sky: "#677990", haze: "#efb78d", light: "#ffd6a4", clouds: .45 }
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
      return mix(mix(grainHash(cell), grainHash(cell + vec2(1, 0)), blend.x),
                 mix(grainHash(cell + vec2(0, 1)), grainHash(cell + 1.), blend.x), blend.y);
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
    scene.fog = new T.FogExp2(climate.haze, climate.night ? .019 : biome === "lands" ? .012 : .014);
    sun.color.set(climate.light);
    sun.position.copy(sun.target.position).addScaledVector(direction, 64);
    sun.intensity = climate.night ? (biome === "room" ? .75 : 1.15) : biome === "ridge" ? 1.75 : 2.55;
    ambient.color.set(climate.night ? "#a2b5dc" : "#d2ddf0");
    ambient.groundColor.set(climate.night ? "#48483e" : "#8b735c");
    ambient.intensity = climate.night ? 1.27 : 1.38;
    fill.color.set(climate.night ? "#a3b8eb" : "#dee9f3");
    fill.intensity = climate.night ? .24 : .42;
    fill.position.set(23, 13, 17);
  }

  function sky(T, scene, biome) {
    const climate = atmosphere(biome);
    const material = new T.ShaderMaterial({
      uniforms: {
        zenith: { value: new T.Color(climate.sky) },
        horizon: { value: new T.Color(climate.haze) },
        sunlight: { value: new T.Color(climate.light) },
        sun: { value: sunDirection(T, climate) },
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
          vec3 color = mix(horizon, zenith, smoothstep(-.06, .66, direction.y));
          float scatter = pow(facing, 6.) * exp(-altitude * 1.6);
          color = mix(color, sunlight, scatter * mix(.40, .08, dark));
          float disc = smoothstep(.99969, .99986, facing);
          color += sunlight * (disc * mix(.85, .46, dark) + pow(facing, 105.) * mix(.27, .12, dark));
          vec2 skyPoint = direction.xz * 4.7 / (altitude + .22);
          skyPoint.x += time * .016;
          float clouds = grainNoise(skyPoint) * .58 + grainNoise(skyPoint * 2.13) * .27 +
            grainNoise(skyPoint * 4.7) * .10 + grainNoise(skyPoint * 10.4) * .05;
          float cloudOpacity = smoothstep(cover - .06, cover + .23, clouds) *
            smoothstep(.006, .16, altitude);
          vec3 cloudLight = mix(vec3(.48, .49, .55), sunlight, .22 + .48 * scatter);
          cloudLight = mix(cloudLight, color * .70, dark * .92);
          if (dark > .5) {
            vec2 grid = direction.xz * 183. / (1. + altitude);
            float star = step(.987, grainHash(floor(grid))) * (1. - smoothstep(.03, .16, length(fract(grid) - .5)));
            color += vec3(.52, .64, .87) * star * smoothstep(.05, .25, altitude);
          }
          color = mix(color, cloudLight, cloudOpacity * mix(.86, .47, dark));
          gl_FragColor = vec4(color, 1.);
          #include <colorspace_fragment>
        }`
    });
    const dome = new T.Mesh(new T.SphereGeometry(128, 36, 20), material);
    dome.renderOrder = -10;
    scene.add(dome);
    return time => { material.uniforms.time.value = time; };
  }

  function ridges(T, scene, biome, seed) {
    const climate = atmosphere(biome);
    const random = randomFrom(seed);
    const steps = 144;
    const layers = biome === "room" ? 2 : 3;
    const haze = new T.Color(climate.haze);
    for (let layer = layers - 1; layer >= 0; layer--) {
      const radius = 62 + layer * 18;
      const phase = random() * Math.PI * 2;
      const tint = haze.clone().lerp(new T.Color(climate.night ? "#27364c" : "#766458"), .49 - layer * .12);
      const geometry = new T.BufferGeometry();
      const vertices = [];
      const colors = [];
      const indices = [];
      for (let step = 0; step <= steps; step++) {
        const angle = step / steps * Math.PI * 2;
        const wave = Math.sin(angle * 3 + phase) * 2 + Math.sin(angle * 7 - phase * 2) * 1.7 +
          Math.sin(angle * 15 + phase) * 1.4 + Math.sin(angle * 23 - phase * 2) * .64;
        const relief = Math.max(0, Math.sin(angle * 2 - phase)) * (layer * 1.5 + 3.4);
        const peak = (biome === "desert" || biome === "hill" ? 4.8 : 2.1) +
          layer * 1.3 + wave + relief + Math.sin(angle * 19 + phase) * .44;
        const x = Math.sin(angle) * radius;
        const z = Math.cos(angle) * radius;
        vertices.push(x, -9, z, x, peak, z);
        const base = tint.clone().lerp(haze, .45);
        const crest = tint.clone().multiplyScalar(.87 + .10 * Math.sin(angle * 5 + phase));
        colors.push(base.r, base.g, base.b, crest.r, crest.g, crest.b);
        if (step < steps) indices.push(step * 2, step * 2 + 2, step * 2 + 1, step * 2 + 1, step * 2 + 2, step * 2 + 3);
      }
      geometry.setAttribute("position", new T.Float32BufferAttribute(vertices, 3));
      geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
      scene.add(new T.Mesh(geometry, new T.MeshBasicMaterial({
        vertexColors: true, fog: false, side: T.DoubleSide, toneMapped: false
      })));
    }
  }

  const surfaceColor = {
    earth: `
      vec2 p = vSurface.xz;
      float earthTone = grainNoise(p * .39) * .54 + grainNoise(p * 2.4) * .30 + grainNoise(p * 19.) * .16;
      float grit = smoothstep(.61, .83, grainNoise(p * 45.));
      diffuseColor.rgb *= mix(.68, 1.19, earthTone) + grit * .15;`,
    stone: `
      vec2 p = vSurface.xz + vec2(vSurface.y * .73, vSurface.y * 1.48);
      float strata = grainNoise(p * 2.8) * .62 + grainNoise(p * 13.) * .38;
      diffuseColor.rgb *= mix(.73, 1.22, strata);`,
    masonry: `
      vec3 n = abs(normalize(cross(dFdx(vSurface), dFdy(vSurface))));
      vec2 p = n.y > .65 ? vSurface.xz : vec2(n.z > n.x ? vSurface.x : vSurface.z, vSurface.y);
      vec2 block = p / vec2(.67, .29);
      block.x += floor(block.y) * .5;
      vec2 seam = abs(fract(block) - .5);
      float mortar = max(smoothstep(.468, .492, seam.x), smoothstep(.452, .492, seam.y));
      float patina = grainNoise(p * 9.) * .45 + grainHash(floor(block)) * .55;
      diffuseColor.rgb *= mix(.75 + patina * .37, .58 + patina * .19, mortar * .71);`,
    bark: `
      vec2 p = vec2(vSurface.x + vSurface.z * 1.3, vSurface.y);
      float channels = grainNoise(p * vec2(38., 2.1)) * .64 + grainNoise(p * 7.) * .36;
      diffuseColor.rgb *= mix(.63, 1.20, channels);`,
    linen: `
      float weave = sin(vSurface.x * 620. + vSurface.z * 490.) * sin(vSurface.y * 650.);
      float crossWeave = sin((vSurface.x + vSurface.y) * 440.) * .5;
      float threadNoise = grainNoise(vSurface.xz * 120. + vSurface.y * 80.);
      float folds = grainNoise(vSurface.xy * vec2(42., 12.) + vSurface.z * 8.);
      diffuseColor.rgb *= .88 + folds * .16 + (weave + crossWeave) * .035 + threadNoise * .05;
      #ifdef USE_NORMAL
        vec3 clothV = normalize(vEyeDir);
        float clothRim = 1.0 - max(0.0, dot(normalize(vNormal), clothV));
        diffuseColor.rgb += diffuseColor.rgb * pow(clothRim, 2.8) * 0.16;
      #endif`,
    wool: `
      float fibre = grainNoise(vSurface.xy * vec2(160., 110.) + vSurface.z * 50.);
      float yarn = sin(vSurface.x * 380. + vSurface.z * 320.) * sin(vSurface.y * 400.);
      float coarse = grainNoise(vSurface.xy * 24. + vSurface.z * 16.);
      diffuseColor.rgb *= .82 + fibre * .22 + yarn * .03 + coarse * .12;
      #ifdef USE_NORMAL
        vec3 woolV = normalize(vEyeDir);
        float woolRim = 1.0 - max(0.0, dot(normalize(vNormal), woolV));
        diffuseColor.rgb += vec3(0.12, 0.11, 0.09) * pow(woolRim, 2.2) * 0.32;
      #endif`,
    skin: `
      float pores = grainNoise(vSurface.xy * 260. + vSurface.z * 55.);
      float micro = grainNoise(vSurface.xy * 540. + vSurface.z * 220.);
      float tint = grainNoise(vSurface.xy * 38. + vSurface.z * 23.);
      float microCavity = mix(0.93, 1.03, pores) * mix(0.96, 1.02, micro);
      diffuseColor.rgb *= microCavity * (0.96 + tint * 0.04);
      // Relief field: pore grain crossed with fine creases. The normal pass turns
      // this into a real bump gradient so the skin catches raking light.
      vec2 skinCrease = vec2(vSurface.x * 57. + vSurface.y * 33., vSurface.y * 63. - vSurface.x * 19.);
      float crease = grainNoise(skinCrease * 1.6) * grainNoise(skinCrease * 3.4 + 17.1);
      float skinRelief = pores * .12 + crease * 1.05;
      #ifdef USE_NORMAL
        vec3 skinV = normalize(vEyeDir);
        float skinRim = 1.0 - max(0.0, dot(normalize(vNormal), skinV));
        float sssR = pow(skinRim, 1.9) * 0.44;
        float sssG = pow(skinRim, 3.1) * 0.22;
        float sssB = pow(skinRim, 4.5) * 0.11;
        vec3 bloodTone = vec3(0.96, 0.34, 0.20);
        vec3 sssSpectral = vec3(sssR, sssG, sssB) * bloodTone * 1.35;
        float sssWrap = pow(skinRim, 2.8) * 0.36;
        // Broad forward scatter for thin tissue (ear rims, nose wings, lips).
        float thinScatter = pow(skinRim, 1.25) * 0.15;
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 0.68 + bloodTone * 0.44, sssWrap) + sssSpectral;
        diffuseColor.rgb += bloodTone * thinScatter;
        diffuseColor.rgb += vec3(0.18, 0.14, 0.11) * pow(skinRim, 5.0) * 0.26;
      #endif`
  };

  // `extra` lets a material opt into engine-agnostic skin/cloth relief without
  // leaking engine specific uniforms into the shared surface table.
  function surface(material, kind, local = false, extra = null) {
    const key = kind + (local ? "-local" : "") + (extra?.key ? "-" + extra.key : "");
    if (material.userData.surface === key) return material;
    material.userData.surface = key;
    material.customProgramCacheKey = () => "journey-" + key;
    material.onBeforeCompile = shader => {
      if (extra?.uniforms) Object.assign(shader.uniforms, extra.uniforms);
      const varying = extra?.varying ? "\n" + extra.varying : "";
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vSurface;\nvarying vec3 vEyeDir;" + varying)
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
        .replace("#include <color_fragment>", "#include <color_fragment>\n" + surfaceColor[kind]);
      if (extra?.declarations) shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>\n" + extra.declarations);
      if (extra?.normal) shader.fragmentShader = shader.fragmentShader.replace("#include <normal_fragment_maps>", "#include <normal_fragment_maps>\n" + extra.normal);
      if (extra?.roughness) shader.fragmentShader = shader.fragmentShader.replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\n" + extra.roughness);
    };
    return material;
  }

  function rocks(T) {
    const geometry = new T.DodecahedronGeometry(1, 1);
    const points = geometry.attributes.position;
    const colors = [];
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const fracture = Math.sin(x * 14.4 + z * 9.) * Math.cos(y * 11.8 - z * 8.);
      const edge = 1 + .13 * fracture + .09 * Math.sin((x + y + z) * 8.);
      points.setXYZ(i, x * edge + .15 * y, Math.max(-.52, y * edge), z * edge);
      const shade = .82 + fracture * .10 + Math.max(0, y) * .13;
      colors.push(shade, shade * .97, shade * .92);
    }
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    return geometry;
  }

  function treeTrunk(T) {
    const geometry = new T.CylinderGeometry(.32, .55, 1, 9, 5);
    const points = geometry.attributes.position;
    for (let i = 0; i < points.count; i++) {
      const x = points.getX(i), y = points.getY(i), z = points.getZ(i);
      const twist = Math.sin(y * 3.7 + x * 6.3 + z * 5.2) * .12;
      points.setXYZ(i, x + twist + (y + .5) * .58, y, z - y * .26);
    }
    geometry.computeVertexNormals();
    return geometry;
  }

  function canopy(T, seed) {
    const random = randomFrom(seed);
    const vertices = [];
    const colors = [];
    const indices = [];
    // Small, crossed leaf clusters preserve holes in the silhouette and catch side light.
    for (let i = 0; i < 160; i++) {
      const angle = i * 2.39996;
      const latitude = 2 * (i + .5) / 160 - 1;
      const radius = Math.sqrt(1 - latitude * latitude) * (.50 + random() * .46);
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;
      const y = latitude * (.57 + random() * .43);
      const shade = .46 + (latitude + 1) * .15 + random() * .40;
      for (let leaf = 0; leaf < 2; leaf++) {
        const direction = angle + leaf * 1.62 + random();
        const length = .065 + random() * .15;
        const dx = Math.cos(direction) * length, dz = Math.sin(direction) * length;
        const bend = random() * .32 - .16;
        const start = vertices.length / 3;
        vertices.push(x - dx, y - bend, z - dz, x + dz * .32, y, z - dx * .32,
          x + dx, y + bend, z + dz, x - dz * .32, y, z + dx * .32, x, y + .025, z);
        for (let vertex = 0; vertex < 5; vertex++) colors.push(shade * .88, shade, shade * .79);
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
    for (let blade = 0; blade < 8; blade++) {
      const direction = blade * 2.39996;
      const lean = .25 + random() * .94;
      const height = .36 + random() * .68;
      const width = .06 + random() * (dry ? .035 : .10);
      const baseX = Math.cos(direction) * .31;
      const baseZ = Math.sin(direction) * .31;
      const index = vertices.length / 3;
      for (let step = 0; step < 4; step++) {
        const fraction = step / 3;
        const bend = fraction * fraction * lean;
        const half = width * (1 - fraction);
        const green = .40 + .65 * fraction;
        const x = baseX + Math.cos(direction) * bend;
        const z = baseZ + Math.sin(direction) * bend;
        vertices.push(x - Math.sin(direction) * half, height * fraction, z + Math.cos(direction) * half,
          x + Math.sin(direction) * half, height * fraction, z - Math.cos(direction) * half);
        for (let side = 0; side < 2; side++) colors.push(green * (dry ? 1.12 : .89), green, green * .77);
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
      color, vertexColors: true, side: T.DoubleSide, roughness: .98
    });
    material.customProgramCacheKey = () => blades ? "journey-grass" : "journey-canopy";
    material.onBeforeCompile = shader => {
      shader.uniforms.windTime = time;
      shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float windTime;")
        .replace("#include <begin_vertex>", `
          #include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 base = instanceMatrix[3].xyz;
            float breeze = sin(windTime * 1.5 + base.x * .31 + base.z * .20);
            float gust = sin(windTime * .64 + base.z * .37);
            float flex = ${blades ? "position.y * position.y * .39" : "(position.y + 1.) * .047"};
            transformed.x += (breeze * .6 + gust * .4) * flex;
            transformed.z += breeze * flex * .31;
          #endif`);
    };
    return { material, animate: elapsed => { time.value = elapsed; } };
  }

  function water(T, color, width, length, night, biome) {
    const climate = atmosphere(biome);
    const time = { value: 0 };
    const material = new T.ShaderMaterial({
      uniforms: {
        waterColor: { value: new T.Color(color).multiplyScalar(night ? .39 : .72) },
        skyColor: { value: new T.Color(climate.haze) },
        sun: { value: sunDirection(T, climate) },
        fogColor: { value: new T.Color(climate.haze) },
        time
      },
      vertexShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vWater = (modelMatrix * vec4(position, 1.)).xyz;
          gl_Position = projectionMatrix * viewMatrix * vec4(vWater, 1.);
        }`,
      fragmentShader: `
        varying vec3 vWater;
        varying vec2 vUv;
        uniform vec3 waterColor, skyColor, sun, fogColor;
        uniform float time;
        void main() {
          vec2 point = vWater.xz;
          float a = point.x * 2.8 + point.y * .87 - time * 1.85;
          float b = point.x * -.71 + point.y * 4.6 + time * 2.02;
          float c = point.x * 8.7 + point.y * 5.5 - time * 2.95;
          vec3 normal = normalize(vec3(.090 * cos(a) + .031 * cos(b) + .025 * cos(c), 1.,
            .071 * cos(b) + .038 * cos(a) + .023 * cos(c)));
          vec3 view = normalize(cameraPosition - vWater);
          float facing = max(.0, dot(view, normal));
          float fresnel = pow(1. - facing, 3.7);
          float ripples = .90 + .08 * sin(a + sin(b) * .36) + .044 * sin(c);
          float shallows = 1. - smoothstep(0., .19, vUv.x);
          vec3 color = mix(waterColor * ripples, waterColor * 1.36, shallows * .70);
          color = mix(color, skyColor, .15 + fresnel * .62);
          float reflection = pow(max(0., dot(reflect(-sun, normal), view)), 94.);
          color += skyColor * reflection * .52;
          float depth = length(cameraPosition - vWater) * .0135;
          gl_FragColor = vec4(mix(color, fogColor, 1. - exp(-depth * depth)), 1.);
          #include <colorspace_fragment>
        }`
    });
    const mesh = new T.Mesh(new T.PlaneGeometry(width, length), material);
    mesh.rotation.x = -Math.PI / 2;
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
    const object = mesh(T, group, new T.CylinderGeometry(radius * .77, radius, direction.length(), 7), material,
      start.lerp(end, .5).toArray());
    object.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), direction.normalize());
    return object;
  }

  function tent(T) {
    const group = new T.Group();
    const cloth = surface(new T.MeshStandardMaterial({ color: "#80674c", roughness: 1, side: T.DoubleSide, vertexColors: true }), "linen", true);
    const wood = surface(new T.MeshStandardMaterial({ color: "#68513a", roughness: 1 }), "bark");
    const rope = new T.MeshStandardMaterial({ color: "#b8a17b", roughness: 1 });
    const length = 1.28, width = 1.21, peak = 1.54;
    for (const side of [-1, 1]) {
      const canvas = new T.PlaneGeometry(2, 2, 18, 12);
      const points = canvas.attributes.position;
      const tones = [];
      for (let i = 0; i < points.count; i++) {
        const u = (points.getX(i) + 1) * .5;
        const z = points.getY(i);
        const folds = Math.sin(z * 29 + side) * .026 + Math.sin(z * 12 - u * 5) * .034;
        points.setXYZ(i, side * width * u, peak * (1 - u) + .16 * u -
          Math.sin(u * Math.PI) * .14 - .10 * (1 - z * z) + folds * u, z * length);
        const stripe = Math.abs((u * 7.7) % 1 - .5) < .11 ? .77 : 1;
        tones.push(stripe, stripe * .96, stripe * .87);
      }
      canvas.setAttribute("color", new T.Float32BufferAttribute(tones, 3));
      canvas.computeVertexNormals();
      mesh(T, group, canvas, cloth, [0, 0, 0]);
      for (const end of [-1, 1]) {
        beam(T, group, [side * width, .18, end * length], [side * 1.55, .035, end * 1.56], .009, rope);
        beam(T, group, [side * 1.55, 0, end * 1.56], [side * 1.58, .13, end * 1.59], .027, wood);
      }
    }
    for (const end of [-1, 1]) beam(T, group, [0, .01, end * length], [0, peak + .07, end * length], .043, wood);
    beam(T, group, [0, peak - .075, -length - .06], [0, peak - .075, length + .06], .031, wood);
    return group;
  }

  function accessory(T, elbow, kind) {
    if (!kind) return null;
    const group = new T.Group();
    group.position.set(0, -.25, .029);
    elbow.add(group);
    const material = surface(new T.MeshStandardMaterial({
      color: { staff: "#594431", bag: "#65523b", jar: "#af6648", tablet: "#9e8157",
        basket: "#a38150", lantern: "#805c39", rope: "#b89d6b", net: "#a99b78", "oil-lamp": "#a46e4c",
        scroll: "#6a4f38", basin: "#8a5d3b" }[kind] ?? "#65523b", roughness: .94
    }), kind === "jar" || kind === "basin" ? "stone" : "linen", true);
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
      const woodRodMat = surface(new T.MeshStandardMaterial({ color: "#543e2b", roughness: .75 }), "bark");
      const scrollCore = mesh(T, group, new T.CylinderGeometry(.026, .026, .26, 16), parchmentMat, [-.01, -.11, .05]);
      scrollCore.rotation.z = Math.PI / 4;
      const spindle = mesh(T, group, new T.CylinderGeometry(.009, .009, .34, 10), woodRodMat, [-.01, -.11, .05]);
      spindle.rotation.z = Math.PI / 4;
      mesh(T, group, new T.SphereGeometry(.016, 8, 8), woodRodMat, [-.13, -.23, .05]);
      mesh(T, group, new T.SphereGeometry(.016, 8, 8), woodRodMat, [.11, .01, .05]);
      const band = mesh(T, group, new T.TorusGeometry(.028, .004, 4, 16), material, [-.01, -.11, .05]);
      band.rotation.y = Math.PI / 4;
    } else if (kind === "basin") {
      const bronzeMat = surface(new T.MeshStandardMaterial({ color: "#8a5d3b", roughness: .65, metalness: .25 }), "stone", true);
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

  globalThis.AdventureVisuals = {
    atmosphere, light, sky, ridges, surface, rocks, treeTrunk, canopy, grass, vegetation, water, tent,
    accessory
  };
})();
