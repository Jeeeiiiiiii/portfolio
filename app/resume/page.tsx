import Link from 'next/link';
import Footer from '@/components/Footer';
import { projects } from '@/content/projects';

export const metadata = {
  title: "Resume | Steven Carreon",
  description: "Professional resume and experience of Steven Carreon",
};

const experience = [
  {
    title: "DevOps Engineer",
    company: "GECO Asia",
    period: "mar 2026 — present",
    bullets: [
      "Deployed on-site with EssilorLuxottica's DevOps team; implement and maintain observability and GitOps tooling (EFK, Prometheus, Grafana, Argo CD) for monitoring, logging, and continuous deployment across PROD, DR, QUA, and PP environments.",
      "Designed and shipped an AI-driven first-layer alert triage that wires Prometheus/Alertmanager to an in-cluster HolmesGPT engine, automatically investigating critical alerts and emailing root-cause analysis before on-call engineers open a terminal, keeping cluster data in-house.",
      "Support developers through application deployments and issue troubleshooting across INT, Staging, UAT, and PROD environments.",
      "Perform AKS node pool migrations and Kubernetes version upgrades, handling scaling operations and application configuration updates.",
    ],
  },
  {
    title: "DevOps Apprentice",
    company: "EssilorLuxottica",
    period: "sep 2025 — mar 2026",
    bullets: [
      "Assisted with AKS node pool migrations (Standard Es v3 → Standard Eads v5) across PROD, DR, QUA, and PP environments, handling deployment updates, scaling operations, and application configurations.",
      "Supported Kubernetes upgrades from v1.33.x to v1.34.x.",
      "Migrated enterprise tenant from CoreMedia v10 to v12, rebuilding repositories, databases, user initialization, infrastructure, and operational configurations.",
      "Deployed and managed Nginx Proxy Manager and Portainer for traffic routing and container administration.",
      "Assisted with SSL/TLS certificate management across INT, Staging, UAT, and PROD environments.",
      "Diagnosed and resolved platform issues including memory heap constraints, disk utilization, and application errors using centralized logging and metrics.",
    ],
  },
  {
    title: "Backend DevOps Trainee",
    company: "Hivelabs Technologies Corp.",
    period: "may 2025 — jul 2025",
    bullets: [
      "Actively involved in full-stack development for an eCommerce application.",
      "Assisted in frontend development tasks including UI fixes and layout enhancements using Flexbox.",
      "Worked on third-party payment integration with FiUU APIs.",
      "Utilized JIRA for task tracking, sprint planning, and ticket management as part of the Agile development process.",
    ],
  },
  {
    title: "QA Tester Intern",
    company: "Hivelabs Technologies Corp.",
    period: "feb 2025 — apr 2025",
    bullets: [
      "Conducted manual testing for an ERP system to ensure functionality and reliability.",
      "Designed comprehensive test scenarios and detailed test cases based on system requirements.",
      "Identified and documented bugs using Trello and Excel for efficient tracking and resolution.",
    ],
  },
];

const skills = [
  { label: "Kubernetes", value: "AKS, EKS, Helm, Argo CD, Istio, ingress-nginx, External Secrets, HPA, ServiceMonitor" },
  { label: "Cloud", value: "Azure (AKS, ACR) · AWS (EC2, VPC, IAM, S3, RDS, SQS, Lambda, ECR, EKS, Secrets Manager, CloudWatch, CloudFront, Route 53, API Gateway)" },
  { label: "IaC & CI/CD", value: "Terraform, Docker, GitHub Actions (self-hosted runners), Jenkins (JCasC), Bitbucket Pipelines, Ansible (reviewed)" },
  { label: "Observability", value: "Prometheus, Alertmanager, Grafana, Loki, Tempo, OpenTelemetry, EFK / ECK, CloudWatch, HolmesGPT" },
  { label: "Security", value: "Semgrep (SAST), Trivy (IaC + image, CycloneDX SBOM), OWASP ZAP (DAST), mTLS / AuthorizationPolicy, TLS certificate management" },
  { label: "Languages & data", value: "Python (Flask, FastAPI, boto3), Bash, TypeScript, PHP · PostgreSQL, MySQL" },
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
            <span className="micro shrink-0">jul 2025</span>
          </div>
          <p className="text-[13px] text-gray-500">Bachelor of Science in Information Technology</p>
          <p className="text-[13px] text-gray-500">Specializing in Network/Cloud</p>
          <p className="text-[13px] text-gray-500 mt-2">
            <span className="micro mr-1">coursework</span> Cloud Computing &amp; AWS Fundamentals,
            Networking &amp; Cloud Security, Cloud Architecture &amp; Deployment
          </p>
        </section>

        {/* Experience */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">02 — experience</h2>
          <div className="space-y-8">
            {experience.map((job) => (
              <div key={`${job.title}-${job.period}`}>
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h3 className="font-semibold tracking-tight">{job.title}</h3>
                  <span className="micro shrink-0">{job.period}</span>
                </div>
                <p className="micro mb-3">{job.company}</p>
                <ul className="space-y-1.5 text-[13px] text-gray-500 list-disc pl-5">
                  {job.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects — read from the same module as /projects */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">03 — relevant projects</h2>
          <div className="space-y-6">
            {projects
              .filter((p) => p.status === 'shipped')
              .map((p) => (
                <div key={p.slug}>
                  <div className="flex justify-between items-baseline gap-4 mb-1">
                    <h3 className="font-semibold tracking-tight">
                      <Link href={`/projects/${p.slug}`} className="link-u">{p.title}</Link>
                    </h3>
                    <span className="micro shrink-0">{p.period}</span>
                  </div>
                  <p className="micro mb-2">{p.stack.slice(0, 6).join(' · ')}</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{p.summary}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Skills — hairline-divided grid; the dividers are the design */}
        <section className="mb-12">
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">04 — technical skills</h2>
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
          <h2 className="section-label border-b border-gray-200 pb-3 mb-5">05 — certifications</h2>
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
