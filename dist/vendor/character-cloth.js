(() => {
  "use strict";

  // Independent garment layers simulated with position-based Verlet / XPBD.
  // Primary path is GPU compute (GPGPU ping-pong float targets, Jacobi distance
  // constraints); a CPU Verlet solver with Gauss-Seidel relaxation is the
  // graceful fallback. Both feed a single position texture that the garment's
  // vertex shader samples, so rendering is identical across backends.
  const MAX_CAPSULES = 6;

  function create(T, opts) {
    const {
      cols, rows, rest, weaveUv, tones, indices,
      pinRow = 0, color, sheenColor, name = "cloth-layer", fuzzRepeat = 7, wrapX = false
    } = opts;
    const N = cols * rows;
    const identityFrame = new T.Matrix4();
    const previousFrame = new T.Matrix4(), frameDelta = new T.Matrix4();
    const invMass = new Float32Array(N);
    const restData = new Float32Array(N * 4);
    const clothUv = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const row = Math.floor(i / cols), col = i % cols;
      invMass[i] = row === pinRow ? 0 : 1;
      restData[i * 4] = rest[i * 3]; restData[i * 4 + 1] = rest[i * 3 + 1]; restData[i * 4 + 2] = rest[i * 3 + 2];
      restData[i * 4 + 3] = invMass[i];
      clothUv[i * 2] = (col + .5) / cols; clothUv[i * 2 + 1] = (row + .5) / rows;
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

    const fuzz = CharacterDetail.maps(T).fuzzNormal.clone();
    fuzz.repeat.set(fuzzRepeat, fuzzRepeat); fuzz.needsUpdate = true;
    const material = new T.MeshPhysicalMaterial({
      color, vertexColors: true, side: T.DoubleSide, roughness: .92, metalness: 0,
      sheen: .55, sheenColor: sheenColor || new T.Color(color).lerp(new T.Color("#ffffff"), .3), sheenRoughness: .62,
      normalMap: fuzz, normalScale: new T.Vector2(.35, .35)
    });
    material.name = name + "-woven-sheen-fuzz";
    material.customProgramCacheKey = () => "cloth-aaa-v1";
    const posUniform = { value: cpuPosTex };
    material.onBeforeCompile = shader => {
      shader.uniforms.uClothPos = posUniform;
      shader.uniforms.uClothTexel = { value: new T.Vector2(1 / cols, 1 / rows) };
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute vec2 clothUv;\nuniform sampler2D uClothPos;\nuniform vec2 uClothTexel;")
        .replace("#include <beginnormal_vertex>", `
          vec3 cR = texture2D(uClothPos, clothUv + vec2(uClothTexel.x, 0.)).xyz;
          vec3 cL = texture2D(uClothPos, clothUv - vec2(uClothTexel.x, 0.)).xyz;
          vec3 cD = texture2D(uClothPos, clothUv + vec2(0., uClothTexel.y)).xyz;
          vec3 cU = texture2D(uClothPos, clothUv - vec2(0., uClothTexel.y)).xyz;
          vec3 objectNormal = normalize(cross(cR - cL, cD - cU) + vec3(0., 0., 1e-6));
          if (dot(objectNormal, normal) < 0.0) objectNormal = -objectNormal;
        `)
        .replace("#include <begin_vertex>", "vec3 transformed = texture2D(uClothPos, clothUv).xyz;");
    };

    const geometry = new T.BufferGeometry();
    geometry.setAttribute("position", new T.Float32BufferAttribute(rest.slice(), 3));
    geometry.setAttribute("uv", new T.Float32BufferAttribute(weaveUv, 2));
    geometry.setAttribute("color", new T.Float32BufferAttribute(tones, 3));
    geometry.setAttribute("clothUv", new T.BufferAttribute(clothUv, 2));
    const finalIndices = indices.slice();
    if (wrapX) for (let r = 1; r < rows; r++) {
      const a = r * cols, b = a - cols, ap = r * cols + cols - 1, bp = (r - 1) * cols + cols - 1;
      finalIndices.push(a, b, ap, ap, b, bp);
    }
    geometry.setIndex(finalIndices);
    geometry.computeVertexNormals();
    const mesh = new T.Mesh(geometry, material);
    mesh.name = name;
    mesh.frustumCulled = false;
    mesh.castShadow = false; mesh.receiveShadow = false;

    // ---- CPU Verlet / XPBD fallback ----
    const pos = new Float32Array(rest), prev = new Float32Array(rest);
    const constraints = [];
    const link = (a, b) => {
      const dx = rest[a * 3] - rest[b * 3], dy = rest[a * 3 + 1] - rest[b * 3 + 1], dz = rest[a * 3 + 2] - rest[b * 3 + 2];
      constraints.push([a, b, Math.hypot(dx, dy, dz)]);
    };
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      if (c < cols - 1) link(i, i + 1);
      if (r < rows - 1) link(i, i + cols);
      if (c < cols - 1 && r < rows - 1) { link(i, i + cols + 1); link(i + 1, i + cols); }
      if (c < cols - 2) link(i, i + 2);
      if (r < rows - 2) link(i, i + 2 * cols);
      if (wrapX && c === cols - 1) {
        link(i, r * cols);
        if (r < rows - 1) { link(i, (r + 1) * cols); link(r * cols, (r + 1) * cols + cols - 1); }
      }
    }
    function collide(p, i, ctx) {
      const ix = i * 3;
      for (const cap of ctx.capsules) {
        const ax = cap.a[0], ay = cap.a[1], az = cap.a[2], bx = cap.b[0], by = cap.b[1], bz = cap.b[2];
        const abx = bx - ax, aby = by - ay, abz = bz - az;
        const apx = p[ix] - ax, apy = p[ix + 1] - ay, apz = p[ix + 2] - az;
        const ab2 = abx * abx + aby * aby + abz * abz || 1;
        let t = (apx * abx + apy * aby + apz * abz) / ab2; t = Math.max(0, Math.min(1, t));
        const cx = ax + abx * t, cy = ay + aby * t, cz = az + abz * t;
        let dx = p[ix] - cx, dy = p[ix + 1] - cy, dz = p[ix + 2] - cz;
        const d = Math.hypot(dx, dy, dz);
        if (d < cap.r && d > 1e-6) { const s = cap.r / d; p[ix] = cx + dx * s; p[ix + 1] = cy + dy * s; p[ix + 2] = cz + dz * s; }
      }
      if (p[ix + 1] < ctx.groundY) p[ix + 1] = ctx.groundY;
    }
    function cpuStep(dt, ctx) {
      const dt2 = dt * dt, damp = .985;
      const frame = (ctx.restFrame || identityFrame).elements;
      const delta = frameDelta.elements;
      // Carry the simulated sheet with its attachment frame before solving
      // relative motion. Otherwise lowering a seated pelvis drags a standing
      // sheet through the torso, where it can remain caught on the shoulders.
      for (const points of [pos, prev]) for (let i = 0; i < N; i++) {
        const ix = i * 3, x = points[ix], y = points[ix + 1], z = points[ix + 2];
        for (let a = 0; a < 3; a++) points[ix + a] = delta[a] * x + delta[4 + a] * y + delta[8 + a] * z + delta[12 + a];
      }
      const gx = ctx.wind[0] + ctx.inertia[0], gy = -ctx.gravity + ctx.wind[1] + ctx.inertia[1], gz = ctx.wind[2] + ctx.inertia[2];
      for (let i = 0; i < N; i++) {
        const ix = i * 3;
        if (invMass[i] === 0) {
          const c = i % cols;
          pos[ix] = prev[ix] = ctx.pinTargets[c * 3];
          pos[ix + 1] = prev[ix + 1] = ctx.pinTargets[c * 3 + 1];
          pos[ix + 2] = prev[ix + 2] = ctx.pinTargets[c * 3 + 2];
          continue;
        }
        const rx = rest[ix], ry = rest[ix + 1], rz = rest[ix + 2];
        for (let a = 0; a < 3; a++) {
          const cur = pos[ix + a], old = prev[ix + a];
          const g = a === 0 ? gx : a === 1 ? gy : gz;
          const target = frame[a] * rx + frame[4 + a] * ry + frame[8 + a] * rz + frame[12 + a];
          const accel = g + (target - cur) * (ctx.shape ?? 26);
          let step = (cur - old) * damp + accel * dt2;
          step = Math.max(-.02, Math.min(.02, step));
          pos[ix + a] = cur + step;
          prev[ix + a] = cur;
        }
      }
      const stiff = ctx.stiffness ?? .8;
      for (let iter = 0; iter < 6; iter++) {
        for (const [a, b, restLen] of constraints) {
          const wa = invMass[a], wb = invMass[b], wsum = wa + wb;
          if (!wsum) continue;
          const ai = a * 3, bi = b * 3;
          const dx = pos[bi] - pos[ai], dy = pos[bi + 1] - pos[ai + 1], dz = pos[bi + 2] - pos[ai + 2];
          const d = Math.hypot(dx, dy, dz) || 1;
          const diff = (d - restLen) / d * stiff;
          const fa = wa / wsum * diff, fb = wb / wsum * diff;
          pos[ai] += dx * fa; pos[ai + 1] += dy * fa; pos[ai + 2] += dz * fa;
          pos[bi] -= dx * fb; pos[bi + 1] -= dy * fb; pos[bi + 2] -= dz * fb;
        }
        for (let i = 0; i < N; i++) {
          if (invMass[i] === 0) {
            const c = i % cols, ix = i * 3;
            pos[ix] = ctx.pinTargets[c * 3]; pos[ix + 1] = ctx.pinTargets[c * 3 + 1]; pos[ix + 2] = ctx.pinTargets[c * 3 + 2];
          } else collide(pos, i, ctx);
        }
      }
      for (let i = 0; i < N; i++) {
        cpuPosData[i * 4] = pos[i * 3]; cpuPosData[i * 4 + 1] = pos[i * 3 + 1]; cpuPosData[i * 4 + 2] = pos[i * 3 + 2]; cpuPosData[i * 4 + 3] = invMass[i];
      }
      cpuPosTex.needsUpdate = true;
      posUniform.value = cpuPosTex;
    }

    // ---- GPU compute (GPGPU) ----
    let gpu = null;
    const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
    const INTEGRATE = `
      uniform sampler2D tCur, tPrev, tRest, tPin;
      uniform float uDt, uDamp, uGravity, uShape;
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
        vec3 accel = vec3(0., -uGravity, 0.) + uWind + uInertia + (target - cur.xyz) * uShape;
        vec3 step = vel + accel * uDt * uDt;
        float sl = length(step); if (sl > 0.02) step *= 0.02 / sl;
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
      void addC(vec2 off, vec3 p, vec2 uv, float w, inout vec3 delta, inout float count){
        vec2 nuv = uv + off;
        if (nuv.y < 0. || nuv.y > 1.) return;
        if (uWrapX < .5 && (nuv.x < 0. || nuv.x > 1.)) return;
        vec4 n = texture2D(tPos, nuv);
        float restL = distance(restAt(uv), restAt(nuv));
        if (restL < 1e-5) return;
        vec3 d = n.xyz - p; float dist = length(d);
        if (dist < 1e-6) return;
        float wsum = w + n.w; if (wsum < 1e-6) return;
        delta += d * ((dist - restL) / dist) * (w / wsum);
        count += 1.;
      }
      void main(){
        vec4 pos = texture2D(tPos, vUv);
        vec4 pin = texture2D(tPin, vUv);
        if (pin.w > .5) { gl_FragColor = vec4(pin.xyz, pos.w); return; }
        vec3 p = pos.xyz;
        vec3 delta = vec3(0.); float count = 0.;
        addC(vec2(uTexel.x, 0.), p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, 0.), p, vUv, pos.w, delta, count);
        addC(vec2(0., uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(0., -uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(uTexel.x, uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(uTexel.x, -uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(-uTexel.x, -uTexel.y), p, vUv, pos.w, delta, count);
        addC(vec2(2.*uTexel.x, 0.), p, vUv, pos.w, delta, count);
        addC(vec2(0., 2.*uTexel.y), p, vUv, pos.w, delta, count);
        vec3 corr = delta / max(count, 1.) * uStiff;
        float cl = length(corr); if (cl > 0.01) corr *= 0.01 / cl;
        p += corr;
        for (int i = 0; i < ${MAX_CAPSULES}; i++) {
          if (i >= uCapCount) break;
          vec3 a = uCapA[i].xyz, b = uCapB[i].xyz; float r = uCapA[i].w;
          vec3 ab = b - a; vec3 ap = p - a;
          float t = clamp(dot(ap, ab) / max(dot(ab, ab), 1e-6), 0., 1.);
          vec3 c = a + ab * t; vec3 d = p - c; float dist = length(d);
          if (dist < r && dist > 1e-6) p = c + d * (r / dist);
        }
        p.y = max(p.y, uGroundY);
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
        uDt: { value: 1 / 60 }, uDamp: { value: .985 }, uGravity: { value: 9.8 }, uShape: { value: 26 },
        uWind: { value: new T.Vector3() }, uInertia: { value: new T.Vector3() }, uRestFrame: { value: new T.Matrix4() }, uFrameDelta: { value: new T.Matrix4() }
      });
      Object.assign(constraintMat.uniforms, {
        tPos: { value: null }, tRest: { value: restTex }, tPin: { value: pinTex },
        uTexel: { value: new T.Vector2(1 / cols, 1 / rows) }, uStiff: { value: .8 }, uGroundY: { value: -10 }, uWrapX: { value: wrapX ? 1 : 0 },
        uCapA: { value: capA }, uCapB: { value: capB }, uCapCount: { value: 0 }
      });
      copyMat.uniforms.tSrc = { value: cpuPosTex };
      const blit = (mat, target) => {
        quad.material = mat;
        const old = renderer.getRenderTarget();
        renderer.setRenderTarget(target); renderer.render(scene, camera); renderer.setRenderTarget(old);
      };
      blit(copyMat, targets[0]); blit(copyMat, targets[1]);
      return { renderer, scene, camera, quad, integrateMat, constraintMat, targets, cur: 0, prev: 1, free: 2, capA, capB };
    }
    function gpuStep(dt, ctx) {
      const g = gpu, r = g.renderer;
      const iu = g.integrateMat.uniforms, cu = g.constraintMat.uniforms;
      iu.tCur.value = g.targets[g.cur].texture; iu.tPrev.value = g.targets[g.prev].texture;
      iu.uDt.value = dt; iu.uGravity.value = ctx.gravity; iu.uShape.value = ctx.shape ?? 26;
      iu.uRestFrame.value.copy(ctx.restFrame || identityFrame);
      iu.uFrameDelta.value.copy(frameDelta);
      iu.uWind.value.set(ctx.wind[0], ctx.wind[1], ctx.wind[2]);
      iu.uInertia.value.set(ctx.inertia[0], ctx.inertia[1], ctx.inertia[2]);
      const blit = (mat, target) => {
        g.quad.material = mat;
        const old = r.getRenderTarget();
        r.setRenderTarget(target); r.render(g.scene, g.camera); r.setRenderTarget(old);
      };
      blit(g.integrateMat, g.targets[g.free]);
      let src = g.free, scratch = g.prev;
      cu.uStiff.value = ctx.stiffness ?? .8; cu.uGroundY.value = ctx.groundY;
      cu.uCapCount.value = Math.min(MAX_CAPSULES, ctx.capsules.length);
      for (let i = 0; i < MAX_CAPSULES; i++) {
        const cap = ctx.capsules[i];
        if (cap) { g.capA[i].set(cap.a[0], cap.a[1], cap.a[2], cap.r); g.capB[i].set(cap.b[0], cap.b[1], cap.b[2], 0); }
        else { g.capA[i].set(0, 0, 0, 0); g.capB[i].set(0, 0, 0, 0); }
      }
      const K = 6;
      for (let k = 0; k < K; k++) {
        const dst = (k % 2 === 0) ? scratch : g.free;
        cu.tPos.value = g.targets[src].texture;
        blit(g.constraintMat, g.targets[dst]);
        src = dst;
      }
      const newCur = src, newPrev = g.cur;
      const newFree = (src === g.free) ? scratch : g.free;
      g.cur = newCur; g.prev = newPrev; g.free = newFree;
      posUniform.value = g.targets[g.cur].texture;
    }

    let backend = null, clothRenderer = null;
    mesh.onBeforeRender = renderer => { clothRenderer = renderer; };
    function update(dt, ctx) {
      dt = Math.max(1 / 240, Math.min(1 / 30, dt));
      const currentFrame = ctx.restFrame || identityFrame;
      frameDelta.copy(previousFrame).invert().premultiply(currentFrame);
      for (let c = 0; c < cols; c++) {
        const o = (pinRow * cols + c) * 4;
        pinData[o] = ctx.pinTargets[c * 3]; pinData[o + 1] = ctx.pinTargets[c * 3 + 1]; pinData[o + 2] = ctx.pinTargets[c * 3 + 2];
      }
      pinTex.needsUpdate = true;
      if (backend === null) {
        const r = ctx.renderer || clothRenderer;
        if (r) {
          const ok = r.capabilities.isWebGL2 && r.extensions.get("EXT_color_buffer_float") && r.capabilities.maxVertexTextures > 0;
          backend = (ok && opts.backend !== "cpu") ? "gpu" : "cpu";
          if (backend === "gpu") { try { gpu = initGPU(r); } catch (e) { backend = "cpu"; gpu = null; } }
        }
      }
      if (backend === "gpu" && gpu) {
        if (ctx.renderer) gpu.renderer = ctx.renderer;
        gpuStep(dt, ctx);
      } else cpuStep(dt, ctx);
      previousFrame.copy(currentFrame);
    }
    // Seed the CPU texture so the first frame (before any update) is not empty.
    for (let i = 0; i < N; i++) { cpuPosData[i * 4] = rest[i * 3]; cpuPosData[i * 4 + 1] = rest[i * 3 + 1]; cpuPosData[i * 4 + 2] = rest[i * 3 + 2]; cpuPosData[i * 4 + 3] = invMass[i]; }
    cpuPosTex.needsUpdate = true;

    return {
      mesh, material, update,
      get backend() { return backend; },
      positions: pos, rest,
      dispose() {
        geometry.dispose(); material.dispose(); fuzz.dispose();
        restTex.dispose(); pinTex.dispose(); cpuPosTex.dispose();
        if (gpu) { gpu.targets.forEach(t => t.dispose()); gpu.integrateMat.dispose(); gpu.constraintMat.dispose(); gpu.quad.geometry.dispose(); }
      }
    };
  }

  globalThis.CharacterCloth = { create };
})();
