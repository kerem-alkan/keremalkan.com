import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kerem Alkan — Developer",
  description: "Full-stack developer & Minecraft server owner. Building things on the web and in-game.",
  openGraph: {
    title: "Kerem Alkan",
    description: "Full-stack developer & Minecraft server owner.",
    url: "https://keremalkan.com",
    siteName: "Kerem Alkan",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kerem Alkan",
    description: "Full-stack developer & Minecraft server owner.",
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
