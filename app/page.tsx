import Image from "next/image";
import Link from "next/link";
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiAmazonwebservices, SiDocker, SiKubernetes, SiTerraform, SiPrometheus, SiGrafana } from 'react-icons/si';
import { BsDownload } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { Mail, Github, Linkedin, Download } from 'lucide-react';
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
  { name: 'Next.js', icon: <SiNextdotjs className="w-6 h-6 text-gray-600 hover:text-black transition-colors" /> },
  { name: 'TypeScript', icon: <SiTypescript className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors" /> },
  { name: 'Tailwind CSS', icon: <SiTailwindcss className="w-6 h-6 text-gray-600 hover:text-sky-400 transition-colors" /> },
  { name: 'AWS', icon: <SiAmazonwebservices className="w-6 h-6 text-gray-600 hover:text-orange-500 transition-colors" /> },
  { name: 'Docker', icon: <SiDocker className="w-6 h-6 text-gray-600 hover:text-blue-500 transition-colors" /> },
  { name: 'Kubernetes', icon: <SiKubernetes className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors" /> },
  { name: 'Terraform', icon: <SiTerraform className="w-6 h-6 text-gray-600 hover:text-purple-600 transition-colors" /> },
  { name: 'Prometheus', icon: <SiPrometheus className="w-6 h-6 text-gray-600 hover:text-orange-600 transition-colors" /> },
  { name: 'Grafana', icon: <SiGrafana className="w-6 h-6 text-gray-600 hover:text-yellow-500 transition-colors" /> },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Davao City, Philippines
              </div>
              
              <h1 className="text-4xl font-bold mb-2">Steven Carreon</h1>
              <h2 className="text-xl text-gray-700 mb-4">Cloud || Devops Engineer</h2>
              <p className="text-gray-600 mb-6">Turning concepts into fully functional, engaging, and efficient applications.</p>
              
              <div className="flex gap-3 mb-6">
                <a href="mailto:your.email@example.com" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Mail className="w-5 h-5 text-gray-700" />
                </a>
                <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Github className="w-5 h-5 text-gray-700" />
                </a>
                <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Linkedin className="w-5 h-5 text-gray-700" />
                </a>
                <a href="/resume.pdf" target="_blank" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  DOWNLOAD MY CV
                </a>
              </div>
              
              <Link href="/contact" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                CONTACT ME
              </Link>
            </div>
            
            {/* Avatar */}
            <div className="w-80 h-80 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 relative rounded-full overflow-hidden">
                  <Image 
                    src="/profile.png" 
                    alt="Steven Carreon" 
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
          <div className="flex flex-wrap gap-4">
            {techIcons.map((tech, index) => (
              <div key={index} className="group relative">
                <div className="p-3 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer text-gray-600 hover:text-gray-900">
                  {tech.icon}
                </div>
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub Contributions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-5 h-5" />
            <h3 className="text-lg font-semibold">GitHub</h3>
          </div>
          <img src="http://ghchart.rshah.org/Jeeeiiiiiii" alt="Jeeeiiiiiii's Github chart" className="w-full h-32 object-contain"/>
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Experience</h3>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">QA Tester Intern</h4>
                  <p className="text-blue-600 text-sm">Hivelabs Technologies Corp.</p>
                </div>
                <span className="text-sm text-gray-500">February 2025 - April 2025</span>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Monitored system performance and analyzed server logs to identify and troubleshoot user-reported issues</li>
                <li>Supported the validation of authentication systems and session handling, ensuring secure access and proper timeout settings</li>
                <li>System Monitoring and Issue Tracking</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Certifications Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Certifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {certifications.map((cert) => (
              <a 
                key={cert.id} 
                href={cert.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="relative h-32 bg-white rounded mb-3 overflow-hidden">
                  <Image 
                    src={cert.image} 
                    alt={cert.name} 
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <h4 className="font-semibold text-sm mb-2">{cert.name}</h4>
                <p className="text-xs text-gray-600 mb-1">{cert.issuer}</p>
                <p className="text-xs text-gray-500">{cert.date}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
