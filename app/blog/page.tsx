import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { formatPostDate, getAllPosts } from '@/lib/blog';

export const metadata = {
  title: "Blog | Steven Carreon",
  description: "Read my latest thoughts, tutorials, and insights on web development and devops engineering",
};

export default function BlogPage() {
  const [featured, ...rest] = getAllPosts();

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-40 h-32 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">blog</h1>
          <p className="micro">03 — notes on web development and devops</p>
        </header>

        {!featured && <p className="text-[13px] text-gray-500">No posts yet.</p>}

        {/* Featured post */}
        {featured && (
          <Link
            href={`/blog/${featured.slug}`}
            className="group block border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300 mb-10"
          >
            {featured.image && (
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500"
                />
                <div className="halftone-bottom absolute inset-x-0 bottom-0 h-14 pointer-events-none" aria-hidden />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="rounded-full bg-ink text-background px-2 py-px micro !text-[9px] !text-background">featured</span>
                <span className="micro">{formatPostDate(featured.date)}</span>
              </div>
              <h2 className="text-[1.3rem] font-semibold tracking-tight mb-2">{featured.title}</h2>
              <p className="text-[13px] text-gray-500 mb-3">{featured.excerpt}</p>
              <span className="micro group-hover:text-ink transition-colors duration-200">read article →</span>
            </div>
          </Link>
        )}

        {/* Remaining posts */}
        {rest.length > 0 && (
          <section>
            <h2 className="section-label mb-5">recent articles</h2>
            <div className="divide-y divide-gray-200 border-y border-gray-200">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex gap-5 py-6">
                  {post.image && (
                    <div className="relative w-28 h-20 shrink-0 rounded-[10px] overflow-hidden border border-gray-200">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500"
                      />
                    </div>
                  )}
                  <div>
                    <span className="micro">{formatPostDate(post.date)}</span>
                    <h3 className="text-[15px] font-semibold tracking-tight mt-1 mb-1">{post.title}</h3>
                    <p className="text-[13px] text-gray-500 line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
