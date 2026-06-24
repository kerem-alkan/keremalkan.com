import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links — Kerem Alkan",
  description: "Kerem Alkan'ın tüm sosyal medya ve proje linkleri",
};

const links = [
  {
    label: "🎮 CraftAbyss — Minecraft Sunucusu",
    href: "https://craftabyss.com",
    sub: "craftabyss.com",
    color: "from-green-600/20 to-emerald-600/20 border-green-500/20 hover:border-green-400/50",
  },
  {
    label: "💻 GitHub",
    href: "https://github.com/kerem-alkan",
    sub: "@kerem-alkan",
    color: "from-gray-600/20 to-slate-600/20 border-gray-500/20 hover:border-gray-400/50",
  },
  {
    label: "💬 Discord Sunucusu",
    href: "https://discord.gg/craftabyss",
    sub: "CraftAbyss Community",
    color: "from-indigo-600/20 to-blue-600/20 border-indigo-500/20 hover:border-indigo-400/50",
  },
  {
    label: "📧 E-posta",
    href: "mailto:contact@keremalkan.com",
    sub: "contact@keremalkan.com",
    color: "from-red-600/20 to-pink-600/20 border-red-500/20 hover:border-red-400/50",
  },
  {
    label: "🗺️ Sunucu Canlı Haritası",
    href: "https://craftabyss.com/live",
    sub: "Radar — Gerçek zamanlı harita",
    color: "from-purple-600/20 to-violet-600/20 border-purple-500/20 hover:border-purple-400/50",
  },
];

export default function LinksPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        {/* Avatar placeholder */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] flex items-center justify-center text-2xl font-bold text-white mb-3">
            K
          </div>
          <h1 className="text-white font-semibold text-lg">Kerem Alkan</h1>
          <p className="text-[#64748b] text-sm mt-1">Full-Stack Dev &amp; MC Server Owner</p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target={l.href.startsWith("mailto") ? "_self" : "_blank"}
              rel="noopener noreferrer"
              className={`block bg-gradient-to-r ${l.color} border rounded-xl px-5 py-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7C3AED]/10`}
            >
              <div className="text-white font-medium text-sm">{l.label}</div>
              <div className="text-[#64748b] text-xs mt-0.5">{l.sub}</div>
            </a>
          ))}
        </div>

        {/* Back */}
        <div className="text-center mt-8">
          <a href="/" className="text-xs text-[#334155] hover:text-[#A78BFA] transition-colors font-mono">
            ← keremalkan.com
          </a>
        </div>
      </div>
    </main>
  );
}
