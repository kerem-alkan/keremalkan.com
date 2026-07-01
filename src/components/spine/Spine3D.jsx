"use client";

/**
 * Spine3D — FAZ A: gerçek 3B omurga sahnesi (React Three Fiber).
 * Derinlikte helis bir eğri (omurga), ışıldayan tüp + düğüm küreleri, additive
 * parçacık akışı. Scroll ile kamera omurga boyunca iner + omurga döner. Bloom.
 * Sabit tam-ekran arka plan; DOM içerik (metin/panel/overlay) üstte kalır.
 *
 * NOT: WebGL animasyon/kamera rAF'e bağlı — gerçek tarayıcıda görülür.
 */
import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { NODES } from "./spineData";

const H = 64; // omurga yüksekliği (dünya birimi)

function buildCurve() {
  const pts = [];
  const N = 140;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const y = H / 2 - t * H; // üst (kök) -> alt (taç)
    const ang = t * Math.PI * 2.4; // ~1.2 tur helis
    const rad = 2.2 + Math.sin(t * Math.PI) * 1.5; // ortada şişkin
    pts.push(new THREE.Vector3(Math.cos(ang) * rad * 0.75, y, Math.sin(ang) * rad * 0.75));
  }
  return new THREE.CatmullRomCurve3(pts);
}

function Scene({ progressRef }) {
  const curve = useMemo(buildCurve, []);
  const groupRef = useRef();
  const { camera } = useThree();

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 260, 0.055, 8, false), [curve]);
  const nodePts = useMemo(
    () => NODES.map((n, i) => curve.getPoint(i / (NODES.length - 1))),
    [curve]
  );

  const particles = useMemo(() => {
    const count = 3200;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const p = curve.getPoint(Math.random());
      arr[i * 3] = p.x + (THREE.MathUtils.randFloatSpread(3.4));
      arr[i * 3 + 1] = p.y + (THREE.MathUtils.randFloatSpread(3.4));
      arr[i * 3 + 2] = p.z + (THREE.MathUtils.randFloatSpread(3.4));
    }
    return arr;
  }, [curve]);

  useFrame((state) => {
    const p = progressRef && progressRef.current != null ? progressRef.current : 0;
    const t = state.clock.elapsedTime;
    // Kamera omurga boyunca iner
    const camY = H / 2 - p * H;
    camera.position.set(0, camY, 13.5);
    camera.lookAt(0, camY - 7, 0);
    // Omurga döner (idle + scroll)
    if (groupRef.current) groupRef.current.rotation.y = t * 0.045 + p * Math.PI * 1.3;
  });

  return (
    <group ref={groupRef}>
      {/* ışıldayan omurga tüpü */}
      <mesh geometry={tube}>
        <meshBasicMaterial color="#8390d8" toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* düğüm küreleri (projeye özel renk, bloom ile parlar) */}
      {nodePts.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.3, 24, 24]} />
          <meshBasicMaterial color={NODES[i].color} toneMapped={false} />
        </mesh>
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

export default function Spine3D({ progressRef }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, H / 2, 13.5], fov: 55, near: 0.1, far: 240 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={["#06060b", 16, 72]} />
        <Scene progressRef={progressRef} />
        <EffectComposer>
          <Bloom intensity={1.5} luminanceThreshold={0.08} luminanceSmoothing={0.9} mipmapBlur radius={0.72} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
