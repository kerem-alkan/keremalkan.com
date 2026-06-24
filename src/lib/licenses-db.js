// AISpear — lisans veri katmanı (admin yönetimi). Anahtar üretimi + işlemler.
import { q, one } from '@/lib/db';
import { randomBytes } from 'crypto';

function genKey() {
  const cs = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // okunır (0/O/1/I yok)
  const b = randomBytes(12);
  let s = '';
  for (let i = 0; i < 12; i++) s += cs[b[i] % cs.length];
  return `AISP-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

export async function listLicenses() {
  return await q(
    `SELECT l.id, l.key, l.type, l.status, l.starts_at, l.expires_at, l.seat_limit,
            l.duration_days, l.notes, l.created_at, u.username AS owner
       FROM licenses l
       LEFT JOIN users u ON u.id = l.user_id
      ORDER BY l.created_at DESC`
  );
}

export async function createLicenses({ type = 'time', durationDays = 30, seatLimit = 1, notes = null, username = null, count = 1 }) {
  let userId = null;
  if (username) {
    const u = await one('SELECT id FROM users WHERE username=$1', [String(username).trim()]);
    if (!u) throw new Error('Kullanıcı bulunamadı: ' + username);
    userId = u.id;
  }
  const n = Math.min(Math.max(parseInt(count, 10) || 1, 1), 100);
  const created = [];
  for (let i = 0; i < n; i++) {
    let row = null, tries = 0;
    while (tries++ < 6) {
      try {
        row = await one(
          `INSERT INTO licenses (key, user_id, type, status, seat_limit, duration_days, notes)
           VALUES ($1,$2,$3,'pending_start',$4,$5,$6) RETURNING id, key`,
          [genKey(), userId, type, parseInt(seatLimit, 10) || 1, parseInt(durationDays, 10) || 30, notes]
        );
        break;
      } catch (e) {
        if (!/duplicate|unique|23505/i.test(String((e && e.message) || e))) throw e;
      }
    }
    if (row) created.push(row);
  }
  return created;
}

export async function licenseAction(id, action, payload = {}) {
  const lic = await one('SELECT id, duration_days FROM licenses WHERE id=$1', [id]);
  if (!lic) throw new Error('Lisans yok');
  switch (action) {
    case 'start': {
      const days = String(lic.duration_days || 30);
      return await one(
        `UPDATE licenses SET status='active', starts_at=now(),
           expires_at = now() + ($1 || ' days')::interval, started_by_admin=true
         WHERE id=$2 RETURNING id, status, expires_at`,
        [days, id]
      );
    }
    case 'freeze':
      return await one("UPDATE licenses SET status='frozen' WHERE id=$1 RETURNING id, status", [id]);
    case 'resume':
      return await one("UPDATE licenses SET status='active' WHERE id=$1 RETURNING id, status", [id]);
    case 'revoke':
      return await one("UPDATE licenses SET status='revoked' WHERE id=$1 RETURNING id, status", [id]);
    case 'extend': {
      const d = String(parseInt(payload.days, 10) || 30);
      return await one(
        `UPDATE licenses SET expires_at = COALESCE(expires_at, now()) + ($1 || ' days')::interval
         WHERE id=$2 RETURNING id, expires_at`,
        [d, id]
      );
    }
    case 'assign': {
      const u = await one('SELECT id FROM users WHERE username=$1', [String(payload.username || '').trim()]);
      if (!u) throw new Error('Kullanıcı yok');
      return await one('UPDATE licenses SET user_id=$1 WHERE id=$2 RETURNING id', [u.id, id]);
    }
    case 'unassign':
      return await one('UPDATE licenses SET user_id=NULL WHERE id=$1 RETURNING id', [id]);
    default:
      throw new Error('Bilinmeyen işlem');
  }
}

export async function deleteLicense(id) {
  return await one('DELETE FROM licenses WHERE id=$1 RETURNING id', [id]);
}
