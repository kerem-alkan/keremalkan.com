// AISpear — kullanıcı kendi lisans anahtarını girer; kendine atanır, admin onayı bekler.
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/aispear-session';
import { one } from '@/lib/db';
import { redeemLicense } from '@/lib/licenses-db';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const s = await getSession();
  if (!s) return NextResponse.json({ ok: false, error: 'Giriş gerekli' }, { status: 401 });
  let uid = s.uid;
  if (!uid) { const u = await one('SELECT id FROM users WHERE username=$1', [s.username]); uid = u ? u.id : null; }
  if (!uid) return NextResponse.json({ ok: false, error: 'Kullanıcı yok' }, { status: 404 });

  let b = {};
  try { b = await req.json(); } catch {}
  try {
    const r = await redeemLicense(uid, b.key);
    if (r.error) return NextResponse.json({ ok: false, error: r.error }, { status: 400 });
    return NextResponse.json({ ok: true, message: 'Lisans hesabına eklendi — yönetici onayı bekleniyor.' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}
