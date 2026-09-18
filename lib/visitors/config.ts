/**
 * Environment for the visitor write path. Everything is read here and
 * nowhere else, so "is the feature configured?" has one answer.
 */

export const REPO = {
  owner: process.env.GITHUB_REPO_OWNER ?? 'Jeeeiiiiiii',
  name: process.env.GITHUB_REPO_NAME ?? 'portfolio',
  baseBranch: process.env.GITHUB_BASE_BRANCH ?? 'main',
} as const;

/** The only path a visitor PR may touch. Enforced in github.ts and by CI. */
export const VISITORS_FILE = 'content/visitors.json';
export const VISITOR_BRANCH_PREFIX = 'visitor/';
export const VISITOR_PR_LABEL = 'visitor-submission';

export function githubAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  // Vercel stores multi-line values with literal "\n"; normalise both forms.
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!appId || !installationId || !privateKey) return null;
  return { appId: Number(appId), installationId: Number(installationId), privateKey };
}

export function turnstileConfig() {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  return secret ? { secret } : null;
}

export function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export const isProduction = () => process.env.VERCEL_ENV === 'production';

/** Public site key; the form only renders when this is present. */
export const turnstileSiteKey = () => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null;
