// AISpear admin — lisans işlem (PATCH: start/freeze/resume/revoke/extend/assign) + sil (DELETE).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { licenseAction, deleteLicense } from '@/lib/licenses-db';
import { logAudit, ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  let b = {};
  try { b = await req.json(); } catch {}
  try {
    const result = await licenseAction(id, b.action, b);
    await logAudit({ actorId: a.session.uid, action: `license.${b.action || '?'}`, target: `#${id}`, meta: { days: b.days, username: b.username }, ip: ipOf(req) });
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  try {
    await deleteLicense(id);
    await logAudit({ actorId: a.session.uid, action: 'license.delete', target: `#${id}`, ip: ipOf(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
