"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CraftAbyssRadar from "@/components/CraftAbyssRadar";

export default function CraftAbyssLivePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  // keep the page dark (covers overscroll), Esc returns to the portfolio
  useEffect(() => {
    document.body.style.background = "#07060b";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/");
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.background = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [router]);

  // dark placeholder until the client-only (WebGL) radar mounts — no light flash
  if (!mounted) return <div style={{ position: "fixed", inset: 0, background: "#07060b" }} />;
  return <CraftAbyssRadar />;
}
