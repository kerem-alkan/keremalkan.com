// AISpear admin — kayıt onay kuyruğu (GET) + onayla/reddet (POST).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listPendingApproval, approveRequest, rejectRequest } from '@/lib/requests-db';
import { logAudit, ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    return NextResponse.json({ ok: true, requests: await listPendingApproval() });
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
    if (b.action === 'approve') {
      const u = await approveRequest(b.id);
      await logAudit({ actorId: a.session.uid, action: 'request.approve', target: u ? u.username : `#${b.id}`, ip: ipOf(req) });
      return NextResponse.json({ ok: true });
    }
    if (b.action === 'reject') {
      await rejectRequest(b.id);
      await logAudit({ actorId: a.session.uid, action: 'request.reject', target: `#${b.id}`, ip: ipOf(req) });
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ ok: false, error: 'Bilinmeyen işlem' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}
