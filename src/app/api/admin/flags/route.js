// AISpear admin — genel özellik/bakım bayrağı ayarla (PATCH).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { setFlag, setAllFlags } from '@/lib/roles-db';
import { logAudit, ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(req) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  let b = {};
  try { b = await req.json(); } catch {}
  try {
    if (b.all) {
      // Tüm özellikleri tek seferde: "Tümünü bakıma al" / "Tümünü aç".
      await setAllFlags(b.all);
      await logAudit({ actorId: a.session.uid, action: 'flag.set-all', target: 'tüm özellikler', meta: { state: b.all }, ip: ipOf(req) });
    } else {
      await setFlag(b.featureKey, b.state);
      await logAudit({ actorId: a.session.uid, action: 'flag.set', target: b.featureKey, meta: { state: b.state }, ip: ipOf(req) });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}
