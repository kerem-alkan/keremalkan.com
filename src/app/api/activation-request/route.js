// AISpear — kullanıcı launcher'dan "lisansımı aktifleştir" talebi gönderir (Bearer token).
// Kullanıcı kendi lisans durumunu DEĞİŞTİREMEZ; sadece dondurulmuş/askıdaki lisansa bir bayrak koyar.
// Admin panelde görür ve karar verir. Rate-limit ile spam engellenir.
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/aispear-auth';
import { one } from '@/lib/db';
import { requestReactivation } from '@/lib/licenses-db';
import { rateLimit } from '@/lib/ratelimit';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const J = (obj, status = 200) => NextResponse.json(obj, { status, headers: CORS });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  let token = '';
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim();
  if (!token) token = body.token || '';

  const session = token ? await verifySession(token) : null;
  if (!session) return J({ ok: false, reason: 'token' }, 401);

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  const rl = await rateLimit('activation', ip, 5, 600, 1800);
  if (!rl.ok) return J({ ok: false, error: 'Çok fazla talep. Lütfen bir süre sonra tekrar dene.' }, 429);

  const u = await one('SELECT id FROM users WHERE username=$1', [session.username]);
  if (!u) return J({ ok: false, reason: 'user' }, 401);

  try {
    const r = await requestReactivation(u.id, body.note);
    if (r.error) return J({ ok: false, error: r.error }, 400);
    return J({ ok: true, message: "Aktifleştirme talebin yöneticiye iletildi." });
  } catch (e) {
    return J({ ok: false, error: String((e && e.message) || e) }, 500);
  }
}
