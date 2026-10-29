/**
 * Environment for the Discord blog bot. Read here and nowhere else.
 * The GitHub side reuses the visitor playground's App (lib/visitors/config.ts).
 */

/** Draft PRs live on blog/<slug> branches and may only touch content/blog/*.md (blog-pr-guard.yml). */
export const BLOG_BRANCH_PREFIX = 'blog/';
export const BLOG_PR_LABEL = 'blog-draft';
/** The repository_dispatch event blog-draft.yml listens for. */
export const BLOG_DISPATCH_EVENT = 'blog-draft';

export function discordConfig() {
  const publicKey = process.env.DISCORD_PUBLIC_KEY;
  // only this Discord user may run /blog; unset means nobody can
  const ownerId = process.env.DISCORD_OWNER_ID;
  if (!publicKey || !ownerId) return null;
  return { publicKey, ownerId };
}
