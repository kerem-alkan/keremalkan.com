// AISpear Admin — sunucu kapısı: sadece admin geçer, sonra interaktif paneli render eder.
import { redirect } from "next/navigation";
import { getLiveSession } from "@/lib/aispear-session";
import AdminApp from "@/components/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await getLiveSession();
  if (!s) redirect("/api/logout?next=/aispear/login"); // silinen/pasif → cookie temizle + login
  if (!(s.isAdmin || s.role === "admin")) redirect("/hub"); // rol düşürüldüyse anında hub'a
  return <AdminApp me={{ username: s.username, role: s.role }} />;
}
