// AISpear — e-posta doğrulama linki. Doğrular ve sonucu login sayfasına yönlendirir.
import { NextResponse } from 'next/server';
import { getByToken, processVerified } from '@/lib/requests-db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const url = new URL(req.url);
  const origin = url.origin;
  const token = url.searchParams.get('token');
  const go = (v) => NextResponse.redirect(`${origin}/aispear/login?verify=${v}`);

  if (!token) return go('err');
  const reqRow = await getByToken(token);
  if (!reqRow) return go('err');
  if (reqRow.status !== 'pending' && reqRow.email_verified) return go('done');

  try {
    const res = await processVerified(reqRow.id);
    const map = { licensed: 'lic', pending_admin: 'pending', invalid_license: 'badkey', license_taken: 'badkey' };
    return go(map[res.result] || 'done');
  } catch {
    return go('err');
  }
}
