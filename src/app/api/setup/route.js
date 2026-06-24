// AISpear — tek seferlik DB kurulumu: tabloları oluşturur, rolleri ekler,
// mevcut AISPEAR_USERS (Valariya) admin'ini DB'ye taşır. İdempotent.
// Koruma: İLK kurulumda (users boş) anahtar gerekmez. Kurulduktan sonra
// tekrar çalıştırmak SETUP_SECRET ister (yoksa kilitli) — kötüye kullanımı önler.
import { NextResponse } from 'next/server';
import { q, one } from '@/lib/db';
import { DDL, SEED_ROLES } from '@/lib/schema';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  // Zaten kurulu mu? (users tablosu varsa ve doluysa)
  let initialized = false;
  try {
    const c = await one('SELECT count(*)::int AS n FROM users');
    initialized = !!(c && c.n > 0);
  } catch {
    initialized = false; // tablo henüz yok -> ilk kurulum
  }
  if (initialized) {
    const key = new URL(req.url).searchParams.get('key');
    if (!process.env.SETUP_SECRET || key !== process.env.SETUP_SECRET) {
      return NextResponse.json({ ok: false, error: 'already-initialized' }, { status: 403 });
    }
  }

  const log = [];
  try {
    for (const ddl of DDL) await q(ddl);
    log.push(`tablolar hazır (${DDL.length})`);

    for (const r of SEED_ROLES) {
      await q('INSERT INTO roles (name, is_admin) VALUES ($1,$2) ON CONFLICT (name) DO NOTHING', [r.name, r.is_admin]);
    }
    log.push('roller hazır (admin, member)');

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
         ON CONFLICT (username) DO NOTHING
         RETURNING id`,
        [u.username, email, u.passHash, adminRole ? adminRole.id : null]
      );
      if (r.length) seeded++;
    }
    log.push(`admin bootstrap: ${seeded} kullanıcı eklendi`);

    const count = await one('SELECT count(*)::int AS n FROM users');
    return NextResponse.json({ ok: true, log, totalUsers: count ? count.n : 0 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e), log }, { status: 500 });
  }
}
