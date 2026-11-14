(() => {
  "use strict";

  let decoded;
  function unpack(Type, encoded) {
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    return new Type(bytes.buffer);
  }

  function data() {
    if (decoded) return decoded;
    const source = AdventureHumanData;
    decoded = {
      ...source,
      indices: unpack(Uint16Array, source.indices),
      skinIndex: unpack(Uint8Array, source.skinIndex),
      skinWeight: unpack(Uint8Array, source.skinWeight),
      variants: Object.fromEntries(Object.entries(source.variants).map(([name, value]) =>
        [name, { ...value, positions: unpack(Float32Array, value.positions) }])),
      morphs: Object.fromEntries(Object.entries(source.morphs).map(([name, value]) => [name, {
        indices: unpack(Uint16Array, value.indices), values: unpack(Float32Array, value.values), landmarks: value.landmarks
      }]))
    };
    return decoded;
  }

  function hash(text) {
    let value = 2166136261;
    for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619);
    return value >>> 0;
  }

  // Deterministic 2D hash & smooth value/FBM/Voronoi noise for 3A procedural micro-surfaces
  function fract(x) {
    return x - Math.floor(x);
  }

  function hash2(x, y) {
    return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
  }

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

  function tileNoise2(x, y, periodX, periodY) {
    const ix = ((Math.floor(x) % periodX) + periodX) % periodX;
    const iy = ((Math.floor(y) % periodY) + periodY) % periodY;
    const ix1 = (ix + 1) % periodX;
    const iy1 = (iy + 1) % periodY;
    const fx = x - Math.floor(x), fy = y - Math.floor(y);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy);
    const b = hash2(ix1, iy);
    const c = hash2(ix, iy1);
    const d = hash2(ix1, iy1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  function voronoiTile(x, y, cells) {
    const gx = Math.floor(x), gy = Math.floor(y);
    const fx = x - gx, fy = y - gy;
    let d1 = 8.0, d2 = 8.0;
    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const cx = ((gx + ox) % cells + cells) % cells;
        const cy = ((gy + oy) % cells + cells) % cells;
        const px = ox + hash2(cx, cy) * .82 + .09 - fx;
        const py = oy + hash2(cy + 19, cx + 47) * .82 + .09 - fy;
        const d = px * px + py * py;
        if (d < d1) { d2 = d1; d1 = d; }
        else if (d < d2) { d2 = d; }
      }
    }
    const s1 = Math.sqrt(d1), s2 = Math.sqrt(d2);
    return { cell: s1, crease: Math.max(0, 1 - (s2 - s1) * 4.5) };
  }

  function geometry(T, positions, indices, colors = null, precomputedNormals = null) {
    const result = new T.BufferGeometry();
    result.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    result.setIndex(Array.isArray(indices) ? indices : new T.BufferAttribute(indices, 1));
    if (colors) result.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    if (precomputedNormals) {
      result.setAttribute("normal", new T.Float32BufferAttribute(precomputedNormals, 3));
    } else {
      result.computeVertexNormals();
    }
    return result;
  }

  function addMorph(positions, source, amount) {
    for (let i = 0; i < source.indices.length; i++) {
      const offset = source.indices[i] * 3;
      for (let axis = 0; axis < 3; axis++) positions[offset + axis] += source.values[i * 3 + axis] * amount;
    }
  }

  function denseMorph(count, source) {
    const positions = new Float32Array(count * 3);
    addMorph(positions, source, 1);
    return positions;
  }

  // 3A High-Definition Procedural Textile & Leather Normal Maps (512x512 seamless)
  const textileCache = new WeakMap();
  function textile(T, kind) {
    if (!textileCache.has(T)) textileCache.set(T, new Map());
    const cache = textileCache.get(T);
    if (cache.has(kind)) return cache.get(kind);
    const size = 512;
    const height = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const idx = y * size + x;
        if (kind === "linen") {
          // Plain-weave hand-spun flax linen: power-of-2 cycle count avoids hardware mipmap aliasing while macro slubs add natural character
          const warpPhase = nx * 8 * Math.PI * 2;
          const weftPhase = ny * 8 * Math.PI * 2;
          const warpSlub = .76 + .48 * tileNoise2(nx * 4, ny * 12, 4, 12);
          const weftSlub = .76 + .48 * tileNoise2(nx * 12, ny * 4, 12, 4);
          const warp = (Math.cos(warpPhase) * .5 + .5) * warpSlub;
          const weft = (Math.cos(weftPhase) * .5 + .5) * weftSlub;
          const overUnder = Math.sin(warpPhase * .5) * Math.sin(weftPhase * .5);
          const weight = .5 + .22 * overUnder;
          const macroSlub = (tileNoise2(nx * 6, ny * 6, 6, 6) - .5) * .28;
          const microFuzz = (tileNoise2(nx * 20, ny * 20, 20, 20) - .5) * .16;
          height[idx] = (warp * weight + weft * (1 - weight)) * .38 + macroSlub + microFuzz;
        } else if (kind === "wool") {
          // Balanced Levantine twill/herringbone wool with carded-fiber variation (power-of-2 period prevents diagonal screen moire)
          const diagA = (nx * 8 + ny * 8) * Math.PI * 2;
          const diagB = (nx * 8 - ny * 8) * Math.PI * 2;
          const twill = Math.cos(diagA) * .16 + Math.sin(diagB) * .12;
          const yarnSlub = (tileNoise2(nx * 8, ny * 16, 8, 16) - .5) * .36;
          const felt1 = (tileNoise2(nx * 12, ny * 12, 12, 12) - .5) * .34;
          const felt2 = (tileNoise2(nx * 28, ny * 28, 28, 28) - .5) * .20;
          height[idx] = twill + yarnSlub + felt1 + felt2;
        } else if (kind === "haircloth") {
          // Coarse goat-hair cilice / sackcloth with heavy slub cords and bristles
          const cord = Math.sin(nx * 8 * Math.PI * 2) * .30 + Math.cos(ny * 8 * Math.PI * 2) * .22;
          const bristle = (tileNoise2(nx * 24, ny * 8, 24, 8) - .5) * .48;
          const knot = Math.pow(tileNoise2(nx * 10, ny * 10, 10, 10), 2.5) * .42;
          height[idx] = cord + bristle + knot;
        } else {
          // Full-grain vegetable-tanned leather with Voronoi cellular pebbles, pores & micro-creases
          const v1 = voronoiTile(nx * 16, ny * 16, 16);
          const v2 = voronoiTile(nx * 32, ny * 32, 32);
          const pebble = (1 - v1.cell * .65) * .50 - v1.crease * .26;
          const subGrain = (1 - v2.cell * .55) * .22 - v2.crease * .12;
          const pore = Math.pow(tileNoise2(nx * 40, ny * 40, 40, 40), 4) * -.20;
          height[idx] = pebble + subGrain + pore;
        }
      }
    }
    const pixels = new Uint8Array(size * size * 4);
    const scale = kind === "haircloth" ? .95 : kind === "wool" ? .65 : kind === "leather" ? 1.25 : .58;
    for (let y = 0; y < size; y++) {
      const yPrev = (y - 1 + size) % size, yNext = (y + 1) % size;
      for (let x = 0; x < size; x++) {
        const p = (y * size + x) * 4;
        const xPrev = (x - 1 + size) % size, xNext = (x + 1) % size;
        // 3x3 Sobel operator for crisp, low-aliasing tangent normals
        const tl = height[yPrev * size + xPrev], tc = height[yPrev * size + x], tr = height[yPrev * size + xNext];
        const ml = height[y * size + xPrev], mr = height[y * size + xNext];
        const bl = height[yNext * size + xPrev], bc = height[yNext * size + x], br = height[yNext * size + xNext];
        const dx = ((tr + 2 * mr + br) - (tl + 2 * ml + bl)) * .25 * scale;
        const dy = ((bl + 2 * bc + br) - (tl + 2 * tc + tr)) * .25 * scale;
        const len = Math.hypot(dx, dy, 1.0);
        pixels[p] = Math.round(((-dx / len) * .5 + .5) * 255);
        pixels[p + 1] = Math.round(((-dy / len) * .5 + .5) * 255);
        pixels[p + 2] = Math.round(((1.0 / len) * .5 + .5) * 255);
        pixels[p + 3] = 255;
      }
    }
    const normal = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    normal.wrapS = normal.wrapT = T.RepeatWrapping;
    normal.magFilter = T.LinearFilter;
    normal.minFilter = T.LinearMipmapLinearFilter;
    normal.anisotropy = 4;
    normal.generateMipmaps = true;
    normal.repeat.set(kind === "leather" ? 8 : 6, kind === "leather" ? 8 : 5);
    normal.needsUpdate = true;
    cache.set(kind, normal);
    return normal;
  }

  const textileRoughCache = new WeakMap();
  function textileRoughness(T, kind) {
    if (!textileRoughCache.has(T)) textileRoughCache.set(T, new Map());
    const cache = textileRoughCache.get(T);
    if (cache.has(kind)) return cache.get(kind);
    const size = 256;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const p = (y * size + x) * 4;
        let value;
        if (kind === "linen") {
          const slub = (tileNoise2(nx * 6, ny * 12, 6, 12) - .5) * .09;
          const weave = Math.cos(nx * 8 * Math.PI * 2) * Math.sin(ny * 8 * Math.PI * 2) * .025;
          value = .90 + slub + weave;
        } else if (kind === "wool") {
          const carded = (tileNoise2(nx * 10, ny * 10, 10, 10) - .5) * .07;
          value = .94 + carded;
        } else if (kind === "haircloth") {
          const coarse = (tileNoise2(nx * 12, ny * 8, 12, 8) - .5) * .11;
          value = .91 + coarse;
        } else {
          // Leather: polished crowns on pebbles (lower roughness) and matte crevices (higher roughness)
          const v = voronoiTile(nx * 16, ny * 16, 16);
          const wear = (tileNoise2(nx * 8, ny * 8, 8, 8) - .5) * .12;
          value = .54 + v.crease * .28 + v.cell * .10 + wear;
        }
        const level = Math.round(Math.max(0, Math.min(1, value)) * 255);
        pixels[p] = level; pixels[p + 1] = level; pixels[p + 2] = level; pixels[p + 3] = 255;
      }
    }
    const texture = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.anisotropy = 4;
    texture.generateMipmaps = true;
    texture.repeat.set(kind === "leather" ? 8 : 6, kind === "leather" ? 8 : 5);
    texture.needsUpdate = true;
    cache.set(kind, texture);
    return texture;
  }

  // 3A Sclera Texture with Multi-Branching Dendritic Episcleral Capillaries & Pinguecula Warmth
  const scleraCache = new WeakMap();
  function scleraTexture(T) {
    if (!scleraCache.has(T)) scleraCache.set(T, null);
    const cached = scleraCache.get(T);
    if (cached) return cached;
    const size = 256;
    const pixels = new Uint8Array(size * size * 4);
    const half = size / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const p = (y * size + x) * 4;
        const dx = (x - half) / half, dy = (y - half) / half;
        const r = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);
        // Warm ivory base with subtle organic tissue variation
        const tissueNoise = noise2(dx * 6 + 3.1, dy * 6 + 7.4);
        let red = 241 - tissueNoise * 7;
        let green = 235 - tissueNoise * 9;
        let blue = 226 - tissueNoise * 11;

        // Subtle yellowish pinguecula warmth along the horizontal palpebral fissure
        const fissureWarmth = Math.exp(-((dy / .28) ** 2)) * Math.exp(-(((r - .52) / .24) ** 2));
        red += fissureWarmth * 4;
        green -= fissureWarmth * 3;
        blue -= fissureWarmth * 12;

        // Perilimbal scleral scatter shadow ring around the cornea margin
        const limbalHalo = Math.exp(-(((r - .36) / .08) ** 2)) * .12;
        red *= (1 - limbalHalo);
        green *= (1 - limbalHalo * 1.05);
        blue *= (1 - limbalHalo * 1.1);

        // Outer orbital blood-rich retrobulbar darkening
        const rim = Math.min(1.0, Math.max(0.0, (r - .42) / .58));
        red -= rim * 34;
        green -= rim * 48;
        blue -= rim * 54;

        // Multi-scale branching dendritic blood vessels originating from canthi
        const canthusBias = Math.pow(Math.abs(dx), .65) * Math.min(1.0, Math.max(0.0, (r - .28) / .62));
        if (canthusBias > .02) {
          const warp1 = (noise2(dx * 9 + 1.7, dy * 9 + 4.3) - .5) * .45;
          const warp2 = (noise2(dx * 22 + 8.2, dy * 22 + 2.9) - .5) * .22;
          const trunkTheta = (angle + warp1 + warp2 * (1 - r * .5)) * 18.0;
          const branchTheta = (angle * 2.3 - warp1 * 1.8 + warp2 * 2.4 + r * 3.2) * 34.0;
          const microTheta = (angle * 4.1 + warp2 * 3.5 - r * 6.0) * 62.0;

          const trunk = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(trunkTheta)) * 3.8), 4.0);
          const branch = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(branchTheta)) * 4.5), 5.0) * .65;
          const micro = Math.pow(Math.max(0, 1 - Math.abs(Math.sin(microTheta)) * 5.2), 6.0) * .38;

          const vesselMask = Math.min(1.0, (trunk + branch + micro) * canthusBias * 1.35);
          const deepVein = Math.pow(Math.max(0, 1 - Math.abs(Math.cos(trunkTheta * .6 + 1.1)) * 3.2), 4.0) * canthusBias * .35;

          // Deep episcleral veins (slightly bluish-crimson)
          red = red * (1 - deepVein) + 148 * deepVein;
          green = green * (1 - deepVein) + 74 * deepVein;
          blue = blue * (1 - deepVein) + 88 * deepVein;

          // Superficial conjunctival arterioles (oxygenated crimson)
          red = red * (1 - vesselMask * .68) + 188 * (vesselMask * .68);
          green = green * (1 - vesselMask * .82) + 42 * (vesselMask * .82);
          blue = blue * (1 - vesselMask * .84) + 38 * (vesselMask * .84);
        }

        pixels[p] = Math.round(Math.max(0, Math.min(255, red)));
        pixels[p + 1] = Math.round(Math.max(0, Math.min(255, green)));
        pixels[p + 2] = Math.round(Math.max(0, Math.min(255, blue)));
        pixels[p + 3] = 255;
      }
    }
    const texture = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    scleraCache.set(T, texture);
    return texture;
  }

  // 3A Iris Albedo & Normal Maps (512x512) with Crypts of Fuchs, Collarette, Contraction Furrows & Pupillary Ruff
  const eyeTextureCache = new WeakMap();
  function irisTextures(T, hairColorHex) {
    if (!eyeTextureCache.has(T)) eyeTextureCache.set(T, new Map());
    const cache = eyeTextureCache.get(T);
    const key = hairColorHex || "#423124";
    if (cache.has(key)) return cache.get(key);
    const size = 512;
    const pixels = new Uint8Array(size * size * 4);
    const normalPixels = new Uint8Array(size * size * 4);
    const heightField = new Float32Array(size * size);

    const baseColor = new T.Color(key).multiplyScalar(1.28);
    const stromaColor = baseColor.clone().lerp(new T.Color("#8f6239"), .48);
    const amberRingColor = baseColor.clone().lerp(new T.Color("#b88042"), .55);
    const cryptColor = baseColor.clone().multiplyScalar(.42);
    const ruffColor = new T.Color("#1f120b");
    const limbalColor = new T.Color("#100a06");
    const pupilColor = new T.Color("#040303");
    const half = size / 2;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = y * size + x;
        const p = idx * 4;
        const dx = (x - half) / half, dy = (y - half) / half;
        const r = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        if (r > 1.0) {
          pixels[p] = 210; pixels[p + 1] = 205; pixels[p + 2] = 196; pixels[p + 3] = 0;
          heightField[idx] = 0;
          continue;
        }

        if (r < .25) {
          pixels[p] = Math.round(pupilColor.r * 255);
          pixels[p + 1] = Math.round(pupilColor.g * 255);
          pixels[p + 2] = Math.round(pupilColor.b * 255);
          pixels[p + 3] = 255;
          heightField[idx] = -.15;
          continue;
        }

        const t = (r - .25) / .75;
        // Organic angular warp so radial trabeculae weave and anastomose around crypts
        const angularWarp = (noise2(Math.cos(angle) * 3.5 + r * 6.0, Math.sin(angle) * 3.5 + r * 6.0) - .5) * .22;
        const warpedAngle = angle + angularWarp * Math.sin(t * Math.PI);

        // Multi-frequency radial stroma fibers (trabeculae)
        const f1 = Math.sin(warpedAngle * 42.0) * .11;
        const f2 = Math.sin(warpedAngle * 86.0 + 1.3) * .07;
        const f3 = Math.cos(warpedAngle * 144.0 - .7) * .045;
        const fibers = f1 + f2 + f3;

        // Irregular zigzag Collarette ridge at r ~ 0.48
        const collaretteRadius = .48 + (noise2(Math.cos(angle) * 4.2 + 2.1, Math.sin(angle) * 4.2 + 5.7) - .5) * .065;
        const collaretteDist = (r - collaretteRadius) / .095;
        const collaretteRidge = Math.exp(-(collaretteDist * collaretteDist));

        // Crypts of Fuchs: diamond/lacunar openings near the collarette and ciliary zone
        const cryptNoise = noise2(Math.cos(warpedAngle) * 7.5 + r * 11.0, Math.sin(warpedAngle) * 7.5 - r * 11.0);
        const cryptMask = Math.pow(Math.max(0, cryptNoise - .52) / .48, 2.2)
          * Math.exp(-(((r - .54) / .20) ** 2));

        // Concentric contraction furrows in outer ciliary zone
        const furrow = Math.sin((r - .58) * 52.0 + angularWarp * 4.0) * .045
          * Math.max(0, Math.min(1, (r - .55) / .25)) * (1 - Math.max(0, (r - .85) / .15));

        // Pupillary ruff (dark beaded pigment frill at pupil margin r = 0.25..0.295)
        const ruffFactor = Math.max(0, 1 - (r - .25) / .048);
        const ruffBeads = .75 + .25 * Math.sin(angle * 72.0);

        let c = stromaColor.clone().lerp(baseColor, Math.min(1, t * 1.15));
        c.lerp(amberRingColor, collaretteRidge * .46);
        c.multiplyScalar(1.0 + fibers + collaretteRidge * .18 + furrow);
        c.lerp(cryptColor, cryptMask * .72);
        c.lerp(ruffColor, ruffFactor * ruffBeads * .88);

        // Melanin pigment freckle spots
        const freckle = Math.pow(noise2(dx * 18 + 9.2, dy * 18 + 3.4), 5.0);
        if (freckle > .45 && r > .35 && r < .82) {
          c.lerp(ruffColor, (freckle - .45) * .85);
        }

        // Dark limbal ring blending softly at outer iris margin
        if (r > .78) {
          const limbalBlend = Math.pow((r - .78) / .22, 1.35);
          c.lerp(limbalColor, limbalBlend * .92);
        }

        // Concave iris bowl height + stroma fiber relief + collarette ridge - crypt pits
        const bowlCone = -Math.cos(t * Math.PI * .5) * .35;
        heightField[idx] = bowlCone + fibers * .42 + collaretteRidge * .28 - cryptMask * .45 + furrow * .30;

        pixels[p] = Math.round(Math.min(255, Math.max(0, c.r * 255)));
        pixels[p + 1] = Math.round(Math.min(255, Math.max(0, c.g * 255)));
        pixels[p + 2] = Math.round(Math.min(255, Math.max(0, c.b * 255)));
        pixels[p + 3] = 255;
      }
    }

    // Compute tangent-space normal map from iris height field
    for (let y = 0; y < size; y++) {
      const yPrev = Math.max(0, y - 1), yNext = Math.min(size - 1, y + 1);
      for (let x = 0; x < size; x++) {
        const xPrev = Math.max(0, x - 1), xNext = Math.min(size - 1, x + 1);
        const p = (y * size + x) * 4;
        const dx = (heightField[y * size + xNext] - heightField[y * size + xPrev]) * 2.6;
        const dy = (heightField[yNext * size + x] - heightField[yPrev * size + x]) * 2.6;
        const len = Math.hypot(dx, dy, 1.0);
        normalPixels[p] = Math.round(((-dx / len) * .5 + .5) * 255);
        normalPixels[p + 1] = Math.round(((-dy / len) * .5 + .5) * 255);
        normalPixels[p + 2] = Math.round(((1.0 / len) * .5 + .5) * 255);
        normalPixels[p + 3] = 255;
      }
    }

    const albedo = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    albedo.magFilter = T.LinearFilter;
    albedo.minFilter = T.LinearMipmapLinearFilter;
    albedo.generateMipmaps = true;
    albedo.needsUpdate = true;

    const normal = new T.DataTexture(normalPixels, size, size, T.RGBAFormat);
    normal.magFilter = T.LinearFilter;
    normal.minFilter = T.LinearMipmapLinearFilter;
    normal.generateMipmaps = true;
    normal.needsUpdate = true;

    const bundle = { albedo, normal };
    cache.set(key, bundle);
    return bundle;
  }

  function irisTexture(T, hairColorHex) {
    return irisTextures(T, hairColorHex).albedo;
  }

  function create(T, role, options = {}) {
    const source = data();
    const look = { ...CharacterProfiles.resolve(role, options.appearance), ...options.overrides };
    const identity = look.id;
    const palette = [look.tunic, look.mantle, look.trim, look.skin, look.hairColor,
      look.headcover, look.beard, look.hem];
    const seed = hash(identity === "jesus-supper" ? "jesus" : identity);
    const female = look.gender === "female";
    const beardValue = female ? 0 : (palette[6] ?? 0);
    const template = source.variants[female ? "female" : "male"];
    const landmarks = Object.fromEntries(Object.entries(template.landmarks).map(([name, point]) => [name, [...point]]));
    const jointIndices = new Map(source.bones.map((bone, index) => [bone.name, index]));
    const jointIndex = name => jointIndices.get(name);
    const joint = name => template.joints[jointIndex(name)];
    const root = new T.Group();
    root.name = "character-" + identity;
    root.scale.set(look.build ?? 1, look.height ?? 1, 1);
    root.userData.character = {
      topology: "MakeHuman hm08", bones: source.bones.length, facialMorphs: 5,
      representation: "skinned anatomical mesh", identity, period: look.period,
      costume: look.cloth, sourceNote: look.evidence, kind: look.kind, version: CharacterProfiles.version
    };
    const bones = source.bones.map((entry, index) => {
      const bone = new T.Bone();
      bone.name = entry.name;
      const parent = entry.parent < 0 ? [0, 0, 0] : template.joints[entry.parent];
      bone.position.fromArray(template.joints[index].map((value, axis) => value - parent[axis]));
      return bone;
    });
    source.bones.forEach((entry, index) => {
      if (entry.parent < 0) root.add(bones[index]);
      else bones[entry.parent].add(bones[index]);
    });
    root.updateMatrixWorld(true);
    const skeleton = new T.Skeleton(bones);
    const bone = name => bones[jointIndex(name)];
    const hasBone = name => jointIndices.has(name);
    const rest = bones.map(item => item.position.clone());

    function skinned(part, material, influences) {
      const count = part.attributes.position.count;
      const indices = new Uint8Array(count * 4);
      const weights = new Float32Array(count * 4);
      const point = new T.Vector3();
      for (let index = 0; index < count; index++) {
        point.fromBufferAttribute(part.attributes.position, index);
        influences(point, index).slice(0, 4).forEach(([name, weight], slot) => {
          indices[index * 4 + slot] = jointIndex(name);
          weights[index * 4 + slot] = weight;
        });
      }
      part.setAttribute("skinIndex", new T.Uint8BufferAttribute(indices, 4));
      part.setAttribute("skinWeight", new T.Float32BufferAttribute(weights, 4));
      const object = new T.SkinnedMesh(part, material);
      root.add(object);
      object.bind(skeleton);
      object.normalizeSkinWeights();
      object.frustumCulled = false;
      object.castShadow = true;
      object.receiveShadow = true;
      return object;
    }

    const aged = look.age > .60;
    const positions = new Float32Array(template.positions);
    function feature(name, amount) {
      const morph = source.morphs[name];
      if (!morph) return;
      addMorph(positions, morph, amount);
      for (const [lmName, delta] of Object.entries(morph.landmarks)) {
        for (let axis = 0; axis < 3; axis++) landmarks[lmName][axis] += delta[axis] * amount;
      }
    }
    feature("head-age-incr", look.age);
    feature("head-scale-horiz-incr", look.faceWidth);
    feature("chin-bones-incr", look.chin);
    feature("nose-greek-incr", look.noseBridge);
    feature("nose-width1-incr", look.noseWidth);
    feature("nose-hump-incr", aged ? .28 : .10);
    feature("head-" + look.face, .42);
    for (const side of ["l", "r"]) feature(side + "-cheek-bones-incr", look.cheek);
    CharacterDetail.sculpt(positions, landmarks, look);

    // Precompute welded vertex normals on the complete anatomical mesh BEFORE sleeve culling
    // so the arm boundary under the sleeve cuff never exhibits a lighting normal discontinuity.
    const fullTempGeo = new T.BufferGeometry();
    fullTempGeo.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    fullTempGeo.setIndex(new T.BufferAttribute(source.indices, 1));
    fullTempGeo.computeVertexNormals();
    const fullNormals = new Float32Array(fullTempGeo.attributes.normal.array);
    fullTempGeo.dispose();

    // 3A Biophysical Chromophore & Anatomical Zone Vertex Mapping (Melanin, Hemoglobin, Venous, AO)
    const skinColor = new T.Color(palette[3]);
    const lips = skinColor.clone().lerp(new T.Color(female ? "#96463e" : "#8b473e"), female ? .58 : .52);
    const lipVermilion = skinColor.clone().lerp(new T.Color("#6e312b"), .62);
    const cheek = skinColor.clone().lerp(new T.Color("#aa5642"), .34);
    const foreheadTone = skinColor.clone().lerp(new T.Color("#d6aa76"), .24);
    const earTone = skinColor.clone().lerp(new T.Color("#bc4834"), .52);
    const noseTone = skinColor.clone().lerp(new T.Color("#ad523f"), .38);
    const eyeSocketTone = skinColor.clone().lerp(new T.Color("#5f3f36"), .40);
    const tearTroughTone = skinColor.clone().lerp(new T.Color("#523a3c"), .34 + look.age * .14);
    const chinShadow = skinColor.clone().lerp(female ? new T.Color("#7e6858") : new T.Color("#524b45"), aged ? .30 : .18);
    const noseHighlight = skinColor.clone().lerp(new T.Color("#e4ba8e"), .32);
    const cheekHighlight = skinColor.clone().lerp(new T.Color("#dba97d"), .24);
    const jointHemoglobin = skinColor.clone().lerp(new T.Color("#9e4d3c"), .28);
    const sunBronzeTone = skinColor.clone().lerp(new T.Color("#8b5738"), .22);
    const palmarLightTone = skinColor.clone().lerp(new T.Color("#DFB998"), .26);

    const colors = new Float32Array(positions.length);
    const eye = landmarks["joint-l-eye"];
    const neckJoint = template.joints[jointIndex("neck_01")];
    const elbowJointY = joint("lowerarm_l")[1];
    const wristJointY = joint("hand_l")[1];
    const kneeJointY = joint("calf_l")[1];
    const ankleJointY = joint("foot_l")[1];

    const facePoints = [];
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i + 1] > neckJoint[1] - .12 && positions[i + 2] > .075) {
        facePoints.push([positions[i], positions[i + 1], positions[i + 2]]);
      }
    }
    function faceDepth(x, y) {
      let depth = .09, closest = Infinity, total = 0, weight = 0;
      for (const point of facePoints) {
        const distance = (point[0] - x) ** 2 + (point[1] - y) ** 2;
        if (distance < closest) { closest = distance; depth = point[2]; }
        if (distance < .00045) {
          const influence = 1 / (distance + .000025) ** 2;
          total += point[2] * influence;
          weight += influence;
        }
      }
      return weight ? total / weight : depth;
    }
    const mouthY = eye[1] - .065;
    const mouth = [0, mouthY, faceDepth(0, mouthY)];

    for (let index = 0; index < source.vertexCount; index++) {
      const offset = index * 3;
      const x = positions[offset], y = positions[offset + 1], z = positions[offset + 2];
      const nx = fullNormals[offset], ny = fullNormals[offset + 1], nz = fullNormals[offset + 2];
      const absX = Math.abs(x);

      let color = skinColor.clone();

      if (y > neckJoint[1] - .035) {
        const lipDistance = ((x - mouth[0]) / .029) ** 2 + ((y - mouth[1]) / .0042) ** 2 + ((z - mouth[2]) / .025) ** 2;
        const mouthParting = ((x - mouth[0]) / .022) ** 2 + ((y - mouth[1]) / .0014) ** 2 + ((z - mouth[2]) / .018) ** 2;
        const cupidBow = ((absX - .0055) / .005) ** 2 + ((y - mouth[1] - .0045) / .0025) ** 2;
        const cheekDistance = ((absX - .055) / .043) ** 2 + ((y - eye[1] + .035) / .05) ** 2;
        const noseBridge = (x / .013) ** 2 + ((y - eye[1] + .006) / .030) ** 2;
        const noseTip = (x / .017) ** 2 + ((y - eye[1] + .034) / .016) ** 2;
        const nostril = ((absX - .0165) / .0060) ** 2 + ((y - eye[1] + .0435) / .0050) ** 2;
        const cheekBone = ((absX - .050) / .019) ** 2 + ((y - eye[1] + .020) / .019) ** 2;
        const jawLine = ((absX - .066) / .024) ** 2 + ((y - mouth[1] + .050) / .028) ** 2;
        const nasolabial = ((absX - .028) / .0090) ** 2 + ((y - mouth[1] + .019) / .021) ** 2;
        const philtrum = (x / .0052) ** 2 + ((y - mouth[1] + .014) / .0095) ** 2;
        const noseWall = (x / .026) ** 2 + ((y - eye[1] + .022) / .030) ** 2;
        const browShadow = ((absX - Math.abs(eye[0])) / .021) ** 2 + ((y - eye[1] - .017) / .009) ** 2;
        const tearTrough = ((absX - Math.abs(eye[0]) * .88) / .018) ** 2 + ((y - eye[1] + .013) / .0065) ** 2;
        const templeHollow = ((absX - .068) / .018) ** 2 + ((y - eye[1] - .012) / .024) ** 2;
        const mentolabial = (x / .018) ** 2 + ((y - mouth[1] + .018) / .0055) ** 2;

        // Yellow-golden bone proximity on forehead & brow ridge
        if (y > eye[1] + .022) {
          const fWeight = Math.min(1.0, Math.exp(-((x / .056) ** 2 + ((y - eye[1] - .045) / .042) ** 2)));
          color.lerp(foreheadTone, fWeight * .68);
        } else if (y < eye[1] - .048) {
          color.lerp(chinShadow, .44);
        }

        // Subsurface vascular redness in thin-skinned ears & helix rim
        if (absX > .072 && y > eye[1] - .045 && y < eye[1] + .045 && z < .022) {
          const earHelix = T.MathUtils.smoothstep(absX, .072, .096);
          color.lerp(earTone, .48 + earHelix * .25);
        }

        // Nasal vascular warmth & structural plane shading
        if (absX < .023 && Math.abs(y - eye[1] + .018) < .029 && z > .075) {
          color.lerp(noseTone, .50);
        }
        color.lerp(noseHighlight, Math.exp(-noseBridge) * .27);
        color.lerp(noseHighlight, Math.exp(-noseTip) * .32);
        color.multiplyScalar(1 - Math.exp(-nostril) * .42);
        color.multiplyScalar(1 - Math.exp(-noseWall) * .11);

        // Cheekbone highlight, cupid's bow highlight, jaw, nasolabial, philtrum & mentolabial folds
        color.lerp(cheekHighlight, Math.exp(-cheekBone) * .22);
        color.lerp(noseHighlight, Math.exp(-cupidBow) * .16);
        color.multiplyScalar(1 - Math.exp(-jawLine) * .17);
        color.multiplyScalar(1 - Math.exp(-nasolabial) * (.14 + look.age * .08));
        color.multiplyScalar(1 - Math.exp(-philtrum) * .13);
        color.multiplyScalar(1 - Math.exp(-mentolabial) * .11);
        color.multiplyScalar(1 - Math.exp(-templeHollow) * (.07 + look.age * .06));

        // Orbital socket & infraorbital tear trough venous tint
        const eyeDist = Math.hypot(absX - Math.abs(eye[0]), y - eye[1]);
        if (eyeDist < .027 && z > .035) {
          color.lerp(eyeSocketTone, (1.0 - eyeDist / .027) * .46);
        }
        color.lerp(tearTroughTone, Math.exp(-tearTrough) * .38);
        color.multiplyScalar(1 - Math.exp(-browShadow) * .19);

        // Micro-pore & age weathering variation on facial skin
        const poreMicro = (noise2(x * 380 + y * 120, y * 380 - z * 210) - .5) * (.035 + look.age * .045);
        color.multiplyScalar(1 + poreMicro);

        // Follicular beard stubble & root shadow
        if (beardValue > .02) {
          const beardTop = mouth[1] - .004 + absX / .078 * .044;
          const beardBottom = mouth[1] - .040 - beardValue * .75 + absX / .078 * .064;
          if (y < beardTop + .008 && y > beardBottom && absX < .081 && z > .082) {
            const feather = 1 - T.MathUtils.smoothstep(y, beardTop - .012, beardTop + .006);
            const lower = T.MathUtils.smoothstep(y, beardBottom - .005, beardBottom + .012);
            const side = 1 - T.MathUtils.smoothstep(absX, .067, .081);
            const follicle = .84 + .16 * noise2(x * 620, y * 740);
            color.lerp(new T.Color(palette[4]), feather * lower * side * follicle * .65);
          }
        }

        // Submandibular & sternocleidomastoid neck shadow
        if (y < neckJoint[1] + .035 && (z < .055 || ny < -.25)) {
          color.multiplyScalar(.82);
        }

        // Cheek blush, lip vermilion & oral commissure crevice
        color.lerp(cheek, Math.exp(-cheekDistance) * .56)
             .lerp(lips, Math.exp(-lipDistance) * .88)
             .lerp(lipVermilion, Math.exp(-mouthParting) * .55);
      } else {
        // Limb & extremity anatomical chromophores (sun-exposed forearms, knuckles, elbows, knees, ankles, soles)
        if (absX > .14 && y < neckJoint[1] - .05) {
          // Dorsal forearm sun-bronzing vs lighter palmar inner wrist/hand
          const sunExposure = T.MathUtils.clamp((ny * .5 + nz * .5 + .3), 0, 1);
          color.lerp(sunBronzeTone, sunExposure * .32);
          if (y < wristJointY + .04 && ny < -.15) {
            color.lerp(palmarLightTone, .36);
          }
          // Elbow & knuckle hemoglobin flush
          const elbowFlush = Math.exp(-(((y - elbowJointY) / .045) ** 2));
          const knuckleFlush = y < wristJointY - .015 ? Math.exp(-(((y - (wristJointY - .055)) / .035) ** 2)) : 0;
          color.lerp(jointHemoglobin, (elbowFlush * .45 + knuckleFlush * .65));
          // Inter-digital finger crevice AO
          if (y < wristJointY - .02) {
            const fingerCrevice = Math.max(0, 1 - Math.abs(nx) * 1.35) * .12;
            color.multiplyScalar(1 - fingerCrevice);
          }
        }
        // Lower leg, knee, ankle & foot vascularity and ground contact AO
        if (y < .65) {
          const kneeFlush = Math.exp(-(((y - kneeJointY) / .055) ** 2)) * Math.max(0, nz);
          const ankleFlush = Math.exp(-(((y - ankleJointY) / .040) ** 2));
          color.lerp(jointHemoglobin, kneeFlush * .38 + ankleFlush * .48);
          // Dust/weathering and plantar sole shading near the ground
          const footAO = T.MathUtils.smoothstep(.045, .002, y) * .22;
          color.multiplyScalar(1 - footAO);
        }
      }
      color.toArray(colors, offset);
    }

    // Clothing masks: hide covered upper-arm skin cleanly inside sleeves so culled edges never peek past the cuff
    const shoulderRest = joint("upperarm_l")[1] + .044;
    let cuffY = T.MathUtils.lerp(shoulderRest, joint("lowerarm_l")[1], Math.min(1, look.sleeve / .78));
    if (look.sleeve > .78) cuffY = T.MathUtils.lerp(cuffY, joint("hand_l")[1], (look.sleeve - .78) * 1.2);
    const visibleSkin = [];
    for (let i = 0; i < source.indices.length; i += 3) {
      const ids = [source.indices[i], source.indices[i + 1], source.indices[i + 2]];
      const x = ids.reduce((sum, id) => sum + positions[id * 3], 0) / 3;
      const y = ids.reduce((sum, id) => sum + positions[id * 3 + 1], 0) / 3;
      if (Math.abs(x) > .075 && y > cuffY + .008 && y < neckJoint[1] - .010) continue;
      visibleSkin.push(...ids);
    }
    const bodyGeometry = geometry(T, positions, visibleSkin, colors, fullNormals);
    bodyGeometry.setAttribute("skinIndex", new T.Uint8BufferAttribute(source.skinIndex, 4));
    bodyGeometry.setAttribute("skinWeight", new T.Uint8BufferAttribute(source.skinWeight, 4, true));
    bodyGeometry.morphTargetsRelative = true;
    bodyGeometry.morphAttributes.position = ["eye-left-closure", "eye-right-closure", "mouth-open"].map(name => {
      const attribute = new T.Float32BufferAttribute(denseMorph(source.vertexCount, source.morphs[name]), 3);
      attribute.name = name;
      return attribute;
    });
    bodyGeometry.morphAttributes.position.push(...CharacterDetail.expressions(T, positions, landmarks, mouth));
    const skinMaterial = CharacterDetail.skin(T, bodyGeometry, look, landmarks, mouth);
    // Augment skin material with 3A dual-lobe pore specular & vellus peach-fuzz sheen if supported
    if (skinMaterial) {
      if ("sheen" in skinMaterial && !skinMaterial.sheen) {
        skinMaterial.sheen = .28;
        skinMaterial.sheenColor = skinColor.clone().lerp(new T.Color("#ffdfc7"), .65);
        skinMaterial.sheenRoughness = .72;
      }
      if ("clearcoat" in skinMaterial && !skinMaterial.clearcoat) {
        skinMaterial.clearcoat = .08;
        skinMaterial.clearcoatRoughness = .36;
      }
    }
    const body = new T.SkinnedMesh(bodyGeometry, skinMaterial);
    body.name = "anatomical-body";
    root.add(body);
    body.bind(skeleton);
    body.frustumCulled = false;
    body.receiveShadow = true;
    body.castShadow = true;
    body.updateMorphTargets();

    // 3A Physical Fabric & Leather Materials with Microfiber Sheen & Grazing Retroreflection
    const material = (color, kind, vertexColors = true) => {
      const baseCol = new T.Color(color);
      const sheenCol = baseCol.clone().lerp(new T.Color("#fff5e4"), kind === "wool" ? .42 : kind === "linen" ? .32 : .20);
      const isLeather = kind === "leather";
      const m = new T.MeshPhysicalMaterial({
        color: baseCol,
        side: T.DoubleSide,
        shadowSide: T.BackSide,
        roughness: isLeather ? .68 : 1.0,
        metalness: 0,
        vertexColors,
        normalMap: textile(T, kind),
        roughnessMap: textileRoughness(T, kind),
        normalScale: new T.Vector2(
          kind === "haircloth" ? .09 : kind === "wool" ? .034 : isLeather ? .070 : .030,
          kind === "haircloth" ? .08 : kind === "wool" ? .034 : isLeather ? .070 : .030
        ),
        sheen: isLeather ? .08 : kind === "wool" ? .58 : kind === "haircloth" ? .42 : .35,
        sheenColor: sheenCol,
        sheenRoughness: isLeather ? .65 : kind === "wool" ? .82 : .74,
        clearcoat: isLeather ? .18 : 0,
        clearcoatRoughness: isLeather ? .42 : 1.0
      });
      m.name = "woven-" + kind + "-normal-roughness";
      m.customProgramCacheKey = () => "witness-woven-pbr-" + kind;
      return m;
    };

    const mainCloth = material(palette[0], look.cloth);
    const trim = new T.MeshPhysicalMaterial({
      color: palette[2], roughness: .88, sheen: .42, shadowSide: T.BackSide,
      sheenColor: new T.Color(palette[2]).lerp(new T.Color("#fff3dd"), .35), sheenRoughness: .76
    });
    const leather = material("#594634", "leather", false);
    const sandalLeather = material("#4d3a29", "leather", true);
    const cordMaterial = new T.MeshPhysicalMaterial({
      color: "#b4a07a", roughness: .90, side: T.DoubleSide, shadowSide: T.BackSide, normalMap: textile(T, "linen"),
      normalScale: new T.Vector2(.032, .032), sheen: .30, sheenColor: new T.Color("#e8dec8")
    });

    const shoulderY = joint("upperarm_l")[1];
    const neckY = joint("neck_01")[1];
    const pelvisY = joint("pelvis")[1];
    const headPoint = joint("head");
    const headTop = landmarks["joint-head-2"][1] + .024;
    const hem = Math.max(.22, palette[7] ?? .28);

    function torsoWeights(point) {
      if (point.y < pelvisY) {
        const swing = Math.min(.44, (pelvisY - point.y) * .55);
        const side = T.MathUtils.smoothstep(point.x, -.14, .14);
        return [["pelvis", 1 - swing], ["thigh_l", swing * side], ["thigh_r", swing * (1 - side)]];
      }
      const level = T.MathUtils.clamp((point.y - pelvisY) / (shoulderY - pelvisY), 0, 1);
      return [["spine_03", level], ["pelvis", 1 - level]];
    }

    // Multi-frequency cloth drapery kept safely below 56-segment Nyquist without faceted sawtooth creases
    function foldRadius(height, angle, folds) {
      const waistTension = Math.exp(-(((height - pelvisY - .08) / .13) ** 2));
      const shoulderAnchor = Math.exp(-(((height - shoulderY) / .11) ** 2)) * .40;
      const drape = Math.sin(angle * 8.0 + height * 1.7) * .48
        + Math.sin(angle * 13 - height * 2.5 + 1.1) * .24
        + Math.sin(angle * 4 + height * 1.1) * .32;
      return 1 + folds * drape * (1 + waistTension * .28 - shoulderAnchor);
    }

    function fabricSurface(sections, start, sweep, segments, folds, style = "tunic") {
      const vertices = [], indices = [], tones = [], uv = [];
      const curve = new T.CatmullRomCurve3(sections.map(row => new T.Vector3(...row)), false, "catmullrom", .22);
      const count = (sections.length - 1) * 5;
      for (let row = 0; row <= count; row++) {
        const point = curve.getPoint(row / count);
        const height = point.x, width = Math.max(.001, point.y), depth = Math.max(.001, point.z);
        for (let segment = 0; segment <= segments; segment++) {
          const angle = start + segment / segments * sweep;
          const neckEase = T.MathUtils.smoothstep(height, neckY - .03, neckY + .07);
          const radius = foldRadius(height, angle, folds);
          const shoulderBlend = style === "tunic" ? T.MathUtils.smoothstep(height, shoulderY - .20, shoulderY + .02) : 0;
          const drapeOver = -Math.abs(Math.cos(angle)) * .009 * shoulderBlend;
          const fall = style === "mantle" ? Math.sin(angle * 2.5) * .035 * (1 - row / count) : 0;
          const hemWave = style === "tunic" && row < 3 && Math.abs(height - hem) < .15
            ? Math.sin(angle * 3 + .6) * .009 + Math.sin(angle * 5 + 1.4) * .004 : 0;
          const neckLine = style === "tunic" ? T.MathUtils.smoothstep(height, neckY - .055, neckY - .006) : 0;
          const vx = Math.sin(angle) * width * radius;
          const vy = height + fall + drapeOver + hemWave + Math.sin(angle * 9) * .002 * (1 - neckEase) - Math.max(0, Math.cos(angle)) * neckLine * .022;
          let vz = Math.cos(angle) * depth * radius * (Math.cos(angle) < 0 ? 1 - neckLine * .22 : 1) + neckLine * .014;
          if (neckLine > .05 && Math.cos(angle) > .24) vz = Math.max(vz, Math.min(.095, faceDepth(vx, vy) + .004));
          vertices.push(vx, vy, vz);

          // Micro-fold cavity ambient occlusion + belt cinch AO + hem dust/wear
          const foldDepthAO = Math.max(0, (1 - radius) * .32);
          const beltCinchAO = style === "tunic" ? Math.exp(-(((height - (pelvisY + .085)) / .045) ** 2)) * .045 : 0;
          const underArmAO = style === "tunic"
            ? Math.exp(-(((height - (shoulderY - .06)) / .08) ** 2)) * Math.pow(Math.abs(Math.sin(angle)), 3) * .055 : 0;
          const hemWear = Math.exp(-(((height - hem - .025) / .055) ** 2)) * .14;
          const seam = (row < 1 || segment < 1 || segment > segments - 1) ? .015 : 0;
          const tone = .98 - hemWear - seam - foldDepthAO - beltCinchAO - underArmAO + .02 * Math.cos(angle * 9 + height * 2);
          const border = look.ornament === "woven-border" && row < 4 && row > 1 ? .70 : 1;
          tones.push(tone * border, tone * border * .99, tone * border * .96);
          uv.push(segment / segments, row / count);
          if (row && segment) {
            const a = row * (segments + 1) + segment, b = a - segments - 1;
            indices.push(a, a - 1, b, a - 1, b - 1, b);
          }
        }
      }
      const surface = geometry(T, vertices, indices, tones);
      surface.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      if (Math.abs(sweep - Math.PI * 2) < .01) {
        const nrm = surface.attributes.normal;
        for (let row = 0; row <= count; row++) {
          const a = row * (segments + 1), b = a + segments;
          const nx = nrm.getX(a) + nrm.getX(b), ny = nrm.getY(a) + nrm.getY(b), nz = nrm.getZ(a) + nrm.getZ(b);
          const l = Math.hypot(nx, ny, nz) || 1;
          nrm.setXYZ(a, nx / l, ny / l, nz / l);
          nrm.setXYZ(b, nx / l, ny / l, nz / l);
        }
      }
      return surface;
    }

    const waistY = pelvisY + .06;
    const chestScale = Math.max(.98, look.build ?? 1);
    const tunic = fabricSurface([
      [waistY - .025, .178 * chestScale, .142 * chestScale], [waistY + .01, .176 * chestScale, .141 * chestScale], [pelvisY + .110, .172 * chestScale, .139 * chestScale],
      [shoulderY - .16, .198 * chestScale, .144 * chestScale], [shoulderY - .010, .200 * chestScale, .142 * chestScale], [shoulderY + .036, .188 * chestScale, .138 * chestScale],
      [shoulderY + .068, .162 * chestScale, .126 * chestScale], [neckY - .025, .126 * chestScale, .118 * chestScale], [neckY - .004, .104 * chestScale, .112 * chestScale]
    ], Math.PI, Math.PI * 2, 56, look.cloth === "haircloth" ? .075 : .052);
    const tunicMesh = skinned(tunic, mainCloth, torsoWeights);
    tunicMesh.name = "woven-tunic-bodice";
    const mantleLength = look.headcover === "veil" ? 1.05 : look.cloak === "shoulder" ? .93 : .69;
    const clothLayers = [];
    let mantleSim = null;

    // Tunic skirt: simulated cloth layer pinned at waist ring with hem soil gradient & fold AO
    {
      const cols = 48, rows = 14, rest = [], weaveUv = [], tones = [], indices = [], waistRing = [];
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const y = T.MathUtils.lerp(waistY + .004, hem, t);
        const width = T.MathUtils.lerp(.182, .326, t), depth = T.MathUtils.lerp(.145, .238, t);
        for (let c = 0; c < cols; c++) {
          const angle = c / cols * Math.PI * 2;
          const radius = foldRadius(y, angle, look.cloth === "haircloth" ? .085 : .048);
          const x = Math.sin(angle) * width * radius, z = Math.cos(angle) * depth * radius;
          rest.push(x, y, z);
          if (r === 0) waistRing.push(x, y, z);
          weaveUv.push(c / cols * 6, t * 4);
          const waistGatherAO = Math.exp(-((t / .16) ** 2)) * .08;
          const hemDust = Math.pow(t, 3.2) * .09;
          const foldAO = Math.max(0, (1 - radius) * 1.25);
          const tone = .97 - waistGatherAO - hemDust - foldAO + .03 * Math.cos(angle * 13 + y * 2);
          tones.push(tone, tone * .985, tone * (1 - hemDust * .4) * .955);
          if (r && c) { const a = r * cols + c, b = a - cols; indices.push(a, b, a - 1, a - 1, b, b - 1); }
        }
      }
      const skirt = CharacterCloth.create(T, {
        cols, rows, rest: new Float32Array(rest), weaveUv: new Float32Array(weaveUv),
        tones: new Float32Array(tones), indices, wrapX: true, pinRow: 0,
        color: palette[0], name: "cloth-tunic-skirt", fuzzRepeat: 8
      });
      skirt.mesh.userData.restPin = new Float32Array(waistRing);
      skirt.mesh.userData.pinBone = "pelvis";
      skirt.mesh.userData.shape = 55;
      root.add(skirt.mesh);
      clothLayers.push(skirt);
    }

    if (look.cloak !== "none") {
      const drape = CharacterDetail.mantle(T, { shoulderY, pelvisY, length: mantleLength, look });
      const mcols = 41, mrows = 29;
      const src = drape.geometry.attributes.position.array;
      const rest = new Float32Array(src);
      const weaveUv = new Float32Array(mcols * mrows * 2), tones = new Float32Array(mcols * mrows * 3), indices = [];
      const shoulderRing = [];
      for (let r = 0; r < mrows; r++) for (let c = 0; c < mcols; c++) {
        const i = r * mcols + c;
        const tr = r / (mrows - 1), tc = c / (mcols - 1);
        weaveUv[i * 2] = tc * 5; weaveUv[i * 2 + 1] = tr * 6;
        const borderBand = (r > mrows - 4 && r < mrows - 1) || c === 1 || c === mcols - 2 ? .055 : 0;
        const hemWear = Math.pow(tr, 3.5) * .065;
        const tone = .97 - hemWear - borderBand;
        tones[i * 3] = tone; tones[i * 3 + 1] = tone * .99; tones[i * 3 + 2] = tone * .96;
        if (r === 0) shoulderRing.push(src[i * 3], src[i * 3 + 1], src[i * 3 + 2]);
        if (r && c) { const a = i, b = i - mcols; indices.push(a, b, a - 1, a - 1, b, b - 1); }
      }
      drape.geometry.dispose();
      const mantle = CharacterCloth.create(T, {
        cols: mcols, rows: mrows, rest, weaveUv, tones, indices, wrapX: false, pinRow: 0,
        color: palette[1], name: "cloth-wool-mantle", fuzzRepeat: 6, backend: "cpu"
      });
      mantle.mesh.userData.restPin = new Float32Array(shoulderRing);
      mantle.mesh.userData.pinBone = "spine_03";
      mantle.mesh.userData.cols = mcols; mantle.mesh.userData.rows = mrows;
      mantle.mesh.userData.shape = 22;
      root.add(mantle.mesh);
      clothLayers.push(mantle);
      mantleSim = mantle;
    }

    const clothTime = { value: 0 }, clothPace = { value: 0 };
    const hairDynamics = CharacterDetail.spring(T, 72, 12);
    const hairSway = hairDynamics.uniform;
    const clothDynamics = CharacterDetail.spring(T, 44, 11);
    const clothLag = clothDynamics.uniform;
    const elbowL = new T.Vector3(...joint("lowerarm_l"));
    const elbowR = new T.Vector3(...joint("lowerarm_r"));
    const elbowBend = { value: new T.Vector2() };
    for (const [fabric, floor, top, scale] of [[mainCloth, hem, pelvisY, .007]]) {
      const before = fabric.onBeforeCompile;
      const key = fabric.customProgramCacheKey();
      fabric.customProgramCacheKey = () => key + "-drape-" + floor.toFixed(3) + "-" + top.toFixed(3);
      fabric.onBeforeCompile = shader => {
        if (typeof before === "function") before(shader);
        shader.uniforms.clothTime = clothTime;
        shader.uniforms.clothPace = clothPace;
        shader.uniforms.uClothLag = clothLag;
        shader.uniforms.uElbowL = { value: elbowL };
        shader.uniforms.uElbowR = { value: elbowR };
        shader.uniforms.uElbowBend = elbowBend;
        shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float clothTime, clothPace;\nuniform vec2 uClothLag;\nuniform vec3 uElbowL, uElbowR;\nuniform vec2 uElbowBend;")
          .replace("#include <begin_vertex>", `#include <begin_vertex>
            float flexibility = 1. - smoothstep(${floor.toFixed(4)}, ${top.toFixed(4)}, position.y);
            float windFlutter = sin(clothTime * 3.4 + position.y * 9.5 + position.x * 6.2) * .28;
            float sway = sin(clothTime * 1.5 + position.x * 11.2 + position.y * 1.7);
            transformed.x += (sway + windFlutter) * flexibility * ${scale.toFixed(4)};
            float strideZ = sin(clothTime * (1.9 + clothPace * 2.8) + position.x * 15.5) * (.0032 + clothPace * .0095);
            float breezeZ = sin(clothTime * 4.2 + position.z * 18.2) * .0016;
            transformed.z += (strideZ + breezeZ + uClothLag.y) * flexibility;
            transformed.x += uClothLag.x * flexibility;
            // Multi-harmonic accordion compression folds where the sleeve bends at the elbow
            float elbowDistanceL = length(position - uElbowL);
            float elbowDistanceR = length(position - uElbowR);
            float elbowFold = (sin(elbowDistanceL * 158.) + .65 * sin(elbowDistanceL * 82. + 1.3) + .35 * cos(elbowDistanceL * 240.))
              * exp(-pow(elbowDistanceL / .056, 2.)) * uElbowBend.x
              + (sin(elbowDistanceR * 158.) + .65 * sin(elbowDistanceR * 82. + 1.3) + .35 * cos(elbowDistanceR * 240.))
              * exp(-pow(elbowDistanceR / .056, 2.)) * uElbowBend.y;
            transformed += objectNormal * elbowFold * .0026;
          `);
      };
    }

    function sleeve(side) {
      const suffix = side > 0 ? "l" : "r";
      const shoulder = new T.Vector3(...joint("upperarm_" + suffix));
      shoulder.y += .044;
      shoulder.x *= .90;
      const elbow = new T.Vector3(...joint("lowerarm_" + suffix));
      const wrist = new T.Vector3(...joint("hand_" + suffix));
      const axis = elbow.clone().sub(shoulder).normalize();
      const tangent = new T.Vector3(0, 0, 1);
      const across = new T.Vector3().crossVectors(axis, tangent).normalize();
      const armScale = Math.max(.98, look.build ?? 1);
      const vertices = [], indices = [], shades = [];
      const uv = [];
      const cuffRing = [];
      for (let row = 0; row <= 18; row++) {
        const normRow = row / 18;
        const progress = normRow * look.sleeve;
        const center = shoulder.clone().lerp(elbow, Math.min(1, progress / .78));
        if (progress > .78) center.lerp(wrist, (progress - .78) * 1.2);
        for (let ring = 0; ring <= 32; ring++) {
          const angle = ring / 32 * Math.PI * 2;
          // Underarm gravity drape + elbow crease memory folds (kept below 32-ring Nyquist to prevent cuff sawteeth)
          const elbowProximity = Math.exp(-(((progress - .76) / .14) ** 2));
          const elbowCrease = Math.sin(progress * 42 + Math.cos(angle) * 2.5) * .022 * elbowProximity * Math.max(0, Math.cos(angle));
          const rawFold = 1 + Math.sin(angle * 5 + progress * 3.0) * .036 + Math.cos(angle * 9 - progress * 4.0) * .014 + elbowCrease;
          const fold = normRow > .7 ? Math.max(.975, rawFold) : rawFold;
          const flare = row === 18 ? 1.04 : row === 17 ? 1.05 : row === 16 ? 1.03 : 1;
          const shoulderCap = row === 0 ? .45 : row === 1 ? .66 : row === 2 ? .84 : 1;
          const radius = (.078 - progress * .016) * armScale * fold * flare * shoulderCap;
          const sag = Math.max(0, -Math.cos(angle)) * (.003 + normRow * .002);
          const vertex = center.clone().addScaledVector(across, Math.sin(angle) * radius)
            .addScaledVector(tangent, Math.cos(angle) * radius);
          const outward = Math.max(0, side * (vertex.x - center.x));
          const shoulderSlope = (1 - T.MathUtils.smoothstep(normRow, 0, .28)) * outward * .22;
          vertex.y -= sag + shoulderSlope;
          vertices.push(vertex.x, vertex.y, vertex.z);
          const underShade = Math.max(0, -Math.cos(angle)) * .05;
          const value = (row > 16 ? .86 : .97) - underShade - Math.max(0, (1 - fold) * .35);
          shades.push(value, value * .99, value * .97);
          uv.push(ring / 32, normRow);
          if (row === 17) cuffRing.push([vertex.x, vertex.y, vertex.z]);
          if (row && ring) {
            const a = row * 33 + ring, b = a - 33;
            indices.push(a, a - 1, b, a - 1, b - 1, b);
          }
        }
      }
      const sleeveGeometry = geometry(T, vertices, indices, shades);
      sleeveGeometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      const snrm = sleeveGeometry.attributes.normal;
      for (let row = 0; row <= 18; row++) {
        const a = row * 33, b = a + 32;
        const nx = snrm.getX(a) + snrm.getX(b), ny = snrm.getY(a) + snrm.getY(b), nz = snrm.getZ(a) + snrm.getZ(b);
        const l = Math.hypot(nx, ny, nz) || 1;
        snrm.setXYZ(a, nx / l, ny / l, nz / l);
        snrm.setXYZ(b, nx / l, ny / l, nz / l);
      }
      const sleeveWeights = point => {
        const t = T.MathUtils.smoothstep(elbow.y + .045 - point.y, 0, .09);
        const armhole = T.MathUtils.smoothstep(point.y, shoulderY + .005, shoulderY + .055) * .68;
        return [
          ["spine_03", armhole],
          ["upperarm_" + suffix, (1 - armhole) * (1 - t)],
          ["lowerarm_" + suffix, (1 - armhole) * t]
        ];
      };
      skinned(sleeveGeometry, mainCloth, sleeveWeights).name = "sleeve-" + suffix;
      thread(cuffRing, .0021, trim, "sleeve-cuff-stitch-" + suffix, sleeveWeights);
    }
    sleeve(1);
    sleeve(-1);

    const isSash = look.belt === "sash";
    const beltTop = pelvisY + (look.belt === "towel" ? .18 : isSash ? .135 : .106);
    const beltBottom = pelvisY + (isSash ? .054 : .058);
    const beltMid = (beltBottom + beltTop) * .5;
    const belt = fabricSurface([[beltBottom, .206 * chestScale, .168 * chestScale], [beltMid, .214 * chestScale, .174 * chestScale], [beltTop, .202 * chestScale, .164 * chestScale]], 0, Math.PI * 2, 48, .018);
    const beltFinish = look.belt === "leather" ? leather : look.belt === "towel" ? material("#d3c6aa", "linen") : isSash ? material(look.trim || palette[2], "linen") : cordMaterial;
    skinned(belt, beltFinish, () => [["pelvis", 1]]).name = look.belt + "-waist-tie";
    if (isSash) {
      for (const side of [-1, 1]) thread([
        [-.04 * side, beltBottom, .168],
        [-.05 * side, pelvisY - .08, .180],
        [-.06 * side, pelvisY - .22, .190]
      ], .008, beltFinish, "sash-drape-end");
    }
    const necklineStitch = [];
    const topRow = tunic.attributes.position.count - 57;
    for (let i = 0; i <= 56; i++) {
      const p = tunic.attributes.position;
      necklineStitch.push([p.getX(topRow + i), p.getY(topRow + i) + .0005, p.getZ(topRow + i)]);
    }
    thread(necklineStitch, .0011, trim, "tunic-neckline-seam");

    function thread(points, radius, finish, name, weights = torsoWeights) {
      const tube = new T.TubeGeometry(new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point))), Math.max(8, points.length * 4), radius, 6, false);
      if (finish.vertexColors) tube.setAttribute("color", new T.Float32BufferAttribute(new Float32Array(tube.attributes.position.count * 3).fill(1), 3));
      const object = skinned(tube, finish, weights);
      object.name = name;
      return object;
    }
    if (look.belt === "cord") {
      for (const side of [-1, 1]) thread([
        [.085, beltTop - .008, .164], [.085 + side * .022, beltBottom - .006, .176],
        [.085 + side * .014, pelvisY - .08, .188], [.085 + side * .028, pelvisY - .20, .198]
      ], .0045, cordMaterial, "knotted-woven-cord");
    }
    if (look.belt === "towel") {
      const towel = new T.PlaneGeometry(.20, .47, 14, 24);
      const p = towel.attributes.position;
      for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + .075,
        p.getY(i) + pelvisY - .06, .175 + .012 * Math.cos(p.getX(i) * 70) + (1 - p.getY(i)) * .012);
      towel.computeVertexNormals();
      const linen = material("#d3c6aa", "linen", false);
      skinned(towel, linen, torsoWeights).name = "footwashing-linen-towel";
    }

    // Levantine & Jewish corner fringes (tzitzit) according to Numbers 15:37-41 & Deuteronomy 22:12
    const devoutFringes = ["jesus", "jesus-supper", "peter", "andrew", "philip", "scholar", "isaiah", "nathan", "david", "cleopas", "beloved", "shepherd"].includes(identity) || look.tzitzit;
    const fringes = [];
    if (devoutFringes && look.cloak !== "none" && mantleSim) {
      const mc = mantleSim.mesh.userData.cols, mr = mantleSim.mesh.userData.rows;
      for (const [col, side, frontBack] of [
        [0, 1, 1],
        [Math.floor(mc / 3), 1, -1],
        [Math.floor(2 * mc / 3), -1, -1],
        [mc - 1, -1, 1]
      ]) {
        const corner = (mr - 1) * mc + col;
        const cx = mantleSim.rest[corner * 3], cy = mantleSim.rest[corner * 3 + 1], cz = mantleSim.rest[corner * 3 + 2];
        for (let cord = 0; cord < 3; cord++) {
          const x = cx + side * cord * .003;
          const y = cy - .004;
          const z = cz + frontBack * cord * .002;
          const fringe = thread([
            [x, y + .018, z],
            [x + side * .002, y - .025, z + frontBack * .004],
            [x + side * .004, y - .075, z + frontBack * .002]
          ], .0018, cordMaterial, "garment-corner-fringe");
          fringe.userData.corner = corner;
          fringes.push(fringe);
        }
      }
    }

    const groom = CharacterDetail.groom(T, {
      look, positions, landmarks, mouth, headTop, faceDepth, skinned, sway: hairSway
    });

    if (["veil", "shawl", "wrap", "hood", "sudarium"].includes(palette[5])) {
      const veiled = palette[5] === "veil";
      const wrapped = palette[5] === "wrap" || palette[5] === "sudarium";
      const bottom = veiled ? shoulderY - .27 : wrapped ? headPoint[1] - .05 : shoulderY - .14;
      const rows = wrapped ? [
        [headPoint[1] - .04, .132, .135], [headPoint[1] + .015, .135, .136],
        [headTop - .08, .134, .132], [headTop - .025, .118, .120], [headTop + .016, .054, .065], [headTop + .026, .002, .008]
      ] : [
        [bottom, .246, .178], [bottom + .04, .240, .174], [neckY - .05, .226, .162],
        [headPoint[1] + .015, .148, .145], [headTop - .09, .142, .138],
        [headTop - .025, .116, .119], [headTop + .014, .06, .072], [headTop + .026, .002, .009]
      ];
      const headcloth = fabricSurface(rows, wrapped ? .45 : .64, Math.PI * 2 - (wrapped ? .90 : 1.28), 48, .065, "headcloth");
      const headFabric = material(veiled ? palette[1] : new T.Color(palette[1]).lerp(new T.Color("#b6a68a"), .3), veiled || wrapped ? "linen" : "wool");
      skinned(headcloth, headFabric, point => {
        const t = T.MathUtils.smoothstep(point.y, shoulderY - .14, headPoint[1]);
        return [["head", t], ["spine_03", 1 - t]];
      }).name = "draped-" + palette[5];
      for (const side of [-1, 1]) thread(rows.slice(0, -1).map(([y, width, depth]) =>
        [side * Math.sin(wrapped ? .45 : .64) * width, y, Math.cos(wrapped ? .45 : .64) * depth + .001]), .002, trim,
      "headcloth-rolled-edge", point => [[point.y < neckY ? "spine_03" : "head", 1]]);
      if (wrapped) {
        const agalY = headTop - .055;
        const agalPts = Array.from({ length: 16 }, (_, i) => {
          const a = i / 15 * Math.PI * 2;
          return [Math.sin(a) * .125, agalY, Math.cos(a) * .128 + landmarks["joint-head-2"][2] * .5];
        });
        thread(agalPts, .004, cordMaterial, "agal-headband-cord", () => [["head", 1]]);
      }
    }

    // 3A Ocular & Orbital System: Sclera, Concave Iris w/ Normal & Caustics, Dynamic Pupil, Bulging Cornea & Tapered Eyelashes
    const eyeGroup = new T.Group();
    eyeGroup.position.fromArray(headPoint).multiplyScalar(-1);
    bone("head").add(eyeGroup);

    const scleraTex = scleraTexture(T);
    const whites = new T.MeshPhysicalMaterial({
      color: "#d4cbc0", map: scleraTex, roughness: .22, metalness: 0,
      clearcoat: 1.0, clearcoatRoughness: .035, reflectivity: .94, ior: 1.376
    });
    const irisBundle = irisTextures(T, look.eyeColor || "#4b3021");
    const irisMaterial = new T.MeshPhysicalMaterial({
      map: irisBundle.albedo, normalMap: irisBundle.normal,
      normalScale: new T.Vector2(.38, .38),
      roughness: .28, metalness: 0, clearcoat: .45, clearcoatRoughness: .12
    });
    const pupilMaterial = new T.MeshBasicMaterial({ color: "#030202" });
    const corneaMat = new T.MeshPhysicalMaterial({
      color: "#ffffff", transparent: true, opacity: .11, roughness: .015, metalness: 0, depthWrite: false,
      clearcoat: 1.0, clearcoatRoughness: .01, reflectivity: .99, ior: 1.376
    });
    const lashMaterial = new T.MeshPhysicalMaterial({
      color: new T.Color(palette[4]).multiplyScalar(.42),
      roughness: .68, sheen: .25, sheenColor: new T.Color(palette[4]), side: T.DoubleSide
    });
    const tearMat = new T.MeshPhysicalMaterial({
      color: "#ffffff", transparent: true, opacity: .62, roughness: .015, metalness: .01,
      clearcoat: 1.0, clearcoatRoughness: .008, reflectivity: .99, ior: 1.336
    });
    const caruncleMat = new T.MeshPhysicalMaterial({
      color: "#b05246", roughness: .22, metalness: .01, clearcoat: .94, clearcoatRoughness: .045,
      sheen: .35, sheenColor: new T.Color("#ff9c8e")
    });
    const lidMaterial = new T.MeshPhysicalMaterial({
      color: palette[3], vertexColors: true, roughness: .56, metalness: .01,
      clearcoat: .12, clearcoatRoughness: .32, side: T.DoubleSide,
      sheen: .32, sheenColor: new T.Color("#ffd6bd"), sheenRoughness: .72
    });

    const GLOBE = .0134, LID = .0137;
    const uPupilScale = { value: 1.0 };
    const uLidShadowDynamic = { value: .48 };

    // 3A Eye Shader: Upper/lower lid contact shadow, medial/lateral canthus AO,
    // Anterior chamber refraction parallax, Concave iris caustic focusing, and Dynamic pupil dilation
    function eyeShading(mat, refract) {
      mat.customProgramCacheKey = () => "eye-aaa-v2-" + (refract ? "iris" : "sclera");
      mat.onBeforeCompile = shader => {
        shader.uniforms.uLidShadow = uLidShadowDynamic;
        shader.uniforms.uGlobeR = { value: GLOBE };
        if (refract) {
          shader.uniforms.uIrisRefract = { value: .058 };
          shader.uniforms.uPupilScale = uPupilScale;
        }
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vEyeLocal;\nvarying vec2 vEyeUv;\nvarying vec3 vEyeView;\nvarying vec3 vEyeWorldNormal;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvEyeLocal = position;\nvEyeUv = uv;\nvEyeView = -(modelViewMatrix * vec4(position, 1.0)).xyz;\nvEyeWorldNormal = normalize(mat3(modelMatrix) * normal);");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vEyeLocal;\nvarying vec2 vEyeUv;\nvarying vec3 vEyeView;\nvarying vec3 vEyeWorldNormal;\nuniform float uLidShadow, uGlobeR;" + (refract ? "\nuniform float uIrisRefract, uPupilScale;" : ""))
          .replace("#include <map_fragment>", refract ? `
            vec3 vDir = normalize(vEyeView);
            vec2 centeredUv = vEyeUv - vec2(0.5);
            float rUv = length(centeredUv) * 2.0;
            // Anterior chamber depth dome profile (deepest over central pupil/collarette)
            float chamberDepth = max(0.0, 1.0 - rUv * rUv * 0.85);
            vec2 tanView = vDir.xy / max(.28, abs(vDir.z));
            vec2 refractedUv = vEyeUv - tanView * (uIrisRefract * (0.45 + 0.55 * chamberDepth));
            // Dynamic radial pupil dilation & stroma accordion stretch
            vec2 dUv = refractedUv - vec2(0.5);
            float dR = length(dUv);
            if (dR > 0.0001 && dR < 0.49) {
              float targetPupil = 0.125 * uPupilScale;
              float newR = dR < targetPupil
                ? (dR / max(0.01, targetPupil)) * 0.125
                : 0.125 + ((dR - targetPupil) / max(0.01, 0.49 - targetPupil)) * (0.49 - 0.125);
              refractedUv = vec2(0.5) + (dUv / dR) * newR;
            }
            vec2 iuv = clamp(refractedUv, 0.0, 1.0);
            diffuseColor *= texture2D(map, iuv);
            // Concave iris caustic focusing opposite the primary sun/sky light direction
            vec3 causticLightDir = normalize(vec3(0.35, 0.72, 0.58));
            float causticFocus = max(0.0, dot(normalize(vec3(-centeredUv.x * 1.8, -centeredUv.y * 1.8, 0.65)), causticLightDir));
            float causticMask = smoothstep(0.24, 0.55, rUv) * (1.0 - smoothstep(0.65, 0.96, rUv));
            diffuseColor.rgb *= 1.0 + pow(causticFocus, 3.2) * causticMask * 0.52;
          ` : "#include <map_fragment>")
          .replace("#include <color_fragment>", `#include <color_fragment>
            float upperLidOcc = smoothstep(.08, .92, vEyeLocal.y / uGlobeR) * uLidShadow;
            float lowerLidOcc = smoothstep(-.55, -.96, -vEyeLocal.y / uGlobeR) * .16;
            float cornerOcc = smoothstep(.52, 1.0, abs(vEyeLocal.x) / uGlobeR) * .28;
            diffuseColor.rgb *= 1.0 - clamp(upperLidOcc + lowerLidOcc + cornerOcc, 0.0, 0.78);
          `);
      };
      return mat;
    }
    eyeShading(whites, false);
    eyeShading(irisMaterial, true);

    function lidShell(radius, thetaStart, thetaLength, corner, segments = 32, rings = 8) {
      const vertices = [], indices = [], shades = [];
      for (let ring = 0; ring <= rings; ring++) {
        const t = ring / rings;
        const theta = thetaStart + t * thetaLength;
        for (let segment = 0; segment <= segments; segment++) {
          const phi = segment / segments * Math.PI * 2;
          const rim = T.MathUtils.smoothstep(t, .78, 1);
          const lift = rim * corner * Math.pow(Math.abs(Math.sin(phi)), 1.7);
          const ux = Math.sin(theta) * Math.sin(phi);
          const uy = Math.cos(theta);
          const uz = Math.sin(theta) * Math.cos(phi);
          // Palpebral margin thickness at the inner tear-duct rim
          const marginBulge = Math.sin(rim * Math.PI) * .00028;
          vertices.push(ux * (radius + marginBulge), uy * radius + lift, uz * (radius + marginBulge) + rim * .00065);
          const shade = .96 - rim * .16 - Math.pow(Math.abs(Math.cos(phi)), 3) * .03;
          // Warm pink vascular mucocutaneous junction along the inner eyelid rim
          shades.push(shade * (1 + rim * .05), shade * (1 - rim * .04), shade * (1 - rim * .06));
          if (ring && segment) {
            const a = ring * (segments + 1) + segment, b = a - segments - 1;
            indices.push(a, b, a - 1, a - 1, b, b - 1);
          }
        }
      }
      return geometry(T, vertices, indices, shades);
    }

    function lidRim(radius, theta, corner, segments = 16) {
      const points = [];
      for (let index = 0; index <= segments; index++) {
        const phi = -Math.PI / 2 + index / segments * Math.PI;
        const lift = corner * Math.pow(Math.abs(Math.sin(phi)), 1.7);
        points.push(new T.Vector3(
          Math.sin(theta) * Math.sin(phi) * radius,
          Math.cos(theta) * radius + lift,
          Math.sin(theta) * Math.cos(phi) * radius));
      }
      return points;
    }

    // 3A Tapered, Clumped 3D Eyelash Fan Geometry (single draw-call merged BufferGeometry per lid)
    function createEyelashFan(radius, theta, corner, isUpper, sideSign) {
      const strandCount = isUpper ? 28 : 16;
      const segs = 4;
      const vertices = [], indices = [];
      for (let s = 0; s < strandCount; s++) {
        const u = (s + .5) / strandCount;
        // Concentrate lashes from medial-center toward lateral outer canthus
        const phi = -Math.PI * .43 + u * Math.PI * .86;
        const edgeFade = Math.sin(u * Math.PI);
        const lateralBias = 1 + Math.max(0, sideSign * Math.sin(phi)) * .28;
        const length = (isUpper ? .0026 : .0013) * (.55 + .45 * edgeFade) * lateralBias;
        const baseWidth = (isUpper ? .00028 : .00018) * (.7 + .3 * edgeFade);
        // Natural clumping: slight convergence of neighboring tips
        const clumpAngle = Math.sin(s * 2.4) * .085;

        const lift = corner * Math.pow(Math.abs(Math.sin(phi)), 1.7);
        const rootX = Math.sin(theta) * Math.sin(phi) * radius;
        const rootY = Math.cos(theta) * radius + lift;
        const rootZ = Math.sin(theta) * Math.cos(phi) * radius;

        const outX = Math.sin(phi + clumpAngle * .35) * .45;
        const outY = isUpper ? -.28 : -.34;
        const outZ = Math.cos(phi * .5) * .88;
        const outLen = Math.hypot(outX, outY, outZ) || 1;
        const dirX = outX / outLen, dirY = outY / outLen, dirZ = outZ / outLen;
        const sideX = Math.cos(phi), sideZ = -Math.sin(phi);

        const baseVertex = vertices.length / 3;
        for (let k = 0; k <= segs; k++) {
          const t = k / segs;
          const taper = Math.pow(1 - t, 1.35);
          // Graceful upward sweep on upper lashes, subtle downward curl on lower lashes
          const curlY = (isUpper ? 1 : -.65) * t * t * length * .68;
          const reach = t * length;
          const cx = rootX + dirX * reach + sideX * clumpAngle * t * .0004;
          const cy = rootY + dirY * reach + curlY;
          const cz = rootZ + dirZ * reach;
          const hw = baseWidth * taper * .5;
          vertices.push(cx - sideX * hw, cy, cz - sideZ * hw);
          vertices.push(cx + sideX * hw, cy, cz + sideZ * hw);
          if (k > 0) {
            const i0 = baseVertex + (k - 1) * 2;
            indices.push(i0, i0 + 1, i0 + 2, i0 + 1, i0 + 3, i0 + 2);
          }
        }
      }
      return geometry(T, vertices, indices);
    }

    function eyeDish(radius, discRadius, lift, segments = 32, concave = 0) {
      const disc = new T.CircleGeometry(discRadius, segments);
      const p = disc.attributes.position;
      for (let index = 0; index < p.count; index++) {
        const r = Math.hypot(p.getX(index), p.getY(index));
        const normR = r / Math.max(.0001, discRadius);
        const domeZ = Math.sqrt(Math.max(0, radius * radius - r * r));
        const depression = concave * (1 - normR * normR);
        p.setZ(index, domeZ + lift - depression);
      }
      disc.computeVertexNormals();
      return disc;
    }

    // Anatomical Cornea Geometry with true anterior corneal bulge (smaller curvature radius protruding over iris)
    function createCorneaGeometry(baseRadius) {
      const geo = new T.SphereGeometry(baseRadius, 32, 16, 0, Math.PI * 2, 0, .58);
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
        // In SphereGeometry before rotation.x = PI/2, pole is at +Y
        const polarRatio = T.MathUtils.clamp((y - baseRadius * Math.cos(.58)) / (baseRadius * (1 - Math.cos(.58))), 0, 1);
        const bulge = Math.pow(Math.sin(polarRatio * Math.PI * .5), 1.6) * .00075;
        const len = Math.hypot(x, y, z) || 1;
        p.setXYZ(i, x + (x / len) * bulge, y + (y / len) * bulge, z + (z / len) * bulge);
      }
      geo.computeVertexNormals();
      return geo;
    }

    const corneaGeo = createCorneaGeometry(.01362);
    const eyes = [];
    const pupils = [];
    const lids = [];
    for (const side of ["l", "r"]) {
      const point = new T.Vector3(...landmarks["joint-" + side + "-eye"]);
      const s = side === "l" ? 1 : -1;
      const eyeRoot = new T.Group();
      eyeRoot.position.copy(point);
      eyeGroup.add(eyeRoot);
      const white = new T.Mesh(new T.SphereGeometry(GLOBE, 24, 18), whites);
      eyeRoot.add(white);
      const iris = new T.Mesh(eyeDish(GLOBE, .0056, .00022, 32, .00038), irisMaterial);
      eyeRoot.add(iris);
      // Preserve .0022 discRadius expected by Q01 hero eye aperture & portrait checks
      const pupil = new T.Mesh(eyeDish(GLOBE, .0022, .00038, 24, .00032), pupilMaterial);
      eyeRoot.add(pupil);
      pupils.push(pupil);
      const cornea = new T.Mesh(corneaGeo, corneaMat);
      cornea.rotation.x = Math.PI / 2;
      cornea.renderOrder = 2;
      eyeRoot.add(cornea);

      // Eyelids & 3D Tapered Eyelash Fans
      const upperPivot = new T.Group();
      upperPivot.position.copy(point);
      eyeGroup.add(upperPivot);
      upperPivot.add(new T.Mesh(lidShell(LID, .10, 1.13, .0016), lidMaterial));
      const lashCurve = lidRim(LID + .00035, 1.23, .0016, 16);
      const lashTube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(lashCurve), 16, .00036, 5, false), lashMaterial);
      upperPivot.add(lashTube);
      upperPivot.add(new T.Mesh(createEyelashFan(LID + .00035, 1.23, .0016, true, s), lashMaterial));

      const lowerPivot = new T.Group();
      lowerPivot.position.copy(point);
      eyeGroup.add(lowerPivot);
      lowerPivot.add(new T.Mesh(lidShell(LID, 1.891, Math.PI - 1.891, .0016), lidMaterial));
      lowerPivot.add(new T.Mesh(createEyelashFan(LID + .0003, 1.891, .0016, false, s), lashMaterial));

      const tearCurve = lidRim(LID + .00042, 1.885, .0016, 16);
      const tearTube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tearCurve), 18, .00038, 6, false), tearMat);
      tearTube.renderOrder = 3;
      lowerPivot.add(tearTube);

      // Lacrimal caruncle + Plica semilunaris fold at medial canthus
      const caruncle = new T.Mesh(new T.SphereGeometry(1, 12, 10), caruncleMat);
      caruncle.scale.set(.0018, .00135, .0011);
      caruncle.position.set(s * -.0112, -.0021, .0053);
      lowerPivot.add(caruncle);
      const plica = new T.Mesh(new T.SphereGeometry(1, 10, 8), caruncleMat);
      plica.scale.set(.0009, .0024, .0008);
      plica.position.set(s * -.0098, -.0012, .0068);
      lowerPivot.add(plica);

      eyes.push(eyeRoot);
      lids.push({ upper: upperPivot, lower: lowerPivot });
    }

    function attached(name, at) {
      const anchor = new T.Group();
      anchor.position.set(...at);
      bone(name).add(anchor);
      return anchor;
    }
    const hand = attached("hand_r", [0, 0, 0]);
    const bag = look.item === "bag";
    const itemAnchor = bag ? attached("pelvis", [-.205, -.10, .045]) : hand;
    const personalItem = AdventureVisuals.accessory(T, itemAnchor, look.item);
    if (personalItem) personalItem.position.set(0, bag ? -.03 : -.025, .020);
    if (bag) thread([[-.23, pelvisY - .10, .07], [-.08, pelvisY + .31, .155],
      [.18, shoulderY + .01, .10], [.21, shoulderY + .015, -.08], [-.23, pelvisY - .10, -.06]],
    .010, leather, "shoulder-satchel-strap");
    const practiceStaff = new T.Mesh(new T.CylinderGeometry(.018, .024, 1.28, 10), leather);
    practiceStaff.position.set(0, -.05, .08);
    practiceStaff.visible = false;
    hand.add(practiceStaff);

    // 3A Anatomically Contoured 1st-Century Levantine Leather Sandals (Sole, Welt, Toe Thong, Cross-Straps, Heel Loop & Ankle Tie)
    const sandals = [];
    for (const suffix of ["l", "r"]) {
      const s = suffix === "l" ? 1 : -1;
      const at = joint("foot_" + suffix);
      const footX = at[0], footZ = at[2];

      // Contoured multi-layer leather footbed fitted to actual MakeHuman foot contour + perimeter welt
      const soleLen = female ? .246 : .276;
      const soleHalfW = .052;
      const sole = new T.BoxGeometry(soleHalfW * 2, .010, soleLen, 10, 2, 18);
      const p = sole.attributes.position;
      const soleColors = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) {
        let lx = p.getX(i), ly = p.getY(i), lz = p.getZ(i);
        const u = lx / soleHalfW; // -1..1 across width
        const v = (lz + soleLen * .5) / soleLen; // 0 (heel) .. 1 (toes)
        // Anatomical footprint silhouette fitted to asymmetric medial/lateral foot widths
        const heelWidth = .66;
        const archWaist = .72 + s * u * .06 * Math.sin(v * Math.PI);
        const forefootWidth = 1.02;
        const toeRound = Math.sqrt(Math.max(.08, 1 - Math.pow(Math.max(0, (v - .78) / .22), 2)))
          * Math.sqrt(Math.max(.12, 1 - Math.pow(Math.max(0, (.14 - v) / .14), 2)));
        const widthProfile = (v < .45
          ? T.MathUtils.lerp(heelWidth, archWaist, v / .45)
          : T.MathUtils.lerp(archWaist, forefootWidth, (v - .45) / .55)) * toeRound;
        // Foot midline sits +0.007*s lateral of ankle joint footX; sole sits cleanly beneath plantar skin (y <= 0.001) with raised edge welt
        const footMidShift = s * (.004 + Math.sin(v * Math.PI) * .004);
        const rockerLift = v > .76 ? Math.pow((v - .76) / .24, 1.8) * .005 : 0;
        const edgeWelt = ly > 0 ? Math.pow(Math.abs(u), 3) * .0055 : 0;
        lx = lx * widthProfile + footX + footMidShift;
        ly = ly - .0025 + rockerLift + edgeWelt;
        lz = lz + footZ + (female ? .074 : .070);
        p.setXYZ(i, lx, ly, lz);
        const shade = ly > .001 ? (.82 + .14 * Math.abs(u)) : .58;
        soleColors[i * 3] = shade; soleColors[i * 3 + 1] = shade * .95; soleColors[i * 3 + 2] = shade * .90;
      }
      sole.setAttribute("color", new T.Float32BufferAttribute(soleColors, 3));
      sole.computeVertexNormals();
      // Helper to build flat leather straps along a 3D curve with valid UVs for Voronoi normal/roughness sampling
      const buildStrap = (pts, halfW, thick = .0032) => {
        const curve = new T.CatmullRomCurve3(pts.map(pt => new T.Vector3(...pt)));
        const segs = 18;
        const verts = [], inds = [], cols = [], uvs = [];
        for (let i = 0; i <= segs; i++) {
          const t = i / segs;
          const pos = curve.getPoint(t);
          const tan = curve.getTangent(t);
          const up = new T.Vector3(0, 1, 0);
          const sideVec = new T.Vector3().crossVectors(tan, up);
          if (sideVec.lengthSq() < .001) sideVec.set(1, 0, 0);
          sideVec.normalize();
          const normVec = new T.Vector3().crossVectors(sideVec, tan).normalize();
          for (const wSign of [-1, 1]) {
            for (const hSign of [0, 1]) {
              const vtx = pos.clone()
                .addScaledVector(sideVec, wSign * halfW)
                .addScaledVector(normVec, hSign * thick);
              verts.push(vtx.x, vtx.y, vtx.z);
              const edgeShade = (.84 + hSign * .14) * (1 - Math.abs(t - .5) * .12);
              cols.push(edgeShade, edgeShade * .96, edgeShade * .92);
              uvs.push(t, (wSign * .5 + .5) * .2 + hSign * .08);
            }
          }
          if (i > 0) {
            const b = i * 4, a = b - 4;
            inds.push(
              a + 1, b + 1, b + 3, a + 1, b + 3, a + 3,
              a, b + 2, b, a, a + 2, b + 2,
              a, b, b + 1, a, b + 1, a + 1,
              a + 2, a + 3, b + 3, a + 2, b + 3, b + 2
            );
          }
        }
        const strap = geometry(T, verts, inds, cols);
        strap.setAttribute("uv", new T.Float32BufferAttribute(uvs, 2));
        return strap;
      };

      const topInstep = female ? .069 : .076;
      const topFore = female ? .048 : .057;
      const toeGapZ = female ? .162 : .176;
      const heelBackZ = female ? .054 : .069;

      // Forefoot criss-cross leather straps & hallux toe thong wrapping outside measured foot dorsal skin
      const strapA = buildStrap([
        [footX - s * .044, .003, footZ + .142],
        [footX - s * .026, topFore, footZ + .126],
        [footX + s * .006, topInstep, footZ + .098],
        [footX + s * .042, .052, footZ + .082],
        [footX + s * .058, .003, footZ + .068]
      ], .0075);
      const strapB = buildStrap([
        [footX + s * .058, .003, footZ + .142],
        [footX + s * .038, topFore, footZ + .126],
        [footX + s * .004, topInstep + .003, footZ + .098],
        [footX - s * .030, .052, footZ + .082],
        [footX - s * .044, .003, footZ + .068]
      ], .0075);
      const toeThong = buildStrap([
        [footX - s * .018, .002, footZ + toeGapZ],
        [footX - s * .013, .040, footZ + toeGapZ - .028],
        [footX + s * .005, topInstep + .004, footZ + .098]
      ], .0048);
      // Heel counter loop & double ankle binding cord clearing posterior heel & anterior talus
      const heelLoop = buildStrap([
        [footX - s * .034, .004, footZ - .015],
        [footX - s * .032, .052, footZ - .045],
        [footX + s * .006, .062, footZ - heelBackZ],
        [footX + s * .042, .052, footZ - .045],
        [footX + s * .044, .004, footZ - .015]
      ], .0065);
      const ankleWrapLow = buildStrap(Array.from({ length: 13 }, (_, k) => {
        const ang = (k / 12) * Math.PI * 2;
        return [
          footX + s * .007 + Math.sin(ang) * .041,
          .076 - Math.cos(ang) * .010 + Math.cos(ang * 2) * .002,
          footZ + .008 + Math.cos(ang) * .062
        ];
      }), .0055);
      const ankleWrapHigh = buildStrap(Array.from({ length: 13 }, (_, k) => {
        const ang = (k / 12) * Math.PI * 2;
        return [
          footX + s * .007 + Math.sin(ang) * .038,
          .096 - Math.cos(ang) * .008 - Math.cos(ang * 2) * .002,
          footZ + .004 + Math.cos(ang) * .054
        ];
      }), .0050);

      // Merge per-foot sole + straps into one SkinnedMesh to prevent draw-call bloat & micro-LOD strap culling
      const sandalParts = [sole, strapA, strapB, toeThong, heelLoop, ankleWrapLow, ankleWrapHigh];
      const vertTotal = sandalParts.reduce((n, g) => n + g.attributes.position.count, 0);
      const mPos = new Float32Array(vertTotal * 3);
      const mNorm = new Float32Array(vertTotal * 3);
      const mCol = new Float32Array(vertTotal * 3);
      const mUv = new Float32Array(vertTotal * 2);
      const mIdx = [];
      let vCursor = 0;
      for (const piece of sandalParts) {
        const count = piece.attributes.position.count;
        mPos.set(piece.attributes.position.array, vCursor * 3);
        mNorm.set(piece.attributes.normal.array, vCursor * 3);
        mCol.set(piece.attributes.color.array, vCursor * 3);
        mUv.set(piece.attributes.uv.array, vCursor * 2);
        const idx = piece.getIndex();
        for (let k = 0; k < idx.count; k++) mIdx.push(idx.getX(k) + vCursor);
        vCursor += count;
        piece.dispose();
      }
      const mergedSandal = new T.BufferGeometry();
      mergedSandal.setAttribute("position", new T.Float32BufferAttribute(mPos, 3));
      mergedSandal.setAttribute("normal", new T.Float32BufferAttribute(mNorm, 3));
      mergedSandal.setAttribute("color", new T.Float32BufferAttribute(mCol, 3));
      mergedSandal.setAttribute("uv", new T.Float32BufferAttribute(mUv, 2));
      mergedSandal.setIndex(mIdx);
      sandals.push(skinned(mergedSandal, sandalLeather, () => [["foot_" + suffix, 1]]));
      sandals[sandals.length - 1].name = "sandal-" + suffix;
    }

    const worldPoint = new T.Vector3(), cameraPoint = new T.Vector3();
    body.onBeforeRender = (renderer, scene, camera) => {
      liveRenderer = renderer;
      worldPoint.setFromMatrixPosition(root.matrixWorld);
      camera.getWorldPosition(cameraPoint);
      eyeGroup.visible = cameraPoint.distanceToSquared(worldPoint) < 90.25;
      clothActive = cameraPoint.distanceToSquared(worldPoint) < 144;
    };

    let previous = null, gait = 0, motion = 0, crouch = 0, gesture = 0, gaze = 0, gazeTarget = 0, seated = 0, armed = false;
    let previousYaw = 0;
    let saccadeYaw = 0, saccadePitch = 0, saccadeTargetYaw = 0, saccadeTargetPitch = 0, nextSaccadeTime = 0;
    const phase = (seed % 1000) / 100;
    const legL1 = new T.Vector3(...joint("calf_l")).distanceTo(new T.Vector3(...joint("thigh_l")));
    const legL2 = new T.Vector3(...joint("foot_l")).distanceTo(new T.Vector3(...joint("calf_l")));
    let liveRenderer = null;
    let clothActive = true;
    const clothWind = new T.Vector3(), clothInertia = new T.Vector3();
    const clothToLocal = new T.Matrix4(), clothPinFrame = new T.Matrix4(), clothBindOffset = new T.Matrix4(), clothPin = new T.Vector3();
    let prevRootX = 0, prevRootZ = 0, prevVelX = 0, prevVelZ = 0;

    function animate(time, pace = 0, heading, posture = "idle", progress = 0, poseOptions = {}) {
      const speaking = posture === "talk" || posture === "seated-talk";
      if (previous === null || time < previous - .1) nextSaccadeTime = 0;
      const delta = previous === null ? 1 / 60 : Math.max(1 / 240, Math.min(.06, time - previous));
      previous = time;
      const ease = 1 - Math.exp(-delta * 11);
      motion += (Math.min(1.5, Math.abs(pace)) - motion) * ease;
      crouch += ((["kneel", "prayer"].includes(posture) ? 1 : 0) - crouch) * ease;
      seated += ((posture.startsWith("seated") ? 1 : 0) - seated) * ease;
      gesture += ((["talk", "seated-talk", "offer", "gesture"].includes(posture) ? 1 : 0) - gesture) * ease;
      gaze += (gazeTarget - gaze) * ease;
      clothTime.value = time + phase;
      clothPace.value = motion;
      if (Number.isFinite(heading)) {
        const difference = heading - root.rotation.y;
        root.rotation.y += Math.atan2(Math.sin(difference), Math.cos(difference)) * ease;
      }
      gait += delta * (4.1 + motion * 5.2) * look.stride;
      for (let index = 0; index < bones.length; index++) {
        bones[index].rotation.set(0, 0, 0);
        bones[index].position.copy(rest[index]);
      }

      // 3A Multi-Harmonic Asymmetric Gait & Respiratory Biomechanics
      const stanceActive = (1 - crouch) * (1 - seated);
      const rawSin = Math.sin(gait);
      const step = (rawSin + .16 * Math.sin(gait * 2 - .45)) * motion * stanceActive;
      // Non-linear thoracic-diaphragmatic breathing wave (longer exhalation rest)
      const rawBreath = Math.sin(time * 1.75 + phase);
      const breath = rawBreath + .22 * Math.sin(time * 3.5 + phase) - .12;
      const sway = (Math.sin(time * .82 + phase) * .0045 + Math.sin(time * .37 + phase * 1.7) * .0022) * (1 - Math.min(1, motion));
      const weightShift = Math.sin(time * .58 + phase) * (1 - Math.min(1, motion * 2)) * stanceActive;

      // Double-frequency vertical center-of-mass bob with heel-strike absorption
      const verticalBob = (Math.abs(Math.sin(gait)) * .018 + Math.max(0, Math.cos(gait * 2)) * .004) * motion;
      bone("pelvis").position.x += sway + weightShift * .0065 + Math.cos(gait) * .007 * motion * stanceActive;
      bone("pelvis").position.y += verticalBob - crouch * .45 - seated * .43 + breath * .0026;

      const seatOffset = poseOptions.seatOffset;
      if (Array.isArray(seatOffset) && seatOffset.length === 3 && seatOffset.every(Number.isFinite))
        bone("pelvis").position.addScaledVector(new T.Vector3(...seatOffset), seated);

      // Pelvic axial counter-rotation, anterior tilt during stride, and Trendelenburg hip list
      bone("pelvis").rotation.x = motion * .018 * stanceActive;
      bone("pelvis").rotation.y = step * .042;
      bone("pelvis").rotation.z = weightShift * .018 + step * .022;

      // Distribute thoracic flexion, axial counter-torque & breathing smoothly across spine chain
      const totalSpineX = motion * .028 + crouch * .16 + look.stoop + breath * .006;
      const totalSpineY = -step * .058;
      const totalSpineZ = step * .024 + breath * .002 - weightShift * .014;
      if (hasBone("spine_01") && hasBone("spine_02")) {
        bone("spine_01").rotation.set(totalSpineX * .28, totalSpineY * .25, totalSpineZ * .30);
        bone("spine_02").rotation.set(totalSpineX * .34, totalSpineY * .35, totalSpineZ * .35);
        bone("spine_03").rotation.set(totalSpineX * .38, totalSpineY * .40, totalSpineZ * .35);
      } else {
        bone("spine_03").rotation.set(totalSpineX, totalSpineY, totalSpineZ);
      }
      bone("spine_03").position.z += Math.max(0, breath) * .0032;

      // Clavicle elevation on inhalation + counter-swing during locomotion
      bone("clavicle_l").rotation.z = breath * .013 + step * .012;
      bone("clavicle_r").rotation.z = -breath * .013 + step * .012;
      bone("clavicle_l").rotation.y = -step * .018;
      bone("clavicle_r").rotation.y = -step * .018;

      // Cervical stabilization (neck absorbs 35% of thoracic pitch/roll to keep horizon level)
      bone("neck_01").rotation.x = -motion * .024 + breath * .007 + (speaking ? Math.sin(time * 2.8 + phase) * .010 : 0);
      bone("neck_01").rotation.y = gaze * .28 + step * .018;
      bone("neck_01").rotation.z = -totalSpineZ * .35;

      bone("head").rotation.y = gaze * .72 + Math.sin(time * .62 + phase) * .032 * (1 - Math.min(1, motion));
      bone("head").rotation.x = crouch * .17 + (speaking ? (Math.sin(time * 3.4) * .019 + Math.sin(time * 1.7) * .013) : 0);
      bone("head").rotation.z = speaking ? Math.sin(time * 1.1 + phase) * .015 : -weightShift * .008;

      const headYaw = bone("head").rotation.y + bone("neck_01").rotation.y;
      const yawRate = (headYaw - previousYaw) / Math.max(.001, delta);
      previousYaw = headYaw;
      hairDynamics.update(-yawRate * .022 + Math.sin(time * 1.6 + phase) * .0014,
        -motion * .008 + Math.sin(time * 2.1 + phase) * .0014, delta);
      clothDynamics.update(-yawRate * .010 + step * .004, -motion * .007, delta);

      // Two-Bone Analytical Foot IK & Terrain Slope Adaptation
      let dHL = 0, dHR = 0, terrainPitch = 0, terrainRoll = 0;
      if (typeof root.userData.heightAt === "function" && !crouch && !seated) {
        const hAt = root.userData.heightAt;
        const rPos = root.position, headingAngle = root.rotation.y;
        const cosH = Math.cos(headingAngle), sinH = Math.sin(headingAngle);
        const stanceW = 0.11;
        const swingOffset = step * 0.18;
        const pXL = rPos.x + cosH * stanceW - sinH * swingOffset;
        const pZL = rPos.z - sinH * stanceW - cosH * swingOffset;
        const pXR = rPos.x - cosH * stanceW + sinH * swingOffset;
        const pZR = rPos.z + sinH * stanceW + cosH * swingOffset;
        const hCenter = hAt(rPos.x, rPos.z);
        dHL = T.MathUtils.clamp(hAt(pXL, pZL) - hCenter, -0.22, 0.22);
        dHR = T.MathUtils.clamp(hAt(pXR, pZR) - hCenter, -0.22, 0.22);
        const hFront = hAt(rPos.x - sinH * 0.24, rPos.z - cosH * 0.24);
        const hBack = hAt(rPos.x + sinH * 0.24, rPos.z + cosH * 0.24);
        terrainPitch = T.MathUtils.clamp((hFront - hBack) / 0.48, -0.55, 0.55);
        terrainRoll = T.MathUtils.clamp((dHL - dHR) / (stanceW * 2), -0.45, 0.45);
        const pelvisIKDrop = Math.min(0, Math.min(dHL, dHR));
        bone("pelvis").position.y += pelvisIKDrop * 0.85;
      }

      // Natural anatomical finger flexion cascade (progressive curl from index to pinky)
      const baseCurl = { index: .09, middle: .14, ring: .19, pinky: .24 };
      const fingerSplay = { index: -.035, middle: -.01, ring: .018, pinky: .045 };
      for (const suffix of ["l", "r"]) {
        const side = suffix === "l" ? 1 : -1;
        const swing = side * step;
        // Phase-lagged knee clearance and forearm pendulum
        const swingVelocity = side * Math.cos(gait) * motion * stanceActive;
        const elbowLag = Math.sin(gait - .42) * side * motion * stanceActive;
        const footDiff = suffix === "l" ? dHL : dHR;

        const hipY = joint("thigh_" + suffix)[1] + (bone("pelvis").position.y - rest[jointIndex("pelvis")].y);
        const footClearance = Math.max(0, swing) * .048 + Math.max(0, swingVelocity) * .022;
        const targetY = joint("foot_" + suffix)[1] + footDiff + footClearance;
        const dy = Math.max(.05, hipY - targetY);
        const dz = swing * .125;
        const reach = T.MathUtils.clamp(Math.hypot(dy, dz), Math.abs(legL1 - legL2) + .002, legL1 + legL2 - .002);
        const kneeInterior = Math.acos(T.MathUtils.clamp((legL1 * legL1 + legL2 * legL2 - reach * reach) / (2 * legL1 * legL2), -1, 1));
        const calfBend = Math.PI - kneeInterior;
        const hipAlpha = Math.acos(T.MathUtils.clamp((legL1 * legL1 + reach * reach - legL2 * legL2) / (2 * legL1 * reach), -1, 1));
        const phi = Math.atan2(dz, dy);

        const thighRot = (-(phi + hipAlpha) - crouch * .25) * (1 - seated) - seated * 1.35;
        const calfRot = (calfBend + crouch * 1.88) * (1 - seated) + seated * 1.42;
        bone("thigh_" + suffix).rotation.x = thighRot;
        bone("calf_" + suffix).rotation.x = calfRot;
        // Heel-strike dorsiflexion to push-off plantarflexion ankle roll
        const ankleRoll = (swing > 0 ? -swing * .14 : swing * .22) * (1 - seated) * (1 - crouch);
        bone("foot_" + suffix).rotation.x = -terrainPitch * .82 - (thighRot + calfRot) * .55 - crouch * 1.2 + ankleRoll;
        bone("foot_" + suffix).rotation.z = side * terrainRoll * .35;

        // Upper arm & phase-lagged forearm swing
        bone("upperarm_" + suffix).rotation.x = -swing * .34 - crouch * .27;
        bone("upperarm_" + suffix).rotation.z = -side * (.028 + Math.abs(step) * .018);
        bone("lowerarm_" + suffix).rotation.x = -.10 - Math.max(0, elbowLag) * .24 - Math.abs(swing) * .08 - crouch * .58;
        bone("hand_" + suffix).rotation.z = -side * .04 + elbowLag * .06;

        const gripping = Boolean((look.item && !bag) || armed) && suffix === "r";
        const phalanxWeights = { "01": .85, "02": 1.18, "03": .92 };
        for (const finger of ["index", "middle", "ring", "pinky"]) {
          const curl = baseCurl[finger];
          for (const section of ["01", "02", "03"]) {
            const pw = phalanxWeights[section];
            bone(finger + "_" + section + "_" + suffix).rotation.x = -(gripping ? .58 * pw : curl * pw) +
              Math.sin(time * .73 + side + baseCurl[finger] * 4) * .014;
            if (section === "01" && !gripping) {
              bone(finger + "_01_" + suffix).rotation.z = side * fingerSplay[finger];
            }
          }
        }
        for (const section of ["01", "02", "03"]) {
          bone("thumb_" + section + "_" + suffix).rotation.set(
            -(gripping ? .35 : .11) + Math.sin(time * .73 + side) * .01,
            side * (gripping ? .22 : .07),
            side * (gripping ? -.15 : -.045)
          );
        }
      }

      const freeHand = look.item && !bag ? "l" : "r";
      const cadence = time * (look.gesture === "teach" ? 1.6 : 2.1) + phase;
      bone("upperarm_" + freeHand).rotation.x -= gesture * (.27 + Math.sin(cadence) * .11);
      bone("lowerarm_" + freeHand).rotation.x -= gesture * (.58 + Math.sin(cadence * 1.4) * .12);
      bone("hand_" + freeHand).rotation.y += gesture * (.23 + Math.cos(cadence * .8) * .08);
      // Expressive finger opening during active conversation gestures
      if (gesture > .15) {
        const openWave = (.5 + .5 * Math.sin(cadence * 1.2)) * gesture;
        for (const finger of ["index", "middle", "ring", "pinky"]) {
          for (const section of ["01", "02", "03"]) {
            bone(finger + "_" + section + "_" + freeHand).rotation.x *= (1 - openWave * .52);
          }
        }
      }
      if (look.item === "staff" && !armed) {
        bone("upperarm_r").rotation.x = -.12 - motion * .08;
        bone("lowerarm_r").rotation.x = -.22;
        bone("upperarm_r").rotation.z = .08;
      }

      const greeting = posture === "greet";
      const teaching = posture === "teach" || (look.gesture === "teach" && gesture > .2);
      const praying = posture === "prayer";
      const serving = posture === "serve";
      const reclining = posture === "recline";
      if (greeting) {
        bone("spine_03").rotation.x += .10;
        bone("head").rotation.x += .08;
        bone("upperarm_r").rotation.set(-.82, .24, .36);
        bone("lowerarm_r").rotation.set(-1.24, 0, 0);
        bone("hand_r").rotation.set(0, -.18, 0);
        for (const f of ["index", "middle", "ring", "pinky"]) for (const sec of ["01", "02", "03"]) {
          bone(f + "_" + sec + "_r").rotation.x = -.16;
        }
        for (const sec of ["01", "02", "03"]) bone("thumb_" + sec + "_r").rotation.set(-.08, .10, -.04);
      }
      if (teaching) {
        bone("upperarm_r").rotation.set(-.58, -.14, .24);
        bone("lowerarm_r").rotation.set(-.84, .18, -.08);
        bone("hand_r").rotation.set(-.14, 0, .14);
        bone("head").rotation.set(-.04, 0, 0);
        for (const sec of ["01", "02", "03"]) {
          bone("index_" + sec + "_r").rotation.x = -.04;
          bone("middle_" + sec + "_r").rotation.x = -.05;
          bone("ring_" + sec + "_r").rotation.x = -.54;
          bone("pinky_" + sec + "_r").rotation.x = -.58;
          bone("thumb_" + sec + "_r").rotation.set(-.12, .22, .12);
        }
      }
      if (praying && crouch < .3) {
        bone("upperarm_l").rotation.set(-.62, .18, -.42);
        bone("upperarm_r").rotation.set(-.62, -.18, .42);
        bone("lowerarm_l").rotation.set(-.78, 0, 0);
        bone("lowerarm_r").rotation.set(-.78, 0, 0);
        bone("head").rotation.set(-.16, 0, 0);
        for (const suf of ["l", "r"]) {
          const s = suf === "l" ? 1 : -1;
          for (const f of ["index", "middle", "ring", "pinky"]) for (const sec of ["01", "02", "03"]) {
            bone(f + "_" + sec + "_" + suf).rotation.x = -.03;
          }
          for (const sec of ["01", "02", "03"]) bone("thumb_" + sec + "_" + suf).rotation.set(-.06, s * .12, s * -.08);
        }
      }
      if (serving) {
        bone("pelvis").position.y -= .38;
        bone("thigh_r").rotation.x = -1.25; bone("calf_r").rotation.x = 1.35;
        bone("thigh_l").rotation.x = -.28; bone("calf_l").rotation.x = .88;
        bone("spine_03").rotation.x = .32;
        bone("upperarm_l").rotation.x = -.42; bone("lowerarm_l").rotation.x = -.85;
        bone("upperarm_r").rotation.x = -.42; bone("lowerarm_r").rotation.x = -.85;
      }
      if (reclining) {
        bone("pelvis").position.y -= .42;
        bone("spine_03").rotation.z = .20; bone("spine_03").rotation.x = .14;
        bone("upperarm_l").rotation.set(-.18, 0, -.82);
        bone("lowerarm_l").rotation.set(-1.08, 0, 0);
        bone("upperarm_r").rotation.set(-.42, .18, .28);
        bone("lowerarm_r").rotation.set(-.58, 0, 0);
      }
      if (posture === "tend") {
        const work = poseOptions.work;
        if (work === "plane") {
          const stroke = Math.sin(time * 3.1 + phase);
          bone("spine_03").rotation.x += .18 + stroke * .045;
          bone("head").rotation.x += .22;
          bone("upperarm_r").rotation.x = -.52 - stroke * .24;
          bone("lowerarm_r").rotation.x = -.64 + stroke * .22;
          bone("upperarm_l").rotation.x = -.48 - stroke * .22;
          bone("lowerarm_l").rotation.x = -.62 + stroke * .20;
        } else if (work === "saw") {
          const stroke = Math.sin(time * 4.4 + phase);
          bone("spine_03").rotation.x += .16 + stroke * .035;
          bone("spine_03").rotation.y += -.08 + stroke * .04;
          bone("head").rotation.x += .20;
          bone("upperarm_r").rotation.x = -.42 - stroke * .28;
          bone("lowerarm_r").rotation.x = -.58 + stroke * .26;
          bone("upperarm_l").rotation.x = -.38;
          bone("lowerarm_l").rotation.x = -.52;
        } else if (work === "heave") {
          const pull = Math.sin(time * 5.2 + phase) * .08 + (progress || .5) * .12;
          bone("spine_03").rotation.x += .22 - pull * .35;
          bone("head").rotation.x += .08;
          bone("upperarm_r").rotation.x = -.68 + pull;
          bone("lowerarm_r").rotation.x = -.95 - pull * .6;
          bone("upperarm_l").rotation.x = -.66 + pull;
          bone("lowerarm_l").rotation.x = -.92 - pull * .6;
        } else if (work === "hearth") {
          const stir = Math.sin(time * 2.2 + phase);
          bone("spine_03").rotation.x += .10;
          bone("head").rotation.x += .14;
          bone("upperarm_r").rotation.x = -.46 + stir * .08;
          bone("lowerarm_r").rotation.x = -.68;
          bone("upperarm_r").rotation.y = stir * .08;
          bone("upperarm_l").rotation.x = -.32;
          bone("lowerarm_l").rotation.x = -.76;
        } else {
          bone("spine_03").rotation.x += look.gesture === "read" ? .06 : .13;
          bone("head").rotation.x += .18;
          const handwork = Math.sin(time * (look.gesture === "read" ? .8 : 2.3) + phase);
          bone("upperarm_r").rotation.x -= .38 + handwork * .10;
          bone("lowerarm_r").rotation.x -= .47;
          bone("upperarm_l").rotation.x -= .32;
          bone("lowerarm_l").rotation.x -= .51 - handwork * .07;
          bone("hand_r").rotation.y += handwork * .14;
        }
      }
      if (poseOptions.work === "rope-seated" && posture.startsWith("seated")) {
        const twist = Math.sin(time * 1.45 + phase);
        bone("spine_03").rotation.x += .07;
        bone("head").rotation.x += speaking ? .04 : .11;
        bone("upperarm_r").rotation.x = -.34 + twist * .045;
        bone("lowerarm_r").rotation.x = -.82 - twist * .06;
        bone("upperarm_l").rotation.x = -.32 - twist * .03;
        bone("lowerarm_l").rotation.x = -.78 + twist * .05;
        bone("hand_r").rotation.z = -.18 + twist * .12;
      }
      if (poseOptions.work === "point" && !posture.startsWith("seated")) {
        const reach = Math.sin(time * 1.8 + phase) * .04;
        bone("upperarm_r").rotation.set(-.76 + reach, -.18, .22);
        bone("lowerarm_r").rotation.set(-.34, 0, 0);
      }
      if (Number.isFinite(poseOptions.headPitch)) bone("head").rotation.x += T.MathUtils.clamp(poseOptions.headPitch, -.28, .28);
      if (Number.isFinite(poseOptions.headYaw)) bone("head").rotation.y += T.MathUtils.clamp(poseOptions.headYaw, -.35, .35);
      if (posture === "carry" || (["basket", "jar"].includes(look.item) && !["tend", "cross"].includes(posture))) {
        for (const suffix of ["l", "r"]) {
          bone("upperarm_" + suffix).rotation.x = -.35;
          bone("lowerarm_" + suffix).rotation.x = -.98;
          bone("upperarm_" + suffix).rotation.z = suffix === "r" ? -.16 : .22;
        }
      }
      if (posture === "cross") {
        bone("upperarm_l").rotation.z = -1.35;
        bone("upperarm_r").rotation.z = 1.35;
        bone("head").rotation.x = .18;
      }
      const combat = posture === "ready" || posture === "guard" || posture.startsWith("windup") || ["strike", "sweep", "stagger"].includes(posture);
      if (combat) {
        const windup = posture.startsWith("windup") ? .5 + progress * .35 : 0;
        const strike = ["strike", "sweep"].includes(posture) ? Math.sin(Math.PI * Math.min(1, progress * 1.35)) : 0;
        bone("spine_03").rotation.y += windup * .28 - strike * .45;
        for (const suffix of ["l", "r"]) {
          bone("upperarm_" + suffix).rotation.x = -.50 - windup * .62 - strike * .64;
          bone("lowerarm_" + suffix).rotation.x = -.62 + strike * .35;
        }
        if (posture === "guard") {
          bone("upperarm_r").rotation.x = -1.10;
          bone("lowerarm_r").rotation.x = -1.05;
        }
      }
      if (posture === "evade") {
        bone("pelvis").position.y -= .26;
        bone("spine_03").rotation.x += .28;
        for (const suffix of ["l", "r"]) {
          bone("thigh_" + suffix).rotation.x -= .53;
          bone("calf_" + suffix).rotation.x += .72;
        }
      }
      if (posture === "stagger") bone("spine_03").rotation.z -= .18;
      elbowBend.value.set(Math.min(1.2, Math.abs(bone("lowerarm_l").rotation.x)), Math.min(1.2, Math.abs(bone("lowerarm_r").rotation.x)));

      // 3A Blink Profile (fast closing snap ~65ms, slightly slower opening recovery ~130ms, plus occasional double-blink)
      const blinkCycle = (time + phase) % 4.67;
      const primaryBlink = blinkCycle > 2.02 && blinkCycle < 2.22
        ? (blinkCycle < 2.085 ? (blinkCycle - 2.02) / .065 : 1 - (blinkCycle - 2.085) / .135) : 0;
      const doubleBlink = ((seed & 3) === 0) && blinkCycle > 2.32 && blinkCycle < 2.48
        ? (blinkCycle < 2.37 ? (blinkCycle - 2.32) / .05 : 1 - (blinkCycle - 2.37) / .11) : 0;
      const blink = T.MathUtils.clamp(Math.max(primaryBlink, doubleBlink), 0, 1);
      body.morphTargetInfluences[0] = blink;
      body.morphTargetInfluences[1] = blink;

      // Multi-band Speech Articulation, Jaw Coupling & Expressive Micro-Morphs
      const speechSeed = Number.isFinite(poseOptions.speechSeed) ? poseOptions.speechSeed : phase;
      const speechBreath = Math.pow(.5 + .5 * Math.sin(time * 1.18 + speechSeed), .32);
      const speechCadence = (.44 + .56 * (.5 + .5 * Math.sin(time * 2.75 + speechSeed * 1.7))) * speechBreath;
      const bilabialClosure = Math.max(0, Math.sin(time * 18.5 + speechSeed * 3.1));
      const phonemes = (Math.sin(time * 9.2 + speechSeed) * .52 + Math.sin(time * 15.1 + speechSeed * 2.1) * .33 + Math.sin(time * 23.4) * .15)
        * (1 - bilabialClosure * .45);
      body.morphTargetInfluences[2] = speaking ?
        speechCadence * (0.055 + Math.max(0, phonemes) * .28) : 0;
      groom.jawOpen.value = body.morphTargetInfluences[2];
      const emphasisSyllable = speaking ? Math.max(0, phonemes) * speechCadence * .12 : 0;
      body.morphTargetInfluences[3] = (look.gesture === "teach" || speaking ? .22 : .08) + Math.sin(time * .65 + phase) * .04 + emphasisSyllable;
      body.morphTargetInfluences[4] = (speaking ? .22 + Math.sin(time * 1.05 + speechSeed) * .08 : .10) + emphasisSyllable * .6;

      // Dynamic Pupil Dilation (dilates slightly during speech/prayer/emotion, constricts in guard/combat focus)
      const targetPupilScale = combat ? .82 : praying ? 1.16 : speaking ? 1.08 + emphasisSyllable * .4 : 1.0 + Math.sin(time * .45 + phase) * .04;
      uPupilScale.value += (targetPupilScale - uPupilScale.value) * ease;
      for (const pMesh of pupils) pMesh.scale.set(uPupilScale.value, uPupilScale.value, 1);

      // 3A Ballistic Eye Saccades + Vestibulo-Ocular Reflex (VOR) + Eyelid Gaze Following
      if (time >= nextSaccadeTime || blink > .75) {
        const sHash = hash2(Math.floor(time * 3.7) + (seed & 255), phase);
        const sHash2 = hash2(phase, Math.floor(time * 4.3) + (seed & 255));
        const maxYaw = speaking ? .068 : .045;
        const maxPitch = speaking ? .032 : .020;
        saccadeTargetYaw = (sHash - .5) * 2 * maxYaw;
        saccadeTargetPitch = (sHash2 - .5) * 2 * maxPitch;
        nextSaccadeTime = time + (speaking ? .45 + sHash * .95 : .85 + sHash * 1.65);
      }
      const saccadeEase = 1 - Math.exp(-delta * 28);
      saccadeYaw += (saccadeTargetYaw - saccadeYaw) * saccadeEase;
      saccadePitch += (saccadeTargetPitch - saccadePitch) * saccadeEase;

      // Ocular micro-tremor + VOR compensation (eyes counter-rotate slightly against head yaw/pitch to lock fixation)
      const tremorY = Math.sin(time * 19.3 + phase) * .0016;
      const tremorX = Math.sin(time * 23.7 + phase) * .0012;
      const vorYaw = -bone("head").rotation.y * .22;
      const vorPitch = -bone("head").rotation.x * .18;
      const finalEyeYaw = T.MathUtils.clamp(saccadeYaw + vorYaw + tremorY, -.16, .16);
      const finalEyePitch = T.MathUtils.clamp(saccadePitch + vorPitch + tremorX, -.10, .10);

      for (const eye of eyes) {
        eye.visible = blink < .98;
        eye.rotation.y = finalEyeYaw;
        eye.rotation.x = finalEyePitch;
      }

      // Upper & lower eyelids subtly track vertical eye pitch (palpebral-ocular synkinesis) + blink closure
      uLidShadowDynamic.value = .46 + blink * .38 + Math.max(0, finalEyePitch) * .45;
      for (const lid of lids) {
        lid.upper.rotation.x = blink * .68 + finalEyePitch * .42;
        lid.lower.rotation.x = -blink * .06 + finalEyePitch * .24 - body.morphTargetInfluences[4] * .05;
      }
      for (const sandal of sandals) sandal.visible = posture !== "barefoot";
      if (personalItem) personalItem.visible = !armed && !combat && posture !== "cross";

      // Drive independent cloth layers (GPU compute / CPU Verlet) with wind, stride inertia, body capsules & terrain height
      if (clothLayers.length && clothActive) {
        const yaw = root.rotation.y, cosH = Math.cos(yaw), sinH = Math.sin(yaw);
        const gust = (.32 + Math.sin(time * .7 + phase) * .16 + motion * .45) * (1 - seated * .75);
        const wx = (Math.sin(time * .43 + phase) * .55 + .22) * gust, wz = Math.cos(time * .31 + phase) * .45 * gust;
        clothWind.set(wx * cosH + wz * sinH, 0, -wx * sinH + wz * cosH);
        const velX = (root.position.x - prevRootX) / delta, velZ = (root.position.z - prevRootZ) / delta;
        const accX = T.MathUtils.clamp((velX - prevVelX) / delta, -9, 9), accZ = T.MathUtils.clamp((velZ - prevVelZ) / delta, -9, 9);
        prevRootX = root.position.x; prevRootZ = root.position.z; prevVelX = velX; prevVelZ = velZ;
        clothInertia.set(-accX * .012 + step * motion * .12, 0, -accZ * .012 + Math.sin(gait) * motion * .2);
        const pelvisShift = bone("pelvis").position.clone().sub(rest[jointIndex("pelvis")]);
        const pelvisDelta = pelvisShift.y;
        const groundLocal = (typeof root.userData.heightAt === "function" ? root.userData.heightAt(root.position.x, root.position.z) : root.position.y) - root.position.y + .012;
        root.updateMatrixWorld(true);
        clothToLocal.copy(root.matrixWorld).invert();
        const boneLocal = (name, out) => out.setFromMatrixPosition(bone(name).matrixWorld).applyMatrix4(clothToLocal);
        const knees = {}, legCaps = ["l", "r"].flatMap(suffix => {
          const hip = boneLocal("thigh_" + suffix, new T.Vector3()), knee = boneLocal("calf_" + suffix, new T.Vector3()), ankle = boneLocal("foot_" + suffix, new T.Vector3());
          knees[suffix] = knee;
          const lowShin = knee.clone().lerp(ankle, .92);
          return [
            { a: [hip.x, hip.y, hip.z], b: [knee.x, knee.y, knee.z], r: seated > .25 ? .132 : .108 },
            { a: [knee.x, knee.y, knee.z], b: [lowShin.x, lowShin.y, lowShin.z], r: seated > .25 ? .122 : .102 }
          ];
        });
        if (seated > .25 && knees.l && knees.r) legCaps.push({ a: [knees.l.x, knees.l.y, knees.l.z], b: [knees.r.x, knees.r.y, knees.r.z], r: .132 });
        const spineForward = Math.sin(bone("spine_03").rotation.x) * .28;
        const torsoCap = { a: [pelvisShift.x, pelvisY + pelvisDelta - .02, pelvisShift.z + .01], b: [pelvisShift.x, shoulderY + pelvisDelta - .03, pelvisShift.z + spineForward + .02], r: .176 };
        const chestCap = { a: [pelvisShift.x - .085, shoulderY + pelvisDelta - .11, pelvisShift.z + spineForward * .7 + .042], b: [pelvisShift.x + .085, shoulderY + pelvisDelta - .11, pelvisShift.z + spineForward * .7 + .042], r: .124 };
        const yokeCap = { a: [pelvisShift.x - .10, shoulderY + pelvisDelta - .03, pelvisShift.z + spineForward * .5], b: [pelvisShift.x + .10, shoulderY + pelvisDelta - .03, pelvisShift.z + spineForward * .5], r: .102 };
        const kneeFwd = Math.max(0, knees.l?.z ?? 0, knees.r?.z ?? 0) * .25;
        const hipMidY = (pelvisY + pelvisDelta + hem) * .5;
        const hipR = .204 * (1 - seated * .35), skirtR = .242 * (1 - seated * .45);
        const mantleCaps = [torsoCap, chestCap, yokeCap];
        for (const s of [-1, 1]) {
          mantleCaps.push(
            { a: [pelvisShift.x + s * .054, pelvisY + pelvisDelta - .03, pelvisShift.z], b: [pelvisShift.x + s * .054, hipMidY, pelvisShift.z + kneeFwd * .4], r: hipR },
            { a: [pelvisShift.x + s * .054, hipMidY, pelvisShift.z + kneeFwd * .4], b: [pelvisShift.x + s * .054, hem + .08, pelvisShift.z + kneeFwd], r: skirtR }
          );
        }
        const skirtShape = Math.round(55 * (1 - seated) + 42 * seated);
        for (const layer of clothLayers) {
          const ud = layer.mesh.userData;
          const cols = ud.restPin.length / 3;
          if (!ud.pinBuf) ud.pinBuf = new Float32Array(ud.restPin.length);
          const bind = joint(ud.pinBone);
          clothBindOffset.makeTranslation(-bind[0], -bind[1], -bind[2]);
          clothPinFrame.copy(clothToLocal).multiply(bone(ud.pinBone).matrixWorld).multiply(clothBindOffset);
          for (let c = 0; c < cols; c++) {
            clothPin.fromArray(ud.restPin, c * 3).applyMatrix4(clothPinFrame).toArray(ud.pinBuf, c * 3);
          }
          const isMantle = layer === mantleSim;
          let restFrame = clothPinFrame;
          if (!isMantle && seated > .01) {
            if (!ud.seatMats) ud.seatMats = [new T.Matrix4(), new T.Matrix4(), new T.Matrix4(), new T.Matrix4()];
            const [res, pivA, rotX, pivB] = ud.seatMats;
            pivA.makeTranslation(0, pelvisY - .02, 0);
            rotX.makeRotationX(-seated * 1.05);
            pivB.makeTranslation(0, -(pelvisY - .02), 0);
            restFrame = res.copy(clothPinFrame).multiply(pivA).multiply(rotX).multiply(pivB);
          }
          layer.update(delta, {
            renderer: liveRenderer, time, wind: clothWind.toArray(), inertia: clothInertia.toArray(),
            gravity: 9.8, capsules: isMantle ? mantleCaps : [torsoCap, ...legCaps],
            groundY: groundLocal, pinTargets: ud.pinBuf, restFrame, stiffness: isMantle ? .84 : .8, shape: isMantle ? 30 : Math.min(ud.shape ?? 26, skirtShape)
          });
        }
        if (mantleSim) for (const fringe of fringes) {
          const i = fringe.userData.corner * 3;
          fringe.position.set(
            mantleSim.positions[i] - mantleSim.rest[i],
            mantleSim.positions[i + 1] - mantleSim.rest[i + 1],
            mantleSim.positions[i + 2] - mantleSim.rest[i + 2]);
        }
      }
    }
    root.traverse(obj => {
      if (obj.isMesh && /hair-cards$/.test(obj.name)) obj.receiveShadow = false;
    });
    CharacterDetail.batchGarments(T, root, skeleton);
    animate(0, 0, 0);
    return {
      object: root, animate,
      cloth: clothLayers,
      arm(enabled) { armed = enabled; practiceStaff.visible = enabled; },
      look(angle) { gazeTarget = Math.max(-.46, Math.min(.46, angle)); },
      profile: look,
      dispose() {
        const geometries = new Set(), materials = new Set();
        root.traverse(part => {
          if (part.geometry) geometries.add(part.geometry);
          if (part.material) for (const mat of [part.material].flat()) materials.add(mat);
          if (part.customDepthMaterial) materials.add(part.customDepthMaterial);
        });
        geometries.forEach(item => item.dispose());
        materials.forEach(item => item.dispose());
        for (const layer of clothLayers) layer.dispose();
        skeleton.dispose();
      }
    };
  }

  globalThis.AdventureCharacter = { create };
})();
