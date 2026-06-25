// AISpear admin — denetim logu (GET).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listAudit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    return NextResponse.json({ ok: true, entries: await listAudit() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
