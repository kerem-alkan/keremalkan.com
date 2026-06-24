// Minecraft ping via mcstatus.io (no key, server-side). Works from Vercel.
export const dynamic = "force-dynamic";

export async function GET() {
  const host = process.env.MC_HOST;
  if (!host) return Response.json({ configured: false });
  try {
    const r = await fetch(`https://api.mcstatus.io/v2/status/java/${host}`, { cache: "no-store" });
    const j = await r.json();
    return Response.json({
      configured: true,
      online: !!j.online,
      players: j.players?.online ?? 0,
      max: j.players?.max ?? 0,
      version: j.version?.name_clean ?? "",
    });
  } catch {
    return Response.json({ configured: true, online: false, players: 0, max: 0, version: "" });
  }
}
