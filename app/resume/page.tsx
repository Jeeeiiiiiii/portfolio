import { BsDownload } from "react-icons/bs";
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: "Resume | Steven Carreon",
  description: "Professional resume and experience of Steven Carreon",
};

export default function ResumePage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">AURJEI STEVEN CARREON</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <span>Cavite, PH</span>
          <span>|</span>
          <span>+43 9764937713</span>
          <span>|</span>
          <a href="mailto:aurjei.steven.carreon@gmail.com" className="hover:text-blue-600">
            aurjei.steven.carreon@gmail.com
          </a>
        </div>
      </div>

      {/* Download Resume Button */}
      <div className="flex justify-end mb-8">
        <a 
          href="/resume.pdf" 
          target="_blank" 
          className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2 border border-gray-300"
        >
          <BsDownload /> Download PDF
        </a>
      </div>

      {/* Education Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">EDUCATION</h2>
        <div className="mb-4">
          <div className="flex justify-between items-start">
            <h3 className="font-bold">ADAMSON UNIVERSITY</h3>
            <span className="text-gray-600">Expected July 16, 2025</span>
          </div>
          <p className="text-gray-800">Bachelor of Science in Information Technology</p>
          <p className="text-gray-600">Specializing in Network/Cloud</p>
          <p className="text-gray-600 mt-2">
            <span className="font-semibold">Relevant Coursework:</span> Cloud Computing & AWS Fundamentals, 
            Networking & Cloud Security, Cloud Architecture & Deployment
          </p>
        </div>
      </section>

      {/* Relevant Projects Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">RELEVANT PROJECTS</h2>
        
        <div className="mb-6">
          <h3 className="font-bold mb-2">Serverless Web Application with AWS Lambda and API Gateway</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Built a To-Do List API that allows users to create, view, update, and delete tasks using AWS Lambda for serverless logic and API Gateway for routing.</li>
            <li>Stored task data in DynamoDB, ensuring fast, scalable, and managed NoSQL storage.</li>
            <li>Implemented AWS CloudWatch to monitor Lambda functions and log API requests, providing real-time insights into app performance and errors.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Deployed AWS Two-Tier Architecture using Terraform</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Provisioned a two-tier architecture in AWS using Terraform to deploy a scalable web app with separate application and database layers.</li>
            <li>Automated infrastructure provisioning, including EC2 instances, RDS databases, and VPC networking, to ensure reliable and cost-effective deployment.</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Implementing QR Code Technology in Patient Monitoring System</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Designed and implemented a QR code-based solution for efficient patient data tracking and monitoring, improving patient care workflows.</li>
            <li>Enabled quick access to detailed patient records by integrating QR codes with a centralized database, reducing errors and enhancing data retrieval speed.</li>
          </ul>
        </div>
      </section>

      {/* Technical Skills Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">TECHNICAL SKILLS</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-bold mb-2">Languages</h3>
            <p className="text-gray-700">PHP, Python, Bash</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Database</h3>
            <p className="text-gray-700">MySQL</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">AWS</h3>
            <p className="text-gray-700">EC2, S3, CloudFront, IAM, KMS, VPC, Route 53, Lambda, CloudFormation, API Gateway</p>
          </div>
          <div>
            <h3 className="font-bold mb-2">Tools & OS</h3>
            <p className="text-gray-700">Git, Docker, Kubernetes, Terraform, Linux Ubuntu</p>
          </div>
        </div>
      </section>

      {/* Relevant Courses Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-4">RELEVANT COURSES</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold">AWS Solutions Architect - Associate</h3>
            <p className="text-gray-600">AWS</p>
          </div>
          <div>
            <h3 className="font-bold">IT Specialist - Databases</h3>
            <p className="text-gray-600">MySQL</p>
          </div>
        </div>
      </section>
    </div>
  );
}