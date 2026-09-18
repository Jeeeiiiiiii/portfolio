import { randomUUID } from 'node:crypto';
import { visitorSubmissionSchema, type VisitorCard } from '@/lib/visitors-schema';
import { githubAppConfig, turnstileConfig } from './config';
import { openVisitorPr, type OpenPrResult } from './github';
import { moderate } from './moderate';
import { checkRateLimit, rateLimitIdentity, type RateLimitResult } from './ratelimit';
import { verifyTurnstile } from './turnstile';

/**
 * The whole write path behind one function: validate → captcha → rate
 * limit → moderate → open PR. The route handler only maps the result to
 * HTTP; tests call this directly with fake adapters.
 */

export type SubmitError =
  | 'not_configured'
  | 'invalid'
  | 'captcha_failed'
  | 'rate_limited'
  | 'moderation_failed'
  | 'upstream_failed';

export type SubmitResult =
  | { ok: true; prNumber: number; prUrl: string }
  | { ok: false; error: SubmitError; detail: string; retryAfterSeconds?: number };

export interface SubmitDeps {
  isConfigured: () => boolean;
  verifyCaptcha: (token: string, ip: string) => Promise<boolean>;
  rateLimit: (identity: string) => Promise<RateLimitResult>;
  openPr: (card: VisitorCard) => Promise<OpenPrResult>;
  now: () => Date;
  newId: () => string;
}

export const defaultDeps: SubmitDeps = {
  isConfigured: () => githubAppConfig() !== null && turnstileConfig() !== null,
  verifyCaptcha: verifyTurnstile,
  rateLimit: checkRateLimit,
  openPr: openVisitorPr,
  now: () => new Date(),
  newId: () => randomUUID(),
};

export async function submitVisitorCard(
  body: unknown,
  ctx: { ip: string },
  deps: SubmitDeps = defaultDeps,
): Promise<SubmitResult> {
  if (!deps.isConfigured()) {
    return { ok: false, error: 'not_configured', detail: 'Submissions are not enabled on this deployment yet.' };
  }

  const parsed = visitorSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, error: 'invalid', detail: first ? `${first.path.join('.')}: ${first.message}` : 'Invalid submission.' };
  }
  const { turnstileToken, ...fields } = parsed.data;

  // Cheap and deterministic, so it runs before anything that costs a quota
  // or a captcha token; the link is allowlisted by the schema already.
  const mod = moderate({ name: fields.name, role: fields.role, message: fields.message });
  if (!mod.ok) return { ok: false, error: 'moderation_failed', detail: mod.reason };

  let captchaOk: boolean;
  try {
    captchaOk = await deps.verifyCaptcha(turnstileToken, ctx.ip);
  } catch (err) {
    console.error('visitor submit: captcha verification unreachable:', err instanceof Error ? err.message : 'unknown');
    return { ok: false, error: 'upstream_failed', detail: 'The captcha service is unreachable. Try again in a minute.' };
  }
  if (!captchaOk) {
    return { ok: false, error: 'captcha_failed', detail: 'The captcha could not be verified. Try again.' };
  }

  let limit: RateLimitResult;
  try {
    limit = await deps.rateLimit(rateLimitIdentity(ctx.ip));
  } catch (err) {
    console.error('visitor submit: rate limiter unreachable:', err instanceof Error ? err.message : 'unknown');
    return { ok: false, error: 'upstream_failed', detail: 'Could not check the submission limit. Try again in a minute.' };
  }
  if (!limit.ok) {
    return {
      ok: false,
      error: 'rate_limited',
      detail: 'Too many submissions from this address. Try again later.',
      retryAfterSeconds: limit.retryAfterSeconds,
    };
  }

  const card: VisitorCard = {
    id: deps.newId(),
    name: fields.name,
    role: fields.role,
    message: fields.message,
    link: fields.link ?? null,
    submittedAt: deps.now().toISOString(),
  };

  try {
    const pr = await deps.openPr(card);
    return { ok: true, prNumber: pr.prNumber, prUrl: pr.prUrl };
  } catch (err) {
    // Log the class of failure, never the payload or any token.
    console.error('visitor submit: opening PR failed:', err instanceof Error ? err.message : 'unknown');
    return { ok: false, error: 'upstream_failed', detail: 'Could not open the pull request. Try again in a minute.' };
  }
}
