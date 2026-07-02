"use client";

/**
 * Spine3D — 3B omurga sahnesi (React Three Fiber).
 *  A: helis omurga tüpü (düğüm-renk vertex gradyanı) + düğümler + parçacıklar + Bloom
 *  B: tıklanabilir düğümler; kamera dalışı (onDiveComplete → monitör panel)
 *  C: sinematik giriş uçuşu + grain + vignette (+ desktop kromatik aberasyon)
 *  D: DOM etiketleri 3B düğümlere yapışık (her frame world→screen projeksiyonu)
 *  E: fbm duman + döngüsel şimşek patlamaları; bazen GERÇEKÇİ ince şimşek
 *     (çok-frekanslı kırık kanal + hale + uçta dağılan zayıf dallar)
 *  F: YILDIRIM VURUŞU — sayfa başına 1 kez: omurga sönük doğar; giriş uçuşu
 *     bitince ~2 sn sonra kök düğümün altına keskin 3B yıldırım çakar; enerji
 *     taşması (parlak) → normale stabilize; vuruş noktasından hafif parçacık
 *     saçılması; gövdede kalıcı yanık izi (sayfa yenilenene dek).
 *     prefers-reduced-motion: sönük doğuş + vuruş atlanır.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { NODES } from "./spineData";

const H = 64;
const CAM_Z = 13.5;
const STRIKE_T = 0.07; // eğri üzerinde vuruş noktası (kökün biraz altı)

function buildCurve() {
  const pts = [];
  const N = 140;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = H / 2 - t * H;
    const ang = t * Math.PI * 2.4;
    const rad = 2.2 + Math.sin(t * Math.PI) * 1.5;
    pts.push(new THREE.Vector3(Math.cos(ang) * rad * 0.75, y, Math.sin(ang) * rad * 0.75));
  }
  return new THREE.CatmullRomCurve3(pts);
}

/* ---- Duman + şimşek arka planı ---- */
const SMOKE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SMOKE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime; uniform float uFlash; uniform vec2 uFlashPos; uniform float uOct;
  uniform float uBolt; uniform float uSeed;
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { if (float(i) >= uOct) break; v += a * noise(p); p *= 2.03; a *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = vUv;
    float t = uTime * 0.02;
    float n = fbm(uv * 3.0 + vec2(t, -t * 0.6));
    n = fbm(uv * 2.2 + n * 0.9 + vec2(-t * 0.7, t * 0.4));
    vec3 smoke = mix(vec3(0.010, 0.011, 0.026), vec3(0.045, 0.05, 0.095), n);
    // patlama: yumuşak bulut-içi parlama (boyut sabit)
    float d = distance(uv, uFlashPos);
    float glow = exp(-d * d * 14.0) * uFlash;
    smoke += vec3(0.45, 0.5, 0.92) * glow * (0.35 + 0.65 * n);
    // GERÇEKÇİ ince şimşek (bazen): çok-frekanslı kırık kanal + hale + uç dalları
    float tt = (uFlashPos.y - uv.y) / 0.14;
    float m = step(0.0, tt) * step(tt, 1.0);
    float j1 = noise(vec2(uSeed * 37.0 + tt * 26.0, tt * 61.0)) - 0.5;
    float j2 = noise(vec2(uSeed * 11.0 + tt * 83.0, tt * 147.0)) - 0.5;
    float bx = uFlashPos.x + (j1 * 0.028 + j2 * 0.012) * (0.3 + tt);
    float dx = abs(uv.x - bx);
    float ch = (exp(-dx * 2600.0) + exp(-dx * 260.0) * 0.30) * (1.0 - tt * 0.85) * m;
    // uçta elektron dağılması: iki zayıf dal
    float b1 = (tt - 0.55) / 0.45;
    float m1 = step(0.0, b1) * step(b1, 1.0);
    float x1 = bx + b1 * 0.02 + (noise(vec2(uSeed * 53.0 + b1 * 90.0, b1 * 40.0)) - 0.5) * 0.012;
    ch += (exp(-abs(uv.x - x1) * 3000.0) + exp(-abs(uv.x - x1) * 400.0) * 0.2) * (1.0 - b1) * 0.5 * m1 * m;
    float b2 = (tt - 0.7) / 0.3;
    float m2 = step(0.0, b2) * step(b2, 1.0);
    float x2 = bx - b2 * 0.016 + (noise(vec2(uSeed * 29.0 + b2 * 70.0, b2 * 120.0)) - 0.5) * 0.010;
    ch += (exp(-abs(uv.x - x2) * 3000.0) + exp(-abs(uv.x - x2) * 400.0) * 0.2) * (1.0 - b2) * 0.45 * m2 * m;
    smoke += vec3(0.8, 0.85, 1.0) * ch * uBolt * 0.6;
    gl_FragColor = vec4(smoke, 1.0);
  }
`;

function Smoke({ isMobile, strikeSignal }) {
  const mat = useRef();
  const mesh = useRef();
  const flash = useRef({ v: 0, bolt: 0, seed: 1, next: 4 + Math.random() * 8, pos: new THREE.Vector2(0.5, 0.6) });
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uFlashPos: { value: new THREE.Vector2(0.5, 0.6) },
    uBolt: { value: 0 },
    uSeed: { value: 1 },
    uOct: { value: isMobile ? 2 : 4 },
  }), [isMobile]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) mesh.current.position.y = state.camera.position.y - 10;
    const f = flash.current;
    // Yıldırım vuruşu: dumanı da aynı anda büyük çaktır (atmosfer)
    const sig = strikeSignal && strikeSignal.current;
    if (sig && sig.fired && !sig.done) {
      sig.done = true;
      f.v = 1.5;
      f.bolt = 0;
      const uy = THREE.MathUtils.clamp((sig.worldY - (state.camera.position.y - 10) + 100) / 200, 0.05, 0.95);
      f.pos.set(0.5, uy);
      f.next = t + 8 + Math.random() * 8;
    } else if (t > f.next) {
      f.v = 0.85 + Math.random() * 0.6;
      const isBolt = Math.random() < 0.38;
      f.bolt = isBolt ? 0.6 + Math.random() * 0.4 : 0;
      f.seed = Math.random() * 10;
      if (isBolt) f.pos.set(0.4 + Math.random() * 0.2, 0.5 + Math.random() * 0.12);
      else f.pos.set(0.15 + Math.random() * 0.7, 0.3 + Math.random() * 0.55);
      f.next = t + 7 + Math.random() * 12;
    }
    f.v = Math.max(0, f.v - delta * 2.4);
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uFlash.value = f.v;
      mat.current.uniforms.uFlashPos.value.copy(f.pos);
      mat.current.uniforms.uBolt.value = f.v * f.bolt;
      mat.current.uniforms.uSeed.value = f.seed;
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -26]} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[220, 200]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={SMOKE_VERT} fragmentShader={SMOKE_FRAG}
        depthWrite={false} depthTest={false} />
    </mesh>
  );
}

/* ---- FAZ F: keskin 3B yıldırım (tek vuruş) ---- */
function jaggedPath(start, end, segments, amp) {
  const pts = [];
  for (let i = 0; i < segments; i++) {
    const ti = i / (segments - 1);
    const p = start.clone().lerp(end, ti);
    const a = amp * (0.35 + Math.sin(ti * Math.PI)) * (1 - ti * 0.5);
    if (i > 0 && i < segments - 1) {
      p.x += (Math.random() - 0.5) * a;
      p.z += (Math.random() - 0.5) * a * 0.7;
    }
    pts.push(p);
  }
  const path = new THREE.CurvePath();
  for (let i = 0; i < pts.length - 1; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
  return { path, pts };
}

function LightningStrike({ world, t0 }) {
  const coreMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(2.4, 2.6, 3.4), transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);
  const branchMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.7, 1.9, 2.8), transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  }), []);

  const { mainGeo, branchGeos } = useMemo(() => {
    const end = world.clone();
    const start = end.clone().add(new THREE.Vector3(
      (Math.random() < 0.5 ? -1 : 1) * (1.6 + Math.random() * 1.8),
      21 + Math.random() * 4,
      (Math.random() - 0.5) * 1.5
    ));
    const { path, pts } = jaggedPath(start, end, 17, 1.15);
    const mainGeo = new THREE.TubeGeometry(path, 32, 0.035, 5, false);
    const branchGeos = [0.42, 0.66].map((bt) => {
      const bi = Math.floor(bt * (pts.length - 1));
      const bStart = pts[bi].clone();
      const dir = new THREE.Vector3(
        (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.5), -1, (Math.random() - 0.5) * 0.6
      ).normalize();
      const bEnd = bStart.clone().addScaledVector(dir, 2.2 + Math.random() * 1.6);
      const { path: bp } = jaggedPath(bStart, bEnd, 6, 0.35);
      return new THREE.TubeGeometry(bp, 10, 0.018, 4, false);
    });
    return { mainGeo, branchGeos };
  }, [world]);

  useFrame((state) => {
    const age = state.clock.elapsedTime - t0;
    let o = 0;
    if (age < 0.07) o = 1;                                  // ilk çakma
    else if (age < 0.11) o = 0.12;                          // kısa kesinti (flicker)
    else if (age < 0.17) o = 1;                             // ikinci çakma
    else if (age < 0.46) o = Math.max(0, 1 - (age - 0.17) / 0.29); // sönüm
    coreMat.opacity = o;
    branchMat.opacity = o * 0.75;
  });

  return (
    <group>
      <mesh geometry={mainGeo} material={coreMat} />
      {branchGeos.map((g, i) => <mesh key={i} geometry={g} material={branchMat} />)}
    </group>
  );
}

/* ---- Vuruş noktasından hafif parçacık saçılması ---- */
function ImpactBurst({ t0 }) {
  const N = 110;
  const ref = useRef();
  const matRef = useRef();
  const { dirs, speeds, positions } = useMemo(() => {
    const dirs = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    const v = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      v.randomDirection();
      dirs[i * 3] = v.x; dirs[i * 3 + 1] = v.y; dirs[i * 3 + 2] = v.z;
      speeds[i] = 0.5 + Math.random();
    }
    return { dirs, speeds, positions: new Float32Array(N * 3) };
  }, []);

  useFrame((state) => {
    const age = state.clock.elapsedTime - t0;
    const k = 1 - Math.exp(-age * 2.0); // yavaşlayarak açıl
    const fade = Math.max(0, 1 - age / 1.8);
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position;
      for (let i = 0; i < N; i++) {
        const r = speeds[i] * k * 1.5;
        pos.array[i * 3] = dirs[i * 3] * r;
        pos.array[i * 3 + 1] = dirs[i * 3 + 1] * r * 0.9;
        pos.array[i * 3 + 2] = dirs[i * 3 + 2] * r;
      }
      pos.needsUpdate = true;
      ref.current.visible = fade > 0;
    }
    if (matRef.current) matRef.current.opacity = 0.85 * fade;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={N} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial ref={matRef} size={0.06} color={new THREE.Color(1.6, 1.7, 2.2)} transparent opacity={0.85}
        depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
    </points>
  );
}

function Scene({ progressRef, diveRef, onDiveComplete, onNodeClick, labelRefs, strikeSignal, isMobile, reduce }) {
  const curve = useMemo(buildCurve, []);
  const groupRef = useRef();
  const nodeRefs = useRef([]);
  const { camera } = useThree();
  const [hover, setHover] = useState(-1);
  const [strike, setStrike] = useState(null); // { t0, local, world }

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const lookCur = useMemo(() => new THREE.Vector3(0, H / 2, 0), []);
  const lookWant = useMemo(() => new THREE.Vector3(0, H / 2, 0), []);
  const introRef = useRef(!reduce);
  const introStart = useRef(-1);
  const firedRef = useRef(-1);
  const strikeAtRef = useRef(-1); // giriş bitince + 2 sn
  const tubeMat = useRef();
  const particleMat = useRef();
  const nodeMats = useRef([]);
  const baseCols = useMemo(() => NODES.map((n) => new THREE.Color(n.color)), []);

  const tube = useMemo(() => {
    const g = new THREE.TubeGeometry(curve, isMobile ? 130 : 260, 0.055, 8, false);
    const pos = g.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const cTmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const tt = THREE.MathUtils.clamp((H / 2 - pos.getY(i)) / H, 0, 1);
      const f = tt * (baseCols.length - 1);
      const a = Math.floor(f);
      const b = Math.min(a + 1, baseCols.length - 1);
      cTmp.copy(baseCols[a]).lerp(baseCols[b], f - a);
      colors[i * 3] = cTmp.r; colors[i * 3 + 1] = cTmp.g; colors[i * 3 + 2] = cTmp.b;
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [curve, isMobile, baseCols]);

  const nodePts = useMemo(
    () => NODES.map((n, i) => curve.getPoint(i / (NODES.length - 1))),
    [curve]
  );
  const particles = useMemo(() => {
    const count = isMobile ? 1100 : 3200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = curve.getPoint(Math.random());
      arr[i * 3] = p.x + THREE.MathUtils.randFloatSpread(3.4);
      arr[i * 3 + 1] = p.y + THREE.MathUtils.randFloatSpread(3.4);
      arr[i * 3 + 2] = p.z + THREE.MathUtils.randFloatSpread(3.4);
    }
    return arr;
  }, [curve, isMobile]);

  useEffect(() => {
    document.body.style.cursor = hover >= 0 ? "pointer" : "";
    return () => { document.body.style.cursor = ""; };
  }, [hover]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.05);
    const p = (progressRef && progressRef.current) || 0;
    const dive = diveRef && diveRef.current;
    const diving = !!(dive && dive.active && nodeRefs.current[dive.index]);
    const camY = H / 2 - p * H;

    if (!diving && groupRef.current) {
      const rotTarget = t * 0.045 + p * Math.PI * 1.3;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, rotTarget, 3, d);
    }

    if (introRef.current) {
      if (introStart.current < 0) introStart.current = t;
      const k = Math.min((t - introStart.current) / 2.4, 1);
      const e = 1 - Math.pow(1 - k, 3);
      camera.position.set(0, H / 2 + 26 - e * 26, 46 - e * (46 - CAM_Z));
      lookWant.set(0, H / 2 - 3 * e, 0);
      if (k >= 1) {
        introRef.current = false;
        if (!reduce && strikeAtRef.current < 0) strikeAtRef.current = t + 1.0; // vuruş zamanı
      }
    } else if (diving) {
      nodeRefs.current[dive.index].getWorldPosition(tmp);
      target.copy(camera.position).sub(tmp).setLength(2.6).add(tmp);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 3.4, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 3.4, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 3.4, d);
      lookWant.copy(tmp);
      if (firedRef.current !== dive.index && camera.position.distanceTo(target) < 0.22) {
        firedRef.current = dive.index;
        if (onDiveComplete) onDiveComplete(dive.index);
      }
    } else {
      if (firedRef.current >= 0) firedRef.current = -1;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 2.5, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 2.5, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, CAM_Z, 2.5, d);
      lookWant.set(0, camY - 3, 0);
    }
    lookCur.x = THREE.MathUtils.damp(lookCur.x, lookWant.x, 3.2, d);
    lookCur.y = THREE.MathUtils.damp(lookCur.y, lookWant.y, 3.2, d);
    lookCur.z = THREE.MathUtils.damp(lookCur.z, lookWant.z, 3.2, d);
    camera.lookAt(lookCur);

    // FAZ F: vuruş tetikleme
    if (!strike && strikeAtRef.current > 0 && t >= strikeAtRef.current && groupRef.current) {
      const local = curve.getPoint(STRIKE_T);
      const world = groupRef.current.localToWorld(local.clone());
      setStrike({ t0: t, local, world });
      if (strikeSignal) strikeSignal.current = { fired: true, done: false, worldY: world.y };
    }

    // FAZ F: enerji zarfı — sönük → taşma → normale stabilize
    let energy;
    if (reduce) energy = 1;
    else if (!strike) energy = 0.35;
    else {
      const age = t - strike.t0;
      energy = age < 0.12
        ? THREE.MathUtils.lerp(0.35, 1.7, age / 0.12)
        : 1 + 0.7 * Math.exp(-(age - 0.12) * 1.1);
    }
    if (tubeMat.current) tubeMat.current.color.setScalar(Math.min(energy, 1.7));
    if (particleMat.current) particleMat.current.opacity = 0.55 * Math.min(energy, 1);
    for (let i = 0; i < nodeMats.current.length; i++) {
      const m = nodeMats.current[i];
      if (m) m.color.copy(baseCols[i]).multiplyScalar(Math.min(energy, 1.5));
    }

    // FAZ D: etiket projeksiyonu
    if (labelRefs && labelRefs.current) {
      const W = state.size.width, Hs = state.size.height;
      for (let i = 0; i < NODES.length; i++) {
        const mesh = nodeRefs.current[i];
        const el = labelRefs.current[i];
        if (!mesh || !el) continue;
        mesh.getWorldPosition(proj);
        const dist = camera.position.distanceTo(proj);
        proj.project(camera);
        const behind = proj.z > 1;
        const x = (proj.x * 0.5 + 0.5) * W;
        const y = (-proj.y * 0.5 + 0.5) * Hs;
        const s = THREE.MathUtils.clamp(CAM_Z / Math.max(dist, 0.001), 0.6, 1.15);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -36px) scale(${s.toFixed(3)})`;
        el.style.opacity = behind || Math.abs(proj.y) > 1.35 ? "0" : "1";
      }
    }
  });

  return (
    <>
      <Smoke isMobile={isMobile} strikeSignal={strikeSignal} />
      <group ref={groupRef}>
        <mesh geometry={tube}>
          <meshBasicMaterial ref={tubeMat} vertexColors color="#ffffff" toneMapped={false} transparent opacity={0.9} />
        </mesh>

        {nodePts.map((pos, i) => (
          <group key={i} position={pos} ref={(el) => (nodeRefs.current[i] = el)}>
            <mesh
              onClick={(e) => { e.stopPropagation(); if (onNodeClick) onNodeClick(i); }}
              onPointerOver={(e) => { e.stopPropagation(); setHover(i); }}
              onPointerOut={() => setHover(-1)}
            >
              <sphereGeometry args={[0.75, 10, 10]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
            <mesh scale={hover === i ? 1.5 : 1}>
              <sphereGeometry args={[0.3, 16, 16]} />
              <meshBasicMaterial ref={(m) => (nodeMats.current[i] = m)} color={NODES[i].color} toneMapped={false} />
            </mesh>
          </group>
        ))}

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial ref={particleMat} size={0.07} color="#9aa6e6" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
        </points>

        {/* FAZ F: kalıcı yanık izi + kor + vuruş saçılması (gövdeyle döner) */}
        {strike && (
          <group position={strike.local}>
            <mesh>
              <sphereGeometry args={[0.10, 12, 12]} />
              <meshBasicMaterial color="#0b0b12" toneMapped={false} />
            </mesh>
            <mesh>
              <sphereGeometry args={[0.13, 12, 12]} />
              <meshBasicMaterial color={new THREE.Color(0.9, 0.35, 0.15)} transparent opacity={0.28}
                blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
            </mesh>
            <ImpactBurst t0={strike.t0} />
          </group>
        )}
      </group>

      {/* FAZ F: keskin yıldırım — dünya uzayında (gökten iner) */}
      {strike && <LightningStrike world={strike.world} t0={strike.t0} />}
    </>
  );
}

export default function Spine3D({ progressRef, diveRef, onDiveComplete, onNodeClick, labelRefs, isMobile = false, reduce = false }) {
  const strikeSignal = useRef({ fired: false, done: true, worldY: 0 });
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
      <Canvas
        camera={{ position: [0, H / 2 + 26, 46], fov: 55, near: 0.1, far: 240 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.75]}
      >
        <fog attach="fog" args={["#06060b", 16, 72]} />
        <Scene progressRef={progressRef} diveRef={diveRef} onDiveComplete={onDiveComplete}
          onNodeClick={onNodeClick} labelRefs={labelRefs} strikeSignal={strikeSignal}
          isMobile={isMobile} reduce={reduce} />
        {isMobile ? (
          <EffectComposer multisampling={0}>
            <Bloom intensity={1.15} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur radius={0.55} />
            <Vignette offset={0.18} darkness={0.85} />
          </EffectComposer>
        ) : (
          <EffectComposer multisampling={0}>
            <Bloom intensity={1.5} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur radius={0.72} />
            <ChromaticAberration offset={[0.0007, 0.0007]} />
            <Noise premultiply opacity={0.07} />
            <Vignette offset={0.18} darkness={0.85} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
