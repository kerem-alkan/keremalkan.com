// AISpear giriş duvarı: /hub + /admin giriş ister; /admin sadece role==='admin'.
// SADECE aispear-auth (jose) import edilir → edge-safe (next/headers / node:crypto YOK).
import { NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/aispear-auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = '/aispear/login';
    url.search = '';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/admin') && !(session.isAdmin || session.role === 'admin')) {
    const url = req.nextUrl.clone();
    url.pathname = '/hub';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ['/hub/:path*', '/admin/:path*'] };
