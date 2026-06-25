"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

const D = { surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B" };

const ACTION_LABEL = {
  "user.create": "Kullanıcı oluştur",
  "user.update": "Kullanıcı güncelle",
  "user.delete": "Kullanıcı sil",
  "license.create": "Lisans üret",
  "license.delete": "Lisans sil",
  "license.start": "Lisans başlat",
  "license.freeze": "Lisans dondur",
  "license.resume": "Lisans sürdür",
  "license.revoke": "Lisans iptal",
  "license.extend": "Lisans süre uzat",
  "license.assign": "Lisans ata",
  "role.create": "Rol oluştur",
  "role.delete": "Rol sil",
  "role.permission": "Rol izni değiştir",
  "flag.set": "Bayrak ayarla",
};
const ago = (d) => {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return sec + " sn önce";
  const m = Math.floor(sec / 60);
  if (m < 60) return m + " dk önce";
  const h = Math.floor(m / 60);
  if (h < 24) return h + " sa önce";
  return new Date(d).toLocaleDateString("tr-TR");
};
const metaStr = (m) => {
  if (!m) return "";
  try { const o = typeof m === "string" ? JSON.parse(m) : m; return Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== false).map(([k, v]) => `${k}: ${v}`).join(" · "); } catch { return ""; }
};

export default function AuditView() {
  const [entries, setEntries] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetch("/api/admin/audit").then((r) => r.json());
      if (d.ok) setEntries(d.entries || []); else setErr(d.error || "Yüklenemedi");
    } catch { setErr("Bağlantı hatası"); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span className="m" style={{ fontSize: 12, color: D.muted }}>Son {entries.length} işlem</span>
        <button onClick={load} style={{ background: "none", border: `1px solid ${D.line}`, borderRadius: 8, padding: 6, color: D.muted, cursor: "pointer", display: "flex" }}><RefreshCw size={14} /></button>
      </div>
      {err && <div style={{ color: "#F87171", marginBottom: 12 }}>{err}</div>}

      <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1.6fr 1fr 0.9fr", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${D.line}` }}>
          {["İŞLEM", "YAPAN", "HEDEF / DETAY", "IP", "ZAMAN"].map((h, i) => (
            <div key={i} className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: D.muted }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding: "24px 18px", color: D.muted }}>Yükleniyor…</div>}
        {!loading && entries.length === 0 && <div style={{ padding: "24px 18px", color: D.muted }}>Henüz kayıt yok. Admin işlemleri burada listelenir.</div>}
        {entries.map((e, idx) => (
          <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1.6fr 1fr 0.9fr", gap: 8, alignItems: "center", padding: "11px 18px", borderTop: idx === 0 ? "none" : `1px solid ${D.line}` }}>
            <div style={{ fontSize: 13.5, color: D.ink }}>{ACTION_LABEL[e.action] || e.action}</div>
            <div style={{ fontSize: 13, color: e.actor ? D.ink : D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.actor || "sistem"}</div>
            <div style={{ fontSize: 12.5, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {[e.target, metaStr(e.meta)].filter(Boolean).join(" — ") || "—"}
            </div>
            <div className="m" style={{ fontSize: 12, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.ip || "—"}</div>
            <div style={{ fontSize: 12, color: D.muted }}>{ago(e.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
