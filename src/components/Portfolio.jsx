"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Instagram, Github, Linkedin } from "lucide-react";

/* ============================== TOKENS ============================== */
const L = { bg: "#f5f5f7", surface: "#ffffff", ink: "#1d1d1f", gray: "#6e6e73", faint: "#86868b", line: "#d2d2d7", accent: "#0066cc" };
const D = { teal: "#2dd4bf" };

/* ============================== SOCIAL (confirm IG + LinkedIn URLs) ============================== */
const SOCIAL = {
  instagram: "https://instagram.com/keremlabs",
  github: "https://github.com/kerem-alkan",
  linkedin: "https://www.linkedin.com/in/kerem-alkan",
};

/* ============================== i18n ============================== */
const STR = {
  tr: {
    nav_work: "İşler",
    hero_eyebrow: "KEREM ALKAN",
    hero_l1: "Yaşayan sistemler",
    hero_l2: "inşa ediyorum.",
    hero_lead: "Oyun altyapısı, otomasyon ve gerçek zamanlı arayüzler. Şu an CraftAbyss'i işletiyorum — kendi sunucumda barındırdığım bir Minecraft ağı.",
    hero_viewWork: "İşleri gör",
    hero_radar: "CraftAbyss Orb",
    selectedWork: "Seçili işler",
    about_bio: "Sistemleri uçtan uca tasarlayıp işletiyorum — kendi sunucumda barındırdığım oyun altyapısından gerçek zamanlı arayüzlere.",
    cs_back: "GERİ",
    cs_eyebrow: "PROJE 01 · OYUN ALTYAPISI",
    cs_lead: "Kendi sunucumda barındırdığım bir Minecraft ağı — ve onu canlı izlemek için kurulmuş bir operasyon görünümü: Orb.",
    cs_meta: [["Rol", "Tek kişi — altyapı & tasarım"], ["Yığın", "Velocity · Paper · Pterodactyl"], ["Yıl", "2026"]],
    cs_p1: "CraftAbyss, Paper 1.21.11 arka uçlarının önünde bir Velocity proxy çalıştırır; Pterodactyl üzerinde yönetilir ve LeaderOS, LuckPerms, MariaDB ve BlueMap ile desteklenir — hepsi uçtan uca kendi yönettiğim tek bir VDS üzerinde.",
    cs_p2: "Orb, canlı durumu Pterodactyl API'sinden, bir Minecraft sunucu ping'inden ve gerçek TPS/MSPT için RCON + spark'tan çeker. Sayılardan oluşan bir panel yerine, her sunucu bir abyss küresi üzerinde enerji bölgesine dönüşür: çalışan sunucular ışıldar, zorlanan biri titrer, çöken biri soğur.",
    cs_ctaEyebrow: "GERÇEK ZAMANLI",
    cs_ctaTitle: "Orb'u Aç",
  },
  en: {
    nav_work: "Work",
    hero_eyebrow: "KEREM ALKAN",
    hero_l1: "I build systems",
    hero_l2: "that feel alive.",
    hero_lead: "Game infrastructure, automation, and real-time interfaces. Currently running CraftAbyss — a self-hosted Minecraft network.",
    hero_viewWork: "View work",
    hero_radar: "CraftAbyss Orb",
    selectedWork: "Selected work",
    about_bio: "I design and run systems end to end — from self-hosted game infrastructure to real-time interfaces.",
    cs_back: "BACK",
    cs_eyebrow: "PROJECT 01 · GAME INFRASTRUCTURE",
    cs_lead: "A self-hosted Minecraft network — and Orb, the live operations view built to watch it breathe.",
    cs_meta: [["Role", "Solo — infra & design"], ["Stack", "Velocity · Paper · Pterodactyl"], ["Year", "2026"]],
    cs_p1: "CraftAbyss runs a Velocity proxy in front of Paper 1.21.11 backends, orchestrated on Pterodactyl and backed by LeaderOS, LuckPerms, MariaDB and BlueMap — all on a single VDS I administer end to end.",
    cs_p2: "Orb pulls live state from the Pterodactyl API, a Minecraft server ping, and RCON + spark for real TPS and MSPT. Instead of a dashboard of numbers, each server becomes a zone of energy on an abyss orb: alive servers radiate, a struggling one flickers, a down one goes cold.",
    cs_ctaEyebrow: "REAL-TIME",
    cs_ctaTitle: "Open the Orb",
  },
};

const PROJECTS = [
  {
    id: "craftabyss", no: "01", live: true, title: "CraftAbyss",
    tag: { tr: "OYUN ALTYAPISI", en: "GAME INFRASTRUCTURE" },
    blurb: { tr: "Canlı operasyon görünümü Orb'a sahip, kendi sunucumda barındırdığım Minecraft ağı.", en: "Self-hosted Minecraft network with Orb — a live operations view." },
  },
  {
    id: "aispear", no: "02", live: true, href: "/aispear", title: "AISpear",
    tag: { tr: "OTOMASYON", en: "AUTOMATION" },
    blurb: { tr: "Warspear Online için yerel çalışan, lisanslı otomasyon — vision + VLM.", en: "Local, licensed automation for Warspear Online — vision + VLM." },
  },
  {
    id: "lab", no: "03", live: false, title: "The Lab",
    tag: { tr: "DENEYLER", en: "EXPERIMENTS" },
    blurb: { tr: "Arayüzler, araçlar ve geliştirilmekte olan şeyler.", en: "Interfaces, tools, and things in progress." },
  },
];

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

/* ============================== PORTFOLIO (light shell) ============================== */
function ProjectCard({ p, onOpen, lang }) {
  const router = useRouter();
  const open = () => {
    if (p.href) router.push(p.href);
    else if (p.live) onOpen("case");
  };
  return (
    <button onClick={open}
      style={{ textAlign: "left", border: `1px solid ${L.line}`, borderRadius: 18, padding: 0, overflow: "hidden",
        background: L.surface, cursor: p.live ? "pointer" : "default", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 150, position: "relative", overflow: "hidden",
        background: p.id === "craftabyss"
          ? "radial-gradient(120% 120% at 30% 20%, #1b1030 0%, #07060b 55%, #1a0508 100%)"
          : p.id === "aispear"
          ? "radial-gradient(120% 120% at 30% 20%, #1F1733 0%, #0B0710 55%, #0E0A14 100%)"
          : "linear-gradient(135deg,#ededf0,#f7f7f9)" }}>
        {p.id === "craftabyss" && (
          <>
            <div style={{ position: "absolute", inset: 0, opacity: 0.5,
              background: "radial-gradient(40% 60% at 70% 70%, rgba(45,212,191,0.4), transparent), radial-gradient(40% 50% at 25% 30%, rgba(168,85,247,0.45), transparent)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/calogo-web.png" alt="CraftAbyss" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px 0" }} />
            </div>
          </>
        )}
        {p.id === "aispear" && (
          <>
            <div style={{ position: "absolute", inset: 0, opacity: 0.6,
              background: "radial-gradient(42% 60% at 72% 72%, rgba(232,176,75,0.38), transparent), radial-gradient(44% 55% at 24% 28%, rgba(124,58,237,0.42), transparent)" }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/aispear-mark.svg" alt="AISpear" style={{ height: 82, width: "auto", filter: "drop-shadow(0 0 14px rgba(232,176,75,0.5))" }} />
            </div>
          </>
        )}
        {p.live && (
          <span className="m" style={{ position: "absolute", top: 12, right: 12, fontSize: 10, letterSpacing: 1, color: "#fff",
            background: "rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.5)", padding: "4px 9px", borderRadius: 99 }}>● LIVE</span>
        )}
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div className="m" style={{ fontSize: 11, letterSpacing: 1.5, color: L.faint, marginBottom: 8 }}>{p.no} · {p.tag[lang]}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 600, color: L.ink, letterSpacing: "-0.02em" }}>{p.title}</span>
          {p.live && <ArrowUpRight size={18} color={L.ink} />}
        </div>
        <div style={{ fontSize: 15, color: L.gray, marginTop: 6, lineHeight: 1.45 }}>{p.blurb[lang]}</div>
      </div>
    </button>
  );
}

function About({ lang }) {
  const t = STR[lang];
  const [imgOk, setImgOk] = useState(true);
  return (
    <section style={{ padding: "8px 24px clamp(40px,8vw,72px)", maxWidth: 1080, margin: "0 auto" }}>
      <div style={{ borderTop: `1px solid ${L.line}`, paddingTop: 36, display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        {imgOk ? (
          <img src="/kerem-avatar.jpg" alt="Kerem Alkan" onError={() => setImgOk(false)}
            style={{ width: 96, height: 96, borderRadius: 24, objectFit: "cover", objectPosition: "center 22%", border: `1px solid ${L.line}`, flexShrink: 0 }} />
        ) : (
          <div style={{ width: 96, height: 96, borderRadius: 24, flexShrink: 0, background: L.ink, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700 }}>K</div>
        )}
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: L.ink, letterSpacing: "-0.01em" }}>Kerem Alkan</div>
          <p style={{ fontSize: 15, color: L.gray, lineHeight: 1.5, marginTop: 6, maxWidth: 520 }}>{t.about_bio}</p>
          <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
            <a className="soc" href={SOCIAL.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram size={20} /></a>
            <a className="soc" href={SOCIAL.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={20} /></a>
            <a className="soc" href={SOCIAL.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Home({ onOpen, gridRef, lang }) {
  const t = STR[lang];
  return (
    <div>
      <section style={{ padding: "clamp(48px,12vw,120px) 24px clamp(40px,8vw,80px)", maxWidth: 1080, margin: "0 auto" }}>
        <div className="m" style={{ fontSize: 12, letterSpacing: 2.5, color: L.faint, marginBottom: 22 }}>{t.hero_eyebrow}</div>
        <h1 style={{ fontSize: "clamp(40px,8.5vw,82px)", fontWeight: 600, letterSpacing: "-0.035em", lineHeight: 1.04, color: L.ink, margin: 0, maxWidth: 900 }}>
          {t.hero_l1}<br />{t.hero_l2}
        </h1>
        <p style={{ fontSize: "clamp(17px,2.4vw,21px)", color: L.gray, lineHeight: 1.5, marginTop: 28, maxWidth: 620 }}>
          {t.hero_lead}
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap" }}>
          <button onClick={() => gridRef.current && gridRef.current.scrollIntoView({ behavior: "smooth" })}
            style={{ background: L.ink, color: "#fff", border: "none", borderRadius: 99, padding: "13px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}>
            {t.hero_viewWork}
          </button>
          <button onClick={() => onOpen("case")}
            style={{ background: "transparent", color: L.ink, border: `1px solid ${L.line}`, borderRadius: 99, padding: "13px 24px", fontSize: 15, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            {t.hero_radar} <ArrowRight size={16} />
          </button>
        </div>
      </section>

      <section ref={gridRef} style={{ padding: "20px 24px clamp(28px,6vw,56px)", maxWidth: 1080, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28, borderTop: `1px solid ${L.line}`, paddingTop: 28 }}>
          <h2 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 600, letterSpacing: "-0.02em", color: L.ink, margin: 0 }}>{t.selectedWork}</h2>
          <span className="m" style={{ fontSize: 12, letterSpacing: 1.5, color: L.faint }}>2026</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {PROJECTS.map((p) => <ProjectCard key={p.id} p={p} onOpen={onOpen} lang={lang} />)}
        </div>
      </section>

      <About lang={lang} />
    </div>
  );
}

function CaseStudy({ onBack, onLaunch, lang }) {
  const t = STR[lang];
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 80px" }}>
      <button onClick={onBack} className="m" style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", color: L.gray, fontSize: 13, letterSpacing: 1, cursor: "pointer", marginBottom: 36 }}>
        <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} /> {t.cs_back}
      </button>
      <div className="m" style={{ fontSize: 12, letterSpacing: 2, color: L.faint, marginBottom: 14 }}>{t.cs_eyebrow}</div>
      <h1 style={{ fontSize: "clamp(36px,7vw,64px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: L.ink, margin: 0 }}>CraftAbyss</h1>
      <p style={{ fontSize: "clamp(18px,2.5vw,22px)", color: L.gray, lineHeight: 1.5, marginTop: 22, maxWidth: 640 }}>
        {t.cs_lead}
      </p>
      <div style={{ marginTop: 32, borderRadius: 20, overflow: "hidden", border: `1px solid ${L.line}`,
        background: "radial-gradient(120% 140% at 50% 0%, #1b1030, #07060b 60%, #1a0508)", display: "flex", justifyContent: "center" }}>
        <img src="/calogo-web.png" alt="CraftAbyss" style={{ width: "100%", maxWidth: 520, height: "auto", display: "block" }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "40px 0", borderTop: `1px solid ${L.line}`, borderBottom: `1px solid ${L.line}`, padding: "24px 0" }}>
        {t.cs_meta.map(([k, v]) => (
          <div key={k}>
            <div className="m" style={{ fontSize: 11, letterSpacing: 1.2, color: L.faint, marginBottom: 7 }}>{k.toUpperCase()}</div>
            <div style={{ fontSize: 15, color: L.ink, fontWeight: 500, lineHeight: 1.35 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 17, color: L.ink, lineHeight: 1.65, maxWidth: 640 }}>
        <p style={{ margin: "0 0 20px" }}>{t.cs_p1}</p>
        <p style={{ margin: 0, color: L.gray }}>{t.cs_p2}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
        {["Velocity", "Paper 1.21.11", "Pterodactyl", "LeaderOS", "MariaDB", "RCON + spark", "three.js"].map((tag) => (
          <span key={tag} className="m" style={{ fontSize: 12, color: L.gray, border: `1px solid ${L.line}`, borderRadius: 99, padding: "6px 13px" }}>{tag}</span>
        ))}
      </div>

      <button onClick={onLaunch}
        style={{ width: "100%", marginTop: 44, border: "none", borderRadius: 20, padding: "32px 28px", cursor: "pointer", position: "relative", overflow: "hidden",
          background: "radial-gradient(120% 140% at 30% 10%, #1b1030 0%, #07060b 55%, #1a0508 100%)", textAlign: "left" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.55,
          background: "radial-gradient(40% 70% at 80% 80%, rgba(45,212,191,0.35), transparent), radial-gradient(45% 60% at 15% 30%, rgba(168,85,247,0.5), transparent)" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
          <OrbMark size={44} glow gid="orbCta" />
          <div style={{ flex: 1 }}>
            <div className="m" style={{ fontSize: 11, letterSpacing: 2, color: D.teal, marginBottom: 7 }}>{t.cs_ctaEyebrow}</div>
            <div style={{ fontSize: 21, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{t.cs_ctaTitle}</div>
          </div>
          <ArrowRight size={22} color="#fff" />
        </div>
      </button>
    </div>
  );
}

/* ============================== LANGUAGE TOGGLE ============================== */
function LangToggle({ lang, setLang }) {
  return (
    <div style={{ display: "flex", border: `1px solid ${L.line}`, borderRadius: 99, overflow: "hidden" }}>
      {["tr", "en"].map((lng) => (
        <button key={lng} onClick={() => setLang(lng)} className="m" aria-pressed={lang === lng}
          style={{ padding: "6px 11px", fontSize: 11, letterSpacing: 1, border: "none", cursor: "pointer",
            background: lang === lng ? L.ink : "transparent", color: lang === lng ? "#fff" : L.gray, transition: "background .2s,color .2s" }}>
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/* ============================== APP ============================== */
export default function Portfolio() {
  const [route, setRoute] = useState("home"); // home | case
  const [overlay, setOverlay] = useState(false);
  const [lang, setLang] = useState("tr");
  const gridRef = useRef(null);
  const router = useRouter();
  const reduce = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // language: load saved preference, persist, sync <html lang>
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ka_lang");
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch (e) {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("ka_lang", lang); } catch (e) {}
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const launch = () => {
    if (reduce) { router.push("/craftabyss/live"); return; }
    setOverlay(true);
    setTimeout(() => router.push("/craftabyss/live"), 520);
  };

  const css = `
    *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
    .m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
    .soc{color:#86868b;transition:color .2s}
    .soc:hover{color:#1d1d1f}
    @keyframes abPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
    @keyframes abReveal{0%{opacity:0}28%{opacity:1}60%{opacity:1}100%{opacity:0}}
    @media (max-width:430px){.navwork{display:none}}
    @media (prefers-reduced-motion: reduce){*{animation-duration:.001ms !important}}
  `;

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: L.bg, color: L.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>

      <nav style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 14, padding: "16px 24px",
        background: "rgba(245,245,247,0.8)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${L.line}` }}>
        <button onClick={() => setRoute("home")} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: L.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>K</span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: L.ink }}>Kerem Alkan</span>
        </button>
        <div style={{ flex: 1 }} />
        <button className="navwork" onClick={() => { setRoute("home"); setTimeout(() => gridRef.current && gridRef.current.scrollIntoView({ behavior: "smooth" }), 50); }}
          style={{ background: "none", border: "none", color: L.gray, fontSize: 14, cursor: "pointer" }}>{STR[lang].nav_work}</button>
        <button onClick={() => setRoute("case")} className="m"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: `1px solid ${L.line}`, borderRadius: 99, padding: "7px 13px", fontSize: 12, letterSpacing: 0.5, color: L.ink, cursor: "pointer" }}>
          CraftAbyss <ArrowUpRight size={14} />
        </button>
        <LangToggle lang={lang} setLang={setLang} />
      </nav>

      {route === "home" && <Home onOpen={setRoute} gridRef={gridRef} lang={lang} />}
      {route === "case" && <CaseStudy onBack={() => setRoute("home")} onLaunch={launch} lang={lang} />}

      <footer style={{ borderTop: `1px solid ${L.line}`, padding: "28px 24px", maxWidth: 1080, margin: "0 auto" }}>
        <div className="m" style={{ fontSize: 12, color: L.faint, letterSpacing: 1 }}>© 2026 KEREM ALKAN · keremalkan.com</div>
      </footer>

      {overlay && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none", animation: "abReveal 1080ms ease forwards",
          background: "radial-gradient(60% 60% at 50% 45%, #1b1030, #07060b 70%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ animation: "abPulse 1.2s infinite" }}><OrbMark size={64} glow gid="orbOv" /></div>
        </div>
      )}
    </div>
  );
}
