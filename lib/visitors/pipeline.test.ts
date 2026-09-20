import { describe, expect, it } from 'vitest';
import type { PrStatus } from './github';
import { pipelineSteps, stepStates } from './pipeline';

const base: PrStatus = {
  prNumber: 1,
  prUrl: 'https://github.com/x/y/pull/1',
  state: 'open',
  checks: 'pending',
  previewUrl: null,
  mergedAt: null,
};

describe('stepStates', () => {
  it('covers every step', () => {
    const states = stepStates(null);
    expect(Object.keys(states).sort()).toEqual(pipelineSteps.map((s) => s.id).sort());
  });

  it('before any status: submit is active, the rest wait', () => {
    expect(stepStates(null)).toMatchObject({ submit: 'active', branch: 'pending', live: 'pending' });
  });

  it('open PR with checks running', () => {
    expect(stepStates(base)).toMatchObject({ pr: 'done', checks: 'active', preview: 'active', review: 'pending', merge: 'pending' });
  });

  it('checks green + preview up → review is the active step', () => {
    const s = stepStates({ ...base, checks: 'success', previewUrl: 'https://x.vercel.app' });
    expect(s).toMatchObject({ checks: 'done', preview: 'done', review: 'active', merge: 'pending' });
  });

  it('checks red → failed, review waits', () => {
    expect(stepStates({ ...base, checks: 'failure' })).toMatchObject({ checks: 'failed', review: 'pending' });
  });

  it('merged → everything done', () => {
    const s = stepStates({ ...base, state: 'merged', checks: 'success', previewUrl: 'https://x', mergedAt: '2026-09-18T00:00:00Z' });
    expect(Object.values(s).every((v) => v === 'done')).toBe(true);
  });

  it('closed without merge → review failed, merge and live skipped', () => {
    expect(stepStates({ ...base, state: 'closed' })).toMatchObject({ review: 'failed', merge: 'skipped', live: 'skipped' });
  });
});
