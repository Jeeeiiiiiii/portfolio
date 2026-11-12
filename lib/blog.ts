import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked, type Tokens } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

/**
 * Every blog surface (/blog and /blog/[slug]) reads from this module. A post
 * is one markdown file in content/blog/ — the filename is the slug, the
 * frontmatter is validated here, and the body is rendered to sanitised HTML.
 * Adding a post means adding a file; nothing else needs to change.
 */

export const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const postFrontmatterSchema = z.object({
  title: z.string().trim().min(3).max(120),
  // YAML turns an unquoted 2024-12-01 into a Date; a quoted one stays a string
  date: z.coerce.date(),
  excerpt: z.string().trim().min(10).max(300),
  tags: z.array(z.string().trim().min(1)).min(1).max(8),
  /** path under /public; posts without one render without a hero image */
  image: z.string().startsWith('/').optional(),
  /** the article a post responds to, credited at the end of the post */
  source: z.string().url().optional(),
  /** drafts build in dev only */
  draft: z.boolean().optional().default(false),
  /**
   * Show this post on the home page. The number is its position (1 = top);
   * only the first HOME_POSTS featured posts appear there.
   */
  featured: z.number().int().min(1).max(99).optional(),
});

/** How many posts the home page lists before "show all". */
export const HOME_POSTS = 5;

export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;

export interface Heading {
  id: string;
  text: string;
}

export interface Post extends PostFrontmatter {
  slug: string;
  /** sanitised HTML, safe for dangerouslySetInnerHTML */
  html: string;
  /** the post's h2s, for the table of contents */
  headings: Heading[];
  /** estimated minutes to read the body, at least 1 */
  readingMinutes: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'h2', 'h3', 'h4', 'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
    'strong', 'em', 'del', 'hr', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  ],
  allowedAttributes: {
    // target/rel are only ever set by transformTags below, never taken from the post
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
    h2: ['id'],
    h3: ['id'],
    h4: ['id'],
    code: ['class'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: { img: ['https'] },
  allowProtocolRelative: false,
  allowedClasses: { code: [/^language-[a-z0-9-]+$/] },
  // external links open in a new tab; #anchors stay in the page
  transformTags: {
    a: (tagName, attribs) => {
      const { href, title } = attribs;
      const kept = { ...(href !== undefined && { href }), ...(title !== undefined && { title }) };
      return {
        tagName,
        attribs: /^https?:/.test(href ?? '') ? { ...kept, target: '_blank', rel: 'noopener noreferrer' } : kept,
      };
    },
  },
};

export function renderMarkdown(markdown: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();

  const marked = new Marked({
    gfm: true,
    renderer: {
      heading(this: { parser: { parseInline(tokens: Tokens.Generic[]): string } }, token: Tokens.Heading) {
        // a post's title is the page h1, so body headings start at h2
        const depth = Math.min(Math.max(token.depth, 2), 4);
        const base = slugify(token.text) || 'section';
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n === 0 ? base : `${base}-${n}`;
        if (depth === 2) headings.push({ id, text: token.text });
        return `<h${depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${depth}>\n`;
      },
    },
  });

  const raw = marked.parse(markdown, { async: false });
  return { html: sanitizeHtml(raw, sanitizeOptions), headings };
}

/** Parse one post from its file contents. Throws with the slug in the message on bad frontmatter. */
export function parsePost(slug: string, source: string): Post {
  if (!SLUG_RE.test(slug)) throw new Error(`blog: "${slug}" is not a valid slug (lowercase, digits, hyphens)`);
  const { data, content } = matter(source);
  const parsed = postFrontmatterSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    throw new Error(`blog: ${slug}.md has invalid frontmatter — ${issues}`);
  }
  return { slug, ...parsed.data, ...renderMarkdown(content), readingMinutes: readingMinutes(content) };
}

const WORDS_PER_MINUTE = 230;

/** Reading time for a markdown body; code blocks and markup count as words, which is close enough. */
export function readingMinutes(markdown: string): number {
  const words = markdown.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function includeDrafts(): boolean {
  return process.env.NODE_ENV !== 'production';
}

/** Every published post, newest first. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => parsePost(f.slice(0, -3), fs.readFileSync(path.join(BLOG_DIR, f), 'utf8')))
    .filter((p) => includeDrafts() || !p.draft)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

/**
 * The posts the home page shows: those marked `featured`, in their chosen
 * order, capped at `limit`. With nothing featured yet, the newest posts.
 */
export function pickHomePosts(posts: Post[], limit: number = HOME_POSTS): Post[] {
  const featured = posts
    .filter((p) => p.featured !== undefined)
    .sort((a, b) => a.featured! - b.featured! || b.date.getTime() - a.date.getTime());
  return (featured.length > 0 ? featured : posts).slice(0, limit);
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** "December, 2024" — the style the blog has always used. */
export function formatPostDate(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${month}, ${date.getUTCFullYear()}`;
}
