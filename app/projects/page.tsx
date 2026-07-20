"use client";
import Image from "next/image";
import { useState } from 'react';
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

const tabs = ['apps', 'websites', 'experiences'];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('apps');
  const [selectedProject, setSelectedProject] = useState(portfolioItems[0]);

  const filteredItems = portfolioItems.filter(item =>
    activeTab === 'all' || item.category === activeTab
  );

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="mb-10">
          <h1 className="page-title mb-3">projects</h1>
          <p className="micro">02 — selected work</p>
        </header>

        {/* Filter */}
        <div className="flex gap-2 border-b border-gray-200 pb-4 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full border px-3 py-0.5 micro !text-[9px] transition-colors duration-200 ${
                activeTab === tab
                  ? 'bg-ink !text-background border-ink'
                  : 'border-gray-300 hover:!text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedProject(item)}
              className={`text-left border rounded-xl p-4 bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300 ${
                selectedProject.id === item.id ? 'border-ink' : 'border-gray-200'
              }`}
            >
              <h2 className="text-[13px] font-semibold tracking-tight mb-1">{item.title}</h2>
              <p className="micro mb-3">{item.url}</p>
              <div className="h-28 rounded-[10px] mb-3 overflow-hidden border border-gray-200 bg-gray-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={300}
                  height={200}
                  className="w-full h-full object-cover grayscale hover:grayscale-0 hover:scale-[1.04] transition-all duration-500"
                />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {item.technologies.slice(0, 3).map((tech) => (
                  <span key={tech} className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]">
                    {tech}
                  </span>
                ))}
                {item.technologies.length > 3 && (
                  <span className="micro !text-[9px]">+{item.technologies.length - 3}</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Selected project detail */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-gray-50 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
            <h2 className="text-[1.3rem] font-semibold tracking-tight">{selectedProject.title}</h2>
            <div className="flex gap-4">
              <a
                href={selectedProject.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="micro hover:text-ink transition-colors duration-200"
              >
                live demo ↗
              </a>
              <a
                href={selectedProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="micro hover:text-ink transition-colors duration-200"
              >
                view code ↗
              </a>
            </div>
          </div>
          <p className="text-gray-500 leading-relaxed mb-5">{selectedProject.description}</p>
          <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-200 pt-4">
            <span className="micro mr-1">stack</span>
            {selectedProject.technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
