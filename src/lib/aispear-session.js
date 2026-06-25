// AISpear — sunucu bileşenleri/route'lar için cookie'den oturum oku.
// next/headers içerir → SADECE server component / route handler'da import et (middleware'de DEĞİL).
import { cookies } from 'next/headers';
import { verifySession, SESSION_COOKIE } from './aispear-auth';
import { one } from './db';

// Sadece JWT imzasını doğrular (DB'ye bakmaz). Hızlı ama "eski" olabilir.
export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return await verifySession(token);
}

// JWT + CANLI DB doğrulaması. Güvenlik için tercih edilen yol:
// - kullanıcı silinmişse  → null (erişim biter)
// - status 'active' değilse → null (askı/dondurma/pasif anında etkiler)
// - rol/isAdmin DB'den TAZE okunur (rol değişimi anında geçerli olur, yeniden girişe gerek yok)
// env/bootstrap oturumunda (uid yok) DB satırı olmadığı için JWT'ye güvenilir.
export async function getLiveSession() {
  const s = await getSession();
  if (!s) return null;
  if (!s.uid) return s; // env (AISPEAR_USERS) bootstrap oturumu

  let u;
  try {
    u = await one(
      `SELECT u.id, u.username, u.status, r.name AS role, COALESCE(r.is_admin,false) AS is_admin
         FROM users u LEFT JOIN roles r ON r.id = u.role_id
        WHERE u.id = $1`,
      [s.uid]
    );
  } catch {
    return s; // DB geçici erişilemezse oturumu düşürme (kesinti dayanıklılığı)
  }
  if (!u) return null;                                  // kullanıcı silinmiş
  if (u.status && u.status !== 'active') return null;   // pasif / askıda / dondurulmuş
  return { uid: u.id, username: u.username, role: u.role || 'member', isAdmin: !!u.is_admin };
}
