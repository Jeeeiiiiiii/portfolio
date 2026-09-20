import type { PrStatus } from './github';

/**
 * The stages a visitor card goes through, in order. The static explainer on
 * /visitors and the live tracker after a submission both render this list;
 * the tracker colours each stage from a PrStatus.
 */

export interface PipelineStep {
  id: 'submit' | 'branch' | 'pr' | 'checks' | 'preview' | 'review' | 'merge' | 'live';
  label: string;
  detail: string;
}

export const pipelineSteps: PipelineStep[] = [
  { id: 'submit', label: 'submit', detail: 'form → zod → captcha → rate limit → moderation' },
  { id: 'branch', label: 'branch + commit', detail: 'a GitHub App commits content/visitors.json on visitor/<id>' },
  { id: 'pr', label: 'pull request', detail: 'opened against main, labelled visitor-submission' },
  { id: 'checks', label: 'ci checks', detail: 'lint · typecheck · build · guard: only visitors.json may change' },
  { id: 'preview', label: 'preview deploy', detail: 'vercel builds the branch and posts a preview url' },
  { id: 'review', label: 'review', detail: 'the owner reads the diff on GitHub' },
  { id: 'merge', label: 'merge', detail: 'branch protection: checks green + one approval' },
  { id: 'live', label: 'live', detail: 'main deploys to production; the card appears on this page' },
];

export type StepState = 'done' | 'active' | 'failed' | 'pending' | 'skipped';

/** Derive one state per step from what GitHub reports. */
export function stepStates(status: PrStatus | null): Record<PipelineStep['id'], StepState> {
  if (!status) {
    return { submit: 'active', branch: 'pending', pr: 'pending', checks: 'pending', preview: 'pending', review: 'pending', merge: 'pending', live: 'pending' };
  }

  const checks: StepState =
    status.checks === 'success' ? 'done' : status.checks === 'failure' ? 'failed' : 'active';
  const preview: StepState = status.previewUrl ? 'done' : status.state === 'open' ? 'active' : 'skipped';

  if (status.state === 'merged') {
    return { submit: 'done', branch: 'done', pr: 'done', checks: 'done', preview, review: 'done', merge: 'done', live: 'done' };
  }
  if (status.state === 'closed') {
    return { submit: 'done', branch: 'done', pr: 'done', checks, preview, review: 'failed', merge: 'skipped', live: 'skipped' };
  }
  return {
    submit: 'done',
    branch: 'done',
    pr: 'done',
    checks,
    preview,
    review: checks === 'done' ? 'active' : 'pending',
    merge: 'pending',
    live: 'pending',
  };
}
