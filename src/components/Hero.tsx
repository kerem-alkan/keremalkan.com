"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const titles = ["Full-Stack Developer", "Minecraft Server Owner", "UI/UX Enthusiast", "Open Source Builder"];

export default function Hero() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = titles[titleIndex];
    let timeout: NodeJS.Timeout;

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setTitleIndex((i) => (i + 1) % titles.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, titleIndex]);

  return (
    <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-16">
      {/* Glow blob */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl">
        <p className="font-mono text-accent-light text-sm mb-4 tracking-widest uppercase opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          Merhaba, ben
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 opacity-0 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          Kerem Alkan
        </h1>
        <div
          className="text-xl md:text-2xl text-[#94a3b8] mb-8 h-8 font-mono opacity-0 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          {displayed}
          <span className="animate-blink">|</span>
        </div>
        <p
          className="text-[#64748b] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed opacity-0 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          Web uygulamaları inşa ediyorum, Minecraft sunucuları yönetiyorum ve açık kaynak projelere katkıda bulunuyorum.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <a
            href="#projects"
            className="px-8 py-3 bg-[#7C3AED] hover:bg-[#6d28d9] text-white rounded-lg font-medium transition-colors duration-200"
          >
            Projelerimi Gör
          </a>
          <a
            href="#contact"
            className="px-8 py-3 border border-[#1e1e2e] hover:border-[#7C3AED] text-[#94a3b8] hover:text-white rounded-lg font-medium transition-all duration-200"
          >
            İletişime Geç
          </a>
        </div>

        {/* Social links */}
        <div className="flex gap-6 justify-center mt-12 opacity-0 animate-fade-in" style={{ animationDelay: "1s" }}>
          {[
            { href: "https://github.com/kerem-alkan", label: "GitHub", icon: "github" },
            { href: "https://discord.gg/craftabyss", label: "Discord", icon: "discord" },
            { href: "https://craftabyss.com", label: "CraftAbyss", icon: "server" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#64748b] hover:text-[#A78BFA] text-sm transition-colors duration-200 flex items-center gap-1.5"
            >
              <span>{s.label}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s" }}>
        <div className="w-6 h-10 border-2 border-[#1e1e2e] rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-[#7C3AED] rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
