// AISpear admin — kullanıcı listele (GET) + oluştur (POST). Parola sunucuda hash'lenir.
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listUsers, createUser } from '@/lib/users-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    return NextResponse.json({ ok: true, users: await listUsers() });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}

export async function POST(req) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  let b = {};
  try { b = await req.json(); } catch {}
  if (!b.username || !b.password) {
    return NextResponse.json({ ok: false, error: 'Kullanıcı adı ve parola gerekli' }, { status: 400 });
  }
  try {
    const user = await createUser({ username: b.username, email: b.email, password: b.password, role: b.role });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    const msg = String((e && e.message) || e);
    if (/duplicate|unique|23505/i.test(msg)) {
      return NextResponse.json({ ok: false, error: 'Bu kullanıcı adı veya e-posta zaten kayıtlı' }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
