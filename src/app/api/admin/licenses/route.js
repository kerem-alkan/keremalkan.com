// AISpear admin — lisans listele (GET) + üret/ata (POST).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listLicenses, createLicenses } from '@/lib/licenses-db';
import { logAudit, ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    return NextResponse.json({ ok: true, licenses: await listLicenses() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}

export async function POST(req) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  let b = {};
  try { b = await req.json(); } catch {}
  try {
    const created = await createLicenses(b);
    await logAudit({ actorId: a.session.uid, action: 'license.create', target: `${created.length} anahtar`, meta: { type: b.type, durationDays: b.durationDays, count: created.length, user: b.username || null }, ip: ipOf(req) });
    return NextResponse.json({ ok: true, created });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}
