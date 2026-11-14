(() => {
  "use strict";

  // All maps are deterministic, shared by the renderer and available offline.
  const resources = new WeakMap();
  const hairTexCache = new WeakMap();
  const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
  const fract = value => value - Math.floor(value);
  const hash2 = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
  const noise = (x, y) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
  const bell = (x, width) => Math.exp(-((x / width) ** 2));

  function noise2(x, y) {
    const ix = Math.floor(x), iy = Math.floor(y);
    const fx = x - ix, fy = y - iy;
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy);
    const b = hash2(ix + 1, iy);
    const c = hash2(ix, iy + 1);
    const d = hash2(ix + 1, iy + 1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function gauss(val, center, width) {
    const d = (val - center) / width;
    return Math.exp(-(d * d));
  }

  function gauss2(x, y, cx, cy, wx, wy) {
    const dx = (x - cx) / wx, dy = (y - cy) / wy;
    return Math.exp(-(dx * dx + dy * dy));
  }

  function gauss3(x, y, z, cx, cy, cz, wx, wy, wz) {
    const dx = (x - cx) / wx, dy = (y - cy) / wy, dz = (z - cz) / wz;
    return Math.exp(-(dx * dx + dy * dy + dz * dz));
  }

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
    const lutSize = 256;
    const sssLutPixels = new Uint8Array(lutSize * lutSize * 4);
    for (let y = 0; y < lutSize; y++) {
      const curvature = (y + 1) / lutSize;
      for (let x = 0; x < lutSize; x++) {
        const ndotl = (x / (lutSize - 1)) * 2 - 1;
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

  // 1. Craniofacial & Cervical Anatomical Sculpting with orbital-aperture guard
  function sculpt(positions, landmarks, look = {}) {
    const eyeL = landmarks["joint-l-eye"] || [.032, 1.59, .095];
    const eyeY = eyeL[1];
    const eyeX = Math.abs(eyeL[0]);
    const eyeZ = eyeL[2];
    const female = look.gender === "female";
    const age = clamp(look.age ?? .35);
    const cheekStrength = look.cheek ?? .35;
    const chinStrength = look.chin ?? .30;
    const noseBridge = look.noseBridge ?? .25;
    const noseWidth = look.noseWidth ?? .20;
    const faceWidth = look.faceWidth ?? .20;
    const mouthY = eyeY - .065;
    const neckY = eyeY - .155;

    const count = positions.length / 3;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      let x = positions[idx], y = positions[idx + 1], z = positions[idx + 2];
      const absX = Math.abs(x);
      const signX = x >= 0 ? 1 : -1;

      if (y > neckY - .10 && y < eyeY + .16) {
        // Keep the excised orbital opening and palpebral rim clear of inward shifts.
        const eyeDist = Math.hypot(absX - eyeX, y - eyeY);
        const orbitSafe = (1 - bell(eyeDist - .015, .006)) * clamp((eyeDist - .007) / .008);

        if (z > eyeZ - .02) {
          const browArch = gauss2(absX, y, eyeX * .95, eyeY + .018, .024, .0095) * orbitSafe;
          const glabella = gauss2(absX, y, .005, eyeY + .017, .0055, .011);
          const browProminence = (female ? .0012 : .0028) + age * .0008;
          z += browArch * browProminence;
          y -= browArch * (female ? -.0005 : .0007) + age * browArch * .0010;
          const corrugator = gauss2(absX, y, .0065, eyeY + .018, .0022, .010);
          z -= corrugator * (.0005 + age * .0011) - glabella * .0006;
        }

        if (z > -.01) {
          const malar = gauss3(absX, y, z, .052, eyeY - .021, eyeZ - .015, .022, .018, .038);
          const zygomaticArch = gauss3(absX, y, z, .066, eyeY - .016, eyeZ - .042, .014, .012, .035);
          const buccalHollow = gauss3(absX, y, z, .048, mouthY + .010, eyeZ - .022, .018, .020, .032);
          const malarPush = (.0018 + cheekStrength * .0028) * (female ? 1.08 : 1.0);
          x += signX * (malar * malarPush + zygomaticArch * .0016);
          z += malar * malarPush * .85;
          y += malar * .0008;
          const hollowFactor = (.0012 + age * .0022 + (female ? -.0004 : .0005));
          x -= signX * buccalHollow * hollowFactor;
          z -= buccalHollow * hollowFactor * .65;
        }

        if (z > eyeZ - .015) {
          const troughY = eyeY - .011 - Math.max(0, absX - eyeX * .65) * .18;
          const tearTrough = gauss2(absX, y, eyeX * .92, troughY, .016, .0038) * orbitSafe;
          const orbitalBag = gauss2(absX, y, eyeX * .95, troughY + .0042, .014, .0032) * orbitSafe;
          z -= tearTrough * (.0007 + age * .0014);
          z += orbitalBag * (age * .0011);
        }

        if (absX < .032 && z > eyeZ - .01) {
          const bridge = gauss2(absX, y, 0, eyeY - .012, .0085, .018);
          const nasalTip = gauss2(absX, y, 0, eyeY - .034, .0095, .0085);
          const alarWing = gauss2(absX, y, .0155, eyeY - .038, .0065, .0065);
          const alarCrease = gauss2(absX, y, .0175, eyeY - .035, .0032, .0060);
          const nostrilCavity = gauss2(absX, y, .0095, eyeY - .0425, .0042, .0032);
          z += bridge * (.0012 + noseBridge * .0024) + nasalTip * .0018;
          x += signX * alarWing * (.0008 + noseWidth * .0018);
          z -= alarCrease * .0011;
          y += nostrilCavity * .0012;
          z -= nostrilCavity * .0008;
        }

        if (z > eyeZ - .025) {
          const nlfProgress = clamp((eyeY - .034 - y) / .036);
          const nlfCenterX = .018 + nlfProgress * .014;
          const nlfMask = gauss(y, mouthY + .014, .019);
          const nlfCrease = gauss(absX, nlfCenterX, .0036) * nlfMask;
          const nlfFoldPad = gauss(absX, nlfCenterX + .0055, .0055) * nlfMask;
          const nlfDepth = .0008 + age * .0022;
          z -= nlfCrease * nlfDepth;
          x -= signX * nlfCrease * nlfDepth * .35;
          z += nlfFoldPad * nlfDepth * .72;

          const marMask = gauss(y, mouthY - .016, .014);
          const marCrease = gauss(absX, .024 + (mouthY - y) * .12, .0035) * marMask;
          z -= marCrease * (age * .0016);
        }

        if (absX < .036 && Math.abs(y - mouthY) < .028 && z > eyeZ - .02) {
          const philtrumGroove = gauss2(absX, y, 0, mouthY + .013, .0032, .0075);
          const philtrumRidge = gauss2(absX, y, .0048, mouthY + .012, .0022, .0075);
          const cupidPeak = gauss2(absX, y, .0052, mouthY + .0048, .0038, .0022);
          const upperVermilion = gauss2(absX, y, 0, mouthY + .0028, .019, .0028);
          const lowerVermilion = gauss2(absX, y, 0, mouthY - .0038, .017, .0034);
          const oralCommissure = gauss2(absX, y, .0235, mouthY, .0045, .0032);
          const labiomental = gauss2(absX, y, 0, mouthY - .0135, .014, .0045);

          z -= philtrumGroove * .0011;
          z += philtrumRidge * .00085 + cupidPeak * .0009;
          y += cupidPeak * .0005;
          const lipFullness = female ? 1.22 : 1.0;
          z += (upperVermilion * .0014 + lowerVermilion * .0018) * lipFullness;
          z -= oralCommissure * .0014 + labiomental * .0012;
        }

        if (y < mouthY + .005 && y > neckY - .02) {
          const chinTip = gauss3(absX, y, z, .007, mouthY - .031, eyeZ - .005, .014, .012, .025);
          const gonialAngle = gauss3(absX, y, z, .058, mouthY - .018, .012, .016, .018, .028);
          const jowlSag = gauss3(absX, y, z, .036, mouthY - .028, .048, .016, .012, .024);
          z += chinTip * (.0012 + chinStrength * .0026);
          x += signX * gonialAngle * ((female ? .0006 : .0022) + faceWidth * .0015);
          y -= jowlSag * (age * .0026);
          x += signX * jowlSag * (age * .0012);
        }

        const temple = gauss3(absX, y, z, .064, eyeY + .016, .035, .014, .022, .028);
        x -= signX * temple * (.0008 + age * .0014);
        if (y < neckY + .02 && y > neckY - .09 && z > -.01) {
          const scmT = clamp((neckY + .01 - y) / .09);
          const scmX = .042 * (1 - scmT * .72);
          const scm = gauss(absX, scmX, .0085) * gauss(z, .025 + scmT * .035, .025);
          const suprasternal = gauss2(absX, y, 0, neckY - .075, .011, .014) * gauss(z, .055, .025);
          z += scm * .0016 - suprasternal * .0022;
        }
      }

      positions[idx] = x;
      positions[idx + 1] = y;
      positions[idx + 2] = z;
    }
  }

  // 2. FACS Expressive Micro-Morph Targets (Morph 3: Brow Engage, Morph 4: Cheek/Duchenne Warmth)
  function expressions(T, positions, landmarks, mouth) {
    const count = positions.length / 3;
    const eyeL = landmarks["joint-l-eye"] || [.032, 1.59, .095];
    const eyeY = eyeL[1];
    const eyeX = Math.abs(eyeL[0]);
    const eyeZ = eyeL[2];
    const mouthY = mouth ? mouth[1] : eyeY - .065;
    const mouthZ = mouth ? mouth[2] : eyeZ;

    const browEngage = new Float32Array(count * 3);
    const cheekWarmth = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const x = positions[idx], y = positions[idx + 1], z = positions[idx + 2];
      const absX = Math.abs(x);
      const signX = x >= 0 ? 1 : -1;

      if (y > mouthY - .04 && z > .01) {
        const innerBrow = gauss3(absX, y, z, eyeX * .62, eyeY + .018, eyeZ, .018, .014, .035);
        const midBrow = gauss3(absX, y, z, eyeX * 1.02, eyeY + .020, eyeZ - .005, .020, .013, .035);
        const frontalis = gauss3(absX, y, z, eyeX * .75, eyeY + .042, eyeZ - .010, .032, .022, .040);
        const upperLid = gauss3(absX, y, z, eyeX, eyeY + .007, eyeZ + .004, .014, .005, .018);

        browEngage[idx] = signX * midBrow * .0006;
        browEngage[idx + 1] = innerBrow * .0042 + midBrow * .0034 + frontalis * .0022 + upperLid * .0012;
        browEngage[idx + 2] = (innerBrow + midBrow) * .0008 - frontalis * .0004;

        const lipCorner = gauss3(absX, y, z, .023, mouthY, mouthZ - .006, .014, .011, .024);
        const malarLift = gauss3(absX, y, z, .044, eyeY - .026, eyeZ - .012, .024, .020, .035);
        const lowerLidSquint = gauss3(absX, y, z, eyeX * 1.05, eyeY - .009, eyeZ, .016, .006, .020);
        const alarFlare = gauss3(absX, y, z, .016, eyeY - .038, eyeZ + .008, .008, .007, .016);

        cheekWarmth[idx] = signX * (lipCorner * .0036 + malarLift * .0016 + alarFlare * .0012);
        cheekWarmth[idx + 1] = lipCorner * .0038 + malarLift * .0032 + lowerLidSquint * .0014 + alarFlare * .0005;
        cheekWarmth[idx + 2] = -lipCorner * .0022 + malarLift * .0024 + lowerLidSquint * .0006;
      }
    }

    const attrBrow = new T.Float32BufferAttribute(browEngage, 3);
    attrBrow.name = "brow-engage";
    const attrCheek = new T.Float32BufferAttribute(cheekWarmth, 3);
    attrCheek.name = "cheek-warmth";
    return [attrBrow, attrCheek];
  }

  // 3. Biophysical Skin Material (Pre-Integrated SSS LUT + Thickness + Micro-Normal + 3D Pores/Wrinkles)
  function skin(T, part, look, landmarks, mouth) {
    const shared = maps(T);
    const eye = landmarks["joint-l-eye"] || [.032, 1.59, .095];
    const eyeY = eye[1], eyeX = Math.abs(eye[0]);
    const ageVal = clamp(look.age ?? .35);
    const skinColor = new T.Color(look.skin || "#c69472");
    const sheenColor = skinColor.clone().lerp(new T.Color("#ffe3cc"), .68);
    const uv = [], thickness = [];
    const p = part.attributes.position;
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
      vertexColors: true, roughness: .56, metalness: 0,
      normalMap: shared.skinNormal, normalScale: new T.Vector2(.16, .16),
      roughnessMap: shared.skinRoughness,
      ior: 1.42, clearcoat: .09, clearcoatRoughness: .34,
      sheen: .24, sheenColor, sheenRoughness: .72
    });
    material.name = "skin-sss-thickness-micropore";
    material.userData.subsurface = "preintegrated-skin-sss-lut+thickness-translucency+micro-normal";
    material.customProgramCacheKey = () => "character-skin-3a-sss-v3";
    material.onBeforeCompile = shader => {
      shader.uniforms.uEyeY = { value: eyeY };
      shader.uniforms.uEyeX = { value: eyeX };
      shader.uniforms.uMouth = { value: new T.Vector3(...mouth) };
      shader.uniforms.uAge = { value: ageVal };
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
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>${declarations}
          float skinHash3(vec3 p) {
            p = fract(p * vec3(443.897, 441.423, 437.195));
            p += dot(p, p.yzx + 19.19);
            return fract((p.x + p.y) * p.z);
          }
          float skinNoise3(vec3 p) {
            vec3 i = floor(p);
            vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(
              mix(mix(skinHash3(i), skinHash3(i + vec3(1,0,0)), f.x),
                  mix(skinHash3(i + vec3(0,1,0)), skinHash3(i + vec3(1,1,0)), f.x), f.y),
              mix(mix(skinHash3(i + vec3(0,0,1)), skinHash3(i + vec3(1,0,1)), f.x),
                  mix(skinHash3(i + vec3(0,1,1)), skinHash3(i + vec3(1,1,1)), f.x), f.y),
              f.z
            );
          }
        `)
        .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
          float absSkinX = abs(vSkinPoint.x);
          float frontSkin = smoothstep(.06, .12, vSkinPoint.z);
          float headMask = smoothstep(uEyeY - .16, uEyeY - .10, vSkinPoint.y);
          float skinLip = exp(-pow((vSkinPoint.y - uMouth.y) / .007, 2.)) * (1. - smoothstep(.020, .035, absSkinX)) * frontSkin;
          float noseOil = exp(-(pow(vSkinPoint.x / .021, 2.) + pow((vSkinPoint.y - (uEyeY - .024)) / .028, 2.)));
          float foreheadOil = exp(-(pow(vSkinPoint.x / .055, 2.) + pow((vSkinPoint.y - (uEyeY + .042)) / .032, 2.)));
          float cheekOil = exp(-(pow((absSkinX - .034) / .022, 2.) + pow((vSkinPoint.y - (uEyeY - .026)) / .022, 2.)));
          float skinTzone = clamp((noseOil * .85 + foreheadOil * .65 + cheekOil * .50) * frontSkin * headMask, 0.0, 1.0);
          float poreScale = mix(340.0, 480.0, noseOil);
          float cellNoise1 = skinNoise3(vSkinPoint * poreScale);
          float cellNoise2 = skinNoise3(vSkinPoint * (poreScale * 2.1) + vec3(17.3, 9.1, 31.7));
          float porePit = -pow(max(0.0, 1.0 - cellNoise1 * 1.45), 2.6) * (.42 + .58 * (noseOil + cheekOil));
          roughnessFactor = clamp(roughnessFactor - skinTzone * .13 - skinLip * .18 - porePit * .05 + uAge * .035, .22, .80);
        `)
        .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
          float foreheadMask = exp(-pow((vSkinPoint.y - uEyeY - .052) / .028, 2.)) * (1. - smoothstep(.040, .068, absSkinX)) * smoothstep(.08, .13, vSkinPoint.z);
          float fineCrease = pow(.5 + .5 * sin((vSkinPoint.y - uEyeY) * 680. + cos(vSkinPoint.x * 42.) * 1.4), 8.);
          float canthusAngle = atan(vSkinPoint.y - uEyeY, absSkinX - uEyeX);
          float crowsFeetMask = exp(-(pow((absSkinX - (uEyeX + .018)) / .014, 2.) + pow((vSkinPoint.y - uEyeY) / .016, 2.))) * frontSkin;
          float crowsFeet = sin(canthusAngle * 18.0 + cellNoise1 * 1.5) * crowsFeetMask * (.15 + uAge * .65);
          float lipGrooves = sin(vSkinPoint.x * 1150.0 + cellNoise2 * 1.8) * skinLip * .40;
          float creaseHeight = (fineCrease * foreheadMask * (.000022 + uAge * .000055)
            + crowsFeet * .000035 + lipGrooves * .000028 + (porePit + (cellNoise2 - .5) * .28) * .000032 * frontSkin * headMask);
          vec3 dpdx = -dFdx(vViewPosition), dpdy = -dFdy(vViewPosition);
          vec3 r1 = cross(dpdy, normal), r2 = cross(normal, dpdx);
          float determinant = dot(dpdx, r1);
          vec3 gradient = sign(determinant) * (dFdx(creaseHeight) * r1 + dFdy(creaseHeight) * r2);
          normal = normalize(abs(determinant) * normal - gradient);
          vec3 microN = texture2D(uSkinMicroNormal, vSkinUv * uMicroRepeat).xyz * 2.0 - 1.0;
          vec3 microT = normalize(cross(dpdy, normal) + vec3(1e-6));
          vec3 microB = cross(normal, microT);
          float poreZone = smoothstep(.02, .09, vSkinPoint.z) * (1.0 - smoothstep(.055, .085, absSkinX));
          normal = normalize(normal + (microN.x * microT + microN.y * microB) * uMicroStrength * (.35 + poreZone * .65));
        `)
        .replace("#include <lights_physical_pars_fragment>", `#include <lights_physical_pars_fragment>
          void RE_SkinScattering(const in IncidentLight light, const in vec3 N, const in vec3 V, inout ReflectedLight reflected) {
            float ear = smoothstep(.064, .086, abs(vSkinPoint.x)) * exp(-pow((vSkinPoint.y - uEyeY + .006) / .043, 2.));
            float nose = exp(-pow(vSkinPoint.x / .020, 2.)) * exp(-pow((vSkinPoint.y - uEyeY + .034) / .020, 2.));
            float lips = exp(-pow((vSkinPoint.y - uMouth.y) / .008, 2.)) * (1. - smoothstep(.018, .036, abs(vSkinPoint.x)));
            float thickness = clamp(vSkinThickness + ear * .18 + nose * .06, 0.0, 1.0);

            vec3 dNdx = dFdx(N), dNdy = dFdy(N);
            float geomCurv = clamp(length(dNdx) + length(dNdy), 0.08, 0.85);
            float anatCurv = clamp(geomCurv + ear * 0.45 + nose * 0.35 + lips * 0.25, 0.05, 0.95);

            float NdotL = dot(N, light.direction);
            vec2 lutUv = vec2(clamp(NdotL * 0.5 + 0.5, 0.005, 0.995), anatCurv);
            vec3 sssProfile = texture2D(uSkinSssLut, lutUv).rgb;
            vec3 scatterAlbedo = mix(vec3(1.0), uTransColor * 1.6 + 0.35, thickness * 0.5);
            reflected.directDiffuse += light.color * sssProfile * scatterAlbedo * uSssStrength * (0.35 + thickness * 0.5);

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

  // 4. Anisotropic Hair & Beard Shader (Marschner / Kajiya-Kay Dual-Lobe Specular + Procedural Fiber Texture)
  function hairFiberTexture(T) {
    if (hairTexCache.has(T)) return hairTexCache.get(T);
    const size = 256;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const p = (y * size + x) * 4;
        const s1 = Math.sin(nx * 96 * Math.PI * 2 + noise2(nx * 24, ny * 8) * 1.8) * .5;
        const s2 = Math.sin(nx * 210 * Math.PI * 2 + noise2(nx * 64, ny * 16) * 2.4) * .35;
        const cuticleScale = Math.sin(ny * 160 * Math.PI * 2) * .12;
        const dx = (s1 + s2) * 1.9;
        const dy = cuticleScale;
        const len = Math.hypot(dx, dy, 1.0);
        pixels[p] = Math.round(((-dx / len) * .5 + .5) * 255);
        pixels[p + 1] = Math.round(((-dy / len) * .5 + .5) * 255);
        pixels[p + 2] = Math.round(((1.0 / len) * .5 + .5) * 255);
        pixels[p + 3] = 255;
      }
    }
    const tex = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    tex.wrapS = tex.wrapT = T.RepeatWrapping;
    tex.magFilter = T.LinearFilter;
    tex.minFilter = T.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    tex.repeat.set(4, 2);
    tex.needsUpdate = true;
    hairTexCache.set(T, tex);
    return tex;
  }

  function createAnisotropicHairMaterial(T, hexColor, swayUniform, jawUniform = null, age = 0, isBeard = false, mouthY = 1.52) {
    const baseCol = new T.Color(hexColor || "#322318");
    const greyCol = new T.Color("#b8b2a6");
    const agedBase = age > .50 ? baseCol.clone().lerp(greyCol, (age - .50) * (isBeard ? .82 : .65)) : baseCol;
    const secondaryTint = agedBase.clone().multiplyScalar(1.45).lerp(new T.Color("#d99b66"), .28);

    const mat = new T.MeshPhysicalMaterial({
      color: agedBase,
      vertexColors: true,
      roughness: .56,
      metalness: .02,
      normalMap: hairFiberTexture(T),
      normalScale: new T.Vector2(.28, .08),
      sheen: .38,
      sheenColor: secondaryTint,
      sheenRoughness: .48,
      side: T.DoubleSide
    });

    mat.name = isBeard ? "anisotropic-beard-3a" : "anisotropic-hair-3a";
    mat.customProgramCacheKey = () => "witness-hair-marschner-v3-" + (isBeard ? "beard-" + mouthY.toFixed(3) : "cranial");
    mat.onBeforeCompile = shader => {
      shader.uniforms.uHairSway = swayUniform || { value: new T.Vector2() };
      shader.uniforms.uJawOpen = jawUniform || { value: 0 };
      shader.uniforms.uSecondaryTint = { value: secondaryTint };
      shader.uniforms.uGreyAmount = { value: Math.max(0, (age - .44) * (isBeard ? .95 : .72)) };

      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>
          uniform vec2 uHairSway;
          uniform float uJawOpen;
          varying vec3 vHairTangentView;
          varying vec2 vHairUv;
          varying float vStrandSeed;
        `)
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          vHairUv = uv;
          vStrandSeed = fract(sin(dot(position.xyz, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
          float tipWeight = pow(clamp(uv.y, 0.0, 1.0), 1.65);
          transformed.x += uHairSway.x * tipWeight;
          transformed.z += uHairSway.y * tipWeight;
          ${isBeard ? `
            float jawInfluence = smoothstep(0.015, -0.045, position.y - ${mouthY.toFixed(4)}) * clamp(0.35 + uv.y * 0.65, 0.0, 1.0);
            transformed.y -= uJawOpen * 0.024 * jawInfluence;
            transformed.z -= uJawOpen * 0.009 * jawInfluence;
          ` : ""}
          vec3 approxTangent = normalize(vec3(position.x * 0.35, -1.0, position.z * 0.35));
          vHairTangentView = normalize(normalMatrix * approxTangent);
        `);

      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>
          uniform vec3 uSecondaryTint;
          uniform float uGreyAmount;
          varying vec3 vHairTangentView;
          varying vec2 vHairUv;
          varying float vStrandSeed;
        `)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float strandHash = fract(sin(floor(vHairUv.x * 48.0) * 127.1 + floor(vStrandSeed * 23.0) * 311.7) * 43758.5453);
          float silverStrand = step(1.0 - clamp(uGreyAmount, 0.0, 0.78), strandHash);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.78, 0.76, 0.72), silverStrand * 0.68);
          diffuseColor.rgb *= 0.94 + 0.20 * strandHash;
        `)
        .replace("#include <dithering_fragment>", `#include <dithering_fragment>
          vec3 T_dir = normalize(vHairTangentView);
          vec3 V_dir = normalize(vViewPosition);
          vec3 L_dir = normalize(vec3(0.35, 0.78, 0.52));
          vec3 H_dir = normalize(L_dir + V_dir);
          float strandShift = sin(vHairUv.x * 180.0) * 0.045;
          vec3 T1 = normalize(T_dir + normal * (-0.14 + strandShift));
          vec3 T2 = normalize(T_dir + normal * (0.22 + strandShift));
          float dotTH1 = dot(T1, H_dir);
          float dotTH2 = dot(T2, H_dir);
          float sinTH1 = sqrt(max(0.0, 1.0 - dotTH1 * dotTH1));
          float sinTH2 = sqrt(max(0.0, 1.0 - dotTH2 * dotTH2));
          float dirAtten = smoothstep(-1.0, 0.0, dot(T_dir, H_dir));
          float specPrimary = dirAtten * pow(sinTH1, 72.0) * 0.16;
          float specSecondary = dirAtten * pow(sinTH2, 24.0) * 0.22;
          float rootTipMask = smoothstep(0.0, 0.18, vHairUv.y) * (1.0 - smoothstep(0.82, 1.0, vHairUv.y) * 0.45);
          gl_FragColor.rgb += (vec3(0.95, 0.93, 0.88) * specPrimary + uSecondaryTint * specSecondary) * rootTipMask;
        `);
    };

    return mat;
  }

  function appendSculptedLock(T, arrays, controlPoints, widthRoot, widthTip, thickness, curlAmp = 0, curlFreq = 2, layerShade = 1.0, radialCenter = null) {
    const { vertices, indices, colors, uvs } = arrays;
    const curve = new T.CatmullRomCurve3(controlPoints.map(pt => new T.Vector3(...pt)));
    const lengthSegs = 12;
    const crossSegs = 4;
    const baseVertex = vertices.length / 3;

    for (let i = 0; i <= lengthSegs; i++) {
      const v = i / lengthSegs;
      const pt = curve.getPoint(v);
      const tan = curve.getTangent(v);
      const radial = radialCenter
        ? new T.Vector3(pt.x - radialCenter[0], pt.y - radialCenter[1], pt.z - radialCenter[2])
        : new T.Vector3(pt.x, 0, pt.z - .02);
      if (radial.lengthSq() < .0001) radial.set(0, 1, 0);
      radial.normalize();
      const binorm = new T.Vector3().crossVectors(tan, radial);
      if (binorm.lengthSq() < .0001) binorm.set(1, 0, 0);
      binorm.normalize();
      const norm = new T.Vector3().crossVectors(binorm, tan).normalize();

      const taper = v < .15
        ? (.78 + (v / .15) * .22)
        : Math.pow(1 - (v - .15) / .85, .82);
      const halfW = T.MathUtils.lerp(widthTip, widthRoot, taper) * .5;
      const curThick = thickness * Math.sin(v * Math.PI);

      const wavePhase = v * curlFreq * Math.PI * 2;
      const waveSide = Math.sin(wavePhase) * curlAmp * v;
      const waveOut = (Math.cos(wavePhase) * .5 + .5) * curlAmp * .65 * v;

      const rootAO = .80 + .20 * Math.pow(v, .45);
      const tipLighten = 1.0 + Math.pow(v, 2.2) * .12;

      for (let j = 0; j <= crossSegs; j++) {
        const u = j / crossSegs;
        const s = (u - .5) * 2;
        const arch = (1 - s * s) * curThick;
        const vx = pt.x + binorm.x * (s * halfW + waveSide) + norm.x * (arch + waveOut);
        const vy = pt.y + binorm.y * (s * halfW + waveSide) + norm.y * (arch + waveOut);
        const vz = pt.z + binorm.z * (s * halfW + waveSide) + norm.z * (arch + waveOut);
        vertices.push(vx, vy, vz);

        const edgeDarken = 1.0 - Math.abs(s) * .08;
        const cVal = rootAO * tipLighten * edgeDarken * layerShade;
        colors.push(cVal, cVal * .99, cVal * .97);
        uvs.push(u, v);

        if (i > 0 && j > 0) {
          const rowStride = crossSegs + 1;
          const a = baseVertex + i * rowStride + j;
          const b = a - rowStride;
          indices.push(a - 1, b - 1, a, b - 1, b, a);
        }
      }
    }
  }

  function buildGroomGeometry(T, arrays) {
    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(arrays.vertices, 3));
    geo.setAttribute("color", new T.Float32BufferAttribute(arrays.colors, 3));
    geo.setAttribute("uv", new T.Float32BufferAttribute(arrays.uvs, 2));
    geo.setIndex(arrays.indices);
    geo.computeVertexNormals();
    return geo;
  }

  // 5. Complete Groom System fitted to actual skull geometry & character profiles
  function groom(T, config) {
    const { look, positions, landmarks, mouth, headTop, faceDepth, skinned, sway } = config;
    const jawOpen = { value: 0 };
    const eyeL = landmarks["joint-l-eye"] || [.032, 1.59, .095];
    const eyeY = eyeL[1];
    const eyeX = Math.abs(eyeL[0]);
    const eyeZ = eyeL[2];
    const mY = mouth ? mouth[1] : eyeY - .065;
    const mZ = mouth ? mouth[2] : eyeZ;
    const female = look.gender === "female";
    const age = look.age ?? .35;
    const hairStyle = look.hair || (female ? "braids" : "waves");
    const beardLen = female ? 0 : (look.beard ?? 0);
    const hairMat = createAnisotropicHairMaterial(T, look.hairColor, sway, null, age, false, mY);
    const beardMat = createAnisotropicHairMaterial(T, look.hairColor, sway, jawOpen, age, true, mY);

    // Sample actual sculpted cranial vertices so cap and locks fit any faceWidth/age/gender without clipping.
    const centerY = headTop - .125, centerZ = .046;
    const headVertices = [];
    if (positions) {
      for (let i = 0; i < positions.length; i += 3) {
        if (positions[i + 1] <= eyeY + .025) continue;
        const x = positions[i], y = positions[i + 1] - centerY, z = positions[i + 2] - centerZ;
        const radius = Math.hypot(x, y, z) || .1;
        headVertices.push([x / radius, y / radius, z / radius, radius]);
      }
    }
    function scalp(angle, polar, lift = .0020) {
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
    const hairline = angle => 1.67 - Math.cos(angle) * (hairStyle === "receding" ? .65 : .32)
      + Math.sin(angle * 5.0 + .5) * .055 + Math.sin(angle * 11.0) * .023;

    // A. Sculpted Eyebrows
    const browArrays = { vertices: [], indices: [], colors: [], uvs: [] };
    for (const side of [-1, 1]) {
      const innerX = side * (eyeX * .50);
      const archX = side * (eyeX * 1.06);
      const tailX = side * (eyeX * 1.48);
      const innerY = eyeY + (female ? .0175 : .0150);
      const archY = eyeY + (female ? .0220 : .0185);
      const tailY = eyeY + (female ? .0155 : .0130);
      const thick = female ? .0052 : .0076;

      for (let layer = -1; layer <= 1; layer++) {
        const yOff = layer * .0012;
        const pts = [
          [innerX, innerY + yOff, faceDepth(innerX, innerY) + .0018],
          [(innerX + archX) * .5, (innerY + archY) * .5 + .0012 + yOff, faceDepth((innerX + archX) * .5, archY) + .0024],
          [archX, archY + yOff, faceDepth(archX, archY) + .0022],
          [tailX, tailY + yOff * .5, Math.max(eyeZ - .014, faceDepth(tailX, tailY)) + .0015]
        ];
        appendSculptedLock(T, browArrays, pts, thick * (1 - Math.abs(layer) * .25), thick * .28, .0018, 0, 1, layer === 0 ? 1.0 : .88);
      }
    }
    if (browArrays.vertices.length > 0) {
      const browGeo = buildGroomGeometry(T, browArrays);
      const browMesh = skinned(browGeo, hairMat, () => [["head", 1]]);
      browMesh.name = "anatomical-eyebrows-3a";
      browMesh.castShadow = false; browMesh.receiveShadow = false;
    }

    // B. Multi-Layered Cranial Hair (Fitted Under-Cap + Crown & Flowing Shoulder Locks)
    if (hairStyle !== "none" && hairStyle !== "bald") {
      const hairArrays = { vertices: [], indices: [], colors: [], uvs: [] };
      const isShort = ["crop", "short", "tonsure"].includes(hairStyle);
      const isReceding = hairStyle === "receding";
      const isCurly = hairStyle === "curls" || hairStyle === "wavy";
      const rawLen = look.hairLength ?? (female ? .16 : .045);
      const dropLen = isShort ? .035 : isReceding ? .055 : (female ? .195 : .045 + rawLen * .92);
      const curlAmp = isCurly ? .0072 : hairStyle === "waves" ? .0048 : .0024;
      const curlFreq = isCurly ? 3.0 : 1.9;

      // Layer 0: Cranial under-cap fitted directly to scalp()
      const capRings = 14, capSegs = 40;
      const capBase = hairArrays.vertices.length / 3;
      for (let r = 0; r <= capRings; r++) {
        const tr = r / capRings;
        for (let s = 0; s <= capSegs; s++) {
          const ts = s / capSegs;
          const a = ts * Math.PI * 2;
          const pt = scalp(a, tr * hairline(a), .0016);
          hairArrays.vertices.push(pt[0], pt[1], pt[2]);
          const shade = .58 + .24 * (1 - tr);
          hairArrays.colors.push(shade, shade * .98, shade * .96);
          hairArrays.uvs.push(ts, tr * .4);
          if (r > 0 && s > 0) {
            const stride = capSegs + 1;
            const cur = capBase + r * stride + s;
            const prev = cur - stride;
            hairArrays.indices.push(cur, prev, cur - 1, cur - 1, prev, prev - 1);
          }
        }
      }

      // Layer 1: Crown & parting locks anchored seamlessly on scalp() with spherical radial center
      const crownCenter = [0, centerY, centerZ];
      const crownLocks = isReceding ? 22 : 34;
      for (let l = 0; l < crownLocks; l++) {
        const a = l * 2.399963;
        const edge = hairline(a);
        const p0 = .14 + hash2(l, 10) * Math.max(.08, edge - .24);
        const turn = (Math.sin(a) > 0 ? 1 : -1) * (.05 + hash2(l, 11) * .06);
        const pEnd = Math.min(edge + .035, p0 + .38 + hash2(l, 12) * .22);
        const pt0 = scalp(a, p0, .0018);
        const pt1 = scalp(a + turn * .35, (p0 + pEnd) * .5, .0042);
        const pt2 = scalp(a + turn, pEnd, .0024);
        appendSculptedLock(T, hairArrays, [pt0, pt1, pt2], .022 + hash2(l, 13) * .008, .007, .0022, .0014, 1.4, .92 + hash2(l, 14) * .12, crownCenter);
      }

      // Layer 2: Flowing back/side locks for medium & long Levantine hair (staggered dense curtain)
      if (!isShort && !isReceding && (female || rawLen > .03)) {
        const numFlow = 34;
        const aSpan = Math.PI * 2 - 1.96;
        for (let l = 0; l < numFlow; l++) {
          const u = l / (numFlow - 1);
          const a = .98 + u * aSpan;
          const edge = hairline(a);
          const lenScale = .88 + .24 * hash2(l, 21);
          const lockLen = dropLen * lenScale;
          for (let tier = 0; tier < 2; tier++) {
            const aStagger = a + (tier === 1 ? (.5 / numFlow) * aSpan : 0);
            const lift = .0022 + tier * .0034;
            const jitter = (hash2(l * 2 + tier, 29) - .5) * .007;
            const root = scalp(aStagger, edge - .28 - tier * .10, lift);
            const mid1 = scalp(aStagger + jitter * .5, Math.min(edge + .05, edge - .02), lift + .0040);
            const x = Math.sin(aStagger) * (.088 + tier * .004), z = centerZ + Math.cos(aStagger) * (.098 + tier * .004);
            const mid2 = [x * 1.07 + jitter, root[1] - lockLen * .54, z + (Math.cos(aStagger) < 0 ? -.006 : .004)];
            const tip = [x * 1.04 + jitter * 1.2, root[1] - lockLen, z - .010];
            appendSculptedLock(
              T, hairArrays,
              [root, mid1, mid2, tip],
              .028 - tier * .003,
              .011,
              .0036,
              curlAmp * (1 + tier * .25),
              curlFreq,
              tier === 0 ? .90 : 1.02,
              crownCenter
            );
          }
        }
      }

      // Braided front locks for female styles
      if (hairStyle === "braids") {
        for (const side of [-1, 1]) {
          for (let b = 0; b < 2; b++) {
            const bx = side * (.072 + b * .007), bz = .006 - b * .014;
            appendSculptedLock(
              T, hairArrays,
              [[bx, eyeY + .02, bz], [bx + side * .006, eyeY - .06, bz + .008], [bx * .92, eyeY - .14, bz + .018], [bx * .82, eyeY - .21, bz + .024]],
              .013, .006, .0042, .0032, 5.5, b === 0 ? .96 : .86
            );
          }
        }
      }

      const hairGeo = buildGroomGeometry(T, hairArrays);
      const hairMesh = skinned(hairGeo, hairMat, point => {
        const neckBlend = T.MathUtils.smoothstep(point.y, eyeY - .15, eyeY - .06);
        return [["head", neckBlend], ["spine_03", 1 - neckBlend]];
      });
      hairMesh.name = "cranial-hair-groom-3a";
      hairMesh.castShadow = true; hairMesh.receiveShadow = false;
    }

    // C. Volumetric Jaw-Coupled Beard & Mustache
    if (beardLen > .012) {
      const beardArrays = { vertices: [], indices: [], colors: [], uvs: [] };
      const lightStubble = beardLen < .028;

      // Mustache sweeps
      for (const side of [-1, 1]) {
        for (let m = 0; m < 4; m++) {
          const t = m / 3;
          const startX = side * (.0025 + t * .015);
          const startY = mY + .0085 - t * .0025;
          const startZ = faceDepth(startX, startY) + .0022;
          const midX = side * (.012 + t * .015);
          const midY = mY + .002 - t * .0045;
          const midZ = faceDepth(midX, midY) + .0034;
          const endX = side * (.021 + t * .013);
          const endY = mY - .007 - t * .006 - Math.min(.014, beardLen * .25);
          const endZ = faceDepth(endX, mY - .007) + .0024;
          appendSculptedLock(
            T, beardArrays,
            [[startX, startY, startZ], [midX, midY, midZ], [endX, endY, endZ]],
            lightStubble ? .0054 : .0074, .0028, lightStubble ? .0018 : .0025, .0010, 1.4, .95 + (1 - t) * .06
          );
        }
      }

      // Soul patch below lower lip
      appendSculptedLock(
        T, beardArrays,
        [
          [0, mY - .008, mZ + .0016],
          [0, mY - .017, faceDepth(0, mY - .017) + .0028],
          [0, mY - .025 - beardLen * .22, faceDepth(0, mY - .024) + .0022]
        ],
        lightStubble ? .0078 : .0110, .0038, .0024, .0008, 1.2, .94
      );

      // Multi-tiered jawline, cheek-feathered & chin beard locks (continuous z-depth & staggered rows prevent sawtooth)
      const dropTotal = lightStubble ? (.008 + beardLen * .65) : (.014 + beardLen * 1.15);
      const lockCount = 30;
      const layers = lightStubble ? 1 : 2;
      const zSurf = (px, py, absU) => {
        const jawZ = faceDepth(px, Math.min(eyeY - .038, py));
        const sideZ = eyeZ - .018 - Math.max(0, absU - .56) * .065;
        return (absU > .56 ? T.MathUtils.lerp(jawZ, sideZ, T.MathUtils.smoothstep(absU, .56, .88)) : Math.max(.055, jawZ));
      };
      for (let layer = 0; layer < layers; layer++) {
        const layerOut = (lightStubble ? .0015 : .0026) * layer;
        for (let i = 0; i < lockCount; i++) {
          const uRaw = (i + layer * .5) / (lockCount - 1 + (layers > 1 ? .5 : 0));
          const u = uRaw * 2 - 1;
          const absU = Math.abs(u);
          const rx = u * (lightStubble ? .061 : .063);
          const ry = mY - .016 + Math.pow(absU, 1.65) * .034 - layer * .0035;
          const rz = zSurf(rx, ry, absU) + .0024 + layerOut * .5;
          const localLen = dropTotal * (1.0 - Math.pow(absU, 1.65) * .68);
          const jitter = (hash2(i, layer + 11) - .5) * .0035;
          const x1 = rx * .96 + jitter, y1 = ry - localLen * .38;
          const x2 = rx * .88 + jitter * 1.4, y2 = ry - localLen * .74;
          const x3 = rx * .78 + jitter * 1.6, y3 = ry - localLen;
          const z1 = Math.max(rz + .0026, zSurf(x1, y1, absU) + .0028) + layerOut;
          const z2 = Math.max(rz + .0032, zSurf(x2, y2, absU) + .0030) + layerOut;
          const z3 = rz + .0018 + layerOut * .7;
          appendSculptedLock(
            T, beardArrays,
            [[rx, ry, rz], [x1, y1, z1], [x2, y2, z2], [x3, y3, z3]],
            (lightStubble ? .0090 : .0126) - layer * .0018,
            lightStubble ? .0036 : .0054,
            lightStubble ? .0022 : .0034,
            (lightStubble ? .0008 : .0020) + beardLen * .003,
            2.2,
            layer === 0 ? .90 : 1.02
          );
        }
      }

      const beardGeo = buildGroomGeometry(T, beardArrays);
      const beardMesh = skinned(beardGeo, beardMat, () => [["head", 1]]);
      beardMesh.name = "facial-beard-groom-3a";
      beardMesh.castShadow = false; beardMesh.receiveShadow = false;
    }

    return { sway, jawOpen };
  }

  // 6. Parametric Levantine Mantle / Himation Rest Grid (41x29 Topology for CharacterCloth)
  function mantle(T, { shoulderY, pelvisY, length, look = {} }) {
    const mcols = 41, mrows = 29;
    const positions = new Float32Array(mcols * mrows * 3);
    const veiled = look.headcover === "veil";
    const fullCloak = look.cloak === "shoulder" || veiled;
    // Wrap from behind/over outer shoulders cleanly clear of upper arms so pinRow stays streamlined.
    const halfSweep = fullCloak ? Math.PI * .56 : Math.PI * .48;

    for (let r = 0; r < mrows; r++) {
      const tr = r / (mrows - 1);
      const baseY = shoulderY + .018 - tr * length;
      const baseWidth = .192 + tr * .094;
      const baseDepth = .144 + tr * .076;

      for (let c = 0; c < mcols; c++) {
        const tc = c / (mcols - 1);
        const angle = (tc - .5) * 2 * halfSweep;
        const theta = Math.PI + angle; // PI is straight back (-Z)
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        const pipeFold = (Math.sin(tc * Math.PI * 10) * .58
          + Math.sin(tc * Math.PI * 18 + 1.2) * .28
          + Math.cos(tc * Math.PI * 6 - .7) * .14) * tr * .014;

        let vx = sinT * (baseWidth + pipeFold);
        const scapularClear = (1 - Math.min(1, tr / .32)) * Math.max(0, -cosT) * .026;
        let vz = cosT * (baseDepth + pipeFold * .85) - scapularClear + .008;
        const edgeCatenary = Math.sin(tc * Math.PI) * .016 * tr;
        const shoulderSlope = -Math.pow(Math.abs(sinT), 1.45) * .044 * (1 - tr * .65);
        const vy = baseY + shoulderSlope - edgeCatenary;

        const idx = (r * mcols + c) * 3;
        positions[idx] = vx;
        positions[idx + 1] = vy;
        positions[idx + 2] = vz;
      }
    }

    const geo = new T.BufferGeometry();
    geo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    return { geometry: geo };
  }

  // 7. Sub-Stepped Semi-Implicit Damped Harmonic Oscillator for Secondary Hair & Cloth Lag
  function spring(T, stiffness = 60, damping = 10) {
    const uniform = { value: new T.Vector2(0, 0) };
    let vx = 0, vy = 0;
    return {
      uniform,
      update(targetX, targetY, delta) {
        const dt = Math.min(.05, Math.max(.001, delta));
        const steps = 2;
        const h = dt / steps;
        for (let s = 0; s < steps; s++) {
          const ax = (targetX - uniform.value.x) * stiffness - vx * damping;
          const ay = (targetY - uniform.value.y) * stiffness - vy * damping;
          vx += ax * h;
          vy += ay * h;
          uniform.value.x += vx * h;
          uniform.value.y += vy * h;
        }
        uniform.value.x = clamp(uniform.value.x, -.048, .048);
        uniform.value.y = clamp(uniform.value.y, -.048, .048);
      }
    };
  }

  // 8. Static Garment Batching & Tangent Space Optimization (preserves sandals, corner fringes, cloth, hair & body)
  function batchGarments(T, root, skeleton) {
    const groups = new Map();
    const garmentAllow = /^(woven-tunic|sleeve-|tunic-neckline|knotted-woven|headcloth-rolled|draped-|sash-drape|cord-waist|leather-waist|sash-waist|towel-waist|footwashing-|agal-headband)/;

    for (const child of [...root.children]) {
      if (!child.isSkinnedMesh || !child.geometry) continue;
      if (child.geometry.attributes.uv && child.geometry.attributes.normal && child.geometry.index && !child.geometry.attributes.tangent) {
        try { child.geometry.computeTangents(); } catch (_) {}
      }

      if (!garmentAllow.test(child.name) ||
          child.userData.corner !== undefined ||
          (child.geometry.morphAttributes?.position?.length > 0)) {
        continue;
      }

      const hasUV = Boolean(child.geometry.attributes.uv);
      const hasColor = Boolean(child.geometry.attributes.color);
      const key = `${child.material.uuid}|uv:${hasUV}|col:${hasColor}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(child);
    }

    for (const [, meshes] of groups) {
      if (meshes.length < 2) continue;

      let totalVerts = 0, totalIndices = 0;
      for (const m of meshes) {
        totalVerts += m.geometry.attributes.position.count;
        totalIndices += m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count;
      }
      if (totalVerts > 65534) continue;

      const templateAttr = meshes[0].geometry.attributes;
      const hasUV = Boolean(templateAttr.uv);
      const hasColor = Boolean(templateAttr.color);

      const posArr = new Float32Array(totalVerts * 3);
      const normArr = new Float32Array(totalVerts * 3);
      const uvArr = hasUV ? new Float32Array(totalVerts * 2) : null;
      const colArr = hasColor ? new Float32Array(totalVerts * 3) : null;
      const skinIdxArr = new Uint8Array(totalVerts * 4);
      const skinWgtArr = new Float32Array(totalVerts * 4);
      const indexArr = new Uint16Array(totalIndices);

      let vOffset = 0, iOffset = 0;
      const mergedNames = [];

      for (const m of meshes) {
        const g = m.geometry;
        const vCount = g.attributes.position.count;
        posArr.set(g.attributes.position.array, vOffset * 3);
        if (g.attributes.normal) normArr.set(g.attributes.normal.array, vOffset * 3);
        if (hasUV && g.attributes.uv) uvArr.set(g.attributes.uv.array, vOffset * 2);
        if (hasColor && g.attributes.color) colArr.set(g.attributes.color.array, vOffset * 3);
        if (g.attributes.skinIndex) skinIdxArr.set(g.attributes.skinIndex.array, vOffset * 4);
        if (g.attributes.skinWeight) skinWgtArr.set(g.attributes.skinWeight.array, vOffset * 4);

        if (g.index) {
          const srcIdx = g.index.array;
          for (let k = 0; k < srcIdx.length; k++) indexArr[iOffset + k] = srcIdx[k] + vOffset;
          iOffset += srcIdx.length;
        } else {
          for (let k = 0; k < vCount; k++) indexArr[iOffset + k] = vOffset + k;
          iOffset += vCount;
        }

        vOffset += vCount;
        mergedNames.push(m.name);
        root.remove(m);
        g.dispose();
      }

      const mergedGeo = new T.BufferGeometry();
      mergedGeo.setAttribute("position", new T.Float32BufferAttribute(posArr, 3));
      mergedGeo.setAttribute("normal", new T.Float32BufferAttribute(normArr, 3));
      if (uvArr) mergedGeo.setAttribute("uv", new T.Float32BufferAttribute(uvArr, 2));
      if (colArr) mergedGeo.setAttribute("color", new T.Float32BufferAttribute(colArr, 3));
      mergedGeo.setAttribute("skinIndex", new T.Uint8BufferAttribute(skinIdxArr, 4));
      mergedGeo.setAttribute("skinWeight", new T.Float32BufferAttribute(skinWgtArr, 4));
      mergedGeo.setIndex(new T.BufferAttribute(indexArr, 1));
      if (uvArr) {
        try { mergedGeo.computeTangents(); } catch (_) {}
      }

      const batchedMesh = new T.SkinnedMesh(mergedGeo, meshes[0].material);
      batchedMesh.name = "batched-" + mergedNames[0];
      batchedMesh.userData.parts = mergedNames;
      root.add(batchedMesh);
      batchedMesh.bind(skeleton);
      batchedMesh.frustumCulled = false;
      batchedMesh.castShadow = true;
      batchedMesh.receiveShadow = true;
    }
  }

  globalThis.CharacterDetail = {
    sculpt,
    expressions,
    skin,
    groom,
    maps,
    mantle,
    spring,
    batchGarments
  };
})();
