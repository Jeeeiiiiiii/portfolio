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
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Back to Projects */}
        <div className="mb-8">
          <Link href="/projects" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio Browser
          </Link>
        </div>

        {/* Project Detail Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Project Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
                <p className="text-gray-600 mb-4">{project.description}</p>
                
                <div className="flex gap-4 mb-6">
                  <a 
                    href={project.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                  <a 
                    href={project.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </a>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Project Image */}
          <div className="p-8">
            <div className="relative h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
              <Image 
                src={project.image} 
                alt={project.title} 
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Project Overview</h2>
                <div className="prose max-w-none text-gray-700">
                  {project.longDescription.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg h-fit">
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technologies Used</h4>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech) => (
                        <span key={tech} className="px-2 py-1 bg-white text-gray-600 text-xs rounded border">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Links</h4>
                    <div className="space-y-2">
                      <a 
                        href={project.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Live Demo
                      </a>
                      <a 
                        href={project.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <Github className="w-3 h-3" />
                        Source Code
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Images */}
            {project.additionalImages && project.additionalImages.length > 0 && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-6">Project Gallery</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.additionalImages.map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden bg-gray-100">
                      <Image 
                        src={image} 
                        alt={`${project.title} screenshot ${index + 1}`} 
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="p-8 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                {projects.findIndex(p => p.id === project.id) > 0 && (
                  <Link 
                    href={`/projects/${projects[projects.findIndex(p => p.id === project.id) - 1].id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous Project
                  </Link>
                )}
              </div>
              <div>
                {projects.findIndex(p => p.id === project.id) < projects.length - 1 && (
                  <Link 
                    href={`/projects/${projects[projects.findIndex(p => p.id === project.id) + 1].id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Next Project
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}