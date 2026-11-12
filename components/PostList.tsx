import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/blog';

/**
 * The two ways a post is listed — a lead card and a compact row — shared by
 * the home page and /blog. Tags and reading time stand in for the date, which
 * says little when posts land together.
 */

export const focusRing =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink';

export function postMeta(post: Post, tagCount: number): string {
  return [...post.tags.slice(0, tagCount), `${post.readingMinutes} min read`].join(' · ');
}

/** The post a list opens with: full title size, whole excerpt. */
export function LeadPost({ post, label }: { post: Post; label: string }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group relative block overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-[var(--shadow-card)] transition-[box-shadow,translate,border-color] duration-300 ease-[var(--ease-out-long)] hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[var(--shadow-card-hover)] ${focusRing}`}
    >
      {post.image && (
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.image}
            alt=""
            fill
            className="object-cover grayscale transition-[filter,scale] duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
          />
          <div className="halftone-bottom pointer-events-none absolute inset-x-0 bottom-0 h-14" aria-hidden />
        </div>
      )}
      {!post.image && (
        <div
          className="halftone pointer-events-none absolute hidden sm:block -top-10 -right-10 h-44 w-56 opacity-40 transition-opacity duration-500 group-hover:opacity-90"
          aria-hidden
        />
      )}
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="section-label !text-ink">{label}</span>
          <span className="micro !text-gray-500">{postMeta(post, 2)}</span>
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

/** One numbered line in a list of posts. */
export function PostRow({ post, index }: { post: Post; index: number }) {
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
          <span className="micro mt-1.5 block !text-gray-500">{postMeta(post, 1)}</span>
        </span>
        <ArrowRight
          className="h-4 w-4 text-gray-400 transition-[translate,opacity,color] duration-300 ease-[var(--ease-out-long)] group-hover:translate-x-0.5 group-hover:text-ink [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:-translate-x-1 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-hover:translate-x-0 group-focus-visible:opacity-100"
          aria-hidden
        />
      </Link>
    </li>
  );
}

/** Rows numbered from `start`, ruled between and below. */
export function PostRows({ posts, start = 1, className = '' }: { posts: Post[]; start?: number; className?: string }) {
  if (posts.length === 0) return null;
  return (
    <ol className={`divide-y divide-gray-200 border-b border-gray-200 ${className}`}>
      {posts.map((post, i) => (
        <PostRow key={post.slug} post={post} index={start + i} />
      ))}
    </ol>
  );
}
