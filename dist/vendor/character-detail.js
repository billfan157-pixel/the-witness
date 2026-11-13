(() => {
  "use strict";

  // All maps are deterministic, shared by the renderer and available offline.
  const resources = new WeakMap();
  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const fract = value => value - Math.floor(value);
  const noise = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
  const bell = (x, width) => Math.exp(-((x / width) ** 2));

  function texture(T, pixels, width, height, repeat = false) {
    const map = new T.DataTexture(pixels, width, height, T.RGBAFormat);
    map.magFilter = T.LinearFilter;
    map.minFilter = T.LinearMipmapLinearFilter;
    map.generateMipmaps = true;
    if (repeat) map.wrapS = map.wrapT = T.RepeatWrapping;
    map.needsUpdate = true;
    map.userData.sharedCharacterMap = true;
    return map;
  }

  function maps(T) {
    if (resources.has(T)) return resources.get(T);
    const size = 256, heights = new Float32Array(size * size);
    const normalPixels = new Uint8Array(size * size * 4);
    const roughPixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const pore = bell(Math.hypot((x % 7) - 3.5 + noise(x >> 3, y >> 3), (y % 7) - 3.5), 1.15);
      heights[y * size + x] = noise(x, y) * .16 - pore * .30
        + Math.sin(x * .13 + Math.sin(y * .11)) * .08;
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const offset = (y * size + x) * 4;
      const dx = heights[y * size + (x + 1) % size] - heights[y * size + (x + size - 1) % size];
      const dy = heights[((y + 1) % size) * size + x] - heights[((y + size - 1) % size) * size + x];
      const length = Math.hypot(dx, dy, 1);
      normalPixels.set([128 - dx / length * 127, 128 - dy / length * 127, 128 + 127 / length, 255], offset);
      const rough = 215 + heights[y * size + x] * 25;
      roughPixels.set([rough, rough, rough, 255], offset);
    }
    // Four different clumps. Each card contains many tapered, curved fibres;
    // the transparent spaces survive mipmapping instead of forming a solid beard.
    const width = 256, height = 512, pixels = new Uint8Array(width * height * 4);
    for (let i = 0; i < pixels.length; i += 4) { pixels[i] = 206; pixels[i + 1] = 204; pixels[i + 2] = 200; }
    for (let tile = 0; tile < 4; tile++) for (let fibre = 0; fibre < 15; fibre++) {
      const start = 5 + noise(fibre, tile + 10) * 54;
      const phase = noise(fibre + 40, tile) * Math.PI * 2;
      const bend = (noise(fibre, tile + 30) - .5) * 6;
      const tip = .74 + noise(fibre + 12, tile) * .26;
      for (let y = 0; y < height; y++) {
        const t = y / (height - 1);
        const path = start + Math.sin(t * 7 + phase) * (1 + t * 1.4) + bend * t * t;
        const radius = (.48 + noise(fibre, tile) * .40) * (1 - t * .65);
        const fade = clamp(t / .045) * clamp((tip - t) / .12);
        for (let x = Math.max(0, Math.floor(path - 2)); x <= Math.min(63, Math.ceil(path + 2)); x++) {
          const offset = (y * width + tile * 64 + x) * 4;
          const alpha = clamp((radius + .55 - Math.abs(x - path)) / .7) * fade;
          const shade = 175 + noise(fibre, tile + 4) * 72;
          if (alpha * 255 > pixels[offset + 3]) pixels.set([shade, shade, shade, alpha * 255], offset);
        }
      }
    }
    const hairlinePixels = new Uint8Array(128 * 128 * 4);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const edge = .97 + noise(x, 90) * .03;
      const coverage = clamp((edge - y / 127) / .045) * 255;
      hairlinePixels.set([coverage, coverage, coverage, 255], (y * 128 + x) * 4);
    }
    // Pre-Integrated Skin Subsurface Scattering LUT (Penner / GPU Pro 2)
    // Dimension X: N·L mapped from [-1, 1] to [0, 1]
    // Dimension Y: Curvature (1 / radius) from 0.0 to 1.0
    const lutSize = 256;
    const sssLutPixels = new Uint8Array(lutSize * lutSize * 4);
    for (let y = 0; y < lutSize; y++) {
      const curvature = (y + 1) / lutSize;
      for (let x = 0; x < lutSize; x++) {
        const ndotl = (x / (lutSize - 1)) * 2 - 1;
        // Multi-dipole diffusion approximation for Levantine 1st-century skin
        const wrapR = clamp((ndotl + curvature * 0.65) / (1 + curvature * 0.65));
        const sssR = Math.pow(wrapR, 1.0 + curvature * 0.20) + Math.exp(-Math.pow((ndotl + 0.12) / (0.32 + curvature * 0.35), 2)) * 0.28 * curvature;
        const wrapG = clamp((ndotl + curvature * 0.38) / (1 + curvature * 0.38));
        const sssG = Math.pow(wrapG, 1.25 + curvature * 0.30) + Math.exp(-Math.pow((ndotl + 0.06) / (0.24 + curvature * 0.25), 2)) * 0.12 * curvature;
        const wrapB = clamp((ndotl + curvature * 0.16) / (1 + curvature * 0.16));
        const sssB = Math.pow(wrapB, 1.45 + curvature * 0.40) + Math.exp(-Math.pow(ndotl / (0.16 + curvature * 0.18), 2)) * 0.05 * curvature;

        const offset = (y * lutSize + x) * 4;
        sssLutPixels[offset] = Math.round(clamp(sssR, 0, 1) * 255);
        sssLutPixels[offset + 1] = Math.round(clamp(sssG, 0, 1) * 255);
        sssLutPixels[offset + 2] = Math.round(clamp(sssB, 0, 1) * 255);
        sssLutPixels[offset + 3] = 255;
      }
    }
    // High-frequency tileable pore micro-normal. A wrapped jittered grid of
    // sub-millimetre dimples plus fine grain reads as real skin when the camera
    // pushes in close, where the broad 256px normal map alone goes smooth.
    const microSize = 256, microHeight = new Float32Array(microSize * microSize);
    const cell = 8, cells = microSize / cell;
    const wrapDelta = (a, b) => { const d = Math.abs(a - b); return Math.min(d, microSize - d); };
    for (let y = 0; y < microSize; y++) for (let x = 0; x < microSize; x++) {
      const gx = Math.floor(x / cell), gy = Math.floor(y / cell);
      let dimple = 0;
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const cx = (gx + ox + cells) % cells, cy = (gy + oy + cells) % cells;
        const px = (cx + .5 + (noise(cx, cy) - .5) * .8) * cell;
        const py = (cy + .5 + (noise(cx + 91, cy + 17) - .5) * .8) * cell;
        const dist = Math.hypot(wrapDelta(x, px), wrapDelta(y, py));
        const radius = .9 + noise(cx + 7, cy + 3) * 1.5;
        dimple -= bell(dist / radius, 1) * (.5 + noise(cx + 31, cy + 53) * .5);
      }
      const grain = (noise(x * 3.1, y * 2.7) - .5) * .18 + (noise(x * 7.3, y * 6.1) - .5) * .08;
      microHeight[y * microSize + x] = dimple * .5 + grain;
    }
    const microPixels = new Uint8Array(microSize * microSize * 4);
    for (let y = 0; y < microSize; y++) for (let x = 0; x < microSize; x++) {
      const offset = (y * microSize + x) * 4;
      const dx = microHeight[y * microSize + (x + 1) % microSize] - microHeight[y * microSize + (x + microSize - 1) % microSize];
      const dy = microHeight[((y + 1) % microSize) * microSize + x] - microHeight[((y + microSize - 1) % microSize) * microSize + x];
      const length = Math.hypot(dx * 2.4, dy * 2.4, 1);
      microPixels.set([128 - dx * 2.4 / length * 127, 128 - dy * 2.4 / length * 127, 128 + 127 / length, 255], offset);
    }
    // Woven fuzz micro-normal for cloth sheen: short fibre fuzz standing off the
    // weave, tileable, used to break the specular rim of wool/linen mantles.
    const fuzzSize = 128, fuzzHeight = new Float32Array(fuzzSize * fuzzSize);
    for (let y = 0; y < fuzzSize; y++) for (let x = 0; x < fuzzSize; x++) {
      const fibre = Math.sin(x * 1.7 + noise(x >> 2, y >> 2) * 6.28) * .5 + Math.sin(y * 2.3 + x * .4) * .3;
      fuzzHeight[y * fuzzSize + x] = fibre * .3 + (noise(x * 5.1, y * 5.7) - .5) * .5;
    }
    const fuzzPixels = new Uint8Array(fuzzSize * fuzzSize * 4);
    for (let y = 0; y < fuzzSize; y++) for (let x = 0; x < fuzzSize; x++) {
      const offset = (y * fuzzSize + x) * 4;
      const dx = fuzzHeight[y * fuzzSize + (x + 1) % fuzzSize] - fuzzHeight[y * fuzzSize + (x + fuzzSize - 1) % fuzzSize];
      const dy = fuzzHeight[((y + 1) % fuzzSize) * fuzzSize + x] - fuzzHeight[((y + fuzzSize - 1) % fuzzSize) * fuzzSize + x];
      const length = Math.hypot(dx * 1.8, dy * 1.8, 1);
      fuzzPixels.set([128 - dx * 1.8 / length * 127, 128 - dy * 1.8 / length * 127, 128 + 127 / length, 255], offset);
    }
    const result = {
      skinNormal: texture(T, normalPixels, size, size, true),
      skinRoughness: texture(T, roughPixels, size, size, true),
      skinSssLut: texture(T, sssLutPixels, lutSize, lutSize, false),
      skinMicroNormal: texture(T, microPixels, microSize, microSize, true),
      fuzzNormal: texture(T, fuzzPixels, fuzzSize, fuzzSize, true),
      hair: texture(T, pixels, width, height),
      hairline: texture(T, hairlinePixels, 128, 128)
    };
    resources.set(T, result);
    return result;
  }

  function sculpt(positions, landmarks, look) {
    const eye = landmarks["joint-l-eye"];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i], y = positions[i + 1], z = positions[i + 2];
      if (y < eye[1] - .13 || y > eye[1] + .10 || z < .08) continue;
      const side = Math.abs(x), dy = y - eye[1];
      // Preserve the orbital opening and the lips. Millimetre-scale changes to
      // the surrounding planes give real silhouette and raking-light changes.
      const orbitalRing = bell(Math.hypot(side - Math.abs(eye[0]), dy) - .015, .006);
      const safe = 1 - orbitalRing;
      const cheek = bell(side - .052, .018) * bell(dy + .027, .018);
      const socket = bell(side - .039, .025) * bell(dy + .013, .009);
      const brow = bell(side - .034, .023) * bell(dy - .021, .010);
      const jaw = bell(side - .056, .023) * bell(dy + .083, .022);
      const fold = bell(side - (.019 + clamp(-dy - .035) * .27), .004) * bell(dy + .054, .022);
      positions[i + 2] += safe * (cheek * .0021 - socket * .0014 + brow * .0012 + jaw * .0009 - fold * (.0003 + look.age * .0006));
      positions[i] += Math.sign(x) * safe * jaw * .0007;
      // A restrained natural asymmetry, shared by both depictions of Jesus.
      positions[i + 2] += bell(x + .047, .025) * bell(dy + .03, .026) * .00045;
    }
  }

  function expressions(T, positions, landmarks, mouth) {
    const smile = new Float32Array(positions.length), brow = new Float32Array(positions.length);
    const eye = landmarks["joint-l-eye"];
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i], y = positions[i + 1], z = positions[i + 2];
      if (z < .09 || y < eye[1] - .11) continue;
      const corner = bell(Math.abs(x) - .025, .012) * bell(y - mouth[1], .013);
      smile[i] = Math.sign(x) * corner * .0009;
      smile[i + 1] = corner * .0023;
      smile[i + 2] = corner * .0005;
      const innerBrow = bell(Math.abs(x) - .019, .013) * bell(y - eye[1] - .026, .012);
      brow[i + 1] = innerBrow * .0018;
    }
    return [smile, brow].map((values, index) => {
      const attribute = new T.Float32BufferAttribute(values, 3);
      attribute.name = index ? "brow-soften" : "gentle-smile";
      return attribute;
    });
  }

  function skin(T, part, look, landmarks, mouth) {
    const shared = maps(T), eye = landmarks["joint-l-eye"], eyeY = eye[1], eyeX = Math.abs(eye[0]);
    const uv = [], thickness = [];
    const p = part.attributes.position;
    // Baked Thickness / Translucency Map: thin anatomy (ear helix, nose tip,
    // nostril wings, lips, eyelids, fingers) transmits Middle-Eastern sunlight;
    // thick torso/limb skin stays opaque. Stored per-vertex so it survives the
    // planar UV overlap on the body and reads correctly at any camera distance.
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), side = Math.abs(x);
      uv.push(x * 32 + z * 12, y * 32);
      let thin = .05;
      const ear = bell((side - .076) / .017, 1) * bell((y - eyeY + .004) / .030, 1) * (1 - clamp((z - .01) / .05));
      const noseTip = bell(x / .019, 1) * bell((y - eyeY + .036) / .016, 1) * clamp((z - .085) / .03);
      const nostril = bell((side - .0165) / .006, 1) * bell((y - eyeY + .0435) / .006, 1) * clamp((z - .08) / .03);
      const lip = bell((y - mouth[1]) / .0075, 1) * (1 - clamp((side - .018) / .018)) * clamp((z - .08) / .03);
      const lid = bell((side - eyeX) / .014, 1) * bell((y - eyeY) / .012, 1) * clamp((z - .05) / .04);
      const hand = clamp((eyeY - .52 - y) / .18) * clamp((side - .15) / .07);
      const finger = hand * bell((y - (eyeY - .78)) / .07, 1);
      thin = Math.max(thin, ear * .80, noseTip * .40, nostril * .46, lip * .30, lid * .10, hand * .38, finger * .62);
      thickness.push(clamp(thin, 0, 1));
    }
    part.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    part.setAttribute("skinThickness", new T.Float32BufferAttribute(thickness, 1));
    const material = new T.MeshPhysicalMaterial({
      vertexColors: true, roughness: .66, metalness: 0,
      normalMap: shared.skinNormal, normalScale: new T.Vector2(.16, .16),
      roughnessMap: shared.skinRoughness,
      ior: 1.4, clearcoat: .045, clearcoatRoughness: .42,
      sheen: .12, sheenColor: new T.Color("#ffcdb2"), sheenRoughness: .8
    });
    material.name = "skin-sss-thickness-micropore";
    material.userData.subsurface = "preintegrated-skin-sss-lut+thickness-translucency+micro-normal";
    material.customProgramCacheKey = () => "character-skin-aaa-v2";
    material.onBeforeCompile = shader => {
      shader.uniforms.uEyeY = { value: eyeY };
      shader.uniforms.uEyeX = { value: eyeX };
      shader.uniforms.uMouth = { value: new T.Vector3(...mouth) };
      shader.uniforms.uAge = { value: look.age };
      shader.uniforms.uSkinSssLut = { value: shared.skinSssLut };
      shader.uniforms.uSkinMicroNormal = { value: shared.skinMicroNormal };
      shader.uniforms.uMicroRepeat = { value: 5.0 };
      shader.uniforms.uMicroStrength = { value: .34 };
      shader.uniforms.uTransColor = { value: new T.Color("#b05136").convertSRGBToLinear() };
      shader.uniforms.uSssStrength = { value: .34 };
      const declarations = "\nvarying vec3 vSkinPoint;\nvarying vec2 vSkinUv;\nvarying float vSkinThickness;\nuniform float uEyeY, uEyeX, uAge, uMicroRepeat, uMicroStrength, uSssStrength;\nuniform vec3 uMouth, uTransColor;\nuniform sampler2D uSkinSssLut, uSkinMicroNormal;\n";
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float skinThickness;\nvarying vec3 vSkinPoint;\nvarying vec2 vSkinUv;\nvarying float vSkinThickness;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvSkinPoint = position;\nvSkinUv = uv;\nvSkinThickness = skinThickness;");
      shader.fragmentShader = shader.fragmentShader.replace("#include <common>", "#include <common>" + declarations)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          float foreheadMask = exp(-pow((vSkinPoint.y - uEyeY - .055) / .027, 2.)) * (1. - smoothstep(.040, .068, abs(vSkinPoint.x))) * smoothstep(.08, .13, vSkinPoint.z);
          float fineCrease = pow(.5 + .5 * sin((vSkinPoint.y - uEyeY) * 760. + cos(vSkinPoint.x * 42.) * 1.4), 10.);
          float creaseHeight = fineCrease * foreheadMask * (.000025 + uAge * .000055);
          vec3 dpdx = -dFdx(vViewPosition), dpdy = -dFdy(vViewPosition);
          vec3 r1 = cross(dpdy, normal), r2 = cross(normal, dpdx);
          float determinant = dot(dpdx, r1);
          vec3 gradient = sign(determinant) * (dFdx(creaseHeight) * r1 + dFdy(creaseHeight) * r2);
          normal = normalize(abs(determinant) * normal - gradient);
          // High-frequency pore micro-normal in an isotropic tangent frame.
          vec3 microN = texture2D(uSkinMicroNormal, vSkinUv * uMicroRepeat).xyz * 2.0 - 1.0;
          vec3 microT = normalize(cross(dpdy, normal) + vec3(1e-6));
          vec3 microB = cross(normal, microT);
          float poreZone = smoothstep(.02, .09, vSkinPoint.z) * (1.0 - smoothstep(.055, .085, abs(vSkinPoint.x)));
          normal = normalize(normal + (microN.x * microT + microN.y * microB) * uMicroStrength * (.35 + poreZone * .65));
        `)
        .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
          float frontSkin = smoothstep(.07, .12, vSkinPoint.z);
          float skinLip = exp(-pow((vSkinPoint.y - uMouth.y) / .007, 2.)) * (1. - smoothstep(.020, .035, abs(vSkinPoint.x))) * frontSkin;
          float skinTzone = exp(-pow(vSkinPoint.x / .021, 2.)) * exp(-pow((vSkinPoint.y - uEyeY + .010) / .042, 2.)) * frontSkin;
          roughnessFactor = clamp(roughnessFactor - skinTzone * .10 - skinLip * .16 + uAge * .025, .28, .82);
        `)
        .replace("#include <lights_physical_pars_fragment>", `#include <lights_physical_pars_fragment>
          void RE_SkinScattering(const in IncidentLight light, const in vec3 N, const in vec3 V, inout ReflectedLight reflected) {
            float ear = smoothstep(.064, .086, abs(vSkinPoint.x)) * exp(-pow((vSkinPoint.y - uEyeY + .006) / .043, 2.));
            float nose = exp(-pow(vSkinPoint.x / .020, 2.)) * exp(-pow((vSkinPoint.y - uEyeY + .034) / .020, 2.));
            float lips = exp(-pow((vSkinPoint.y - uMouth.y) / .008, 2.)) * (1. - smoothstep(.018, .036, abs(vSkinPoint.x)));
            // Baked thickness map drives translucency; procedural masks add helix detail.
            float thickness = clamp(vSkinThickness + ear * .18 + nose * .06, 0.0, 1.0);

            vec3 dNdx = dFdx(N), dNdy = dFdy(N);
            float geomCurv = clamp(length(dNdx) + length(dNdy), 0.08, 0.85);
            float anatCurv = clamp(geomCurv + ear * 0.45 + nose * 0.35 + lips * 0.25, 0.05, 0.95);

            // 1. Pre-Integrated forward scattering (Penner / GPU Pro 2 skin LUT).
            float NdotL = dot(N, light.direction);
            vec2 lutUv = vec2(clamp(NdotL * 0.5 + 0.5, 0.005, 0.995), anatCurv);
            vec3 sssProfile = texture2D(uSkinSssLut, lutUv).rgb;
            vec3 scatterAlbedo = mix(vec3(1.0), uTransColor * 1.6 + 0.35, thickness * 0.5);
            reflected.directDiffuse += light.color * sssProfile * scatterAlbedo * uSssStrength * (0.35 + thickness * 0.5);

            // 2. Translucency back-scatter (Frostbite / DICE): sunlight through
            //    ears, nose tip and fingers, tinted by blood perfusion.
            vec3 transLight = normalize(light.direction + N * 0.38);
            float transDot = pow(clamp(dot(V, -transLight), 0.0, 1.0), 3.6) * 1.1;
            float transAmbient = 0.08;
            vec3 trans = (transDot + transAmbient) * thickness * uTransColor;
            reflected.directDiffuse += light.color * trans * 0.9;
          }
        `);
      const direct = "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );";
      shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>",
        T.ShaderChunk.lights_fragment_begin.split(direct).join(direct + "\nRE_SkinScattering(directLight, geometryNormal, geometryViewDir, reflectedLight);"));
    };
    return material;
  }

  function groom(T, config) {
    const { look, positions, landmarks, mouth, headTop, faceDepth, skinned } = config;
    const hairColor = new T.Color(look.hairColor);
    const base = new T.MeshStandardMaterial({
      color: hairColor, roughness: .82, side: T.DoubleSide,
      alphaMap: maps(T).hairline, transparent: false, alphaTest: .35, depthWrite: true, forceSinglePass: true,
      polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1
    });
    const material = new T.MeshPhysicalMaterial({
      color: hairColor, map: maps(T).hair, vertexColors: true,
      roughness: .55, metalness: 0, side: T.DoubleSide,
      alphaTest: .16, alphaToCoverage: true, transparent: false, depthWrite: true, forceSinglePass: true,
      sheen: .42, sheenColor: hairColor.clone().lerp(new T.Color("#b7a28a"), .24), sheenRoughness: .62
    });
    material.name = "groom-cards-fibre-atlas-a2c-aniso";
    const sway = config.sway || { value: new T.Vector2() }, jawOpen = { value: 0 };
    function batch() { return { p: [], uv: [], colors: [], indices: [], t: [] }; }
    const fixed = batch(), flowing = batch(), beard = batch(), fibres = batch();
    let cardIndex = 0;
    function fibre(points, radius, shade) {
      const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
      const tube = new T.TubeGeometry(curve, 3, radius, 3, false);
      const p = tube.attributes.position, start = fibres.p.length / 3;
      for (let i = 0; i < p.count; i++) {
        const t = Math.floor(i / 4) / 3, center = curve.getPointAt(t);
        const taper = 1 - Math.pow(t, 1.7) * .94;
        fibres.p.push(center.x + (p.getX(i) - center.x) * taper,
          center.y + (p.getY(i) - center.y) * taper, center.z + (p.getZ(i) - center.z) * taper);
        const value = shade * (.70 + t * .45);
        fibres.colors.push(value, value * .98, value * .94);
      }
      for (const index of tube.index.array) fibres.indices.push(start + index);
      tube.dispose();
    }
    function card(target, points, width, shade, direction) {
      const curve = new T.CatmullRomCurve3(points.map(p => new T.Vector3(...p)));
      const tile = cardIndex++ % 4, steps = 6, start = target.p.length / 3;
      const across = new T.Vector3(...direction).normalize();
      for (let i = 0; i <= steps; i++) {
        const t = i / steps, center = curve.getPoint(t);
        const tangent = curve.getTangent(t);
        const taper = .75 + Math.sin(t * Math.PI) * .25 - Math.pow(t, 5) * .62;
        for (const side of [-1, 1]) {
          const point = center.clone().addScaledVector(across, side * width * taper * .5);
          target.p.push(...point.toArray());
          target.t.push(tangent.x, tangent.y, tangent.z);
          // Atlas rows are authored root first; DataTexture flipY stays false.
          target.uv.push((tile + (side + 1) * .5) / 4, t);
          const rootShade = .90, tipShade = 1.08;
          const value = shade * (rootShade + (tipShade - rootShade) * t);
          target.colors.push(value, value * .98, value * .94);
        }
        if (i) { const a = start + i * 2; target.indices.push(a - 2, a, a - 1, a - 1, a, a + 1); }
      }
    }
    const eye = landmarks["joint-l-eye"], centerY = headTop - .125, centerZ = .046;
    // Fit the underlay to the source cranium, not to a large geometric helmet.
    const headVertices = [];
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] <= eye[1] + .025) continue;
      const x = positions[i], y = positions[i + 1] - centerY, z = positions[i + 2] - centerZ;
      const radius = Math.hypot(x, y, z);
      headVertices.push([x / radius, y / radius, z / radius, radius]);
    }
    function scalp(angle, polar, lift = .0018) {
      const x = Math.sin(angle) * Math.sin(polar), y = Math.cos(polar), z = Math.cos(angle) * Math.sin(polar);
      let total = 0, weight = 0;
      for (const p of headVertices) {
        const alignment = x * p[0] + y * p[1] + z * p[2];
        if (alignment < .96) continue;
        const w = Math.pow((alignment - .96) / .04, 4);
        total += p[3] * w; weight += w;
      }
      const radius = (weight ? total / weight : 1 / Math.hypot(x / .080, y / .118, z / .103)) + lift;
      return [x * radius, centerY + y * radius, centerZ + z * radius];
    }
    const hairline = angle => 1.67 - Math.cos(angle) * (look.hair === "receding" ? .65 : .32)
      + Math.sin(angle * 5.0 + .5) * .055 + Math.sin(angle * 11.0) * .023;
    const underlay = batch();
    for (let row = 0; row <= 18; row++) for (let col = 0; col <= 56; col++) {
      const a = col / 56 * Math.PI * 2, p = scalp(a, row / 18 * hairline(a), .0016);
      underlay.p.push(...p);
      underlay.uv.push(col / 56, row / 18);
      if (row && col) { const n = row * 57 + col; underlay.indices.push(n, n - 57, n - 1, n - 1, n - 57, n - 58); }
    }
    const shell = new T.BufferGeometry();
    shell.setAttribute("position", new T.Float32BufferAttribute(underlay.p, 3));
    shell.setAttribute("uv", new T.Float32BufferAttribute(underlay.uv, 2));
    shell.setIndex(underlay.indices); shell.computeVertexNormals();
    skinned(shell, base, () => [["head", 1]]).name = "fitted-hair-underlay";
    for (let i = 0; i < 320; i++) {
      const a = i * 2.399963, edge = hairline(a);
      const p = .08 + noise(i, 10) * (edge - .12);
      const turn = (Math.sin(a) > 0 ? 1 : -1) * (.08 + noise(i, 11) * .1);
      const end = Math.min(edge + .045, p + .34 + noise(i, 12) * .25);
      card(fixed, [scalp(a, p, .002), scalp(a + turn * .4, (p + end) * .5, .0068), scalp(a + turn, end, .0038)],
        .008 + noise(i, 13) * .010, .88 + noise(i, 14) * .24, [Math.cos(a), 0, -Math.sin(a)]);
    }
    if (look.hair === "waves") for (const side of [-1, 1]) for (let i = 0; i < 64; i++) {
      const start = .25 + i / 63 * .65, shift = noise(i, 32) * .06;
      card(fixed, [scalp(side * (.04 + shift), start, .003), scalp(side * .56, start + .22, .007),
        scalp(side * 1.03, start + .47, .008), scalp(side * 1.45, start + .65, .004)],
        .012, .93 + noise(i, 33) * .18, [Math.cos(start), -.3, -.4 * side]);
    }
    // Break up the front edge with sparse fine cards anchored in the skin.
    for (let i = 0; i < 68; i++) {
      const a = -1.4 + i / 67 * 2.8, edge = hairline(a);
      card(fixed, [scalp(a, edge - .07), scalp(a + .015, edge + .005, .002), scalp(a + .035, edge + .02 + noise(i, 35) * .04, .001)],
        .0020 + noise(i, 36) * .001, .84, [Math.cos(a), 0, -Math.sin(a)]);
    }
    if (look.hair === "braids") {
      for (const side of [-1, 1]) for (let i = 0; i < 12; i++) {
        const x = side * (.071 + i % 3 * .004), z = -.012 + Math.floor(i / 3) * .004;
        card(flowing, [[x, eye[1] + .02, z], [x + side * .005, eye[1] - .08, z - .01], [x * .8, eye[1] - .19, z]], .012, .96, [1, 0, .3]);
      }
    } else if (look.hairLength > .03 && look.hair !== "receding") {
      const drop = look.hairLength;
      for (let i = 0; i < 220; i++) {
        const a = 1.02 + (i % 110) / 109 * (Math.PI * 2 - 2.04);
        const root = scalp(a, hairline(a) - .32 - Math.floor(i / 110) * .12, .003 + noise(i, 24) * .005);
        const length = .055 + drop * (.78 + noise(i, 20) * .32);
        const curl = (look.hair === "curls" ? .013 : .006) * Math.sin(i * 2.4);
        const x = Math.sin(a) * .088, z = .046 + Math.cos(a) * .098;
        card(flowing, [root, [x * 1.12, root[1] - length * .38, z + curl],
          [x * 1.13 + curl, root[1] - length * .77, z - .004], [x * 1.04, root[1] - length, z - .012]],
        .013 + noise(i, 22) * .006, .86 + noise(i, 23) * .30, [Math.cos(a), .06, -Math.sin(a)]);
      }
    }
    for (const side of [-1, 1]) for (let i = 0; i < 10; i++) {
      const x = side * (.016 + i * .0030), y = eye[1] + .018 + Math.sin(i / 9 * Math.PI) * .003;
      const z = faceDepth(x, y) + .0018;
      card(fixed, [[x, y, z], [x + side * .005, y + .001, z + .0005], [x + side * .009, y - .001, z]], .0045, .90, [0, 1, .25]);
    }
    if (look.gender !== "female" && look.beard > .012) {
      const length = look.beard, shortBeard = length < .04;
      const beardCount = shortBeard ? 360 : 560;
      for (let i = 0; i < beardCount; i++) {
        const u = (i % 28) / 27 * 2 - 1 + (noise(i, 40) - .5) * .08, v = noise(i, 41), side = Math.abs(u);
        const x = Math.max(-1, Math.min(1, u)) * (shortBeard ? .066 : .070);
        const top = mouth[1] - (shortBeard ? .012 : .009) + side * (shortBeard ? .026 : .036) + Math.sin(u * 17) * .003;
        const y = top - v * ((shortBeard ? .017 : .022) + (1 - side) * (shortBeard ? .015 : .018));
        const z = faceDepth(x, y) + .0036;
        const nLen = Math.hypot(x / .075, Math.max(.2, z - .02)) || 1;
        const nx = (x / .075) / nLen, nz = Math.max(.2, z - .02) / nLen;
        const strandLength = length * (.30 + noise(i, 42) * .48) * (1 - side * .40);
        const outward = strandLength * .15;
        const midX = x + nx * outward * .4, midY = y - strandLength * .47;
        const tipX = x + nx * outward, tipY = y - strandLength;
        const midZ = Math.max(z + .0024, faceDepth(midX, midY) + .0042 + nz * outward * .4);
        const tipZ = Math.max(z + .0016, faceDepth(tipX, tipY) + .0034 + nz * outward);
        card(beard, [[x, y, z], [midX, midY, midZ], [tipX, tipY, tipZ]],
          (shortBeard ? .0038 + noise(i, 44) * .0028 : .0058 + noise(i, 44) * .0042), .92 + noise(i, 45) * .22, [nz, side * .18, -nx]);
        fibre([[x, y, z + .0016], [midX, midY, midZ + .0016], [tipX, tipY, tipZ + .0012]],
          .00022 + noise(i, 49) * .00014, .90 + noise(i, 50) * .38);
      }
      // Feathered cheek and sideburn boundary, with much shorter, sparse hairs.
      for (const side of [-1, 1]) for (let i = 0; i < 26; i++) {
        const t = i / 25, x = side * (.064 - t * .035), y = mouth[1] + .033 - t * .032 + noise(i, 47) * .002;
        const z = faceDepth(x, y) + .0020;
        card(beard, [[x, y, z], [x + side * .001, y - .003, z + .0015], [x + side * .002, y - .006, z + .001]], .0028, .90, [.65, .35, -side * .65]);
      }
      for (const side of [-1, 1]) for (let i = 0; i < 22; i++) {
        const x = side * (.003 + i * .0013), y = mouth[1] + .008 - i * .00020, z = faceDepth(x, y) + .0018;
        card(beard, [[x, y, z], [x * 1.13, y - .0028, z + .0012], [x * 1.25, y - .0065, z + .0008]], .0032, .92, [1, -.25 * side, -.18 * side]);
        fibre([[x, y, z + .001], [x * 1.13, y - .0028, z + .0017], [x * 1.25, y - .0065, z + .001]], .00019, 1.0);
      }
    }
    const specTint2 = hairColor.clone().lerp(new T.Color("#ffffff"), .35).convertSRGBToLinear();
    function swayGLSL(moving) {
      return moving ? `float dropWeight = 1. - smoothstep(${(eye[1] - .13).toFixed(4)}, ${(eye[1] + .04).toFixed(4)}, position.y);
        transformed.x += uHairSway.x * dropWeight; transformed.z += uHairSway.y * dropWeight;`
        : `float jawWeight = 1. - smoothstep(${(mouth[1] - .018).toFixed(4)}, ${(mouth[1] + .006).toFixed(4)}, position.y);
        transformed.y -= uJawOpen * .012 * jawWeight; transformed.z -= uJawOpen * .004 * jawWeight;`;
    }
    // Kajiya-Kay / Marschner anisotropic fibre specular: a sharp tip-ward primary
    // lobe plus a broader coloured secondary lobe, aligned to the card tangent.
    function hairShader(mat, moving, jaw) {
      mat.customProgramCacheKey = () => "hair-aaa-v1-" + (moving ? "sway" : jaw ? "jaw" : "static");
      mat.onBeforeCompile = shader => {
        shader.uniforms.uHairSway = sway; shader.uniforms.uJawOpen = jawOpen;
        shader.uniforms.uSpecPower1 = { value: 40 }; shader.uniforms.uSpecPower2 = { value: 14 };
        shader.uniforms.uShift2 = { value: .10 }; shader.uniforms.uSpecStrength = { value: .20 };
        shader.uniforms.uSpecTint1 = { value: hairColor.clone().lerp(new T.Color("#ffffff"), .6).convertSRGBToLinear() };
        shader.uniforms.uSpecTint2 = { value: specTint2 };
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nattribute vec3 hairTangent;\nvarying vec3 vHairTangent;\nuniform vec2 uHairSway; uniform float uJawOpen;")
          .replace("#include <begin_vertex>", `#include <begin_vertex>
            vHairTangent = normalize(normalMatrix * hairTangent);
            ${(moving || jaw) ? swayGLSL(moving) : ""}`);
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vHairTangent;\nuniform float uSpecPower1, uSpecPower2, uShift2, uSpecStrength;\nuniform vec3 uSpecTint1, uSpecTint2;")
          .replace("#include <lights_physical_pars_fragment>", `#include <lights_physical_pars_fragment>
            void RE_HairAniso(const in IncidentLight light, const in vec3 N, const in vec3 V, inout ReflectedLight reflected) {
              vec3 T = normalize(vHairTangent);
              vec3 H = normalize(light.direction + V);
              float dotTH = dot(T, H);
              float sinTH = sqrt(max(0.0, 1.0 - dotTH * dotTH));
              float primary = pow(sinTH, uSpecPower1);
              float secondary = pow(clamp(sinTH - uShift2, 0.0, 1.0), uSpecPower2);
              reflected.directSpecular += light.color * (primary * uSpecTint1 + secondary * uSpecTint2) * uSpecStrength;
            }`);
        const direct = "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );";
        shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>",
          T.ShaderChunk.lights_fragment_begin.split(direct).join(direct + "\nRE_HairAniso(directLight, geometryNormal, geometryViewDir, reflectedLight);"));
      };
    }
    function depthShader(mat, moving) {
      mat.customProgramCacheKey = () => "hair-depth-" + (moving ? "sway" : "jaw");
      mat.onBeforeCompile = shader => {
        shader.uniforms.uHairSway = sway; shader.uniforms.uJawOpen = jawOpen;
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nuniform vec2 uHairSway; uniform float uJawOpen;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\n" + swayGLSL(moving));
      };
    }
    function mesh(target, name, moving = false) {
      if (!target.p.length) return;
      const geometry = new T.BufferGeometry();
      geometry.setAttribute("position", new T.Float32BufferAttribute(target.p, 3));
      geometry.setAttribute("uv", new T.Float32BufferAttribute(target.uv, 2));
      geometry.setAttribute("color", new T.Float32BufferAttribute(target.colors, 3));
      if (target.t.length) geometry.setAttribute("hairTangent", new T.Float32BufferAttribute(target.t, 3));
      geometry.setIndex(target.indices); geometry.computeVertexNormals();
      const jaw = name === "beard-hair-cards";
      if (jaw) {
        const pos = geometry.attributes.position, nrm = geometry.attributes.normal;
        for (let i = 0; i < pos.count; i++) {
          const vx = pos.getX(i), jL = Math.hypot(vx / .075, -.15, .6) || 1;
          const nx = nrm.getX(i) * .35 + (vx / .075 / jL) * .65;
          const ny = nrm.getY(i) * .35 + (-.15 / jL) * .65;
          const nz = nrm.getZ(i) * .35 + (.6 / jL) * .65;
          const l = Math.hypot(nx, ny, nz) || 1;
          nrm.setXYZ(i, nx / l, ny / l, nz / l);
        }
        nrm.needsUpdate = true;
      }
      const finish = moving || jaw ? material.clone() : material;
      hairShader(finish, moving, jaw);
      const object = skinned(geometry, finish, () => [["head", 1]]);
      object.name = name;
      object.renderOrder = 1;
      if (jaw) { object.castShadow = false; object.receiveShadow = false; }
      // The atlas casts the same cutout silhouette as the visible fibres.
      object.customDepthMaterial = new T.MeshDepthMaterial({ depthPacking: T.RGBADepthPacking, map: maps(T).hair, alphaTest: .23, side: T.DoubleSide });
      if (moving || jaw) depthShader(object.customDepthMaterial, moving);
      return object;
    }
    mesh(fixed, "groomed-hair-cards");
    mesh(flowing, "shoulder-length-hair-cards", true);
    mesh(beard, "beard-hair-cards");
    if (fibres.p.length) {
      const geometry = new T.BufferGeometry();
      geometry.setAttribute("position", new T.Float32BufferAttribute(fibres.p, 3));
      geometry.setAttribute("color", new T.Float32BufferAttribute(fibres.colors, 3));
      geometry.setIndex(fibres.indices); geometry.computeVertexNormals();
      const finish = new T.MeshPhysicalMaterial({
        color: hairColor, roughness: .64, vertexColors: true,
        sheen: .36, sheenColor: hairColor.clone().lerp(new T.Color("#9d8873"), .22), sheenRoughness: .56
      });
      const beardMesh = skinned(geometry, finish, () => [["head", 1]]);
      beardMesh.name = "beard-individual-fibres";
      beardMesh.castShadow = false; beardMesh.receiveShadow = false;
      finish.onBeforeCompile = shader => {
        shader.uniforms.uJawOpen = jawOpen;
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uJawOpen;")
          .replace("#include <begin_vertex>", `#include <begin_vertex>
            float jawWeight = 1. - smoothstep(${(mouth[1] - .018).toFixed(4)}, ${(mouth[1] + .006).toFixed(4)}, position.y);
            transformed.y -= uJawOpen * .012 * jawWeight; transformed.z -= uJawOpen * .004 * jawWeight;
          `);
      };
      finish.customProgramCacheKey = () => "beard-fibres-jaw";
    }
    return { sway, jawOpen };
  }

  // A rectangular sheet, settled against an elliptical torso with gravity and
  // stretch/shear constraints. This bake is reused by the animated skinned mesh.
  function mantle(T, { shoulderY, pelvisY, length, look }) {
    const columns = 40, rows = 28, p = [], uv = [], colors = [], indices = [];
    const previous = [], pinned = [];
    const width = .98;
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
      const u = col / columns, v = row / rows, a = 1.44 + u * (Math.PI * 2 - 2.88);
      const shoulderDrop = Math.pow(Math.abs(Math.sin(a)), 1.8) * .034;
      const topY = shoulderY + .034 - shoulderDrop - Math.cos(a) * .012;
      let fold = 0;
      for (const [center, amplitude, spread, drift] of [[.08,.010,.032,.04],[.24,.008,.042,-.03],[.45,.014,.055,.05],[.69,.010,.036,-.04],[.91,.013,.042,.025]]) {
        fold += bell(u - center - v * drift, spread * (.55 + v * .7)) * amplitude * (.3 + v * .7);
      }
      const x = Math.sin(a) * (.228 + v * .022 - Math.min(1, v * 2.4) * .018 + fold);
      const z = Math.cos(a) * (.172 - Math.min(1, v * 2.4) * .010 + v * .022 + fold);
      const y = topY - v * length + Math.sin(u * Math.PI) * v * v * .018;
      p.push(x, y, z); previous.push(x, y, z);
      pinned.push(row === 0 && ((col >= 5 && col <= 11) || (col >= 15 && col <= 25) || (col >= columns - 11 && col <= columns - 5)));
      uv.push(u, 1 - v);
      const wear = row > rows - 2 ? .065 : 0;
      const tone = .97 - wear + (noise(col, row) - .5) * .025;
      colors.push(tone, tone * .99, tone * .97);
      if (row && col) { const n = row * (columns + 1) + col; indices.push(n, n - 1, n - columns - 1, n - 1, n - columns - 2, n - columns - 1); }
    }
    const constraints = [];
    const connect = (a, b, rest) => constraints.push([a, b, rest]);
    for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
      const n = row * (columns + 1) + col;
      if (col < columns) connect(n, n + 1, width / columns);
      if (row < rows) connect(n, n + columns + 1, length / rows);
      if (row < rows && col < columns) {
        const diagonal = Math.hypot(width / columns, length / rows);
        connect(n, n + columns + 2, diagonal);
        connect(n + 1, n + columns + 1, diagonal);
      }
    }
    for (let step = 0; step < 48; step++) {
      for (let n = 0; n < pinned.length; n++) if (!pinned[n]) {
        const i = n * 3;
        for (let axis = 0; axis < 3; axis++) {
          const value = p[i + axis];
          p[i + axis] += (value - previous[i + axis]) * .78 - (axis === 1 ? .0005 : 0);
          previous[i + axis] = value;
        }
      }
      for (let iteration = 0; iteration < 3; iteration++) {
        for (const [a, b, rest] of constraints) {
          const ai = a * 3, bi = b * 3;
          const dx = p[bi] - p[ai], dy = p[bi + 1] - p[ai + 1], dz = p[bi + 2] - p[ai + 2];
          const distance = Math.hypot(dx, dy, dz) || 1;
          const error = (distance - rest) / distance * .38;
          const wa = pinned[a] ? 0 : pinned[b] ? 1 : .5, wb = pinned[b] ? 0 : pinned[a] ? 1 : .5;
          p[ai] += dx * error * wa; p[bi] -= dx * error * wb;
          p[ai + 1] += dy * error * wa; p[bi + 1] -= dy * error * wb;
          p[ai + 2] += dz * error * wa; p[bi + 2] -= dz * error * wb;
        }
        for (let n = 0; n < pinned.length; n++) if (!pinned[n]) {
          const i = n * 3, t = clamp((p[i + 1] - pelvisY) / (shoulderY - pelvisY));
          const rx = .235 + Math.pow(t, 2.5) * .058, rz = .178 + Math.pow(t, 2.5) * .016;
          const radius = Math.hypot(p[i] / rx, p[i + 2] / rz);
          if (radius < 1) { p[i] /= Math.max(.1, radius); p[i + 2] /= Math.max(.1, radius); }
        }
      }
    }
    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(p, 3));
    geometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
    geometry.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals();
    const edge = (start, stride, count) => Array.from({ length: count }, (_, i) => p.slice((start + i * stride) * 3, (start + i * stride) * 3 + 3));
    return { geometry, edges: [edge(0, columns + 1, rows + 1), edge(columns, columns + 1, rows + 1), edge(rows * (columns + 1), 1, columns + 1)] };
  }

  function spring(T, stiffness = 64, damping = 13) {
    const uniform = { value: new T.Vector2() }, velocity = new T.Vector2();
    return { uniform, update(x, z, elapsed) {
      const steps = Math.max(1, Math.ceil(elapsed / .016)), dt = elapsed / steps;
      for (let i = 0; i < steps; i++) {
        velocity.x += ((x - uniform.value.x) * stiffness - velocity.x * damping) * dt;
        velocity.y += ((z - uniform.value.y) * stiffness - velocity.y * damping) * dt;
        uniform.value.x = clamp(uniform.value.x + velocity.x * dt, -.035, .035);
        uniform.value.y = clamp(uniform.value.y + velocity.y * dt, -.035, .035);
      }
    } };
  }

  function batchGarments(T, root, skeleton) {
    const groups = new Map();
    for (const mesh of [...root.children]) {
      if (!mesh.isSkinnedMesh || mesh.geometry.morphAttributes.position?.length ||
        !/^(woven-tunic|sleeve-|rectangular-wool|mantle-|tunic-hem|garment-corner|knotted-woven|headcloth-rolled)/.test(mesh.name)) continue;
      const group = groups.get(mesh.material) || [];
      group.push(mesh); groups.set(mesh.material, group);
    }
    for (const [material, parts] of groups) {
      if (parts.length < 2) continue;
      const arrays = { position: [], normal: [], uv: [], color: [], skinIndex: [], skinWeight: [] }, indices = [];
      let offset = 0;
      for (const part of parts) {
        const count = part.geometry.attributes.position.count;
        for (const [name, values] of Object.entries(arrays)) {
          const itemSize = name === "uv" ? 2 : name.startsWith("skin") ? 4 : 3;
          const attribute = part.geometry.attributes[name];
          if (attribute) for (const value of attribute.array) values.push(value);
          else for (let i = 0; i < count * itemSize; i++) values.push(name === "color" ? 1 : 0);
        }
        if (part.geometry.index) for (const index of part.geometry.index.array) indices.push(index + offset);
        else for (let i = 0; i < count; i++) indices.push(i + offset);
        offset += count; part.removeFromParent(); part.geometry.dispose();
      }
      const geometry = new T.BufferGeometry();
      for (const [name, values] of Object.entries(arrays)) {
        const size = name === "uv" ? 2 : name.startsWith("skin") ? 4 : 3;
        geometry.setAttribute(name, name === "skinIndex" ? new T.Uint16BufferAttribute(values, size) : new T.Float32BufferAttribute(values, size));
      }
      geometry.setIndex(indices);
      const mesh = new T.SkinnedMesh(geometry, material);
      mesh.name = "batched-garments-" + material.id;
      mesh.userData.parts = parts.map(p => p.name);
      root.add(mesh); mesh.bind(skeleton); mesh.frustumCulled = false; mesh.castShadow = mesh.receiveShadow = true;
    }
  }

  globalThis.CharacterDetail = { sculpt, expressions, skin, groom, maps, mantle, spring, batchGarments };
})();
