import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerem Alkan — Systems that feel alive",
  description:
    "Game infrastructure, automation, and real-time interfaces. Currently running CraftAbyss — a self-hosted Minecraft network with Orb, a live operations view.",
  metadataBase: new URL("https://keremalkan.com"),
  openGraph: {
    title: "Kerem Alkan",
    description: "Game infrastructure, automation & real-time interfaces. CraftAbyss Orb — live ops.",
    url: "https://keremalkan.com",
    siteName: "Kerem Alkan",
    locale: "tr_TR",
    type: "website",
    images: ["/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerem Alkan",
    description: "Game infrastructure, automation & real-time interfaces.",
    images: ["/og.jpg"],
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
        <SpeedInsights />
      </body>
    </html>
  );
}
