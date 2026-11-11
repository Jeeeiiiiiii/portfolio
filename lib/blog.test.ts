import { describe, expect, it } from 'vitest';
import { projects } from '@/content/projects';
import { formatPostDate, getAllPosts, parsePost, pickHomePosts, renderMarkdown } from './blog';

const valid = `---
title: How they cut NAT gateway costs
date: 2026-10-29
excerpt: A write-up on routing S3 traffic through gateway endpoints.
tags: [AWS, FinOps]
source: https://example.com/nat-costs
---

Intro paragraph.

## Why it costs so much

Body.
`;

describe('parsePost', () => {
  it('reads frontmatter and renders the body', () => {
    const post = parsePost('nat-costs', valid);
    expect(post).toMatchObject({ slug: 'nat-costs', title: 'How they cut NAT gateway costs', tags: ['AWS', 'FinOps'], draft: false });
    expect(post.image).toBeUndefined();
    expect(post.date.toISOString().slice(0, 10)).toBe('2026-10-29');
    expect(post.html).toContain('<h2 id="why-it-costs-so-much">Why it costs so much</h2>');
  });

  it('names the file and the field when frontmatter is wrong', () => {
    const bad = valid.replace('tags: [AWS, FinOps]\n', '');
    expect(() => parsePost('nat-costs', bad)).toThrow(/nat-costs\.md.*tags/);
  });

  it('rejects slugs that are not lowercase-hyphenated', () => {
    expect(() => parsePost('Nat_Costs', valid)).toThrow(/not a valid slug/);
  });
});

describe('renderMarkdown', () => {
  it('strips scripts, event handlers and javascript: links', () => {
    const { html } = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src="https://x.test/a.png" onerror="alert(1)">\n\n[click](javascript:alert(1))',
    );
    expect(html).not.toMatch(/<script|onerror|javascript:/i);
  });

  it('opens external links in a new tab', () => {
    const { html } = renderMarkdown('[docs](https://example.com)');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('ignores target/rel written into the post itself', () => {
    const { html } = renderMarkdown('<a href="#setup" target="_blank" rel="opener">jump</a>');
    expect(html).toBe('<p><a href="#setup">jump</a></p>\n');
  });

  it('collects h2s for the table of contents and de-duplicates ids', () => {
    const { headings, html } = renderMarkdown('## Setup\n\n### Detail\n\n## Setup');
    expect(headings).toEqual([
      { id: 'setup', text: 'Setup' },
      { id: 'setup-1', text: 'Setup' },
    ]);
    expect(html).toContain('<h3 id="detail">');
  });

  it('demotes a body h1 to h2, since the title is the page h1', () => {
    expect(renderMarkdown('# Big').html).toContain('<h2 id="big">Big</h2>');
  });

  it('keeps fenced code language classes', () => {
    expect(renderMarkdown('```hcl\nresource "x" "y" {}\n```').html).toContain('class="language-hcl"');
  });
});

describe('content/blog', () => {
  it('every project write-up link points at a real post', () => {
    const slugs = new Set(getAllPosts().map((p) => p.slug));
    const missing = projects.filter((p) => p.links.post && !slugs.has(p.links.post)).map((p) => p.slug);
    expect(missing).toEqual([]);
  });

  it('at most HOME_POSTS posts are featured, each at its own position', () => {
    const featured = getAllPosts().flatMap((p) => (p.featured ? [p.featured] : []));
    expect(new Set(featured).size).toBe(featured.length);
    expect(featured.length).toBeLessThanOrEqual(5);
  });

  it('every post file parses, newest first', () => {
    const posts = getAllPosts();
    const times = posts.map((p) => p.date.getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});

describe('pickHomePosts', () => {
  const post = (slug: string, date: string, featured?: number) =>
    parsePost(slug, valid.replace('date: 2026-10-29', `date: ${date}`).replace('---\n\nIntro', featured ? `featured: ${featured}\n---\n\nIntro` : '---\n\nIntro'));
  // getAllPosts order: newest first
  const all = [
    post('e', '2026-11-05'), post('d', '2026-11-04', 3), post('c', '2026-11-03', 1),
    post('b', '2026-11-02'), post('a', '2026-11-01', 2),
  ];

  it('shows only featured posts, in their chosen order', () => {
    expect(pickHomePosts(all).map((p) => p.slug)).toEqual(['c', 'a', 'd']);
  });

  it('caps the list', () => {
    expect(pickHomePosts(all, 2).map((p) => p.slug)).toEqual(['c', 'a']);
  });

  it('falls back to the newest posts when nothing is featured', () => {
    const plain = all.map((p) => ({ ...p, featured: undefined }));
    expect(pickHomePosts(plain, 2).map((p) => p.slug)).toEqual(['e', 'd']);
  });

  it('rejects a non-numeric featured value', () => {
    expect(() => parsePost('x', valid.replace('---\n\nIntro', 'featured: yes\n---\n\nIntro'))).toThrow(/featured/);
  });
});

describe('formatPostDate', () => {
  it('keeps the blog\'s "Month, YYYY" style', () => {
    expect(formatPostDate(new Date('2024-12-01'))).toBe('December, 2024');
  });
});
