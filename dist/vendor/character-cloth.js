(() => {
  "use strict";

  // 3A Realistic Position-Based Verlet / XPBD Cloth Simulation & Rendering Engine.
  // Supports GPGPU ping-pong float targets with Jacobi distance/bending/tether constraints
  // and a synchronized CPU Gauss-Seidel solver with aerodynamic drag, capsule friction,
  // dynamic compression wrinkle AO, thin-fabric translucency, and wind-deformed shadow maps.
  const MAX_CAPSULES = 6;

  function fract(x) {
    return x - Math.floor(x);
  }

  function hash2(x, y) {
    return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
  }

  function tileNoise2(x, y, px, py) {
    const ix = ((Math.floor(x) % px) + px) % px;
    const iy = ((Math.floor(y) % py) + py) % py;
    const ix1 = (ix + 1) % px;
    const iy1 = (iy + 1) % py;
    const fx = x - Math.floor(x), fy = y - Math.floor(y);
    const ux = fx * fx * (3 - 2 * fx);
    const uy = fy * fy * (3 - 2 * fy);
    const a = hash2(ix, iy);
    const b = hash2(ix1, iy);
    const c = hash2(ix, iy1);
    const d = hash2(ix1, iy1);
    return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  }

  // High-definition procedural woven microfiber & slub normal map (cached per Three.js instance)
  const fuzzMapCache = new WeakMap();
  function getFuzzNormalMap(T) {
    if (typeof CharacterDetail !== "undefined" && typeof CharacterDetail.maps === "function") {
      const existing = CharacterDetail.maps(T);
      if (existing && existing.fuzzNormal) return existing.fuzzNormal;
    }
    if (fuzzMapCache.has(T)) return fuzzMapCache.get(T);

    const size = 256;
    const height = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
      const ny = y / size;
      for (let x = 0; x < size; x++) {
        const nx = x / size;
        const warpAngle = nx * 48 * Math.PI * 2;
        const weftAngle = ny * 48 * Math.PI * 2;
        const warpSlub = .75 + .45 * tileNoise2(nx * 12, ny * 48, 12, 48);
        const weftSlub = .75 + .45 * tileNoise2(nx * 48, ny * 12, 48, 12);
        const warp = (Math.cos(warpAngle) * .5 + .5) * warpSlub;
        const weft = (Math.cos(weftAngle) * .5 + .5) * weftSlub;
        const basket = Math.sin(warpAngle * .5) * Math.sin(weftAngle * .5);
        const plyTwist = Math.sin((nx * 96 + ny * 96) * Math.PI * 2) * .12;
        const fuzz = (tileNoise2(nx * 96, ny * 96, 96, 96) - .5) * .24;
        height[y * size + x] = (basket > 0 ? warp * .62 + weft * .24 : weft * .62 + warp * .24) + plyTwist + fuzz;
      }
    }

    const pixels = new Uint8Array(size * size * 4);
    const scale = 2.25;
    for (let y = 0; y < size; y++) {
      const yPrev = (y - 1 + size) % size, yNext = (y + 1) % size;
      for (let x = 0; x < size; x++) {
        const xPrev = (x - 1 + size) % size, xNext = (x + 1) % size;
        const p = (y * size + x) * 4;
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
    normal.needsUpdate = true;

    fuzzMapCache.set(T, normal);
    if (typeof CharacterDetail !== "undefined" && typeof CharacterDetail.maps !== "function") {
      CharacterDetail.maps = inst => ({ fuzzNormal: getFuzzNormalMap(inst || T) });
    }
    return normal;
  }

  function create(T, opts) {
    const {
      cols, rows, rest, weaveUv, tones, indices,
      pinRow = 0, color, sheenColor, name = "cloth-layer", fuzzRepeat = 7, wrapX = false
    } = opts;
    const N = cols * rows;
    const identityFrame = new T.Matrix4();
    const previousFrame = new T.Matrix4(), frameDelta = new T.Matrix4();
    let hasPreviousFrame = false;

    const invMass = new Float32Array(N);
    const rowFactor = new Float32Array(N);
    const restData = new Float32Array(N * 4);
    const clothUv = new Float32Array(N * 2);

    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / cols), col = i % cols;
      const vNorm = Math.abs(row - pinRow) / Math.max(1, rows - 1);
      rowFactor[i] = vNorm;
      invMass[i] = row === pinRow ? 0 : (.88 + vNorm * .24);
      restData[i * 4] = rest[i * 3];
      restData[i * 4 + 1] = rest[i * 3 + 1];
      restData[i * 4 + 2] = rest[i * 3 + 2];
      restData[i * 4 + 3] = invMass[i];
      clothUv[i * 2] = (col + .5) / cols;
      clothUv[i * 2 + 1] = (row + .5) / rows;
    }

    function dataTex(data) {
      const t = new T.DataTexture(data, cols, rows, T.RGBAFormat, T.FloatType);
      t.minFilter = t.magFilter = T.NearestFilter;
      t.wrapS = wrapX ? T.RepeatWrapping : T.ClampToEdgeWrapping;
      t.wrapT = T.ClampToEdgeWrapping;
      t.needsUpdate = true;
      return t;
    }

    const restTex = dataTex(restData);
    const pinData = new Float32Array(N * 4);
    for (let c = 0; c < cols; c++) pinData[(pinRow * cols + c) * 4 + 3] = 1;
    const pinTex = dataTex(pinData);
    const cpuPosData = new Float32Array(N * 4);
    const cpuPosTex = dataTex(cpuPosData);

    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(rest.slice(), 3));
    geometry.setAttribute("uv", new T.Float32BufferAttribute(weaveUv, 2));
    geometry.setAttribute("color", new T.Float32BufferAttribute(tones, 3));
    geometry.setAttribute("clothUv", new T.BufferAttribute(clothUv, 2));
    const finalIndices = indices.slice();
    if (wrapX) {
      for (let r = 1; r < rows; r++) {
        const a = r * cols, b = a - cols, ap = r * cols + cols - 1, bp = (r - 1) * cols + cols - 1;
        finalIndices.push(a, b, ap, ap, b, bp);
      }
    }
    geometry.setIndex(finalIndices);
    geometry.computeVertexNormals();

    // Determine consistent grid tangent-cross handedness from rest normals to prevent fold normal flipping.
    let normalSign = 1;
    if (cols > 2 && rows > 2) {
      const midR = Math.floor(rows / 2), midC = Math.floor(cols / 2);
      const idx = i => i * 3;
      const cL = rest.slice(idx(midR * cols + midC - 1), idx(midR * cols + midC - 1) + 3);
      const cR = rest.slice(idx(midR * cols + midC + 1), idx(midR * cols + midC + 1) + 3);
      const cU = rest.slice(idx((midR - 1) * cols + midC), idx((midR - 1) * cols + midC) + 3);
      const cD = rest.slice(idx((midR + 1) * cols + midC), idx((midR + 1) * cols + midC) + 3);
      const dX = [cR[0] - cL[0], cR[1] - cL[1], cR[2] - cL[2]];
      const dY = [cD[0] - cU[0], cD[1] - cU[1], cD[2] - cU[2]];
      const cx = dX[1] * dY[2] - dX[2] * dY[1];
      const cy = dX[2] * dY[0] - dX[0] * dY[2];
      const cz = dX[0] * dY[1] - dX[1] * dY[0];
      const rn = geometry.attributes.normal;
      const mi = midR * cols + midC;
      if (cx * rn.getX(mi) + cy * rn.getY(mi) + cz * rn.getZ(mi) < 0) normalSign = -1;
    }

    const fuzz = getFuzzNormalMap(T).clone();
    fuzz.repeat.set(fuzzRepeat, fuzzRepeat);
    fuzz.needsUpdate = true;

    const baseColor = new T.Color(color);
    const computedSheen = sheenColor
      ? new T.Color(sheenColor)
      : baseColor.clone().lerp(new T.Color("#fff6e8"), .36);
    const translucencyTint = baseColor.clone().lerp(new T.Color("#ff9d5c"), .35).multiplyScalar(1.15);

    const material = new T.MeshPhysicalMaterial({
      color: baseColor,
      vertexColors: true,
      side: T.DoubleSide,
      shadowSide: T.BackSide,
      roughness: .90,
      metalness: 0,
      sheen: .62,
      sheenColor: computedSheen,
      sheenRoughness: .66,
      normalMap: fuzz,
      normalScale: new T.Vector2(.38, .38)
    });
    material.name = name + "-woven-sheen-fuzz";
    material.customProgramCacheKey = () => "cloth-aaa-v3-" + (wrapX ? "wrap" : "open") + "-" + normalSign;

    const posUniform = { value: cpuPosTex };
    const texelUniform = { value: new T.Vector2(1 / cols, 1 / rows) };

    material.onBeforeCompile = shader => {
      shader.uniforms.uClothPos = posUniform;
      shader.uniforms.uClothRest = { value: restTex };
      shader.uniforms.uClothTexel = texelUniform;
      shader.uniforms.uTranslucencyTint = { value: translucencyTint };

      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", `#include <common>
          attribute vec2 clothUv;
          uniform sampler2D uClothPos;
          uniform sampler2D uClothRest;
          uniform vec2 uClothTexel;
          varying float vClothCompression;
          varying float vClothHemWeight;
          varying vec3 vClothWorldNormal;
        `)
        .replace("#include <beginnormal_vertex>", `
          vec2 uvR = clothUv + vec2(uClothTexel.x, 0.0);
          vec2 uvL = clothUv - vec2(uClothTexel.x, 0.0);
          vec2 uvD = clamp(clothUv + vec2(0.0, uClothTexel.y), vec2(0.0), vec2(1.0));
          vec2 uvU = clamp(clothUv - vec2(0.0, uClothTexel.y), vec2(0.0), vec2(1.0));
          ${wrapX ? "" : `
            uvR.x = min(1.0, uvR.x);
            uvL.x = max(0.0, uvL.x);
          `}
          vec3 cR = texture2D(uClothPos, uvR).xyz;
          vec3 cL = texture2D(uClothPos, uvL).xyz;
          vec3 cD = texture2D(uClothPos, uvD).xyz;
          vec3 cU = texture2D(uClothPos, uvU).xyz;
          vec3 dX = cR - cL;
          vec3 dY = cD - cU;
          vec3 objectNormal = normalize((${normalSign.toFixed(1)} * cross(dX, dY)) + normal * 1e-4 + vec3(0.0, 0.0, 1e-6));

          vec3 rR = texture2D(uClothRest, uvR).xyz;
          vec3 rL = texture2D(uClothRest, uvL).xyz;
          vec3 rD = texture2D(uClothRest, uvD).xyz;
          vec3 rU = texture2D(uClothRest, uvU).xyz;
          float restSpan = max(1e-4, length(rR - rL) + length(rD - rU));
          float curSpan = length(dX) + length(dY);
          vClothCompression = clamp((restSpan - curSpan) / (restSpan * 0.32), -0.5, 1.0);
          vClothHemWeight = clothUv.y;
          vClothWorldNormal = normalize(mat3(modelMatrix) * objectNormal);
        `)
        .replace("#include <begin_vertex>", `
          vec3 transformed = texture2D(uClothPos, clothUv).xyz;
        `);

      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", `#include <common>
          uniform vec3 uTranslucencyTint;
          varying float vClothCompression;
          varying float vClothHemWeight;
          varying vec3 vClothWorldNormal;
        `)
        .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
          float compMask = max(0.0, vClothCompression);
          roughnessFactor = clamp(roughnessFactor + compMask * 0.06 - (1.0 - compMask) * 0.03, 0.72, 0.98);
        `)
        .replace("#include <color_fragment>", `#include <color_fragment>
          float foldCavityAO = clamp(vClothCompression * 0.24, -0.04, 0.26);
          diffuseColor.rgb *= (1.0 - foldCavityAO);
        `)
        .replace("#include <opaque_fragment>", `
          // Linear-space grazing microfiber sheen & thin-fabric back-scatter before ACES tone-mapping
          vec3 cViewDir = normalize(vViewPosition);
          vec3 cFaceNormal = gl_FrontFacing ? normal : -normal;
          float cNDotV = clamp(dot(cFaceNormal, cViewDir), 0.0, 1.0);
          float grazingSheen = pow(1.0 - cNDotV, 3.6) * (0.14 + 0.08 * max(0.0, vClothCompression));
          outgoingLight += diffuseColor.rgb * grazingSheen;
          vec3 sunDir = normalize(vec3(0.38, 0.76, 0.52));
          float backLight = max(0.0, dot(-vClothWorldNormal, sunDir));
          float thinFactor = (0.35 + 0.65 * smoothstep(0.25, 0.95, vClothHemWeight)) * (1.0 - max(0.0, vClothCompression) * 0.65);
          outgoingLight += uTranslucencyTint * diffuseColor.rgb * pow(backLight, 2.2) * thinFactor * 0.14;
          #include <opaque_fragment>
        `);
    };

    const customDepthMaterial = new T.MeshDepthMaterial({
      depthPacking: T.RGBADepthPacking,
      side: T.BackSide
    });
    customDepthMaterial.customProgramCacheKey = () => "cloth-depth-v2";
    customDepthMaterial.onBeforeCompile = shader => {
      shader.uniforms.uClothPos = posUniform;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec2 clothUv;\nuniform sampler2D uClothPos;")
        .replace("#include <begin_vertex>", "vec3 transformed = texture2D(uClothPos, clothUv).xyz;");
    };

    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    mesh.customDepthMaterial = customDepthMaterial;
    mesh.frustumCulled = false;
    mesh.castShadow = true;
    // Closed shells (wrapX) receive shadows cleanly via BackSide depth; thin open sheets skip self-shadowing to stay acne-free.
    mesh.receiveShadow = Boolean(wrapX);

    // ---- 3A CPU Verlet / XPBD Solver with Structural, Shear, Bending & Long-Range Tether Constraints ----
    const pos = new Float32Array(rest), prev = new Float32Array(rest);
    const constraints = [];
    const tethers = [];

    const link = (a, b, complianceScale = 1.0) => {
      const dx = rest[a * 3] - rest[b * 3];
      const dy = rest[a * 3 + 1] - rest[b * 3 + 1];
      const dz = rest[a * 3 + 2] - rest[b * 3 + 2];
      constraints.push([a, b, Math.hypot(dx, dy, dz), complianceScale]);
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c;
        if (c < cols - 1) link(i, i + 1, 1.0);
        if (r < rows - 1) link(i, i + cols, 1.0);
        if (c < cols - 1 && r < rows - 1) {
          link(i, i + cols + 1, .76);
          link(i + 1, i + cols, .76);
        }
        if (c < cols - 2) link(i, i + 2, .46);
        if (r < rows - 2) link(i, i + 2 * cols, .46);
        if (wrapX && c === cols - 1) {
          link(i, r * cols, 1.0);
          if (r < rows - 1) {
            link(i, (r + 1) * cols, .76);
            link(r * cols, (r + 1) * cols + cols - 1, .76);
          }
          if (cols > 2) link(i, r * cols + 1, .46);
        }
        if (r > pinRow) {
          const pinIdx = pinRow * cols + c;
          const dx = rest[i * 3] - rest[pinIdx * 3];
          const dy = rest[i * 3 + 1] - rest[pinIdx * 3 + 1];
          const dz = rest[i * 3 + 2] - rest[pinIdx * 3 + 2];
          tethers.push([i, c, Math.hypot(dx, dy, dz) * 1.04]);
        }
      }
    }

    const SKIN_MARGIN = .0038;
    const COLLISION_FRICTION = .24;

    function collide(p, oldP, i, ctx) {
      const ix = i * 3;
      let px = p[ix], py = p[ix + 1], pz = p[ix + 2];

      for (const cap of ctx.capsules) {
        const ax = cap.a[0], ay = cap.a[1], az = cap.a[2];
        const bx = cap.b[0], by = cap.b[1], bz = cap.b[2];
        const abx = bx - ax, aby = by - ay, abz = bz - az;
        const apx = px - ax, apy = py - ay, apz = pz - az;
        const ab2 = abx * abx + aby * aby + abz * abz || 1;
        let t = (apx * abx + apy * aby + apz * abz) / ab2;
        t = Math.max(0, Math.min(1, t));
        const cx = ax + abx * t, cy = ay + aby * t, cz = az + abz * t;
        const dx = px - cx, dy = py - cy, dz = pz - cz;
        const d = Math.hypot(dx, dy, dz);
        const effR = cap.r + SKIN_MARGIN;

        if (d < effR && d > 1e-6) {
          const nx = dx / d, ny = dy / d, nz = dz / d;
          px = cx + nx * effR;
          py = cy + ny * effR;
          pz = cz + nz * effR;

          const vx = px - oldP[ix], vy = py - oldP[ix + 1], vz = pz - oldP[ix + 2];
          const vNorm = vx * nx + vy * ny + vz * nz;
          const vtx = vx - nx * vNorm, vty = vy - ny * vNorm, vtz = vz - nz * vNorm;
          oldP[ix] += vtx * COLLISION_FRICTION;
          oldP[ix + 1] += vty * COLLISION_FRICTION;
          oldP[ix + 2] += vtz * COLLISION_FRICTION;
        }
      }

      const groundLevel = ctx.groundY + SKIN_MARGIN;
      if (py < groundLevel) {
        py = groundLevel;
        oldP[ix] += (px - oldP[ix]) * .35;
        oldP[ix + 2] += (pz - oldP[ix + 2]) * .35;
      }

      p[ix] = px;
      p[ix + 1] = py;
      p[ix + 2] = pz;
    }

    function cpuStep(dt, ctx) {
      const dt2 = dt * dt, damp = .984;
      const frame = (ctx.restFrame || identityFrame).elements;
      const delta = frameDelta.elements;
      const simTime = ctx.time ?? 0;

      for (const points of [pos, prev]) {
        for (let i = 0; i < N; i++) {
          const ix = i * 3, x = points[ix], y = points[ix + 1], z = points[ix + 2];
          for (let a = 0; a < 3; a++) {
            points[ix + a] = delta[a] * x + delta[4 + a] * y + delta[8 + a] * z + delta[12 + a];
          }
        }
      }

      const wx = ctx.wind[0], wy = ctx.wind[1], wz = ctx.wind[2];
      const windMag = Math.hypot(wx, wy, wz);
      const gx = wx + ctx.inertia[0];
      const gy = -ctx.gravity + wy + ctx.inertia[1];
      const gz = wz + ctx.inertia[2];
      const baseShape = ctx.shape ?? 26;

      for (let i = 0; i < N; i++) {
        const ix = i * 3;
        if (invMass[i] === 0) {
          const c = i % cols;
          pos[ix] = prev[ix] = ctx.pinTargets[c * 3];
          pos[ix + 1] = prev[ix + 1] = ctx.pinTargets[c * 3 + 1];
          pos[ix + 2] = prev[ix + 2] = ctx.pinTargets[c * 3 + 2];
          continue;
        }

        const vNorm = rowFactor[i];
        const localShape = baseShape * (1.0 - .68 * Math.pow(vNorm, 1.35));

        const rx = rest[ix], ry = rest[ix + 1], rz = rest[ix + 2];
        const tx = frame[0] * rx + frame[4] * ry + frame[8] * rz + frame[12];
        const ty = frame[1] * rx + frame[5] * ry + frame[9] * rz + frame[13];
        const tz = frame[2] * rx + frame[6] * ry + frame[10] * rz + frame[14];

        const flutterPhase = simTime * 6.4 + rx * 19.0 - ry * 14.0 + rz * 17.0;
        const flutterAmp = (.18 + windMag * .55) * vNorm * vNorm;
        const radLen = Math.hypot(rx, rz) || 1;
        const flX = (rx / radLen) * Math.sin(flutterPhase) * flutterAmp;
        const flZ = (rz / radLen) * Math.cos(flutterPhase * .85 + 1.1) * flutterAmp;

        const curX = pos[ix], curY = pos[ix + 1], curZ = pos[ix + 2];
        const oldX = prev[ix], oldY = prev[ix + 1], oldZ = prev[ix + 2];

        const ax = gx + flX + (tx - curX) * localShape;
        const ay = gy + (ty - curY) * localShape;
        const az = gz + flZ + (tz - curZ) * localShape;

        let sx = (curX - oldX) * damp + ax * dt2;
        let sy = (curY - oldY) * damp + ay * dt2;
        let sz = (curZ - oldZ) * damp + az * dt2;

        const sLen = Math.hypot(sx, sy, sz);
        if (sLen > .022) {
          const scale = .022 / sLen;
          sx *= scale; sy *= scale; sz *= scale;
        }

        pos[ix] = curX + sx;
        pos[ix + 1] = curY + sy;
        pos[ix + 2] = curZ + sz;
        prev[ix] = curX;
        prev[ix + 1] = curY;
        prev[ix + 2] = curZ;
      }

      const stiff = ctx.stiffness ?? .82;
      for (let iter = 0; iter < 7; iter++) {
        for (let k = 0; k < constraints.length; k++) {
          const [a, b, restLen, compScale] = constraints[k];
          const wa = invMass[a], wb = invMass[b], wsum = wa + wb;
          if (!wsum) continue;
          const ai = a * 3, bi = b * 3;
          const dx = pos[bi] - pos[ai], dy = pos[bi + 1] - pos[ai + 1], dz = pos[bi + 2] - pos[ai + 2];
          const d = Math.hypot(dx, dy, dz) || 1;
          const diff = ((d - restLen) / d) * stiff * compScale;
          const fa = (wa / wsum) * diff, fb = (wb / wsum) * diff;
          pos[ai] += dx * fa; pos[ai + 1] += dy * fa; pos[ai + 2] += dz * fa;
          pos[bi] -= dx * fb; pos[bi + 1] -= dy * fb; pos[bi + 2] -= dz * fb;
        }

        if (iter % 2 === 0) {
          for (let t = 0; t < tethers.length; t++) {
            const [idx, pinCol, maxDist] = tethers[t];
            const ix = idx * 3, px = pinCol * 3;
            const dx = pos[ix] - ctx.pinTargets[px];
            const dy = pos[ix + 1] - ctx.pinTargets[px + 1];
            const dz = pos[ix + 2] - ctx.pinTargets[px + 2];
            const d = Math.hypot(dx, dy, dz);
            if (d > maxDist && d > 1e-6) {
              const s = maxDist / d;
              pos[ix] = ctx.pinTargets[px] + dx * s;
              pos[ix + 1] = ctx.pinTargets[px + 1] + dy * s;
              pos[ix + 2] = ctx.pinTargets[px + 2] + dz * s;
            }
          }
        }

        for (let i = 0; i < N; i++) {
          if (invMass[i] === 0) {
            const c = i % cols, ix = i * 3;
            pos[ix] = ctx.pinTargets[c * 3];
            pos[ix + 1] = ctx.pinTargets[c * 3 + 1];
            pos[ix + 2] = ctx.pinTargets[c * 3 + 2];
          } else {
            collide(pos, prev, i, ctx);
          }
        }
      }

      for (let i = 0; i < N; i++) {
        cpuPosData[i * 4] = pos[i * 3];
        cpuPosData[i * 4 + 1] = pos[i * 3 + 1];
        cpuPosData[i * 4 + 2] = pos[i * 3 + 2];
        cpuPosData[i * 4 + 3] = invMass[i];
      }
      cpuPosTex.needsUpdate = true;
      posUniform.value = cpuPosTex;
    }

    // ---- 3A GPU Compute (GPGPU) Solver ----
    let gpu = null;
    const pinV = ((pinRow + .5) / rows).toFixed(6);
    const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
    const INTEGRATE = `
      uniform sampler2D tCur, tPrev, tRest, tPin;
      uniform float uDt, uDamp, uGravity, uShape, uTime;
      uniform mat4 uRestFrame, uFrameDelta;
      uniform vec3 uWind, uInertia;
      varying vec2 vUv;
      void main(){
        vec4 cur = texture2D(tCur, vUv);
        vec4 prev = texture2D(tPrev, vUv);
        cur.xyz = (uFrameDelta * vec4(cur.xyz, 1.)).xyz;
        prev.xyz = (uFrameDelta * vec4(prev.xyz, 1.)).xyz;
        vec4 rest = texture2D(tRest, vUv);
        vec4 pin = texture2D(tPin, vUv);
        vec3 vel = (cur.xyz - prev.xyz) * uDamp;
        vec3 target = (uRestFrame * vec4(rest.xyz, 1.)).xyz;

        float vNorm = clamp(abs(vUv.y - ${pinV}), 0.0, 1.0);
        float localShape = uShape * (1.0 - 0.68 * pow(vNorm, 1.35));
        float flutterPhase = uTime * 6.4 + rest.x * 19.0 - rest.y * 14.0 + rest.z * 17.0;
        float flutterAmp = (0.18 + length(uWind) * 0.55) * vNorm * vNorm;
        vec2 radDir = normalize(rest.xz + vec2(1e-5));
        vec3 flutter = vec3(radDir.x * sin(flutterPhase), 0.0, radDir.y * cos(flutterPhase * 0.85 + 1.1)) * flutterAmp;

        vec3 accel = vec3(0., -uGravity, 0.) + uWind + uInertia + flutter + (target - cur.xyz) * localShape;
        vec3 step = vel + accel * uDt * uDt;
        float sl = length(step);
        if (sl > 0.022) step *= 0.022 / sl;
        vec3 next = cur.xyz + step;
        if (pin.w > .5) next = pin.xyz;
        gl_FragColor = vec4(next, rest.w);
      }`;

    const CONSTRAINT = `
      uniform sampler2D tPos, tRest, tPin;
      uniform vec2 uTexel;
      uniform float uStiff, uGroundY, uWrapX;
      uniform vec4 uCapA[${MAX_CAPSULES}], uCapB[${MAX_CAPSULES}];
      uniform int uCapCount;
      varying vec2 vUv;
      vec3 restAt(vec2 uv){ return texture2D(tRest, uv).xyz; }
      void addC(vec2 off, float weightScale, vec3 p, vec2 uv, float w, inout vec3 delta, inout float count){
        vec2 nuv = uv + off;
        if (nuv.y < 0. || nuv.y > 1.) return;
        if (uWrapX < .5 && (nuv.x < 0. || nuv.x > 1.)) return;
        vec4 n = texture2D(tPos, nuv);
        float restL = distance(restAt(uv), restAt(nuv));
        if (restL < 1e-5) return;
        vec3 d = n.xyz - p;
        float dist = length(d);
        if (dist < 1e-6) return;
        float wsum = w + n.w;
        if (wsum < 1e-6) return;
        delta += d * ((dist - restL) / dist) * (w / wsum) * weightScale;
        count += weightScale;
      }
      void main(){
        vec4 pos = texture2D(tPos, vUv);
        vec4 pin = texture2D(tPin, vUv);
        if (pin.w > .5) { gl_FragColor = vec4(pin.xyz, pos.w); return; }
        vec3 p = pos.xyz;
        vec3 delta = vec3(0.);
        float count = 0.;
        addC(vec2(uTexel.x, 0.), 1.0, p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, 0.), 1.0, p, vUv, pos.w, delta, count);
        addC(vec2(0., uTexel.y), 1.0, p, vUv, pos.w, delta, count);
        addC(vec2(0., -uTexel.y), 1.0, p, vUv, pos.w, delta, count);
        addC(vec2(uTexel.x, uTexel.y), 0.76, p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, uTexel.y), 0.76, p, vUv, pos.w, delta, count);
        addC(vec2(uTexel.x, -uTexel.y), 0.76, p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, -uTexel.y), 0.76, p, vUv, pos.w, delta, count);
        addC(vec2(2.*uTexel.x, 0.), 0.46, p, vUv, pos.w, delta, count);
        addC(vec2(-2.*uTexel.x, 0.), 0.46, p, vUv, pos.w, delta, count);
        addC(vec2(0., 2.*uTexel.y), 0.46, p, vUv, pos.w, delta, count);
        addC(vec2(0., -2.*uTexel.y), 0.46, p, vUv, pos.w, delta, count);

        vec3 corr = delta / max(count, 1.) * uStiff;
        float cl = length(corr);
        if (cl > 0.012) corr *= 0.012 / cl;
        p += corr;

        vec2 pinUv = vec2(vUv.x, ${pinV});
        vec3 pinPos = texture2D(tPin, pinUv).xyz;
        float maxTether = distance(restAt(vUv), restAt(pinUv)) * 1.04;
        vec3 tVec = p - pinPos;
        float tDist = length(tVec);
        if (tDist > maxTether && tDist > 1e-5) {
          p = pinPos + tVec * (maxTether / tDist);
        }

        for (int i = 0; i < ${MAX_CAPSULES}; i++) {
          if (i >= uCapCount) break;
          vec3 a = uCapA[i].xyz, b = uCapB[i].xyz;
          float r = uCapA[i].w + 0.0038;
          vec3 ab = b - a;
          vec3 ap = p - a;
          float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-6), 0., 1.);
          vec3 c = a + ab * t;
          vec3 d = p - c;
          float dist = length(d);
          if (dist < r && dist > 1e-6) p = c + d * (r / dist);
        }
        p.y = max(p.y, uGroundY + 0.0038);
        gl_FragColor = vec4(p, pos.w);
      }`;

    const COPY = `uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tSrc, vUv); }`;

    function initGPU(renderer) {
      const scene = new T.Scene();
      const camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const quad = new T.Mesh(new T.PlaneGeometry(2, 2));
      scene.add(quad);
      const mk = frag => new T.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, depthTest: false, depthWrite: false });
      const integrateMat = mk(INTEGRATE), constraintMat = mk(CONSTRAINT), copyMat = mk(COPY);
      const rt = () => {
        const target = new T.WebGLRenderTarget(cols, rows, {
          type: T.FloatType, format: T.RGBAFormat, minFilter: T.NearestFilter, magFilter: T.NearestFilter,
          depthBuffer: false, stencilBuffer: false
        });
        target.texture.wrapS = wrapX ? T.RepeatWrapping : T.ClampToEdgeWrapping;
        target.texture.wrapT = T.ClampToEdgeWrapping;
        return target;
      };
      const targets = [rt(), rt(), rt()];
      const capA = Array.from({ length: MAX_CAPSULES }, () => new T.Vector4());
      const capB = Array.from({ length: MAX_CAPSULES }, () => new T.Vector4());
      Object.assign(integrateMat.uniforms, {
        tCur: { value: null }, tPrev: { value: null }, tRest: { value: restTex }, tPin: { value: pinTex },
        uDt: { value: 1 / 60 }, uDamp: { value: .984 }, uGravity: { value: 9.8 }, uShape: { value: 26 }, uTime: { value: 0 },
        uWind: { value: new T.Vector3() }, uInertia: { value: new T.Vector3() },
        uRestFrame: { value: new T.Matrix4() }, uFrameDelta: { value: new T.Matrix4() }
      });
      Object.assign(constraintMat.uniforms, {
        tPos: { value: null }, tRest: { value: restTex }, tPin: { value: pinTex },
        uTexel: { value: new T.Vector2(1 / cols, 1 / rows) }, uStiff: { value: .82 }, uGroundY: { value: -10 }, uWrapX: { value: wrapX ? 1 : 0 },
        uCapA: { value: capA }, uCapB: { value: capB }, uCapCount: { value: 0 }
      });
      copyMat.uniforms.tSrc = { value: cpuPosTex };
      const blit = (mat, target) => {
        quad.material = mat;
        const old = renderer.getRenderTarget();
        renderer.setRenderTarget(target);
        renderer.render(scene, camera);
        renderer.setRenderTarget(old);
      };
      blit(copyMat, targets[0]);
      blit(copyMat, targets[1]);
      return { renderer, scene, camera, quad, integrateMat, constraintMat, copyMat, targets, cur: 0, prev: 1, free: 2, capA, capB };
    }

    function gpuStep(dt, ctx) {
      const g = gpu, r = g.renderer;
      const iu = g.integrateMat.uniforms, cu = g.constraintMat.uniforms;
      iu.tCur.value = g.targets[g.cur].texture;
      iu.tPrev.value = g.targets[g.prev].texture;
      iu.uDt.value = dt;
      iu.uGravity.value = ctx.gravity;
      iu.uShape.value = ctx.shape ?? 26;
      iu.uTime.value = ctx.time ?? 0;
      iu.uRestFrame.value.copy(ctx.restFrame || identityFrame);
      iu.uFrameDelta.value.copy(frameDelta);
      iu.uWind.value.set(ctx.wind[0], ctx.wind[1], ctx.wind[2]);
      iu.uInertia.value.set(ctx.inertia[0], ctx.inertia[1], ctx.inertia[2]);
      const blit = (mat, target) => {
        g.quad.material = mat;
        const old = r.getRenderTarget();
        r.setRenderTarget(target);
        r.render(g.scene, g.camera);
        r.setRenderTarget(old);
      };
      blit(g.integrateMat, g.targets[g.free]);
      let src = g.free, scratch = g.prev;
      cu.uStiff.value = ctx.stiffness ?? .82;
      cu.uGroundY.value = ctx.groundY;
      cu.uCapCount.value = Math.min(MAX_CAPSULES, ctx.capsules.length);
      for (let i = 0; i < MAX_CAPSULES; i++) {
        const cap = ctx.capsules[i];
        if (cap) {
          g.capA[i].set(cap.a[0], cap.a[1], cap.a[2], cap.r);
          g.capB[i].set(cap.b[0], cap.b[1], cap.b[2], 0);
        } else {
          g.capA[i].set(0, 0, 0, 0);
          g.capB[i].set(0, 0, 0, 0);
        }
      }
      const K = 7;
      for (let k = 0; k < K; k++) {
        const dst = (k % 2 === 0) ? scratch : g.free;
        cu.tPos.value = g.targets[src].texture;
        blit(g.constraintMat, g.targets[dst]);
        src = dst;
      }
      const newCur = src, newPrev = g.cur;
      const newFree = (src === g.free) ? scratch : g.free;
      g.cur = newCur;
      g.prev = newPrev;
      g.free = newFree;
      posUniform.value = g.targets[g.cur].texture;
    }

    let backend = null, clothRenderer = null;
    mesh.onBeforeRender = renderer => { clothRenderer = renderer; };

    function update(dt, ctx) {
      dt = Math.max(1 / 240, Math.min(1 / 30, dt));
      const currentFrame = ctx.restFrame || identityFrame;
      if (!hasPreviousFrame) {
        previousFrame.copy(currentFrame);
        frameDelta.identity();
        hasPreviousFrame = true;
      } else {
        frameDelta.copy(previousFrame).invert().premultiply(currentFrame);
      }

      for (let c = 0; c < cols; c++) {
        const o = (pinRow * cols + c) * 4;
        pinData[o] = ctx.pinTargets[c * 3];
        pinData[o + 1] = ctx.pinTargets[c * 3 + 1];
        pinData[o + 2] = ctx.pinTargets[c * 3 + 2];
      }
      pinTex.needsUpdate = true;

      if (backend === null) {
        const r = ctx.renderer || clothRenderer;
        if (r) {
          const ok = r.capabilities.isWebGL2 && r.extensions.get("EXT_color_buffer_float") && r.capabilities.maxVertexTextures > 0;
          backend = (ok && opts.backend !== "cpu") ? "gpu" : "cpu";
          if (backend === "gpu") {
            try { gpu = initGPU(r); } catch (e) { backend = "cpu"; gpu = null; }
          }
        }
      }
      if (backend === "gpu" && gpu) {
        if (ctx.renderer) gpu.renderer = ctx.renderer;
        gpuStep(dt, ctx);
      } else {
        cpuStep(dt, ctx);
      }
      previousFrame.copy(currentFrame);
    }

    for (let i = 0; i < N; i++) {
      cpuPosData[i * 4] = rest[i * 3];
      cpuPosData[i * 4 + 1] = rest[i * 3 + 1];
      cpuPosData[i * 4 + 2] = rest[i * 3 + 2];
      cpuPosData[i * 4 + 3] = invMass[i];
    }
    cpuPosTex.needsUpdate = true;

    return {
      mesh,
      material,
      update,
      get backend() { return backend; },
      positions: pos,
      rest,
      dispose() {
        geometry.dispose();
        material.dispose();
        customDepthMaterial.dispose();
        fuzz.dispose();
        restTex.dispose();
        pinTex.dispose();
        cpuPosTex.dispose();
        if (gpu) {
          gpu.targets.forEach(t => t.dispose());
          gpu.integrateMat.dispose();
          gpu.constraintMat.dispose();
          gpu.copyMat.dispose();
          gpu.quad.geometry.dispose();
        }
      }
    };
  }

  globalThis.CharacterCloth = { create };
})();
