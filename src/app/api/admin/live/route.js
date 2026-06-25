// AISpear admin — canlı oturumlar (online/offline + konum + cihaz + eşzamanlı uyarı).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listLive } from '@/lib/sessions-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    const rows = await listLive();
    const onlineByUser = {};
    for (const r of rows) if (r.online) onlineByUser[r.user_id] = (onlineByUser[r.user_id] || 0) + 1;
    const sessions = rows.map((r) => ({ ...r, concurrent: !!(r.online && onlineByUser[r.user_id] > 1) }));
    const onlineCount = rows.filter((r) => r.online).length;
    return NextResponse.json({ ok: true, sessions, onlineCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
