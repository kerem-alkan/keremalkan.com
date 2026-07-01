"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

/* Açık kabuk (site yüzü) */
const L = { bg: "#f5f5f7", surface: "#ffffff", ink: "#1d1d1f", gray: "#6e6e73", faint: "#86868b", line: "#d2d2d7" };
const TEAL = "#2DD4BF";

const STR = {
  tr: {
    back: "GERİ",
    eyebrow: "PROJE 01 · OYUN ALTYAPISI",
    lead: "Kendi sunucularımda barındırdığım Minecraft ağı. Velocity proxy, Paper sunucular, Pterodactyl panel — ve hepsinin üstünde canlı operasyon görünümü: Orb.",
    meta: [["Rol", "Tek kişi — altyapı & ops"], ["Yığın", "Velocity · Paper · Pterodactyl"], ["Yıl", "2026"]],
    p1: "CraftAbyss; Velocity proxy arkasında Paper tabanlı lobi ve survival sunucularından oluşan, Pterodactyl ile yönetilen self-hosted bir Minecraft ağıdır. Tamamı kendi VDS'imde çalışır.",
    p2: "Orb, ağın canlı operasyon radarıdır: anlık oyuncu sayıları, TPS, ekonomi ve sunucu durumu gerçek veriyle akar. keremalkan.com bu veriyi orb-agent'tan çeker.",
    feat: [
      ["Orb — canlı izleme", "Oyuncu, TPS, ekonomi gerçek-zamanlı."],
      ["Self-hosted altyapı", "Velocity + Paper + Pterodactyl, kendi VDS'inde."],
      ["Gerçek veri", "Simülasyon değil; orb-agent'tan canlı akış."],
    ],
    ctaEyebrow: "CANLI",
    ctaTitle: "Orb'u aç — canlı izle",
    ctaSub: "Ağın gerçek-zamanlı operasyon görünümü.",
  },
  en: {
    back: "BACK",
    eyebrow: "PROJECT 01 · GAME INFRASTRUCTURE",
    lead: "A self-hosted Minecraft network. Velocity proxy, Paper servers, Pterodactyl panel — and a live operations view on top: Orb.",
    meta: [["Role", "Solo — infra & ops"], ["Stack", "Velocity · Paper · Pterodactyl"], ["Year", "2026"]],
    p1: "CraftAbyss is a self-hosted Minecraft network: Paper-based lobby and survival servers behind a Velocity proxy, managed with Pterodactyl. It all runs on my own VDS.",
    p2: "Orb is the network's live ops radar: real-time player counts, TPS, economy and server state. keremalkan.com pulls this data from the orb-agent.",
    feat: [
      ["Orb — live view", "Players, TPS, economy in real time."],
      ["Self-hosted infra", "Velocity + Paper + Pterodactyl on my VDS."],
      ["Real data", "Not simulated; live from the orb-agent."],
    ],
    ctaEyebrow: "LIVE",
    ctaTitle: "Open Orb — live view",
    ctaSub: "The network's real-time operations view.",
  },
};

export default function CraftAbyssPage() {
  const router = useRouter();
  const [lang, setLang] = useState("tr");
  useEffect(() => {
    try { const s = localStorage.getItem("ka_lang"); if (s === "tr" || s === "en") setLang(s); } catch {}
  }, []);
  const t = STR[lang];

  return (
    <div style={{ minHeight: "100vh", background: L.bg, color: L.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style dangerouslySetInnerHTML={{ __html: `.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        .feat-card{transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .4s ease,border-color .4s ease}
        .feat-card:hover{transform:translateY(-4px);box-shadow:0 16px 36px -20px rgba(20,20,30,.22);border-color:#bcbcc4}
        .cta-block{transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .5s ease}
        .cta-block:hover{transform:translateY(-3px);box-shadow:0 30px 60px -28px rgba(10,20,30,.5)}
        .cta-arrow{display:inline-flex;transition:transform .35s cubic-bezier(.22,1,.36,1)}
        .cta-block:hover .cta-arrow{transform:translateX(5px)}
        .darkhero-img{transition:transform .6s cubic-bezier(.22,1,.36,1)}
        .darkhero:hover .darkhero-img{transform:scale(1.04)}
        .tagpill{transition:border-color .3s ease,color .3s ease}
        .tagpill:hover{border-color:#9a9aa2;color:#1d1d1f}
        @media (prefers-reduced-motion:reduce){.feat-card,.cta-block,.cta-arrow,.darkhero-img,.tagpill{transition:none}}` }} />

      <nav style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 12,
        padding: "16px 24px", background: "rgba(245,245,247,0.8)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${L.line}` }}>
        <button onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", gap: 9, background: "none", border: "none", cursor: "pointer" }}>
          <span style={{ width: 26, height: 26, borderRadius: 7, background: L.ink, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>K</span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: L.ink }}>Kerem Alkan</span>
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", border: `1px solid ${L.line}`, borderRadius: 99, overflow: "hidden" }}>
          {["tr", "en"].map((lng) => (
            <button key={lng} onClick={() => { setLang(lng); try { localStorage.setItem("ka_lang", lng); } catch {} }} className="m"
              style={{ padding: "6px 11px", fontSize: 11, letterSpacing: 1, border: "none", cursor: "pointer",
                background: lang === lng ? L.ink : "transparent", color: lang === lng ? "#fff" : L.gray }}>
              {lng.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px 80px" }}>
        <button onClick={() => router.push("/")} className="m"
          style={{ display: "flex", alignItems: "center", gap: 7, background: "none", border: "none", color: L.gray, fontSize: 13, letterSpacing: 1, cursor: "pointer", marginBottom: 36 }}>
          <ArrowRight size={15} style={{ transform: "rotate(180deg)" }} /> {t.back}
        </button>

        <div className="m" style={{ fontSize: 12, letterSpacing: 2, color: L.faint, marginBottom: 14 }}>{t.eyebrow}</div>
        <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(36px,7vw,64px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: L.ink, margin: 0 }}>CraftAbyss</motion.h1>
        <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontSize: "clamp(18px,2.5vw,22px)", color: L.gray, lineHeight: 1.5, marginTop: 22, maxWidth: 660 }}>{t.lead}</motion.p>

        {/* koyu abyss hero (logo) */}
        <motion.div className="darkhero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginTop: 32, borderRadius: 20, overflow: "hidden", border: `1px solid ${L.line}`, position: "relative",
          background: "radial-gradient(120% 140% at 50% 0%, #15172b, #0b0710 60%, #0e0a14)", minHeight: 260,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.7,
            background: "radial-gradient(38% 60% at 50% 20%, rgba(45,212,191,0.28), transparent), radial-gradient(45% 60% at 50% 95%, rgba(124,58,237,0.42), transparent)" }} />
          <img className="darkhero-img" src="/calogo-web.png" alt="CraftAbyss" style={{ position: "relative", height: 220, width: "auto", filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.5))" }} />
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "40px 0", borderTop: `1px solid ${L.line}`, borderBottom: `1px solid ${L.line}`, padding: "24px 0" }}>
          {t.meta.map(([k, v]) => (
            <div key={k}>
              <div className="m" style={{ fontSize: 11, letterSpacing: 1.2, color: L.faint, marginBottom: 7 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 15, color: L.ink, fontWeight: 500, lineHeight: 1.35 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 17, color: L.ink, lineHeight: 1.65, maxWidth: 660 }}>
          <p style={{ margin: "0 0 20px" }}>{t.p1}</p>
          <p style={{ margin: 0, color: L.gray }}>{t.p2}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 32 }}>
          {t.feat.map(([h, d], idx) => (
            <motion.div key={h} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }} style={{ display: "flex" }}>
              <div className="feat-card" style={{ width: "100%", border: `1px solid ${L.line}`, borderRadius: 14, padding: "16px 16px", background: L.surface }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: L.ink, marginBottom: 6 }}>{h}</div>
                <div style={{ fontSize: 13.5, color: L.gray, lineHeight: 1.45 }}>{d}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
          {["Velocity", "Paper", "Pterodactyl", "RCON", "orb-agent", "Next.js"].map((tag) => (
            <span key={tag} className="m tagpill" style={{ fontSize: 12, color: L.gray, border: `1px solid ${L.line}`, borderRadius: 99, padding: "6px 13px" }}>{tag}</span>
          ))}
        </div>

        {/* koyu CTA → canlı Orb */}
        <button onClick={() => router.push("/craftabyss/live")} className="cta-block"
          style={{ width: "100%", marginTop: 44, border: "none", borderRadius: 20, padding: "30px 28px", cursor: "pointer", position: "relative", overflow: "hidden",
            background: "radial-gradient(120% 140% at 30% 10%, #15172b 0%, #0b0710 55%, #0e0a14 100%)", textAlign: "left" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.6,
            background: "radial-gradient(40% 70% at 84% 80%, rgba(45,212,191,0.30), transparent), radial-gradient(45% 60% at 12% 30%, rgba(124,58,237,0.5), transparent)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
            <img src="/calogo-web.png" alt="" style={{ height: 48, width: "auto" }} />
            <div style={{ flex: 1 }}>
              <div className="m" style={{ fontSize: 11, letterSpacing: 2, color: TEAL, marginBottom: 7 }}>{t.ctaEyebrow}</div>
              <div style={{ fontSize: 21, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{t.ctaTitle}</div>
              <div style={{ fontSize: 13, color: "#8B86A0", marginTop: 4 }}>{t.ctaSub}</div>
            </div>
            <span className="cta-arrow"><ArrowRight size={22} color="#fff" /></span>
          </div>
        </button>
      </div>
    </div>
  );
}
