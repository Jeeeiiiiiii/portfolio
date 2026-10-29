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

export const InteractionType = { PING: 1, APPLICATION_COMMAND: 2, MODAL_SUBMIT: 5 } as const;
export const ResponseType = { PONG: 1, MESSAGE: 4, DEFERRED_MESSAGE: 5, MODAL: 9 } as const;
const EPHEMERAL = 1 << 6;

/** /blog write answers with this modal; its submission comes back as a MODAL_SUBMIT. */
export const WRITE_MODAL_ID = 'blog-write';
const WRITE_MIN_CHARS = 50;
const WRITE_MAX_CHARS = 4000; // Discord's limit for one text input

interface MessageData {
  content: string;
  flags?: number;
  allowed_mentions: { parse: [] };
}

interface ModalData {
  custom_id: string;
  title: string;
  components: unknown[];
}

export interface InteractionResponse {
  type: number;
  data?: MessageData | ModalData;
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
      // slash commands
      name: z.string().optional(),
      options: z.array(option.extend({ options: z.array(option).optional() })).optional(),
      // modal submissions
      custom_id: z.string().optional(),
      components: z.array(z.unknown()).optional(),
    })
    .optional(),
});

const writeModal: ModalData = {
  custom_id: WRITE_MODAL_ID,
  title: 'New blog post',
  components: [
    {
      type: 1,
      components: [
        { type: 4, custom_id: 'title', label: 'Title (optional)', style: 1, required: false, max_length: 100 },
      ],
    },
    {
      type: 1,
      components: [
        {
          type: 4,
          custom_id: 'content',
          label: "What's the post?",
          style: 2,
          required: true,
          min_length: WRITE_MIN_CHARS,
          max_length: WRITE_MAX_CHARS,
          placeholder: 'Paste or dictate your thoughts - rough is fine. It gets tidied, not rewritten.',
        },
      ],
    },
  ],
};

/**
 * custom_id → value for every text input in a modal submission. Discord nests
 * inputs in action rows (components[]) or, in newer layouts, labels
 * (component), so walk both.
 */
export function modalValues(components: unknown[]): Record<string, string> {
  const out: Record<string, string> = {};
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const c = node as Record<string, unknown>;
    if (typeof c.custom_id === 'string' && typeof c.value === 'string') out[c.custom_id] = c.value;
    if (Array.isArray(c.components)) c.components.forEach(visit);
    if (c.component) visit(c.component);
  };
  components.forEach(visit);
  return out;
}

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
  const isCommand = i.type === InteractionType.APPLICATION_COMMAND && i.data?.name === 'blog';
  const isWriteSubmit = i.type === InteractionType.MODAL_SUBMIT && i.data?.custom_id === WRITE_MODAL_ID;
  if (!isCommand && !isWriteSubmit) return reply('Unknown command.');

  const owner = deps.ownerId();
  const caller = i.member?.user.id ?? i.user?.id;
  if (!owner || caller !== owner) return reply('Only the site owner can use /blog.');
  if (!deps.githubConfigured()) return reply('The GitHub App is not configured on this deployment.');

  const discord = { discord_app_id: i.application_id, discord_token: i.token };

  if (isWriteSubmit) {
    const values = modalValues(i.data?.components ?? []);
    const note = (values.content ?? '').trim();
    const title = (values.title ?? '').trim();
    if (note.length < WRITE_MIN_CHARS) return reply(`That's a bit short to make a post from — give it at least ${WRITE_MIN_CHARS} characters.`);
    const words = note.split(/\s+/).length;
    return {
      kind: 'defer',
      run: async () => {
        await deps.dispatch({ mode: 'write', note: note.slice(0, WRITE_MAX_CHARS), title: title || undefined, ...discord });
        return `✍️ Shaping your post${title ? `: **${title}**` : ''} (${words} words).\nI'll edit this message with the PR and preview link — usually 3–6 minutes.`;
      },
    };
  }

  const sub = i.data?.options?.[0];
  const args = Object.fromEntries((sub?.options ?? []).map((o) => [o.name, o.value]));

  switch (sub?.name) {
    case 'write':
      return { kind: 'reply', response: { type: ResponseType.MODAL, data: writeModal } };
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
      return reply('Unknown subcommand. Try /blog write, new, revise, publish or list.');
  }
}
