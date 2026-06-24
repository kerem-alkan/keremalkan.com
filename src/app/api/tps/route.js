// Real TPS via RCON (Paper /tps or spark). NOTE: RCON must be reachable from
// wherever this runs. On Vercel it usually can't reach a private RCON_HOST, so
// this gracefully returns { tps: 0, source: "down" } and the UI estimates TPS.
import { Rcon } from "rcon-client";
export const dynamic = "force-dynamic";

async function tps(port) {
  try {
    const rcon = await Rcon.connect({ host: process.env.RCON_HOST, port, password: process.env.RCON_PASS });
    const out = await rcon.send("tps");          // or "spark tps"
    await rcon.end();
    const nums = (out.replace(/§./g, "").match(/\d+\.?\d*/g) || []).map(Number);
    return { tps: nums[0] ?? 20, source: "rcon" };
  } catch {
    return { tps: 0, source: "down" };
  }
}

export async function GET() {
  if (!process.env.RCON_HOST || !process.env.RCON_PASS) {
    return Response.json({ configured: false });
  }
  const [lobby, survival] = await Promise.all([
    tps(Number(process.env.RCON_PORT_LOBBY)),
    tps(Number(process.env.RCON_PORT_SURVIVAL)),
  ]);
  return Response.json({ configured: true, lobby, survival });
}
