"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/* Koyu app tokenları (ORB ailesi — abyss + altın mızrak imzası) */
const D = {
  bg: "#0B0710", surface: "#171123", line: "#2A2140",
  ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", violet: "#7C3AED",
};

function SpearMark({ size = 56 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none"
      style={{ filter: "drop-shadow(0 0 16px rgba(232,176,75,0.55))" }}>
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B" />
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B" />
      <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B" />
    </svg>
  );
}

export default function AISpearLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [next, setNext] = useState("");

  useEffect(() => {
    document.body.style.background = D.bg;
    try {
      const p = new URLSearchParams(window.location.search).get("next");
      if (p && p.startsWith("/")) setNext(p);
    } catch {}
    const onKey = (e) => { if (e.key === "Escape") router.push("/aispear"); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.background = ""; window.removeEventListener("keydown", onKey); };
  }, [router]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.push(next || (data.isAdmin ? "/admin" : "/hub"));
        router.refresh();
      } else {
        setError(data.error || "Giriş başarısız.");
        setLoading(false);
      }
    } catch {
      setError("Bağlantı hatası.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.ink, position: "relative", overflow: "hidden",
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        input::placeholder{color:#5d5872}
        .ai-in:focus{outline:none;border-color:${D.gold}}`}</style>

      {/* atmosferik parıltı */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.7, pointerEvents: "none",
        background: "radial-gradient(40% 50% at 78% 18%, rgba(232,176,75,0.16), transparent), radial-gradient(45% 55% at 18% 82%, rgba(124,58,237,0.28), transparent)" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <SpearMark size={56} />
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 14 }}>AISpear</div>
          <div className="m" style={{ fontSize: 11, letterSpacing: 2, color: D.muted, marginTop: 6 }}>ÜYE GİRİŞİ</div>
        </div>

        <form onSubmit={submit} style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 }}>
          <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>KULLANICI ADI</label>
          <input className="ai-in" value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username"
            style={{ width: "100%", marginTop: 7, marginBottom: 16, background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10,
              padding: "12px 14px", color: D.ink, fontSize: 15 }} />

          <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ŞİFRE</label>
          <input className="ai-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password"
            style={{ width: "100%", marginTop: 7, background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10,
              padding: "12px 14px", color: D.ink, fontSize: 15 }} />

          {error && <div style={{ marginTop: 14, color: "#F87171", fontSize: 13.5 }}>{error}</div>}

          <button type="submit" disabled={loading}
            style={{ width: "100%", marginTop: 20, border: "none", borderRadius: 11, padding: "13px 16px", cursor: loading ? "default" : "pointer",
              fontSize: 15, fontWeight: 600, color: "#1a1206",
              background: loading ? "#7a6a3f" : `linear-gradient(135deg, ${D.gold}, ${D.goldDark})`,
              opacity: loading ? 0.7 : 1 }}>
            {loading ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>

        <button onClick={() => router.push("/aispear")} className="m"
          style={{ display: "block", margin: "18px auto 0", background: "none", border: "none", color: D.muted, fontSize: 12, letterSpacing: 0.5, cursor: "pointer" }}>
          ← AISpear sayfasına dön
        </button>
      </div>
    </div>
  );
}
