import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SideMenu } from "@/components/side-menu";
import { Navbar } from "@/components/navbar";

export default async function IntegrationsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }
  return (
    <div className="min-h-dvh w-full">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
