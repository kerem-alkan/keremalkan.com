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
    // Kullanıcı başına tek satır; çakışma = aynı kullanıcının son 25 sn'de >1 aktif cihazı.
    const sessions = rows.map((r) => ({ ...r, concurrent: !!(r.online && r.active_devices > 1) }));
    const onlineCount = rows.filter((r) => r.online).length;
    return NextResponse.json({ ok: true, sessions, onlineCount });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
