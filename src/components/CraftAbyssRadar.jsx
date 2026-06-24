"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import * as THREE from "three";
import {
  Activity, Radio, Headphones, FileText, TrendingUp, BarChart3, Shield, Users,
  Wifi, X, ChevronUp, ChevronDown, ChevronRight, Crown, Lock, Brain, Rss,
  AlertTriangle, Check, Cpu, HardDrive, Server, Zap, Target, Coins, Boxes,
  Database, Volume2, BellOff, ArrowUpRight, ArrowDownRight, Circle, Gauge
} from "lucide-react";

/* ============================== THEME ============================== */
const C = {
  void: "#07060b", panel: "#0d0a15", panel2: "#120e1d", panelHi: "#171225",
  abyss: "#a855f7", abyssDim: "#7c3aed", abyssBright: "#c084fc",
  ember: "#dc2626", emberDim: "#991b1b",
  signal: "#34d399", warn: "#eab308", info: "#60a5fa",
  mute: "#6b6878", muteDim: "#46414f", text: "#e9e5f3", line: "rgba(168,85,247,0.14)",
};
const statusColor = (s) => (s === "online" ? C.signal : s === "degraded" ? C.warn : C.ember);
const sevColor = (s) => (s === "HIGH" ? C.ember : s === "MEDIUM" ? C.warn : C.mute);

/* ============================== i18n ============================== */
const STR = {
  tr: {
    loc: "tr-TR", live: "CANLI",
    boot_init: "BAŞLATILIYOR", boot_loading: "YÜKLENİYOR",
    boot_s1: "Sunucu Durumu", boot_s2: "Abyss Görüntüleyici", boot_s3: "Ağ Verisi",
    nav: { briefing: "ÖZET", feed: "AKIŞ", operator: "OPERATÖR", markets: "PİYASA", predict: "TAHMİN" },
    hf_health: "AĞ SAĞLIĞI", hf_online: "ÇEVRİMİÇİ", hf_nodes: "DÜĞÜM", ov_players: "OYUNCU",
    st: { online: "ÇEVRİMİÇİ", degraded: "SORUNLU", offline: "ÇEVRİMDIŞI" },
    op: { online: "Çalışıyor", degraded: "Sorunlu", offline: "Kapalı" },
    sev: { HIGH: "YÜKSEK", MEDIUM: "ORTA", LOW: "DÜŞÜK" }, ago: " dk önce",
    fd_live: "CANLI AKIŞ", fd_all: "TÜM AKIŞ", fd_players: "OYUNCULAR", fd_events: "OLAYLAR", fd_high: "YÜKSEK",
    fd_top: "TOPLULUK · SON 24S", fd_conf: "GÜVEN %100",
    mk_item: "EŞYA PİYASASI", mk_econ: "EKONOMİ", mk_barons: "EN ZENGİNLER",
    rarity: { RARE: "NADİR", COMMON: "YAYGIN", EPIC: "EPİK" },
    econ: { "Coins in circulation": "Dolaşımdaki coin", "Daily transactions": "Günlük işlem", "Active shops": "Aktif dükkân" },
    pr_top: "ÖNE ÇIKAN TAHMİNLER", pr_viewall: "TÜMÜ", pr_votes: "oy", pr_day: "g", pr_signin: "GİRİŞ YAP",
    pcat: { SEASON: "SEZON", PLAYERS: "OYUNCU", REALM: "ÂLEM", EVENT: "ETKİNLİK" },
    polls: ["Sezon 4, Ağustos 2026'dan önce başlar mı?", "Ağ bu ay eşzamanlı 100 oyuncuya ulaşır mı?", "Skyblock âlemi 2026'da çıkar mı?", "Bir sonraki Yapı Yarışması 50 katılımı geçer mi?"],
    br_daily: "GÜNLÜK ÖZET", br_p1: "Ağ %", br_p2: " sağlıkla çalışıyor", br_p3: " — ",
    br_p4: " oyuncu çevrimiçi. Aktiviteyi Survival yönetiyor; tüm temel servisler normal. Son 24 saatte kritik olay yok.",
    cards: ["Bugünkü zirve oyuncu", "Yeni kayıt (24s)", "Toplam oyun süresi (24s)", "Aktif cezalar", "Ağ çalışma süresi (24s)", "En yoğun düğüm"],
    playtime: "412 sa",
    sd_intel: "DÜĞÜM BİLGİSİ", sd_players: "OYUNCU", sd_uptime: "ÇALIŞMA", sd_perf: "PERFORMANS",
    sd_service: "SERVİS DURUMU", sd_conn: "Bağlantı", sd_uptime30: "30 GÜNLÜK ÇALIŞMA",
    sd_active: "Aktif", sd_30ago: "30 gün önce", sd_today: "Bugün",
    sd_footer: "© 2026 CraftAbyss · Pterodactyl + LeaderOS ile",
    feedTpl: {
      joinSurvival: (p) => `${p} Survival'a katıldı`, joinLobby: (p) => `${p} Lobby'ye katıldı`,
      slain: (p) => `${p} bir Warden tarafından öldürüldü`, debris: (p) => `${p} ×6 Ancient Debris buldu`,
      vip: (p) => `${p} VIP+ rütbesi satın aldı`, abyssal: (p) => `${p} [Abyssal] rütbesini açtı`,
      restart: () => `Survival otomatik yeniden başlatıldı`, tpsrec: () => `Survival'da TPS düzeldi`,
      teaser: () => `Yeni sezon tanıtımı paylaşıldı`,
    },
  },
  en: {
    loc: "en-US", live: "LIVE",
    boot_init: "INITIALIZING", boot_loading: "LOADING",
    boot_s1: "Server Status", boot_s2: "Abyss Renderer", boot_s3: "Network Data",
    nav: { briefing: "BRIEFING", feed: "FEED", operator: "OPERATOR", markets: "MARKETS", predict: "PREDICT" },
    hf_health: "NETWORK HEALTH", hf_online: "ONLINE", hf_nodes: "NODES", ov_players: "PLAYERS",
    st: { online: "ONLINE", degraded: "DEGRADED", offline: "OFFLINE" },
    op: { online: "Operational", degraded: "Degraded", offline: "Down" },
    sev: { HIGH: "HIGH", MEDIUM: "MEDIUM", LOW: "LOW" }, ago: "m ago",
    fd_live: "LIVE FEED", fd_all: "ALL FEED", fd_players: "PLAYERS", fd_events: "EVENTS", fd_high: "HIGH",
    fd_top: "COMMUNITY TOP 24H", fd_conf: "CONFIDENCE 100%",
    mk_item: "ITEM MARKET", mk_econ: "ECONOMY", mk_barons: "TOP BARONS",
    rarity: { RARE: "RARE", COMMON: "COMMON", EPIC: "EPIC" },
    econ: { "Coins in circulation": "Coins in circulation", "Daily transactions": "Daily transactions", "Active shops": "Active shops" },
    pr_top: "TOP PREDICTIONS", pr_viewall: "VIEW ALL", pr_votes: "votes", pr_day: "d", pr_signin: "SIGN IN",
    pcat: { SEASON: "SEASON", PLAYERS: "PLAYERS", REALM: "REALM", EVENT: "EVENT" },
    polls: ["Will Season 4 launch before August 2026?", "Will the network hit 100 concurrent players this month?", "Will the Skyblock realm release in 2026?", "Will the next Build Contest beat 50 entries?"],
    br_daily: "DAILY BRIEFING", br_p1: "Network running at ", br_p2: "% health", br_p3: " with ",
    br_p4: " players online. Survival leads activity; all core services nominal. No critical incidents in the last 24 hours.",
    cards: ["Peak players today", "New registrations 24h", "Total playtime 24h", "Active punishments", "Network uptime 24h", "Busiest node"],
    playtime: "412 h",
    sd_intel: "NODE INTEL", sd_players: "PLAYERS", sd_uptime: "UPTIME", sd_perf: "PERFORMANCE",
    sd_service: "SERVICE STATUS", sd_conn: "Connectivity", sd_uptime30: "30-DAY UPTIME",
    sd_active: "Active", sd_30ago: "30 days ago", sd_today: "Today",
    sd_footer: "© 2026 CraftAbyss · powered by Pterodactyl + LeaderOS",
    feedTpl: {
      joinSurvival: (p) => `${p} joined Survival`, joinLobby: (p) => `${p} joined Lobby`,
      slain: (p) => `${p} was slain by a Warden`, debris: (p) => `${p} found Ancient Debris ×6`,
      vip: (p) => `${p} purchased VIP+ rank`, abyssal: (p) => `${p} unlocked [Abyssal] rank`,
      restart: () => `Survival auto-restart completed`, tpsrec: () => `TPS recovered on Survival`,
      teaser: () => `New season teaser posted`,
    },
  },
};
const LangCtx = createContext("en");
const useT = () => STR[useContext(LangCtx)] || STR.en;

/* ============================== HELPERS ============================== */
const rand = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rand(a, b + 1));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (n) => Math.round(n).toLocaleString("en-US");

function genUptime(badChance = 0.04) {
  return Array.from({ length: 30 }, () => {
    const r = Math.random();
    return r < badChance * 0.35 ? 0 : r < badChance ? 0.5 : 1;
  });
}
function days7(loc) {
  const out = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    out.push({
      label: d.toLocaleDateString(loc, { weekday: "short" }) + " " + d.getDate(),
      level: i === 0 ? 1 : Math.random() < 0.22 ? -1 : 1,
    });
  }
  return out;
}

/* ============================== DATA MODEL ============================== */
function initServers() {
  return [
    { id: "proxy", name: "Velocity Proxy", short: "PROXY", kind: "Proxy", version: "Velocity 3.x",
      lat: 24, lon: -8, status: "online", players: 0, maxPlayers: 400, cpu: 9, ram: 1.4, ramMax: 8,
      tps: 20, mspt: 0.9, uptime: 99.98, up: genUptime(0.01) },
    { id: "lobby", name: "Lobby", short: "LOBBY", kind: "Paper", version: "Paper 1.21.11",
      lat: -10, lon: -68, status: "online", players: 12, maxPlayers: 200, cpu: 22, ram: 5.6, ramMax: 16,
      tps: 20, mspt: 2.0, uptime: 99.94, up: genUptime(0.05) },
    { id: "survival", name: "Survival", short: "SURVIVAL", kind: "Paper", version: "Paper 1.21.11",
      lat: 8, lon: 74, status: "online", players: 47, maxPlayers: 200, cpu: 57, ram: 11.2, ramMax: 24,
      tps: 19.7, mspt: 6.3, uptime: 99.71, up: genUptime(0.09) },
  ];
}
const SERVICES_INIT = [
  { id: "web", name: "Website", up: 100, bars: genUptime(0) },
  { id: "leaderos", name: "LeaderOS API", up: 100, bars: genUptime(0) },
  { id: "leaderos2", name: "LeaderOS API (Backup)", up: 100, bars: genUptime(0) },
  { id: "proxy", name: "Velocity Proxy", up: 99.98, bars: genUptime(0.01) },
  { id: "lobby", name: "Lobby", up: 99.94, bars: genUptime(0.05) },
  { id: "survival", name: "Survival", up: 99.71, bars: genUptime(0.09) },
  { id: "maria", name: "MariaDB", up: 99.99, bars: genUptime(0.01) },
  { id: "bluemap", name: "BlueMap", up: 99.9, bars: genUptime(0.03) },
];

const PLAYERS = ["Kerem", "AbyssWarden", "VoidStriker", "EnderQueen_", "CreeperKing",
  "DiamondxMiner", "ShadowReaper", "NetherKnight", "PixelGhost", "mcPlayer42", "VexLord", "Obsidian_"];
const FEED_TEMPLATES = [
  { key: "joinSurvival", sev: "LOW", kind: "player" },
  { key: "joinLobby", sev: "LOW", kind: "player" },
  { key: "slain", sev: "LOW", kind: "player" },
  { key: "debris", sev: "LOW", kind: "player" },
  { key: "vip", sev: "MEDIUM", kind: "store" },
  { key: "abyssal", sev: "MEDIUM", kind: "store" },
  { key: "restart", sev: "MEDIUM", kind: "event" },
  { key: "tpsrec", sev: "MEDIUM", kind: "event" },
  { key: "teaser", sev: "LOW", kind: "event" },
];
function makeEvent(tkey, p, sev, kind, ago = 0) {
  return { id: Math.random().toString(36).slice(2), tkey, p, sev, kind, votes: ri(0, 24), ago };
}
function initFeed() {
  const arr = [];
  for (let i = 0; i < 9; i++) {
    const tpl = pick(FEED_TEMPLATES);
    arr.push(makeEvent(tpl.key, pick(PLAYERS), tpl.sev, tpl.kind, ri(1, 180)));
  }
  return arr.sort((a, b) => a.ago - b.ago);
}

const MARKET = {
  items: [
    { n: "Netherite Ingot", tag: "RARE", price: 1840.0, chg: 3.2 },
    { n: "Elytra", tag: "RARE", price: 5200.0, chg: -1.4 },
    { n: "Diamond Block", tag: "COMMON", price: 612.5, chg: 0.8 },
    { n: "Mending Book", tag: "RARE", price: 980.0, chg: -2.9 },
    { n: "Shulker Box", tag: "COMMON", price: 340.0, chg: 1.1 },
    { n: "Beacon", tag: "EPIC", price: 7800.0, chg: 5.6 },
  ],
  stats: [
    { n: "Coins in circulation", v: "14.82M", chg: 2.1 },
    { n: "Daily transactions", v: "3,041", chg: -0.7 },
    { n: "Active shops", v: "126", chg: 0 },
  ],
  barons: [
    { n: "AbyssWarden", v: 482300 }, { n: "Kerem", v: 410900 },
    { n: "VexLord", v: 318400 }, { n: "Obsidian_", v: 254100 },
  ],
};
const POLLS = [
  { cat: "SEASON", icon: Target, q: "Will Season 4 launch before August 2026?", yes: 41.6, votes: 312, days: 39 },
  { cat: "PLAYERS", icon: Users, q: "Will the network hit 100 concurrent players this month?", yes: 68.2, votes: 488, days: 7 },
  { cat: "REALM", icon: Boxes, q: "Will the Skyblock realm release in 2026?", yes: 73.9, votes: 401, days: 191 },
  { cat: "EVENT", icon: Zap, q: "Will the next Build Contest beat 50 entries?", yes: 55.1, votes: 207, days: 14 },
];

/* ============================== ATOMS ============================== */
const Dot = ({ color = C.signal, size = 8, pulse }) => (
  <span style={{ width: size, height: size, borderRadius: 99, background: color, display: "inline-block",
    boxShadow: `0 0 8px ${color}`, animation: pulse ? "abPulse 1.6s infinite" : "none" }} />
);
const Sev = ({ s }) => {
  const t = useT();
  return (
    <span className="mono" style={{ fontSize: 10, letterSpacing: 1, padding: "3px 7px", borderRadius: 4,
      color: sevColor(s), border: `1px solid ${sevColor(s)}55`, background: `${sevColor(s)}10` }}>{t.sev[s] || s}</span>
  );
};
const Label = ({ icon: Ic, children, color = C.ember }) => (
  <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, color: C.mute,
    fontSize: 12, letterSpacing: 2, margin: "4px 0 12px" }}>
    {Ic && <Ic size={15} color={color} />}{children}
  </div>
);
function UptimeBars({ bars }) {
  return (
    <div style={{ display: "flex", gap: 2, height: 30 }}>
      {bars.map((b, i) => (
        <div key={i} style={{ flex: 1, borderRadius: 2,
          background: b === 1 ? C.signal : b === 0.5 ? C.warn : C.ember, opacity: b === 1 ? 0.85 : 1 }} />
      ))}
    </div>
  );
}

/* ============================== ABYSS ORB ============================== */
function AbyssOrb({ serversRef, healthRef }) {
  const mountRef = useRef(null);
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = mount.clientWidth || 360, H = mount.clientHeight || 360;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.set(0, 0.3, 6.4);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    group.rotation.x = 0.25;
    scene.add(group);

    // pointer drag-to-rotate; auto-spin resumes (normal direction) on release
    let dragging = false, lastX = 0, lastY = 0;
    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";
    canvas.style.cursor = "grab";
    const onPointerDown = (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.style.cursor = "grabbing"; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} };
    const onPointerMove = (e) => { if (!dragging) return; const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY; group.rotation.y += dx * 0.006; group.rotation.x = Math.max(-0.9, Math.min(1.1, group.rotation.x + dy * 0.006)); };
    const onPointerUp = (e) => { dragging = false; canvas.style.cursor = "grab"; try { canvas.releasePointerCapture(e.pointerId); } catch (err) {} };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2, 4),
      new THREE.MeshStandardMaterial({ color: 0x0a0712, emissive: 0x18092e, emissiveIntensity: 0.5, roughness: 0.92, metalness: 0.15, flatShading: true })
    );
    group.add(core);
    group.add(new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.012, 3),
      new THREE.MeshBasicMaterial({ color: 0x6d28d9, wireframe: true, transparent: true, opacity: 0.13 })
    ));
    const atm = new THREE.Mesh(
      new THREE.SphereGeometry(2.45, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.12, side: THREE.BackSide, blending: THREE.AdditiveBlending })
    );
    group.add(atm);

    scene.add(new THREE.AmbientLight(0x3a3a5a, 1.3));
    const key = new THREE.PointLight(0xa855f7, 2.2, 60); key.position.set(5, 4, 6); scene.add(key);
    const rim = new THREE.PointLight(0xdc2626, 0.7, 60); rim.position.set(-6, -3, -4); scene.add(rim);

    const toVec = (lat, lon, r) => {
      const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
      return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
    };
    const baseColor = (s) => (s === "online" ? 0xa855f7 : s === "degraded" ? 0xeab308 : 0xdc2626);

    const zones = serversRef.current.map((s) => {
      const pos = toVec(s.lat, s.lon, 2.02);
      const zg = new THREE.Group(); zg.position.copy(pos); zg.lookAt(pos.clone().multiplyScalar(2));
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 18),
        new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.33, 36),
        new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.5, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
      const N = 70, arr = new Float32Array(N * 3), seed = [];
      for (let i = 0; i < N; i++) { arr[i * 3] = arr[i * 3 + 1] = arr[i * 3 + 2] = 0; seed.push({ t: Math.random(), sp: rand(0.4, 1.0), ang: rand(0, Math.PI * 2), spr: rand(0.05, 0.2) }); }
      const pGeo = new THREE.BufferGeometry(); pGeo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      const pts = new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xc084fc, size: 0.055, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      zg.add(glow); zg.add(ring); zg.add(pts); group.add(zg);
      return { id: s.id, zg, glow, ring, pts, pGeo, N, seed, pulse: rand(0, 6.28) };
    });

    let raf, t = 0, alive = true; const clock = new THREE.Clock();
    const animate = () => {
      if (!alive) return; raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05); t += dt;
      if (!reduce && !dragging) group.rotation.y += dt * 0.09;
      const h = healthRef.current ?? 100;
      atm.material.opacity = 0.06 + 0.12 * (h / 100);
      atm.material.color.setHex(h > 55 ? 0x7c3aed : h > 30 ? 0x9a3412 : 0x991b1b);

      zones.forEach((z) => {
        const s = serversRef.current.find((x) => x.id === z.id);
        if (!s) return;
        const col = baseColor(s.status);
        z.glow.material.color.setHex(col); z.ring.material.color.setHex(col);
        z.pts.material.color.setHex(col === 0xa855f7 ? 0xc084fc : col);
        const load = s.maxPlayers ? clamp(s.players / s.maxPlayers, 0, 1) : 0;
        z.pulse += dt * (s.status === "offline" ? 0.5 : 1.2 + load * 2.6);
        if (s.status === "offline") {
          z.glow.scale.setScalar(0.5 + 0.12 * Math.sin(t * 7));
          z.glow.material.opacity = 0.22 + 0.12 * Math.abs(Math.sin(t * 6));
          z.ring.material.opacity = 0.14; z.pts.material.opacity = 0;
        } else if (s.status === "degraded") {
          const flick = Math.random() < 0.12 ? 0.3 : 0;
          z.glow.scale.setScalar(0.8 + 0.25 * Math.sin(z.pulse) + flick);
          z.glow.material.opacity = 0.55 + 0.2 * Math.sin(z.pulse);
          z.ring.material.opacity = 0.34; z.pts.material.opacity = 0.5;
        } else {
          z.glow.scale.setScalar(0.85 + 0.55 * load + 0.18 * Math.sin(z.pulse));
          z.glow.material.opacity = 0.88;
          z.ring.material.opacity = 0.38 + 0.2 * Math.sin(z.pulse * 0.7);
          z.pts.material.opacity = 0.85;
        }
        z.ring.scale.setScalar(1 + 0.16 * Math.sin(z.pulse));
        const a = z.pGeo.attributes.position.array, active = s.status !== "offline";
        for (let i = 0; i < z.N; i++) {
          const sd = z.seed[i];
          if (active && !reduce) sd.t += dt * sd.sp * (s.status === "degraded" ? 0.6 : 1);
          if (sd.t > 1) sd.t -= 1;
          const r = sd.spr * sd.t, dist = sd.t * (0.55 + load * 0.55);
          a[i * 3] = Math.cos(sd.ang) * r; a[i * 3 + 1] = Math.sin(sd.ang) * r; a[i * 3 + 2] = dist;
        }
        z.pGeo.attributes.position.needsUpdate = true;
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => { if (!mount) return; W = mount.clientWidth; H = mount.clientHeight; camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H); };
    window.addEventListener("resize", onResize);
    return () => {
      alive = false; cancelAnimationFrame(raf); window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      renderer.dispose(); try { mount.removeChild(renderer.domElement); } catch (e) {}
      scene.traverse((o) => { if (o.geometry && o.geometry.dispose) o.geometry.dispose();
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose && m.dispose()); });
    };
  }, []);
  return <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />;
}

/* ============================== ORB MARK (premium logo) ============================== */
function OrbMark({ size = 96, glow = true, gid = "orb" }) {
  const c = gid + "Core", r = gid + "Ring";
  return (
    <svg viewBox="0 0 100 100" width={size} height={size}
      style={{ filter: glow ? "drop-shadow(0 0 12px rgba(168,85,247,0.5))" : "none" }}>
      <defs>
        <radialGradient id={c} cx="40%" cy="36%" r="68%">
          <stop offset="0%" stopColor="#f5e9ff" /><stop offset="34%" stopColor="#a855f7" /><stop offset="100%" stopColor="#2b0f57" />
        </radialGradient>
        <linearGradient id={r} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2dd4bf" /><stop offset="52%" stopColor="#a855f7" /><stop offset="100%" stopColor="#fb5a3c" />
        </linearGradient>
      </defs>
      <g transform="rotate(-24 50 50)">
        <ellipse cx="50" cy="50" rx="42" ry="18" fill="none" stroke={`url(#${r})`} strokeWidth="3.4" opacity="0.95" />
        <circle cx="92" cy="50" r="3.1" fill="#fb5a3c" />
      </g>
      <circle cx="50" cy="50" r="21" fill={`url(#${c})`} />
      <circle cx="50" cy="50" r="6.5" fill="#0b0614" opacity="0.85" />
      <circle cx="45.5" cy="45.5" r="2.4" fill="#f5e9ff" />
    </svg>
  );
}

/* ============================== CHROME ============================== */
function TopBar({ players, lang, setLang, live }) {
  const t = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
      borderBottom: `1px solid ${C.line}`, background: C.void, position: "relative", zIndex: 30 }}>
      <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <OrbMark size={32} glow gid="orbTop" />
      </div>
      <div style={{ fontWeight: 900, letterSpacing: 1, fontSize: 19 }}>
        <span style={{ color: C.text }}>CRAFT</span><span style={{ color: C.abyss }}>ABYSS</span>
      </div>
      <div style={{ flex: 1 }} />
      <Dot color={live ? C.signal : C.warn} pulse />
      <span className="mono" style={{ color: live ? C.signal : C.warn, fontSize: 13, letterSpacing: 1 }}>{live ? t.live : "DEMO"}</span>
      <Users size={16} color={C.mute} />
      <span className="mono" style={{ color: C.text, fontSize: 13 }}>{players}</span>
      <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
        {["tr", "en"].map((lng) => (
          <button key={lng} onClick={() => setLang(lng)} className="mono"
            style={{ padding: "6px 8px", fontSize: 11, letterSpacing: 1, border: "none", cursor: "pointer",
              background: lang === lng ? C.abyss : "transparent", color: lang === lng ? "#fff" : C.mute }}>
            {lng.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}

function Ticker({ events }) {
  const t = useT();
  const hi = events.filter((e) => e.sev !== "LOW");
  const line = (hi.length ? hi : events).map((e) => t.feedTpl[e.tkey](e.p).toUpperCase()).join("      •      ");
  return (
    <div style={{ display: "flex", alignItems: "center", borderBottom: `1px solid ${C.line}`,
      background: "#0a0710", position: "relative", zIndex: 25, overflow: "hidden" }}>
      <div style={{ background: C.emberDim, padding: "10px 12px", flexShrink: 0, zIndex: 2 }}>
        <AlertTriangle size={16} color="#fff" />
      </div>
      <div style={{ overflow: "hidden", flex: 1, whiteSpace: "nowrap" }}>
        <div className="mono" style={{ display: "inline-block", paddingLeft: "100%", color: C.ember,
          fontSize: 12, letterSpacing: 1, animation: "abTicker 26s linear infinite" }}>
          {line}      •      {line}
        </div>
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const t = useT();
  const items = [
    { id: "briefing", icon: FileText, label: "BRIEFING" },
    { id: "feed", icon: Radio, label: "FEED" },
    { id: "operator", icon: Headphones, label: "OPERATOR", center: true },
    { id: "markets", icon: TrendingUp, label: "MARKETS" },
    { id: "predict", icon: BarChart3, label: "PREDICT" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around",
      padding: "10px 8px 14px", borderTop: `1px solid ${C.line}`, background: C.void, position: "relative", zIndex: 30 }}>
      {items.map((it) => {
        const on = tab === it.id;
        if (it.center) return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: -22, cursor: "pointer" }}>
            <div style={{ position: "relative", width: 58, height: 58, borderRadius: 99,
              background: "radial-gradient(circle at 50% 40%, #3a0d10, #1a0508)",
              border: `1px solid ${C.ember}`, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 22px ${C.ember}66` }}>
              <it.icon size={24} color={on ? "#fff" : C.ember} />
              <span style={{ position: "absolute", top: 4, right: 6, width: 9, height: 9, borderRadius: 99,
                background: C.signal, boxShadow: `0 0 8px ${C.signal}` }} />
            </div>
            <span className="mono" style={{ fontSize: 9, letterSpacing: 1, color: on ? C.ember : C.mute }}>{t.nav[it.id]}</span>
          </button>
        );
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ background: "none", border: "none",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", padding: "4px 6px" }}>
            <it.icon size={21} color={on ? C.ember : C.mute} />
            <span className="mono" style={{ fontSize: 9, letterSpacing: 1, color: on ? C.ember : C.mute }}>{t.nav[it.id]}</span>
            {on && <span style={{ width: 16, height: 2, background: C.ember, borderRadius: 2 }} />}
          </button>
        );
      })}
    </div>
  );
}

/* ============================== FOOTER (HEALTH) ============================== */
function HealthFooter({ health, delta, active, total }) {
  const t = useT();
  const days = useMemo(() => days7(t.loc), [t.loc]);
  const up = delta >= 0;
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, background: "rgba(7,6,11,0.92)", padding: "14px 16px 10px",
      backdropFilter: "blur(6px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Activity size={17} color={C.ember} />
        <span className="mono" style={{ fontSize: 13, letterSpacing: 1, color: C.text }}>{t.hf_health}</span>
        {up ? <ArrowUpRight size={15} color={C.signal} /> : <ArrowDownRight size={15} color={C.ember} />}
        <span className="mono" style={{ color: up ? C.signal : C.ember, fontSize: 13 }}>
          {up ? "+" : ""}{delta}%
        </span>
        <div style={{ flex: 1 }} />
        <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: C.signal }}>{active}</span>
        <span className="mono" style={{ fontSize: 11, color: C.mute, letterSpacing: 1 }}>{t.hf_online}</span>
        <span style={{ color: C.muteDim }}>|</span>
        <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: C.warn }}>{total}</span>
        <span className="mono" style={{ fontSize: 11, color: C.mute, letterSpacing: 1 }}>{t.hf_nodes}</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 30, marginTop: 12 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", gap: 3, justifyContent: "center" }}>
            {Array.from({ length: 4 }).map((_, j) => (
              <span key={j} style={{ width: 3, height: d.level > 0 ? 7 + j * 3 : 16 - j * 2,
                background: d.level > 0 ? C.signal : C.ember, opacity: 0.8, borderRadius: 2 }} />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        {days.map((d, i) => (
          <span key={i} className="mono" style={{ fontSize: 9, color: C.muteDim, flex: 1, textAlign: "center" }}>{d.label}</span>
        ))}
      </div>
    </div>
  );
}

/* ============================== OVERVIEW (HOME) ============================== */
function NodeChip({ s, onClick }) {
  const t = useT();
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%",
      background: "rgba(13,10,21,0.85)", border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px",
      cursor: "pointer", textAlign: "left" }}>
      <Dot color={statusColor(s.status)} pulse={s.status !== "offline"} />
      <span className="mono" style={{ fontSize: 12, letterSpacing: 1, color: C.text, flex: 1 }}>{s.short}</span>
      {s.status === "offline"
        ? <span className="mono" style={{ fontSize: 11, color: C.ember }}>{t.st.offline}</span>
        : <span className="mono" style={{ fontSize: 12, color: C.mute }}>
            <span style={{ color: C.text }}>{s.players}</span>/{s.maxPlayers}
          </span>}
      <ChevronRight size={15} color={C.mute} />
    </button>
  );
}
function Overview({ servers, health, delta, onOpen }) {
  const t = useT();
  const [open, setOpen] = useState(true);
  const total = servers.reduce((a, s) => a + (s.id === "proxy" ? 0 : s.players), 0);
  const active = servers.filter((s) => s.status !== "offline").length;
  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <Overview.Orb servers={servers} health={health} />
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => setOpen((o) => !o)} style={{ alignSelf: "flex-end", display: "flex",
            alignItems: "center", gap: 10, background: "rgba(13,10,21,0.9)", border: `1px solid ${C.line}`,
            borderRadius: 10, padding: "10px 14px", cursor: "pointer" }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: C.signal }} />
            <Server size={16} color={C.mute} />
            <span className="mono" style={{ fontSize: 13, letterSpacing: 1, color: C.text }}>
              {t.ov_players}: <span style={{ color: C.signal }}>{total}</span>
            </span>
            <ChevronUp size={16} color={C.mute} style={{ transform: open ? "none" : "rotate(180deg)" }} />
          </button>
          {open && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {servers.map((s) => <NodeChip key={s.id} s={s} onClick={() => onOpen(s.id)} />)}
            </div>
          )}
        </div>
      </div>
      <HealthFooter health={health} delta={delta} active={active} total={servers.length} />
    </div>
  );
}
Overview.Orb = function OrbWrap({ servers, health }) {
  const sRef = useRef(servers), hRef = useRef(health);
  useEffect(() => { sRef.current = servers; }, [servers]);
  useEffect(() => { hRef.current = health; }, [health]);
  return <AbyssOrb serversRef={sRef} healthRef={hRef} />;
};

/* ============================== FEED ============================== */
function VoteBox({ v, onUp, onDown }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 8, overflow: "hidden" }}>
      <button onClick={onUp} style={{ background: "none", border: "none", padding: "8px 10px", cursor: "pointer" }}><ChevronUp size={15} color={C.signal} /></button>
      <span className="mono" style={{ padding: "8px 4px", color: C.text, fontSize: 13, minWidth: 22, textAlign: "center" }}>{v}</span>
      <button onClick={onDown} style={{ background: "none", border: "none", padding: "8px 10px", cursor: "pointer" }}><ChevronDown size={15} color={C.ember} /></button>
    </div>
  );
}
function Feed({ feed, setFeed }) {
  const t = useT();
  const [filter, setFilter] = useState("ALL");
  const tabs = [
    { id: "ALL", label: t.fd_all }, { id: "player", label: t.fd_players },
    { id: "event", label: t.fd_events }, { id: "HIGH", label: t.fd_high },
  ];
  const shown = feed.filter((e) =>
    filter === "ALL" ? true : filter === "HIGH" ? e.sev === "HIGH" : e.kind === filter || (filter === "event" && e.kind === "store"));
  const vote = (id, d) => setFeed((f) => f.map((e) => e.id === id ? { ...e, votes: Math.max(0, e.votes + d) } : e));
  const top = [...feed].sort((a, b) => b.votes - a.votes)[0];
  return (
    <div style={{ padding: 16, overflowY: "auto", flex: 1 }} className="scroll">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Dot color={C.ember} pulse /><Radio size={16} color={C.ember} />
        <span className="mono" style={{ fontSize: 14, letterSpacing: 2, color: C.text }}>{t.fd_live}</span>
        <div style={{ flex: 1 }} />
        <BellOff size={16} color={C.mute} /><Volume2 size={16} color={C.ember} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const on = filter === t.id;
          const col = t.id === "HIGH" ? C.ember : t.id === "event" ? C.signal : t.id === "player" ? C.info : C.text;
          return (
            <button key={t.id} onClick={() => setFilter(t.id)} className="mono"
              style={{ fontSize: 11, letterSpacing: 1, padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                color: on ? col : C.mute, border: `1px solid ${on ? col + "66" : C.line}`,
                background: on ? col + "12" : "transparent" }}>{t.label}</button>
          );
        })}
      </div>

      {top && (
        <div style={{ borderLeft: `3px solid ${C.warn}`, background: C.panel, borderRadius: "0 10px 10px 0", padding: 14, marginBottom: 14 }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, color: C.warn, fontSize: 11, letterSpacing: 1, marginBottom: 10 }}>
            <Crown size={14} color={C.warn} /> {t.fd_top}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, lineHeight: 1.25, marginBottom: 8 }}>{t.feedTpl[top.tkey](top.p)}</div>
              <span className="mono" style={{ fontSize: 11, color: C.signal, border: `1px solid ${C.signal}44`,
                background: C.signal + "10", padding: "3px 8px", borderRadius: 5 }}>{t.fd_conf}</span>
            </div>
            <Sev s={top.sev} />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: C.mute, flex: 1 }}>{top.ago}{t.ago}</span>
            <VoteBox v={top.votes} onUp={() => vote(top.id, 1)} onDown={() => vote(top.id, -1)} />
          </div>
        </div>
      )}

      {shown.map((e) => (
        <div key={e.id} style={{ border: `1px solid ${e.sev === "HIGH" ? C.ember + "55" : C.line}`,
          borderRadius: 10, padding: 14, marginBottom: 10, background: e.sev === "HIGH" ? "rgba(220,38,38,0.05)" : C.panel }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: C.text, lineHeight: 1.3, flex: 1 }}>{t.feedTpl[e.tkey](e.p)}</div>
            <Sev s={e.sev} />
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
            <span className="mono" style={{ fontSize: 11, color: C.mute, flex: 1 }}>{e.ago}{t.ago} · {e.kind}</span>
            <VoteBox v={e.votes} onUp={() => vote(e.id, 1)} onDown={() => vote(e.id, -1)} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================== MARKETS ============================== */
function ChgPill({ chg }) {
  if (chg === 0) return <span className="mono" style={{ color: C.mute, fontSize: 14 }}>—</span>;
  const up = chg > 0;
  return (
    <span className="mono" style={{ color: up ? C.signal : C.ember, fontSize: 14, display: "inline-flex", alignItems: "center", gap: 3 }}>
      {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{up ? "+" : ""}{chg.toFixed(2)}%
    </span>
  );
}
function Markets() {
  const t = useT();
  return (
    <div style={{ padding: 16, overflowY: "auto", flex: 1 }} className="scroll">
      <Label icon={BarChart3}>{t.mk_item}</Label>
      {MARKET.items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{it.n}</span>
          <span className="mono" style={{ fontSize: 9, color: C.mute, border: `1px solid ${C.line}`, padding: "2px 6px", borderRadius: 4 }}>{t.rarity[it.tag] || it.tag}</span>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 15, color: C.text }}>{fmt(it.price)}</span>
          <div style={{ width: 78, textAlign: "right" }}><ChgPill chg={it.chg} /></div>
        </div>
      ))}
      <div style={{ height: 18 }} />
      <Label icon={Coins}>{t.mk_econ}</Label>
      {MARKET.stats.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, flex: 1 }}>{t.econ[s.n] || s.n}</span>
          <span className="mono" style={{ fontSize: 15, color: C.text, marginRight: 12 }}>{s.v}</span>
          <div style={{ width: 78, textAlign: "right" }}><ChgPill chg={s.chg} /></div>
        </div>
      ))}
      <div style={{ height: 18 }} />
      <Label icon={Crown}>{t.mk_barons}</Label>
      {MARKET.barons.map((b, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: `1px solid ${C.line}` }}>
          <span className="mono" style={{ fontSize: 14, color: C.abyss, width: 22 }}>#{i + 1}</span>
          <span style={{ fontSize: 16, fontWeight: 600, color: C.text, flex: 1 }}>{b.n}</span>
          <span className="mono" style={{ fontSize: 15, color: C.warn }}>{fmt(b.v)} ◈</span>
        </div>
      ))}
    </div>
  );
}

/* ============================== PREDICT ============================== */
function Predict() {
  const t = useT();
  return (
    <div style={{ padding: 16, overflowY: "auto", flex: 1 }} className="scroll">
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <BarChart3 size={17} color={C.ember} />
        <span className="mono" style={{ fontSize: 14, letterSpacing: 2, color: C.text, marginLeft: 10, flex: 1 }}>{t.pr_top}</span>
        <span className="mono" style={{ fontSize: 12, color: C.ember, letterSpacing: 1, display: "flex", alignItems: "center", gap: 4 }}>
          {t.pr_viewall} <ChevronRight size={14} />
        </span>
      </div>
      {POLLS.map((p, i) => (
        <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 14, background: C.panel }}>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: C.abyss, letterSpacing: 1, marginBottom: 12 }}>
            <p.icon size={14} color={C.abyss} /> {t.pcat[p.cat] || p.cat}
            <span style={{ color: C.muteDim }}>·</span><span style={{ color: C.mute }}>{p.votes} {t.pr_votes}</span>
            <span style={{ color: C.muteDim }}>·</span><span style={{ color: C.mute }}>{p.days}{t.pr_day}</span>
          </div>
          <div className="mono" style={{ fontSize: 15, color: C.text, lineHeight: 1.4, marginBottom: 14 }}>{t.polls[i] || p.q}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span className="mono" style={{ fontSize: 14, color: C.signal, width: 50 }}>{p.yes.toFixed(1)}%</span>
            <div style={{ flex: 1, height: 8, borderRadius: 99, overflow: "hidden", display: "flex", background: C.emberDim }}>
              <div style={{ width: `${p.yes}%`, background: C.signal }} />
            </div>
            <span className="mono" style={{ fontSize: 14, color: C.ember, width: 50, textAlign: "right" }}>{(100 - p.yes).toFixed(1)}%</span>
          </div>
          <button style={{ width: "100%", border: `1px solid ${C.line}`, background: "transparent", borderRadius: 8,
            padding: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Lock size={13} color={C.mute} />
            <span className="mono" style={{ fontSize: 12, letterSpacing: 2, color: C.mute }}>{t.pr_signin}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================== BRIEFING ============================== */
function Briefing({ servers, health }) {
  const t = useT();
  const total = servers.reduce((a, s) => a + (s.id === "proxy" ? 0 : s.players), 0);
  const busiest = [...servers].filter((s) => s.id !== "proxy").sort((a, b) => b.players - a.players)[0];
  const cards = [
    { ic: Users, k: t.cards[0], v: "63", c: C.signal },
    { ic: FileText, k: t.cards[1], v: "18", c: C.abyss },
    { ic: Gauge, k: t.cards[2], v: t.playtime, c: C.info },
    { ic: Shield, k: t.cards[3], v: "4", c: C.warn },
    { ic: Activity, k: t.cards[4], v: "99.9%", c: C.signal },
    { ic: Server, k: t.cards[5], v: busiest ? busiest.short : "—", c: C.abyss },
  ];
  return (
    <div style={{ padding: 16, overflowY: "auto", flex: 1 }} className="scroll">
      <Label icon={FileText}>{t.br_daily}</Label>
      <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 18, background: C.panel }}>
        <div style={{ fontSize: 16, color: C.text, lineHeight: 1.5 }}>
          {t.br_p1}<span style={{ color: C.signal }}>{Math.round(health)}{t.br_p2}</span>{t.br_p3}
          <span style={{ color: C.text, fontWeight: 700 }}>{total}</span>{t.br_p4}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, background: C.panel }}>
            <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.mute, letterSpacing: 1, marginBottom: 10 }}>
              <c.ic size={14} color={c.c} /> {c.k.toUpperCase()}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{c.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== SERVER DETAIL PANEL ============================== */
function StatCard({ ic: Ic, k, children }) {
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.mute, letterSpacing: 1, marginBottom: 10 }}>
        {Ic && <Ic size={14} color={C.mute} />}{k}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{children}</div>
    </div>
  );
}
function ServerDetail({ server, services, onClose }) {
  const t = useT();
  const s = server;
  const ramPct = Math.round((s.ram / s.ramMax) * 100);
  const tpsColor = s.tps >= 19 ? C.signal : s.tps >= 15 ? C.warn : C.ember;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 50, background: "rgba(7,6,11,0.97)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "18px 16px 8px", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.text }}>{s.name}</div>
          <div className="mono" style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <Dot color={statusColor(s.status)} pulse={s.status !== "offline"} />
            <span style={{ color: statusColor(s.status), fontSize: 12, letterSpacing: 1 }}>{t.st[s.status]}</span>
            <span style={{ color: C.muteDim }}>·</span>
            <span style={{ color: C.mute, fontSize: 12 }}>{s.version}</span>
          </div>
        </div>
        <button onClick={onClose} style={{ width: 40, height: 40, border: `1px solid ${C.line}`, borderRadius: 10, background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <X size={18} color={C.text} />
        </button>
      </div>

      <div style={{ padding: 16, overflowY: "auto", flex: 1 }} className="scroll">
        <Label icon={Server}>{t.sd_intel}</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <StatCard ic={Users} k={t.sd_players}>{s.id === "proxy" ? s.players : `${s.players}/${s.maxPlayers}`}</StatCard>
          <StatCard ic={Activity} k={t.sd_uptime}>{s.uptime}%</StatCard>
          <StatCard ic={Cpu} k="CPU">{Math.round(s.cpu)}%</StatCard>
          <StatCard ic={HardDrive} k="RAM">{s.ram.toFixed(1)}/{s.ramMax}G</StatCard>
        </div>

        <Label icon={Gauge}>{t.sd_perf}</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 10, color: C.mute, letterSpacing: 1, marginBottom: 10 }}>TPS</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: tpsColor }}>{s.tps.toFixed(1)}</div>
          </div>
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 14 }}>
            <div className="mono" style={{ fontSize: 10, color: C.mute, letterSpacing: 1, marginBottom: 10 }}>MSPT</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.mspt < 40 ? C.signal : C.warn }}>{s.mspt.toFixed(1)}</div>
          </div>
        </div>

        <Label icon={Wifi}>{t.sd_service}</Label>
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 16, marginBottom: 18,
          display: "flex", alignItems: "center", gap: 12 }}>
          <Dot color={statusColor(s.status)} size={12} pulse={s.status !== "offline"} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: statusColor(s.status) }}>
              {t.op[s.status]}
            </div>
            <div className="mono" style={{ fontSize: 11, color: C.mute, marginTop: 2 }}>{t.sd_conn} · {s.kind}</div>
          </div>
          <span className="mono" style={{ fontSize: 11, color: C.mute, border: `1px solid ${C.line}`, padding: "4px 8px", borderRadius: 5 }}>PTERO</span>
        </div>

        <Label icon={Database} color={C.signal}>{t.sd_uptime30}</Label>
        {services.map((sv) => (
          <div key={sv.id} style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.text, flex: 1 }}>{sv.name}</span>
              <span className="mono" style={{ fontSize: 12, color: C.mute }}>{sv.up}%</span>
              <span className="mono" style={{ fontSize: 11, color: C.signal, display: "inline-flex", alignItems: "center", gap: 4,
                background: C.signal + "12", border: `1px solid ${C.signal}33`, padding: "3px 8px", borderRadius: 99 }}>
                <Check size={12} /> {t.sd_active}
              </span>
            </div>
            <UptimeBars bars={sv.bars} />
            <div className="mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: C.muteDim }}>
              <span>{t.sd_30ago}</span><span>{t.sd_today}</span>
            </div>
          </div>
        ))}
        <div className="mono" style={{ textAlign: "center", fontSize: 11, color: C.muteDim, padding: "8px 0 20px" }}>
          {t.sd_footer}
        </div>
      </div>
    </div>
  );
}

/* ============================== BOOT ============================== */
function Boot({ progress }) {
  const t = useT();
  const steps = [
    { k: t.boot_s1, done: progress > 30 },
    { k: t.boot_s2, done: progress > 15 },
    { k: t.boot_s3, done: progress > 60 },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: C.void, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 32, zIndex: 100 }}>
      <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
        <OrbMark size={104} glow gid="orbBoot" />
      </div>
      <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 8, marginBottom: 8, color: C.text }}>ORB</div>
      <div className="mono" style={{ fontSize: 12, letterSpacing: 3, color: C.mute, marginBottom: 20 }}>
        CRAFTABYSS · LIVE OPS
      </div>
      <div className="mono" style={{ display: "flex", alignItems: "center", gap: 10, color: C.ember, fontSize: 16, letterSpacing: 3, marginBottom: 30 }}>
        <Dot color={C.ember} pulse /> {t.boot_init}
      </div>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ height: 4, background: "#1a1422", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: `linear-gradient(90deg, ${C.ember}, ${C.abyss})`, transition: "width 0.2s" }} />
        </div>
        <div className="mono" style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: C.mute, fontSize: 12, letterSpacing: 1 }}>
          <span>{t.boot_loading}</span><span>{progress}%</span>
        </div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start", paddingLeft: 40 }}>
          {steps.map((s, i) => (
            <div key={i} className="mono" style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 16,
              color: s.done ? C.signal : C.ember }}>
              {s.done ? <Check size={16} /> : <ChevronRight size={16} />} {s.k}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================== APP ============================== */
export default function App() {
  const [booting, setBooting] = useState(true);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState("operator");
  const [servers, setServers] = useState(initServers);
  const [services] = useState(SERVICES_INIT);
  const [feed, setFeed] = useState(initFeed);
  const [health, setHealth] = useState(96);
  const [delta] = useState(() => ri(-12, 8));
  const [selected, setSelected] = useState(null);
  const [lang, setLang] = useState("tr");
  const [live, setLive] = useState(false);
  useEffect(() => {
    try { const sv = localStorage.getItem("ka_lang"); if (sv === "tr" || sv === "en") setLang(sv); } catch (e) {}
  }, []);
  useEffect(() => { try { localStorage.setItem("ka_lang", lang); } catch (e) {} }, [lang]);

  const applyAggregate = (next) => {
    const backends = next.filter((s) => s.id !== "proxy");
    const proxy = next.find((s) => s.id === "proxy");
    if (proxy) { proxy.players = backends.reduce((a, s) => a + s.players, 0); proxy.maxPlayers = backends.reduce((a, s) => a + s.maxPlayers, 0); }
    const up = next.filter((s) => s.status !== "offline").length;
    const avgTps = backends.reduce((a, s) => a + (s.status === "offline" ? 0 : s.tps), 0) / Math.max(1, backends.length);
    setHealth(clamp(Math.round((up / next.length) * 60 + (avgTps / 20) * 40), 0, 100));
  };

  // boot sequence
  useEffect(() => {
    let p = 0;
    const t = setInterval(() => {
      p += ri(8, 22); if (p >= 100) { p = 100; clearInterval(t); setTimeout(() => setBooting(false), 450); }
      setProgress(p);
    }, 320);
    return () => clearInterval(t);
  }, []);

  // detect a real backend (Pterodactyl env configured) -> flip DEMO to LIVE
  useEffect(() => {
    if (booting) return;
    let alive = true;
    fetch("/api/ptero").then((r) => r.json()).then((j) => { if (alive && j && j.configured) setLive(true); }).catch(() => {});
    return () => { alive = false; };
  }, [booting]);

  // DEMO simulator (shaped like real Pterodactyl + ping + RCON) — runs until LIVE
  useEffect(() => {
    if (booting || live) return;
    const t = setInterval(() => {
      setServers((prev) => {
        const next = prev.map((s) => {
          if (s.id === "proxy") return s;
          let { status, players, cpu, ram, tps, mspt } = s;
          const roll = Math.random();
          if (status === "online" && roll < 0.015) status = "degraded";
          else if (status === "degraded") { if (roll < 0.4) status = "online"; else if (roll > 0.95) status = "offline"; }
          else if (status === "offline" && roll < 0.5) status = "online";
          if (status === "offline") { players = 0; tps = 0; mspt = 0; cpu = clamp(cpu - 8, 1, 100); ram = clamp(ram - 0.4, 0.5, s.ramMax); }
          else {
            players = clamp(players + ri(-3, 4), 0, s.maxPlayers);
            const load = players / s.maxPlayers;
            cpu = clamp(cpu + rand(-6, 6) + load * 4, 4, 99);
            ram = clamp(ram + rand(-0.4, 0.5), 1, s.ramMax);
            tps = status === "degraded" ? clamp(tps + rand(-2, 1), 8, 16) : clamp(20 - load * 1.5 + rand(-0.3, 0.3), 16, 20);
            mspt = status === "degraded" ? rand(40, 80) : clamp(1 + load * 10 + rand(-1, 2), 0.8, 30);
          }
          return { ...s, status, players: Math.round(players), cpu, ram, tps, mspt };
        });
        applyAggregate(next);
        return next;
      });
    }, 2300);
    return () => clearInterval(t);
  }, [booting, live]);

  // LIVE poll — real Pterodactyl + Minecraft ping + RCON/spark (INTEGRATION.md)
  useEffect(() => {
    if (booting || !live) return;
    let alive = true;
    const poll = async () => {
      try {
        const [ptero, mc, tpsd] = await Promise.all([
          fetch("/api/ptero").then((r) => r.json()),
          fetch("/api/mc").then((r) => r.json()).catch(() => ({})),
          fetch("/api/tps").then((r) => r.json()).catch(() => ({})),
        ]);
        if (!alive) return;
        setServers((prev) => {
          const next = prev.map((s) => {
            if (s.id === "proxy") return s;
            const pp = ptero[s.id], tv = tpsd && tpsd[s.id];
            const online = pp && pp.state === "running";
            const tval = tv && tv.tps != null && tv.tps > 0 ? tv.tps : (online ? 20 : 0);
            const status = !online ? "offline" : (tval > 0 && tval < 15) ? "degraded" : "online";
            return { ...s, status,
              players: online ? Math.round((mc.players ?? 0) / 2) : 0,
              cpu: pp ? pp.cpu : 0, ram: pp ? pp.ram : 0, tps: online ? tval : 0,
              mspt: online ? (tval >= 19 ? 2 : tval >= 15 ? 30 : 50) : 0 };
          });
          applyAggregate(next);
          return next;
        });
      } catch (e) { /* keep last values */ }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [booting, live]);

  // feed flavor events (always)
  useEffect(() => {
    if (booting) return;
    const t = setInterval(() => {
      if (Math.random() < 0.55) {
        const tpl = pick(FEED_TEMPLATES);
        setFeed((f) => [makeEvent(tpl.key, pick(PLAYERS), tpl.sev, tpl.kind, 0), ...f.map((e) => ({ ...e, ago: e.ago + 1 }))].slice(0, 40));
      }
    }, 2300);
    return () => clearInterval(t);
  }, [booting]);

  const selServer = servers.find((s) => s.id === selected);
  const relServices = useMemo(() => {
    if (!selected) return services;
    return services.filter((sv) => ["web", "leaderos", selected].includes(sv.id) || sv.id === "maria");
  }, [selected, services]);
  const totalPlayers = servers.reduce((a, s) => a + (s.id === "proxy" ? 0 : s.players), 0);

  const css = `
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    .mono{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
    .scroll::-webkit-scrollbar{width:6px}
    .scroll::-webkit-scrollbar-thumb{background:${C.line};border-radius:9px}
    @keyframes abPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
    @keyframes abTicker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
    @media (prefers-reduced-motion: reduce){*{animation-duration:0.001ms !important}}
  `;

  return (
    <LangCtx.Provider value={lang}>
    <div style={{ height: "100vh", width: "100%", background: C.void, color: C.text,
      fontFamily: "ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif", display: "flex", justifyContent: "center" }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 460, height: "100%", display: "flex", flexDirection: "column",
        position: "relative", borderLeft: `1px solid ${C.line}`, borderRight: `1px solid ${C.line}`, overflow: "hidden" }}>
        {booting && <Boot progress={progress} />}
        <TopBar players={totalPlayers} lang={lang} setLang={setLang} live={live} />
        <Ticker events={feed} />
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {tab === "operator" && <Overview servers={servers} health={health} delta={delta} onOpen={setSelected} />}
          {tab === "briefing" && <Briefing servers={servers} health={health} />}
          {tab === "feed" && <Feed feed={feed} setFeed={setFeed} />}
          {tab === "markets" && <Markets />}
          {tab === "predict" && <Predict />}
        </div>
        <BottomNav tab={tab} setTab={setTab} />
        {selServer && <ServerDetail server={selServer} services={relServices} onClose={() => setSelected(null)} />}
      </div>
    </div>
    </LangCtx.Provider>
  );
}
