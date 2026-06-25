// AISpear — giriş yapan kullanıcının kendi bilgisi + lisansları.
import { NextResponse } from 'next/server';
import { getLiveSession } from '@/lib/aispear-session';
import { one } from '@/lib/db';
import { licensesForUser } from '@/lib/licenses-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getLiveSession();
  if (!s) return NextResponse.json({ ok: false, error: 'Giriş gerekli' }, { status: 401 });
  let uid = s.uid;
  if (!uid) { const u = await one('SELECT id FROM users WHERE username=$1', [s.username]); uid = u ? u.id : null; }
  if (!uid) return NextResponse.json({ ok: false, error: 'Kullanıcı yok' }, { status: 404 });
  try {
    const licenses = await licensesForUser(uid);
    return NextResponse.json({ ok: true, username: s.username, role: s.role, isAdmin: !!s.isAdmin, licenses });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
