"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from 'react';
import { X, Minus, Square, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import Footer from '@/components/Footer';

// Portfolio items adapted from existing projects
const portfolioItems = [
  {
    id: 1,
    title: "E-Commerce Platform",
    url: "example.com/ecommerce",
    description: "A full-featured e-commerce platform built with Next.js, featuring product listings, cart functionality, user authentication, and payment processing.",
    image: "/project1-placeholder.jpg",
    technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Stripe", "MongoDB"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-1",
    category: "websites"
  },
  {
    id: 2,
    title: "Task Management App",
    url: "example.com/taskmanager",
    description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
    image: "/project2-placeholder.jpg",
    technologies: ["React", "Firebase", "Material UI", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-2",
    category: "apps"
  },
  {
    id: 3,
    title: "Personal Finance Dashboard",
    url: "example.com/finance",
    description: "An interactive dashboard for tracking personal finances, with data visualization, budget planning, and expense categorization.",
    image: "/project3-placeholder.jpg",
    technologies: ["Vue.js", "D3.js", "Node.js", "Express", "PostgreSQL"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-3",
    category: "apps"
  },
  {
    id: 4,
    title: "Weather Forecast App",
    url: "example.com/weather",
    description: "A weather forecast application that provides real-time weather data and forecasts for locations worldwide.",
    image: "/project4-placeholder.jpg",
    technologies: ["React Native", "OpenWeather API", "Geolocation", "Redux"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-4",
    category: "apps"
  },
  {
    id: 5,
    title: "Recipe Sharing Platform",
    url: "example.com/recipes",
    description: "A community-driven recipe sharing platform where users can discover, share, and save recipes.",
    image: "/project5-placeholder.jpg",
    technologies: ["Angular", "Node.js", "MongoDB", "Express", "AWS S3"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-5",
    category: "websites"
  },
  {
    id: 6,
    title: "Fitness Tracking App",
    url: "example.com/fitness",
    description: "A fitness tracking application that helps users monitor workouts, set goals, and track progress over time.",
    image: "/project6-placeholder.jpg",
    technologies: ["Flutter", "Firebase", "Google Fit API", "Health Kit"],
    demoUrl: "https://example.com",
    githubUrl: "https://github.com/yourusername/project-6",
    category: "apps"
  }
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('apps');
  const [selectedProject, setSelectedProject] = useState(portfolioItems[0]);

  const filteredItems = portfolioItems.filter(item => 
    activeTab === 'all' || item.category === activeTab
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Portfolio Browser */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200">
          {/* Browser Header */}
          <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold">Portfolio Browser</h3>
              </div>
              <div className="flex items-center gap-2">
                <button className="hover:bg-gray-200 p-1 rounded">
                  <Minus className="w-4 h-4" />
                </button>
                <button className="hover:bg-gray-200 p-1 rounded">
                  <Square className="w-4 h-4" />
                </button>
                <button className="hover:bg-gray-200 p-1 rounded text-red-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Browser Content */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedProject.title}</h2>
                <a href={selectedProject.demoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                  {selectedProject.url}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-gray-200 mb-6">
              {['APPS', 'WEBSITES', 'EXPERIENCES'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
                    activeTab === tab.toLowerCase()
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                  {activeTab === tab.toLowerCase() && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Portfolio Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => setSelectedProject(item)}
                  className={`bg-gray-50 border-2 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                    selectedProject.id === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <h4 className="font-semibold text-sm mb-2">{item.title}</h4>
                  <p className="text-xs text-gray-600 mb-3">{item.url}</p>
                  <div className="h-32 bg-gray-200 rounded mb-3 overflow-hidden">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {item.technologies.slice(0, 3).map((tech, index) => (
                      <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {tech}
                      </span>
                    ))}
                    {item.technologies.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.technologies.length - 3}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedProject.title}</h3>
                  <div className="flex gap-2 mb-4">
                    <a 
                      href={selectedProject.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                    >
                      Live Demo <ExternalLink className="w-3 h-3" />
                    </a>
                    <a 
                      href={selectedProject.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                    >
                      View Code <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                {selectedProject.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-600 mr-2">Technologies:</span>
                {selectedProject.technologies.map((tech, index) => (
                  <span key={index} className="text-xs bg-white px-2 py-1 rounded border">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}