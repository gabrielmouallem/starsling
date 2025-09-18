import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const url = new URL(request.url);
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');

	return NextResponse.json({
		route: '/api/github/callback',
		message: 'Placeholder: handle GitHub OAuth callback here',
		received: { code, state },
		ok: true,
	});
}


