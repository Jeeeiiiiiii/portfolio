import { z } from 'zod';
import { githubAppConfig } from '@/lib/visitors/config';
import { discordConfig } from './config';
import { dispatchDraft, listDraftPrs, mergeDraftPr, type DraftPr, type DraftRequest, type MergeResult } from './github';

/**
 * Turns one Discord interaction into a response. Anything that talks to
 * GitHub is deferred: Discord needs an answer within 3 seconds, so the route
 * replies "thinking…" and runs `run()` after responding, then edits the reply
 * with its result. Tests call this directly with fake adapters.
 */

export const InteractionType = { PING: 1, APPLICATION_COMMAND: 2 } as const;
export const ResponseType = { PONG: 1, MESSAGE: 4, DEFERRED_MESSAGE: 5 } as const;
const EPHEMERAL = 1 << 6;

export interface InteractionResponse {
  type: number;
  data?: { content: string; flags?: number; allowed_mentions: { parse: [] } };
}

export type Handled =
  | { kind: 'reply'; response: InteractionResponse }
  | { kind: 'defer'; run: () => Promise<string> };

export interface BotDeps {
  ownerId: () => string | null;
  githubConfigured: () => boolean;
  dispatch: (request: DraftRequest) => Promise<void>;
  listDrafts: () => Promise<DraftPr[]>;
  merge: (prNumber: number) => Promise<MergeResult>;
}

export const defaultDeps: BotDeps = {
  ownerId: () => discordConfig()?.ownerId ?? null,
  githubConfigured: () => githubAppConfig() !== null,
  dispatch: dispatchDraft,
  listDrafts: listDraftPrs,
  merge: mergeDraftPr,
};

const option = z.object({ name: z.string(), value: z.union([z.string(), z.number()]).optional() });

const interactionSchema = z.object({
  type: z.number(),
  application_id: z.string(),
  token: z.string(),
  member: z.object({ user: z.object({ id: z.string() }) }).optional(),
  user: z.object({ id: z.string() }).optional(),
  data: z
    .object({
      name: z.string(),
      options: z.array(option.extend({ options: z.array(option).optional() })).optional(),
    })
    .optional(),
});

const httpUrl = z
  .string()
  .trim()
  .url()
  .refine((v) => /^https?:\/\//i.test(v), 'must start with http:// or https://');

function reply(content: string, ephemeral = true): Handled {
  return {
    kind: 'reply',
    response: {
      type: ResponseType.MESSAGE,
      data: { content, flags: ephemeral ? EPHEMERAL : undefined, allowed_mentions: { parse: [] } },
    },
  };
}

export function handleInteraction(body: unknown, deps: BotDeps = defaultDeps): Handled {
  const parsed = interactionSchema.safeParse(body);
  if (!parsed.success) return reply('Could not read that interaction.');
  const i = parsed.data;

  if (i.type === InteractionType.PING) return { kind: 'reply', response: { type: ResponseType.PONG } };
  if (i.type !== InteractionType.APPLICATION_COMMAND || i.data?.name !== 'blog') return reply('Unknown command.');

  const owner = deps.ownerId();
  const caller = i.member?.user.id ?? i.user?.id;
  if (!owner || caller !== owner) return reply('Only the site owner can use /blog.');
  if (!deps.githubConfigured()) return reply('The GitHub App is not configured on this deployment.');

  const sub = i.data.options?.[0];
  const args = Object.fromEntries((sub?.options ?? []).map((o) => [o.name, o.value]));
  const discord = { discord_app_id: i.application_id, discord_token: i.token };

  switch (sub?.name) {
    case 'new': {
      const url = httpUrl.safeParse(args.url);
      if (!url.success) return reply('That URL does not look right — it must start with http:// or https://.');
      const note = typeof args.note === 'string' ? args.note.trim() : '';
      return {
        kind: 'defer',
        run: async () => {
          await deps.dispatch({ mode: 'new', url: url.data, note, ...discord });
          return `✍️ Drafting a post from <${url.data}>${note ? `\n> ${note.slice(0, 300)}` : ''}\nI'll edit this message with the PR and preview link — usually 3–6 minutes.`;
        },
      };
    }
    case 'revise': {
      const pr = Number(args.pr);
      const note = typeof args.note === 'string' ? args.note.trim() : '';
      if (!Number.isInteger(pr) || pr < 1 || !note) return reply('Usage: /blog revise pr:<number> note:<what to change>');
      return {
        kind: 'defer',
        run: async () => {
          await deps.dispatch({ mode: 'revise', pr, note, ...discord });
          return `🔁 Revising #${pr}\n> ${note.slice(0, 300)}\nI'll edit this message when the new preview is up.`;
        },
      };
    }
    case 'publish': {
      const pr = Number(args.pr);
      if (!Number.isInteger(pr) || pr < 1) return reply('Usage: /blog publish pr:<number>');
      return {
        kind: 'defer',
        run: async () => {
          const result = await deps.merge(pr);
          return result.ok
            ? `🚀 Merged #${pr} — it'll be live once the production deploy finishes (~1–2 min).\n<${result.url}>`
            : `⚠️ ${result.reason}`;
        },
      };
    }
    case 'list':
      return {
        kind: 'defer',
        run: async () => {
          const drafts = await deps.listDrafts();
          if (drafts.length === 0) return 'No open drafts.';
          return ['Open drafts:', ...drafts.map((d) => `• #${d.number} ${d.title} — <${d.url}>`)].join('\n');
        },
      };
    default:
      return reply('Unknown subcommand. Try /blog new, revise, publish or list.');
  }
}
