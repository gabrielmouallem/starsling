import { redirect } from "next/navigation";
import { requireSession, ensureActiveOrganization } from "@/lib/auth/guards";

export default async function Home() {
  await requireSession();
  await ensureActiveOrganization();

  return redirect("/integrations");
}
