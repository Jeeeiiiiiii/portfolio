import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Post } from '@/lib/blog';
import { LeadPost, PostRows, focusRing } from '@/components/PostList';

/**
 * Home page "01 — blog": the first featured post leads at full size with its
 * whole excerpt, the rest follow as numbered rows.
 */
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
          <LeadPost post={lead} label="01" />
          <PostRows posts={rest} start={2} className="mt-4" />
        </>
      ) : (
        <p className="border-y border-gray-200 py-5 text-[13px] text-gray-500">
          New posts on the MLOps and DevOps labs are on the way.
        </p>
      )}
    </section>
  );
}
