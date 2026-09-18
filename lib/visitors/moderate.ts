import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import type { VisitorSubmission } from '@/lib/visitors-schema';

export type ModerationResult = { ok: true } | { ok: false; reason: string };

const matcher = new RegExpMatcher({ ...englishDataset.build(), ...englishRecommendedTransformers });

const HTML_TAG = /<[^>]*>/;
const URL_LIKE = /(https?:\/\/|www\.|\]\()/i;

/**
 * Cheap, deterministic checks on top of the zod schema. The link field is
 * already allowlisted by the schema; this makes sure nothing link-shaped or
 * markup-shaped sneaks into the free-text fields, and rejects profanity
 * outright rather than censoring it silently.
 */
export function moderate(input: Pick<VisitorSubmission, 'name' | 'role' | 'message'>): ModerationResult {
  for (const [field, value] of Object.entries(input)) {
    if (HTML_TAG.test(value)) return { ok: false, reason: `${field} must not contain HTML` };
    if (URL_LIKE.test(value)) return { ok: false, reason: `${field} must not contain links — use the link field` };
    if (matcher.hasMatch(value)) return { ok: false, reason: `${field} contains language we don't publish` };
  }
  return { ok: true };
}
