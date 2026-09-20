import { NextResponse, type NextRequest } from 'next/server';
import { githubAppConfig, isProduction } from '@/lib/visitors/config';
import { getVisitorPrStatus } from '@/lib/visitors/github';
import { checkStatusRateLimit, rateLimitIdentity } from '@/lib/visitors/ratelimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  return fwd?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function GET(req: NextRequest) {
  // Only the sandbox has a tracker; production must not be a proxy onto the App token.
  if (isProduction()) return new NextResponse(null, { status: 404 });

  const raw = req.nextUrl.searchParams.get('pr');
  const prNumber = Number(raw);
  if (!raw || !Number.isInteger(prNumber) || prNumber <= 0) {
    return NextResponse.json({ error: 'invalid', detail: 'pr must be a positive integer' }, { status: 400, headers: NO_STORE });
  }
  if (!githubAppConfig()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503, headers: NO_STORE });
  }

  // Each lookup is several GitHub calls on a quota shared with submissions.
  const limit = await checkStatusRateLimit(rateLimitIdentity(clientIp(req))).catch(() => ({ ok: true as const }));
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { ...NO_STORE, 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const status = await getVisitorPrStatus(prNumber);
    if (!status) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: NO_STORE });
    return NextResponse.json(status, { headers: NO_STORE });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown';
    const notFound = /not found/i.test(message);
    console.error('visitor status: lookup failed:', message);
    return NextResponse.json({ error: notFound ? 'not_found' : 'upstream_failed' }, { status: notFound ? 404 : 502, headers: NO_STORE });
  }
}
