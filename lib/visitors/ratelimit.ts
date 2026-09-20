import { createHash } from 'node:crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { upstashConfig } from './config';

export type RateLimitResult = { ok: true; skipped?: boolean } | { ok: false; retryAfterSeconds: number };

let limiters: { minute: Ratelimit; day: Ratelimit; status: Ratelimit } | null | undefined;

function getLimiters() {
  if (limiters !== undefined) return limiters;
  const cfg = upstashConfig();
  if (!cfg) {
    limiters = null;
    return limiters;
  }
  const redis = new Redis(cfg);
  limiters = {
    minute: new Ratelimit({ redis, prefix: 'visitors:1m', limiter: Ratelimit.slidingWindow(1, '60 s') }),
    day: new Ratelimit({ redis, prefix: 'visitors:24h', limiter: Ratelimit.slidingWindow(5, '24 h') }),
    // The tracker polls every 8s (~8/min); 20/min leaves headroom for two tabs, not for a curl loop.
    status: new Ratelimit({ redis, prefix: 'visitors:status', limiter: Ratelimit.slidingWindow(20, '60 s') }),
  };
  return limiters;
}

/** The raw IP never reaches Redis; a salted hash does. */
export function rateLimitIdentity(ip: string): string {
  const salt = process.env.VISITOR_RATELIMIT_SALT ?? 'visitors';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

/**
 * 1 submission per minute and 5 per day per identity. When Upstash is not
 * configured the check is skipped and reported as such; Turnstile still
 * gates the request, and the route only runs off production.
 */
export async function checkRateLimit(identity: string): Promise<RateLimitResult> {
  const l = getLimiters();
  if (!l) return { ok: true, skipped: true };

  const minute = await l.minute.limit(identity);
  if (!minute.success) return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((minute.reset - Date.now()) / 1000)) };

  const day = await l.day.limit(identity);
  if (!day.success) return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((day.reset - Date.now()) / 1000)) };

  return { ok: true };
}

/** For the status poll: 20 lookups per minute per identity, each of which fans out to several GitHub calls. */
export async function checkStatusRateLimit(identity: string): Promise<RateLimitResult> {
  const l = getLimiters();
  if (!l) return { ok: true, skipped: true };
  const r = await l.status.limit(identity);
  if (!r.success) return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((r.reset - Date.now()) / 1000)) };
  return { ok: true };
}
