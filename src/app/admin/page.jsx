// AISpear Admin — kullanıcı/lisans tablosu (KOYU). Sadece role==='admin'.
// Middleware korur; getSession() ile çift kontrol. Şifre/hash ASLA gösterilmez.
import { redirect } from "next/navigation";
import { LogOut, ArrowLeft } from "lucide-react";
import { getSession } from "@/lib/aispear-session";
import { listUsersSafe } from "@/lib/aispear-users";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", green: "#34D399" };

function SpearMark({ size = 28 }) {
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

export default async function Admin() {
  const session = await getSession();
  if (!session) redirect("/aispear/login?next=/admin");
  if (session.role !== "admin") redirect("/hub");

  const users = listUsersSafe();

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace} a.btn{text-decoration:none}`}</style>

      <nav style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 24px", borderBottom: `1px solid ${D.line}`,
        position: "sticky", top: 0, background: "rgba(11,7,16,0.85)", backdropFilter: "blur(12px)", zIndex: 10 }}>
        <SpearMark size={28} />
        <span style={{ fontSize: 16, fontWeight: 700 }}>AISpear</span>
        <span className="m" style={{ fontSize: 11, letterSpacing: 1.5, color: D.gold }}>ADMIN</span>
        <div style={{ flex: 1 }} />
        <a href="/hub" className="btn m" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: 0.5, color: D.muted,
          border: `1px solid ${D.line}`, borderRadius: 99, padding: "7px 13px" }}>
          <ArrowLeft size={13} /> HUB
        </a>
        <a href="/api/logout" className="btn m" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: 0.5, color: D.muted,
          border: `1px solid ${D.line}`, borderRadius: 99, padding: "7px 13px" }}>
          <LogOut size={13} /> ÇIKIŞ
        </a>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "40px 24px 80px" }}>
        <div className="m" style={{ fontSize: 12, letterSpacing: 2, color: D.muted }}>ERİŞİM & LİSANS</div>
        <h1 style={{ fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "10px 0 6px" }}>Kullanıcılar</h1>
        <p style={{ fontSize: 14, color: D.muted, margin: "0 0 28px" }}>
          Kaynak: <span className="m" style={{ color: D.ink }}>AISPEAR_USERS</span> (env). Lisans iptali için kullanıcıyı env/DB'de pasifleştir.
        </p>

        <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 16, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 0, padding: "14px 20px", borderBottom: `1px solid ${D.line}` }}>
            {["KULLANICI", "ROL", "DURUM"].map((h) => (
              <div key={h} className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>{h}</div>
            ))}
          </div>
          {users.length === 0 && (
            <div style={{ padding: "22px 20px", color: D.muted, fontSize: 14 }}>
              Kullanıcı yok. <span className="m" style={{ color: D.ink }}>AISPEAR_USERS</span> env değişkenini ayarla.
            </div>
          )}
          {users.map((u, i) => (
            <div key={u.username} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", alignItems: "center",
              padding: "14px 20px", borderTop: i === 0 ? "none" : `1px solid ${D.line}` }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{u.username}</div>
              <div>
                <span className="m" style={{ fontSize: 11, letterSpacing: 0.5, padding: "3px 9px", borderRadius: 99,
                  color: u.role === "admin" ? D.gold : D.muted,
                  border: `1px solid ${u.role === "admin" ? "rgba(232,176,75,0.4)" : D.line}` }}>
                  {(u.role || "user").toUpperCase()}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: D.green, boxShadow: `0 0 7px ${D.green}` }} />
                <span style={{ fontSize: 13.5, color: D.ink }}>Aktif</span>
              </div>
            </div>
          ))}
        </div>

        <div className="m" style={{ marginTop: 24, fontSize: 11.5, color: D.muted, lineHeight: 1.6 }}>
          İleride: kullanıcı ekle/çıkar, lisans iptal düğmesi, son doğrulama zamanı — env yerine DB'ye geçince eklenir.
        </div>
      </div>
    </div>
  );
}
