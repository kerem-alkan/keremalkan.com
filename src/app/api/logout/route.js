// AISpear çıkış: cookie'yi siler. GET ile link, POST ile fetch desteklenir.
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/aispear-auth';

function clear(res) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

export async function GET(req) {
  const next = new URL(req.url).searchParams.get('next');
  const dest = next && next.startsWith('/') ? next : '/aispear'; // sadece iç yollar (open-redirect koruması)
  return clear(NextResponse.redirect(new URL(dest, req.url)));
}

export async function POST() {
  return clear(NextResponse.json({ ok: true }));
}
