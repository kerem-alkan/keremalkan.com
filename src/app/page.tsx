"use client";

import { useEffect, useState } from "react";
import SpineHome from "@/components/spine/SpineHome";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <SpineHome />;
}
