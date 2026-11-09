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

  function geometry(T, positions, indices, colors = null) {
    const result = new T.BufferGeometry();
    result.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
    result.setIndex(Array.isArray(indices) ? indices : new T.BufferAttribute(indices, 1));
    if (colors) result.setAttribute("color", new T.Float32BufferAttribute(colors, 3));
    result.computeVertexNormals();
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

  const textileCache = new WeakMap();
  function textile(T, kind) {
    if (!textileCache.has(T)) textileCache.set(T, new Map());
    const cache = textileCache.get(T);
    if (cache.has(kind)) return cache.get(kind);
    const size = 256;
    const height = new Float32Array(size * size);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const idx = y * size + x;
      if (kind === "linen") {
        const u = x * Math.PI / 2, v = y * Math.PI / 2;
        const warp = Math.cos(u) * Math.sin(v) * .42;
        const slub = Math.sin(x * 12.9898 + y * 78.233) * .12;
        const micro = Math.sin(x * 37.1 + y * 53.7) * .06;
        height[idx] = warp + slub + micro;
      } else if (kind === "wool") {
        const twill = Math.cos((x + y) * Math.PI / 3) * Math.sin((x - y) * Math.PI / 3) * .55;
        const fuzz = Math.sin(x * 23.4 + y * 45.6) * .22 + Math.sin(x * 67.8 - y * 89.1) * .11;
        height[idx] = twill + fuzz;
      } else if (kind === "haircloth") {
        const coarse = Math.sin(x * Math.PI / 5) * .65;
        const brist = Math.sin(x * 31.2 + y * 17.8) * .35 + Math.sin(y * 43.1) * .25;
        height[idx] = coarse + brist;
      } else {
        const cell = Math.sin(x * .25) * Math.cos(y * .25);
        const grain = Math.sin(x * 15.3 + y * 28.7) * .35 + Math.sin(x * 47.1 + y * 63.9) * .15;
        height[idx] = cell * .45 + grain;
      }
    }
    const pixels = new Uint8Array(size * size * 4);
    const scale = kind === "haircloth" ? 2.4 : kind === "wool" ? 1.8 : kind === "leather" ? 1.4 : 1.2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4;
      const xPrev = (x - 1 + size) % size, xNext = (x + 1) % size;
      const yPrev = (y - 1 + size) % size, yNext = (y + 1) % size;
      const dx = (height[y * size + xNext] - height[y * size + xPrev]) * scale;
      const dy = (height[yNext * size + x] - height[yPrev * size + x]) * scale;
      const len = Math.hypot(dx, dy, 1.0);
      pixels[p] = Math.round(((-dx / len) * .5 + .5) * 255);
      pixels[p + 1] = Math.round(((-dy / len) * .5 + .5) * 255);
      pixels[p + 2] = Math.round(((1.0 / len) * .5 + .5) * 255);
      pixels[p + 3] = 255;
    }
    const normal = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    normal.wrapS = normal.wrapT = T.RepeatWrapping;
    normal.magFilter = T.LinearFilter;
    normal.minFilter = T.LinearMipmapLinearFilter;
    normal.generateMipmaps = true;
    normal.repeat.set(kind === "leather" ? 12 : 24, kind === "leather" ? 12 : 18);
    normal.needsUpdate = true;
    cache.set(kind, normal);
    return normal;
  }

  const textileRoughCache = new WeakMap();
  // Per-weave roughness: linen is matte and slightly uneven, wool is fuzzier
  // still, leather keeps a low sheen where the grain runs.
  function textileRoughness(T, kind) {
    if (!textileRoughCache.has(T)) textileRoughCache.set(T, new Map());
    const cache = textileRoughCache.get(T);
    if (cache.has(kind)) return cache.get(kind);
    const size = 128;
    const pixels = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4;
      let value;
      if (kind === "linen") {
        const warp = Math.cos(x * Math.PI / 2) * Math.sin(y * Math.PI / 2) * .05;
        const slub = Math.sin(x * 12.9898 + y * 78.233) * .05;
        value = .93 + warp + slub;
      } else if (kind === "wool") {
        const fibre = Math.sin(x * 23.4 + y * 45.6) * .03 + Math.sin(x * 67.8 - y * 89.1) * .02;
        value = .96 + fibre;
      } else if (kind === "haircloth") {
        value = .93 + Math.sin(x * 31.2 + y * 17.8) * .04 + Math.sin(y * 43.1) * .03;
      } else {
        value = .82 + Math.sin(x * .25) * Math.cos(y * .25) * .05 + Math.sin(x * 15.3 + y * 28.7) * .035;
      }
      const level = Math.round(Math.max(0, Math.min(1, value)) * 255);
      pixels[p] = level; pixels[p + 1] = level; pixels[p + 2] = level; pixels[p + 3] = 255;
    }
    const texture = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    texture.wrapS = texture.wrapT = T.RepeatWrapping;
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.repeat.set(kind === "leather" ? 12 : 24, kind === "leather" ? 12 : 18);
    texture.needsUpdate = true;
    cache.set(kind, texture);
    return texture;
  }

  const scleraCache = new WeakMap();
  function scleraTexture(T) {
    if (!scleraCache.has(T)) scleraCache.set(T, null);
    const cached = scleraCache.get(T);
    if (cached) return cached;
    const size = 128;
    const pixels = new Uint8Array(size * size * 4);
    const half = size / 2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4;
      const dx = (x - half) / half, dy = (y - half) / half;
      const r = Math.hypot(dx, dy);
      let red = 238, green = 234, blue = 227;
      const rim = Math.min(1.0, Math.max(0.0, (r - .45) / .55));
      red -= Math.round(rim * 38);
      green -= Math.round(rim * 42);
      blue -= Math.round(rim * 46);
      const horizontalDist = Math.abs(dx);
      if (horizontalDist > .25) {
        const veinAngle = Math.atan2(dy, dx);
        const veinNoise = Math.sin(veinAngle * 28.0 + r * 35.0) * Math.cos(r * 50.0);
        const veinSharp = Math.pow(Math.max(0.0, veinNoise), 8.0);
        const veinMask = Math.min(1.0, (horizontalDist - .25) / .55) * veinSharp;
        red = Math.round(red * (1.0 - veinMask * .65) + 185 * (veinMask * .65));
        green = Math.round(green * (1.0 - veinMask * .75) + 52 * (veinMask * .75));
        blue = Math.round(blue * (1.0 - veinMask * .75) + 45 * (veinMask * .75));
      }
      pixels[p] = red;
      pixels[p + 1] = green;
      pixels[p + 2] = blue;
      pixels[p + 3] = 255;
    }
    const texture = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    scleraCache.set(T, texture);
    return texture;
  }

  const eyeTextureCache = new WeakMap();
  function irisTexture(T, hairColorHex) {
    if (!eyeTextureCache.has(T)) eyeTextureCache.set(T, new Map());
    const cache = eyeTextureCache.get(T);
    const key = hairColorHex || "#423124";
    if (cache.has(key)) return cache.get(key);
    const size = 128;
    const pixels = new Uint8Array(size * size * 4);
    const baseColor = new T.Color(key).multiplyScalar(1.25);
    const stromaColor = baseColor.clone().lerp(new T.Color("#825a36"), .45);
    const limbalColor = new T.Color("#140d08");
    const pupilColor = new T.Color("#060504");
    const half = size / 2;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const p = (y * size + x) * 4;
      const dx = (x - half) / half, dy = (y - half) / half;
      const r = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      if (r > 1.0) {
        pixels[p] = 210; pixels[p + 1] = 205; pixels[p + 2] = 196; pixels[p + 3] = 0;
        continue;
      }
      let c;
      if (r < .28) {
        c = pupilColor;
      } else {
        const fiber = Math.sin(angle * 32.0) * .12 + Math.sin(angle * 64.0) * .06 + Math.cos(angle * 16.0) * .08;
        const collarette = Math.exp(-(((r - .52) / .12) ** 2)) * .20;
        const t = (r - .28) / .72;
        c = stromaColor.clone().lerp(baseColor, t).multiplyScalar(1.0 + fiber + collarette);
        if (r > .82) {
          const limbalBlend = (r - .82) / .18;
          c.lerp(limbalColor, limbalBlend);
        }
      }
      pixels[p] = Math.round(Math.min(255, Math.max(0, c.r * 255)));
      pixels[p + 1] = Math.round(Math.min(255, Math.max(0, c.g * 255)));
      pixels[p + 2] = Math.round(Math.min(255, Math.max(0, c.b * 255)));
      pixels[p + 3] = 255;
    }
    const texture = new T.DataTexture(pixels, size, size, T.RGBAFormat);
    texture.magFilter = T.LinearFilter;
    texture.minFilter = T.LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
    cache.set(key, texture);
    return texture;
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
      addMorph(positions, morph, amount);
      for (const [name, delta] of Object.entries(morph.landmarks)) {
        for (let axis = 0; axis < 3; axis++) landmarks[name][axis] += delta[axis] * amount;
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

    const skinColor = new T.Color(palette[3]);
    const lips = skinColor.clone().lerp(new T.Color("#8e4b42"), .55);
    const cheek = skinColor.clone().lerp(new T.Color("#aa5e48"), .32);
    const foreheadTone = skinColor.clone().lerp(new T.Color("#d5aa78"), .22);
    const earTone = skinColor.clone().lerp(new T.Color("#b84c38"), .48);
    const noseTone = skinColor.clone().lerp(new T.Color("#ac5543"), .36);
    const eyeSocketTone = skinColor.clone().lerp(new T.Color("#64453b"), .38);
    const chinShadow = skinColor.clone().lerp(female ? new T.Color("#7e6858") : new T.Color("#564f48"), aged ? .28 : .16);
    const colors = new Float32Array(positions.length);
    const eye = landmarks["joint-l-eye"];
    const neckJoint = template.joints[jointIndex("neck_01")];
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
    const noseHighlight = skinColor.clone().lerp(new T.Color("#e2b78c"), .30);
    const cheekHighlight = skinColor.clone().lerp(new T.Color("#d9a97e"), .22);
    const beardShadow = skinColor.clone().lerp(new T.Color("#4a3a30"), .42);
    for (let index = 0; index < source.vertexCount; index++) {
      const offset = index * 3;
      const x = positions[offset], y = positions[offset + 1], z = positions[offset + 2];
      const lipDistance = ((x - mouth[0]) / .029) ** 2 + ((y - mouth[1]) / .004) ** 2 + ((z - mouth[2]) / .025) ** 2;
      const cheekDistance = ((Math.abs(x) - .055) / .043) ** 2 + ((y - eye[1] + .035) / .05) ** 2;
      const noseBridge = (x / .013) ** 2 + ((y - eye[1] + .006) / .030) ** 2;
      const noseTip = (x / .017) ** 2 + ((y - eye[1] + .034) / .016) ** 2;
      const nostril = ((Math.abs(x) - .0165) / .0060) ** 2 + ((y - eye[1] + .0435) / .0050) ** 2;
      const cheekBone = ((Math.abs(x) - .050) / .019) ** 2 + ((y - eye[1] + .020) / .019) ** 2;
      const jawLine = ((Math.abs(x) - .066) / .024) ** 2 + ((y - mouth[1] + .050) / .028) ** 2;
      const nasolabial = ((Math.abs(x) - .028) / .0095) ** 2 + ((y - mouth[1] + .020) / .020) ** 2;
      const philtrum = (x / .0055) ** 2 + ((y - mouth[1] + .014) / .0095) ** 2;
      const noseWall = (x / .026) ** 2 + ((y - eye[1] + .022) / .030) ** 2;
      const browShadow = ((Math.abs(x) - Math.abs(eye[0])) / .020) ** 2 + ((y - eye[1] - .017) / .009) ** 2;
      let color = skinColor.clone();
      if (y > neckJoint[1] - .02) {
        if (y > eye[1] + .025) {
          const fWeight = Math.min(1.0, Math.exp(-((x / .055) ** 2 + ((y - eye[1] - .045) / .04) ** 2)));
          color.lerp(foreheadTone, fWeight * .7);
        } else if (y < eye[1] - .05) {
          color.lerp(chinShadow, .45);
        }
        if (Math.abs(x) > .072 && y > eye[1] - .045 && y < eye[1] + .045 && z < .02) {
          color.lerp(earTone, .65);
        }
        if (Math.abs(x) < .022 && Math.abs(y - eye[1] + .018) < .028 && z > .075) {
          color.lerp(noseTone, .50);
        }
        // Nose structure: lit bridge and tip, shadowed nostril wings and side walls.
        color.lerp(noseHighlight, Math.exp(-noseBridge) * .26);
        color.lerp(noseHighlight, Math.exp(-noseTip) * .30);
        color.multiplyScalar(1 - Math.exp(-nostril) * .38);
        color.multiplyScalar(1 - Math.exp(-noseWall) * .10);
        // Cheekbone plane, mandible edge, nasolabial fold and philtrum groove.
        color.lerp(cheekHighlight, Math.exp(-cheekBone) * .20);
        color.multiplyScalar(1 - Math.exp(-jawLine) * .16);
        color.multiplyScalar(1 - Math.exp(-nasolabial) * .13);
        color.multiplyScalar(1 - Math.exp(-philtrum) * .12);
        const eyeDist = Math.hypot(Math.abs(x) - Math.abs(eye[0]), y - eye[1]);
        if (eyeDist < .026 && z > .035) {
          color.lerp(eyeSocketTone, (1.0 - eyeDist / .026) * .45);
        }
        // Brow ridge shadow falling across the upper lid.
        color.multiplyScalar(1 - Math.exp(-browShadow) * .18);
        // Beard shadow keeps the mass reading as hair growing out of skin.
        if (beardValue > .02) {
          const beardTop = mouth[1] - .004 + Math.abs(x) / .078 * .044;
          const beardBottom = mouth[1] - .040 - beardValue * .75 + Math.abs(x) / .078 * .064;
          if (y < beardTop + .008 && y > beardBottom && Math.abs(x) < .080 && z > .085) {
            const feather = 1 - T.MathUtils.smoothstep(y, beardTop - .012, beardTop + .006);
            const lower = T.MathUtils.smoothstep(y, beardBottom - .005, beardBottom + .012);
            const side = 1 - T.MathUtils.smoothstep(Math.abs(x), .067, .081);
            const grain = .88 + .12 * Math.sin(x * 1700 + y * 2300) ** 2;
            color.lerp(new T.Color(palette[4]), feather * lower * side * grain * .63);
          }
        }
        if (y < neckJoint[1] + .03 && z < .05) {
          color.multiplyScalar(.82);
        }
        color.lerp(cheek, Math.exp(-cheekDistance) * .55)
             .lerp(lips, Math.exp(-lipDistance) * .88);
      } else {
        if (y < .88 && Math.abs(x) > .22) {
          color.lerp(new T.Color("#9e5847"), .20);
        }
      }
      color.toArray(colors, offset);
    }
    // Clothing masks are standard for a dressed character: covered upper-arm
    // skin should never poke through the sleeve during breathing or gestures.
    const shoulderRest = joint("upperarm_l")[1] + .075;
    let cuffY = T.MathUtils.lerp(shoulderRest, joint("lowerarm_l")[1], Math.min(1, look.sleeve / .78));
    if (look.sleeve > .78) cuffY = T.MathUtils.lerp(cuffY, joint("hand_l")[1], (look.sleeve - .78) * 1.2);
    const visibleSkin = [];
    for (let i = 0; i < source.indices.length; i += 3) {
      const ids = [source.indices[i], source.indices[i + 1], source.indices[i + 2]];
      const x = ids.reduce((sum, id) => sum + positions[id * 3], 0) / 3;
      const y = ids.reduce((sum, id) => sum + positions[id * 3 + 1], 0) / 3;
      if (Math.abs(x) > .075 && y > cuffY - .006 && y < neckJoint[1] - .010) continue;
      visibleSkin.push(...ids);
    }
    const bodyGeometry = geometry(T, positions, visibleSkin, colors);
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
    const body = new T.SkinnedMesh(bodyGeometry, skinMaterial);
    body.name = "anatomical-body";
    root.add(body);
    body.bind(skeleton);
    body.frustumCulled = false;
    body.receiveShadow = true;
    body.castShadow = true;
    body.updateMorphTargets();

    const material = (color, kind, vertexColors = true) => AdventureVisuals.surface(new T.MeshStandardMaterial({
      color, side: T.DoubleSide, roughness: 1, vertexColors,
      normalMap: textile(T, kind), roughnessMap: textileRoughness(T, kind),
      normalScale: new T.Vector2(kind === "haircloth" ? .18 : .045, .045)
    }), kind === "leather" ? "bark" : kind === "linen" ? "linen" : "wool", true);
    const mainCloth = material(palette[0], look.cloth);
    const trim = new T.MeshStandardMaterial({ color: palette[2], roughness: .94 });
    const leather = material("#594634", "leather", false);
    const cordMaterial = new T.MeshStandardMaterial({ color: "#a99776", roughness: 1 });
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

    // Fold layers run at incommensurate rates so cloth never reads as one set of
    // parallel ridges; the same function drives the stitched edges.
    function foldRadius(height, angle, folds) {
      const tension = Math.exp(-(((height - pelvisY - .08) / .15) ** 2));
      const drape = Math.sin(angle * 9.0 + height * 1.7) * .52
        + Math.sin(angle * 17 - height * 2.9 + 1.1) * .30
        + Math.sin(angle * 31 + height * 4.6 + 2.3) * .13
        + Math.sin(angle * 4 + height * 1.1) * .34;
      return 1 + folds * drape * (1 + tension * .65);
    }
    function fabricSurface(sections, start, sweep, segments, folds, style = "tunic") {
      const vertices = [], indices = [], tones = [], uv = [];
      // Interpolating the profile gives the waist, shoulder and hood continuous
      // curvature. Fold amplitude grows at the cinch and falls at taut seams.
      const curve = new T.CatmullRomCurve3(sections.map(row => new T.Vector3(...row)), false, "catmullrom", .22);
      const count = (sections.length - 1) * 5;
      for (let row = 0; row <= count; row++) {
        const point = curve.getPoint(row / count);
        const height = point.x, width = Math.max(.001, point.y), depth = Math.max(.001, point.z);
        for (let segment = 0; segment <= segments; segment++) {
          const angle = start + segment / segments * sweep;
          const neckEase = T.MathUtils.smoothstep(height, neckY - .03, neckY + .07);
          const radius = foldRadius(height, angle, folds);
          // Cloth settles over the shoulders instead of ending in a flat shelf.
          const shoulderBlend = style === "tunic" ? T.MathUtils.smoothstep(height, shoulderY - .20, shoulderY + .02) : 0;
          const drapeOver = -Math.abs(Math.cos(angle)) * .009 * shoulderBlend;
          const fall = style === "mantle" ? Math.sin(angle * 2.5) * .035 * (1 - row / count) : 0;
          const hemWave = style === "tunic" && row < 3
            ? Math.sin(angle * 3 + .6) * .009 + Math.sin(angle * 5 + 1.4) * .004 : 0;
          const neckLine = style === "tunic" ? T.MathUtils.smoothstep(height, neckY - .055, neckY - .006) : 0;
          const vx = Math.sin(angle) * width * radius;
          const vy = height + fall + drapeOver + hemWave + Math.sin(angle * 9) * .002 * (1 - neckEase) - Math.max(0, Math.cos(angle)) * neckLine * .024;
          let vz = Math.cos(angle) * depth * radius * (Math.cos(angle) < 0 ? 1 - neckLine * .45 : 1) + neckLine * .018;
          if (neckLine > .05 && Math.cos(angle) > .18) vz = Math.max(vz, faceDepth(vx, vy) + .003);
          vertices.push(vx, vy, vz);
          const hemWear = Math.exp(-(((height - hem - .025) / .055) ** 2)) * .15;
          const seam = (row < 1 || segment < 1 || segment > segments - 1) ? .045 : 0;
          const tone = .97 - hemWear - seam + .035 * Math.cos(angle * 13 + height * 2);
          const border = look.ornament === "woven-border" && row < 4 && row > 1 ? .70 : 1;
          tones.push(tone * border, tone * border * .99, tone * border * .96);
          uv.push(segment / segments, row / count);
          if (row && segment) {
            const a = row * (segments + 1) + segment, b = a - segments - 1;
            indices.push(a, b, a - 1, a - 1, b, b - 1);
          }
        }
      }
      const surface = geometry(T, vertices, indices, tones);
      surface.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      return surface;
    }

    const waistY = pelvisY + .06;
    const tunic = fabricSurface([
      [waistY, .190, .150], [pelvisY + .105, .168, .139],
      [shoulderY - .18, .204, .145], [shoulderY + .025, .232, .150],
      [shoulderY + .075, .215, .143], [neckY - .028, .116, .110], [neckY - .006, .079, .102]
    ], 0, Math.PI * 2, 56, look.cloth === "haircloth" ? .105 : .075);
    const tunicMesh = skinned(tunic, mainCloth, torsoWeights);
    tunicMesh.name = "woven-tunic-bodice";
    const mantleLength = look.headcover === "veil" ? 1.05 : look.cloak === "shoulder" ? .93 : .69;
    const clothLayers = [];
    let mantleSim = null;
    // Tunic skirt: an independent simulated layer pinned at the waist ring so the
    // hem swings with wind and stride instead of being skinned to the legs.
    {
      const cols = 48, rows = 14, rest = [], weaveUv = [], tones = [], indices = [], waistRing = [];
      for (let r = 0; r < rows; r++) {
        const t = r / (rows - 1);
        const y = T.MathUtils.lerp(waistY, hem, t);
        const width = T.MathUtils.lerp(.190, .300, t), depth = T.MathUtils.lerp(.150, .200, t);
        for (let c = 0; c < cols; c++) {
          const angle = c / cols * Math.PI * 2;
          const radius = foldRadius(y, angle, look.cloth === "haircloth" ? .105 : .075);
          const x = Math.sin(angle) * width * radius, z = Math.cos(angle) * depth * radius;
          rest.push(x, y, z);
          if (r === 0) waistRing.push(x, y, z);
          weaveUv.push(c / cols * 6, t * 4);
          const tone = .97 - (r > rows - 3 ? .06 : 0) + .03 * Math.cos(angle * 13 + y * 2);
          tones.push(tone, tone * .99, tone * .96);
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
        weaveUv[i * 2] = c / (mcols - 1) * 5; weaveUv[i * 2 + 1] = r / (mrows - 1) * 6;
        const tone = .97 - (r > mrows - 3 ? .06 : 0);
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
        before(shader);
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
            // Compression folds gather where the arm bends at the elbow.
            float elbowDistanceL = length(position - uElbowL);
            float elbowDistanceR = length(position - uElbowR);
            float elbowFold = (sin(elbowDistanceL * 152.) + sin(elbowDistanceL * 78. + 1.3))
              * exp(-pow(elbowDistanceL / .052, 2.)) * uElbowBend.x
              + (sin(elbowDistanceR * 152.) + sin(elbowDistanceR * 78. + 1.3))
              * exp(-pow(elbowDistanceR / .052, 2.)) * uElbowBend.y;
            transformed += objectNormal * elbowFold * .0024;
          `);
      };
    }

    function sleeve(side) {
      const suffix = side > 0 ? "l" : "r";
      const shoulder = new T.Vector3(...joint("upperarm_" + suffix));
      shoulder.y += .075;
      const elbow = new T.Vector3(...joint("lowerarm_" + suffix));
      const wrist = new T.Vector3(...joint("hand_" + suffix));
      const axis = elbow.clone().sub(shoulder).normalize();
      const tangent = new T.Vector3(0, 0, 1);
      const across = new T.Vector3().crossVectors(axis, tangent).normalize();
      const vertices = [], indices = [], shades = [];
      const uv = [];
      const cuffRing = [];
      for (let row = 0; row <= 16; row++) {
        const progress = row / 16 * look.sleeve;
        const center = shoulder.clone().lerp(elbow, Math.min(1, progress / .78));
        if (progress > .78) center.lerp(wrist, (progress - .78) * 1.2);
        for (let ring = 0; ring <= 28; ring++) {
          const angle = ring / 28 * Math.PI * 2;
          const fold = 1 + Math.sin(angle * 7 + progress * 3) * .045;
          const flare = row >= 15 ? 1 + (row - 14) * .06 : 1;
          const shoulderCap = row === 0 ? .55 : row === 1 ? .86 : 1;
          const radius = (.086 - progress * .029) * fold * flare * shoulderCap;
          const sag = Math.max(0, -Math.cos(angle)) * .007;
          const vertex = center.clone().addScaledVector(across, Math.sin(angle) * radius)
            .addScaledVector(tangent, Math.cos(angle) * radius);
          vertex.y -= sag;
          vertices.push(vertex.x, vertex.y, vertex.z);
          const value = row > 14 ? .84 : .97;
          shades.push(value, value, value);
          uv.push(ring / 28, row / 16);
          if (row === 16) cuffRing.push([vertex.x, vertex.y, vertex.z]);
          if (row && ring) {
            const a = row * 29 + ring, b = a - 29;
            indices.push(a, a - 1, b, a - 1, b - 1, b);
          }
        }
      }
      const sleeveGeometry = geometry(T, vertices, indices, shades);
      sleeveGeometry.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      const sleeveWeights = point => {
        const t = T.MathUtils.smoothstep(shoulder.y - point.y, .05, shoulder.y - elbow.y);
        return [["upperarm_" + suffix, 1 - t], ["lowerarm_" + suffix, t]];
      };
      skinned(sleeveGeometry, mainCloth, sleeveWeights).name = "sleeve-" + suffix;
      thread(cuffRing, .0019, trim, "sleeve-cuff-stitch-" + suffix, sleeveWeights);
    }
    sleeve(1);
    sleeve(-1);
    const isSash = look.belt === "sash";
    const beltTop = pelvisY + (look.belt === "towel" ? .18 : isSash ? .135 : .106);
    const beltBottom = pelvisY + (isSash ? .055 : .072);
    const belt = fabricSurface([[beltBottom, .187, .155], [beltTop, .182, .152]], 0, Math.PI * 2, 48, .025);
    const beltFinish = look.belt === "leather" ? leather : look.belt === "towel" ? material("#d3c6aa", "linen") : isSash ? material(look.trim || palette[2], "linen") : cordMaterial;
    skinned(belt, beltFinish, () => [["pelvis", 1]]).name = look.belt + "-waist-tie";
    if (isSash) {
      for (const side of [-1, 1]) thread([
        [-.04 * side, beltBottom, .158],
        [-.05 * side, pelvisY - .08, .165],
        [-.06 * side, pelvisY - .22, .170]
      ], .008, beltFinish, "sash-drape-end");
    }
    const necklineStitch = [];
    const topRow = tunic.attributes.position.count - 57;
    for (let i = 0; i <= 56; i++) {
      const p = tunic.attributes.position;
      necklineStitch.push([p.getX(topRow + i), p.getY(topRow + i) + .0005, p.getZ(topRow + i)]);
    }
    thread(necklineStitch, .0009, trim, "tunic-neckline-seam");

    function thread(points, radius, finish, name, weights = torsoWeights) {
      const tube = new T.TubeGeometry(new T.CatmullRomCurve3(points.map(point => new T.Vector3(...point))), Math.max(8, points.length * 4), radius, 5, false);
      if (finish.vertexColors) tube.setAttribute("color", new T.Float32BufferAttribute(new Float32Array(tube.attributes.position.count * 3).fill(1), 3));
      const object = skinned(tube, finish, weights);
      object.name = name;
      return object;
    }
    if (look.belt === "cord") {
      for (const side of [-1, 1]) thread([
        [.09, pelvisY + .098, .152], [.09 + side * .025, pelvisY + .052, .169],
        [.09 + side * .015, pelvisY - .075, .172], [.09 + side * .03, pelvisY - .19, .177]
      ], .004, cordMaterial, "knotted-woven-cord");
    }
    if (look.belt === "towel") {
      const towel = new T.PlaneGeometry(.20, .47, 12, 20);
      const p = towel.attributes.position;
      for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) + .075,
        p.getY(i) + pelvisY - .06, .175 + .012 * Math.cos(p.getX(i) * 70) + (1 - p.getY(i)) * .012);
      towel.computeVertexNormals();
      const linen = material("#d3c6aa", "linen", false);
      skinned(towel, linen, torsoWeights).name = "footwashing-linen-towel";
    }
    // Levantine & Jewish corner fringes (tzitzit) according to Numbers 15:37-41 & Deuteronomy 22:12.
    // They ride the simulated mantle hem so they never detach from the cloth.
    const devoutFringes = ["jesus", "jesus-supper", "peter", "andrew", "philip", "scholar", "isaiah", "nathan", "david", "cleopas", "beloved", "shepherd"].includes(identity) || look.tzitzit;
    const fringes = [];
    if (devoutFringes && look.cloak !== "none" && mantleSim) {
      const mc = mantleSim.mesh.userData.cols, mr = mantleSim.mesh.userData.rows;
      for (const side of [-1, 1]) for (const frontBack of [1, -1]) {
        const col = side > 0 ? (frontBack > 0 ? 0 : Math.floor(mc / 3)) : (frontBack > 0 ? Math.floor(2 * mc / 3) : mc - 1);
        const corner = (mr - 1) * mc + col;
        for (let cord = 0; cord < 3; cord++) {
          const x = side * (.165 + cord * .004);
          const y = shoulderY - mantleLength;
          const z = frontBack * (.145 + cord * .003);
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
        [bottom, .213, .169], [bottom + .04, .209, .167], [neckY - .05, .173, .153],
        [headPoint[1] + .015, .145, .145], [headTop - .09, .142, .138],
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

    const eyeGroup = new T.Group();
    eyeGroup.position.fromArray(headPoint).multiplyScalar(-1);
    bone("head").add(eyeGroup);
    const scleraTex = scleraTexture(T);
    const whites = new T.MeshPhysicalMaterial({
      color: "#c9bfb2", map: scleraTex, roughness: .29, metalness: 0,
      clearcoat: .98, clearcoatRoughness: .05, reflectivity: .90
    });
    const irisTex = irisTexture(T, look.eyeColor || "#4b3021");
    const irisMaterial = new T.MeshPhysicalMaterial({ map: irisTex, roughness: .32, metalness: 0, clearcoat: .35, clearcoatRoughness: .16 });
    const pupilMaterial = new T.MeshBasicMaterial({ color: "#060504" });
    const corneaMat = new T.MeshPhysicalMaterial({
      color: "#ffffff", transparent: true, opacity: .10, roughness: .025, metalness: 0, depthWrite: false,
      clearcoat: 1.0, clearcoatRoughness: .015, reflectivity: .99, ior: 1.376
    });
    const lashMaterial = new T.MeshStandardMaterial({ color: new T.Color(palette[4]).multiplyScalar(.55), roughness: .82 });
    const tearMat = new T.MeshPhysicalMaterial({
      color: "#ffffff", transparent: true, opacity: .58, roughness: .02, metalness: .01,
      clearcoat: 1.0, clearcoatRoughness: .01, reflectivity: .99
    });
    const caruncleMat = new T.MeshPhysicalMaterial({
      color: "#aa5448", roughness: .26, metalness: .02, clearcoat: .88, clearcoatRoughness: .06
    });
    const lidMaterial = new T.MeshPhysicalMaterial({
      color: palette[3], vertexColors: true, roughness: .60, metalness: .02,
      clearcoat: .06, clearcoatRoughness: .40, side: T.DoubleSide,
      sheen: .30, sheenColor: new T.Color("#ffd6bd"), sheenRoughness: .74
    });
    const GLOBE = .0134, LID = .0137;
    // 3A eye shading: a baked upper-lid contact shadow falls onto the globe, and
    // the iris is sampled with a view-dependent refraction parallax so it reads
    // as a concave disc seated behind the refracting cornea (ior 1.376).
    function eyeShading(mat, refract) {
      mat.customProgramCacheKey = () => "eye-aaa-v1-" + (refract ? "iris" : "sclera");
      mat.onBeforeCompile = shader => {
        shader.uniforms.uLidShadow = { value: .5 };
        shader.uniforms.uGlobeR = { value: GLOBE };
        if (refract) shader.uniforms.uIrisRefract = { value: .05 };
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vEyeLocal;\nvarying vec2 vEyeUv;\nvarying vec3 vEyeView;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvEyeLocal = position;\nvEyeUv = uv;\nvEyeView = -(modelViewMatrix * vec4(position, 1.0)).xyz;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vEyeLocal;\nvarying vec2 vEyeUv;\nvarying vec3 vEyeView;\nuniform float uLidShadow, uGlobeR;" + (refract ? "\nuniform float uIrisRefract;" : ""))
          .replace("#include <map_fragment>", refract ? `
            vec3 vDir = normalize(vEyeView);
            vec2 tanView = vDir.xy / max(.25, abs(vDir.z));
            vec2 iuv = clamp(vEyeUv - tanView * uIrisRefract, 0.0, 1.0);
            diffuseColor *= texture2D(map, iuv);
          ` : "#include <map_fragment>")
          .replace("#include <color_fragment>", `#include <color_fragment>
            float lidOcc = smoothstep(.10, .95, vEyeLocal.y / uGlobeR);
            float cornerOcc = smoothstep(.55, 1.0, abs(vEyeLocal.x) / uGlobeR) * .3;
            diffuseColor.rgb *= 1.0 - (lidOcc * uLidShadow + cornerOcc);
          `);
      };
      return mat;
    }
    eyeShading(whites, false);
    eyeShading(irisMaterial, true);
    // Eyelid shells: spherical caps framing the globe. Their rims lift at the
    // corners so the aperture closes into an almond instead of a round hole.
    function lidShell(radius, thetaStart, thetaLength, corner, segments = 28, rings = 7) {
      const vertices = [], indices = [], shades = [];
      for (let ring = 0; ring <= rings; ring++) {
        const t = ring / rings;
        const theta = thetaStart + t * thetaLength;
        for (let segment = 0; segment <= segments; segment++) {
          const phi = segment / segments * Math.PI * 2;
          const rim = T.MathUtils.smoothstep(t, .82, 1);
          const lift = rim * corner * Math.pow(Math.abs(Math.sin(phi)), 1.7);
          const ux = Math.sin(theta) * Math.sin(phi);
          const uy = Math.cos(theta);
          const uz = Math.sin(theta) * Math.cos(phi);
          vertices.push(ux * radius, uy * radius + lift, uz * radius + rim * .0006);
          const shade = .95 - rim * .18 - Math.pow(Math.abs(Math.cos(phi)), 3) * .03;
          shades.push(shade, shade * .99, shade * .97);
          if (ring && segment) {
            const a = ring * (segments + 1) + segment, b = a - segments - 1;
            indices.push(a, b, a - 1, a - 1, b, b - 1);
          }
        }
      }
      return geometry(T, vertices, indices, shades);
    }
    function lidRim(radius, theta, corner, segments = 12) {
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
    // A dish that follows the globe surface, so iris and pupil read as part of
    // the eye instead of discs floating in front of it.
    function eyeDish(radius, discRadius, lift, segments = 28) {
      const disc = new T.CircleGeometry(discRadius, segments);
      const p = disc.attributes.position;
      for (let index = 0; index < p.count; index++) {
        const r = Math.hypot(p.getX(index), p.getY(index));
        p.setZ(index, Math.sqrt(Math.max(0, radius * radius - r * r)) + lift);
      }
      disc.computeVertexNormals();
      return disc;
    }
    const eyes = [];
    const lids = [];
    for (const side of ["l", "r"]) {
      const point = new T.Vector3(...landmarks["joint-" + side + "-eye"]);
      const s = side === "l" ? 1 : -1;
      const eyeRoot = new T.Group();
      eyeRoot.position.copy(point);
      eyeGroup.add(eyeRoot);
      const white = new T.Mesh(new T.SphereGeometry(GLOBE, 20, 14), whites);
      eyeRoot.add(white);
      const iris = new T.Mesh(eyeDish(GLOBE, .0056, .0002), irisMaterial);
      eyeRoot.add(iris);
      const pupil = new T.Mesh(eyeDish(GLOBE, .0022, .00042, 20), pupilMaterial);
      eyeRoot.add(pupil);
      const cornea = new T.Mesh(new T.SphereGeometry(.01366, 32, 14, 0, Math.PI * 2, 0, .57), corneaMat);
      cornea.rotation.x = Math.PI / 2;
      cornea.renderOrder = 2;
      eyeRoot.add(cornea);
      // Lids belong to the skull, so the globe can turn inside them.
      const upperPivot = new T.Group();
      upperPivot.position.copy(point);
      eyeGroup.add(upperPivot);
      upperPivot.add(new T.Mesh(lidShell(LID, .10, 1.13, .0016), lidMaterial));
      const lashCurve = lidRim(LID + .0004, 1.23, .0016, 12);
      const lashTube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(lashCurve), 14, .00050, 4, false), lashMaterial);
      upperPivot.add(lashTube);
      const lowerPivot = new T.Group();
      lowerPivot.position.copy(point);
      eyeGroup.add(lowerPivot);
      lowerPivot.add(new T.Mesh(lidShell(LID, 1.891, Math.PI - 1.891, .0016), lidMaterial));
      const tearCurve = lidRim(LID + .0004, 1.891, .0016, 12);
      const tearTube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(tearCurve), 14, .00034, 4, false), tearMat);
      lowerPivot.add(tearTube);
      const caruncle = new T.Mesh(new T.SphereGeometry(1, 8, 6), caruncleMat);
      caruncle.scale.set(.0017, .0013, .0010);
      caruncle.position.set(s * -.0112, -.0022, .0052);
      lowerPivot.add(caruncle);
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

    const sandals = [];
    for (const suffix of ["l", "r"]) {
      const at = joint("foot_" + suffix);
      const sole = new T.SphereGeometry(1, 20, 10);
      const p = sole.attributes.position;
      for (let index = 0; index < p.count; index++) {
        p.setXYZ(index, p.getX(index) * .048 + at[0], p.getY(index) * .012 + .014,
          p.getZ(index) * .119 + at[2] + .045);
      }
      sole.computeVertexNormals();
      sandals.push(skinned(sole, leather, () => [["foot_" + suffix, 1]]));
      const strap = new T.TorusGeometry(.046, .006, 6, 22, Math.PI);
      strap.translate(at[0], .031, at[2] + .087);
      sandals.push(skinned(strap, leather, () => [["foot_" + suffix, 1]]));
      const ankle = new T.TorusGeometry(.034, .005, 6, 22);
      ankle.rotateX(Math.PI / 2);
      ankle.translate(at[0], .082, at[2] - .022);
      sandals.push(skinned(ankle, leather, () => [["foot_" + suffix, 1]]));
    }

    // Individual eye layers are useful in conversation. Their draw calls can
    // be omitted once the character is a small figure in the landscape.
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
    const phase = (seed % 1000) / 100;
    // Two-bone (thigh->calf) rest lengths for the analytical foot IK.
    const legL1 = new T.Vector3(...joint("calf_l")).distanceTo(new T.Vector3(...joint("thigh_l")));
    const legL2 = new T.Vector3(...joint("foot_l")).distanceTo(new T.Vector3(...joint("calf_l")));
    let liveRenderer = null;
    let clothActive = true;
    const clothWind = new T.Vector3(), clothInertia = new T.Vector3();
    let prevRootX = 0, prevRootZ = 0, prevVelX = 0, prevVelZ = 0;
    function animate(time, pace = 0, heading, posture = "idle", progress = 0) {
      const speaking = posture === "talk" || posture === "seated-talk";
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
      const step = Math.sin(gait) * motion * (1 - crouch) * (1 - seated);
      const breath = Math.sin(time * 1.75 + phase);
      const sway = Math.sin(time * .82 + phase) * .005 * (1 - Math.min(1, motion));
      const weightShift = Math.sin(time * .58 + phase) * (1 - Math.min(1, motion * 2)) * (1 - crouch) * (1 - seated);
      bone("pelvis").position.x += sway + weightShift * .006;
      bone("pelvis").position.y += Math.abs(Math.sin(gait)) * .019 * motion - crouch * .45 - seated * .43 + breath * .0028;
      bone("pelvis").rotation.y = step * .035;
      bone("pelvis").rotation.z = weightShift * .016;
      bone("spine_03").position.z += Math.max(0, breath) * .003;
      bone("spine_03").rotation.set(motion * .026 + crouch * .16 + look.stoop, -step * .05, step * .023 + breath * .002 - weightShift * .012);
      bone("clavicle_l").rotation.z = breath * .012;
      bone("clavicle_r").rotation.z = -breath * .012;
      bone("neck_01").rotation.x = -motion * .024 + breath * .008;
      bone("head").rotation.y = gaze + Math.sin(time * .62 + phase) * .035 * (1 - Math.min(1, motion));
      bone("head").rotation.x = crouch * .17 + (speaking ? (Math.sin(time * 3.4) * .018 + Math.sin(time * 1.7) * .012) : 0);
      bone("head").rotation.z = speaking ? Math.sin(time * 1.1 + phase) * .014 : 0;
      // Hair lags behind the head turn; sleeves bunch where the arm bends.
      const headYaw = bone("head").rotation.y;
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
        // Pelvis height drop to accommodate the lowest foot without over-extending
        const pelvisIKDrop = Math.min(0, Math.min(dHL, dHR));
        bone("pelvis").position.y += pelvisIKDrop * 0.85;
      }

      const baseCurl = { index: .08, middle: .12, ring: .16, pinky: .20 };
      for (const suffix of ["l", "r"]) {
        const side = suffix === "l" ? 1 : -1;
        const swing = side * step;
        const footDiff = suffix === "l" ? dHL : dHR;
        // Analytical two-bone IK: place the ankle on the sampled terrain/stair
        // height, then lock the foot's world pitch to the local slope.
        const hipY = joint("thigh_" + suffix)[1] + (bone("pelvis").position.y - rest[jointIndex("pelvis")].y);
        const targetY = joint("foot_" + suffix)[1] + footDiff + Math.max(0, swing) * .05;
        const dy = Math.max(.05, hipY - targetY);
        const dz = swing * .12;
        const reach = T.MathUtils.clamp(Math.hypot(dy, dz), Math.abs(legL1 - legL2) + .002, legL1 + legL2 - .002);
        const kneeInterior = Math.acos(T.MathUtils.clamp((legL1 * legL1 + legL2 * legL2 - reach * reach) / (2 * legL1 * legL2), -1, 1));
        const calfBend = Math.PI - kneeInterior;
        const hipAlpha = Math.acos(T.MathUtils.clamp((legL1 * legL1 + reach * reach - legL2 * legL2) / (2 * legL1 * reach), -1, 1));
        const phi = Math.atan2(dz, dy);
        const thighRot = -(phi + hipAlpha) - crouch * .25 - seated * 1.35;
        const calfRot = calfBend + crouch * 1.88 + seated * 1.42;
        bone("thigh_" + suffix).rotation.x = thighRot;
        bone("calf_" + suffix).rotation.x = calfRot;
        bone("foot_" + suffix).rotation.x = -terrainPitch * .82 - (thighRot + calfRot) * .55 - crouch * 1.2;
        bone("foot_" + suffix).rotation.z = (suffix === "l" ? 1 : -1) * terrainRoll * .35;
        bone("upperarm_" + suffix).rotation.x = -swing * .35 - crouch * .27;
        bone("upperarm_" + suffix).rotation.z = -side * (.025 + Math.abs(step) * .017);
        bone("lowerarm_" + suffix).rotation.x = -.08 - crouch * .58;
        const gripping = Boolean((look.item && !bag) || armed) && suffix === "r";
        for (const finger of ["index", "middle", "ring", "pinky"]) {
          const curl = baseCurl[finger];
          for (const section of ["01", "02", "03"]) {
            bone(finger + "_" + section + "_" + suffix).rotation.x = -(gripping ? .58 : curl) +
              Math.sin(time * .73 + side) * .015;
          }
        }
        for (const section of ["01", "02", "03"]) {
          bone("thumb_" + section + "_" + suffix).rotation.set(
            -(gripping ? .35 : .10) + Math.sin(time * .73 + side) * .01,
            side * (gripping ? .22 : .06),
            side * (gripping ? -.15 : -.04)
          );
        }
      }
      const freeHand = look.item && !bag ? "l" : "r";
      const cadence = time * (look.gesture === "teach" ? 1.6 : 2.1) + phase;
      bone("upperarm_" + freeHand).rotation.x -= gesture * (.27 + Math.sin(cadence) * .11);
      bone("lowerarm_" + freeHand).rotation.x -= gesture * (.58 + Math.sin(cadence * 1.4) * .12);
      bone("hand_" + freeHand).rotation.y += gesture * .23;
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
        bone("spine_03").rotation.x += look.gesture === "read" ? .06 : .13;
        bone("head").rotation.x += .18;
        const handwork = Math.sin(time * (look.gesture === "read" ? .8 : 2.3) + phase);
        bone("upperarm_r").rotation.x -= .38 + handwork * .10;
        bone("lowerarm_r").rotation.x -= .47;
        bone("upperarm_l").rotation.x -= .32;
        bone("lowerarm_l").rotation.x -= .51 - handwork * .07;
        bone("hand_r").rotation.y += handwork * .14;
      }
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
      const blink = 1 - T.MathUtils.clamp(Math.abs(((time + phase) % 4.67) - 2.1) / .075, 0, 1);
      body.morphTargetInfluences[0] = blink;
      body.morphTargetInfluences[1] = blink;
      const speechCadence = Math.max(0, Math.sin(time * 2.2));
      const phonemes = Math.sin(time * 8.6) * .55 + Math.sin(time * 14.2) * .32 + Math.sin(time * 22.0) * .13;
      body.morphTargetInfluences[2] = speaking ?
        speechCadence * Math.max(0, phonemes * .26 + .06) : 0;
      groom.jawOpen.value = body.morphTargetInfluences[2];
      body.morphTargetInfluences[3] = (look.gesture === "teach" || speaking ? .20 : .08) + Math.sin(time * .6 + phase) * .035;
      body.morphTargetInfluences[4] = speaking ? .20 + Math.sin(time * .9) * .08 : .10;
      const tremorY = Math.sin(time * 19.3 + phase) * .0025;
      const tremorX = Math.sin(time * 23.7 + phase) * .0018;
      const gazeDart = Math.sin(time * 1.7 + phase) > .8 ? (Math.sin(time * 3.4) * .016) : 0;
      for (const eye of eyes) {
        eye.visible = blink < .98;
        eye.rotation.y = Math.sin(time * .93 + phase) * .055 + tremorY + gazeDart;
        eye.rotation.x = Math.sin(time * .47 + phase) * .022 + tremorX;
      }
      // The upper lid sweeps down over the globe while the lower lid lifts a
      // little, so a blink closes the almond instead of hiding the eye.
      for (const lid of lids) {
        lid.upper.rotation.x = blink * .68;
        lid.lower.rotation.x = -blink * .06;
      }
      for (const sandal of sandals) sandal.visible = posture !== "barefoot";
      if (personalItem) personalItem.visible = !armed && !combat && posture !== "cross";

      // Drive the independent cloth layers (GPU compute / CPU Verlet) with wind,
      // stride inertia, body capsules and the sampled ground/stair height.
      if (clothLayers.length && clothActive) {
        const yaw = root.rotation.y, cosH = Math.cos(yaw), sinH = Math.sin(yaw);
        const gust = .7 + Math.sin(time * .7 + phase) * .35 + motion * .5;
        const wx = (Math.sin(time * .43 + phase) * .5 + .9) * gust, wz = Math.cos(time * .31 + phase) * .5 * gust;
        clothWind.set(wx * cosH + wz * sinH, 0, -wx * sinH + wz * cosH);
        const velX = (root.position.x - prevRootX) / delta, velZ = (root.position.z - prevRootZ) / delta;
        const accX = T.MathUtils.clamp((velX - prevVelX) / delta, -9, 9), accZ = T.MathUtils.clamp((velZ - prevVelZ) / delta, -9, 9);
        prevRootX = root.position.x; prevRootZ = root.position.z; prevVelX = velX; prevVelZ = velZ;
        clothInertia.set(-accX * .012 + step * motion * .12, 0, -accZ * .012 + Math.sin(gait) * motion * .2);
        const pelvisDelta = bone("pelvis").position.y - rest[jointIndex("pelvis")].y;
        const groundLocal = (typeof root.userData.heightAt === "function" ? root.userData.heightAt(root.position.x, root.position.z) : root.position.y) - root.position.y + .012;
        const capsules = [
          { a: [0, pelvisY + pelvisDelta, 0], b: [0, shoulderY + pelvisDelta, 0], r: .165 }
        ];
        for (const layer of clothLayers) {
          const ud = layer.mesh.userData;
          const cols = ud.restPin.length / 3;
          if (!ud.pinBuf) ud.pinBuf = new Float32Array(ud.restPin.length);
          const bDelta = bone(ud.pinBone).position.clone().sub(rest[jointIndex(ud.pinBone)]);
          for (let c = 0; c < cols; c++) {
            ud.pinBuf[c * 3] = ud.restPin[c * 3] + bDelta.x;
            ud.pinBuf[c * 3 + 1] = ud.restPin[c * 3 + 1] + bDelta.y;
            ud.pinBuf[c * 3 + 2] = ud.restPin[c * 3 + 2] + bDelta.z;
          }
          layer.update(delta, {
            renderer: liveRenderer, time, wind: clothWind.toArray(), inertia: clothInertia.toArray(),
            gravity: 9.8, capsules, groundY: groundLocal, pinTargets: ud.pinBuf, stiffness: .8, shape: ud.shape ?? 26
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
