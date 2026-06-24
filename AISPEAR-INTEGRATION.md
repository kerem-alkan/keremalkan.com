# AISpear → keremalkan.com — ENTEGRASYON BRİFİNGİ
### ("Keremalkan portfolio Next.js update" chat'i için hazırlandı)

> Bu dosya, AISpear'ı keremalkan.com portfolyosuna **2. proje** olarak entegre etmen için gereken her şeyi içerir. **Kendi kendine yeter** — taşınacak kritik kod aşağıda gömülü, AISpear repo'suna erişmesen bile çalışır.

---

## Amaç

AISpear, portfolyodaki mevcut **"Warspear Bot"** kartının evrimi: Warspear Online için yerel çalışan, lisanslı bir otomasyon aracı. Siteye eklenecek 4 parça:

1. **Public proje deneyimi** — AISpear demo/tanıtım (koyu, sinematik; ORB ile aynı aile). Ziyaretçi görür, indiremez.
2. **Üyelik / giriş** — JWT tabanlı; sitenin üyelik sistemiyle birleşir.
3. **Lisans API** — `/api/token` + `/api/validate`. **Kullanıcıların makinesindeki yerel bot, çalışmak için canlı sitedeki bu uçlara sorar.**
4. **Hub + Admin** — girişli kullanıcı alanı (launcher indir + lisans durumu) + admin (erişim/lisans yönetimi).

### Mimari sınır — ÇOK ÖNEMLİ
**Siteye GİREN:** demo + auth + lisans API + hub + admin (hepsi Next.js).
**Siteye GİRMEYEN (kullanıcının bilgisayarında kalır):** bot motoru (Python), Tauri launcher, `.exe` dosyaları. Site bot ÇALIŞTIRMAZ — sadece kimliği doğrular ve lisans verir.

---

## İyi haber: ikisi de Next.js (App Router)

AISpear web'i de Next.js App Router (JS). Dosyalar neredeyse birebir oturur. Tek ek bağımlılık: **`jose`** (JWT).

```bash
npm i jose
```

Env (Vercel → Project Settings → Environment Variables):
```
AISPEAR_SECRET = <uzun rastgele gizli anahtar>      # JWT imzalama
AISPEAR_USERS  = [{"username":"kerem","password":"...","role":"admin"}]   # veya sitenin DB'si
```

---

## 1) KOPYALANACAK KOD (inline — aynen kullan)

### `lib/aispear-auth.js`  (JWT imzala/doğrula)
```js
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.AISPEAR_SECRET || 'dev-secret-degistir-beni'
);

export async function signSession(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifySession(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const token = cookies().get('aispear_session')?.value;
  if (!token) return null;
  return await verifySession(token);
}
```

### `lib/aispear-users.js`  (kullanıcı kaynağı — PROD'da DB'ye bağla)
```js
export function loadUsers() {
  if (process.env.AISPEAR_USERS) {
    try { return JSON.parse(process.env.AISPEAR_USERS); } catch {}
  }
  return []; // PROD: burada sitenin kullanıcı DB'sini sorgula
}

export function findUser(username, password) {
  // PROD: düz karşılaştırma yerine HASH doğrulaması yap (aşağıya bak)
  return loadUsers().find(
    (u) => u.username === username && u.password === password
  ) || null;
}
```

### `app/api/token/route.js`  (launcher + bot programatik giriş → JWT)
```js
import { NextResponse } from 'next/server';
import { findUser } from '@/lib/aispear-users';
import { signSession } from '@/lib/aispear-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export async function POST(req) {
  const { username, password } = await req.json();
  const user = findUser(username, password);
  if (!user) return NextResponse.json({ ok: false, error: 'Geçersiz kimlik' }, { status: 401, headers: CORS });
  const token = await signSession({ username: user.username, role: user.role || 'user' });
  return NextResponse.json({ ok: true, token, user: user.username, role: user.role || 'user' }, { headers: CORS });
}
```

### `app/api/validate/route.js`  (yerel bot "çalışabilir miyim?" diye sorar)
```js
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/aispear-auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export async function POST(req) {
  let token = '';
  const auth = req.headers.get('authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) token = auth.slice(7).trim();
  if (!token) { try { const b = await req.json(); token = b.token || ''; } catch {} }
  const session = token ? await verifySession(token) : null;
  if (!session) return NextResponse.json({ ok: false }, { status: 401, headers: CORS });
  return NextResponse.json({ ok: true, user: session.username, role: session.role }, { headers: CORS });
}
```

### Giriş duvarı (middleware — sitedeki mevcut middleware ile birleştir)
```js
// /hub ve /admin (ya da hangi yolu seçersen) giriş ister; /admin sadece role==='admin'
import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/aispear-auth';

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('aispear_session')?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    const url = req.nextUrl.clone(); url.pathname = '/login';
    url.searchParams.set('next', pathname); return NextResponse.redirect(url);
  }
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    const url = req.nextUrl.clone(); url.pathname = '/hub'; return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
export const config = { matcher: ['/hub/:path*', '/admin/:path*'] };
```

> **Giriş (cookie kuran login):** `/api/token` token'ı body'de döndürür (launcher/bot için). Web tarayıcı girişi için ayrıca cookie kuran bir `/api/login` gerekir (token'ı `aispear_session` httpOnly cookie'sine yazar). Sitede zaten bir üyelik/login varsa, başarı anında `signSession({username, role})` çağırıp aynı cookie'yi kurman yeterli — AISpear bu cookie'yi okur.

---

## 2) UI — proje kartı + detay + dark app

Mevcut portfolyo desenini izle (CraftAbyss → ORB nasıl açılıyorsa, Warspear Bot → AISpear app öyle açılsın):

- **"Seçili işler"de "Warspear Bot" kartını → "AISpear"** olarak güncelle (ya da yanına ekle). Etiket: `02 · OTOMASYON`.
- **Proje detay sayfası (AÇIK kabuk, sitenin stili):** AISpear'ı anlat (yerel vision+VLM otomasyon, lisanslı launcher). "Aç / Giriş" butonu → dark app deneyimine götürür. *(ORB sayfasındaki "Orb'u Aç" gibi.)*
- **Dark app deneyimi (KOYU, ORB ailesi):** `login → hub`. Hub: launcher indir + "Lisans aktif" durumu. Admin: kullanıcı/lisans tablosu (sadece role==='admin').

Hub/Admin'in AISpear referans implementasyonu AISpear repo'sunda `apps/web/app/hub/page.js` ve `app/admin/page.js`'te (mantık basit: `getSession()` → kullanıcıyı/rolü göster). Stili siteye göre yeniden giydirebilirsin; **mantık = `getSession()` + lisans durumu**.

---

## 3) MARKA (logo + palet — inline)

**Mızrak markı (altın).** SVG (64×64, transparan; açık+koyu zeminde çalışır):
```svg
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 C26,43 21,38 21,29 C21,21 25,16 32,4 Z" fill="#E8B04B"/>
  <path d="M32,4 C39,16 43,21 43,29 C43,38 38,43 32,48 L32,4 Z" fill="#C6952F"/>
  <rect x="24" y="46" width="16" height="3" rx="1.5" fill="#E8B04B"/>
  <rect x="30.5" y="48" width="3" height="14" fill="#E8B04B"/>
</svg>
```
Wordmark = bu mark + "AISpear" (metin `currentColor` → her zemine uyar). Repo'da: `brand/logo/aispear-mark.svg`, `aispear-wordmark.svg`, favicon `apps/web/app/icon.svg`.

**Palet — AISpear koyu (ORB ailesi):**

| Rol | Hex |
|-----|-----|
| Abyss zemin | `#0B0710` / `#0E0A14` |
| Yüzey | `#171123` / `#1F1733` |
| İmza (mızrak) | `#E8B04B` (gölge `#C6952F`) |
| Aile vurgu (ORB violet) | `#7C3AED` → `#C026D3` |
| Durum (online) | `#34D399` |
| Metin | `#ECE9F2` · muted `#8B86A0` |

Public proje sayfası **açık kabuğa** (sitenin editöryel stili) giydirilir; demo/hub deneyimi **koyu** kalır. AISpear'ın imzası mor ORB küresinden farkı = **altın mızrak**.

---

## 4) PROD SERTLEŞTİRME (entegrasyonda yap)

- **Şifreleri HASH'le.** AISpear yerelde dev kolaylığı için düz metin kullanıyor. Üründe sitenin kullanıcı DB'sini + hash (bcrypt/scrypt/argon2) kullan; `findUser` hash doğrulasın.
- **`AISPEAR_SECRET`** Vercel env'de güçlü-rastgele olmalı (yoksa dev fallback'e düşer — güvensiz).
- **CORS:** `/api/token` ve `/api/validate`'te şu an `*`. Bot kullanıcıların makinesinden çağırdığı için sabit origin yok; `*` kabul edilebilir ama istersen sadece bu uçlarla sınırla. Token yalnız geçerli kimlikte üretilir.
- **Lisans iptali:** kullanıcıyı DB'de pasife al → `/api/validate` `ok:false` döner → o kişinin botu bir daha açılmaz.

---

## 5) LİSANS AKIŞI (neden `/api/validate` canlıda ŞART)

```
Kullanıcının makinesi:  Launcher → POST keremalkan.com/api/token (kerem/şifre) → JWT
                        Launcher botu AISPEAR_TOKEN ile başlatır
                        Bot açılış → POST keremalkan.com/api/validate (Bearer) → ok değilse ÇIKAR
                        Bot çalışırken periyodik heartbeat → iptal edilince durur
```
Yani bu iki uç **canlı sitede yaşamalı**. (AISpear tarafında bot/launcher, paketlenirken `AISPEAR_SERVER`'ı `https://keremalkan.com`'a ayarlayacak — o ayrı chat'in işi, burada sadece uçların var olması yeterli.)

---

## 6) ENTEGRASYON CHECKLIST

- [ ] `npm i jose`
- [ ] `lib/aispear-auth.js` + `lib/aispear-users.js` ekle (users → site DB'sine bağla, hash'le)
- [ ] `app/api/token` + `app/api/validate` ekle (yukarıdaki kod)
- [ ] Web login başarısında `signSession` + `aispear_session` cookie kur (sitenin üyeliğiyle)
- [ ] `/hub` (+ `/admin`) sayfaları + middleware koruması
- [ ] "Warspear Bot" kartını "AISpear"a güncelle + detay sayfası + dark app (ORB deseni)
- [ ] Marka: logo/favicon/palet uygula
- [ ] Env: `AISPEAR_SECRET`, `AISPEAR_USERS` (veya DB)
- [ ] Deploy → `/api/validate` canlı çalışıyor mu test et

---

## 7) Kaynak dosyalar (AISpear repo'su `Warspear AI/` erişilebilirse doğrudan al)

```
apps/web/lib/auth.js  users.js
apps/web/app/api/token/route.js  validate/route.js  (login/route.js  logout/route.js)
apps/web/middleware.js
apps/web/app/hub/page.js  admin/page.js  projects/aispear/page.js   (UI referansı — yeniden stillenir)
apps/web/components/Logo.js  apps/web/app/icon.svg
brand/logo/*.svg  brand/BRAND.md
```
Daha geniş bağlam: AISpear repo kökünde `HANDOFF.md`, `INTEGRATION.md`, `ARCHITECTURE.md`.

> **Siteye girmeyenler** (kullanıcının bilgisayarında kalır, repoda `core/bot/` ve `apps/launcher/`): bot motoru + Tauri launcher + `.exe`. Bunları portfolyoya taşıma.
