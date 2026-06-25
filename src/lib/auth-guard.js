// AISpear — admin API koruması. Her admin uç bunu çağırır (UI gizlemek yetmez).
// getLiveSession → silinen/pasif/rolü düşürülen admin eski token'la API'ye giremez.
import { getLiveSession } from '@/lib/aispear-session';

export async function requireAdmin() {
  const s = await getLiveSession();
  if (!s) return { ok: false, status: 401, error: 'Giriş gerekli' };
  if (!(s.isAdmin || s.role === 'admin')) return { ok: false, status: 403, error: 'Yetki yok' };
  return { ok: true, session: s };
}
