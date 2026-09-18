import { turnstileConfig } from './config';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifies a Cloudflare Turnstile token. Throws 'turnstile_not_configured'
 * when there is no secret, so the caller can distinguish "not set up" from
 * "the visitor failed the challenge".
 */
export async function verifyTurnstile(token: string, remoteIp?: string): Promise<boolean> {
  const cfg = turnstileConfig();
  if (!cfg) throw new Error('turnstile_not_configured');

  const body = new URLSearchParams({ secret: cfg.secret, response: token });
  if (remoteIp) body.set('remoteip', remoteIp);

  const res = await fetch(VERIFY_URL, { method: 'POST', body, cache: 'no-store' });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}
