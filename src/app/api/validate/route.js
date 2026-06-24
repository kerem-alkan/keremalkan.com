// AISpear lisans: yerel bot "çalışabilir miyim?" diye buraya sorar.
// Bearer header VEYA body.token kabul eder. Geçersizse 401 → bot çıkar.
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/aispear-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  let token = '';
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim();
  if (!token) {
    try { const b = await req.json(); token = b.token || ''; } catch {}
  }
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ ok: false }, { status: 401, headers: CORS });
  }
  return NextResponse.json(
    { ok: true, user: session.username, role: session.role },
    { headers: CORS }
  );
}
