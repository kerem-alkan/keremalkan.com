"use client";

import { useEffect, useState, useCallback } from "react";
import { Check, X, RefreshCw } from "lucide-react";

const D = { surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", green: "#34D399" };
const ago = (d) => {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 60) return m + " dk önce"; const h = Math.floor(m / 60);
  if (h < 24) return h + " sa önce"; return new Date(d).toLocaleDateString("tr-TR");
};

export default function RequestsView() {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const d = await fetch("/api/admin/requests").then((r) => r.json());
      if (d.ok) setRows(d.requests || []); else setErr(d.error || "Yüklenemedi");
    } catch { setErr("Bağlantı hatası"); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function act(id, action, name) {
    if (action === "reject" && !window.confirm(`${name} başvurusu reddedilsin mi?`)) return;
    const r = await fetch("/api/admin/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    const d = await r.json();
    if (!d.ok) alert(d.error || "Hata");
    load();
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span className="m" style={{ fontSize: 12, color: D.muted }}>Bekleyen başvuru: {rows.length}</span>
        <button onClick={load} style={{ background: "none", border: `1px solid ${D.line}`, borderRadius: 8, padding: 6, color: D.muted, cursor: "pointer", display: "flex" }}><RefreshCw size={14} /></button>
      </div>
      <div style={{ fontSize: 12.5, color: D.muted, marginBottom: 14, lineHeight: 1.5 }}>
        E-postasını doğrulamış, lisanssız kayıt olan kullanıcılar. Onaylarsan hesap açılır (üye); reddedersen erişemez. (Lisanslı kayıtlar otomatik hesap olur, lisansları <b style={{ color: D.ink }}>Lisanslar</b>'da "Başlat" bekler.)
      </div>
      {err && <div style={{ color: "#F87171", marginBottom: 12 }}>{err}</div>}

      <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 0.9fr 0.9fr 0.8fr 120px", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${D.line}` }}>
          {["KULLANICI", "E-POSTA", "DURUM", "IP", "ZAMAN", ""].map((h, i) => (
            <div key={i} className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: D.muted }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding: "24px 18px", color: D.muted }}>Yükleniyor…</div>}
        {!loading && rows.length === 0 && <div style={{ padding: "24px 18px", color: D.muted }}>Bekleyen başvuru yok.</div>}
        {rows.map((r, idx) => (
          <div key={r.id} style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr 0.9fr 0.9fr 0.8fr 120px", gap: 8, alignItems: "center", padding: "11px 18px", borderTop: idx === 0 ? "none" : `1px solid ${D.line}` }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.username}</div>
            <div style={{ fontSize: 12.5, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.email}</div>
            <div style={{ fontSize: 11.5, color: r.email_verified ? "#34D399" : "#F59E0B" }}>{r.email_verified ? "doğrulandı" : "e-posta bekliyor"}</div>
            <div className="m" style={{ fontSize: 12, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.ip || "—"}</div>
            <div style={{ fontSize: 12, color: D.muted }}>{ago(r.created_at)}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => act(r.id, "approve", r.username)} title="Onayla"
                style={{ display: "flex", alignItems: "center", gap: 5, border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#0c1f17", background: D.green }}>
                <Check size={13} /> Onayla
              </button>
              <button onClick={() => act(r.id, "reject", r.username)} title="Reddet"
                style={{ display: "flex", alignItems: "center", border: `1px solid rgba(248,113,113,0.4)`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: "#F87171", background: "none" }}>
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
