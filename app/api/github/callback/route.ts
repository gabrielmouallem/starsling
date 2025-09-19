import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	const event = request.headers.get('x-github-event');
	const delivery = request.headers.get('x-github-delivery');
	const signature = request.headers.get('x-hub-signature-256');

	let payload: unknown = null;
	try {
		payload = await request.json();
	} catch {
		payload = null;
	}

	return NextResponse.json({
		route: '/api/github/webhook',
		message: 'Placeholder: handle GitHub webhook here',
		headers: { event, delivery, signature },
		received: payload,
		ok: true,
	});
}


