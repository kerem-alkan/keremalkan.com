"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";

const D = { bg: "#0B0710", surface: "#171123", line: "#2A2140", ink: "#ECE9F2", muted: "#8B86A0", gold: "#E8B04B", goldDark: "#C6952F", green: "#34D399" };

export default function HubRedeem() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(""); setMsg(""); setBusy(true);
    try {
      const r = await fetch("/api/me/redeem", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }),
      });
      const d = await r.json(); setBusy(false);
      if (!d.ok) { setErr(d.error || "Hata"); return; }
      setMsg(d.message || "Eklendi"); setKey("");
      router.refresh();
    } catch {
      setBusy(false); setErr("Bağlantı hatası");
    }
  }

  return (
    <form onSubmit={submit} style={{ background: D.surface, border: `1px solid ${D.line}`, borderRadius: 18, padding: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
        <KeyRound size={18} color={D.gold} />
        <div style={{ fontSize: 17, fontWeight: 600 }}>Lisans anahtarı gir</div>
      </div>
      <div style={{ fontSize: 13.5, color: D.muted, marginBottom: 14, lineHeight: 1.5 }}>
        Elindeki anahtarı (AISP-XXXX-XXXX-XXXX) gir; hesabına eklenir ve <b style={{ color: D.ink }}>yönetici onayına</b> düşer.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="AISP-XXXX-XXXX-XXXX"
          style={{ flex: 1, minWidth: 220, background: D.bg, border: `1px solid ${D.line}`, borderRadius: 10, padding: "12px 14px", color: D.ink, fontSize: 15, fontFamily: "ui-monospace,monospace", letterSpacing: 1 }} />
        <button type="submit" disabled={busy || !key}
          style={{ border: "none", borderRadius: 10, padding: "0 20px", cursor: busy || !key ? "default" : "pointer", fontSize: 14, fontWeight: 600, color: "#1a1206", opacity: busy || !key ? 0.6 : 1, background: `linear-gradient(135deg, ${D.gold}, ${D.goldDark})` }}>
          {busy ? "Ekleniyor…" : "Lisansı ekle"}
        </button>
      </div>
      {err && <div style={{ marginTop: 12, color: "#F87171", fontSize: 13.5 }}>{err}</div>}
      {msg && <div style={{ marginTop: 12, color: D.green, fontSize: 13.5 }}>{msg}</div>}
    </form>
  );
}
