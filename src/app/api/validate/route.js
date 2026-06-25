// AISpear lisans/heartbeat: launcher/bot periyodik buraya sorar.
// Doğrular: hesap aktif + geçerli lisans (admin muaf). Döner: açık özellikler + bakım + bitiş.
// Yan etki: cihaz/oturum + IP-konum (Vercel geo header) kaydı.
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/aispear-auth';
import { q, one } from '@/lib/db';
import { recordHeartbeat } from '@/lib/sessions-db';
import { listFlags } from '@/lib/roles-db';
import { effectiveFeatures } from '@/lib/access';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
const J = (obj, status = 200) => NextResponse.json(obj, { status, headers: CORS });

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  let token = '';
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim();
  if (!token) token = body.token || '';

  const session = token ? await verifySession(token) : null;
  if (!session) return J({ ok: false, reason: 'token' }, 401);

  const u = await one(
    `SELECT u.id, u.username, u.status, u.role_id, r.name AS role, COALESCE(r.is_admin,false) AS is_admin
       FROM users u LEFT JOIN roles r ON r.id = u.role_id WHERE u.username=$1`,
    [session.username]
  );
  if (!u) return J({ ok: false, reason: 'user' }, 401);
  if (u.status !== 'active') return J({ ok: false, reason: 'account', status: u.status }, 403);

  const lic = await one(
    `SELECT id, expires_at FROM licenses
      WHERE user_id=$1 AND status='active' AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at DESC NULLS LAST LIMIT 1`,
    [u.id]
  );
  if (!u.is_admin && !lic) return J({ ok: false, reason: 'license' }, 403);

  const permRows = await q('SELECT feature_key, allowed FROM role_permissions WHERE role_id=$1', [u.role_id]);
  const rolePerms = {};
  for (const p of permRows) rolePerms[p.feature_key] = p.allowed;

  let licenseFeatures = {};
  if (lic) {
    const lf = await q('SELECT feature_key, allowed FROM license_features WHERE license_id=$1', [lic.id]);
    for (const x of lf) licenseFeatures[x.feature_key] = x.allowed;
  }

  const flags = await listFlags();
  const { features, maintenance } = effectiveFeatures({ isAdmin: u.is_admin, rolePerms, flags, licenseFeatures });

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  const country = req.headers.get('x-vercel-ip-country') || null;
  let city = null;
  try { city = decodeURIComponent(req.headers.get('x-vercel-ip-city') || '') || null; } catch {}

  let concurrentDevices = 1;
  try {
    const hb = await recordHeartbeat({ userId: u.id, fingerprint: body.fingerprint || body.deviceId || 'unknown', ip, country, city });
    concurrentDevices = hb.concurrentDevices;
  } catch {}

  return J({
    ok: true,
    status: u.status,
    role: u.role,
    isAdmin: u.is_admin,
    features,
    maintenance,
    expires_at: lic ? lic.expires_at : null,
    concurrentDevices,
    message: lic ? 'aktif' : (u.is_admin ? 'admin' : 'lisans yok'),
  });
}
