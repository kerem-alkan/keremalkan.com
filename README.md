# keremalkan.com

Kerem Alkan'ın kişisel sitesi + hub. Next.js 14 (App Router). Tek repo, tek Vercel deploy.

Barındırdıkları:
- **Portfolyo** — "omurga" (spine) scroll deneyimi (`src/components/spine/`)
- **CraftAbyss Orb** — canlı operasyon radarı (`src/app/craftabyss`, `src/components/CraftAbyssRadar.jsx`)
- **AISpear web** — auth / hub / admin + lisans API (`src/app/aispear`, `/hub`, `/admin`, `/api/*`)

## Geliştirme
```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy — tek bağlantı
`.bat` yok. **`main` dalına push = Vercel otomatik deploy** (GitHub↔Vercel bağlantısı).
```bash
git add -A && git commit -m "update" && git push origin main
```
Vercel 1–2 dk içinde yayına alır. Env değişkenleri Vercel → Settings → Environment Variables'da; örnek için `.env.local.example`.

## ⚠️ Dokunulmaz sözleşmeler (kırılırsa canlı sistemler sessizce çöker)

**1. CraftAbyss Orb** — `/api/orb`, VDS'teki `orb-agent`'ı proxy'ler:
- `GET ${ORB_AGENT_URL}/api/snapshot` + `Authorization: Bearer ${ORB_AGENT_TOKEN}` (agent'taki `ORB_TOKEN` ile aynı olmalı)
- Snapshot alan adları **değişmez**: `servers.{proxy,lobby,survival}.{state,status,cpu,ram,tps,mspt,players}` ve `feed[].{id,ts,text,tkey,p,sev,kind}` — `CraftAbyssRadar.jsx` bunları okur.
- `orb-agent` (VDS Node) ve `orb-plugin` (Java) **ayrı runtime'lar**, bu repoya girmez.

**2. AISpear lisans** — launcher/bot bu iki uca bağlı:
- `POST /api/token` `{username,password}` → `{ok, token, user, role}` (CORS `*`, OPTIONS var)
- `POST /api/validate` (Bearer token) → `{ok, ...}`; bot her 300 sn sorar, `ok` gelmezse **kendini kapatır**
- Bu route'ların yanıt şekli / auth şeması / CORS'u **değişmez**. Bot/launcher `core/bot` + `apps/launcher` (aispear repo'su) — masaüstü, bu repoya girmez; yalnız `AISPEAR_SERVER=https://keremalkan.com`'a sorar.

## Yapı
```
src/
  app/
    page.tsx              # -> SpineHome (ana sayfa)
    craftabyss/           # Orb case + /live radar
    aispear/, hub/, admin/# AISpear web + panel
    api/                  # orb, ptero, mc, tps, token, validate, login, admin/*, ...
  components/
    spine/                # yeni omurga ana sayfa (SpineHome, spineData)
    CraftAbyssRadar.jsx, AdminApp.jsx, LiveView.jsx, ...
    webgl/ParticleField.jsx   # Faz-2 omurga kordonu için
  lib/                    # db (Neon), aispear-auth, licenses-db, ...
```
