// AISpear — rol & izin + genel özellik bayrağı veri katmanı.
import { q, one } from '@/lib/db';

export async function listRolesFull() {
  const roles = await q('SELECT id, name, is_admin FROM roles ORDER BY id');
  const perms = await q('SELECT role_id, feature_key, allowed FROM role_permissions');
  const byRole = {};
  for (const p of perms) {
    if (!byRole[p.role_id]) byRole[p.role_id] = {};
    byRole[p.role_id][p.feature_key] = p.allowed;
  }
  return roles.map((r) => ({ ...r, permissions: byRole[r.id] || {} }));
}

export async function createRole(name, isAdmin = false) {
  const n = String(name || '').trim().toLowerCase();
  if (!n) throw new Error('Rol adı gerekli');
  return await one('INSERT INTO roles (name, is_admin) VALUES ($1,$2) RETURNING id, name, is_admin', [n, !!isAdmin]);
}

export async function deleteRole(id) {
  const r = await one('SELECT name, is_admin FROM roles WHERE id=$1', [id]);
  if (!r) throw new Error('Rol yok');
  if (r.name === 'admin' || r.name === 'member') throw new Error('Çekirdek rol (admin/member) silinemez');
  const used = await one('SELECT count(*)::int AS n FROM users WHERE role_id=$1', [id]);
  if (used && used.n > 0) throw new Error('Bu role atanmış kullanıcılar var — önce taşı');
  return await one('DELETE FROM roles WHERE id=$1 RETURNING id', [id]);
}

export async function setRolePermission(roleId, featureKey, allowed) {
  if (!featureKey) throw new Error('Özellik gerekli');
  return await one(
    `INSERT INTO role_permissions (role_id, feature_key, allowed) VALUES ($1,$2,$3)
     ON CONFLICT (role_id, feature_key) DO UPDATE SET allowed=$3 RETURNING role_id`,
    [roleId, featureKey, !!allowed]
  );
}

export async function listFlags() {
  const rows = await q('SELECT feature_key, state FROM feature_flags');
  const m = {};
  for (const r of rows) m[r.feature_key] = r.state;
  return m;
}

export async function setFlag(featureKey, state) {
  if (!['on', 'maintenance', 'off'].includes(state)) throw new Error('Geçersiz durum');
  if (!featureKey) throw new Error('Özellik gerekli');
  return await one(
    `INSERT INTO feature_flags (feature_key, state, updated_at) VALUES ($1,$2,now())
     ON CONFLICT (feature_key) DO UPDATE SET state=$2, updated_at=now() RETURNING feature_key`,
    [featureKey, state]
  );
}
