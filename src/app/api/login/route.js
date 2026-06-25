// AISpear web girişi: tarayıcıdan kullanıcı adı/şifre → httpOnly cookie.
// Önce DB'den (users tablosu), DB yoksa/boşsa env (AISPEAR_USERS) yedeği — kesintisiz geçiş.
import { NextResponse } from 'next/server';
import { verifyLogin, touchLogin } from '@/lib/users-db';
import { findUser, verifyHash } from '@/lib/aispear-users';
import { signSession, SESSION_COOKIE } from '@/lib/aispear-auth';
import { rateLimit } from '@/lib/ratelimit';
import { one } from '@/lib/db';
import { ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const ip = ipOf(req);
  // Brute-force koruması: IP başına 10 deneme / 10 dk, aşılırsa 30 dk ban.
  const rl = await rateLimit('login', ip, 10, 600, 1800);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: 'Çok fazla başarısız deneme. Lütfen bir süre sonra tekrar dene.' },
      { status: 429 }
    );
  }

  let body = {};
  try { body = await req.json(); } catch {}

  let u = null;
  try { u = await verifyLogin(body.username, body.password); }
  catch { u = null; } // DB tablosu henüz yok/erişilemiyor -> env yedeğine düş

  if (u && u.error === 'status') {
    return NextResponse.json(
      { ok: false, error: `Hesabın şu an aktif değil (${u.status}). Yönetici onayı gerekebilir.` },
      { status: 403 }
    );
  }
  if (!u) {
    const fb = findUser(body.username, body.password);
    if (fb) u = { id: null, username: fb.username, role: fb.role, isAdmin: fb.role === 'admin' };
  }

  if (!u) {
    // Kullanıcı yok. Bekleyen bir kayıt başvurusu mu var? Doğru parolayla net mesaj ver
    // (yanlış parola/yabancı için generic kalır → kullanıcı adı sızdırmaz).
    const ctx = await pendingContext(body.username, body.password);
    if (ctx) return NextResponse.json({ ok: false, error: ctx }, { status: 403 });
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

// Henüz hesaba dönüşmemiş başvurular için bağlamsal mesaj.
// Yalnızca parola başvurudaki hash ile eşleşirse döner (enumeration'a kapalı).
async function pendingContext(username, password) {
  if (!username || !password) return null;
  let r;
  try {
    r = await one(
      'SELECT pass_hash, email_verified, status FROM register_requests WHERE username=$1 ORDER BY id DESC LIMIT 1',
      [username]
    );
  } catch { return null; }
  if (!r || !r.pass_hash || !verifyHash(password, r.pass_hash)) return null;

  if (r.status === 'rejected') return 'Önceki başvurun reddedildi. İstersen yeniden kayıt olabilirsin.';
  if (r.status === 'approved') return null; // hesap oluşmuş olmalı; generic akışa bırak
  if (!r.email_verified) return 'Önce e-postanı doğrula. Gelen kutunu (ve spam) kontrol et; bağlantıya tıkladıktan sonra giriş yapabilirsin.';
  return 'Başvurun yönetici onayında. Onaylandığında giriş yapabilirsin.';
}
