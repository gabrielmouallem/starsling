import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { githubAppClient } from "@/lib/github/client";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activeMember = await auth.api.getActiveMember({ headers: await headers() }).catch(() => null as any);
    const organizationId: string | null = (activeMember as any)?.organizationId ?? null;
    if (!organizationId) {
      return NextResponse.json({ error: "No active organization" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const installationId: string | undefined = body?.installation_id;

    if (!installationId) {
      return NextResponse.json({ error: "Missing installation_id" }, { status: 400 });
    }

    // First, verify the user owns this installation
    const supabase = await createSupabaseClient();
    const { data: installation, error: fetchError } = await supabase
      .from("integration_installations")
      .select("*")
      .match({ installation_id: installationId, provider: "github", organization_id: organizationId })
      .single();

    if (fetchError || !installation) {
      return NextResponse.json({ error: "Installation not found" }, { status: 404 });
    }

    // Revoke the installation on GitHub
    const revoked = await githubAppClient.installations.delete(installationId);
    if (!revoked) {
      // Log the error but continue to clean up our database
      console.error(`Failed to revoke GitHub installation ${installationId}, continuing with database cleanup`);
    }

    // Remove from our database
    const { error: deleteError } = await supabase
      .from("integration_installations")
      .delete()
      .match({ installation_id: installationId, provider: "github", organization_id: organizationId });

    if (deleteError) {
      return NextResponse.json({ error: "Failed to remove installation record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Installation disconnected successfully" });
  } catch (error) {
    console.error("Disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect installation" }, { status: 500 });
  }
}


