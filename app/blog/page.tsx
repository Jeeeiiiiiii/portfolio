import Footer from '@/components/Footer';
import { LeadPost, PostRows } from '@/components/PostList';
import { POST_KINDS, getAllPosts, pickHomePosts } from '@/lib/blog';

export const metadata = {
  title: "Blog | Aurjei Steven Carreon",
  description: "Write-ups on payments, trading-bot and MLOps platforms I built and broke on purpose, plus design plans and study notes on Kubernetes and AI infrastructure.",
};

export default function BlogPage() {
  const posts = getAllPosts();
  // the home page's first pick leads here too; with nothing featured, the newest
  const [lead] = pickHomePosts(posts, 1);
  const groups = POST_KINDS.map((g) => ({
    ...g,
    posts: posts.filter((p) => p.kind === g.kind && p.slug !== lead?.slug),
  })).filter((g) => g.posts.length > 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-40 h-32 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">blog</h1>
          <p className="micro">03 — platforms, payments and mlops</p>
        </header>

        {!lead && <p className="text-[13px] text-gray-500">No posts yet.</p>}

        {lead && (
          <div className="mb-12">
            <LeadPost post={lead} label="featured" />
          </div>
        )}

        {groups.map((g) => (
          <section key={g.kind} className="mb-12 last:mb-0">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-gray-200 pb-3">
              <h2 className="section-label !text-ink">{g.label}</h2>
              <span className="micro !text-gray-500">{g.note}</span>
            </div>
            <PostRows posts={g.posts} />
          </section>
        ))}
      </div>
      <Footer />
    </div>
  );
}
