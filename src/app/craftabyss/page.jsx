import { redirect } from "next/navigation";

// İçerik artık ana sayfadaki omurga düğümünde (panel + canlı Orb overlay).
// Eski ayrı case sayfasını ana sayfaya yönlendir. /craftabyss/live ayrı kalır.
export default function CraftAbyssRedirect() {
  redirect("/");
}
