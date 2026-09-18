import { NextResponse, type NextRequest } from 'next/server';
import { isProduction } from '@/lib/visitors/config';
import { submitVisitorCard, type SubmitError } from '@/lib/visitors/submit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const STATUS: Record<SubmitError, number> = {
  not_configured: 503,
  invalid: 400,
  captcha_failed: 400,
  moderation_failed: 422,
  rate_limited: 429,
  upstream_failed: 502,
};

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  // Production is the read-only demo surface; the sandbox is staging/preview.
  if (isProduction()) return new NextResponse(null, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid', detail: 'Body must be JSON.' }, { status: 400 });
  }

  const result = await submitVisitorCard(body, { ip: clientIp(req) });

  if (result.ok) {
    return NextResponse.json({ prNumber: result.prNumber, prUrl: result.prUrl, previewUrl: null });
  }

  const headers: Record<string, string> = {};
  if (result.retryAfterSeconds) headers['Retry-After'] = String(result.retryAfterSeconds);
  return NextResponse.json({ error: result.error, detail: result.detail }, { status: STATUS[result.error], headers });
}
