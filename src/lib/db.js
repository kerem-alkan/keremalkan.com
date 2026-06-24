// AISpear — Neon (Vercel Postgres) erişim katmanı.
// pg-uyumlu Pool: .query(text, params) -> { rows }. Tüm sorgular PARAMETRELİ.
import { Pool } from '@neondatabase/serverless';

let _pool = null;

function pool() {
  if (_pool) return _pool;
  const url =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;
  if (!url) throw new Error('Veritabanı bağlantı dizesi yok (DATABASE_URL).');
  _pool = new Pool({ connectionString: url });
  return _pool;
}

// q('SELECT * FROM users WHERE id=$1', [id]) -> satır dizisi
export async function q(text, params = []) {
  const res = await pool().query(text, params);
  return res.rows;
}

// Tek satır (veya null)
export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows && rows.length ? rows[0] : null;
}
