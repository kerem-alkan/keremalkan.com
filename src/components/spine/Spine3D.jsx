"use client";

/**
 * Spine3D — 3B omurga sahnesi (React Three Fiber).
 *  A: helis omurga tüpü + düğüm küreleri + additive parçacıklar + Bloom
 *  B: düğümler tıklanabilir; tıklayınca kamera düğüme dalar (onDiveComplete → monitör panel)
 *  C: sinematik giriş uçuşu + grain + vignette (+ desktop kromatik aberasyon)
 *  D: DOM etiketleri 3B düğümlere YAPIŞIK — her frame world→screen projeksiyonu
 *     labelRefs'e yazılır (tek doğruluk kaynağı 3B sahne; sürüklenme/sıçrama yok)
 *  E: fbm duman arka planı + nadir şimşek patlamaları (bloom doğal güçlendirir)
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { NODES } from "./spineData";

const H = 64;
const CAM_Z = 13.5;

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

/* ---- Duman + şimşek arka planı (kameraya bağlı dev quad, fbm noise) ---- */
const SMOKE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const SMOKE_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime; uniform float uFlash; uniform vec2 uFlashPos; uniform float uOct;
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
    n = fbm(uv * 2.2 + n * 0.9 + vec2(-t * 0.7, t * 0.4)); // domain warp → duman
    vec3 smoke = mix(vec3(0.010, 0.011, 0.026), vec3(0.045, 0.05, 0.095), n);
    // şimşek: duman yoğunluğuyla modüle edilmiş yumuşak parlama (bulut içi ışık)
    float d = distance(uv, uFlashPos);
    float glow = exp(-d * d * 14.0) * uFlash;
    smoke += vec3(0.45, 0.5, 0.92) * glow * (0.35 + 0.65 * n);
    gl_FragColor = vec4(smoke, 1.0);
  }
`;

function Smoke({ isMobile }) {
  const mat = useRef();
  const mesh = useRef();
  const flash = useRef({ v: 0, next: 4 + Math.random() * 8, pos: new THREE.Vector2(0.5, 0.6) });
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uFlash: { value: 0 },
    uFlashPos: { value: new THREE.Vector2(0.5, 0.6) },
    uOct: { value: isMobile ? 2 : 4 },
  }), [isMobile]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (mesh.current) mesh.current.position.y = state.camera.position.y; // kamerayı takip et
    const f = flash.current;
    if (t > f.next) {
      f.v = 0.55 + Math.random() * 0.5;
      f.pos.set(0.15 + Math.random() * 0.7, 0.3 + Math.random() * 0.55);
      f.next = t + 7 + Math.random() * 12; // nadiren
    }
    f.v = Math.max(0, f.v - delta * 2.4); // hızlı sönüm (çakma hissi)
    if (mat.current) {
      mat.current.uniforms.uTime.value = t;
      mat.current.uniforms.uFlash.value = f.v;
      mat.current.uniforms.uFlashPos.value.copy(f.pos);
    }
  });

  return (
    <mesh ref={mesh} position={[0, 0, -26]} frustumCulled={false} renderOrder={-1}>
      <planeGeometry args={[160, 100]} />
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={SMOKE_VERT} fragmentShader={SMOKE_FRAG}
        depthWrite={false} depthTest={false} />
    </mesh>
  );
}

function Scene({ progressRef, diveRef, onDiveComplete, onNodeClick, labelRefs, isMobile, reduce }) {
  const curve = useMemo(buildCurve, []);
  const groupRef = useRef();
  const nodeRefs = useRef([]);
  const { camera } = useThree();
  const [hover, setHover] = useState(-1);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const introRef = useRef(!reduce);
  const introStart = useRef(-1);
  const firedRef = useRef(-1);

  const tube = useMemo(
    () => new THREE.TubeGeometry(curve, isMobile ? 130 : 260, 0.055, 8, false),
    [curve, isMobile]
  );
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
      camera.lookAt(0, H / 2 - 7 * e, 0);
      if (k >= 1) introRef.current = false;
    } else if (diving) {
      nodeRefs.current[dive.index].getWorldPosition(tmp);
      target.copy(camera.position).sub(tmp).setLength(2.6).add(tmp);
      camera.position.x = THREE.MathUtils.damp(camera.position.x, target.x, 3.4, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, target.y, 3.4, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, target.z, 3.4, d);
      camera.lookAt(tmp);
      if (firedRef.current !== dive.index && camera.position.distanceTo(target) < 0.22) {
        firedRef.current = dive.index;
        if (onDiveComplete) onDiveComplete(dive.index);
      }
    } else {
      if (firedRef.current >= 0) firedRef.current = -1;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 2.5, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 2.5, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, CAM_Z, 2.5, d);
      camera.lookAt(0, camY - 7, 0);
    }

    // FAZ D: DOM etiketlerini 3B düğümlere yapıştır (world → screen projeksiyon)
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
      <Smoke isMobile={isMobile} />
      <group ref={groupRef}>
        <mesh geometry={tube}>
          <meshBasicMaterial color="#8390d8" toneMapped={false} transparent opacity={0.9} />
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
              <meshBasicMaterial color={NODES[i].color} toneMapped={false} />
            </mesh>
          </group>
        ))}

        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial size={0.07} color="#9aa6e6" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
        </points>
      </group>
    </>
  );
}

export default function Spine3D({ progressRef, diveRef, onDiveComplete, onNodeClick, labelRefs, isMobile = false, reduce = false }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
      <Canvas
        camera={{ position: [0, H / 2 + 26, 46], fov: 55, near: 0.1, far: 240 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.75]}
      >
        <fog attach="fog" args={["#06060b", 16, 72]} />
        <Scene progressRef={progressRef} diveRef={diveRef} onDiveComplete={onDiveComplete}
          onNodeClick={onNodeClick} labelRefs={labelRefs} isMobile={isMobile} reduce={reduce} />
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
