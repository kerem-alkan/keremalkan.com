"use client";

import { useEffect, useState } from "react";
import { X, KeyRound, Monitor, Activity, ShieldAlert } from "lucide-react";

const D = { bg: "#0B0710", surface: "#171123", surface2: "#1F1733", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", green: "#34D399", amber: "#F59E0B", red: "#F87171", blue: "#60A5FA" };

const LIC = {
  pending_start: { l: "Beklemede", c: "#F59E0B" }, active: { l: "Aktif", c: "#34D399" },
  frozen: { l: "Dondurulmuş", c: "#60A5FA" }, suspended: { l: "Askıda", c: "#F59E0B" },
  expired: { l: "Süresi doldu", c: "#8B86A0" }, revoked: { l: "İptal", c: "#F87171" },
};
const licL = (v) => LIC[v] || { l: v || "—", c: "#8B86A0" };
const fmt = (d) => (d ? new Date(d).toLocaleString("tr-TR") : "—");
const fmtD = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");
const flag = (cc) => { if (!cc || cc.length !== 2) return ""; try { return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)); } catch { return ""; } };

function Section({ icon, title, count, children }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12, letterSpacing: 1, color: D.muted }}>
        {icon}<span>{title}</span>{count != null && <span style={{ color: D.gold }}>· {count}</span>}
      </div>
      {children}
    </div>
  );
}

export default function UserProfile({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let on = true;
    setData(null); setErr("");
    fetch(`/api/admin/users/${userId}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { if (!on) return; if (d.ok) setData(d); else setErr(d.error || "Yüklenemedi"); })
      .catch(() => { if (on) setErr("Bağlantı hatası"); });
    return () => { on = false; };
  }, [userId]);

  const u = data?.user;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(5,3,9,0.72)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 580, maxHeight: "88vh", overflow: "auto", background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 24, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: D.muted, cursor: "pointer" }}><X size={18} /></button>

        {!data && !err && <div style={{ color: D.muted, padding: "20px 0" }}>Yükleniyor…</div>}
        {err && <div style={{ color: D.red, padding: "20px 0" }}>{err}</div>}

        {u && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: D.surface2, border: `1px solid ${D.line}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: D.gold }}>
                {u.username.slice(0, 1).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{u.username}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                  <span className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: u.is_admin ? D.gold : D.muted, border: `1px solid ${D.line}`, borderRadius: 99, padding: "2px 9px" }}>{(u.role || "member").toUpperCase()}</span>
                  <span className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: u.status === "active" ? D.green : D.amber, border: `1px solid ${D.line}`, borderRadius: 99, padding: "2px 9px" }}>{(u.status || "—").toUpperCase()}</span>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14, fontSize: 12.5, color: D.muted }}>
              <div>E-posta: <span style={{ color: D.ink }}>{u.email || "—"}</span></div>
              <div>Oluşturulma: <span style={{ color: D.ink }}>{fmtD(u.created_at)} ({u.created_by})</span></div>
              <div>Son giriş: <span style={{ color: D.ink }}>{u.last_login_at ? fmt(u.last_login_at) : "hiç"}</span></div>
            </div>

            <Section icon={<KeyRound size={14} color={D.gold} />} title="LİSANSLAR" count={data.licenses.length}>
              {data.licenses.length === 0 && <div style={{ color: D.muted, fontSize: 13 }}>Lisans yok.</div>}
              {data.licenses.map((l) => {
                const st = licL(l.status);
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${D.line}` }}>
                    <span className="m" style={{ fontSize: 12, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.key}</span>
                    <span style={{ fontSize: 11.5, color: D.muted }}>{l.type}{l.duration_days ? ` · ${l.duration_days}g` : ""}</span>
                    <span style={{ fontSize: 12, color: st.c, minWidth: 70, textAlign: "right" }}>{st.l}</span>
                    <span style={{ fontSize: 11.5, color: D.muted, minWidth: 78, textAlign: "right" }}>{fmtD(l.expires_at)}</span>
                  </div>
                );
              })}
            </Section>

            <Section icon={<Monitor size={14} color={D.blue} />} title="CİHAZLAR" count={data.devices.length}>
              {data.devices.length === 0 && <div style={{ color: D.muted, fontSize: 13 }}>Cihaz yok.</div>}
              {data.devices.map((dv) => (
                <div key={dv.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${D.line}` }}>
                  <span style={{ width: 7, height: 7, borderRadius: 99, background: dv.online ? D.green : D.muted, flexShrink: 0 }} />
                  <span className="m" style={{ fontSize: 11.5, color: D.muted, width: 80, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{(dv.fingerprint || "").slice(0, 10)}…</span>
                  <span style={{ fontSize: 12, flex: 1 }}>{flag(dv.country)} {[dv.city, dv.country].filter(Boolean).join(", ") || "—"}</span>
                  {dv.is_vpn && <span title="VPN/proxy" style={{ color: D.amber }}><ShieldAlert size={13} /></span>}
                  <span className="m" style={{ fontSize: 11, color: D.muted }}>{dv.last_ip || "—"}</span>
                </div>
              ))}
            </Section>

            <Section icon={<Activity size={14} color={D.green} />} title="SON OTURUMLAR" count={data.sessions.length}>
              {data.sessions.length === 0 && <div style={{ color: D.muted, fontSize: 13 }}>Oturum yok.</div>}
              {data.sessions.map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: `1px solid ${D.line}`, fontSize: 12 }}>
                  <span style={{ color: s.online ? D.green : D.muted, minWidth: 52 }}>{s.online ? "online" : "offline"}</span>
                  <span style={{ flex: 1 }}>{flag(s.country)} {[s.city, s.country].filter(Boolean).join(", ") || "—"}</span>
                  <span className="m" style={{ color: D.muted }}>{s.ip || "—"}</span>
                  <span style={{ color: D.muted, minWidth: 110, textAlign: "right" }}>{fmt(s.last_heartbeat)}</span>
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
