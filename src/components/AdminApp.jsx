"use client";

import { useEffect, useState, useCallback } from "react";
import {
  LayoutDashboard, Users as UsersIcon, KeyRound, Shield, Activity, ScrollText,
  LogOut, Plus, Trash2, X, Search, RefreshCw, Wand2,
} from "lucide-react";
import RolesView from "./RolesView";

/* VIP koyu tema — ORB ailesi, altın mızrak imzası */
const D = {
  bg: "#0B0710", bg2: "#0E0A14", surface: "#171123", surface2: "#1F1733",
  line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0",
  gold: "#E8B04B", goldDark: "#C6952F", violet: "#7C3AED", green: "#34D399",
};

const SECTIONS = [
  { id: "dashboard", label: "Panel", icon: LayoutDashboard },
  { id: "users", label: "Kullanıcılar", icon: UsersIcon },
  { id: "licenses", label: "Lisanslar", icon: KeyRound },
  { id: "roles", label: "Roller", icon: Shield },
  { id: "live", label: "Canlı", icon: Activity, soon: true },
  { id: "audit", label: "Denetim", icon: ScrollText, soon: true },
];

const STATUS = [
  { v: "active", l: "Aktif", c: "#34D399" },
  { v: "suspended", l: "Askıda", c: "#F59E0B" },
  { v: "frozen", l: "Dondurulmuş", c: "#60A5FA" },
  { v: "banned", l: "Yasaklı", c: "#F87171" },
];
const stMeta = (v) => STATUS.find((s) => s.v === v) || { l: v || "—", c: "#8B86A0" };

const LIC_STATUS = {
  pending_start: { l: "Beklemede", c: "#F59E0B" },
  active: { l: "Aktif", c: "#34D399" },
  frozen: { l: "Dondurulmuş", c: "#60A5FA" },
  suspended: { l: "Askıda", c: "#F59E0B" },
  expired: { l: "Süresi doldu", c: "#8B86A0" },
  revoked: { l: "İptal", c: "#F87171" },
};
const licSt = (v) => LIC_STATUS[v] || { l: v || "—", c: "#8B86A0" };
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR") : "—");

function SpearMark({ size = 26 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" style={{ filter: "drop-shadow(0 0 10px rgba(232,176,75,0.5))" }}>
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B" />
      <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F" />
      <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B" />
      <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B" />
    </svg>
  );
}

function ActBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: `1px solid ${danger ? "rgba(248,113,113,0.4)" : "#2A2140"}`, color: danger ? "#F87171" : "#ECE9F2", borderRadius: 7, padding: "4px 8px", fontSize: 11.5, cursor: "pointer", whiteSpace: "nowrap" }}>{children}</button>
  );
}

function genPassword() {
  const cs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const a = new Uint32Array(16);
  (window.crypto || {}).getRandomValues?.(a);
  return Array.from(a, (n) => cs[n % cs.length]).join("");
}

export default function AdminApp({ me }) {
  const [section, setSection] = useState("dashboard");
  const [meta, setMeta] = useState({ roles: [], stats: {} });
  const [users, setUsers] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [cu, setCu] = useState({ username: "", email: "", password: "", role: "member" });
  const [cuErr, setCuErr] = useState("");
  const [cuBusy, setCuBusy] = useState(false);

  const [showCreateLic, setShowCreateLic] = useState(false);
  const [cl, setCl] = useState({ type: "time", durationDays: 30, seatLimit: 1, count: 1, username: "", notes: "" });
  const [clErr, setClErr] = useState("");
  const [clBusy, setClBusy] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const [m, u, l] = await Promise.all([
        fetch("/api/admin/meta").then((r) => r.json()),
        fetch("/api/admin/users").then((r) => r.json()),
        fetch("/api/admin/licenses").then((r) => r.json()),
      ]);
      if (m.ok) setMeta({ roles: m.roles || [], stats: m.stats || {} });
      if (u.ok) setUsers(u.users || []);
      else setErr(u.error || "Yüklenemedi");
      if (l.ok) setLicenses(l.licenses || []);
    } catch {
      setErr("Bağlantı hatası");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function patchUser(id, fields) {
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields),
    });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    loadAll();
  }
  async function removeUser(id, name) {
    if (!window.confirm(`"${name}" kalıcı olarak silinsin mi?`)) return;
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    loadAll();
  }
  async function submitCreate() {
    setCuErr(""); setCuBusy(true);
    const r = await fetch("/api/admin/users", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cu),
    });
    const d = await r.json(); setCuBusy(false);
    if (!d.ok) { setCuErr(d.error || "Hata"); return; }
    setShowCreate(false);
    setCu({ username: "", email: "", password: "", role: "member" });
    loadAll();
  }

  async function licAction(id, action, payload) {
    const r = await fetch(`/api/admin/licenses/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...(payload || {}) }) });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    loadAll();
  }
  async function removeLic(id, key) {
    if (!window.confirm(`Lisans ${key} silinsin mi?`)) return;
    const r = await fetch(`/api/admin/licenses/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    loadAll();
  }
  async function submitCreateLic() {
    setClErr(""); setClBusy(true);
    const r = await fetch("/api/admin/licenses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cl) });
    const d = await r.json(); setClBusy(false);
    if (!d.ok) { setClErr(d.error || "Hata"); return; }
    setShowCreateLic(false);
    setCl({ type: "time", durationDays: 30, seatLimit: 1, count: 1, username: "", notes: "" });
    loadAll();
  }

  const filtered = users.filter((u) =>
    !q || u.username.toLowerCase().includes(q.toLowerCase()) || (u.email || "").toLowerCase().includes(q.toLowerCase())
  );
  const stats = meta.stats || {};

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: D.bg, color: D.ink,
      fontFamily: "ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" }}>
      <style>{`.m{font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace}
        .ai-in{background:${D.bg};border:1px solid ${D.line};border-radius:9px;padding:10px 12px;color:${D.ink};font-size:14px;width:100%}
        .ai-in:focus{outline:none;border-color:${D.gold}}
        .row:hover{background:rgba(124,58,237,0.06)}
        button{font-family:inherit}`}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width: 232, flexShrink: 0, borderRight: `1px solid ${D.line}`, background: D.bg2,
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 18px", borderBottom: `1px solid ${D.line}` }}>
          <SpearMark size={26} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>AISpear</div>
            <div className="m" style={{ fontSize: 10, letterSpacing: 2, color: D.gold, marginTop: 3 }}>ADMIN</div>
          </div>
        </div>
        <nav style={{ padding: 12, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
          {SECTIONS.map((s) => {
            const Icon = s.icon; const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
                  textAlign: "left", fontSize: 14, color: active ? D.ink : D.muted,
                  background: active ? D.surface2 : "transparent" }}>
                <Icon size={17} color={active ? D.gold : D.muted} />
                <span style={{ flex: 1 }}>{s.label}</span>
                {s.soon && <span className="m" style={{ fontSize: 9, letterSpacing: 0.5, color: D.muted, border: `1px solid ${D.line}`, borderRadius: 99, padding: "1px 6px" }}>yakında</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: 14, borderTop: `1px solid ${D.line}`, fontSize: 12, color: D.muted }}>
          <div style={{ color: D.ink, fontWeight: 600 }}>{me?.username}</div>
          <div className="m" style={{ fontSize: 10, color: D.gold, letterSpacing: 1 }}>{(me?.role || "admin").toUpperCase()}</div>
          <a href="/hub" className="m" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12, color: D.gold, textDecoration: "none", fontSize: 12 }}>
            ← Üye alanı (Hub)
          </a>
          <a href="/api/logout" className="m" style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: D.muted, textDecoration: "none", fontSize: 12 }}>
            <LogOut size={13} /> ÇIKIŞ
          </a>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
        {/* atmosfer */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.5,
          background: "radial-gradient(38% 40% at 88% 0%, rgba(232,176,75,0.10), transparent), radial-gradient(40% 45% at 0% 100%, rgba(124,58,237,0.16), transparent)" }} />
        <div style={{ position: "relative", padding: "28px 32px 80px", maxWidth: 1100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", margin: 0 }}>
              {SECTIONS.find((s) => s.id === section)?.label}
            </h1>
            <button onClick={loadAll} title="Yenile" style={{ background: "none", border: `1px solid ${D.line}`, borderRadius: 9, padding: 7, cursor: "pointer", color: D.muted, display: "flex" }}>
              <RefreshCw size={15} />
            </button>
            <div style={{ flex: 1 }} />
            {section === "users" && (
              <button onClick={() => setShowCreate(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 10, padding: "9px 15px", cursor: "pointer",
                  fontSize: 14, fontWeight: 600, color: "#1a1206", background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
                <Plus size={16} /> Yeni kullanıcı
              </button>
            )}
            {section === "licenses" && (
              <button onClick={() => setShowCreateLic(true)}
                style={{ display: "flex", alignItems: "center", gap: 7, border: "none", borderRadius: 10, padding: "9px 15px", cursor: "pointer",
                  fontSize: 14, fontWeight: 600, color: "#1a1206", background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
                <Plus size={16} /> Yeni lisans
              </button>
            )}
          </div>

          {err && <div style={{ marginBottom: 16, color: "#F87171", fontSize: 14 }}>{err}</div>}

          {/* ── Dashboard ── */}
          {section === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 14 }}>
              {[
                { k: "Kullanıcılar", v: stats.users, c: D.gold },
                { k: "Aktif lisans", v: stats.activeLicenses, c: D.green },
                { k: "Bekleyen başvuru", v: stats.pendingRequests, c: "#F59E0B" },
                { k: "Çevrimiçi", v: stats.online, c: D.violet },
              ].map((c) => (
                <div key={c.k} style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 16, padding: "20px 22px" }}>
                  <div className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>{c.k.toUpperCase()}</div>
                  <div style={{ fontSize: 34, fontWeight: 700, marginTop: 8, color: c.c }}>{loading ? "·" : (c.v ?? 0)}</div>
                </div>
              ))}
              <div style={{ gridColumn: "1 / -1", marginTop: 8, color: D.muted, fontSize: 13.5, lineHeight: 1.6 }}>
                Hoş geldin, <b style={{ color: D.ink }}>{me?.username}</b>. Buradan kullanıcıları yönetebilirsin.
                Lisans, rol ve canlı izleme bölümleri sırayla ekleniyor.
              </div>
            </div>
          )}

          {/* ── Kullanıcılar ── */}
          {section === "users" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 10, padding: "8px 12px", maxWidth: 320 }}>
                <Search size={15} color={D.muted} />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara (kullanıcı / e-posta)"
                  style={{ background: "none", border: "none", outline: "none", color: D.ink, fontSize: 14, width: "100%" }} />
              </div>

              <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 1.1fr 0.7fr 40px", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${D.line}` }}>
                  {["KULLANICI", "E-POSTA", "ROL", "DURUM", "LİSANS", ""].map((h, i) => (
                    <div key={i} className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: D.muted }}>{h}</div>
                  ))}
                </div>

                {loading && <div style={{ padding: "24px 18px", color: D.muted }}>Yükleniyor…</div>}
                {!loading && filtered.length === 0 && <div style={{ padding: "24px 18px", color: D.muted }}>Kullanıcı yok.</div>}

                {filtered.map((u, idx) => (
                  <div key={u.id} className="row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 1fr 1.1fr 0.7fr 40px", gap: 8, alignItems: "center",
                    padding: "11px 18px", borderTop: idx === 0 ? "none" : `1px solid ${D.line}` }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.username}</div>
                      <div className="m" style={{ fontSize: 10.5, color: D.muted }}>{u.last_login_at ? "son giriş " + new Date(u.last_login_at).toLocaleDateString("tr-TR") : "hiç girmedi"}</div>
                    </div>
                    <div className="m" style={{ fontSize: 12.5, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{u.email || "—"}</div>
                    <div>
                      <select value={u.role || "member"} onChange={(e) => { const r = meta.roles.find((x) => x.name === e.target.value); if (r) patchUser(u.id, { roleId: r.id }); }}
                        className="ai-in" style={{ padding: "6px 8px", fontSize: 12.5 }}>
                        {meta.roles.map((r) => <option key={r.id} value={r.name}>{r.name}{r.is_admin ? " ★" : ""}</option>)}
                      </select>
                    </div>
                    <div>
                      <select value={u.status} onChange={(e) => patchUser(u.id, { status: e.target.value })}
                        className="ai-in" style={{ padding: "6px 8px", fontSize: 12.5, color: stMeta(u.status).c }}>
                        {STATUS.map((s) => <option key={s.v} value={s.v} style={{ color: D.ink }}>{s.l}</option>)}
                      </select>
                    </div>
                    <div style={{ fontSize: 13, color: u.active_licenses > 0 ? D.green : D.muted }}>{u.active_licenses ?? 0}</div>
                    <button onClick={() => removeUser(u.id, u.username)} disabled={u.username === me?.username} title={u.username === me?.username ? "Kendini silemezsin" : "Sil"}
                      style={{ background: "none", border: "none", cursor: u.username === me?.username ? "not-allowed" : "pointer", color: u.username === me?.username ? "#3a3450" : D.muted, display: "flex", justifyContent: "center" }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Lisanslar ── */}
          {section === "licenses" && (
            <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.9fr 1fr 0.9fr 1.5fr", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${D.line}` }}>
                {["ANAHTAR", "KULLANICI", "TİP", "DURUM", "BİTİŞ", "İŞLEM"].map((h, i) => (
                  <div key={i} className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: D.muted }}>{h}</div>
                ))}
              </div>
              {loading && <div style={{ padding: "24px 18px", color: D.muted }}>Yükleniyor…</div>}
              {!loading && licenses.length === 0 && <div style={{ padding: "24px 18px", color: D.muted }}>Henüz lisans yok. Sağ üstten "Yeni lisans" ile üret.</div>}
              {licenses.map((l, idx) => {
                const st = licSt(l.status);
                return (
                  <div key={l.id} className="row" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.9fr 1fr 0.9fr 1.5fr", gap: 8, alignItems: "center", padding: "11px 18px", borderTop: idx === 0 ? "none" : `1px solid ${D.line}` }}>
                    <div className="m" style={{ fontSize: 12, color: D.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.key}</div>
                    <div style={{ fontSize: 13, color: l.owner ? D.ink : D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.owner || "atanmamış"}</div>
                    <div className="m" style={{ fontSize: 11.5, color: D.muted }}>{l.type}{l.duration_days ? ` · ${l.duration_days}g` : ""}</div>
                    <div style={{ fontSize: 12.5, color: st.c }}>{st.l}</div>
                    <div style={{ fontSize: 12, color: D.muted }}>{fmtDate(l.expires_at)}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {l.status === "pending_start" && <ActBtn onClick={() => licAction(l.id, "start")}>Başlat</ActBtn>}
                      {l.status === "active" && <ActBtn onClick={() => licAction(l.id, "freeze")}>Dondur</ActBtn>}
                      {l.status === "frozen" && <ActBtn onClick={() => licAction(l.id, "resume")}>Sürdür</ActBtn>}
                      {(l.status === "active" || l.status === "frozen") && <ActBtn onClick={() => licAction(l.id, "extend", { days: 30 })}>+30g</ActBtn>}
                      {l.status !== "revoked" && <ActBtn onClick={() => licAction(l.id, "revoke")} danger>İptal</ActBtn>}
                      <ActBtn onClick={() => removeLic(l.id, l.key)} danger>Sil</ActBtn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Roller & izinler ── */}
          {section === "roles" && <RolesView />}

          {/* ── Yakında bölümleri ── */}
          {["live", "audit"].includes(section) && (
            <div style={{ background: D.surface, border: `1px dashed ${D.line}`, borderRadius: 16, padding: "48px 24px", textAlign: "center", color: D.muted }}>
              <div style={{ fontSize: 16, color: D.ink, fontWeight: 600, marginBottom: 6 }}>{SECTIONS.find((s) => s.id === section)?.label} — yakında</div>
              <div style={{ fontSize: 13.5 }}>Bu bölüm sıradaki adımda ekleniyor (lisans üret/ata/iptal, rol & izin matrisi, canlı oturumlar, denetim logu).</div>
            </div>
          )}
        </div>
      </main>

      {/* ── Yeni kullanıcı modalı ── */}
      {showCreate && (
        <div onClick={() => setShowCreate(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(5,3,9,0.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 420, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22, position: "relative" }}>
            <button onClick={() => setShowCreate(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: D.muted, cursor: "pointer" }}><X size={18} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
              <SpearMark size={22} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Yeni kullanıcı</div>
            </div>

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>KULLANICI ADI</label>
            <input className="ai-in" style={{ marginTop: 6, marginBottom: 13 }} value={cu.username} onChange={(e) => setCu({ ...cu, username: e.target.value })} autoFocus />

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>E-POSTA (opsiyonel)</label>
            <input className="ai-in" style={{ marginTop: 6, marginBottom: 13 }} value={cu.email} onChange={(e) => setCu({ ...cu, email: e.target.value })} />

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>PAROLA</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 13 }}>
              <input className="ai-in" value={cu.password} onChange={(e) => setCu({ ...cu, password: e.target.value })} />
              <button onClick={() => setCu({ ...cu, password: genPassword() })} title="Güçlü parola üret"
                style={{ flexShrink: 0, border: `1px solid ${D.line}`, background: D.bg, borderRadius: 9, padding: "0 12px", cursor: "pointer", color: D.gold, display: "flex", alignItems: "center", gap: 6, fontSize: 12.5 }}>
                <Wand2 size={14} /> Üret
              </button>
            </div>

            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ROL</label>
            <select className="ai-in" style={{ marginTop: 6 }} value={cu.role} onChange={(e) => setCu({ ...cu, role: e.target.value })}>
              {meta.roles.map((r) => <option key={r.id} value={r.name}>{r.name}{r.is_admin ? " (admin)" : ""}</option>)}
            </select>

            {cuErr && <div style={{ marginTop: 13, color: "#F87171", fontSize: 13 }}>{cuErr}</div>}

            <button onClick={submitCreate} disabled={cuBusy || !cu.username || !cu.password}
              style={{ width: "100%", marginTop: 18, border: "none", borderRadius: 11, padding: "12px", cursor: cuBusy ? "default" : "pointer",
                fontSize: 15, fontWeight: 600, color: "#1a1206", opacity: (cuBusy || !cu.username || !cu.password) ? 0.6 : 1,
                background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
              {cuBusy ? "Oluşturuluyor…" : "Oluştur"}
            </button>
            <div style={{ marginTop: 10, fontSize: 11.5, color: D.muted, textAlign: "center" }}>Parola sunucuda scrypt ile hash'lenir; düz saklanmaz.</div>
          </div>
        </div>
      )}

      {showCreateLic && (
        <div onClick={() => setShowCreateLic(false)} style={{ position: "fixed", inset: 0, background: "rgba(5,3,9,0.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22, position: "relative" }}>
            <button onClick={() => setShowCreateLic(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: D.muted, cursor: "pointer" }}><X size={18} /></button>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
              <KeyRound size={20} color={D.gold} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>Yeni lisans</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>TİP</label>
                <select className="ai-in" style={{ marginTop: 6 }} value={cl.type} onChange={(e) => setCl({ ...cl, type: e.target.value })}>
                  <option value="time">Süreli</option>
                  <option value="key">Anahtar</option>
                  <option value="seat">Cihaz limitli</option>
                  <option value="feature">Özellik bazlı</option>
                </select>
              </div>
              <div>
                <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>SÜRE (GÜN)</label>
                <input type="number" className="ai-in" style={{ marginTop: 6 }} value={cl.durationDays} onChange={(e) => setCl({ ...cl, durationDays: e.target.value })} />
              </div>
              <div>
                <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>CİHAZ LİMİTİ</label>
                <input type="number" className="ai-in" style={{ marginTop: 6 }} value={cl.seatLimit} onChange={(e) => setCl({ ...cl, seatLimit: e.target.value })} />
              </div>
              <div>
                <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ADET</label>
                <input type="number" className="ai-in" style={{ marginTop: 6 }} value={cl.count} onChange={(e) => setCl({ ...cl, count: e.target.value })} />
              </div>
            </div>
            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted, display: "block", marginTop: 13 }}>KULLANICIYA ATA (opsiyonel)</label>
            <input className="ai-in" style={{ marginTop: 6 }} placeholder="kullanıcı adı" value={cl.username} onChange={(e) => setCl({ ...cl, username: e.target.value })} />
            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted, display: "block", marginTop: 13 }}>NOT (opsiyonel)</label>
            <input className="ai-in" style={{ marginTop: 6 }} value={cl.notes} onChange={(e) => setCl({ ...cl, notes: e.target.value })} />
            {clErr && <div style={{ marginTop: 13, color: "#F87171", fontSize: 13 }}>{clErr}</div>}
            <button onClick={submitCreateLic} disabled={clBusy} style={{ width: "100%", marginTop: 18, border: "none", borderRadius: 11, padding: "12px", cursor: clBusy ? "default" : "pointer", fontSize: 15, fontWeight: 600, color: "#1a1206", opacity: clBusy ? 0.6 : 1, background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
              {clBusy ? "Üretiliyor…" : "Üret"}
            </button>
            <div style={{ marginTop: 10, fontSize: 11.5, color: D.muted, textAlign: "center" }}>Lisans "beklemede" oluşur; "Başlat" deyince süre işler.</div>
          </div>
        </div>
      )}
    </div>
  );
}
