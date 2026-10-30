import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import { formatPostDate, getAllPosts, getPost } from '@/lib/blog';

// every post is a file in content/blog, so the full set is known at build time
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} | Steven Carreon`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {/* Back Button */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 micro hover:text-ink transition-colors duration-200"
          >
            <ArrowLeft className="w-3 h-3" />
            back to blog
          </Link>
        </div>

        {/* Article */}
        <article>
          {/* Featured Image — dissolves into halftone dots at its base */}
          {post.image && (
            <div className="relative h-56 md:h-72 rounded-2xl overflow-hidden border border-gray-200 mb-8">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover grayscale"
              />
              <div className="halftone-bottom absolute inset-x-0 bottom-0 h-16 pointer-events-none" aria-hidden />
            </div>
          )}

          <div>
            {/* Post Header */}
            <header className="mb-8">
              <p className="micro mb-3">{formatPostDate(post.date)}</p>
              <h1 className="text-[1.6rem] font-semibold tracking-tight leading-snug">{post.title}</h1>
            </header>

            {/* Table of contents, built from the post's h2s */}
            {post.headings.length >= 3 && (
              <div className="article-body">
                <nav className="table-of-contents mb-8 p-4" aria-label="Table of contents">
                  <h2 className="!mt-0">Table of Contents</h2>
                  <ul className="space-y-2">
                    {post.headings.map((h) => (
                      <li key={h.id}>
                        <a href={`#${h.id}`}>{h.text}</a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            )}

            {/* Post Content — sanitised in lib/blog.ts */}
            <div
              className="article-body max-w-none"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />

            {post.source && (
              <p className="micro mt-10">
                responding to{' '}
                <a href={post.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">
                  {new URL(post.source).hostname}
                </a>
              </p>
            )}

            {/* Tags */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="micro mb-4">tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </article>
      </div>
      <Footer />
    </div>
  );
}
