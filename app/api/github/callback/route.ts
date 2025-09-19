import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { fetchInstallationDetails } from "@/lib/github/app";
import { GITHUB_STATE_COOKIE_NAME } from "@/lib/github/constants";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const installationId = searchParams.get("installation_id");
    const state = searchParams.get("state");
    const setupAction = searchParams.get("setup_action");

    // Noisy debug logging removed for production

    // Validate required parameters
    if (!installationId) {
        return NextResponse.redirect(`${origin}/error?error=missing_installation_id`);
    }

    try {
        // Validate state using Next.js cookies API
        const cookieStore = await cookies();
        const stateCookie = cookieStore.get(GITHUB_STATE_COOKIE_NAME)?.value;
        
        if (!stateCookie || stateCookie !== state) {
            return NextResponse.redirect(`${origin}/error?error=invalid_state`);
        }

        const session = await auth.api.getSession({ headers: await headers() });
        const userId = session?.user?.id ?? null;
        if (!userId) {
            return NextResponse.redirect(`${origin}/error?error=unauthenticated`);
        }

        // Active organization (if any)
        const activeMember = await auth.api.getActiveMember({ headers: await headers() }).catch(() => null as any);
        const activeOrgId: string | null = (activeMember as any)?.organizationId ?? null;

        // Fetch installation/account details from GitHub to capture org/user info
        const installation = await fetchInstallationDetails(installationId);
        const accountLogin = installation?.account?.login ?? null;
        const accountType = (installation?.target_type || installation?.account?.type) ?? null;
        // Prefer active org id if present; otherwise, for org installs, fallback to GitHub org id recorded in metadata
        const organizationId = activeOrgId || (accountType === "Organization" ? String(installation?.account?.id ?? "") || null : null);

        const supabase = await createSupabaseClient();
        const { error } = await supabase
            .from("integration_installations")
            .upsert(
                [
                    {
                        provider: "github",
                        installation_id: installationId,
                        user_id: userId,
                        organization_id: organizationId,
                        metadata: {
                            setup_action: setupAction,
                            account_login: accountLogin,
                            account_type: accountType,
                        },
                    } as any,
                ],
                { onConflict: "installation_id" }
            );
        if (error) {
            return NextResponse.redirect(`${origin}/error?error=integration_save_failed`);
        }

        // Clear state cookie and redirect to success page
        cookieStore.delete(GITHUB_STATE_COOKIE_NAME);
        return NextResponse.redirect(`${origin}/integrations?connected=github`);
    } catch (error) {
        console.error("GitHub callback processing failed:", error);
        return NextResponse.redirect(`${origin}/error?error=github_callback_failed`);
    }
}


