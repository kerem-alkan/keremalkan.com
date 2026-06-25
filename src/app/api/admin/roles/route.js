// AISpear admin — roller + izinler + bayraklar (GET), rol oluştur (POST).
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-guard';
import { listRolesFull, createRole, listFlags } from '@/lib/roles-db';
import { FEATURES } from '@/lib/features';

export const dynamic = 'force-dynamic';

export async function GET() {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  try {
    const [roles, flags] = await Promise.all([listRolesFull(), listFlags()]);
    return NextResponse.json({ ok: true, roles, features: FEATURES, flags });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 500 });
  }
}

export async function POST(req) {
  const a = await requireAdmin();
  if (!a.ok) return NextResponse.json({ ok: false, error: a.error }, { status: a.status });
  let b = {};
  try { b = await req.json(); } catch {}
  try {
    const role = await createRole(b.name, b.isAdmin);
    return NextResponse.json({ ok: true, role });
  } catch (e) {
    const m = String((e && e.message) || e);
    if (/duplicate|unique|23505/i.test(m)) return NextResponse.json({ ok: false, error: 'Bu rol zaten var' }, { status: 409 });
    return NextResponse.json({ ok: false, error: m }, { status: 400 });
  }
}
