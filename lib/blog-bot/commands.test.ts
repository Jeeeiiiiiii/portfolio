import { describe, expect, it } from 'vitest';
import command from './command.json';
import { handleInteraction, type BotDeps, type Handled } from './commands';
import type { DraftRequest } from './github';

const OWNER = '111';

function interaction(sub: string, options: Record<string, string | number> = {}, userId = OWNER) {
  return {
    type: 2,
    application_id: 'app-1',
    token: 'tok-1',
    member: { user: { id: userId } },
    data: {
      name: 'blog',
      options: [{ name: sub, options: Object.entries(options).map(([name, value]) => ({ name, value })) }],
    },
  };
}

function deps(overrides: Partial<BotDeps> = {}) {
  const dispatched: DraftRequest[] = [];
  const merged: number[] = [];
  const d: BotDeps = {
    ownerId: () => OWNER,
    githubConfigured: () => true,
    dispatch: async (r) => {
      dispatched.push(r);
    },
    listDrafts: async () => [{ number: 7, title: 'Blog draft: NAT costs', url: 'https://github.com/x/y/pull/7' }],
    merge: async (n) => {
      merged.push(n);
      return { ok: true, url: `https://github.com/x/y/pull/${n}` };
    },
    ...overrides,
  };
  return { d, dispatched, merged };
}

function replyText(h: Handled) {
  if (h.kind !== 'reply') throw new Error('expected an immediate reply');
  return (h.response.data as { content?: string } | undefined)?.content ?? '';
}

const draft = 'I keep seeing teams pay for NAT gateways just to reach S3. A gateway endpoint is free and takes ten minutes.';

function writeSubmit(content: string, title = '', userId = OWNER) {
  return {
    type: 5,
    application_id: 'app-1',
    token: 'tok-1',
    member: { user: { id: userId } },
    data: {
      custom_id: 'blog-write',
      components: [
        { type: 1, components: [{ type: 4, custom_id: 'title', value: title }] },
        { type: 1, components: [{ type: 4, custom_id: 'content', value: content }] },
      ],
    },
  };
}

async function run(h: Handled) {
  if (h.kind !== 'defer') throw new Error('expected a deferred handler');
  return h.run();
}

describe('handleInteraction', () => {
  it('answers Discord pings', () => {
    const h = handleInteraction({ type: 1, application_id: 'a', token: 't' }, deps().d);
    expect(h).toEqual({ kind: 'reply', response: { type: 1 } });
  });

  it('refuses everyone but the owner, without touching GitHub', () => {
    const { d, dispatched } = deps();
    const h = handleInteraction(interaction('new', { url: 'https://example.com' }, '999'), d);
    expect(replyText(h)).toMatch(/only the site owner/i);
    expect(h.kind === 'reply' && (h.response.data as { flags?: number })?.flags).toBe(64);
    expect(dispatched).toEqual([]);
  });

  it('refuses everyone when no owner is configured', () => {
    const h = handleInteraction(interaction('list'), deps({ ownerId: () => null }).d);
    expect(replyText(h)).toMatch(/only the site owner/i);
  });

  it('accepts a DM-style interaction (user instead of member)', async () => {
    const { d } = deps();
    const { member: _member, ...dm } = interaction('list');
    void _member;
    const h = handleInteraction({ ...dm, user: { id: OWNER } }, d);
    expect(await run(h)).toContain('#7');
  });

  it('new: dispatches the URL, note and reply token', async () => {
    const { d, dispatched } = deps();
    const h = handleInteraction(interaction('new', { url: ' https://example.com/nat ', note: 'cost angle ' }), d);
    expect(await run(h)).toContain('Drafting a post from <https://example.com/nat>');
    expect(dispatched).toEqual([
      { mode: 'new', url: 'https://example.com/nat', note: 'cost angle', discord_app_id: 'app-1', discord_token: 'tok-1' },
    ]);
  });

  it('new: works without a note', async () => {
    const { d, dispatched } = deps();
    await run(handleInteraction(interaction('new', { url: 'https://example.com' }), d));
    expect(dispatched[0]).toMatchObject({ note: '' });
  });

  it('new: rejects non-http URLs before deferring', () => {
    const { d, dispatched } = deps();
    expect(replyText(handleInteraction(interaction('new', { url: 'javascript:alert(1)' }), d))).toMatch(/url/i);
    expect(replyText(handleInteraction(interaction('new', { url: 'not a url' }), d))).toMatch(/url/i);
    expect(dispatched).toEqual([]);
  });

  it('revise: dispatches the PR and note', async () => {
    const { d, dispatched } = deps();
    await run(handleInteraction(interaction('revise', { pr: 7, note: 'shorter intro' }), d));
    expect(dispatched[0]).toMatchObject({ mode: 'revise', pr: 7, note: 'shorter intro' });
  });

  it('publish: reports GitHub refusing the merge', async () => {
    const { d } = deps({ merge: async () => ({ ok: false, reason: '#7 is not a blog draft.' }) });
    expect(await run(handleInteraction(interaction('publish', { pr: 7 }), d))).toBe('⚠️ #7 is not a blog draft.');
  });

  it('publish: merges and says so', async () => {
    const { d, merged } = deps();
    expect(await run(handleInteraction(interaction('publish', { pr: 7 }), d))).toMatch(/Merged #7/);
    expect(merged).toEqual([7]);
  });

  it('list: says when there is nothing open', async () => {
    const { d } = deps({ listDrafts: async () => [] });
    expect(await run(handleInteraction(interaction('list'), d))).toBe('No open drafts.');
  });

  it('says so when the GitHub App is not configured', () => {
    expect(replyText(handleInteraction(interaction('list'), deps({ githubConfigured: () => false }).d))).toMatch(/not configured/);
  });

  it('write: opens the text-box modal instead of replying', () => {
    const h = handleInteraction(interaction('write'), deps().d);
    expect(h.kind === 'reply' && h.response.type).toBe(9);
    expect(h.kind === 'reply' && h.response.data).toMatchObject({ custom_id: 'blog-write' });
  });

  it('write submit: dispatches the text and title as a write draft', async () => {
    const { d, dispatched } = deps();
    const msg = await run(handleInteraction(writeSubmit(`  ${draft}  `, ' S3 endpoints '), d));
    expect(msg).toContain('**S3 endpoints**');
    expect(dispatched).toEqual([
      { mode: 'write', note: draft, title: 'S3 endpoints', discord_app_id: 'app-1', discord_token: 'tok-1' },
    ]);
  });

  it('write submit: no title is fine', async () => {
    const { d, dispatched } = deps();
    await run(handleInteraction(writeSubmit(draft), d));
    expect(dispatched[0].title).toBeUndefined();
  });

  it('write submit: reads the newer label-wrapped modal layout too', async () => {
    const { d, dispatched } = deps();
    const body = writeSubmit(draft);
    body.data.components = [{ type: 18, component: { type: 4, custom_id: 'content', value: draft } }] as never;
    await run(handleInteraction(body, d));
    expect(dispatched[0].note).toBe(draft);
  });

  it('write submit: too short is refused before deferring', () => {
    const { d, dispatched } = deps();
    expect(replyText(handleInteraction(writeSubmit('too short'), d))).toMatch(/at least 50/);
    expect(dispatched).toEqual([]);
  });

  it('write submit: only the owner', () => {
    const { d, dispatched } = deps();
    expect(replyText(handleInteraction(writeSubmit(draft, '', '999'), d))).toMatch(/only the site owner/i);
    expect(dispatched).toEqual([]);
  });

  it('ignores modal submissions from other forms', () => {
    const body = { ...writeSubmit(draft), data: { custom_id: 'something-else', components: [] } };
    expect(replyText(handleInteraction(body, deps().d))).toBe('Unknown command.');
  });

  it('handles every subcommand registered in command.json', () => {
    const { d } = deps();
    for (const sub of command.options) {
      const h = handleInteraction(interaction(sub.name, { url: 'https://example.com', pr: 1, note: 'x' }), d);
      if (h.kind === 'reply') expect(replyText(h)).not.toMatch(/unknown subcommand/i);
    }
  });
});
