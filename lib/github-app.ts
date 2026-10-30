import { App, type Octokit } from 'octokit';
import { githubAppConfig } from '@/lib/visitors/config';

/**
 * One installation client for the GitHub App, shared by the visitor
 * playground and the blog bot. Each caller enforces its own path and branch
 * rules; this module only authenticates.
 */

let cached: Promise<Octokit> | null = null;

export async function installationClient(): Promise<Octokit> {
  if (cached) return cached;
  const cfg = githubAppConfig();
  if (!cfg) throw new Error('github_not_configured');
  const app = new App({ appId: cfg.appId, privateKey: cfg.privateKey });
  const pending = app.getInstallationOctokit(cfg.installationId) as Promise<Octokit>;
  cached = pending;
  // A failed auth must not be cached, or every later request inherits the failure.
  pending.catch(() => {
    if (cached === pending) cached = null;
  });
  return pending;
}
