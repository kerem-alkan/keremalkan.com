// AISpear — DB kurulum/migrasyon. İlk kurulumda (users boş) anahtarsız çalışır;
// sonrasında yalnız ADMIN (oturum) veya SETUP_SECRET ile. DDL idempotent (tekrar güvenli).
import { NextResponse } from 'next/server';
import { q, one } from '@/lib/db';
import { DDL, SEED_ROLES } from '@/lib/schema';
import { requireAdmin } from '@/lib/auth-guard';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  let initialized = false;
  try { const c = await one('SELECT count(*)::int AS n FROM users'); initialized = !!(c && c.n > 0); } catch { initialized = false; }

  if (initialized) {
    const a = await requireAdmin();
    const key = new URL(req.url).searchParams.get('key');
    if (!a.ok && key !== process.env.SETUP_SECRET) {
      return NextResponse.json({ ok: false, error: 'already-initialized (admin gerekli)' }, { status: 403 });
    }
  }

  const log = [];
  try {
    for (const ddl of DDL) await q(ddl);
    log.push(`şema uygulandı (${DDL.length})`);

    for (const r of SEED_ROLES) {
      await q('INSERT INTO roles (name, is_admin) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING', [r.name, r.is_admin]);
    }
    log.push('roller hazır');

    if (!initialized) {
      const adminRole = await one("SELECT id FROM roles WHERE name='admin'");
      let users = [];
      try { users = JSON.parse(process.env.AISPEAR_USERS || '[]'); } catch {}
      const email = process.env.ADMIN_BOOTSTRAP_EMAIL || null;
      let seeded = 0;
      for (const u of users) {
        if (!u || !u.username || !u.passHash) continue;
        const r = await q(
          `INSERT INTO users (username, email, pass_hash, role_id, status, email_verified_at, created_by)
           VALUES ($1,$2,$3,$4,'active', now(), 'bootstrap')
           ON CONFLICT (username) DO NOTHING RETURNING id`,
          [u.username, email, u.passHash, adminRole ? adminRole.id : null]
        );
        if (r.length) seeded++;
      }
      log.push(`admin bootstrap: ${seeded}`);
    } else {
      log.push('kullanıcı mevcut, bootstrap atlandı');
    }

    const count = await one('SELECT count(*)::int AS n FROM users');
    return NextResponse.json({ ok: true, log, totalUsers: count ? count.n : 0 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e), log }, { status: 500 });
  }
}
