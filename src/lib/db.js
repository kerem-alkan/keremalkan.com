// AISpear — Neon (Vercel Postgres) erişim katmanı.
// Tek bağlantı dizesi: DATABASE_URL (Neon). Yedek isimler de denenir.
// Tüm sorgular PARAMETRELİ ($1,$2…) — SQL injection yok.
import { neon } from '@neondatabase/serverless';

let _sql = null;

function conn() {
  if (_sql) return _sql;
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error('Veritabanı bağlantı dizesi yok (DATABASE_URL).');
  _sql = neon(url);
  return _sql;
}

// q('SELECT * FROM users WHERE id=$1', [id]) -> satır dizisi
export async function q(text, params = []) {
  return await conn().query(text, params);
}

// Tek satır (veya null)
export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows && rows.length ? rows[0] : null;
}
