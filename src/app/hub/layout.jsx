// AISpear Hub — marka (favicon + paylaşım görseli AISpear).
export const metadata = {
  title: "AISpear — Hub",
  description: "AISpear üye alanı: lisans durumu, launcher ve hesabın.",
  openGraph: {
    title: "AISpear — Hub",
    description: "AISpear üye alanı.",
    url: "https://keremalkan.com/hub",
    siteName: "AISpear",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-aispear.png", width: 1200, height: 630, alt: "AISpear" }],
  },
  twitter: { card: "summary_large_image", title: "AISpear — Hub", images: ["/og-aispear.png"] },
  icons: {
    icon: [
      { url: "/aispear-mark.svg", type: "image/svg+xml" },
      { url: "/aispear-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/aispear-apple.png", sizes: "180x180" }],
  },
};

export default function HubLayout({ children }) {
  return children;
}
