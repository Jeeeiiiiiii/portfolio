import Link from 'next/link'

export default function Projects() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">My Projects</h1>
      <div className="space-y-12">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Serverless Web Application with AWS Lambda and API Gateway</h2>
          <p className="text-gray-300 mb-6">
            Engineered a scalable, event-driven data pipeline using AWS Lambda and S3. 
            This solution processes large volumes of data in real-time, enabling quick insights and reducing operational costs.
          </p>
          <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
          <ul className="list-disc list-inside text-gray-300 mb-6">
            <li>Built a To-Do List API that allows users to create, view, update, and delete tasks using AWS Lambda for serverless logic and API Gateway for routing.</li>
            <li>Stored task data in DynamoDB, ensuring fast, scalable, and managed NoSQL storage.</li>
            <li>Implemented AWS CloudWatch to monitor Lambda functions and log API requests, providing real-time insights into app performance and errors</li>
          </ul>
          <Link href="https://github.com/Jeeeiiiiiii" className="text-blue-400 hover:underline">View on GitHub</Link>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">CI/CD Pipiline with Docker, Kubernetes, and Terraform</h2>
          <p className="text-gray-300 mb-6">
            Developed a unified monitoring dashboard for resources across AWS, Azure, and GCP. 
            This project provides a single pane of glass for monitoring and managing multi-cloud infrastructure.
          </p>
          <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
          <ul className="list-disc list-inside text-gray-300 mb-6">
            <li>Containerized a Node.js app using Docker to ensure consistent environments for development and production</li>
            <li>Set up a Kubernetes cluster using Terraform on AWS EKS to manage and scale the app efficiently in the cloud.</li>
          </ul>
          <Link href="https://github.com/Jeeeiiiiiii" className="text-blue-400 hover:underline">View on GitHub</Link>
        </div>

        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Cloud Data Pipeline with Python (ETL Process)</h2>
          <p className="text-gray-300 mb-6">
            Created an automated security scanning tool that checks cloud resources for misconfigurations and compliance violations. 
            This tool helps maintain a secure cloud environment by providing regular audits and remediation suggestions.
          </p>
          <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
          <ul className="list-disc list-inside text-gray-300 mb-6">
            <li>Built an ETL pipeline to extract sales data from CSV files stored in S3, transform the data using Python and Pandas, and load it into AWS Redshift for analysis</li>
            <li>Automated the pipeline to run at regular intervals using AWS Lambda, enabling real-time data processing and reducing manual intervention.</li>
          </ul>
          <Link href="https://github.com/Jeeeiiiiiii" className="text-blue-400 hover:underline">View on GitHub</Link>
        </div>
      </div>
    </div>
  )
}

