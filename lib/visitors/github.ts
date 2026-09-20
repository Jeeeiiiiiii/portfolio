import { App, type Octokit } from 'octokit';
import { visitorsFileSchema, type VisitorCard } from '@/lib/visitors-schema';
import {
  REPO,
  VISITORS_FILE,
  VISITOR_BRANCH_PREFIX,
  VISITOR_PR_LABEL,
  githubAppConfig,
} from './config';

/**
 * The GitHub adapter for the visitor playground. Two operations: open a PR
 * that appends one card, and report where that PR stands. The App token
 * has contents:write + pull-requests:write on one repository, and this
 * module refuses to write any path other than VISITORS_FILE.
 */

export interface OpenPrResult {
  prNumber: number;
  prUrl: string;
  branch: string;
}

export type ChecksSummary = 'pending' | 'success' | 'failure' | 'none';

export interface PrStatus {
  prNumber: number;
  prUrl: string;
  state: 'open' | 'merged' | 'closed';
  checks: ChecksSummary;
  previewUrl: string | null;
  mergedAt: string | null;
}

let cached: Promise<Octokit> | null = null;

async function client(): Promise<Octokit> {
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

function assertAllowedPath(path: string) {
  if (path !== VISITORS_FILE) {
    throw new Error(`refusing to write ${path}: visitor PRs may only touch ${VISITORS_FILE}`);
  }
}

function assertVisitorBranch(ref: string) {
  if (!ref.startsWith(VISITOR_BRANCH_PREFIX)) {
    throw new Error(`refusing to touch ${ref}: not a visitor branch`);
  }
}

export async function openVisitorPr(card: VisitorCard): Promise<OpenPrResult> {
  const octokit = await client();
  const { owner, name: repo, baseBranch } = REPO;
  const branch = `${VISITOR_BRANCH_PREFIX}${card.id}`;
  assertVisitorBranch(branch);
  assertAllowedPath(VISITORS_FILE);

  // 1. where main is right now
  const { data: baseRef } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
  const baseSha = baseRef.object.sha;

  // 2. the current file, validated before we touch it
  const { data: file } = await octokit.rest.repos.getContent({ owner, repo, path: VISITORS_FILE, ref: baseSha });
  if (Array.isArray(file) || file.type !== 'file') throw new Error(`${VISITORS_FILE} is not a file`);
  const current = visitorsFileSchema.parse(JSON.parse(Buffer.from(file.content, 'base64').toString('utf8')));
  if (current.cards.some((c) => c.id === card.id)) throw new Error('duplicate card id');

  const next = { ...current, cards: [...current.cards, card] };
  const content = Buffer.from(JSON.stringify(next, null, 2) + '\n').toString('base64');

  // 3. branch, commit, PR
  await octokit.rest.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: baseSha });
  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: VISITORS_FILE,
    branch,
    sha: file.sha,
    message: `visitors: add card from ${card.name}`,
    content,
  });

  // Visitor text goes into the PR inside a code fence, where GitHub renders
  // no @mentions, links or markdown — the diff is the review surface anyway.
  const { data: pr } = await octokit.rest.pulls.create({
    owner,
    repo,
    base: baseBranch,
    head: branch,
    title: `Visitor card: ${card.name.replace(/@/g, '(at)')}`,
    body: [
      'A visitor submitted this card from the staging playground. Merging publishes it to production.',
      '',
      '```json',
      JSON.stringify(card, null, 2),
      '```',
    ].join('\n'),
  });

  await octokit.rest.issues.addLabels({ owner, repo, issue_number: pr.number, labels: [VISITOR_PR_LABEL] });

  return { prNumber: pr.number, prUrl: pr.html_url, branch };
}

/** A GitHub App without a read permission gets 403; report that as "unknown", not as an outage. */
async function orNull<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call();
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 403 || status === 404) return null;
    throw err;
  }
}

function summariseChecks(conclusions: (string | null)[]): ChecksSummary {
  if (conclusions.length === 0) return 'none';
  if (conclusions.some((c) => c === 'failure' || c === 'cancelled' || c === 'timed_out' || c === 'action_required')) {
    return 'failure';
  }
  if (conclusions.every((c) => c === 'success' || c === 'neutral' || c === 'skipped')) return 'success';
  return 'pending';
}

async function findPreviewUrl(octokit: Octokit, headRef: string, headSha: string): Promise<string | null> {
  const { owner, name: repo } = REPO;

  // Vercel's GitHub integration records a Deployment per commit with the
  // preview URL on its "success" status.
  const deployments = await orNull(() => octokit.rest.repos.listDeployments({ owner, repo, ref: headRef, per_page: 2 }));
  for (const d of deployments?.data ?? []) {
    const statuses = await orNull(() => octokit.rest.repos.listDeploymentStatuses({ owner, repo, deployment_id: d.id, per_page: 10 }));
    const ok = statuses?.data.find((s) => s.state === 'success' && (s.environment_url || s.target_url));
    if (ok) return ok.environment_url || ok.target_url || null;
  }

  // Older integrations use a commit status with context "Vercel" instead.
  const combined = await orNull(() => octokit.rest.repos.getCombinedStatusForRef({ owner, repo, ref: headSha }));
  const vercel = combined?.data.statuses.find((s) => /vercel/i.test(s.context) && s.state === 'success' && s.target_url);
  return vercel?.target_url ?? null;
}

export async function getVisitorPrStatus(prNumber: number): Promise<PrStatus | null> {
  const octokit = await client();
  const { owner, name: repo } = REPO;

  const { data: pr } = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });
  // Only report on PRs this feature created; anything else is none of the page's business.
  if (!pr.head.ref.startsWith(VISITOR_BRANCH_PREFIX)) return null;

  const state: PrStatus['state'] = pr.merged_at ? 'merged' : pr.state === 'open' ? 'open' : 'closed';

  const runs = await orNull(() => octokit.rest.checks.listForRef({ owner, repo, ref: pr.head.sha, per_page: 50 }));
  const checks = runs ? summariseChecks(runs.data.check_runs.map((r) => (r.status === 'completed' ? r.conclusion : null))) : 'none';

  // The preview only matters while the PR is open; after merge the card is on production.
  const previewUrl = state === 'open' ? await findPreviewUrl(octokit, pr.head.ref, pr.head.sha) : null;

  return { prNumber, prUrl: pr.html_url, state, checks, previewUrl, mergedAt: pr.merged_at };
}
