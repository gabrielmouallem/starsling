import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

type InstallationRow = {
  provider: string;
  installation_id: string;
  organization_id: string | null;
  metadata: Record<string, unknown> | null;
};

export default async function Integrations() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id ?? null;
    if (!userId) {
      redirect("/error?error=unauthenticated");
    }

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("integration_installations")
      .select("provider, installation_id, organization_id, metadata")
      .eq("user_id", userId as string);

    if (error) {
      throw error;
    }

    const installations: InstallationRow[] = data ?? [];
    const githubInstalls = installations.filter((i) => i.provider === "github");
    const githubConnected = githubInstalls.length > 0;

    return (
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Integrations</h1>

        {/* GitHub */}
        <div className="border rounded-md p-4 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-medium">GitHub</div>
            <div className="text-sm text-muted-foreground">
              {githubConnected
                ? `${githubInstalls.length} installation${
                    githubInstalls.length > 1 ? "s" : ""
                  } connected`
                : "Not connected"}
            </div>
            {githubConnected && (
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {githubInstalls.map((inst) => (
                  <li key={inst.installation_id}>
                    Installation {inst.installation_id}
                    {inst.organization_id
                      ? ` (org: ${inst.organization_id})`
                      : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {!githubConnected && (
            <Link href="/api/github/auth">
              <Button>Connect GitHub</Button>
            </Link>
          )}
        </div>
      </div>
    );
  } catch (_err) {
    redirect("/error?error=integrations_fetch_failed");
  }
}
