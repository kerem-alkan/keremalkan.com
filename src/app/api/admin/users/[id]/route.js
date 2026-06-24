// AISpear admin — kullanıcı güncelle (PATCH: status/rol/parola) + sil (DELETE).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { updateUser, deleteUser } from '@/lib/users-db';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  let b = {};
  try { b = await req.json(); } catch {}
  try {
    const user = await updateUser(id, { status: b.status, roleId: b.roleId, password: b.password });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  if (a.session.uid && a.session.uid === id) {
    return NextResponse.json({ ok: false, error: 'Kendini silemezsin' }, { status: 400 });
  }
  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
