// AISpear admin — kullanıcı güncelle (PATCH) + sil (DELETE). Kilitlenme/rogue korumaları.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { updateUser, deleteUser, getUserById, roleById, countActiveAdmins, getUserProfile } from '@/lib/users-db';
import { logAudit, ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

function isSelf(session, target) {
  if (session.uid && target.id === session.uid) return true;
  if (session.username && target.username && session.username === target.username) return true;
  return false;
}

// Üye profili (lisanslar + cihazlar + oturumlar).
export async function GET(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  try {
    const profile = await getUserProfile(id);
    if (!profile) return NextResponse.json({ ok: false, error: 'Kullanıcı yok' }, { status: 404 });
    return NextResponse.json({ ok: true, ...profile });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  const id = parseInt(params.id, 10);
  if (!id) return NextResponse.json({ ok: false, error: 'Geçersiz id' }, { status: 400 });
  const target = await getUserById(id);
  if (!target) return NextResponse.json({ ok: false, error: 'Kullanıcı yok' }, { status: 404 });

  let b = {};
  try { b = await req.json(); } catch {}
  const self = isSelf(a.session, target);

  // Kendini kilitleme
  if (self && b.roleId != null) return NextResponse.json({ ok: false, error: 'Kendi rolünü değiştiremezsin' }, { status: 400 });
  if (self && b.status && b.status !== 'active') return NextResponse.json({ ok: false, error: 'Kendi hesabını pasifleştiremezsin' }, { status: 400 });

  // Son admin koruması
  if (target.is_admin) {
    const newRole = b.roleId != null ? await roleById(b.roleId) : null;
    const demoting = b.roleId != null && !(newRole && newRole.is_admin);
    const deactivating = b.status && b.status !== 'active';
    if (demoting || deactivating) {
      if ((await countActiveAdmins()) <= 1) {
        return NextResponse.json({ ok: false, error: 'Son aktif admin düşürülemez/pasifleştirilemez' }, { status: 400 });
      }
    }
  }

  try {
    const user = await updateUser(id, { status: b.status, roleId: b.roleId, password: b.password });
    await logAudit({ actorId: a.session.uid, action: 'user.update', target: target.username, meta: { status: b.status, roleId: b.roleId, password: b.password ? true : undefined }, ip: ipOf(req) });
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
  const target = await getUserById(id);
  if (!target) return NextResponse.json({ ok: false, error: 'Kullanıcı yok' }, { status: 404 });

  if (isSelf(a.session, target)) return NextResponse.json({ ok: false, error: 'Kendini silemezsin' }, { status: 400 });
  if (target.is_admin) return NextResponse.json({ ok: false, error: 'Admin hesaplar panelden silinemez (önce rolünü düşür)' }, { status: 400 });

  try {
    await deleteUser(id);
    await logAudit({ actorId: a.session.uid, action: 'user.delete', target: target.username, ip: ipOf(req) });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
