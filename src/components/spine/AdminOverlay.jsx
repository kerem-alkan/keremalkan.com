"use client";

/**
 * AdminOverlay — AISpear üye/admin alanını merkezden-açılan overlay içinde sunar.
 *
 * GÜVENLİK: Bu bileşen SADECE UX. Gerçek yetki server'da:
 *  - /api/login      → rate-limit + scrypt + httpOnly cookie
 *  - /api/me         → oturum + kullanıcının KENDİ lisansları (cookie httpOnly, client okuyamaz)
 *  - /api/me/redeem  → lisans anahtarı ekler (server doğrular)
 *  - /api/admin/*    → her uç requireAdmin() (getLiveSession, DB-canlı) ile korunur
 * Non-admin bir kişi admin UI'ını görse bile hiçbir admin verisi/işlemi gelmez (server 403).
 * Parola/anahtar yalnız form state'inde tutulur, loglanmaz.
 */
import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ShieldCheck, Clock, Snowflake, KeyRound, Download, LogOut } from "lucide-react";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };

const AdminApp = dynamic(() => import("@/components/AdminApp"), {
  ssr: false,
  loading: () => <div style={{ position: "fixed", inset: 0, background: D.bg }} />,
});

const LIC = {
  pending_start: { l: "Onay bekliyor", c: "#F59E0B" }, active: { l: "Aktif", c: "#34D399" },
  frozen: { l: "Dondurulmuş", c: "#60A5FA" }, suspended: { l: "Askıda", c: "#F59E0B" },
  expired: { l: "Süresi doldu", c: "#8B86A0" }, revoked: { l: "İptal", c: "#F87171" },
};
const licL = (v) => LIC[v] || { l: v || "—", c: "#8B86A0" };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");
const daysLeft = (d) => (d ? Math.ceil((new Date(d).getTime() - Date.now()) / 86400000) : null);

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

export default function AdminOverlay() {
  const [state, setState] = useState("loading"); // loading | login | admin | member
  const [me, setMe] = useState(null);
  const [licenses, setLicenses] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // üye — lisans anahtarı ekleme
  const [rkey, setRkey] = useState("");
  const [rmsg, setRmsg] = useState("");
  const [rerr, setRerr] = useState("");
  const [rbusy, setRbusy] = useState(false);

  const loadMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 401) { setState("login"); return; }
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMe({ username: data.username, role: data.role });
        setLicenses(Array.isArray(data.licenses) ? data.licenses : []);
        setState(data.isAdmin ? "admin" : "member");
      } else { setState("login"); }
    } catch { setError("Bağlantı hatası."); setState("login"); }
  }, []);

  useEffect(() => { loadMe(); }, [loadMe]);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) { setPassword(""); await loadMe(); }
      else { setError(data.error || "Giriş başarısız."); setBusy(false); }
    } catch { setError("Bağlantı hatası."); setBusy(false); }
  };

  const redeem = async (e) => {
    e.preventDefault();
    setRerr(""); setRmsg(""); setRbusy(true);
    try {
      const r = await fetch("/api/me/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: rkey }) });
      const d = await r.json().catch(() => ({}));
      setRbusy(false);
      if (!d.ok) { setRerr(d.error || "Hata"); return; }
      setRmsg(d.message || "Eklendi"); setRkey(""); await loadMe();
    } catch { setRbusy(false); setRerr("Bağlantı hatası"); }
  };

  const logout = async () => { try { await fetch("/api/logout"); } catch {} await loadMe(); };

  if (state === "admin") return <AdminApp me={me} />;

  const shell = {
    position: "absolute", inset: 0, background: D.bg, color: D.ink, overflow: "auto",
    fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    display: "flex", alignItems: state === "member" ? "flex-start" : "center", justifyContent: "center", padding: 24,
  };
  const card = { background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 };

  // üye durum kartı
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
    <div style={shell} data-lenis-prevent>
      <style dangerouslySetInnerHTML={{ __html: `.aim{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        .ai-in{width:100%;background:${D.bg};border:1px solid ${D.line};border-radius:10px;padding:12px 14px;color:${D.ink};font-size:15px}
        .ai-in:focus{outline:none;border-color:${D.gold}}
        .ai-in::placeholder{color:#5d5872}` }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.6, pointerEvents: "none",
        background: "radial-gradient(40% 50% at 78% 12%, rgba(232,176,75,0.14), transparent), radial-gradient(45% 55% at 18% 88%, rgba(124,58,237,0.24), transparent)" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: state === "member" ? 640 : 380, paddingTop: state === "member" ? 44 : 0 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
          <SpearMark size={52} />
          <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: "-0.01em", marginTop: 12 }}>AISpear</div>
          <div className="aim" style={{ fontSize: 11, letterSpacing: 2, color: D.muted, marginTop: 6 }}>
            {state === "member" ? "HUB" : "ÜYE GİRİŞİ"}
          </div>
        </div>

        {state === "loading" && <div className="aim" style={{ textAlign: "center", color: D.muted, fontSize: 13 }}>Yükleniyor…</div>}

        {state === "login" && (
          <form onSubmit={submit} style={{ ...card, maxWidth: 380, margin: "0 auto" }}>
            <label className="aim" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>KULLANICI ADI</label>
            <input className="ai-in" style={{ marginTop: 7, marginBottom: 16 }} value={username} onChange={(e) => setUsername(e.target.value)} autoFocus autoComplete="username" />
            <label className="aim" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ŞİFRE</label>
            <input className="ai-in" style={{ marginTop: 7 }} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {error && <div style={{ marginTop: 14, color: "#F87171", fontSize: 13.5, lineHeight: 1.4 }}>{error}</div>}
            <button type="submit" disabled={busy}
              style={{ width: "100%", marginTop: 20, border: "none", borderRadius: 11, padding: "13px 16px", cursor: busy ? "default" : "pointer",
                fontSize: 15, fontWeight: 600, color: "#1a1206", background: busy ? "#7a6a3f" : `linear-gradient(135deg, ${D.gold}, ${D.goldDark})`, opacity: busy ? 0.7 : 1 }}>
              {busy ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>
        )}

        {state === "member" && (
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginBottom: 4 }}>
              <div className="aim" style={{ fontSize: 12, letterSpacing: 2, color: D.muted }}>HOŞ GELDİN</div>
              <button onClick={logout} className="aim" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, letterSpacing: 0.5, color: D.muted,
                border: `1px solid ${D.line}`, borderRadius: 99, padding: "7px 13px", background: "none", cursor: "pointer" }}>
                <LogOut size={13} /> ÇIKIŞ
              </button>
            </div>
            <h2 style={{ fontSize: "clamp(26px,5vw,40px)", fontWeight: 700, letterSpacing: "-0.02em", margin: "6px 0 0" }}>{me?.username}</h2>

            {/* Gerçek lisans durumu */}
            <div style={{ ...card, marginTop: 24, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${SC.c}1f`, border: `1px solid ${SC.c}66`, display: "grid", placeItems: "center" }}>
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

            {licenses.length > 0 && (
              <div style={{ ...card, marginTop: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Lisanslarım</div>
                {licenses.map((l, i) => {
                  const st = licL(l.status);
                  return (
                    <div key={l.id || i} style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr 1fr 1fr", gap: 8, alignItems: "center", padding: "11px 0", borderTop: i === 0 ? "none" : `1px solid ${D.line}` }}>
                      <div className="aim" style={{ fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.key}</div>
                      <div style={{ fontSize: 13, color: st.c }}>{st.l}</div>
                      <div style={{ fontSize: 12, color: D.muted }}>Başl.: {fmt(l.starts_at)}</div>
                      <div style={{ fontSize: 12, color: D.muted }}>Bitiş: {fmt(l.expires_at)}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lisans anahtarı ekle */}
            <form onSubmit={redeem} style={{ ...card, marginTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <KeyRound size={18} color={D.gold} />
                <div style={{ fontSize: 17, fontWeight: 600 }}>Lisans anahtarı gir</div>
              </div>
              <div style={{ fontSize: 13.5, color: D.muted, marginBottom: 14, lineHeight: 1.5 }}>
                Anahtarı (AISP-XXXX-XXXX-XXXX) gir; hesabına eklenir ve <b style={{ color: D.ink }}>yönetici onayına</b> düşer.
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input className="aim" value={rkey} onChange={(e) => setRkey(e.target.value)} placeholder="AISP-XXXX-XXXX-XXXX"
                  style={{ flex: 1, minWidth: 220, background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, padding: "12px 14px", color: D.ink, fontSize: 15, letterSpacing: 1 }} />
                <button type="submit" disabled={rbusy || !rkey}
                  style={{ border: "none", borderRadius: 10, padding: "0 20px", cursor: rbusy || !rkey ? "default" : "pointer", fontSize: 14, fontWeight: 600, color: "#1a1206", opacity: rbusy || !rkey ? 0.6 : 1, background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
                  {rbusy ? "Ekleniyor…" : "Lisansı ekle"}
                </button>
              </div>
              {rerr && <div style={{ marginTop: 12, color: "#F87171", fontSize: 13.5 }}>{rerr}</div>}
              {rmsg && <div style={{ marginTop: 12, color: D.green, fontSize: 13.5 }}>{rmsg}</div>}
            </form>

            {/* Launcher */}
            <div style={{ ...card, marginTop: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Launcher (Windows)</div>
              <div style={{ fontSize: 13.5, color: D.muted, marginBottom: 16, lineHeight: 1.5 }}>
                Launcher hesabınla giriş yapar, lisansı bu siteden doğrular ve botu başlatır. Bot ve .exe senin makinende kalır.
              </div>
              <span className="aim" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: D.muted, border: `1px dashed ${D.line}`, borderRadius: 11, padding: "12px 16px" }}>
                <Download size={15} /> Launcher yakında yayınlanacak
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
