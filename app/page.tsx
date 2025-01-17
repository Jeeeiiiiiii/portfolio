import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-16">
        <Image
          src="/pic2.jpg"
          alt="Steven Carreon"
          width={200}
          height={200}
          className="rounded-full mx-auto mb-8"
        />
        <h1 className="text-5xl font-bold mb-4">Steven Carreon</h1>
        <p className="text-xl text-gray-400 mb-8">Aspiring Cloud Engineer</p>
        <p className="max-w-2xl mx-auto text-gray-300">
          Passionate about building scalable and resilient cloud infrastructure. 
          Constantly learning and applying new technologies to solve complex problems.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Serverless Web Application with AWS Lambda and API Gateway</h3>
            <p className="text-gray-300 mb-4">
              Engineered a scalable, event-driven data pipeline using AWS Lambda and S3.
            </p>
            <Link href="/projects" className="text-blue-400 hover:underline">Learn more</Link>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">CI/CD Pipiline with Docker, Kubernetes, and Terraform</h3>
            <p className="text-gray-300 mb-4">
              Developed a unified monitoring dashboard for resources across AWS, Azure, and GCP.
            </p>
            <Link href="/projects" className="text-blue-400 hover:underline">Learn more</Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-8 text-center">Core Competencies</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Cloud Platforms</h3>
            <p className="text-gray-300">AWS</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Infrastructure as Code</h3>
            <p className="text-gray-300">Terraform and CloudFormation</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Containerization</h3>
            <p className="text-gray-300">Docker, Kubernetes, ECS</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">CI/CD</h3>
            <p className="text-gray-300">Jenkins, GitLab CI, GitHub Actions</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Programming</h3>
            <p className="text-gray-300">Python, Bash</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Monitoring</h3>
            <p className="text-gray-300">ELK Stack</p>
          </div>
        </div>
      </section>
    </div>
  )
}

