import { NextResponse } from 'next/server';

export async function GET(_request: Request) {
	return NextResponse.json({
		route: '/api/github/auth',
		message: 'Placeholder: initiate GitHub OAuth here',
		ok: true,
	});
}


