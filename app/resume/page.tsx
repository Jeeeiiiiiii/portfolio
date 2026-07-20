import Footer from '@/components/Footer';

export const metadata = {
  title: "Resume | Steven Carreon",
  description: "Professional resume and experience of Steven Carreon",
};

const projects = [
  {
    title: "Serverless Web Application with AWS Lambda and API Gateway",
    bullets: [
      "Built a To-Do List API that allows users to create, view, update, and delete tasks using AWS Lambda for serverless logic and API Gateway for routing.",
      "Stored task data in DynamoDB, ensuring fast, scalable, and managed NoSQL storage.",
      "Implemented AWS CloudWatch to monitor Lambda functions and log API requests, providing real-time insights into app performance and errors.",
    ],
  },
  {
    title: "Deployed AWS Two-Tier Architecture using Terraform",
    bullets: [
      "Provisioned a two-tier architecture in AWS using Terraform to deploy a scalable web app with separate application and database layers.",
      "Automated infrastructure provisioning, including EC2 instances, RDS databases, and VPC networking, to ensure reliable and cost-effective deployment.",
    ],
  },
  {
    title: "Implementing QR Code Technology in Patient Monitoring System",
    bullets: [
      "Designed and implemented a QR code-based solution for efficient patient data tracking and monitoring, improving patient care workflows.",
      "Enabled quick access to detailed patient records by integrating QR codes with a centralized database, reducing errors and enhancing data retrieval speed.",
    ],
  },
];

const skills = [
  { label: "Languages", value: "PHP, Python, Bash" },
  { label: "Database", value: "MySQL" },
  { label: "AWS", value: "EC2, S3, CloudFront, IAM, KMS, VPC, Route 53, Lambda, CloudFormation, API Gateway" },
  { label: "Tools & OS", value: "Git, Docker, Kubernetes, Terraform, Linux Ubuntu" },
];

export default function ResumePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="page-title mb-3">resume</h1>
            <p className="micro">
              cavite, ph · +63 976-493-7713 ·{' '}
              <a href="mailto:aurjei.steven.carreon@gmail.com" className="link-u">
                aurjei.steven.carreon@gmail.com
              </a>
            </p>
          </div>
          <a
            href="/resume.pdf"
            target="_blank"
            className="bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200"
          >
            download pdf ↗
          </a>
        </header>

        {/* Education */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">01 — education</h2>
          <div className="flex justify-between items-baseline gap-4 mb-1">
            <h3 className="font-semibold tracking-tight">Adamson University</h3>
            <span className="micro shrink-0">expected jul 2025</span>
          </div>
          <p className="text-[13px] text-gray-500">Bachelor of Science in Information Technology</p>
          <p className="text-[13px] text-gray-500">Specializing in Network/Cloud</p>
          <p className="text-[13px] text-gray-500 mt-2">
            <span className="micro mr-1">coursework</span> Cloud Computing &amp; AWS Fundamentals,
            Networking &amp; Cloud Security, Cloud Architecture &amp; Deployment
          </p>
        </section>

        {/* Projects */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">02 — relevant projects</h2>
          <div className="space-y-7">
            {projects.map((project) => (
              <div key={project.title}>
                <h3 className="font-semibold tracking-tight mb-2">{project.title}</h3>
                <ul className="space-y-1.5 text-[13px] text-gray-500 list-disc pl-5">
                  {project.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Skills — hairline-divided grid; the dividers are the design */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">03 — technical skills</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 border border-gray-200 rounded-2xl overflow-hidden">
            {skills.map((skill, i) => (
              <div
                key={skill.label}
                className={`p-5 border-gray-200 ${i % 2 === 1 ? 'sm:border-l' : ''} ${i > 1 ? 'border-t' : i === 1 ? 'border-t sm:border-t-0' : ''}`}
              >
                <p className="micro mb-2">{skill.label}</p>
                <p className="text-[13px] text-gray-500">{skill.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">04 — certifications</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold tracking-tight text-[13px]">AWS Solutions Architect — Associate</h3>
              <p className="micro">aws</p>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight text-[13px]">IT Specialist — Databases</h3>
              <p className="micro">mysql</p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
