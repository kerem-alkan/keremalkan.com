"use client";

/**
 * Spine3D — FAZ A+B+C: gerçek 3B omurga sahnesi (React Three Fiber).
 *  A: helis omurga tüpü + düğüm küreleri + additive parçacıklar + Bloom
 *  B: düğümler TIKLANABİLİR (raycast); tıklayınca KAMERA DÜĞÜME DALAR,
 *     dalış bitince panel "monitör" olarak açılır (onDiveComplete)
 *  C: sinematik giriş uçuşu (uzaydan köke iniş) + grain + vignette (+ desktop'ta
 *     kromatik aberasyon)
 *  Mobil perf: DPR 1, azaltılmış geometri/parçacık, hafif bloom, AA kapalı
 *     (composer varken MSAA israf), multisampling 0.
 *
 * Kamera durum makinesi (useFrame): intro → (dive varsa düğüme kilitlen) → scroll path.
 * DOM içerik üstte; sections pointer-events:none olduğundan tıklar canvas'a düşer.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { NODES } from "./spineData";

const H = 64; // omurga yüksekliği (dünya birimi)
const CAM_Z = 13.5;

function buildCurve() {
  const pts = [];
  const N = 140;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = H / 2 - t * H; // kök (üst) -> taç (alt)
    const ang = t * Math.PI * 2.4;
    const rad = 2.2 + Math.sin(t * Math.PI) * 1.5;
    pts.push(new THREE.Vector3(Math.cos(ang) * rad * 0.75, y, Math.sin(ang) * rad * 0.75));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function Scene({ progressRef, diveRef, onDiveComplete, onNodeClick, isMobile, reduce }) {
  const curve = useMemo(buildCurve, []);
  const groupRef = useRef();
  const nodeRefs = useRef([]);
  const { camera } = useThree();
  const [hover, setHover] = useState(-1);

  // GC'siz frame hesapları
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
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

    // Omurga dönüşü — dalışta dondur (hedef sabit kalsın)
    if (!diving && groupRef.current) {
      const rotTarget = t * 0.045 + p * Math.PI * 1.3;
      groupRef.current.rotation.y = THREE.MathUtils.damp(groupRef.current.rotation.y, rotTarget, 3, d);
    }

    if (introRef.current) {
      // FAZ C: sinematik giriş — uzaktan köke süzül
      if (introStart.current < 0) introStart.current = t;
      const k = Math.min((t - introStart.current) / 2.4, 1);
      const e = 1 - Math.pow(1 - k, 3); // easeOutCubic
      camera.position.set(0, H / 2 + 26 - e * 26, 46 - e * (46 - CAM_Z));
      camera.lookAt(0, H / 2 - 7 * e, 0);
      if (k >= 1) introRef.current = false;
    } else if (diving) {
      // FAZ B: düğüme dalış — düğümün önünde 2.6 birim mesafeye kilitlen
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
      // Scroll path takibi (dalıştan dönüşte damp ile yumuşak)
      if (firedRef.current >= 0) firedRef.current = -1;
      camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 2.5, d);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, camY, 2.5, d);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, CAM_Z, 2.5, d);
      camera.lookAt(0, camY - 7, 0);
    }
  });

  return (
    <group ref={groupRef}>
      {/* ışıldayan omurga tüpü */}
      <mesh geometry={tube}>
        <meshBasicMaterial color="#8390d8" toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* düğümler: görünmez geniş hit-alanı (raycast) + görünür ışıklı küre */}
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

      {/* additive parçacık akışı */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particles.length / 3} array={particles} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.07} color="#9aa6e6" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
      </points>
    </group>
  );
}

export default function Spine3D({ progressRef, diveRef, onDiveComplete, onNodeClick, isMobile = false, reduce = false }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "auto" }}>
      <Canvas
        camera={{ position: [0, H / 2 + 26, 46], fov: 55, near: 0.1, far: 240 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        dpr={isMobile ? 1 : [1, 1.75]}
      >
        <fog attach="fog" args={["#06060b", 16, 72]} />
        <Scene progressRef={progressRef} diveRef={diveRef} onDiveComplete={onDiveComplete}
          onNodeClick={onNodeClick} isMobile={isMobile} reduce={reduce} />
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
