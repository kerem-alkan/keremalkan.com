# Kerem — Çalışma Alanı Haritası & İş Bölümü
_Yeni bir Cowork chat'i açtığında ÖNCE bunu oku. Son güncelleme: 2026-06-24._

## Modernizasyon (önce bunu yap)
1. Tüm Cowork chat'lerini + Explorer/terminal pencerelerini kapat.
2. `MODERNIZE.bat`'ı çalıştır → klasörler 3 temiz projeye ayrılır.
3. `GITHUB-KURULUM.md`'yi izle → her projenin kendi reposu (AISpear **private**).
4. Her proje için ayrı Cowork chat'i aç (aşağıdaki iş bölümü).

## 3 Proje / 3 Klasör / 3 Repo / 3 Chat

### 1. keremalkan.com — Portfolyo + Hub  → **Entegrasyon chat'i**
- Klasör: `Projects\keremalkan.com` · Repo: `kerem-alkan/keremalkan.com` (public, VAR) · Deploy: Vercel (içindeki `GONDER.bat`).
- Kapsam: Kerem'in vitrini. Projeleri (CraftAbyss Orb, AISpear) buraya entegre eder: proje kartları + case study + koyu "app" deneyimleri. AISpear için: demo + üyelik/auth (JWT, jose) + lisans API (`/api/token`, `/api/validate`) + hub/admin.
- Sınır: Ürünlerin kendi backend'i BURAYA girmez — sadece vitrin + auth/lisans/hub.
- Oku: `Projects\CraftAbyss\PROJE-DURUM.md` (portfolyo+orb durumu), `Projects\AISpear\INTEGRATION_FOR_PORTFOLIO.md` (AISpear entegrasyon brifingi).

### 2. CraftAbyss — MC sunucu + Orb backend  → **CraftAbyss chat'i**
- Klasör: `Projects\CraftAbyss` (craftabyss.com sitesi + orb-agent + orb-plugin + ORB-SETUP.md) · Repo: yeni `kerem-alkan/craftabyss`.
- Kapsam: Minecraft ağı (Velocity+Paper, Pterodactyl), VDS'teki orb-agent (canlı: orb.craftabyss.com), orb-plugin (kurulacak), craftabyss.com sitesi. Orb radarına GERÇEK veri besler (keremalkan.com bu veriyi çeker).
- Sınır: keremalkan.com kodunu doğrudan değiştirmez; Orb radarı UI portfolyodadır. Burası backend/veri + craftabyss.com.
- Oku: `Projects\CraftAbyss\PROJE-DURUM.md`, `Projects\CraftAbyss\ORB-SETUP.md`.

### 3. AISpear — Bot + Launcher + Web  → **AISpear chat'i**
- Klasör: `Projects\AISpear` (apps/web, core/bot, apps/launcher, brand) · Repo: yeni **private** `kerem-alkan/aispear`.
- Kapsam: Warspear Online otomasyon ürünü. Bot motoru (Python), Tauri launcher (.exe), web mantığı. Bot/launcher keremalkan.com'daki `/api/token`+`/api/validate`'e lisans sorar (`AISPEAR_SERVER=https://keremalkan.com`).
- Sınır: Bot/launcher/.exe portfolyoya GİRMEZ (kullanıcının makinesinde kalır). Web auth/hub portfolyoya entegrasyon chat'inde girer.
- Oku: `Projects\AISpear\HANDOFF.md`, `INTEGRATION.md`, `ARCHITECTURE.md`.

## Nasıl bağlanıyorlar
- **keremalkan.com = hub/vitrin.** CraftAbyss → Orb radarına canlı veri verir. AISpear → demo + lisans API'si portfolyoda yaşar, bot uzaktan oraya sorar.
- Her ürün kendi reposunda/chatinde; portfolyo ikisini de sergiler + AISpear için auth/lisans sağlar.

## Altın kurallar
- **Web siteleri daima canlı/güncel** (Kerem'in en büyük reklamı): her değişiklikte `GONDER.bat` → Vercel.
- **Tasarım sistemi sabit:** site yüzü Apple açık tema; proje/app yüzü koyu abyss tema. AISpear imzası = altın mızrak (logo `Projects\AISpear\brand`). Yeni renk eklenmez.
- **GÜVENLİK:** Bu seansta düz metin paylaşılan TÜM parolalar/token'lar rotate edilmeli (SSH, DB, panel, LeaderOS, Wings token, Pterodactyl ptlc_, ORB_TOKEN). AISpear reposu private.
