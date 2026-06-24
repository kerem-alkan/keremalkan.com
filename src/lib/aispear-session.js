// AISpear — sunucu bileşenleri/route'lar için cookie'den oturum oku.
// next/headers içerir → SADECE server component / route handler'da import et (middleware'de DEĞİL).
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from './aispear-auth';

export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}
