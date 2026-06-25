"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Plus, Trash2, X } from "lucide-react";

const D = { bg: "#0B0710", surface: "#171123", surface2: "#1F1733", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };
const FLAGS = [
  { v: "on", l: "Açık", c: "#34D399" },
  { v: "maintenance", l: "Bakım", c: "#F59E0B" },
  { v: "off", l: "Kapalı", c: "#F87171" },
];

export default function RolesView() {
  const [data, setData] = useState({ roles: [], features: [], flags: {} });
  const [sel, setSel] = useState(null);
  const [err, setErr] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [nr, setNr] = useState({ name: "", isAdmin: false });

  const load = useCallback(async () => {
    setErr("");
    try {
      const d = await fetch("/api/admin/roles").then((r) => r.json());
      if (d.ok) {
        setData({ roles: d.roles || [], features: d.features || [], flags: d.flags || {} });
        setSel((s) => s || (d.roles && d.roles[0] ? d.roles[0].id : null));
      } else setErr(d.error || "Yüklenemedi");
    } catch {
      setErr("Bağlantı hatası");
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const role = data.roles.find((r) => r.id === sel);
  const permAllowed = (f) => (role ? role.permissions[f.key] !== false : true);

  async function togglePerm(featureKey, allowed) {
    await fetch(`/api/admin/roles/${sel}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featureKey, allowed }) });
    load();
  }
  async function setFlag(featureKey, state) {
    await fetch("/api/admin/flags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featureKey, state }) });
    load();
  }
  async function createRole() {
    const r = await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(nr) });
    const d = await r.json();
    if (!d.ok) { alert(d.error || "Hata"); return; }
    setShowCreate(false); setNr({ name: "", isAdmin: false }); load();
  }
  async function removeRole(id, name) {
    if (!window.confirm(`"${name}" rolü silinsin mi?`)) return;
    const r = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    if (sel === id) setSel(null);
    load();
  }

  return (
    <div>
      {err && <div style={{ color: "#F87171", marginBottom: 12 }}>{err}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "230px 1fr", gap: 16, alignItems: "start" }}>
        {/* Roller listesi */}
        <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${D.line}` }}>
            <span className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ROLLER</span>
            <button onClick={() => setShowCreate(true)} title="Yeni rol" style={{ background: "none", border: "none", color: D.gold, cursor: "pointer", display: "flex" }}><Plus size={16} /></button>
          </div>
          {data.roles.map((r, i) => (
            <div key={r.id} onClick={() => setSel(r.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", cursor: "pointer",
                background: r.id === sel ? D.surface2 : "transparent", borderTop: i === 0 ? "none" : `1px solid ${D.line}` }}>
              <Shield size={15} color={r.is_admin ? D.gold : D.muted} />
              <span style={{ flex: 1, fontSize: 14, color: D.ink }}>{r.name}{r.is_admin ? " ★" : ""}</span>
              {!r.is_admin && r.name !== "member" && (
                <button onClick={(e) => { e.stopPropagation(); removeRole(r.id, r.name); }} style={{ background: "none", border: "none", color: D.muted, cursor: "pointer", display: "flex" }}><Trash2 size={13} /></button>
              )}
            </div>
          ))}
        </div>

        {/* İzin matrisi */}
        <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, padding: 18 }}>
          {!role && <div style={{ color: D.muted }}>Soldan bir rol seç.</div>}
          {role && (
            <>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{role.name} — izinler</div>
              <div style={{ fontSize: 12.5, color: D.muted, marginBottom: 14 }}>
                {role.is_admin ? "Admin rolü tüm özelliklere sahiptir." : "Kapatılan özellik, bu roldeki kullanıcıların launcher'ında devre dışı kalır."}
              </div>
              {data.features.map((f) => {
                const on = role.is_admin ? true : permAllowed(f);
                return (
                  <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${D.line}` }}>
                    <span style={{ fontSize: 14 }}>{f.label}</span>
                    <button disabled={role.is_admin} onClick={() => togglePerm(f.key, !on)}
                      style={{ width: 46, height: 26, borderRadius: 99, border: "none", cursor: role.is_admin ? "default" : "pointer", position: "relative",
                        background: on ? D.green : "#3a3450", opacity: role.is_admin ? 0.6 : 1 }}>
                      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: 99, background: "#fff" }} />
                    </button>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Genel bakım bayrakları */}
      <div style={{ marginTop: 16, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Genel özellik / bakım bayrakları</div>
        <div style={{ fontSize: 12.5, color: D.muted, marginBottom: 14 }}>
          Bir özelliği "Bakım" veya "Kapalı" yaparsan, role bakılmaksızın <b style={{ color: D.ink }}>herkeste</b> devre dışı kalır (heartbeat ile).
        </div>
        {data.features.map((f) => {
          const st = data.flags[f.key] || "on";
          return (
            <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: `1px solid ${D.line}` }}>
              <span style={{ fontSize: 14 }}>{f.label}</span>
              <div style={{ display: "flex", border: `1px solid ${D.line}`, borderRadius: 8, overflow: "hidden" }}>
                {FLAGS.map((fl) => (
                  <button key={fl.v} onClick={() => setFlag(f.key, fl.v)} className="m"
                    style={{ padding: "6px 11px", fontSize: 11.5, border: "none", cursor: "pointer",
                      background: st === fl.v ? fl.c : "transparent", color: st === fl.v ? "#1a1206" : D.muted }}>
                    {fl.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: "fixed", inset: 0, background: "rgba(5,3,9,0.7)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22, position: "relative" }}>
            <button onClick={() => setShowCreate(false)} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: D.muted, cursor: "pointer" }}><X size={18} /></button>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Yeni rol</div>
            <label className="m" style={{ fontSize: 11, letterSpacing: 1, color: D.muted }}>ROL ADI</label>
            <input className="ai-in" style={{ marginTop: 6 }} value={nr.name} onChange={(e) => setNr({ ...nr, name: e.target.value })} placeholder="ör. vip" autoFocus />
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13.5, color: D.ink, cursor: "pointer" }}>
              <input type="checkbox" checked={nr.isAdmin} onChange={(e) => setNr({ ...nr, isAdmin: e.target.checked })} /> Admin yetkisi (paneli görebilir)
            </label>
            <button onClick={createRole} disabled={!nr.name}
              style={{ width: "100%", marginTop: 18, border: "none", borderRadius: 11, padding: "12px", cursor: nr.name ? "pointer" : "default", fontSize: 15, fontWeight: 600, color: "#1a1206", opacity: nr.name ? 1 : 0.6, background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
              Oluştur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
