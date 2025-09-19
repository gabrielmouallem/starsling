import { requireSession, ensureActiveOrganization } from "@/lib/auth/guards";
import { Navbar } from "@/components/navbar";

export default async function IntegrationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireSession();
  await ensureActiveOrganization();
  return (
    <div className="min-h-dvh w-full">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
