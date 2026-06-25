// AISpear sayfaları için ayrı marka: link önizlemesi (OG/Twitter) + favicon.
// /aispear ve /aispear/login bu metadata'yı alır (kök sitenin og.jpg'ini ezer).
export const metadata = {
  title: "AISpear — Warspear Online otomasyonu",
  description: "Warspear Online için yerel çalışan, lisanslı otomasyon. Vision + VLM, lisanslı launcher.",
  openGraph: {
    title: "AISpear",
    description: "Warspear Online için lisanslı otomasyon — vision + VLM.",
    url: "https://keremalkan.com/aispear",
    siteName: "AISpear",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-aispear.png", width: 1200, height: 630, alt: "AISpear" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AISpear — Warspear Online otomasyonu",
    description: "Lisanslı otomasyon — vision + VLM.",
    images: ["/og-aispear.png"],
  },
  icons: {
    icon: [
      { url: "/aispear-mark.svg", type: "image/svg+xml" },
      { url: "/aispear-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/aispear-apple.png", sizes: "180x180" }],
  },
};

export default function AISpearLayout({ children }) {
  return children;
}
