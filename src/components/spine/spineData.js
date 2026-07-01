// Omurga düğümleri — kök (üst) → taç (alt). Veri-güdümlü: yeni proje eklemek
// için buraya bir düğüm eklemek yeterli. Orb / AISpear web panel'e dokunulmaz;
// canlı uygulamalara yalnızca `href` ile yönlendirilir.

export const ACCENT = "#0066cc";

export const NODES = [
  {
    id: "root",
    kind: "root",
    color: "#6b7280",
    tr: {
      kicker: "KEREM ALKAN",
      title: "Yaşayan sistemler inşa ediyorum.",
      summary:
        "Oyun altyapısı, otomasyon ve gerçek-zamanlı arayüzler. Aşağı in — omurga boyunca projeler açılır.",
    },
    en: {
      kicker: "KEREM ALKAN",
      title: "I build systems that feel alive.",
      summary:
        "Game infrastructure, automation, and real-time interfaces. Descend — projects open along the spine.",
    },
  },
  {
    id: "about",
    kind: "about",
    color: "#8b93a3",
    tr: {
      kicker: "HAKKINDA",
      title: "Uçtan uca sistemler",
      summary:
        "Kendi sunucumda barındırdığım oyun altyapısından gerçek-zamanlı arayüzlere kadar sistemleri tasarlayıp işletiyorum.",
      body: [
        "Tek kişilik bir stüdyo gibi çalışıyorum: fikir, mimari, uygulama ve operasyon aynı elde.",
        "Performans önce gelir; her piksel ve her milisaniye kasıtlıdır.",
      ],
      tags: ["Systems", "Infra", "Real-time UI", "Creative coding"],
    },
    en: {
      kicker: "ABOUT",
      title: "Systems, end to end",
      summary:
        "I design and run systems end to end — from self-hosted game infrastructure to real-time interfaces.",
      body: [
        "I operate like a one-person studio: idea, architecture, build and ops in the same hand.",
        "Performance comes first; every pixel and millisecond is deliberate.",
      ],
      tags: ["Systems", "Infra", "Real-time UI", "Creative coding"],
    },
  },
  {
    id: "craftabyss",
    kind: "project",
    color: "#2DD4BF",
    experience: "orb", // node açılınca merkezden büyüyen overlay'de canlı Orb radarı
    href: "/craftabyss/live",
    detailHref: "/craftabyss",
    gallery: ["/calogo-web.png", "/camain.png"],
    tr: {
      kicker: "PROJE 01 · OYUN ALTYAPISI",
      title: "CraftAbyss",
      summary:
        "Kendi sunucumda barındırdığım Minecraft ağı — ve onu canlı izleyen operasyon görünümü: Orb.",
      body: [
        "Velocity proxy arkasında Paper tabanlı sunucular; Pterodactyl ile yönetilir, tamamı kendi VDS'imde çalışır.",
        "Orb, canlı durumu Pterodactyl API'si, MC ping ve RCON + spark'tan çeker: her sunucu bir enerji bölgesine dönüşür.",
      ],
      tags: ["Velocity", "Paper", "Pterodactyl", "RCON", "orb-agent"],
      process: [
        ["Altyapı", "Velocity + Paper + Pterodactyl, tek VDS'te uçtan uca kurulum."],
        ["Ölçüm", "orb-agent RCON/Pterodactyl/ping'den canlı veri toplar."],
        ["Görselleştir", "Orb radarı her sunucuyu bir enerji bölgesine dönüştürür."],
      ],
      cta: "Orb'u aç — canlı",
    },
    en: {
      kicker: "PROJECT 01 · GAME INFRASTRUCTURE",
      title: "CraftAbyss",
      summary:
        "A self-hosted Minecraft network — and Orb, the live operations view built to watch it breathe.",
      body: [
        "Paper backends behind a Velocity proxy, orchestrated on Pterodactyl, all on a single VDS I administer.",
        "Orb pulls live state from the Pterodactyl API, an MC ping and RCON + spark: each server becomes a zone of energy.",
      ],
      tags: ["Velocity", "Paper", "Pterodactyl", "RCON", "orb-agent"],
      process: [
        ["Infra", "Velocity + Paper + Pterodactyl, end to end on one VDS."],
        ["Measure", "orb-agent collects live data from RCON / Pterodactyl / ping."],
        ["Visualize", "The Orb radar turns each server into a zone of energy."],
      ],
      cta: "Open Orb — live",
    },
  },
  {
    id: "aispear",
    kind: "project",
    color: "#E8B04B",
    experience: "aispear", // node açılınca overlay'de üye/admin alanı (login → panel)
    href: "/aispear/login",
    detailHref: "/aispear",
    gallery: ["/aispear-wordmark.svg", "/aispear-icon.png"],
    tr: {
      kicker: "PROJE 02 · OTOMASYON",
      title: "AISpear",
      summary:
        "Warspear Online için yerel çalışan, lisanslı otomasyon — vision + VLM.",
      body: [
        "Bot motoru kullanıcının makinesinde çalışır: ekranı yakalar, durumu görsel modelle yorumlar, kararları yerelde verir.",
        "Tauri launcher açılışta keremalkan.com'a giriş yapıp JWT lisans alır; lisans iptal edilirse bot açılmaz.",
      ],
      tags: ["Python", "Vision", "VLM", "Tauri", "JWT lisans"],
      process: [
        ["Gör", "Ekranı yakalar, vision ile oyun durumunu çıkarır."],
        ["Karar", "Görsel-dil modeli savaş/loot/navigasyon kararı verir."],
        ["Lisans", "Launcher keremalkan.com'dan lisansı canlı doğrular."],
      ],
      cta: "Üye alanı / Giriş",
    },
    en: {
      kicker: "PROJECT 02 · AUTOMATION",
      title: "AISpear",
      summary: "Local, licensed automation for Warspear Online — vision + VLM.",
      body: [
        "The bot engine runs on the user's machine: captures the screen, interprets state with a visual model, decides locally.",
        "A Tauri launcher logs into keremalkan.com for a JWT license on start; revoke it and the bot won't open.",
      ],
      tags: ["Python", "Vision", "VLM", "Tauri", "JWT license"],
      process: [
        ["See", "Captures the screen, derives game state via vision."],
        ["Decide", "A vision-language model makes combat/loot/nav calls."],
        ["License", "The launcher validates the license live against keremalkan.com."],
      ],
      cta: "Member area / Sign in",
    },
  },
  {
    id: "lab",
    kind: "project",
    color: "#7c6ff0",
    tr: {
      kicker: "PROJE 03 · DENEYLER",
      title: "The Lab",
      summary: "Arayüzler, araçlar ve geliştirilmekte olan şeyler.",
      body: [
        "Jeneratif tasarım, shader denemeleri ve küçük araçlar — bitmemiş ama canlı.",
      ],
      tags: ["WebGL", "Generative", "Tools"],
      process: [
        ["Fikir", "Bir his ya da teknik merak; hızlı eskiz."],
        ["Prototip", "Shader / WebGL ile çalışan en küçük parça."],
        ["Cila", "İşe yarayanlar buraya ve siteye taşınır."],
      ],
    },
    en: {
      kicker: "PROJECT 03 · EXPERIMENTS",
      title: "The Lab",
      summary: "Interfaces, tools, and things in progress.",
      body: [
        "Generative design, shader studies and small tools — unfinished but alive.",
      ],
      tags: ["WebGL", "Generative", "Tools"],
      process: [
        ["Idea", "A feeling or a technical itch; a quick sketch."],
        ["Prototype", "The smallest working piece in shader / WebGL."],
        ["Polish", "What works graduates here and into the site."],
      ],
    },
  },
  {
    id: "contact",
    kind: "crown",
    color: ACCENT,
    tr: {
      kicker: "TAÇ · İLETİŞİM",
      title: "Bir şey yaratalım",
      summary: "hello@keremalkan.com",
      socials: ["Instagram", "GitHub", "LinkedIn"],
    },
    en: {
      kicker: "CROWN · CONTACT",
      title: "Let's build something",
      summary: "hello@keremalkan.com",
      socials: ["Instagram", "GitHub", "LinkedIn"],
    },
  },
];

// S-kıvrım için düğüm başına yatay yön çarpanı (-1..1). Organik, dönüşümlü.
export function sideFactor(i) {
  return Math.sin(i * 1.15 + 0.3);
}

// Catmull-Rom noktalarından yumuşak SVG path (omurga eğrisi).
export function smoothPath(points) {
  if (points.length < 2) return "";
  const p = points;
  let d = `M ${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}
