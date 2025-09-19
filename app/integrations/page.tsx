import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import IntegrationsClient from "@/components/integrations-client";

type InstallationRow = {
  provider: string;
  installation_id: string;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
};

export default async function Integrations() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      redirect("/login");
    }

    const activeMember = await auth.api
      .getActiveMember({ headers: await headers() })
      .catch(() => null as any);
    const organizationId: string | null =
      (activeMember as any)?.organizationId ?? null;
    if (!organizationId) {
      redirect("/onboarding");
    }

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("integration_installations")
      .select("provider, installation_id, organization_id, metadata")
      .eq("organization_id", organizationId as string);

    if (error) {
      throw error;
    }

    const installations: InstallationRow[] = data ?? [];

    return <IntegrationsClient initialInstallations={installations} />;
  } catch (_err) {
    redirect("/error?error=integrations_fetch_failed");
  }
}
