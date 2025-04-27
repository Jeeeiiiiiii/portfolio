import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <div className="py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Projects */}
        <div className="mb-8">
          <Link href="/projects" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Projects
          </Link>
        </div>
        
        {/* Project Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{project.title}</h1>
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((tech) => (
              <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-md">
                {tech}
              </span>
            ))}
          </div>
          <p className="text-xl text-gray-600">
            {project.description}
          </p>
        </div>
        
        {/* Main Project Image */}
        <div className="relative h-96 mb-12 rounded-xl overflow-hidden shadow-lg">
          <Image 
            src={project.image} 
            alt={project.title} 
            fill
            className="object-cover"
            priority
          />
        </div>
        
        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Project Overview</h2>
            <div className="prose max-w-none">
              {project.longDescription.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-4">Project Links</h2>
            <div className="space-y-4">
              <a 
                href={project.demoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                Live Demo
              </a>
              <a 
                href={project.githubUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a8 8 0 00-2.53 15.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0010 2z" clipRule="evenodd" />
                </svg>
                GitHub Repository
              </a>
            </div>
          </div>
        </div>
        
        {/* Additional Images */}
        {project.additionalImages && project.additionalImages.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Project Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.additionalImages.map((image, index) => (
                <div key={index} className="relative h-64 rounded-lg overflow-hidden shadow-md">
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
        
        {/* Next/Previous Project Navigation */}
        <div className="border-t border-gray-200 pt-8 mt-12">
          <div className="flex flex-col sm:flex-row justify-between">
            <div>
              {projects.findIndex(p => p.id === project.id) > 0 && (
                <Link 
                  href={`/projects/${projects[projects.findIndex(p => p.id === project.id) - 1].id}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Previous Project
                </Link>
              )}
            </div>
            <div>
              {projects.findIndex(p => p.id === project.id) < projects.length - 1 && (
                <Link 
                  href={`/projects/${projects[projects.findIndex(p => p.id === project.id) + 1].id}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  Next Project
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}