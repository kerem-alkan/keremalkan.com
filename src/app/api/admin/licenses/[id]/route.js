// AISpear admin — lisans işlem (PATCH: start/freeze/resume/revoke/extend/assign) + sil (DELETE).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { licenseAction, deleteLicense } from '@/lib/licenses-db';
import { logAudit, ipOf } from '@/lib/audit';
import { one } from '@/lib/db';
import { sendEmail, licenseActiveHtml } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Lisans aktifleştiğinde kullanıcıya e-posta (best-effort; e-posta/anahtar yoksa sessizce atlar).
async function notifyActivated(licenseId) {
  try {
    const owner = await one(
      `SELECT u.username, u.email, l.expires_at
         FROM licenses l JOIN users u ON u.id = l.user_id WHERE l.id=$1`,
      [licenseId]
    );
    if (owner && owner.email) {
      await sendEmail({ to: owner.email, subject: 'AISpear — Lisansın aktifleştirildi', html: licenseActiveHtml(owner.username, owner.expires_at) });
    }
  } catch {}
}

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
    if (b.action === 'start' || b.action === 'resume') notifyActivated(id);
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
