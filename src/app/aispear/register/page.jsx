"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };

function SpearMark({ size = 52 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" style={{ filter: "drop-shadow(0 0 16px rgba(232,176,75,0.55))" }}>
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B" />
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B" />
      <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B" />
    </svg>
  );
}

export default function Register() {
  const router = useRouter();
  const [f, setF] = useState({ username: "", email: "", password: "", licenseKey: "" });
  const [hasLicense, setHasLicense] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tsToken, setTsToken] = useState("");
  const tsRef = useRef(null);

  useEffect(() => {
    document.body.style.background = D.bg;
    const sk = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    let script;
    if (sk) {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        try { if (window.turnstile && tsRef.current) window.turnstile.render(tsRef.current, { sitekey: sk, callback: (t) => setTsToken(t) }); } catch {}
      };
      document.body.appendChild(script);
    }
    return () => { document.body.style.background = ""; try { if (script) document.body.removeChild(script); } catch {} };
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const r = await fetch("/api/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, licenseKey: hasLicense ? f.licenseKey : "", turnstile: tsToken }),
      });
      const d = await r.json(); setLoading(false);
      if (!d.ok) { setError(d.error || "Kayıt başarısız."); return; }
      setDone(d.message || "Başvurun alındı.");
    } catch { setLoading(false); setError("Bağlantı hatası."); }
  }

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.ink, position: "relative", overflow: "hidden",
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        .ai-in{width:100%;background:${D.bg};border:1px solid ${D.line};border-radius:10px;padding:12px 14px;color:${D.ink};font-size:15px}
        .ai-in:focus{outline:none;border-color:${D.gold}} input::placeholder{color:#5d5872}`}</style>
      <div style={{ position: "absolute", inset: 0, opacity: 0.7, pointerEvents: "none",
        background: "radial-gradient(40% 50% at 78% 18%, rgba(232,176,75,0.16), transparent), radial-gradient(45% 55% at 18% 82%, rgba(124,58,237,0.28), transparent)" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <SpearMark size={52} />
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 14 }}>AISpear</div>
          <div className="m" style={{ fontSize: 11, letterSpacing: 2, color: D.muted, marginTop: 6 }}>KAYIT OL</div>
        </div>

        {done ? (
          <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 26, textAlign: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(52,211,153,0.14)", border: "1px solid rgba(52,211,153,0.45)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", color: D.green, fontSize: 22 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Teşekkürler!</div>
            <div style={{ fontSize: 14, color: D.muted, lineHeight: 1.55 }}>{done}</div>
            <button onClick={() => router.push("/aispear/login")} className="m"
              style={{ marginTop: 18, background: "none", border: `1px solid ${D.line}`, borderRadius: 10, padding: "10px 16px", color: D.ink, cursor: "pointer", fontSize: 13 }}>
              Giriş sayfasına git
            </button>
          </div>
        ) : (
          <form onSubmit={submit} style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 }}>
            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>KULLANICI ADI</label>
            <input className="ai-in" style={{ marginTop: 6, marginBottom: 14 }} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} autoFocus />

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>E-POSTA</label>
            <input className="ai-in" type="email" style={{ marginTop: 6, marginBottom: 14 }} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>PAROLA</label>
            <input className="ai-in" type="password" style={{ marginTop: 6, marginBottom: 14 }} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />

            <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: D.ink, cursor: "pointer", marginBottom: hasLicense ? 12 : 4 }}>
              <input type="checkbox" checked={hasLicense} onChange={(e) => setHasLicense(e.target.checked)} /> Lisans anahtarım var
            </label>
            {hasLicense && (
              <input className="ai-in" style={{ marginBottom: 6, fontFamily: "ui-monospace,monospace", letterSpacing: 1 }} placeholder="AISP-XXXX-XXXX-XXXX" value={f.licenseKey} onChange={(e) => setF({ ...f, licenseKey: e.target.value })} />
            )}
            <div style={{ fontSize: 12, color: D.muted, marginTop: 8, lineHeight: 1.5 }}>
              {hasLicense ? "Lisansla kayıt: hesabın açılır, lisansın yönetici onayıyla aktifleşir." : "Lisanssız kayıt: hesabın yönetici onayından sonra açılır; lisansı sonra hub'dan girebilirsin."}
            </div>

            <div ref={tsRef} style={{ marginTop: 14 }} />

            {error && <div style={{ marginTop: 14, color: "#F87171", fontSize: 13.5 }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ width: "100%", marginTop: 18, border: "none", borderRadius: 11, padding: "13px 16px", cursor: loading ? "default" : "pointer",
                fontSize: 15, fontWeight: 600, color: "#1a1206", opacity: loading ? 0.7 : 1, background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
              {loading ? "Gönderiliyor…" : "Kayıt ol"}
            </button>
          </form>
        )}

        <button onClick={() => router.push("/aispear/login")} className="m"
          style={{ display: "block", margin: "18px auto 0", background: "none", border: "none", color: D.muted, fontSize: 12, cursor: "pointer" }}>
          Zaten hesabın var mı? Giriş yap
        </button>
      </div>
    </div>
  );
}
