// AISpear — kayıt başvuruları (signup). Lisanslı → kullanıcı + lisans (pending_start);
// lisanssız → onay kuyruğu (admin onayı). Parola scrypt hash'lenir.
import { q, one } from '@/lib/db';
import { hashPassword } from '@/lib/aispear-users';
import { randomBytes } from 'crypto';

export async function createRequest({ username, email, password, licenseKey, ip }) {
  username = String(username || '').trim();
  email = String(email || '').trim().toLowerCase();
  if (!username || !email || !password) throw new Error('Kullanıcı adı, e-posta ve parola gerekli');
  if (!/^[a-zA-Z0-9_.-]{3,32}$/.test(username)) throw new Error('Geçersiz kullanıcı adı (3-32, harf/rakam)');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('Geçersiz e-posta');
  if (String(password).length < 6) throw new Error('Parola en az 6 karakter olmalı');

  if (await one('SELECT 1 FROM users WHERE username=$1', [username])) throw new Error('Bu kullanıcı adı alınmış');
  if (await one('SELECT 1 FROM users WHERE email=$1', [email])) throw new Error('Bu e-posta zaten kayıtlı');

  const token = randomBytes(24).toString('hex');
  return await one(
    `INSERT INTO register_requests (email, username, pass_hash, license_key, email_verified, verify_token, status, ip)
     VALUES ($1,$2,$3,$4,false,$5,'pending',$6) RETURNING id, verify_token`,
    [email, username, hashPassword(password), licenseKey ? String(licenseKey).trim().toUpperCase() : null, token, ip || null]
  );
}

export async function getByToken(token) {
  return await one('SELECT * FROM register_requests WHERE verify_token=$1', [token]);
}

async function ensureMemberRoleId() {
  const r = await one("SELECT id FROM roles WHERE name='member'");
  return r ? r.id : null;
}

// E-posta doğrulandıktan sonraki işlem.
export async function processVerified(reqId) {
  const req = await one('SELECT * FROM register_requests WHERE id=$1', [reqId]);
  if (!req) throw new Error('Başvuru yok');
  await q('UPDATE register_requests SET email_verified=true WHERE id=$1', [reqId]);

  if (req.license_key) {
    const lic = await one('SELECT id, user_id FROM licenses WHERE key=$1', [req.license_key]);
    if (!lic) return { result: 'invalid_license', message: 'Lisans anahtarı geçersiz; kayıt onay kuyruğuna alındı.' };
    if (lic.user_id) return { result: 'license_taken', message: 'Lisans başka hesaba tanımlı; kayıt onay kuyruğuna alındı.' };
    const roleId = await ensureMemberRoleId();
    const u = await one(
      `INSERT INTO users (username,email,pass_hash,role_id,status,email_verified_at,created_by)
       VALUES ($1,$2,$3,$4,'active',now(),'self') ON CONFLICT (username) DO NOTHING RETURNING id`,
      [req.username, req.email, req.pass_hash, roleId]
    );
    if (u) {
      await q("UPDATE licenses SET user_id=$1, status='pending_start' WHERE id=$2", [u.id, lic.id]);
      await q("UPDATE register_requests SET status='approved' WHERE id=$1", [reqId]);
      return { result: 'licensed', message: 'Hesabın oluşturuldu. Lisansın yönetici onayında — onaylanınca aktifleşir.' };
    }
    return { result: 'error', message: 'Hesap oluşturulamadı.' };
  }
  return { result: 'pending_admin', message: 'E-posta doğrulandı. Başvurun yönetici onayında.' };
}

export async function listPendingApproval() {
  return await q(
    `SELECT id, username, email, license_key, email_verified, ip, created_at
       FROM register_requests WHERE status='pending' ORDER BY id DESC`
  );
}

export async function deleteRequest(id) {
  return await one('DELETE FROM register_requests WHERE id=$1 RETURNING id', [id]);
}

export async function approveRequest(id) {
  const req = await one('SELECT * FROM register_requests WHERE id=$1', [id]);
  if (!req) throw new Error('Başvuru yok');
  if (req.status !== 'pending') throw new Error('Zaten işlenmiş');
  // E-posta doğrulaması zorunlu — admin bunu atlayamaz, aksi halde doğrulama anlamsız olur.
  if (!req.email_verified) throw new Error('Kullanıcı e-postasını henüz doğrulamadı; doğrulanmadan onaylanamaz.');
  const roleId = await ensureMemberRoleId();
  const u = await one(
    `INSERT INTO users (username,email,pass_hash,role_id,status,email_verified_at,created_by)
     VALUES ($1,$2,$3,$4,'active',now(),'self') ON CONFLICT (username) DO NOTHING RETURNING id, username`,
    [req.username, req.email, req.pass_hash, roleId]
  );
  await q("UPDATE register_requests SET status='approved' WHERE id=$1", [id]);
  return u;
}

export async function rejectRequest(id) {
  return await one("UPDATE register_requests SET status='rejected' WHERE id=$1 RETURNING id", [id]);
}
