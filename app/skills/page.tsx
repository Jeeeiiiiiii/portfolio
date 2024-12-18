export default function Skills() {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-12 text-center">My Skills</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Cloud Platforms</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Amazon Web Services (AWS)</li>
              <li>Microsoft Azure</li>
              <li>Google Cloud Platform (GCP)</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Infrastructure as Code</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Terraform</li>
              <li>AWS CloudFormation</li>
              <li>Ansible</li>
              <li>Pulumi</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Containerization &amp; Orchestration</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Docker</li>
              <li>Kubernetes</li>
              <li>Amazon ECS</li>
              <li>OpenShift</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">CI/CD</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Jenkins</li>
              <li>GitLab CI</li>
              <li>GitHub Actions</li>
              <li>AWS CodePipeline</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Programming Languages</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Python</li>
              <li>Go</li>
              <li>Bash</li>
              <li>JavaScript/TypeScript</li>
            </ul>
          </div>
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Monitoring &amp; Logging</h2>
            <ul className="space-y-2 text-gray-300">
              <li>Prometheus</li>
              <li>Grafana</li>
              <li>ELK Stack (Elasticsearch, Logstash, Kibana)</li>
              <li>Datadog</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
  
  