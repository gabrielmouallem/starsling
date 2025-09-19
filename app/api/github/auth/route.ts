import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { GITHUB_STATE_COOKIE_NAME, GITHUB_STATE_COOKIE_MAX_AGE, GITHUB_APP_BASE_URL } from "@/lib/github/constants";

export async function GET(request: Request) {
    const { origin } = new URL(request.url);
    const appSlug = process.env.GITHUB_APP_SLUG;

    // Early return for missing configuration
    if (!appSlug) {
        return NextResponse.redirect(`${origin}/error?error=missing_github_app_slug`);
    }

    try {
        // Generate state and build GitHub App installation URL
        const state = crypto.randomUUID();
        const installUrl = new URL(`${GITHUB_APP_BASE_URL}/${appSlug}/installations/new`);
        installUrl.searchParams.set("state", state);
        installUrl.searchParams.set("redirect_uri", `${origin}/api/github/callback`);

        // Set state cookie using Next.js cookies API
        const cookieStore = await cookies();
        cookieStore.set(GITHUB_STATE_COOKIE_NAME, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: GITHUB_STATE_COOKIE_MAX_AGE,
        });

        return NextResponse.redirect(installUrl.toString());
    } catch (error) {
        console.error("GitHub auth initialization failed:", error);
        return NextResponse.redirect(`${origin}/error?error=github_auth_failed`);
    }
}

