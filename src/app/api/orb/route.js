// Server-side proxy to the VDS orb-agent. The bearer token stays here (Vercel
// env) and never reaches the browser. Returns { configured:false } when unset
// so the radar gracefully falls back to /api/ptero (basic) or the demo.
export const dynamic = "force-dynamic";

const AGENT = process.env.ORB_AGENT_URL;
const TOKEN = process.env.ORB_AGENT_TOKEN;

export async function GET() {
  if (!AGENT || !TOKEN) return Response.json({ configured: false });
  try {
    const r = await fetch(`${AGENT.replace(/\/$/, "")}/api/snapshot`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });
    if (!r.ok) return Response.json({ configured: false });
    const j = await r.json();
    return Response.json({ configured: true, ...j }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ configured: false });
  }
}
