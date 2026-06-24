// AISpear — kullanıcı kaynağı. node:crypto kullanır → SADECE route handler / server
// component'te import et (middleware/edge'de DEĞİL). PROD'da site DB'sine bağlanabilir.
import { scryptSync, timingSafeEqual, randomBytes } from 'crypto';

export function loadUsers() {
  if (process.env.AISPEAR_USERS) {
    try {
      const parsed = JSON.parse(process.env.AISPEAR_USERS);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  // Sadece geliştirmede kolaylık olsun diye varsayılan admin. PROD'da AISPEAR_USERS ŞART.
  if (process.env.NODE_ENV !== 'production') {
    return [{ username: 'kerem', password: 'dev', role: 'admin' }];
  }
  return [];
}

// scrypt doğrulama. Saklama formatı: "saltHex:hashHex"
export function verifyHash(password, stored) {
  try {
    const [salt, key] = String(stored).split(':');
    if (!salt || !key) return false;
    const derived = scryptSync(password, salt, 32);
    const keyBuf = Buffer.from(key, 'hex');
    return keyBuf.length === derived.length && timingSafeEqual(derived, keyBuf);
  } catch {
    return false;
  }
}

// Yardımcı: AISPEAR_USERS için hash üret (script/REPL'den çağrılır).
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 32).toString('hex');
  return `${salt}:${key}`;
}

export function findUser(username, password) {
  if (!username || !password) return null;
  const u = loadUsers().find((x) => x.username === username);
  if (!u) return null;
  const ok = u.passHash ? verifyHash(password, u.passHash) : u.password === password;
  if (!ok) return null;
  return { username: u.username, role: u.role || 'user' };
}

// Admin tablosu için (şifre/hash ASLA dönmez).
export function listUsersSafe() {
  return loadUsers().map((u) => ({ username: u.username, role: u.role || 'user' }));
}
