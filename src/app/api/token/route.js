// AISpear lisans: launcher/bot programatik giriş → JWT token.
// Önce DB, sonra env (AISPEAR_USERS) yedeği. CORS açık (bot kullanıcı makinesinden çağırır).
import { NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/users-db';
import { findUser } from '@/lib/aispear-users';
import { signSession } from '@/lib/aispear-auth';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}

  let u = null;
  try { u = await verifyLogin(body.username, body.password); }
  catch { u = null; }

  if (u && u.error === 'status') {
    return NextResponse.json({ ok: false, error: 'Hesap aktif değil' }, { status: 403, headers: CORS });
  }
  if (!u) {
    const fb = findUser(body.username, body.password);
    if (fb) u = { id: null, username: fb.username, role: fb.role, isAdmin: fb.role === 'admin' };
  }
  if (!u) {
    return NextResponse.json({ ok: false, error: 'Geçersiz kimlik' }, { status: 401, headers: CORS });
  }

  const token = await signSession({ uid: u.id || null, username: u.username, role: u.role, isAdmin: !!u.isAdmin });
  return NextResponse.json({ ok: true, token, user: u.username, role: u.role }, { headers: CORS });
}
