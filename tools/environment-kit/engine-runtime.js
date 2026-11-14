function hS(s) {
  let inspectFrame = null;
  const architecture = () => {const ar=y?.userData.architecture;if(ar&&!ar.engineBound){ar.setOutdoorAllowed(terrainAllowed);ar.engineBound=true;}return ar;};
  const groundHeight=(x,z)=>y?.userData.terrainHeight?.(x,z)??T.height(x,z);
  function spatial(object=w?.object) { return object ? {x:object.position.x,y:object.position.y,z:object.position.z,supportId:object.userData.supportId??'world'} : null; }
  function targetSpatial(target) {
    const at=tt(target),actor=target.actor&&_.get(target.actor)?.object;
    return { ...target, at, floorY:actor?.position.y??target.floorY??groundHeight(...at),surfaceId:actor?.userData.supportId??target.surfaceId??'world' };
  }
  function targetDistance(target) {const p=spatial(),q=targetSpatial(target);return Math.hypot(p.x-q.at[0],p.z-q.at[1],p.y-q.floorY);}
  function canReach(target) {return architecture()?architecture().reachable(spatial(),targetSpatial(target)):Oe(De(w.object.position),tt(target))<(target.range??2.5);}
  let t = matchMedia("(pointer: coarse)").matches, e = !matchMedia("(prefers-reduced-motion: reduce)").matches, QMode = s.quality === "balanced" || s.quality === "high" || s.quality === "ultra" ? s.quality : t ? "high" : "ultra", n = t && QMode === "balanced", i = new jl({ antialias: !t, powerPreference: "high-performance", alpha: false });
  i.outputColorSpace = je, i.toneMapping = lu ?? ba, i.toneMappingExposure = 1.06, i.shadowMap.enabled = !n, i.shadowMap.type = ys;
  let pp = AdventureVisuals.createPipeline(bn, i, QMode), r = i.domElement;
  r.className = "adv-canvas", r.setAttribute("aria-hidden", "true");
  let a = new He(51, 1, 0.13, 155), o = new R(), l = new R(), c = new R(), h = new ui(), f = new R(), u = new Ma(), d = new ct(), p = new ResizeObserver(ge), _ = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), g = [], x, M, y, T, w, v = "", b = "", P = [], C = null, I = null, U = [0, 0], Y = false, D = 0, z = false, V = false, G = -0.26, lt = 0.35, J = 7.7, fpMode = false, fpPitch = 0, fpBobOn = false, fpActive = false, currentSpringDist = 7.7, et = Math.PI, K = 0, xt = 0, Wt = 0, $ = 0, _t = null, mt = null, Gt = false, wt = null, ht = null, kt = null, vt = false, Bt = null, ee = 0, L = false, k = false, X = false, at = 1, rt = 0, ut = null, yt = null, Vt = null, $t = "", Qt = 0, F = -1, Te = [0, 0], re = null;
  function ge() {
    if (!x?.isConnected) return;
    let { width: B, height: q } = x.getBoundingClientRect();
    if (B < 2 || q < 2) return;
    let pr = Math.min(devicePixelRatio || 1, QMode === "balanced" ? 1.15 : t ? 1.45 : 2, 2e3 / B) * at * (pp?.isSoftware ? 0.72 : 1);
    i.setPixelRatio(pr), i.setSize(B, q, false), pp?.setSize(B, q, pr), a.aspect = B / q, a.updateProjectionMatrix();
  }
  function Mt(B, q) {
    x = B, M = q, r.parentElement !== x && x.prepend(r), p.disconnect(), p.observe(x), ge(), Et(), Bt?.enable(vt), !$ && !V && !X && ($ = requestAnimationFrame(ce));
  }
  function Re() {
    ae(), Bt?.enable(false), cancelAnimationFrame($), $ = 0, xt = 0, p.disconnect(), U = [0, 0], C = null, ht = null, x = null, M = null;
  }
  function terrainAllowed(B, q) {
    return B >= dn.left && B <= dn.right && q >= dn.far && q <= dn.near && !T.blocked(B, q) && !g.some(([nt, ft, Ft]) => (B - nt) ** 2 + (q - ft) ** 2 < (Ft + 0.24) ** 2);
  }
  function Ut(B,q) {return architecture()?architecture().groundClear(B,q):terrainAllowed(B,q);}
  function Yt(B, q = 1) {
    let nt = new be(new mi(q, q), new rn({ map: T.shadow, color: 1581079, transparent: true, depthWrite: false, opacity: 0.38, polygonOffset: true, polygonOffsetFactor: -1 }));
    nt.rotation.x = -Math.PI / 2, nt.position.y = 0.018, B.add(nt);
  }
  function E(B, at, metadata={}) {
    const [q,nt]=at,ar=architecture();
    let floor=Number.isFinite(metadata.floorY)?{y:metadata.floorY,supportId:metadata.surfaceId??'world'}:Number.isFinite(at[2])?{y:at[2],supportId:at[3]??'world'}:ar?.supports(q,nt).find(p=>p.supportId==='world'||p.supportId==='q01-room');
    B.position.set(q,floor?.y??groundHeight(q,nt),nt);B.userData.supportId=floor?.supportId??'world';
  }
  function S(B, q, nt, appearance) {
    let ft = W0(bn, q, { look: AdventureCast.people[appearance], appearance });
    return ft.object.traverse((Ft) => {
      Ft.isMesh && (Ft.castShadow = !n && Ft.isSkinnedMesh && Ft.name !== "groomed-hair");
    }), ft.object.name = B, ft.object.userData.heightAt = (x2,z2) => architecture()?.supports(x2,z2).filter(p=>Math.abs(p.y-ft.object.position.y)<.25).sort((a,b)=>Math.abs(a.y-ft.object.position.y)-Math.abs(b.y-ft.object.position.y))[0]?.y??groundHeight(x2,z2), E(ft.object, nt), Yt(ft.object, 1.7), y.add(ft.object), { model: ft, object: ft.object, variant: q, position: nt, angle: 0, phase: nt[0] * 0.19 + nt[1] * 0.27 };
  }
  function W(B, q, nt, ft = false) {
    if (b === B && y && !ft) return;
    ae(), y && (y.traverse((o2) => o2.userData?.disposeWater?.()), ig(y)), _.clear(), m.clear(), y = new Zs(), T = j0(y, B, !n && i.shadowMap.enabled, nt), pp?.isSoftware && T?.sun?.shadow && (T.sun.shadow.mapSize.set(1024, 1024), T.sun.shadow.map?.dispose(), T.sun.shadow.map = null, T.sun.shadow.needsUpdate = true), AdventureVisuals.environment(bn, i, y, T.layout.biome), Bt?.setBiome(T.layout.biome), g = T.obstacles, b = B, v = B;
    T.night=!!AdventureVisuals.atmosphere(T.layout.biome).night;
    // Retire starter terrain obstacles for the authored level. St() still adds
    // the current campaign's real craft/prop solids to g; do not bypass those.
    if(T.layout.authoredPhysics){T.obstacles=[];g=T.obstacles;T.blocked=()=>false;T.cameraVolumes=[];}
    if(T.layout.q01Gold&&globalThis.WitnessQ01){
      const clear=globalThis.WitnessQ01.clearLand,blocked=T.blocked;
      T.obstacles=T.obstacles.filter(([x,z,r])=>!clear(x,z,r)&&z>=-22.4);g=T.obstacles;
      T.cameraVolumes=T.cameraVolumes.filter(v=>!v.center||(!clear(v.center.x,v.center.z,v.radius??v.r??1)&&v.center.z>=-22.4));
      T.blocked=(x,z)=>globalThis.WitnessQ01Environment?.enabled&&z<globalThis.WitnessQ01Environment.shore(x)+.45?true:clear(x,z)?false:blocked(x,z);
    }
    let Ft = q && Ut(...q) ? q : T.layout.start;
    if (w = S("player", B, Ft), et = ni(Ft, T.layout.nodes[0]), G = -0.26, lt = 0.35, J = 7.7, fpPitch = 0, C = I = _t = mt = null, L = k = Y = z = false, D = 0, U = [0, 0], K = 0, Qt = 0, F = -1, yt = re = null, Vt = null, $t = "", B === "magdalene") {
      let Lt = Lf(bn, "tomb");
      E(Lt, [-5.2, -6.9]), y.add(Lt);
    }
    Zt(1);
  }
  function dt(B) {
    if (B === v || !lS.has(B)) return;
    let q = [...De(w.object.position),w.object.position.y,w.object.userData.supportId??'world'];
    _.set("role-" + v, w), w.object.visible = false, w = _.get("role-" + B) ?? S("player", B, q), v = B, w.object.visible = true, E(w.object, q);
  }
  function ot(B) {
    if (_.has(B.id)) return _.get(B.id);
    let q;
    if (B.kind === "craft-anchor") {
      const anchor = new ci();
      anchor.name = B.id;
      E(anchor, B.at, B);
      y.add(anchor);
      q = { object: anchor, position: B.at };
    } else if (B.kind === "npc") q = S(B.id, B.variant, B.at, B.appearance);
    else if (B.kind === "sign") {
      let nt = new ci(), ft = new be(new sr(0.56, 0.037, 5, 24), new rn({ color: 16769181, transparent: true, opacity: 0.86, toneMapped: false }));
      ft.rotation.x = -Math.PI / 2, ft.position.y = 0.064, nt.add(ft), E(nt, B.at), y.add(nt), q = { object: nt, position: B.at, ring: ft };
    } else {
      let nt = Ru(bn, B.variant) ?? Oa(bn, B.variant);
      B.variant === "barrier" && (nt = new be(new Zn(2.62, 0.16, 0.19), new Ei({ color: 7295542, roughness: 0.88 })), nt.geometry.translate(0, 1.08, 0.04), nt.castShadow = true), nt ??= Lf(bn, B.variant), E(nt, B.at), nt.rotation.y = B.rotation ?? 0, y.add(nt), q = { object: nt, position: B.at };
    }
    if(Number.isFinite(B.floorY))E(q.object,B.at,B);
    return B.reclined && (q.model?.animate(0, 0, 0, "idle"), q.object.rotation.z = 1.48, q.object.position.y += 0.23, q.still = true), q.pose = B.pose ?? "idle", B.pose === "cross" && (q.model.animate(0, 0, 0, "cross"), q.object.position.y += 0.98, q.object.position.z += 0.24, q.object.rotation.z = -0.024, q.still = true), _.set(B.id, q), q;
  }
  function St(B, q, nt = {}) {
    if (!T) return;
    let ft = new Set(B.map((Lt) => Lt.id));
    for (let [Lt, te] of _) Lt.startsWith("role-") || (te.object.visible = ft.has(Lt));
    g = [...T.obstacles, ...B.flatMap((Lt) => Lt.solids ?? [])];
    for (let Lt of B) {
      let te = ot(Lt);
      te.object.visible = true, te.pose = Lt.pose ?? "idle", te.work = Lt.work, te.appearance = Lt.appearance, te.routeStop = !!Lt.routeStop, te.routeKey !== (Lt.route?.flat().join(",") ?? "") && (te.routeKey = Lt.route?.flat().join(",") ?? "", te.route = Lt.route, te.waypoint = 0, te.rest = 0), Lt.fixed && I?.actor !== Lt.id && E(te.object, Lt.at,Lt);
    }
    L = !!nt.carrying, k = !!nt.bareFeet;
    let Ft = B.filter((Lt) => Lt.kind !== "npc").map((Lt) => Lt.id).join("|");
    $t !== Ft && ($t = Ft, T.refreshShadows()), P = q, Et();
  }
  function Et() {
    if (m.clear(), !!M) {
      M.replaceChildren();
      for (let B of P) {
        let q = document.createElement("button");
        q.type = "button", q.className = "adv-marker" + (B.main ? " is-primary" : ""), q.dataset.worldTarget = B.id, q.setAttribute("aria-label", "T\u01B0\u01A1ng t\xE1c v\u1EDBi " + B.name);
        let nt = document.createElement("i");
        nt.setAttribute("aria-hidden", "true"), nt.textContent = B.symbol ?? "\u25C7";
        let ft = document.createElement("span");
        ft.textContent = B.name, q.append(nt, ft), q.tabIndex = -1, q.addEventListener("click", () => {
          !z && canReach(B) && s.select(B.id);
        }), M.append(q), m.set(B.id, q);
      }
    }
  }
  function tt(B) {
    return B.actor && _.has(B.actor) ? De(_.get(B.actor).object.position) : B.at;
  }
  function it() {
    if (!w || z || ut) return null;
    let B = De(w.object.position);
    return P.map((q) => [q,targetDistance(q)]).filter(([q])=>canReach(q)).sort((q, nt) => Number(nt[0].main) - Number(q[0].main) || q[1] - nt[1])[0]?.[0] ?? null;
  }
  function At(B) {
    if (!x || B - ee < 34) return;
    ee = B;
    let q = De(w.object.position), nt = x.clientHeight, ft = x.clientWidth;
    for (let le of P) {
      let $e = m.get(le.id);
      if (!$e) continue;
      let Ke = tt(le), Vn = targetDistance(le),floorY=targetSpatial(le).floorY;
      c.set(Ke[0], floorY + (le.elevation ?? 1.63), Ke[1]).project(a);
      let Wn = re?.id === le.id && re.until > K, Oi = c.z > -1 && c.z < 1 && Math.abs(c.x) < 0.93 && Math.abs(c.y) < 0.92 && Vn < (Wn ? 20 : le.following ? 14 : 5.8) && !z && !ut && (!architecture()||architecture().visible({...spatial(),y:w.object.position.y+1.58},{x:Ke[0],y:floorY+(le.elevation??1.63),z:Ke[1]},le.colliderId));
      $e.hidden = !Oi, Oi && ($e.style.transform = `translate3d(${(c.x + 1) * ft / 2}px,${(1 - c.y) * nt / 2}px,0) translate(-50%,-100%)`, $e.classList.toggle("is-near", Vn < (le.range ?? 2.5)), $e.classList.toggle("is-sensed", Wn));
    }
    let Ft = it(), Lt = P.find((le) => le.main), te = Lt ? tt(Lt) : null, _e = te ? ni(q, te) - G - Math.PI : 0;
    x.dataset.playerY = w.object.position.y.toFixed(3), x.dataset.supportId = w.object.userData.supportId??'world', x.dataset.playerX = w.object.position.x.toFixed(2), x.dataset.playerZ = w.object.position.z.toFixed(2), s.status?.({ nearest: Ft, position: q, spatial: spatial(), yaw: G, audio: { camera: [a.position.x, a.position.y, a.position.z], look: [o.x, o.y, o.z], ground: w.object.position.y + 0.05, paused: z }, npc: [..._.entries()].filter(([id, actor]) => actor.object.visible && actor.appearance && Oe(q, De(actor.object.position)) < 5.2).map(([id, actor]) => ({ id, appearance: actor.appearance, distance: Oe(q, De(actor.object.position)), activity: actor.rest > K ? "rest" : actor.route ? "walk" : "idle" })).sort((left, right) => left.distance - right.distance)[0] ?? null, arrow: _e, walking: U.some(Boolean) || !!C || Qt > 0, combat: ut?.snapshot, sensed: re?.until > K ? re.at : null, guide: I ? { step: I.index - 1, total: I.route.length - 1, waiting: I.waiting, at: De(_.get(I.actor).object.position) } : null });
  }
  function N(B, q = null, nt = 1.9, target=null) {
    if (!w || z || ut) return false;
    let ft = De(w.object.position);
    const ar=architecture(),goal=ar?target?ar.targetPoint(targetSpatial(target)):{x:B[0],y:groundHeight(...B),z:B[1],supportId:'world'}:null;
    if(goal&&target?.approach){goal.x=target.approach[0];goal.z=target.approach[1];}
    const at=ar?[goal.x,goal.z,goal.y,goal.supportId]:B;
    if(q&&Math.hypot(ft[0]-B[0],ft[1]-B[1],ar?w.object.position.y-goal.y:0)<=nt&&(!target||canReach(target)))return C=null,q(),true;
    const path=(from,to)=>{
      if(!globalThis.WitnessQ01Environment?.enabled)return cS(from,to,Ut,.18);
      const onGround=p=>ar.supports(...p).find(s=>!s.supportId.startsWith('q01-roof')&&!s.supportId.startsWith('q01-step'));
      const isGoal=Math.hypot(to[0]-goal.x,to[1]-goal.z)<.01;
      return globalThis.WitnessQ01Environment.findPath(from,to,{allowed:Ut,range:isGoal?nt:.12,accept:p=>!isGoal||!target||ar.reachable(onGround(p),targetSpatial(target)),sweep:(a,b)=>{const p=onGround(a),q=onGround(b);return !!(p&&q&&ar.walkLine(p,q));}});
    };
    const route=ar?ar.route(spatial(),goal,path):null;
    let Ft=ar?route?.map(p=>[p.x,p.z,p.y,p.supportId]):cS(ft,B,Ut,q?nt:.65);
    return Ft?.length ? (C = { path: Ft, onArrive: q, range: nt, at, target }, true) : false;
  }
  function st(B, q, nt, ft, actor=w?.object) {
    if(architecture()) {const p=architecture().move(spatial(actor),q*ft,nt*ft);return [p.x,p.z,p.y,p.supportId];}
    let [Ft, Lt] = B, dx = q * ft, dz = nt * ft;
    if (Ut(Ft + dx, Lt + dz)) return [Ft + dx, Lt + dz];
    let curH = groundHeight(Ft, Lt), stepH = groundHeight(Ft + dx, Lt + dz);
    if (Math.abs(stepH - curH) <= 0.26 && Ut(Ft + dx, Lt + dz)) return [Ft + dx, Lt + dz];
    let bestDist = 1e9, nx = 0, nz = 0;
    for (let [ox, oz, orad] of g) {
      let d2 = Math.hypot(Ft + dx - ox, Lt + dz - oz);
      if (d2 < orad + 0.34 && d2 < bestDist) {
        bestDist = d2;
        let len = Math.hypot(Ft - ox, Lt - oz) || 1;
        nx = (Ft - ox) / len;
        nz = (Lt - oz) / len;
      }
    }
    if (bestDist < 1e8) {
      let dot = q * nx + nt * nz;
      if (dot < 0) {
        let sx = (q - dot * nx) * ft, sz = (nt - dot * nz) * ft;
        if (Ut(Ft + sx, Lt + sz)) return [Ft + sx, Lt + sz];
      }
    }
    if (Ut(Ft + dx, Lt)) Ft += dx;
    if (Ut(Ft, Lt + dz)) Lt += dz;
    return [Ft, Lt];
  }
  let Q = () => [U[0] * Math.cos(G) - U[1] * Math.sin(G), -U[0] * Math.sin(G) - U[1] * Math.cos(G)];
  function Tt(B) {
    let q = De(w.object.position), nt = [0, 0], ft = null;
    if (!z) {
      if (Qt > 0) nt = Te;
      else if (U[0] || U[1]) nt = Q();
      else if (C) {
        let le = Math.hypot(q[0]-C.at[0],q[1]-C.at[1],Number.isFinite(C.at[2])?w.object.position.y-C.at[2]:0);
        if (C.onArrive && le <= C.range && (!C.target||canReach(C.target))) ft = C.onArrive, C = null;
        else {
          for (; C.path.length && Oe(q,C.path[0])<(T.layout.q01Gold ? .05 : architecture()?.contains(C.path[0][0],C.path[0][1]) ? .06 : .16)&&(!Number.isFinite(C.path[0][2])||Math.abs(w.object.position.y-C.path[0][2])<.23); ) C.path.shift();
          C.path.length ? nt = [C.path[0][0] - q[0], C.path[0][1] - q[1]] : (ft = (!C.target||canReach(C.target))?C.onArrive:null, C = null);
        }
      }
    }
    let Ft = Math.hypot(...nt), Lt = Ft > 0.035;
    if (Lt) {
      let le = nt[0] / Math.max(1, Ft), $e = nt[1] / Math.max(1, Ft), Ke = ut?.snapshot, Vn = Qt > 0 ? 9.3 : Ke ? Ke.guarding || Ke.swing !== null ? 1.65 : 3.6 : Y ? 3.8 : C ? 2.35 : 1.85, Wn = st(q, le, $e, B * Vn);
      E(w.object, Wn);
      let Oi = Oe(q, Wn);
      Oi > 1e-3 && (et = ni(q, Wn), D += Oi, D > (Y ? 1.04 : 0.83) && (D = 0, za()));
    } else mt && (et = ni(q, mt));
    let te = ut?.snapshot;
    ut && (et = ni(De(w.object.position), De(ut.rival.object.position)));
    let _e = Qt > 0 ? "evade" : te ? ut.stagger > K ? "stagger" : te.swing !== null ? "strike" : te.guarding ? "guard" : "ready" : _t && _t.until > K ? _t.posture : L ? "carry" : k ? "barefoot" : "idle";
    w.model.animate(K, Lt ? Y ? 1.45 : 1 : 0, et, _e, te?.swing ?? 0), z || (Qt = Math.max(0, Qt - B)), ft && queueMicrotask(ft);
  }
  function gt(B) {
    if (!I || z) return;
    let q = _.get(I.actor);
    if (!q) return;
    let nt = De(q.object.position), ft = De(w.object.position), Ft = I.route[I.index], Lt = Oe(nt, ft);
    if (!Ft) {
      if (Lt <= 2.55) {
        let _e = I.finish;
        I = null, C = null, queueMicrotask(_e);
      }
      return;
    }
    let te = I.actor === "field-host" && Oe(ft, Ft) < Oe(nt, Ft);
    if (I.waiting = Lt > 5.6 && !te, I.waiting) q.angle = ni(nt, ft);
    else {
      let _e = Oe(nt, Ft);
      if (_e < 0.16) I.index++;
      else {
        let le = Math.min(_e,B*(te&&Lt>4?3.65:2.35)), $e = st(nt,(Ft[0]-nt[0])/_e,(Ft[1]-nt[1])/_e,le,q.object);
        q.angle = ni(nt, $e), E(q.object, $e);
      }
    }
  }
  function bt(B, q, nt) {
    let ft = De(B.object.position), distance = Math.hypot(ft[0]-q[0],ft[1]-q[1],B.object.position.y-(w?.object.position.y??0));
    const bearing = ni(ft, q);
    const gaze = Math.atan2(Math.sin(bearing - B.angle), Math.cos(bearing - B.angle));
    B.model?.look(distance < 5.4 ? Math.max(-0.46, Math.min(0.46, gaze)) : 0);
    if (distance < 3.1) {
      if (Math.abs(gaze) > 0.76) B.angle = bearing;
      return 0;
    }
    let Lt = B.route?.[B.waypoint];
    if (z || !Lt || K < B.rest) return 0;
    let te = Oe(ft, Lt);
    if (te < 0.18 && B.routeStop && B.waypoint === B.route.length - 1) {
      B.route = null;
      B.rest = Infinity;
      return 0;
    }
    if (te < 0.18) return B.waypoint = (B.waypoint + 1) % B.route.length, B.rest = K + (B.work ? 3.4 + Math.abs(Math.sin(B.phase)) * 2.6 : 1.35 + Math.abs(B.phase) % 1.7), 0;
    let _e = st(ft, (Lt[0] - ft[0]) / te, (Lt[1] - ft[1]) / te, nt * 1.12,B.object);
    return Oe(_e, ft) < 1e-3 ? (B.waypoint = (B.waypoint + 1) % B.route.length, 0) : (B.angle = ni(ft, _e), E(B.object, _e), 0.35);
  }
  function Zt(blend) {
    const player = w.object.position;
    const cinematic = z && mt;
    const speaker = cinematic && wt ? _.get(wt) : null;
    const portrait = speaker && !speaker.still;
    w.object.visible = !portrait;
    fpActive = false;
    let origin;
    if (inspectFrame) {
      const target = inspectFrame.at, ground = groundHeight(target[0], target[1]);
      const yaw = inspectFrame.bearing, distance = inspectFrame.distance;
      o.set(target[0], ground + inspectFrame.height, target[1]);
      if(inspectFrame.camera)l.set(...inspectFrame.camera);
      else l.set(target[0] + Math.sin(yaw) * distance, ground + inspectFrame.height + distance * 0.45, target[1] + Math.cos(yaw) * distance);
      origin = inspectFrame.camera ? player : new R(target[0], ground + 0.1, target[1]);
      w.object.visible = !!inspectFrame.showPlayer;
    } else if (portrait) {
      const subject = speaker.object.position;
      const bearing = ni(De(subject), De(player)) + 0.24;
      const distance = a.aspect < 0.82 ? 3.3 : 2.65;
      const framing = Gt && (x?.clientWidth ?? 0) >= 1020 ? 0.92 : 0;
      l.set(
        subject.x + Math.sin(bearing) * distance,
        subject.y + 1.55 * speaker.object.scale.y,
        subject.z + Math.cos(bearing) * distance
      );
      o.set(
        subject.x + Math.cos(bearing) * framing,
        subject.y + 1.3 * speaker.object.scale.y,
        subject.z - Math.sin(bearing) * framing
      );
      origin = subject;
    } else if (fpMode && !cinematic) {
      fpActive = true;
      blend = 1;
      w.object.visible = false;
      const moving = !z && (U[0] || U[1] || C);
      const bob = fpBobOn && moving ? Math.sin(K * 9.2) * 0.024 : 0;
      const sway = fpBobOn && moving ? Math.cos(K * 4.6) * 0.012 : 0;
      l.set(player.x + Math.cos(G) * sway, player.y + 1.58 + bob, player.z - Math.sin(G) * sway);
      const cp = Math.cos(fpPitch);
      o.set(l.x - Math.sin(G) * cp, l.y + Math.sin(fpPitch), l.z - Math.cos(G) * cp);
      origin = player;
    } else {
      const bearing = mt ? ni(mt, [player.x, player.z]) + (cinematic ? 0.76 : 0.42) : G;
      const distance = mt ? Math.min(J, 5.8) : a.aspect < 0.82 ? J * 1.14 : J;
      const horizontal = Math.cos(lt) * distance;
      l.set(
        player.x + Math.sin(bearing) * horizontal,
        player.y + Math.sin(lt) * distance + 1,
        player.z + Math.cos(bearing) * horizontal
      );
      const focusWeight = mt ? 0.43 : 0;
      const framing = cinematic && Gt && (x?.clientWidth ?? 0) >= 1020 ? 1.48 : 0;
      o.set(
        player.x + (mt ? (mt[0] - player.x) * focusWeight : -Math.sin(G) * 1.45),
        player.y + (cinematic ? 0.66 : 1.29),
        player.z + (mt ? (mt[1] - player.z) * focusWeight : -Math.cos(G) * 1.45)
      );
      o.x += Math.cos(bearing) * framing;
      o.z -= Math.sin(bearing) * framing;
      origin = player;
    }
    if(!inspectFrame?.camera)l.y = Math.max(l.y, groundHeight(l.x, l.z) + 1.25);
    h.origin.set(origin.x, origin.y + 1.3, origin.z);
    h.direction.copy(l).sub(h.origin);
    const wanted = h.direction.length();
    h.direction.divideScalar(wanted);
    let allowed = wanted;
    if (!fpActive) {
      const probeOffsets = [[0, 0, 0], [0, 0.18, 0], [0, -0.18, 0], [0.18, 0, 0], [-0.18, 0, 0]];
      for (const volume of T.cameraVolumes) {
        if (volume.containsPoint(h.origin)) continue;
        for (const [ox, oy, oz] of probeOffsets) {
          h.origin.set(origin.x + ox, origin.y + 1.3 + oy, origin.z + oz);
          const obstruction = volume instanceof Pe ? h.intersectSphere(volume, f) : h.intersectBox(volume, f);
          if (obstruction) allowed = Math.min(allowed, Math.max(1.16, h.origin.distanceTo(obstruction) - 0.42));
        }
      }
      h.origin.set(origin.x, origin.y + 1.3, origin.z);
      if (allowed < 3.2 && !cinematic) {
        const shoulderX = Math.cos(G) * 0.35, shoulderZ = -Math.sin(G) * 0.35;
        o.x += shoulderX;
        o.z += shoulderZ;
        l.x += shoulderX;
        l.z += shoulderZ;
      }
      if (allowed < currentSpringDist) {
        currentSpringDist = Ni.lerp(currentSpringDist, allowed, Math.min(1, blend * 2.8));
      } else {
        currentSpringDist = Ni.lerp(currentSpringDist, allowed, Math.min(1, blend * 0.42));
      }
      l.copy(h.origin).addScaledVector(h.direction, currentSpringDist);
    } else {
      currentSpringDist = allowed;
    }
    let fill = y.userData.portraitFill;
    if (portrait && !fill) {
      fill = new vs(16770245, 0.56);
      y.add(fill, fill.target);
      y.userData.portraitFill = fill;
    }
    if (fill) {
      fill.visible = Boolean(portrait);
      fill.position.copy(l);
      fill.target.position.copy(o);
    }
    const fov = fpActive ? 71 : 51;
    if (a.fov !== fov) {
      a.fov = fov;
      a.updateProjectionMatrix();
    }
    const trackedCamera=inspectFrame?.cameraTracking?{x:a.position.x,y:a.position.y,z:a.position.z}:null;
    a.position.lerp(l, blend);
    if(architecture()) {
      const eye={x:player.x,y:player.y+1.45,z:player.z},clipped=architecture().camera(trackedCamera||eye,a.position);
      a.position.set(clipped.x,clipped.y,clipped.z);
      if(!fpActive&&!inspectFrame?.showPlayer&&Math.hypot(clipped.x-eye.x,clipped.y-eye.y,clipped.z-eye.z)<1.05)w.object.visible=false;
    }
    a.lookAt(o);
    a.updateMatrixWorld();
  }
  function ce(B) {
    if ($ = 0, V || X || !x?.isConnected || !y || ($ = requestAnimationFrame(ce), document.hidden || B < Wt)) return;
    Wt = B + (n ? 29 : 15);
    let q = xt ? B - xt : 16, nt = Math.min(0.085, q / 1e3);
    rt = q > 125 ? rt + 1 : Math.max(0, rt - 2), rt >= 36 && at > 0.74 && QMode !== "ultra" && (at *= 0.88, rt = 0, ge()), xt = B, K += nt, Tt(nt), gt(nt), Dt(nt);
    for (let [ft, Ft] of _) {
      if (!Ft.object.visible || ft.startsWith("role-") || (e && Ft.object.userData.animate?.(K), !Ft.model || Ft.still || Ft === ut?.rival)) continue;
      let Lt = I?.actor === ft, te = Lt ? I.waiting || z ? 0 : 0.56 : bt(Ft, De(w.object.position), nt), _e = Ft.work && !Lt && te === 0 && Ft.rest > K && Oe(De(w.object.position), De(Ft.object.position)) > 3.5;
      Ft.model.animate(K + Ft.phase, te, Ft.angle, wt === ft ? "talk" : _e ? "tend" : Ft.pose);
    }
    if (e && (T.dust.rotation.y = Math.sin(K * 0.19) * 0.07, T.dust.position.y = Math.sin(K * 0.8) * 0.09, T.animate(K)), Vt) {
      let ft = Math.max(0, K - Vt.at);
      Vt.points.visible = e && ft < 0.31, Vt.points.visible && (Vt.points.scale.setScalar(0.35 + ft * 5.2), Vt.points.material.opacity = 0.92 * (1 - ft / 0.31));
    }
    Zt(e ? 1 - Math.exp(-nt * 11) : 1), !n && i.shadowMap.enabled && K >= (T.nextShadow ?? 0) && (T.refreshShadows(), T.nextShadow = K + (pp?.isSoftware ? 0.25 : 0.08)), WitnessGraphics.followShadow(bn, T.sun, w?.object?.position, a), pp ? pp.render(y, a, T.sun, T.night) : i.render(y, a), x.dataset.ready = "true", At(B);
  }
  function pt(B, q, nt = false) {
    U = [B, q], Y = nt, (B || q) && (C = null);
  }
  function jt(B, q, nt) {
    let ft = _.get(B), Ft = eg(q);
    if (!ft?.model || !Ft || I || ut || z || Oe(De(w.object.position), De(ft.object.position)) > 3) return false;
    C = null, Qt = 0, w.model.arm(true), ft.model.arm(true), yt || (yt = new be(new ir(5.9, 5.96, 80), new rn({ color: 15122295, transparent: true, opacity: 0.68, side: Mn, depthWrite: false })), yt.rotation.x = -Math.PI / 2, y.add(yt));
    let Lt = De(ft.object.position);
    return yt.position.set(Lt[0], groundHeight(...Lt) + 0.13, Lt[1]), yt.visible = true, ut = { rival: ft, trial: Ft, at: Lt, complete: nt, snapshot: Ft.state(), stagger: 0, recoil: 0 }, true;
  }
  function ae() {
    ut && (ut.rival.model.arm(false), E(ut.rival.object, ut.at), w.model.arm(false), yt.visible = false, ut = null, Qt = 0);
  }
  function Dt(B) {
    if (!ut || z) return;
    let { trial: q, rival: nt, complete: ft, at: Ft } = ut, Lt = De(w.object.position);
    if (Oe(Lt, Ft) > 8.8) {
      ae(), queueMicrotask(() => ft({ won: false, left: true }));
      return;
    }
    let te = De(nt.object.position), _e = Oe(te, Lt), le = q.advance(B, _e);
    le.sequence !== ut.snapshot.sequence && ["parry", "block", "hit", "hurt"].includes(le.event) && (xr("impact"), le.event === "hit" && (ut.recoil = K + 0.26), le.event === "hurt" && (ut.stagger = K + 0.3), e && ye(Lt, te, le.event === "parry" ? 16777143 : 15845254)), ut.snapshot = le;
    let $e = _e > 2 && le.approachSpeed ? le.approachSpeed : 0;
    if ($e) {
      let Wn = Math.min(_e - 1.84, B * $e), Oi = st(te, (Lt[0] - te[0]) / _e, (Lt[1] - te[1]) / _e, Wn,nt.object);
      E(nt.object, Oi);
    }
    nt.angle = ni(te, Lt);
    let Ke = le.phase === "recover" && le.phaseProgress < 0.21, Vn = ut.recoil > K ? "stagger" : le.phase === "windup" ? "windup-" + le.pose : Ke ? le.pose === "sweep" ? "sweep" : "strike" : "ready";
    if (nt.model.animate(K, $e ? 0.53 : 0, nt.angle, Vn, Ke ? le.phaseProgress * 4.76 : le.phaseProgress), le.outcome) {
      let Wn = le.outcome;
      ae(), queueMicrotask(() => ft(Wn));
    }
  }
  function ye(B, q, nt) {
    if (!Vt) {
      let Ft = [];
      for (let _e = 0; _e < 14; _e++) {
        let le = _e * 2.4;
        Ft.push(Math.cos(le) * (0.25 + _e % 3 * 0.09), (_e % 5 - 2) * 0.18, Math.sin(le) * 0.31);
      }
      let Lt = new se().setAttribute("position", new Ot(Ft, 3)), te = new Ai(Lt, new fi({ map: T.shadow, color: nt, size: 0.14, transparent: true, depthWrite: false, blending: Ss }));
      y.add(te), Vt = { points: te, at: K };
    }
    let ft = [(B[0] + q[0]) / 2, (B[1] + q[1]) / 2];
    Vt.points.position.set(ft[0], groundHeight(...ft) + 1.3, ft[1]), Vt.points.material.color.setHex(nt), Vt.at = K;
  }
  function qe(B, q = true) {
    if (!w || z) return false;
    if (B !== "dodge") return ut?.trial.command(B, q) ?? false;
    if (Qt || (ut ? !ut.trial.command("dodge") : K < F)) return false;
    let nt = Q(), ft = Math.hypot(...nt), Ft = ut ? ni(De(w.object.position), De(ut.rival.object.position)) : et;
    return Te = ft > 0.14 ? nt.map((Lt) => Lt / ft) : [-Math.sin(Ft), -Math.cos(Ft)], Qt = 0.34, F = K + 0.84, C = null, true;
  }
  function vi(B = false) {
    if (z || ut) return null;
    let q = De(w.object.position), nt = P.filter((ft) => ft.unread && (!B || ft.water) && Oe(q, ft.at) < 20).sort((ft, Ft) => Oe(q, ft.at) - Oe(q, Ft.at))[0];
    return nt ? (re = { id: nt.id, at: nt.at, until: K + 6 }, xr("read"), nt) : null;
  }
  function tc(B) {
    let q = r.getBoundingClientRect();
    d.set((B.clientX - q.left) / q.width * 2 - 1, 1 - (B.clientY - q.top) / q.height * 2), u.setFromCamera(d, a);
    const ar=architecture();
    let nt = ar?u.intersectObjects([T.floor,ar.group],true).find(hit=>hit.face?.normal.y>.6):u.intersectObject(T.floor,false)[0];
    if (!nt) return;
    let ft = [Iu(nt.point.x, dn.left, dn.right), Iu(nt.point.z, dn.far, dn.near)];
    const support=ar?.supports(...ft).find(p=>Math.abs(p.y-nt.point.y)<.23);
    N(ft,null,.3,support?{at:ft,floorY:support.y,surfaceId:support.supportId,range:.3}:null) || s.unreachable();
  }
  r.addEventListener("pointerdown", (B) => {
    if (!y || z) return;
    if (fpMode && B.pointerType === "mouse") {
      ht = { id: B.pointerId, x: B.clientX, y: B.clientY, travel: 0 };
      try {
        document.pointerLockElement !== r && r.requestPointerLock?.()?.catch?.(() => {
        });
      } catch {
      }
      return;
    }
    ht = { id: B.pointerId, x: B.clientX, y: B.clientY, travel: 0 }, r.setPointerCapture(B.pointerId);
  }), r.addEventListener("pointermove", (B) => {
    if (z) return;
    if (fpMode && document.pointerLockElement === r) {
      G -= B.movementX * 32e-4, fpPitch = Iu(fpPitch - B.movementY * 32e-4, -1.25, 1.35);
      return;
    }
    if (ht?.id !== B.pointerId) return;
    let q = B.clientX - ht.x, nt = B.clientY - ht.y;
    ht.travel += Math.hypot(q, nt), ht.travel > 4 && (G -= q * 75e-4, fpMode ? fpPitch = Iu(fpPitch - nt * 53e-4, -1.25, 1.35) : lt = Iu(lt + nt * 53e-4, 0.21, 0.83)), ht.x = B.clientX, ht.y = B.clientY;
  }), r.addEventListener("pointerup", (B) => {
    let q = ht?.id === B.pointerId && ht.travel < 5 && document.pointerLockElement !== r;
    ht = null, q && !z && !ut && tc(B);
  }), r.addEventListener("pointercancel", () => {
    ht = null;
  }), r.addEventListener("contextmenu", (B) => B.preventDefault()), r.addEventListener("wheel", (B) => {
    z || (B.preventDefault(), fpMode || (J = Iu(J + B.deltaY * 5e-3, 5.1, 12)));
  }, { passive: false }), r.addEventListener("webglcontextlost", (B) => {
    B.preventDefault(), X = true, cancelAnimationFrame($), $ = 0, s.lost();
  }), r.addEventListener("webglcontextrestored", () => {
    X = false, x?.isConnected && !$ && ($ = requestAnimationFrame(ce)), s.restored();
  });
  function za() {
    if (!vt || !kt) return;
    let B = kt.createOscillator(), q = kt.createGain(), nt = kt.currentTime;
    B.type = "triangle", B.frequency.setValueAtTime(94, nt), B.frequency.exponentialRampToValueAtTime(42, nt + 0.084), q.gain.setValueAtTime(0.025, nt), q.gain.exponentialRampToValueAtTime(1e-4, nt + 0.09), B.connect(q).connect(kt.destination), B.start(nt), B.stop(nt + 0.1);
  }
  function xr(B = "read") {
    if (!vt || !kt) return;
    if (B === "impact") {
      Bt?.strike();
      return;
    }
    (B === "finish" ? [293.66, 392, 440, 587.33] : B === "walk" ? [293.66, 392] : [440, 523.25]).forEach((nt, ft) => {
      let Ft = kt.currentTime + ft * 0.105, Lt = kt.createOscillator(), te = kt.createGain();
      Lt.type = "sine", Lt.frequency.value = nt, te.gain.setValueAtTime(1e-4, Ft), te.gain.exponentialRampToValueAtTime(0.042, Ft + 0.028), te.gain.exponentialRampToValueAtTime(1e-4, Ft + 0.65), Lt.connect(te).connect(kt.destination), Lt.start(Ft), Lt.stop(Ft + 0.66);
    });
  }
  async function ec() {
    if (!kt) {
      let B = window.AudioContext ?? window.webkitAudioContext;
      if (!B) return false;
      kt = new B(), Bt = ng(kt), Bt.setBiome(T.layout.biome);
    }
    return vt = !vt, Bt.enable(vt), vt && (await kt.resume(), xr("walk")), vt;
  }
  return { inspect(at2, options = {}) {
    if (!Array.isArray(at2) || at2.length !== 2 || !at2.every(Number.isFinite)) return;
    inspectFrame = { at: [...at2], height: Number.isFinite(options.height) ? options.height : 0.85, distance: Math.max(1.6, Math.min(5, Number(options.distance) || 2.8)), bearing: Number.isFinite(options.bearing) ? options.bearing : 0.65 };
    // Local cinematic framing still uses the normal swept camera clearance.
    // It cannot move the avatar or open a target across the scene.
    if(Array.isArray(options.camera)&&options.camera.length===3&&options.camera.every(Number.isFinite)&&w&&Math.hypot(options.camera[0]-w.object.position.x,options.camera[1]-w.object.position.y,options.camera[2]-w.object.position.z)<=10){inspectFrame.camera=[...options.camera];inspectFrame.showPlayer=!!options.showPlayer;inspectFrame.cameraTracking=!!options.cameraTracking;}
    z = true;
    U = [0, 0];
    C = null;
  }, spatial, restoreSpatial(saved) {
    if(!w)return null;
    const ar=architecture();if(ar){const p=ar.restore(saved,spatial());E(w.object,[p.x,p.z,p.y,p.supportId]);C=null;Zt(1);}return spatial();
  }, walkTarget(id,onArrive,range=1.6) {const target=P.find(t=>t.id===id);return target?N(tt(target),onArrive,range,target):false;},
  navigationState(){return C?{goal:[...C.at],waypoints:C.path.slice(0,8).map(p=>[...p]),range:C.range}:null;},
  cameraState(){return {position:{x:a.position.x,y:a.position.y,z:a.position.z},look:{x:o.x,y:o.y,z:o.z},view:fpMode?'first':'third'};},
  collisionAt(x,z){return !Ut(x,z);},
  load: W, mount: Mt, suspend: Re, update: St, setRole: dt, walk: N, controls: pt, nearest: it, toggleSound: ec, cue: xr, sense: vi, startTrial: jt, stopTrial: ae, action: qe, inTrial() {
    return !!ut;
  }, rotate(B) {
    G += B;
  }, view(B, q) {
    fpMode = B === "first", fpPitch = 0, fpBobOn = !!q?.bob, !fpMode && document.pointerLockElement === r && document.exitPointerLock?.();
  }, pitch(B) {
    fpMode ? fpPitch = Iu(fpPitch + B, -1.25, 1.35) : lt = Iu(lt - B, 0.21, 0.83);
  }, recenter() {
    G = et - Math.PI, lt = 0.35, J = 7.7, fpPitch = 0;
  }, at() {
    return w ? De(w.object.position) : null;
  }, locate(B) {
    let q = _.get(B);
    return q?.object.visible ? De(q.object.position) : null;
  }, within(B) {
    let q = P.find((nt) => nt.id === B);
    return !!(w && q && canReach(q));
  }, focus(B = null) {
    mt = B;
  }, pause(B, q = null, nt = {}) {
    inspectFrame = null;
    z = B, mt = q, Gt = !!(B && nt.aside), wt = B ? nt.actor : null, B && (U = [0, 0], C = null, ut?.trial.command("guard", false), document.pointerLockElement === r && document.exitPointerLock?.());
  }, pose(B) {
    _t = { posture: B, until: K + 1.6 };
  }, startGuide(B, q, nt) {
    return !_.get(B) || q.length < 2 ? false : (C = null, I = { actor: B, index: 1, route: q, finish: nt, waiting: false }, true);
  }, stopGuide() {
    if (!I) return;
    let B = _.get(I.actor);
    B && E(B.object, B.position), I = null, C = null;
  }, stop() {
    V = true, Re(), y && (y.traverse((o2) => o2.userData?.disposeWater?.()), ig(y)), pp?.dispose(), i.dispose(), kt?.close();
  }, setQuality(q) {
    QMode = q === "balanced" || q === "high" || q === "ultra" ? q : t ? "high" : "ultra", n = t && QMode === "balanced", i.shadowMap.enabled = !n, pp?.setQuality(QMode), globalThis.WitnessGraphics?.setQuality?.(QMode), ge(), T?.refreshShadows();
  } };
}
