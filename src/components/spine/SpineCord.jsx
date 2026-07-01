"use client";

/**
 * SpineCord — omurga SVG çizgisinin arkasında akan grafit parçacık "sisi".
 * SVG ile AYNI Catmull-Rom eğrisinden örneklenir (hizalı). Sabit viewport canvas;
 * her parçacık belge-uzayında bir t noktasında durur, ekran konumu = docY - scrollY,
 * böylece sayfayla birlikte kayar (SVG ile senkron). Apple-ölçülü: ince, düşük opak.
 * rAF'e bağlı — arka plan sekmesinde animasyon durur, sorun değil (sadece görsel).
 */
import { useEffect, useRef } from "react";
import {
  BufferAttribute, BufferGeometry, Color, NormalBlending,
  OrthographicCamera, Points, Scene, ShaderMaterial, WebGLRenderer,
} from "three";

// smoothPath ile aynı Catmull-Rom — global t (0..1) için eğri üstünde nokta
function curvePoint(pts, t) {
  const n = pts.length;
  if (n < 2) return pts[0] || { x: 0, y: 0 };
  const f = Math.max(0, Math.min(t, 1)) * (n - 1);
  const seg = Math.min(Math.floor(f), n - 2);
  const lt = f - seg;
  const p0 = pts[Math.max(seg - 1, 0)], p1 = pts[seg], p2 = pts[seg + 1], p3 = pts[Math.min(seg + 2, n - 1)];
  const t2 = lt * lt, t3 = t2 * lt;
  const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * lt + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
  return { x: cr(p0.x, p1.x, p2.x, p3.x), y: cr(p0.y, p1.y, p2.y, p3.y) };
}

const VERT = /* glsl */ `
  uniform float uSize; uniform float uDpr;
  attribute float aScale; varying float vA;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uDpr;
    vA = aScale;
  }`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor; varying float vA;
  void main(){
    vec2 uv = gl_PointCoord - 0.5;
    float m = smoothstep(0.5, 0.0, length(uv));
    float a = m * (0.10 + 0.30 * vA);
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a);
  }`;

export default function SpineCord({ geom, scrollRef, count = 2400 }) {
  const canvasRef = useRef(null);
  const geomRef = useRef(geom);
  geomRef.current = geom; // her render'da en güncel eğri

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = window.innerWidth, h = window.innerHeight;
    const scene = new Scene();
    const camera = new OrthographicCamera(0, w, 0, h, 0.1, 1000);
    camera.position.z = 10;

    const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setClearAlpha(0);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);

    // parçacık özellikleri
    const ts = new Float32Array(count), ox = new Float32Array(count), oy = new Float32Array(count), seed = new Float32Array(count);
    const scale = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      ts[i] = Math.random();
      ox[i] = (Math.random() * 2 - 1) * 16;  // kordon çevresinde ~32px yatay bant
      oy[i] = (Math.random() * 2 - 1) * 12;
      seed[i] = Math.random() * 100;
      scale[i] = 0.4 + Math.random() * Math.random() * 1.6;
    }
    const positions = new Float32Array(count * 3);
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new BufferAttribute(scale, 1));

    const material = new ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: NormalBlending,
      uniforms: { uSize: { value: 2.6 }, uDpr: { value: dpr }, uColor: { value: new Color("#6b7280") } },
    });
    const points = new Points(geo, material);
    points.frustumCulled = false;
    scene.add(points);

    const onResize = () => {
      w = window.innerWidth; h = window.innerHeight;
      camera.right = w; camera.bottom = h; camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);

    const start = performance.now();
    let raf = 0;
    const posArr = geo.attributes.position.array;
    const tick = () => {
      const time = reduce ? 0 : (performance.now() - start) / 1000;
      const pts = (geomRef.current && geomRef.current.pts) || [];
      const scrollY = (scrollRef && scrollRef.current) || 0;
      if (pts.length >= 2) {
        for (let i = 0; i < count; i++) {
          const p = curvePoint(pts, ts[i]);
          posArr[i * 3] = p.x + ox[i] + Math.sin(time * 0.6 + seed[i]) * 4;
          posArr[i * 3 + 1] = p.y - scrollY + oy[i] + Math.cos(time * 0.5 + seed[i]) * 3;
          posArr[i * 3 + 2] = 0;
        }
        geo.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [count, scrollRef]);

  return (
    <canvas ref={canvasRef} aria-hidden="true"
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, display: "block", pointerEvents: "none" }} />
  );
}
