import { describe, expect, it } from 'vitest';
import { submitVisitorCard, type SubmitDeps } from './submit';
import type { VisitorCard } from '@/lib/visitors-schema';

const valid = {
  name: 'Ada Lovelace',
  role: 'SRE @ Analytical Engines',
  message: 'Loved the pipeline-lab write-up, especially the two gates.',
  link: 'https://github.com/ada',
  turnstileToken: 'tok',
};

function deps(overrides: Partial<SubmitDeps> = {}) {
  const opened: VisitorCard[] = [];
  const d: SubmitDeps = {
    isConfigured: () => true,
    verifyCaptcha: async () => true,
    rateLimit: async () => ({ ok: true }),
    openPr: async (card) => {
      opened.push(card);
      return { prNumber: 42, prUrl: 'https://github.com/x/y/pull/42', branch: `visitor/${card.id}` };
    },
    now: () => new Date('2026-09-18T00:00:00Z'),
    newId: () => 'id-1',
    ...overrides,
  };
  return { d, opened };
}

describe('submitVisitorCard', () => {
  it('runs the whole path and opens a PR with a well-formed card', async () => {
    const { d, opened } = deps();
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toEqual({ ok: true, prNumber: 42, prUrl: 'https://github.com/x/y/pull/42' });
    expect(opened).toEqual([
      {
        id: 'id-1',
        name: 'Ada Lovelace',
        role: 'SRE @ Analytical Engines',
        message: valid.message,
        link: 'https://github.com/ada',
        submittedAt: '2026-09-18T00:00:00.000Z',
      },
    ]);
  });

  it('refuses before doing anything when not configured', async () => {
    let captchaCalls = 0;
    const { d } = deps({ isConfigured: () => false, verifyCaptcha: async () => (captchaCalls++, true) });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'not_configured' });
    expect(captchaCalls).toBe(0);
  });

  it('rejects an invalid body with the offending field', async () => {
    const { d, opened } = deps();
    const result = await submitVisitorCard({ ...valid, message: 'short' }, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'invalid' });
    expect((result as { detail: string }).detail).toMatch(/^message:/);
    expect(opened).toHaveLength(0);
  });

  it('rejects a link outside the allowlist', async () => {
    const { d } = deps();
    const result = await submitVisitorCard({ ...valid, link: 'https://evil.example/x' }, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'invalid' });
  });

  it('stops at the captcha', async () => {
    let limited = 0;
    const { d, opened } = deps({ verifyCaptcha: async () => false, rateLimit: async () => (limited++, { ok: true }) });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'captcha_failed' });
    expect(limited).toBe(0);
    expect(opened).toHaveLength(0);
  });

  it('surfaces the rate limit with a retry hint', async () => {
    const { d } = deps({ rateLimit: async () => ({ ok: false, retryAfterSeconds: 37 }) });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'rate_limited', retryAfterSeconds: 37 });
  });

  it('never hands the raw IP to the rate limiter', async () => {
    const seen: string[] = [];
    const { d } = deps({ rateLimit: async (id) => (seen.push(id), { ok: true }) });
    await submitVisitorCard(valid, { ip: '203.0.113.9' }, d);
    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toContain('203.0.113.9');
    expect(seen[0]).toMatch(/^[0-9a-f]{32}$/);
  });

  it('rejects links and HTML hidden in free text', async () => {
    const { d, opened } = deps();
    const withUrl = await submitVisitorCard({ ...valid, message: 'check out https://spam.example now please' }, { ip: '1.2.3.4' }, d);
    expect(withUrl).toMatchObject({ ok: false, error: 'moderation_failed' });
    const withTag = await submitVisitorCard({ ...valid, name: '<b>Ada</b>' }, { ip: '1.2.3.4' }, d);
    expect(withTag).toMatchObject({ ok: false, error: 'moderation_failed' });
    expect(opened).toHaveLength(0);
  });

  it('maps an upstream failure without leaking it', async () => {
    const { d } = deps({
      openPr: async () => {
        throw new Error('secret-bearing message');
      },
    });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'upstream_failed' });
    expect((result as { detail: string }).detail).not.toContain('secret-bearing');
  });

  it('moderation runs before the captcha and the rate limit, so a rejected message costs nothing', async () => {
    let captcha = 0;
    let limited = 0;
    const { d } = deps({
      verifyCaptcha: async () => (captcha++, true),
      rateLimit: async () => (limited++, { ok: true }),
    });
    const result = await submitVisitorCard({ ...valid, message: 'see https://spam.example for more' }, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'moderation_failed' });
    expect(captcha).toBe(0);
    expect(limited).toBe(0);
  });

  it('maps a captcha service outage to upstream_failed, not a 500', async () => {
    const { d } = deps({
      verifyCaptcha: async () => {
        throw new Error('ECONNRESET');
      },
    });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'upstream_failed' });
  });

  it('maps a rate limiter outage to upstream_failed', async () => {
    const { d } = deps({
      rateLimit: async () => {
        throw new Error('upstash 503');
      },
    });
    const result = await submitVisitorCard(valid, { ip: '1.2.3.4' }, d);
    expect(result).toMatchObject({ ok: false, error: 'upstream_failed' });
  });

  it('defaults link to null when omitted', async () => {
    const { d, opened } = deps();
    const { link: _omit, ...noLink } = valid;
    void _omit;
    await submitVisitorCard(noLink, { ip: '1.2.3.4' }, d);
    expect(opened[0].link).toBeNull();
  });
});
