"use client";

import { useEffect, useState } from "react";
import Portfolio from "@/components/Portfolio";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <Portfolio />;
}
