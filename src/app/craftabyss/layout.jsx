// CraftAbyss sayfaları için ayrı marka (favicon + paylaşım görseli).
export const metadata = {
  title: "CraftAbyss — Minecraft ağı & Orb",
  description: "Self-hosted Minecraft ağı. Orb ile canlı operasyon görünümü.",
  openGraph: {
    title: "CraftAbyss",
    description: "Self-hosted Minecraft ağı · Orb canlı izleme.",
    url: "https://keremalkan.com/craftabyss/live",
    siteName: "CraftAbyss",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-craftabyss.png", width: 1200, height: 630, alt: "CraftAbyss" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CraftAbyss — Minecraft ağı & Orb",
    description: "Self-hosted Minecraft ağı · Orb canlı izleme.",
    images: ["/og-craftabyss.png"],
  },
  icons: {
    icon: [{ url: "/ca-icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/ca-apple.png", sizes: "180x180" }],
  },
};

export default function CraftAbyssLayout({ children }) {
  return children;
}
