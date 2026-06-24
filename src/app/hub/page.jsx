// AISpear Hub — girişli kullanıcı alanı (KOYU). Middleware korur; getSession() ile çift kontrol.
import { redirect } from "next/navigation";
import { ShieldCheck, Download, LogOut, Lock } from "lucide-react";
import { getSession } from "@/lib/aispear-session";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };

function SpearMark({ size = 30 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" style={{ filter: "drop-shadow(0 0 10px rgba(232,176,75,0.5))" }}>
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B" />
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B" />
      <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B" />
    </svg>
  );
}

export const dynamic = "force-dynamic";

export default async function Hub() {
  const session = await getSession();
  if (!session) redirect("/aispear/login?next=/hub");
  const isAdmin = session.isAdmin || session.role === "admin";

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        a.btn{text-decoration:none}`}</style>

      <nav style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${D.line}`,
        position: "sticky", top: 0, background: "rgba(11,7,16,0.85)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <SpearMark size={28} />
        <span style={{ fontSize: 16, fontWeight: 700 }}>AISpear</span>
        <span className="m" style={{ fontSize: 11, letterSpacing: 1.5, color: D.muted }}>HUB</span>
        <div style={{ flex: 1 }} />
        {isAdmin && (
          <a href="/admin" className="btn m" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: 0.5, color: D.gold,
            border: `1px solid ${D.line}`, borderRadius: 99, padding: "7px 13px" }}>
            <Lock size={13} /> ADMIN
          </a>
        )}
        <a href="/api/logout" className="btn m" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: 0.5, color: D.muted,
          border: `1px solid ${D.line}`, borderRadius: 99, padding: "7px 13px" }}>
          <LogOut size={13} /> ÇIKIŞ
        </a>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div className="m" style={{ fontSize: 12, letterSpacing: 2, color: D.muted }}>HOŞ GELDİN</div>
        <h1 style={{ fontSize: "clamp(30px,6vw,46px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 0" }}>{session.username}</h1>

        {/* Lisans durumu */}
        <div style={{ marginTop: 32, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} color={D.green} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: D.green, boxShadow: `0 0 8px ${D.green}` }} />
              <span style={{ fontSize: 17, fontWeight: 600 }}>Lisans aktif</span>
            </div>
            <div style={{ fontSize: 13.5, color: D.muted, marginTop: 4 }}>
              Oturumun geçerli — launcher ve botun çalışabilir. Rol: <b style={{ color: D.ink }}>{session.role}</b>
            </div>
          </div>
        </div>

        {/* Launcher indir */}
        <div style={{ marginTop: 16, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 }}>
          <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Launcher (Windows)</div>
          <div style={{ fontSize: 13.5, color: D.muted, marginBottom: 16, lineHeight: 1.5 }}>
            Launcher senin hesabınla giriş yapar, lisansı bu siteden doğrular ve botu başlatır. Bot ve .exe senin makinende kalır.
          </div>
          <span className="m" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: D.muted,
            border: `1px dashed ${D.line}`, borderRadius: 11, padding: "12px 16px" }}>
            <Download size={15} /> Launcher yakında yayınlanacak
          </span>
        </div>

        <div className="m" style={{ marginTop: 28, fontSize: 11.5, color: D.muted, lineHeight: 1.6 }}>
          Lisans iptal akışı: hesabın pasifleştirilirse <span style={{ color: D.ink }}>/api/validate</span> reddeder ve botun bir daha açılmaz.
        </div>
      </div>
    </div>
  );
}
