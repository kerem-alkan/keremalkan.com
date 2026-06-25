import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerem Alkan — Systems that feel alive",
  description:
    "Oyun altyapısı, otomasyon ve gerçek-zamanlı arayüzler. CraftAbyss & AISpear.",
  metadataBase: new URL("https://keremalkan.com"),
  openGraph: {
    title: "Kerem Alkan",
    description: "Oyun altyapısı · otomasyon · gerçek-zamanlı arayüzler.",
    url: "https://keremalkan.com",
    siteName: "Kerem Alkan",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-home.png", width: 1200, height: 630, alt: "Kerem Alkan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerem Alkan",
    description: "Oyun altyapısı · otomasyon · gerçek-zamanlı arayüzler.",
    images: ["/og-home.png"],
  },
  icons: {
    icon: [{ url: "/km-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/km-apple.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
