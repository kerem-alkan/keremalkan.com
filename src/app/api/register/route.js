// AISpear — kayıt (signup). Turnstile + rate-limit + e-posta doğrulama başlatır.
import { NextResponse } from 'next/server';
import { createRequest, processVerified, deleteRequest } from '@/lib/requests-db';
import { verifyTurnstile } from '@/lib/turnstile';
import { rateLimit } from '@/lib/ratelimit';
import { sendEmail, verifyEmailHtml } from '@/lib/email';
import { ipOf } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const ip = ipOf(req);
  const rl = await rateLimit('register', ip, 6, 600, 1800);
  if (!rl.ok) return NextResponse.json({ ok: false, error: 'Çok fazla deneme. Bir süre sonra tekrar dene.' }, { status: 429 });

  let b = {};
  try { b = await req.json(); } catch {}

  const ts = await verifyTurnstile(b.turnstile, ip);
  if (!ts.ok) return NextResponse.json({ ok: false, error: 'Doğrulama başarısız (captcha). Sayfayı yenileyip tekrar dene.' }, { status: 400 });

  try {
    const r = await createRequest({ username: b.username, email: b.email, password: b.password, licenseKey: b.licenseKey, ip });
    const link = `${new URL(req.url).origin}/api/verify-email?token=${r.verify_token}`;
    const mail = await sendEmail({ to: b.email, subject: 'AISpear — E-posta doğrulama', html: verifyEmailHtml(link, b.username) });
    if (mail.skipped) {
      // Resend kurulmadıysa e-postayı atla, doğrudan işle (geçici)
      const res = await processVerified(r.id);
      return NextResponse.json({ ok: true, emailless: true, message: res.message });
    }
    if (!mail.ok) {
      try { await deleteRequest(r.id); } catch {}
      return NextResponse.json({ ok: false, error: "Doğrulama e-postası gönderilemedi. (Resend test modunda yalnızca kendi hesap e-postana gönderebilir — o adresi kullan ya da Resend'de keremalkan.com'u doğrula.)" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, message: 'Doğrulama e-postası gönderildi. Gelen kutunu (ve spam) kontrol et.' });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String((e && e.message) || e) }, { status: 400 });
  }
}
