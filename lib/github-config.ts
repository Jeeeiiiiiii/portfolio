/**
 * GitHub App environment, read here and nowhere else. Used by the blog bot
 * (lib/blog-bot) through lib/github-app.ts.
 */

export const REPO = {
  owner: process.env.GITHUB_REPO_OWNER ?? 'Jeeeiiiiiii',
  name: process.env.GITHUB_REPO_NAME ?? 'portfolio',
  baseBranch: process.env.GITHUB_BASE_BRANCH ?? 'main',
} as const;

export function githubAppConfig() {
  const appId = process.env.GITHUB_APP_ID;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID;
  // Vercel stores multi-line values with literal "\n"; normalise both forms.
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\n/g, '\n');
  if (!appId || !installationId || !privateKey) return null;
  return { appId: Number(appId), installationId: Number(installationId), privateKey };
}
