const projects = [
  {
    title: "CraftAbyss",
    description:
      "Türkiye'nin önde gelen Minecraft sunucularından biri. Özel gamemod'lar, web panel, canlı harita ve otomatik güncelleme sistemi ile donatılmış tam ölçekli bir oyun altyapısı.",
    tags: ["Java", "Next.js", "Pterodactyl", "Redis", "MySQL"],
    href: "https://craftabyss.com",
    github: null,
    featured: true,
    emoji: "⚔️",
  },
  {
    title: "CraftAbyss Web",
    description:
      "Sunucu web sitesi: canli sunucu durumu, Radar haritası, oyuncu istatistikleri ve mağaza entegrasyonu. /api route'ları ile Pterodactyl paneline bağlı.",
    tags: ["Next.js 14", "TypeScript", "Tailwind", "Pterodactyl API"],
    href: "https://craftabyss.com",
    github: "https://github.com/kerem-alkan/craftabyss-web",
    featured: true,
    emoji: "🌐",
  },
  {
    title: "keremalkan.com",
    description:
      "Kişisel portfolio ve link-in-bio sitesi. TypeWriter animasyonu, scroll-linked section'lar ve koyu tema ile.",
    tags: ["Next.js", "Tailwind", "TypeScript"],
    href: "https://keremalkan.com",
    github: "https://github.com/kerem-alkan/keremalkan.com",
    featured: false,
    emoji: "🖥️",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-[#111118]/50">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-accent-light text-sm mb-3 tracking-widest uppercase">02. Projeler</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Ne yaptım?</h2>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div
              key={p.title}
              className={`relative bg-[#0a0a0f] border rounded-xl p-6 hover:border-[#7C3AED]/60 transition-all duration-300 group ${
                p.featured ? "border-[#7C3AED]/30" : "border-[#1e1e2e]"
              }`}
            >
              {p.featured && (
                <span className="absolute top-4 right-4 text-xs font-mono text-accent-light bg-[#7C3AED]/10 px-2 py-0.5 rounded-full border border-[#7C3AED]/20">
                  featured
                </span>
              )}
              <div className="text-3xl mb-3">{p.emoji}</div>
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#A78BFA] transition-colors">
                {p.title}
              </h3>
              <p className="text-[#64748b] text-sm leading-relaxed mb-4">{p.description}</p>

              <div className="flex flex-wrap gap-2 mb-5">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-0.5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>

              <div className="flex gap-4">
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Siteye Git
                </a>
                {p.github && (
                  <a
                    href={p.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.48 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 013.01-.4c1.02 0 2.05.13 3.01.4 2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    Kaynak Kod
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
