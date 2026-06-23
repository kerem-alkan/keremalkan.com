const skillGroups = [
  {
    category: "Frontend",
    icon: "🎨",
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend",
    icon: "⚙️",
    skills: ["Node.js", "Python", "Java", "REST API", "WebSocket"],
  },
  {
    category: "Altyapı",
    icon: "🛠️",
    skills: ["Pterodactyl", "Docker", "Nginx", "MySQL", "Redis"],
  },
  {
    category: "Araçlar",
    icon: "🧰",
    skills: ["Git", "GitHub Actions", "VS Code", "Linux", "Vercel"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-accent-light text-sm mb-3 tracking-widest uppercase">03. Beceriler</p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Araç Kutum</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillGroups.map((g) => (
            <div
              key={g.category}
              className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-6 hover:border-[#7C3AED]/40 transition-colors"
            >
              <div className="text-2xl mb-2">{g.icon}</div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{g.category}</h3>
              <ul className="space-y-2">
                {g.skills.map((s) => (
                  <li key={s} className="text-sm text-[#64748b] flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#7C3AED]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
