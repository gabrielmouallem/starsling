import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const origin = url.origin;
    const appSlug = process.env.GITHUB_APP_SLUG;

    if (!appSlug) {
        return NextResponse.json({ ok: false, error: "Missing GITHUB_APP_SLUG" }, { status: 500 });
    }

    const state = crypto.randomUUID();
    const redirectUri = `${origin}/api/github/callback`;
    const installUrl = `https://github.com/apps/${appSlug}/installations/new?state=${encodeURIComponent(state)}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    const response = NextResponse.redirect(installUrl);
    response.cookies.set("gh_app_install_state", state, {
        httpOnly: true,
        secure: origin.startsWith("https"),
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 10,
    });
    return response;
}

