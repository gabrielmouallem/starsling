import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams, origin } = new URL(request.url);
        const installationId = searchParams.get("installation_id");
        const state = searchParams.get("state");
        const setupAction = searchParams.get("setup_action");

        if (!installationId) {
            return NextResponse.redirect(`${origin}/error?error=missing_installation_id`);
        }

        const cookieHeader = (await headers()).get("cookie") || "";
        const stateCookie = cookieHeader
            .split(/;\s*/)
            .map((c) => c.split("="))
            .find(([name]) => name === "gh_app_install_state")?.[1];
        if (!stateCookie || stateCookie !== state) {
            return NextResponse.redirect(`${origin}/error?error=invalid_state`);
        }

        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id ?? null;
        if (!userId) {
            return NextResponse.redirect(`${origin}/error?error=unauthenticated`);
        }

        const supabase = await createSupabaseClient();
        const { error } = await supabase
            .from("integration_installations")
            .upsert(
                [
                    {
                        provider: "github",
                        installation_id: installationId,
                        user_id: userId,
                        organization_id: null,
                        metadata: { setup_action: setupAction },
                    } as any,
                ],
                { onConflict: "installation_id" }
            );
        if (error) {
            return NextResponse.redirect(`${origin}/error?error=integration_save_failed`);
        }

        const res = NextResponse.redirect(`${origin}/integrations?connected=github`);
        res.cookies.set("gh_app_install_state", "", { maxAge: 0, path: "/" });
        return res;
    } catch {
        const { origin } = new URL(request.url);
        return NextResponse.redirect(`${origin}/error?error=github_callback_failed`);
    }
}


