// AISpear çıkış: cookie'yi siler. GET ile link, POST ile fetch desteklenir.
import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/aispear-auth';

function clear(res) {
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}

export async function GET(req) {
  return clear(NextResponse.redirect(new URL('/aispear', req.url)));
}

export async function POST() {
  return clear(NextResponse.json({ ok: true }));
}
