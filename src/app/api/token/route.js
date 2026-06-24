// AISpear lisans: launcher/bot programatik giriş → JWT token.
// Kullanıcının makinesindeki launcher buraya kerem/şifre ile POST atar.
import { NextResponse } from 'next/server';
import { findUser } from '@/lib/aispear-users';
import { signSession } from '@/lib/aispear-auth';

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
  const user = findUser(body.username, body.password);
  if (!user) {
    return NextResponse.json({ ok: false, error: 'Geçersiz kimlik' }, { status: 401, headers: CORS });
  }
  const token = await signSession({ username: user.username, role: user.role });
  return NextResponse.json(
    { ok: true, token, user: user.username, role: user.role },
    { headers: CORS }
  );
}
