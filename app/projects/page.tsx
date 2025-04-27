import Image from "next/image";
import Link from "next/link";
import Footer from '@/components/Footer';

// Sample project data - in a real app, you might fetch this from a CMS or API
const projects = [
  {
    id: "project-1",
    title: "E-Commerce Platform",
    description: "A full-featured e-commerce platform built with Next.js, featuring product listings, cart functionality, user authentication, and payment processing.",
    image: "/project1-placeholder.jpg",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe", "MongoDB"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-1",
    featured: true
  },
  {
    id: "project-2",
    title: "Task Management App",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image: "/project2-placeholder.jpg",
    technologies: ["React", "Firebase", "Material UI", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-2",
    featured: true
  },
  {
    id: "project-3",
    title: "Personal Finance Dashboard",
    description: "An interactive dashboard for tracking personal finances, with data visualization, budget planning, and expense categorization.",
    image: "/project3-placeholder.jpg",
    technologies: ["Vue.js", "D3.js", "Node.js", "Express", "PostgreSQL"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-3",
    featured: true
  },
  {
    id: "project-4",
    title: "Weather Forecast App",
    description: "A weather forecast application that provides real-time weather data and forecasts for locations worldwide.",
    image: "/project4-placeholder.jpg",
    technologies: ["React Native", "OpenWeather API", "Geolocation", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-4",
    featured: false
  },
  {
    id: "project-5",
    title: "Recipe Sharing Platform",
    description: "A community-driven recipe sharing platform where users can discover, share, and save recipes.",
    image: "/project5-placeholder.jpg",
    technologies: ["Angular", "Node.js", "MongoDB", "Express", "AWS S3"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-5",
    featured: false
  },
  {
    id: "project-6",
    title: "Fitness Tracking App",
    description: "A fitness tracking application that helps users monitor workouts, set goals, and track progress over time.",
    image: "/project6-placeholder.jpg",
    technologies: ["Flutter", "Firebase", "Google Fit API", "Health Kit"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-6",
    featured: false
  }
];

export const metadata = {
  title: "Projects | Steven Carreon",
  description: "Explore my portfolio of web development projects",
};

export default function ProjectsPage() {
  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">My Projects</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          While these applications may appear simple at first glance, a closer look reveals the implementation of advanced DevOps practices.
          </p>
        </div>

        {/* Project Filters - can be enhanced with actual filtering functionality */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md">All</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Web</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Mobile</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">UI/UX</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Backend</button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image 
                  src={project.image} 
                  alt={project.title} 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span key={tech} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <Link 
                    href={`/projects/${project.id}`} 
                    className="text-blue-600 font-medium hover:text-blue-800"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}