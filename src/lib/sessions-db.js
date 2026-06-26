// AISpear — cihaz + oturum (heartbeat) kaydı ve canlı listeleme.
import { q, one } from '@/lib/db';

export async function recordHeartbeat({ userId, fingerprint, ip, country, city }) {
  const fp = (fingerprint || 'unknown').slice(0, 128);
  const dev = await one(
    `INSERT INTO devices (user_id, fingerprint, first_ip, last_ip, country, city, last_seen)
     VALUES ($1,$2,$3,$3,$4,$5, now())
     ON CONFLICT (user_id, fingerprint)
       DO UPDATE SET last_ip=$3, country=$4, city=$5, last_seen=now()
     RETURNING id`,
    [userId, fp, ip || null, country || null, city || null]
  );
  const deviceId = dev ? dev.id : null;

  const sess = await one(
    `SELECT id FROM sessions
      WHERE user_id=$1 AND device_id IS NOT DISTINCT FROM $2
        AND ended_at IS NULL AND last_heartbeat > now() - interval '3 minutes'
      ORDER BY id DESC LIMIT 1`,
    [userId, deviceId]
  );
  if (sess) {
    await q('UPDATE sessions SET last_heartbeat=now(), online=true, ip=$2, country=$3, city=$4 WHERE id=$1',
      [sess.id, ip || null, country || null, city || null]);
  } else {
    await q(
      `INSERT INTO sessions (user_id, device_id, ip, country, city, started_at, last_heartbeat, online)
       VALUES ($1,$2,$3,$4,$5, now(), now(), true)`,
      [userId, deviceId, ip || null, country || null, city || null]
    );
  }
  // aynı kullanıcı, son 3 dk'da kaç farklı cihaz?
  const conc = await one(
    `SELECT count(*)::int AS n FROM devices WHERE user_id=$1 AND last_seen > now() - interval '3 minutes'`,
    [userId]
  );
  return { concurrentDevices: conc ? conc.n : 1 };
}

// Kullanıcı başına TEK satır (en son oturum) — eski oturumlar tekrar listelenmez.
// active_devices: son 25 sn'de aktif farklı cihaz sayısı (paylaşım tespiti).
export async function listLive() {
  return await q(
    `SELECT * FROM (
       SELECT DISTINCT ON (u.id)
              s.id, s.ip, s.country, s.city, s.started_at, s.last_heartbeat,
              u.id AS user_id, u.username, d.fingerprint,
              (s.last_heartbeat > now() - interval '25 seconds') AS online,
              (SELECT count(DISTINCT dv.id)::int FROM devices dv
                 WHERE dv.user_id = u.id AND dv.last_seen > now() - interval '25 seconds') AS active_devices
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         LEFT JOIN devices d ON d.id = s.device_id
        WHERE s.last_heartbeat > now() - interval '6 hours'
        ORDER BY u.id, s.last_heartbeat DESC
     ) t
     ORDER BY t.online DESC, t.last_heartbeat DESC
     LIMIT 200`
  );
}
