// AISpear web girişi: tarayıcıdan kullanıcı adı/şifre → httpOnly cookie.
// Önce DB'den (users tablosu), DB yoksa/boşsa env (AISPEAR_USERS) yedeği — kesintisiz geçiş.
import { NextResponse } from 'next/server';
import { verifyLogin, touchLogin } from '@/lib/users-db';
import { findUser } from '@/lib/aispear-users';
import { signSession, SESSION_COOKIE } from '@/lib/aispear-auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  let u = null;
  try { u = await verifyLogin(body.username, body.password); }
  catch { u = null; } // DB tablosu henüz yok/erişilemiyor -> env yedeğine düş

  if (u && u.error === 'status') {
    return NextResponse.json(
      { ok: false, error: `Hesap aktif değil (${u.status}). Yönetici onayı gerekebilir.` },
      { status: 403 }
    );
  }
  if (!u) {
    const fb = findUser(body.username, body.password);
    if (fb) u = { id: null, username: fb.username, role: fb.role, isAdmin: fb.role === 'admin' };
  }
  if (!u) {
    return NextResponse.json({ ok: false, error: 'Geçersiz kullanıcı adı veya şifre' }, { status: 401 });
  }

  const token = await signSession({ uid: u.id || null, username: u.username, role: u.role, isAdmin: !!u.isAdmin });
  if (u.id) touchLogin(u.id);

  const res = NextResponse.json({ ok: true, user: u.username, role: u.role, isAdmin: !!u.isAdmin });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
