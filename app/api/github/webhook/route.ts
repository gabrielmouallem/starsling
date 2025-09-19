import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { inngest } from '@/lib/inngest/client';

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: Request) {
  const event = request.headers.get('x-github-event') || 'unknown';
  const delivery = request.headers.get('x-github-delivery') || '';
  const signature = request.headers.get('x-hub-signature-256') || '';

  // Raw body required for signature verification
  const rawBody = await request.text();

  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Missing GITHUB_WEBHOOK_SECRET' }, { status: 500 });
  }

  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  if (!signature || !timingSafeEqual(signature, expected)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse JSON after verification
  let payload: any = null;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    payload = null;
  }

  if (event === 'ping') {
    return NextResponse.json({ ok: true, pong: true });
  }

  // Enqueue to Inngest
  await inngest.send({
    name: 'github/webhook.received',
    data: {
      name: event,
      delivery,
      payload,
    },
  });

  return NextResponse.json({ ok: true });
}
