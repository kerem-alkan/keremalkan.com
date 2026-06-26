// AISpear — Resend ile e-posta (REST, SDK gerekmez). Anahtar yoksa atlar.
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || 'AISpear <onboarding@resend.dev>';
  if (!key) return { ok: false, skipped: true };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html }),
    });
    return { ok: r.ok };
  } catch {
    return { ok: false };
  }
}

export function verifyEmailHtml(link, username) {
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0B0710;color:#ECE9F2;padding:32px;border-radius:16px">
    <div style="font-size:22px;font-weight:700;color:#E8B04B;margin-bottom:8px">AISpear</div>
    <h2 style="font-size:18px;margin:0 0 12px">E-posta doğrulama</h2>
    <p style="color:#cfc9da;line-height:1.5">Merhaba <b>${username}</b>, hesabını etkinleştirmek için aşağıdaki butona tıkla:</p>
    <p style="margin:22px 0"><a href="${link}" style="display:inline-block;background:#E8B04B;color:#1a1206;padding:13px 22px;border-radius:10px;text-decoration:none;font-weight:600">E-postamı doğrula</a></p>
    <p style="color:#8B86A0;font-size:12px;word-break:break-all">Buton çalışmazsa: ${link}</p>
  </div>`;
}

function shell(inner) {
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;background:#0B0710;color:#ECE9F2;padding:32px;border-radius:16px">
    <div style="font-size:22px;font-weight:700;color:#E8B04B;margin-bottom:14px">AISpear</div>
    ${inner}
    <p style="color:#8B86A0;font-size:12px;margin-top:24px">AISpear — Warspear Online otomasyonu · keremalkan.com</p>
  </div>`;
}

// Lisans aktifleştirildi/sürdürüldü bildirimi.
export function licenseActiveHtml(username, expires) {
  const exp = expires ? new Date(expires).toLocaleDateString('tr-TR') : null;
  return shell(`<h2 style="font-size:18px;margin:0 0 12px">Lisansın aktif 🎉</h2>
    <p style="color:#cfc9da;line-height:1.55">Merhaba <b>${username}</b>, lisansın <b style="color:#34D399">aktifleştirildi</b>. Launcher'ı açıp botu kullanmaya başlayabilirsin.${exp ? ` Bitiş tarihi: <b>${exp}</b>.` : ''}</p>
    <p style="margin:20px 0"><a href="https://www.keremalkan.com/hub" style="display:inline-block;background:#E8B04B;color:#1a1206;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">Hub'a git</a></p>`);
}
