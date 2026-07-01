import { redirect } from "next/navigation";

// Bu bölümün içeriği artık ana sayfadaki omurga düğümünde (panel + overlay).
// Eski ayrı case sayfasını ana sayfaya yönlendir. /aispear/login ve /aispear/register ayrı kalır.
export default function AISpearRedirect() {
  redirect("/");
}
