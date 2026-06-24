export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 bg-[#111118]/50">
      <div className="max-w-2xl mx-auto text-center">
        <p className="font-mono text-accent-light text-sm mb-3 tracking-widest uppercase">04. İletişim</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Haydi Konuşalım</h2>
        <p className="text-[#64748b] mb-10 leading-relaxed">
          İş birliği, proje fikri veya sadece selam vermek için — mesaj atmaktan çekinme.
          Genellikle 24 saat içinde dönüş yapıyorum.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <a
            href="mailto:keremalkan0755@gmail.com"
            className="px-8 py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            E-posta Gönder
          </a>
          <a
            href="https://discord.gg/craftabyss"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border border-[#1e1e2e] hover:border-[#7C3AED] text-[#94a3b8] hover:text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.102 18.08.114 18.1.132 18.116a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
            </svg>
            Discord
          </a>
        </div>

        <div className="flex justify-center gap-8">
          {[
            { label: "GitHub", href: "https://github.com/kerem-alkan" },
            { label: "Discord Server", href: "https://discord.gg/craftabyss" },
            { label: "CraftAbyss", href: "https://craftabyss.com" },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#475569] hover:text-[#A78BFA] transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
