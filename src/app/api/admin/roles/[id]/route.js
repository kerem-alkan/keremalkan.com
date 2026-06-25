// AISpear admin — rol izni güncelle (PATCH) + rol sil (DELETE).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { setRolePermission, deleteRole } from '@/lib/roles-db';
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
    await setRolePermission(id, b.featureKey, b.allowed);
    await logAudit({ actorId: a.session.uid, action: 'role.permission', target: `#${id}`, meta: { featureKey: b.featureKey, allowed: b.allowed }, ip: ipOf(req) });
    return NextResponse.json({ ok: true });
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
    await deleteRole(id);
    await logAudit({ actorId: a.session.uid, action: 'role.delete', target: `#${id}`, ip: ipOf(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}
