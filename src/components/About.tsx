export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="font-mono text-accent-light text-sm mb-3 tracking-widest uppercase">01. Hakkımda</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Merhaba! 👋</h2>
          <div className="space-y-4 text-[#94a3b8] leading-relaxed">
            <p>
              Ben Kerem, Türkiye&apos;den bir full-stack developer ve Minecraft tutkunu. Web teknolojileri ile
              oyun geliştirme arasındaki köprüyü kurmaktan keyif alıyorum.
            </p>
            <p>
              <strong className="text-white">CraftAbyss</strong>&apos;in kurucusu ve baş geliştiricisiyim — Türkiye&apos;nin
              en aktif Minecraft sunucularından biri. Sunucu altyapısından web panellerine kadar her şeyi kendin kurdum.
            </p>
            <p>
              Boş zamanlarımda açık kaynak projelere katkıda bulunuyor, yeni teknolojiler öğreniyor ve topluluğumuzu
              büyütmek için çalışıyorum.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Projeler", value: "10+", sub: "tamamlandı" },
            { label: "Sunucu", value: "3yıl+", sub: "çevrimiçi" },
            { label: "Oyuncular", value: "1K+", sub: "toplam üye" },
            { label: "Commit", value: "500+", sub: "bu yıl" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#7C3AED]/50 transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-[#64748b] uppercase tracking-wider">{stat.label}</div>
              <div className="text-xs text-[#475569] mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
