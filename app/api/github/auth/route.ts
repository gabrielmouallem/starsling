import { auth } from "@/lib/auth/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    request.headers.append("Access-Control-Allow-Origin", " https://github.com");

	const { redirect, url } = await auth.api.signInSocial({
		body: {
			provider: "github",
			errorCallbackURL: `${process.env.NEXT_PUBLIC_BETTER_AUTH_URL}/error`,
		},
	});

    return NextResponse.json({ redirect, url });
}

