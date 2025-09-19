import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const activeMember = await auth.api.getActiveMember({ headers: await headers() }).catch(() => null as any);
  const organizationId: string | null = (activeMember as any)?.organizationId ?? null;
  if (!organizationId) {
    return NextResponse.json({ error: "No active organization" }, { status: 400 });
  }

  const supabase = await createSupabaseServer();

  // Join issues via integration_installations for current org
  const { data, error } = await supabase
    .from("issues")
    .select("issue_id, number, title, state, repo_full_name, installation_id")
    .in(
      "installation_id",
      (
        await supabase
          .from("integration_installations")
          .select("installation_id")
          .eq("organization_id", organizationId)
          .eq("provider", "github")
      ).data?.map((r: any) => r.installation_id) || []
    );

  if (error) {
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }

  return NextResponse.json({ issues: data ?? [] });
}


