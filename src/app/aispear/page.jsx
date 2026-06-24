"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

/* Açık kabuk tokenları (site yüzü — Apple açık tema) */
const L = { bg: "#f5f5f7", surface: "#ffffff", ink: "#1d1d1f", gray: "#6e6e73", faint: "#86868b", line: "#d2d2d7" };
const GOLD = "#E8B04B";

const STR = {
  tr: {
    back: "GERİ",
    eyebrow: "PROJE 02 · OTOMASYON",
    lead: "Warspear Online için yerel çalışan, lisanslı bir otomasyon aracı. Ekranı görür, kararı bir görsel-dil modeli verir; launcher lisansı canlı siteden doğrular.",
    meta: [["Rol", "Tek kişi — ürün & mimari"], ["Yığın", "Python · VLM · Tauri"], ["Yıl", "2026"]],
    p1: "AISpear, Warspear Online'ı insan gibi oynayan bir vision + VLM otomasyonudur. Bot motoru kullanıcının kendi makinesinde çalışır: ekranı yakalar, durumu görsel modelle yorumlar; savaş, loot ve navigasyon kararlarını yerelde verir.",
    p2: "Launcher (Tauri/.exe) kullanıcıya dağıtılır; açılışta keremalkan.com'a giriş yapıp bir JWT lisans alır. Bot her açılışta /api/validate'e sorar — lisans iptal edilirse açılmaz. Bot ve .exe siteye girmez; site yalnızca kimliği doğrular ve lisans verir.",
    ctaEyebrow: "ÜYE ALANI",
    ctaTitle: "Aç / Giriş",
    ctaSub: "Launcher indir + lisans durumu girişten sonra.",
    feat: [
      ["Yerel vision + VLM", "Ekranı görür, modeli yorumlar — kararlar makinende kalır."],
      ["Lisanslı launcher", "Tauri .exe; açılışta canlı lisans doğrulaması."],
      ["Uzaktan iptal", "Lisans pasifleştirilince bot bir daha çalışmaz."],
    ],
  },
  en: {
    back: "BACK",
    eyebrow: "PROJECT 02 · AUTOMATION",
    lead: "A locally-running, licensed automation tool for Warspear Online. It sees the screen, a vision-language model decides; the launcher validates its license against the live site.",
    meta: [["Role", "Solo — product & architecture"], ["Stack", "Python · VLM · Tauri"], ["Year", "2026"]],
    p1: "AISpear is a vision + VLM automation that plays Warspear Online like a human. The bot engine runs on the user's own machine: it captures the screen, interprets state with a visual model, and makes combat, loot and navigation decisions locally.",
    p2: "The launcher (Tauri/.exe) is distributed to users; on start it logs into keremalkan.com and receives a JWT license. The bot asks /api/validate on every launch — if the license is revoked it won't open. The bot and .exe never enter the site; the site only authenticates and licenses.",
    ctaEyebrow: "MEMBER AREA",
    ctaTitle: "Open / Sign in",
    ctaSub: "Launcher download + license status after sign-in.",
    feat: [
      ["Local vision + VLM", "Sees the screen, interprets with a model — decisions stay on your machine."],
      ["Licensed launcher", "Tauri .exe; live license check on launch."],
      ["Remote revocation", "Deactivate a license and that bot stops working."],
    ],
  },
};

function SpearMark({ size = 44 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none"
      style={{ filter: "drop-shadow(0 0 12px rgba(232,176,75,0.5))" }}>
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B" />
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B" />
      <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B" />
    </svg>
  );
}

export default function AISpearPage() {
  const router = useRouter();
  const [lang, setLang] = useState("tr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ka_lang");
      if (saved === "tr" || saved === "en") setLang(saved);
    } catch {}
  }, []);

  const t = STR[lang];

  return (
    <div style={{ minHeight: "100vh", background: L.bg, color: L.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        a.aslink{color:inherit;text-decoration:none}`}</style>

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
        <h1 style={{ fontSize: "clamp(36px,7vw,64px)", fontWeight: 600, letterSpacing: "-0.03em", lineHeight: 1.05, color: L.ink, margin: 0 }}>AISpear</h1>
        <p style={{ fontSize: "clamp(18px,2.5vw,22px)", color: L.gray, lineHeight: 1.5, marginTop: 22, maxWidth: 640 }}>{t.lead}</p>

        {/* koyu hero (mızrak) */}
        <div style={{ marginTop: 32, borderRadius: 20, overflow: "hidden", border: `1px solid ${L.line}`, position: "relative",
          background: "radial-gradient(120% 140% at 50% 0%, #1F1733, #0B0710 60%, #0E0A14)", minHeight: 220,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.6,
            background: "radial-gradient(40% 60% at 72% 75%, rgba(232,176,75,0.30), transparent), radial-gradient(44% 55% at 22% 25%, rgba(124,58,237,0.40), transparent)" }} />
          <img src="/aispear-wordmark.svg" alt="AISpear" style={{ position: "relative", width: "100%", maxWidth: 360, height: "auto", color: "#ECE9F2", filter: "drop-shadow(0 0 18px rgba(232,176,75,0.35))" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, margin: "40px 0", borderTop: `1px solid ${L.line}`, borderBottom: `1px solid ${L.line}`, padding: "24px 0" }}>
          {t.meta.map(([k, v]) => (
            <div key={k}>
              <div className="m" style={{ fontSize: 11, letterSpacing: 1.2, color: L.faint, marginBottom: 7 }}>{k.toUpperCase()}</div>
              <div style={{ fontSize: 15, color: L.ink, fontWeight: 500, lineHeight: 1.35 }}>{v}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 17, color: L.ink, lineHeight: 1.65, maxWidth: 640 }}>
          <p style={{ margin: "0 0 20px" }}>{t.p1}</p>
          <p style={{ margin: 0, color: L.gray }}>{t.p2}</p>
        </div>

        {/* özellik üçlüsü */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12, marginTop: 32 }}>
          {t.feat.map(([h, d]) => (
            <div key={h} style={{ border: `1px solid ${L.line}`, borderRadius: 14, padding: "16px 16px", background: L.surface }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: L.ink, marginBottom: 6 }}>{h}</div>
              <div style={{ fontSize: 13.5, color: L.gray, lineHeight: 1.45 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 28 }}>
          {["Python", "Vision / OpenCV", "VLM", "Tauri (.exe)", "JWT lisans", "Next.js"].map((tag) => (
            <span key={tag} className="m" style={{ fontSize: 12, color: L.gray, border: `1px solid ${L.line}`, borderRadius: 99, padding: "6px 13px" }}>{tag}</span>
          ))}
        </div>

        {/* koyu CTA → giriş */}
        <button onClick={() => router.push("/aispear/login")}
          style={{ width: "100%", marginTop: 44, border: "none", borderRadius: 20, padding: "30px 28px", cursor: "pointer", position: "relative", overflow: "hidden",
            background: "radial-gradient(120% 140% at 30% 10%, #1F1733 0%, #0B0710 55%, #0E0A14 100%)", textAlign: "left" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 0.55,
            background: "radial-gradient(40% 70% at 82% 80%, rgba(232,176,75,0.30), transparent), radial-gradient(45% 60% at 14% 30%, rgba(124,58,237,0.5), transparent)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
            <SpearMark size={42} />
            <div style={{ flex: 1 }}>
              <div className="m" style={{ fontSize: 11, letterSpacing: 2, color: GOLD, marginBottom: 7 }}>{t.ctaEyebrow}</div>
              <div style={{ fontSize: 21, fontWeight: 600, color: "#fff", letterSpacing: "-0.01em" }}>{t.ctaTitle}</div>
              <div style={{ fontSize: 13, color: "#8B86A0", marginTop: 4 }}>{t.ctaSub}</div>
            </div>
            <ArrowRight size={22} color="#fff" />
          </div>
        </button>
      </div>
    </div>
  );
}
