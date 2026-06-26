"use client";

import { useEffect, useState, useCallback } from "react";
import { Wrench, RefreshCw, Check } from "lucide-react";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", green: "#34D399", amber: "#F59E0B", red: "#F87171" };
const FLAGS = [
  { v: "on", l: "Açık", c: "#34D399" },
  { v: "maintenance", l: "Bakım", c: "#F59E0B" },
  { v: "off", l: "Kapalı", c: "#F87171" },
];

export default function FlagsView() {
  const [data, setData] = useState({ features: [], flags: {} });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr("");
    try {
      const d = await fetch("/api/admin/roles", { cache: "no-store" }).then((r) => r.json());
      if (d.ok) setData({ features: d.features || [], flags: d.flags || {} });
      else setErr(d.error || "Yüklenemedi");
    } catch { setErr("Bağlantı hatası"); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setFlag(featureKey, state) {
    await fetch("/api/admin/flags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ featureKey, state }) });
    load();
  }
  async function setAllFlags(state) {
    const label = state === "maintenance" ? "TÜM özellikleri bakıma al" : "TÜM özellikleri aç";
    if (!window.confirm(label + "? (role bakılmaksızın herkeste anında etki eder)")) return;
    setBusy(true);
    await fetch("/api/admin/flags", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: state }) });
    setBusy(false); load();
  }

  const counts = data.features.reduce((a, f) => { const s = data.flags[f.key] || "on"; a[s] = (a[s] || 0) + 1; return a; }, {});

  return (
    <div>
      {err && <div style={{ color: D.red, marginBottom: 12 }}>{err}</div>}

      <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, padding: 18 }}>
        <div style={{ fontSize: 12.5, color: D.muted, marginBottom: 16, lineHeight: 1.5 }}>
          Bu ayarlar <b style={{ color: D.ink }}>role bakılmaksızın herkeste</b> geçerlidir; launcher'a heartbeat ile ~9 sn içinde yansır. <b style={{ color: D.amber }}>Bakım</b> = özellik geçici kapalı (kart "BAKIMDA"); <b style={{ color: D.red }}>Kapalı</b> = tamamen devre dışı.
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setAllFlags("maintenance")} disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid rgba(245,158,11,0.4)`, background: "rgba(245,158,11,0.10)", color: D.amber, borderRadius: 9, padding: "9px 14px", fontSize: 13, cursor: busy ? "default" : "pointer", fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
            <Wrench size={14} /> Tümünü bakıma al
          </button>
          <button onClick={() => setAllFlags("on")} disabled={busy}
            style={{ display: "flex", alignItems: "center", gap: 6, border: `1px solid rgba(52,211,153,0.4)`, background: "rgba(52,211,153,0.10)", color: D.green, borderRadius: 9, padding: "9px 14px", fontSize: 13, cursor: busy ? "default" : "pointer", fontWeight: 600, opacity: busy ? 0.6 : 1 }}>
            <Check size={14} /> Tümünü aç
          </button>
          <button onClick={load} title="Yenile" style={{ background: "none", border: `1px solid ${D.line}`, borderRadius: 8, padding: 8, color: D.muted, cursor: "pointer", display: "flex" }}><RefreshCw size={14} /></button>
          <span className="m" style={{ marginLeft: "auto", fontSize: 11.5, color: D.muted }}>
            {counts.on || 0} açık · {counts.maintenance || 0} bakım · {counts.off || 0} kapalı
          </span>
        </div>

        {data.features.length === 0 && <div style={{ color: D.muted, fontSize: 13 }}>Yükleniyor…</div>}
        {data.features.map((f, i) => {
          const st = data.flags[f.key] || "on";
          return (
            <div key={f.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: i === 0 ? "none" : `1px solid ${D.line}` }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5 }}>{f.label}</div>
                <div className="m" style={{ fontSize: 10.5, color: D.muted, marginTop: 2 }}>{f.key}</div>
              </div>
              <div style={{ display: "flex", border: `1px solid ${D.line}`, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}>
                {FLAGS.map((fl) => (
                  <button key={fl.v} onClick={() => setFlag(f.key, fl.v)} className="m"
                    style={{ padding: "7px 14px", fontSize: 11.5, border: "none", cursor: "pointer", background: st === fl.v ? fl.c : "transparent", color: st === fl.v ? "#1a1206" : D.muted, fontWeight: st === fl.v ? 700 : 400 }}>
                    {fl.l}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
