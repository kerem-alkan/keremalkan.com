// AISpear Admin — marka (favicon AISpear). Yönetim paneli.
export const metadata = {
  title: "AISpear — Admin",
  description: "AISpear yönetim paneli.",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/aispear-mark.svg", type: "image/svg+xml" },
      { url: "/aispear-icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/aispear-apple.png", sizes: "180x180" }],
  },
};

export default function AdminLayout({ children }) {
  return children;
}
