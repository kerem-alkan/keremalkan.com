// Pterodactyl client API -> running/offline state + CPU/RAM per backend.
// Works from anywhere the panel is reachable over HTTPS (incl. Vercel).
export const dynamic = "force-dynamic";

const PURL = process.env.PTERO_URL;
const PKEY = process.env.PTERO_KEY;
const IDS = { lobby: process.env.PTERO_LOBBY_ID, survival: process.env.PTERO_SURVIVAL_ID };

async function res(id) {
  try {
    const r = await fetch(`${PURL}/api/client/servers/${id}/resources`, {
      headers: { Authorization: `Bearer ${PKEY}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!r.ok) return { state: "offline", cpu: 0, ram: 0 };
    const j = await r.json();
    const u = j.attributes.resources;
    return {
      state: j.attributes.current_state,        // running | offline | starting
      cpu: u.cpu_absolute,                       // %
      ram: u.memory_bytes / 1073741824,          // GiB
    };
  } catch {
    return { state: "offline", cpu: 0, ram: 0 };
  }
}

export async function GET() {
  if (!PURL || !PKEY || !IDS.lobby || !IDS.survival) {
    return Response.json({ configured: false });
  }
  const [lobby, survival] = await Promise.all([res(IDS.lobby), res(IDS.survival)]);
  return Response.json({ configured: true, lobby, survival });
}
