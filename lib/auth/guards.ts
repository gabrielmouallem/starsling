import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function ensureActiveOrganization(): Promise<string | null> {
  try {
    const member = await auth.api.getActiveMember({ headers: await headers() });
    if (member?.organizationId) {
      return member.organizationId;
    }

    const created = await auth.api.createOrganization({
      body: {
        name: "Default Organization",
        slug: `default-${Math.random().toString(36).slice(2, 8)}`,
      },
      headers: await headers(),
    });

    if (created?.id) {
      await auth.api.setActiveOrganization({
        body: { organizationId: created.id },
        headers: await headers(),
      });
      return created.id;
    }
  } catch {
    // no-op; allow pages to continue without an active org
  }
  return null;
}

export async function requireActiveOrganization(): Promise<string> {
  const orgId = await ensureActiveOrganization();
  if (!orgId) {
    redirect("/onboarding");
  }
  return orgId;
}


