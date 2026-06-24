// AISpear Admin — sunucu kapısı: sadece admin geçer, sonra interaktif paneli render eder.
import { redirect } from "next/navigation";
import { getSession } from "@/lib/aispear-session";
import AdminApp from "@/components/AdminApp";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const s = await getSession();
  if (!s) redirect("/aispear/login?next=/admin");
  if (!(s.isAdmin || s.role === "admin")) redirect("/hub");
  return <AdminApp me={{ username: s.username, role: s.role }} />;
}
