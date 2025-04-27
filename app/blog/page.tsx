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
    <div className="space-y-8">
      {/* Blog Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Blog</h1>
      </div>
      
      {/* Featured Post */}
      <div className="bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <Image 
              src={blogPosts[0].image}
              alt={blogPosts[0].title}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6">
            <div className="text-sm text-gray-500 mb-2">{blogPosts[0].date}</div>
            <h2 className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
            <p className="text-gray-600 mb-4">{blogPosts[0].excerpt}</p>
            <Link 
              href={`/blog/${blogPosts[0].slug}`}
              className="text-blue-600 hover:underline"
            >
              Read Full Article →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Blog Posts Grid */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Recent Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          {blogPosts.slice(1).map((post) => (
            <div 
              key={post.id}
              className="bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-48">
                <Image 
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <div className="text-sm text-gray-500 mb-2">{post.date}</div>
                <h3 className="font-bold mb-2">{post.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {post.excerpt}
                </p>
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Read More →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}