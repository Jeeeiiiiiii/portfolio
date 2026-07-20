import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import Footer from '@/components/Footer';

// Sample project data - in a real app, you might fetch this from a CMS or API
const projects = [
  {
    id: "project-1",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce platform built with Next.js, featuring product listings, cart functionality, user authentication, and payment processing.",
    longDescription: `
      This e-commerce platform was built to provide a seamless shopping experience for users. The project includes:
      
      - User authentication and profile management
      - Product catalog with search and filtering
      - Shopping cart and checkout process
      - Payment processing with Stripe
      - Order history and tracking
      - Admin dashboard for product and order management
      
      The application was built with Next.js for server-side rendering and optimal performance. MongoDB was used for the database, with a custom API built with Node.js. The frontend was styled with Tailwind CSS for a responsive design.
    `,
    image: "/project1-placeholder.jpg",
    additionalImages: [
      "/project1-detail-1.jpg",
      "/project1-detail-2.jpg",
      "/project1-detail-3.jpg",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe", "MongoDB"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-1",
    featured: true
  },
  {
    id: "project-2",
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    longDescription: `
      This task management application was designed to help teams collaborate effectively. Key features include:
      
      - Real-time updates using Firebase
      - Drag-and-drop task organization
      - Team workspaces and user permissions
      - Task commenting and attachment support
      - Due date tracking and notifications
      - Integration with calendar applications
      
      The application was built with React for the frontend, with Redux for state management. Firebase was used for the backend, providing real-time database capabilities and authentication.
    `,
    image: "/project2-placeholder.jpg",
    additionalImages: [
      "/project2-detail-1.jpg",
      "/project2-detail-2.jpg",
      "/project2-detail-3.jpg",
    ],
    technologies: ["React", "Firebase", "Material UI", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-2",
    featured: true
  },
  // Add more projects with similar structure
];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the params promise
  const project = projects.find(p => p.id === resolvedParams.id);
  
  if (!project) {
    return {
      title: "Project Not Found",
    };
  }
  
  return {
    title: `${project.title} | Your Name`,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the params promise
  const project = projects.find(p => p.id === resolvedParams.id);
  
  if (!project) {
    notFound();
  }
  
  const projectIndex = projects.findIndex(p => p.id === project.id);

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14">
        {/* Back to Projects */}
        <div className="mb-8">
          <Link href="/projects" className="inline-flex items-center gap-2 micro hover:text-ink transition-colors duration-200">
            <ArrowLeft className="w-3 h-3" />
            back to projects
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-[1.6rem] font-semibold tracking-tight mb-3">{project.title}</h1>
          <p className="text-gray-500 mb-5">{project.description}</p>
          <div className="flex flex-wrap items-center gap-5 mb-5">
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              live demo
            </a>
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 micro hover:text-ink transition-colors duration-200"
            >
              <Github className="w-3.5 h-3.5" />
              view code ↗
            </a>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]">
                {tech}
              </span>
            ))}
          </div>
        </header>

        {/* Main image dissolving into halftone dots */}
        <div className="relative h-72 mb-10 rounded-2xl overflow-hidden border border-gray-200">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover grayscale"
            priority
          />
          <div className="halftone-bottom absolute inset-x-0 bottom-0 h-16 pointer-events-none" aria-hidden />
        </div>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="section-label mb-5">01 — overview</h2>
          <div className="max-w-none text-gray-500 text-[15px]">
            {project.longDescription.split('\n').map((paragraph, index) => (
              paragraph.trim() && (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph.trim()}
                </p>
              )
            ))}
          </div>
        </section>

        {/* Gallery */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <section className="mb-10">
            <h2 className="section-label mb-5">02 — gallery</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {project.additionalImages.map((image, index) => (
                <div key={index} className="relative h-36 rounded-[10px] overflow-hidden border border-gray-200 bg-gray-50">
                  <Image
                    src={image}
                    alt={`${project.title} screenshot ${index + 1}`}
                    fill
                    className="object-cover grayscale hover:grayscale-0 hover:scale-[1.04] transition-all duration-500"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Prev / next */}
        <nav className="flex justify-between items-center border-t border-gray-200 pt-6">
          <div>
            {projectIndex > 0 && (
              <Link
                href={`/projects/${projects[projectIndex - 1].id}`}
                className="micro hover:text-ink transition-colors duration-200"
              >
                ← previous project
              </Link>
            )}
          </div>
          <div>
            {projectIndex < projects.length - 1 && (
              <Link
                href={`/projects/${projects[projectIndex + 1].id}`}
                className="micro hover:text-ink transition-colors duration-200"
              >
                next project →
              </Link>
            )}
          </div>
        </nav>
      </div>
      <Footer />
    </div>
  );
}