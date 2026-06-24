// AISpear — DB tabanlı kullanıcı katmanı (login + admin yönetimi).
// node:crypto (verifyHash/hashPassword) içerir → sadece route handler / server component'te.
import { q, one } from '@/lib/db';
import { verifyHash, hashPassword } from '@/lib/aispear-users';

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

/* ───────── Admin yönetimi ───────── */

export async function listUsers() {
  return await q(
    `SELECT u.id, u.username, u.email, u.status, u.created_by, u.created_at, u.last_login_at,
            r.name AS role, COALESCE(r.is_admin, false) AS is_admin,
            (SELECT count(*) FROM licenses l WHERE l.user_id = u.id AND l.status = 'active')::int AS active_licenses
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
      ORDER BY u.created_at DESC`
  );
}

export async function listRoles() {
  return await q('SELECT id, name, is_admin FROM roles ORDER BY id');
}

export async function createUser({ username, email, password, role }) {
  if (!username || !password) throw new Error('Kullanıcı adı ve parola gerekli');
  const roleRow =
    (role ? await one('SELECT id FROM roles WHERE name=$1', [role]) : null) ||
    (await one("SELECT id FROM roles WHERE name='member'"));
  const pass = hashPassword(password);
  return await one(
    `INSERT INTO users (username, email, pass_hash, role_id, status, email_verified_at, created_by)
     VALUES ($1,$2,$3,$4,'active', now(), 'admin')
     RETURNING id, username, email, status`,
    [String(username).trim(), email ? String(email).trim() : null, pass, roleRow ? roleRow.id : null]
  );
}

export async function updateUser(id, fields) {
  const sets = [], vals = [];
  let i = 1;
  if (fields.status !== undefined && fields.status !== null) { sets.push(`status=$${i++}`); vals.push(fields.status); }
  if (fields.roleId !== undefined && fields.roleId !== null) { sets.push(`role_id=$${i++}`); vals.push(fields.roleId); }
  if (fields.password) { sets.push(`pass_hash=$${i++}`); vals.push(hashPassword(fields.password)); }
  if (!sets.length) return null;
  vals.push(id);
  return await one(`UPDATE users SET ${sets.join(', ')} WHERE id=$${i} RETURNING id, username, status`, vals);
}

export async function deleteUser(id) {
  return await one('DELETE FROM users WHERE id=$1 RETURNING id', [id]);
}

export async function getStats() {
  const safe = async (sql) => { try { const r = await one(sql); return r ? r.n : 0; } catch { return 0; } };
  return {
    users: await safe('SELECT count(*)::int AS n FROM users'),
    activeLicenses: await safe("SELECT count(*)::int AS n FROM licenses WHERE status='active'"),
    pendingRequests: await safe("SELECT count(*)::int AS n FROM register_requests WHERE status='pending'"),
    online: await safe("SELECT count(*)::int AS n FROM sessions WHERE online=true AND last_heartbeat > now() - interval '2 minutes'"),
  };
}

export async function getUserById(id) {
  return await one(
    `SELECT u.id, u.username, u.status, u.role_id, COALESCE(r.is_admin,false) AS is_admin
       FROM users u LEFT JOIN roles r ON r.id=u.role_id WHERE u.id=$1`,
    [id]
  );
}

export async function roleById(id) {
  return await one('SELECT id, name, is_admin FROM roles WHERE id=$1', [id]);
}

export async function countActiveAdmins() {
  const r = await one("SELECT count(*)::int AS n FROM users u JOIN roles r ON r.id=u.role_id WHERE r.is_admin=true AND u.status='active'");
  return r ? r.n : 0;
}
