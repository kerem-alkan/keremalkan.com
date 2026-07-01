"use client";

/**
 * ParticleField — Apple-önce, açık tema için ince "yaşayan sis".
 * GPU curl-noise akış alanı; fareyle zarifçe etkileşir, scroll'la hafif kayar.
 * Additive/neon YOK — açık zeminde okunabilir kalması için düşük-opak,
 * normal blending, ink-mavi tonlarda sakin bir hareket.
 *
 * Ham Three.js, useEffect içinde kurulur (SSR-güvenli). Shader'lar inline
 * (Next'te .glsl loader'ı gerekmesin diye).
 */
import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  PerspectiveCamera,
  Plane,
  Points,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  NormalBlending,
} from "three";

const VERT = /* glsl */ `
uniform float uTime;
uniform vec2  uMouse;
uniform float uMouseStrength;
uniform float uSize;
uniform float uPixelRatio;
uniform float uProgress;
uniform vec3  uColorA;
uniform vec3  uColorB;
uniform vec3  uColorC;

attribute float aScale;
attribute vec3  aSeed;

varying vec3  vColor;
varying float vAlpha;

vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0*C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0*C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
            i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
            i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m*m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

vec3 snoiseVec3(vec3 x){
  float s  = snoise(x);
  float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
  float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
  return vec3(s, s1, s2);
}

vec3 curlNoise(vec3 p){
  const float e = 0.1;
  vec3 dx = vec3(e,0.0,0.0), dy = vec3(0.0,e,0.0), dz = vec3(0.0,0.0,e);
  vec3 px0 = snoiseVec3(p - dx), px1 = snoiseVec3(p + dx);
  vec3 py0 = snoiseVec3(p - dy), py1 = snoiseVec3(p + dy);
  vec3 pz0 = snoiseVec3(p - dz), pz1 = snoiseVec3(p + dz);
  float x = py1.z - py0.z - pz1.y + pz0.y;
  float y = pz1.x - pz0.x - px1.z + px0.z;
  float z = px1.y - px0.y - py1.x + py0.x;
  return normalize(vec3(x,y,z) * (1.0/(2.0*e)));
}

void main(){
  vec3 pos = position;

  // Sakin birincil akış (Apple: yavaş, ölçülü)
  float t = uTime * 0.08;
  vec3 flow = curlNoise(pos * 0.16 + vec3(0.0, 0.0, t));
  pos += flow * 0.6;

  // İnce ikincil savrulma
  pos += curlNoise(pos * 0.35 + aSeed) * 0.1;

  // Nazik fare itmesi
  vec2 toMouse = pos.xy - uMouse;
  float d = length(toMouse);
  float influence = uMouseStrength * exp(-d*d*0.4);
  pos.xy += normalize(toMouse + 0.0001) * influence;

  pos *= mix(0.55, 1.0, uProgress);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * uPixelRatio * (7.0 / -mv.z);

  float speed = length(flow);
  vColor = mix(uColorA, uColorB, clamp(speed * 0.85, 0.0, 1.0));
  vColor = mix(vColor, uColorC, smoothstep(0.35, 1.0, influence));
  vAlpha = mix(0.0, 1.0, uProgress) * (0.10 + 0.30 * aScale);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec3  vColor;
varying float vAlpha;
void main(){
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float mask = smoothstep(0.5, 0.0, d);
  float alpha = mask * vAlpha;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(vColor, alpha);
}
`;

export default function ParticleField({ className, style }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = canvas.clientWidth || window.innerWidth;
    let h = canvas.clientHeight || window.innerHeight;

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, w / h, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // sayfa açık zemini görünsün
      powerPreference: "high-performance",
    });
    renderer.setClearAlpha(0);

    const count = w < 768 ? 9000 : w * h < 1280 * 720 ? 14000 : 20000;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4.0 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) * 1.25; // yatayda geniş
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
      positions[i * 3 + 2] = r * Math.cos(phi) * 0.5;
      scales[i] = 0.4 + Math.random() * Math.random() * 1.6;
      seeds[i * 3] = Math.random() * 100;
      seeds[i * 3 + 1] = Math.random() * 100;
      seeds[i * 3 + 2] = Math.random() * 100;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("aScale", new BufferAttribute(scales, 1));
    geometry.setAttribute("aSeed", new BufferAttribute(seeds, 3));

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const material = new ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: NormalBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: [0, 0] },
        uMouseStrength: { value: 0 },
        uSize: { value: 15 },
        uPixelRatio: { value: dpr },
        uProgress: { value: 0 },
        // Apple-nötr grafit paleti — mor/mavi vurgu yok, tek-renk sakin sis
        uColorA: { value: new Color("#a8adb6") }, // yumuşak grafit (sakin)
        uColorB: { value: new Color("#6b7280") }, // koyu grafit (akış)
        uColorC: { value: new Color("#8b93a3") }, // açık grafit (fare — nazik)
      },
    });

    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    const clock = new Clock();
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const pointer = new Vector2(0, 0);
    const worldMouse = new Vector3();
    const hit = new Vector3();
    let mouseStrength = 0;
    let targetStrength = 0;
    let scrollY = 0;

    const setSize = () => {
      w = canvas.clientWidth || window.innerWidth;
      h = canvas.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    };
    setSize();

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      targetStrength = 1.1;
    };
    const onLeave = () => (targetStrength = 0);
    const onScroll = () => (scrollY = window.scrollY || 0);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerout", onLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(setSize)
        : null;
    if (ro) ro.observe(canvas);
    else window.addEventListener("resize", setSize);

    // Intro reveal
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = reduce ? 0 : clock.getElapsedTime();
      const progress = Math.min((performance.now() - start) / 1800, 1);

      raycaster.setFromCamera(pointer, camera);
      raycaster.ray.intersectPlane(plane, hit);
      worldMouse.lerp(hit, 0.1);
      mouseStrength += (targetStrength - mouseStrength) * 0.06;
      targetStrength *= 0.96;

      const u = material.uniforms;
      u.uTime.value = elapsed;
      u.uProgress.value = progress;
      u.uMouse.value[0] = worldMouse.x;
      u.uMouse.value[1] = worldMouse.y;
      u.uMouseStrength.value = mouseStrength;

      const sN = scrollY / Math.max(window.innerHeight, 1);
      points.rotation.z = sN * 0.12;
      points.rotation.y = (reduce ? 0 : Math.sin(elapsed * 0.06) * 0.12) + sN * 0.15;
      camera.position.y = -sN * 0.6;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", setSize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}
