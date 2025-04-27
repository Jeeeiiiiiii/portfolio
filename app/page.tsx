import Image from "next/image";
import Link from "next/link";
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiAmazonwebservices, SiDocker, SiKubernetes, SiTerraform, SiPrometheus, SiGrafana } from 'react-icons/si';
import { BsDownload } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import Footer from '@/components/Footer';

export const metadata = {
  title: "Devops Engineer | Steven Carreon",
  description: "Learn more about my background, skills, and experience in Devops Engineering",
};

// Sample certification data
const certifications = [
  {
    id: 1,
    name: "AWS Certified Solutions Architect - Associate",
    issuer: "Amazon Web Services",
    date: "April 2025",
    image: "/aws saa.png",
    url: "https://cp.certmetrics.com/amazon/en/public/verify/credential/5529d170e39f4d7b897966b3302c8282"
  },
  {
    id: 2,
    name: "IT Specialist- Databases",
    issuer: "Certiport",
    date: "May 2023",
    image: "/it_database.png",
    url: "https://drive.google.com/file/d/1AzO5ppbRE7RDfUYOIx9eMzkvGZzILjJB/view?usp=drive_link"
  },
];

const techIcons = [
  { name: 'Next.js', icon: <SiNextdotjs className="text-gray-600 hover:text-black transition-colors" /> },
  { name: 'TypeScript', icon: <SiTypescript className="text-gray-600 hover:text-blue-600 transition-colors" /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss className="text-gray-600 hover:text-sky-400 transition-colors" /> },
  { name: 'AWS', icon: <SiAmazonwebservices className="text-gray-600 hover:text-orange-500 transition-colors" /> },
  { name: 'Docker', icon: <SiDocker className="text-gray-600 hover:text-blue-500 transition-colors" /> },
  { name: 'Kubernetes', icon: <SiKubernetes className="text-gray-600 hover:text-blue-600 transition-colors" /> },
  { name: 'Terraform', icon: <SiTerraform className="text-gray-600 hover:text-purple-600 transition-colors" /> },
  { name: 'Prometheus', icon: <SiPrometheus className="text-gray-600 hover:text-orange-600 transition-colors" /> },
  { name: 'Grafana', icon: <SiGrafana className="text-gray-600 hover:text-yellow-500 transition-colors" /> },
];

export default function AboutPage() {
  return (
    <div className="space-y-10">
      {/* Hero Section - Simplified for browser layout */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">Steven Carreon</h1>
          <h2 className="text-xl text-gray-600 mb-4">Cloud || Devops Engineer</h2>
          <p className="text-gray-600 mb-4">
            Turning concepts into fully functional, engaging, and efficient applications.
          </p>
          <div className="flex gap-4 mb-4">
            {/* Social icons */}
            <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="mailto:your.email@example.com" className="text-gray-600 hover:text-blue-600">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>
          <div className="flex gap-4">
            <a 
              href="/resume.pdf" 
              target="_blank" 
              className="px-4 py-2 bg-white-600 text-black rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
            <BsDownload className="text-black flex items-center" /> {/* Icon outside the link */} Download Resume
            </a>
            <Link 
              href="/contact" 
              className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
              Contact Me
            </Link>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden mx-auto">
            <Image 
              src="/profile.png" 
              alt="Your Name" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Tech Stack Section */}
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">Tech Stack</h2>
      <div className="flex flex-wrap gap-4 my-4">
        {techIcons.map((tech) => (
          <div
            key={tech.name}
            className="flex items-center gap-2 px-1 py-1 bg-white rounded-3xl text-sm group relative hover:bg-gray-100"
          >
            {/* Icon */}
            <span className="text-2xl">{tech.icon}</span>

            {/* Hidden label that appears on hover */}
            <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded-md py-1 px-2 top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
              {tech.name}
            </span>
          </div>
        ))}
      </div>
      
      {/* GitHub Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">GitHub</h2>
        <div className="bg-gray-50 p-4 rounded-md">
          {/* This would be your GitHub contribution graph */}
          <div className="h-48 bg-white rounded-md border border-gray-200 p-4">
            <p className="flex items-center gap-2 text-gray-700 font-bold mb-2">
              <FaGithub className="text-xl" />
              GitHub
            </p>
            {/* You can integrate a real GitHub contribution graph here */}
            <img src="http://ghchart.rshah.org/Jeeeiiiiiii" alt="Jeeeiiiiiii's Github chart" className="w-full h-32 object-contain"/>
          </div>
        </div>
      </div>

      {/* Experience Section - Redesigned as cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Experiences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keep your existing experience items but with updated styling */}
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold">QA Tester Intern</h3>
                <p className="text-blue-600 text-sm">Hivelabs Technologies Corp.</p>
              </div>
              <span className="text-sm text-gray-500">Frebruary 2025 - April 2025</span>
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Monitored system performance and analyzed server logs to identify and troubleshoot user-reported issues</li>
              <li>Supported the validation of authentication systems and session handling, ensuring secure access and proper timeout settings</li>
              <li>System Monitoring and Issue Tracking</li>
            </ul>
          </div>
          
          {/* Add more experience cards following the same pattern */}
          {/* ... other experience cards ... */}
        </div>
      </div>
      
      {/* Certifications Section */}
      <div id="certifications">
        <h2 className="text-2xl font-bold mb-4 border-b pb-2">Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {certifications.map((cert) => (
            <a 
              key={cert.id} 
              href={cert.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white rounded-md border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-36 bg-gray-50">
                <Image 
                  src={cert.image} 
                  alt={cert.name} 
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1">{cert.name}</h3>
                <p className="text-gray-600 text-xs mb-1">Issued by: {cert.issuer}</p>
                <p className="text-gray-500 text-xs">Date: {cert.date}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
