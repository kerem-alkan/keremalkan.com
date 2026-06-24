// AISpear admin — panel için roller + özet istatistik.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listRoles, getStats } from '@/lib/users-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    const [roles, stats] = await Promise.all([listRoles(), getStats()]);
    return NextResponse.json({ ok: true, roles, stats });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
