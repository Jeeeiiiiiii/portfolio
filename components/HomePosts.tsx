import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/blog';

/**
 * Home page "01 — blog": the first featured post leads at full size with its
 * whole excerpt, the rest follow as numbered rows. Tags and reading time
 * replace the date, which is the same on every post and says nothing.
 */

const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink';

function meta(post: Post, tagCount: number): string {
  return [...post.tags.slice(0, tagCount), `${post.readingMinutes} min read`].join(' · ');
}

function LeadPost({ post }: { post: Post }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 p-6 sm:p-8 shadow-[var(--shadow-card)] transition-[box-shadow,translate,border-color] duration-300 ease-[var(--ease-out-long)] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[var(--shadow-card-hover)] ${focusRing}`}
    >
      <div
        className="halftone pointer-events-none absolute hidden sm:block -top-10 -right-10 h-44 w-56 opacity-40 transition-opacity duration-500 group-hover:opacity-90"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-baseline gap-3">
          <span className="section-label !text-ink">01</span>
          <span className="micro !text-gray-500">{meta(post, 2)}</span>
        </div>
        <h3 className="mt-5 mb-3 max-w-[30ch] text-balance text-[1.4rem] sm:text-[1.7rem] font-semibold leading-[1.18] tracking-[-0.025em]">
          {post.title}
        </h3>
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-gray-600">{post.excerpt}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-[13px] font-medium">
          read the write-up
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-out-long)] group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

function PostRow({ post, index }: { post: Post; index: number }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className={`group -mx-3 grid grid-cols-[2rem_1fr_auto] items-center gap-x-3 rounded-lg px-3 py-4 transition-colors duration-200 hover:bg-gray-50 ${focusRing}`}
      >
        <span className="section-label tabular-nums transition-colors duration-200 group-hover:!text-ink">
          {String(index).padStart(2, '0')}
        </span>
        <span className="min-w-0">
          <span className="block text-balance text-[15px] font-medium leading-snug tracking-tight">
            {post.title}
          </span>
          <span className="micro mt-1.5 block !text-gray-500">{meta(post, 1)}</span>
        </span>
        <ArrowRight
          className="h-4 w-4 text-gray-400 transition-[translate,opacity,color] duration-300 ease-[var(--ease-out-long)] group-hover:translate-x-0.5 group-hover:text-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0 group-focus-visible:opacity-100"
          aria-hidden
        />
      </Link>
    </li>
  );
}

export default function HomePosts({ posts, total }: { posts: Post[]; total: number }) {
  const [lead, ...rest] = posts;

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="section-label">01 — blog</h2>
        {total > posts.length && (
          <Link
            href="/blog"
            className={`group micro inline-flex items-center gap-1.5 hover:!text-ink transition-colors duration-200 ${focusRing}`}
          >
            all {total} posts
            <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )}
      </div>

      {lead ? (
        <>
          <LeadPost post={lead} />
          {rest.length > 0 && (
            <ol className="mt-4 divide-y divide-gray-200 border-b border-gray-200">
              {rest.map((post, i) => (
                <PostRow key={post.slug} post={post} index={i + 2} />
              ))}
            </ol>
          )}
        </>
      ) : (
        <p className="border-y border-gray-200 py-5 text-[13px] text-gray-500">
          New posts on the MLOps and DevOps labs are on the way.
        </p>
      )}
    </section>
  );
}
