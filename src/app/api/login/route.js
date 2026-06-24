// AISpear web girişi: tarayıcıdan kullanıcı adı/şifre → httpOnly cookie kurar.
// Cookie'yi /hub, /admin ve getSession() okur.
import { NextResponse } from 'next/server';
import { findUser } from '@/lib/aispear-users';
import { signSession, SESSION_COOKIE } from '@/lib/aispear-auth';

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  const user = findUser(body.username, body.password);
  if (!user) {
    return NextResponse.json(
      { ok: false, error: 'Geçersiz kullanıcı adı veya şifre' },
      { status: 401 }
    );
  }
  const token = await signSession({ username: user.username, role: user.role });
  const res = NextResponse.json({ ok: true, user: user.username, role: user.role });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 gün
  });
  return res;
}
