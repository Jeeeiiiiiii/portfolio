import { describe, expect, it } from 'vitest';
import { formatPostDate, getAllPosts, parsePost, renderMarkdown } from './blog';

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
  it('every post file parses, newest first', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    const times = posts.map((p) => p.date.getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });
});

describe('formatPostDate', () => {
  it('keeps the blog\'s "Month, YYYY" style', () => {
    expect(formatPostDate(new Date('2024-12-01'))).toBe('December, 2024');
  });
});
