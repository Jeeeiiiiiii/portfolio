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
});

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
  return { slug, ...parsed.data, ...renderMarkdown(content) };
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

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

/** "December, 2024" — the style the blog has always used. */
export function formatPostDate(date: Date): string {
  const month = date.toLocaleDateString('en-US', { month: 'long', timeZone: 'UTC' });
  return `${month}, ${date.getUTCFullYear()}`;
}
