"use client";

import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const D = { surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", green: "#34D399" };

const flag = (cc) => {
  if (!cc || cc.length !== 2) return "";
  try { return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)); } catch { return ""; }
};
const dur = (s) => {
  const m = Math.floor((Date.now() - new Date(s).getTime()) / 60000);
  if (m < 1) return "<1 dk"; if (m < 60) return m + " dk";
  return Math.floor(m / 60) + "s " + (m % 60) + "dk";
};
const ago = (d) => {
  const sec = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (sec < 60) return sec + " sn önce"; const m = Math.floor(sec / 60);
  if (m < 60) return m + " dk önce"; return Math.floor(m / 60) + " sa önce";
};

export default function LiveView() {
  const [sessions, setSessions] = useState([]);
  const [online, setOnline] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const d = await fetch("/api/admin/live", { cache: "no-store" }).then((r) => r.json());
      if (d.ok) { setSessions(d.sessions || []); setOnline(d.onlineCount || 0); setErr(""); }
      else setErr(d.error || "Yüklenemedi");
    } catch { setErr("Bağlantı hatası"); }
    setLastUpdated(Date.now());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: D.ink }}>
          <span style={{ width: 9, height: 9, borderRadius: 99, background: online ? D.green : D.muted, boxShadow: online ? `0 0 8px ${D.green}` : "none" }} />
          <b>{online}</b> çevrimiçi
        </span>
        <button onClick={load} disabled={refreshing} title="Şimdi yenile"
          style={{ background: refreshing ? "rgba(124,58,237,0.12)" : "none", border: `1px solid ${D.line}`, borderRadius: 8, padding: 6, color: refreshing ? D.gold : D.muted, cursor: refreshing ? "default" : "pointer", display: "flex" }}>
          <RefreshCw size={14} style={refreshing ? { animation: "ka-spin 0.6s linear infinite" } : undefined} />
        </button>
        <span className="m" style={{ fontSize: 11, color: D.muted }}>
          {refreshing ? "yenileniyor…" : (lastUpdated ? "son güncelleme " + new Date(lastUpdated).toLocaleTimeString("tr-TR") : "8 sn'de bir yenilenir")}
        </span>
        <style>{`@keyframes ka-spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      {err && <div style={{ color: "#F87171", marginBottom: 12 }}>{err}</div>}

      <div style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.3fr 1.1fr 0.8fr 1fr", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${D.line}` }}>
          {["KULLANICI", "DURUM", "KONUM", "IP", "SÜRE", "SON GÖRÜLME"].map((h, i) => (
            <div key={i} className="m" style={{ fontSize: 10.5, letterSpacing: 1, color: D.muted }}>{h}</div>
          ))}
        </div>
        {loading && <div style={{ padding: "24px 18px", color: D.muted }}>Yükleniyor…</div>}
        {!loading && sessions.length === 0 && (
          <div style={{ padding: "24px 18px", color: D.muted }}>Henüz oturum yok. Launcher /api/validate'e bağlanınca burada görünür.</div>
        )}
        {sessions.map((s, idx) => (
          <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 1.3fr 1.1fr 0.8fr 1fr", gap: 8, alignItems: "center", padding: "11px 18px", borderTop: idx === 0 ? "none" : `1px solid ${D.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.username}</span>
              {s.concurrent && (
                <span title="Aynı anda birden çok cihaz — paylaşım şüphesi" style={{ display: "inline-flex", color: "#F59E0B" }}><AlertTriangle size={13} /></span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: s.online ? D.green : D.muted }} />
              <span style={{ fontSize: 12.5, color: s.online ? D.green : D.muted }}>{s.online ? "online" : "offline"}</span>
            </div>
            <div style={{ fontSize: 13, color: D.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {flag(s.country)} {[s.city, s.country].filter(Boolean).join(", ") || "—"}
            </div>
            <div className="m" style={{ fontSize: 12, color: D.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.ip || "—"}</div>
            <div style={{ fontSize: 12.5, color: D.muted }}>{dur(s.started_at)}</div>
            <div style={{ fontSize: 12, color: D.muted }}>{ago(s.last_heartbeat)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
