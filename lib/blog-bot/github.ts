import { installationClient } from '@/lib/github-app';
import { REPO } from '@/lib/visitors/config';
import { BLOG_BRANCH_PREFIX, BLOG_DISPATCH_EVENT } from './config';

/**
 * The GitHub adapter for the blog bot. It never writes content itself:
 * drafting happens in blog-draft.yml, started by a repository_dispatch.
 * It only starts that workflow, lists draft PRs and merges one.
 */

export interface DraftRequest {
  mode: 'new' | 'revise';
  url?: string;
  note: string;
  pr?: number;
  /** lets the workflow edit the Discord reply when it finishes */
  discord_app_id: string;
  discord_token: string;
}

export interface DraftPr {
  number: number;
  title: string;
  url: string;
}

export type MergeResult = { ok: true; url: string } | { ok: false; reason: string };

export async function dispatchDraft(request: DraftRequest): Promise<void> {
  const octokit = await installationClient();
  await octokit.rest.repos.createDispatchEvent({
    owner: REPO.owner,
    repo: REPO.name,
    event_type: BLOG_DISPATCH_EVENT,
    client_payload: { ...request },
  });
}

export async function listDraftPrs(): Promise<DraftPr[]> {
  const octokit = await installationClient();
  const { data } = await octokit.rest.pulls.list({ owner: REPO.owner, repo: REPO.name, state: 'open', per_page: 50 });
  return data
    .filter((pr) => pr.head.ref.startsWith(BLOG_BRANCH_PREFIX))
    .map((pr) => ({ number: pr.number, title: pr.title, url: pr.html_url }));
}

export async function mergeDraftPr(prNumber: number): Promise<MergeResult> {
  const octokit = await installationClient();
  const { owner, name: repo } = REPO;
  const { data: pr } = await octokit.rest.pulls.get({ owner, repo, pull_number: prNumber });
  // only drafts this bot opened; any other PR is out of reach from Discord
  if (!pr.head.ref.startsWith(BLOG_BRANCH_PREFIX)) return { ok: false, reason: `#${prNumber} is not a blog draft.` };
  if (pr.state !== 'open') return { ok: false, reason: `#${prNumber} is already ${pr.merged_at ? 'merged' : 'closed'}.` };

  try {
    await octokit.rest.pulls.merge({ owner, repo, pull_number: prNumber, merge_method: 'squash' });
  } catch (err) {
    // 405 = not mergeable (failing checks, branch protection); GitHub's message says which
    const message = err instanceof Error ? err.message : 'unknown error';
    return { ok: false, reason: `GitHub refused the merge: ${message}` };
  }
  await octokit.rest.git.deleteRef({ owner, repo, ref: `heads/${pr.head.ref}` }).catch(() => undefined);
  return { ok: true, url: pr.html_url };
}
