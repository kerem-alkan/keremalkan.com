// AISpear — DB tabanlı kullanıcı doğrulama (login/token bunu kullanır).
// node:crypto (verifyHash) içerir → sadece route handler / server component'te.
import { q, one } from '@/lib/db';
import { verifyHash } from '@/lib/aispear-users';

export async function getUserByUsername(username) {
  if (!username) return null;
  return await one(
    `SELECT u.id, u.username, u.email, u.pass_hash, u.status,
            r.name AS role_name, COALESCE(r.is_admin, false) AS is_admin
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
      WHERE u.username = $1`,
    [username]
  );
}

// Dönüş: null (yanlış) | {error:'status',status} (aktif değil) | {id,username,role,isAdmin}
export async function verifyLogin(username, password) {
  if (!username || !password) return null;
  const u = await getUserByUsername(username);
  if (!u) return null;
  const ok = u.pass_hash && String(u.pass_hash).includes(':')
    ? verifyHash(password, u.pass_hash)
    : u.pass_hash === password;
  if (!ok) return null; // önce parola — durum sızdırma yok
  if (u.status && u.status !== 'active') return { error: 'status', status: u.status };
  return { id: u.id, username: u.username, role: u.role_name || 'member', isAdmin: !!u.is_admin };
}

export async function touchLogin(id) {
  try { await q('UPDATE users SET last_login_at = now() WHERE id=$1', [id]); } catch {}
}
