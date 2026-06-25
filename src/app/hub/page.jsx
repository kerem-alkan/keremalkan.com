// AISpear Hub — girişli kullanıcı alanı (KOYU). GERÇEK lisans durumu DB'den.
import { redirect } from "next/navigation";
import { ShieldCheck, Clock, Snowflake, KeyRound, Download, LogOut, Lock } from "lucide-react";
import { getLiveSession } from "@/lib/aispear-session";
import { one } from "@/lib/db";
import { licensesForUser } from "@/lib/licenses-db";
import HubRedeem from "@/components/HubRedeem";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };

const LIC = {
  pending_start: { l: "Onay bekliyor", c: "#F59E0B" },
  active: { l: "Aktif", c: "#34D399" },
  frozen: { l: "Dondurulmuş", c: "#60A5FA" },
  suspended: { l: "Askıda", c: "#F59E0B" },
  expired: { l: "Süresi doldu", c: "#8B86A0" },
  revoked: { l: "İptal", c: "#F87171" },
};
const licL = (v) => LIC[v] || { l: v || "—", c: "#8B86A0" };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");
const daysLeft = (d) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null);

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

export default async function Hub() {
  const session = await getLiveSession();
  if (!session) redirect("/api/logout?next=/aispear/login"); // silinen/pasif kullanıcı → cookie temizle + login
  const isAdmin = session.isAdmin || session.role === "admin";

  let uid = session.uid;
  if (!uid) { const u = await one("SELECT id FROM users WHERE username=$1", [session.username]); uid = u ? u.id : null; }
  let licenses = [];
  try { if (uid) licenses = await licensesForUser(uid); } catch {}

  const now = Date.now();
  const active = licenses.find((l) => l.status === "active" && (!l.expires_at || new Date(l.expires_at).getTime() > now));
  const pending = licenses.find((l) => l.status === "pending_start");
  const frozen = licenses.find((l) => l.status === "frozen");
  const overall = active ? "active" : pending ? "pending" : frozen ? "frozen" : "none";

  const SC = {
    active: { icon: ShieldCheck, c: D.green, t: "Lisans aktif", s: active ? `Botun çalışabilir. Bitiş: ${fmt(active.expires_at)}${daysLeft(active.expires_at) != null ? ` (${daysLeft(active.expires_at)} gün)` : ""}` : "Botun çalışabilir." },
    pending: { icon: Clock, c: "#F59E0B", t: "Onay bekleniyor", s: "Lisansın yöneticinin onayında. Onaylanınca aktifleşir." },
    frozen: { icon: Snowflake, c: "#60A5FA", t: "Lisans donduruldu", s: "Lisansın geçici olarak donduruldu. Yöneticiyle iletişime geç." },
    none: { icon: KeyRound, c: D.muted, t: "Aktif lisans yok", s: "Aşağıdan lisans anahtarını girerek hesabına ekle." },
  }[overall];
  const SCIcon = SC.icon;

  return (
    <div style={{ minHeight: "100vh", background: D.bg, color: D.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace} a.btn{text-decoration:none}`}</style>

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

        {/* Gerçek lisans durumu */}
        <div style={{ marginTop: 32, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: `${SC.c}1f`, border: `1px solid ${SC.c}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SCIcon size={24} color={SC.c} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 99, background: SC.c, boxShadow: `0 0 8px ${SC.c}` }} />
              <span style={{ fontSize: 17, fontWeight: 600 }}>{SC.t}</span>
            </div>
            <div style={{ fontSize: 13.5, color: D.muted, marginTop: 4 }}>{SC.s}</div>
          </div>
        </div>

        {/* Lisanslarım */}
        {licenses.length > 0 && (
          <div style={{ marginTop: 16, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Lisanslarım</div>
            {licenses.map((l, i) => {
              const st = licL(l.status);
              return (
                <div key={l.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr 1fr 1fr", gap: 8, alignItems: "center", padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${D.line}` }}>
                  <div className="m" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.key}</div>
                  <div style={{ fontSize: 13, color: st.c }}>{st.l}</div>
                  <div style={{ fontSize: 12, color: D.muted }}>Başl.: {fmt(l.starts_at)}</div>
                  <div style={{ fontSize: 12, color: D.muted }}>Bitiş: {fmt(l.expires_at)}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lisans anahtarı gir */}
        <div style={{ marginTop: 16 }}>
          <HubRedeem />
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
      </div>
    </div>
  );
}
