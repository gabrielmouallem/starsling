import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
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

    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("integration_installations")
      .select("provider, installation_id, organization_id, metadata")
      .eq("organization_id", organizationId)
      .eq("provider", "github");

    if (error) {
      console.error("Failed to fetch installations:", error);
      return NextResponse.json({ error: "Failed to fetch installations" }, { status: 500 });
    }

    return NextResponse.json({ installations: data ?? [] });
  } catch (error) {
    console.error("Installations fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
