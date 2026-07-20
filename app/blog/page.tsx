import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';

export const metadata = {
  title: "Blog | Steven Carreon",
  description: "Read my latest thoughts, tutorials, and insights on web development and devops engineering",
};

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: "Deploying 2-tier Architecture on AWS through Terraform",
    excerpt: "Learn how to quickly deploy scalable, secure 2-tier architectures on AWS using Terraform's powerful infrastructure-as-code features....",
    date: "December, 2024",
    image: "/terraform_aws.jpg",
    slug: "deploy-2-tier-architecture-on-aws-through-terraform"
  },
  {
    id: 2,
    title: "Serverless Web Application with AWS Lambda and API Gateway",
    excerpt: "Learn how to build and deploy scalable, serverless web applications using AWS Lambda and API Gateway—no servers to manage, just clean, efficient code...",
    date: "March, 2025",
    image: "/serverless.png",
    slug: "serverless-web-app-with-aws-lambda-and-api-gateway"
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-40 h-32 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">blog</h1>
          <p className="micro">03 — notes on web development and devops</p>
        </header>

        {/* Featured post */}
        <Link
          href={`/blog/${blogPosts[0].slug}`}
          className="group block border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300 mb-10"
        >
          <div className="relative h-52 overflow-hidden">
            <Image
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              fill
              className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500"
            />
            <div className="halftone-bottom absolute inset-x-0 bottom-0 h-14 pointer-events-none" aria-hidden />
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="rounded-full bg-ink text-background px-2 py-px micro !text-[9px] !text-background">featured</span>
              <span className="micro">{blogPosts[0].date}</span>
            </div>
            <h2 className="text-[1.3rem] font-semibold tracking-tight mb-2">{blogPosts[0].title}</h2>
            <p className="text-[13px] text-gray-500 mb-3">{blogPosts[0].excerpt}</p>
            <span className="micro group-hover:text-ink transition-colors duration-200">read article →</span>
          </div>
        </Link>

        {/* Remaining posts */}
        <section>
          <h2 className="section-label mb-5">recent articles</h2>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {blogPosts.slice(1).map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-5 py-6">
                <div className="relative w-28 h-20 shrink-0 rounded-[10px] overflow-hidden border border-gray-200">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-[1.04] transition-all duration-500"
                  />
                </div>
                <div>
                  <span className="micro">{post.date}</span>
                  <h3 className="text-[15px] font-semibold tracking-tight mt-1 mb-1">{post.title}</h3>
                  <p className="text-[13px] text-gray-500 line-clamp-2">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
