// AISpear — denetim (audit) logu. Tüm admin işlemleri buraya yazılır.
import { q } from '@/lib/db';

export function ipOf(req) {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || null;
}

export async function logAudit({ actorId, action, target, meta, ip }) {
  try {
    await q(
      'INSERT INTO audit_log (actor_user_id, action, target, meta, ip) VALUES ($1,$2,$3,$4::jsonb,$5)',
      [actorId || null, action, target || null, meta ? JSON.stringify(meta) : null, ip || null]
    );
  } catch {}
}

export async function listAudit(limit = 200) {
  return await q(
    `SELECT a.id, a.action, a.target, a.meta, a.ip, a.created_at, u.username AS actor
       FROM audit_log a LEFT JOIN users u ON u.id = a.actor_user_id
      ORDER BY a.id DESC LIMIT $1`,
    [limit]
  );
}
