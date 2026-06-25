// AISpear — basit IP rate-limit + geçici ban (rate_limits tablosu). DB hatasında engellemez.
import { q, one } from '@/lib/db';

export async function rateLimit(bucket, ip, max = 8, windowSec = 600, banSec = 1800) {
  if (!ip) return { ok: true };
  try {
    const row = await one('SELECT count, window_start, banned_until FROM rate_limits WHERE bucket=$1 AND ip=$2', [bucket, ip]);
    const now = Date.now();
    if (row && row.banned_until && new Date(row.banned_until).getTime() > now) {
      return { ok: false, banned: true };
    }
    if (!row) {
      await q(
        `INSERT INTO rate_limits (bucket, ip, count, window_start) VALUES ($1,$2,1,now())
         ON CONFLICT (bucket, ip) DO UPDATE SET count=1, window_start=now(), banned_until=NULL`,
        [bucket, ip]
      );
      return { ok: true };
    }
    const elapsed = (now - new Date(row.window_start).getTime()) / 1000;
    if (elapsed > windowSec) {
      await q('UPDATE rate_limits SET count=1, window_start=now(), banned_until=NULL WHERE bucket=$1 AND ip=$2', [bucket, ip]);
      return { ok: true };
    }
    const newCount = row.count + 1;
    if (newCount > max) {
      await q(
        `UPDATE rate_limits SET count=$3, banned_until = now() + ($4 || ' seconds')::interval WHERE bucket=$1 AND ip=$2`,
        [bucket, ip, newCount, String(banSec)]
      );
      return { ok: false, banned: true };
    }
    await q('UPDATE rate_limits SET count=$3 WHERE bucket=$1 AND ip=$2', [bucket, ip, newCount]);
    return { ok: true };
  } catch {
    return { ok: true };
  }
}
