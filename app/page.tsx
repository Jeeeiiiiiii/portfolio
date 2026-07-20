import Image from "next/image";
import Link from "next/link";
import { SiNextdotjs, SiTypescript, SiTailwindcss, SiAmazonwebservices, SiDocker, SiKubernetes, SiTerraform, SiPrometheus, SiGrafana, SiJenkins, SiArgo, SiGithubactions } from 'react-icons/si';
import Footer from '@/components/Footer';

export const metadata = {
  title: "Devops Engineer | Steven Carreon",
  description: "Learn more about my background, skills, and experience in Devops Engineering",
};

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
  { name: 'Next.js', icon: SiNextdotjs },
  { name: 'TypeScript', icon: SiTypescript },
  { name: 'Tailwind CSS', icon: SiTailwindcss },
  { name: 'AWS', icon: SiAmazonwebservices },
  { name: 'Docker', icon: SiDocker },
  { name: 'Kubernetes', icon: SiKubernetes },
  { name: 'Terraform', icon: SiTerraform },
  { name: 'Prometheus', icon: SiPrometheus },
  { name: 'Grafana', icon: SiGrafana },
  { name: 'Argo CD', icon: SiArgo },
  { name: 'Jenkins', icon: SiJenkins },
  { name: 'GitHub Actions', icon: SiGithubactions },
];

const experience = [
  {
    title: "DevOps Engineer",
    company: "GECO Asia",
    period: "Mar 2026 — present",
    bullets: [
      "Deployed on-site with EssilorLuxottica's DevOps team; implement and maintain observability and GitOps tooling (EFK, Prometheus, Grafana, Argo CD) across PROD, DR, QUA, and PP environments",
      "Designed and shipped an AI-driven first-layer alert triage wiring Prometheus/Alertmanager to an in-cluster HolmesGPT engine — automated root-cause analysis emailed before on-call engineers open a terminal, with cluster data kept in-house",
      "Support developers through application deployments and issue troubleshooting across INT, Staging, UAT, and PROD",
      "Perform AKS node pool migrations and Kubernetes version upgrades, handling scaling operations and application configuration updates",
    ],
  },
  {
    title: "DevOps Apprentice",
    company: "EssilorLuxottica",
    period: "Sep 2025 — Mar 2026",
    bullets: [
      "Assisted with AKS node pool migrations (Standard Es v3 → Standard Eads v5) across PROD, DR, QUA, and PP environments",
      "Supported Kubernetes upgrades from v1.33.x to v1.34.x",
      "Migrated enterprise tenant from CoreMedia v10 to v12 — repositories, databases, user initialization, infrastructure, and operational configurations",
      "Deployed and managed Nginx Proxy Manager and Portainer; assisted with SSL/TLS certificate management across INT, Staging, UAT, and PROD",
      "Diagnosed platform issues (memory heap constraints, disk utilization, application errors) using centralized logging and metrics",
    ],
  },
  {
    title: "Backend DevOps Trainee",
    company: "Hivelabs Technologies Corp.",
    period: "May 2025 — Jul 2025",
    bullets: [
      "Actively involved in full-stack development for an eCommerce application",
      "Assisted in frontend development tasks including UI fixes and layout enhancements using Flexbox",
      "Worked on third-party payment integration with FiUU APIs",
      "Utilized JIRA for task tracking, sprint planning, and ticket management in an Agile process",
    ],
  },
  {
    title: "QA Tester Intern",
    company: "Hivelabs Technologies Corp.",
    period: "Feb 2025 — Apr 2025",
    bullets: [
      "Conducted manual testing for an ERP system to ensure functionality and reliability",
      "Designed comprehensive test scenarios and detailed test cases based on system requirements",
      "Identified and documented bugs using Trello and Excel for efficient tracking and resolution",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-14 stagger">
        {/* Hero */}
        <section className="relative mb-14">
          <div className="halftone absolute -top-8 -right-4 w-48 h-40 pointer-events-none" aria-hidden />
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="status-dot inline-block w-1.5 h-1.5 rounded-full bg-ink" />
                <span className="micro">cavite, philippines</span>
              </div>
              <h1 className="page-title mb-3">steven carreon</h1>
              <p className="micro !text-[11px] mb-4">cloud / devops engineer</p>
              <p className="text-gray-500 mb-6 max-w-md">
                Turning concepts into fully functional, engaging, and efficient applications.
              </p>
              <div className="flex flex-wrap items-center gap-5">
                <Link
                  href="/contact"
                  className="bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200"
                >
                  contact me
                </Link>
                <a href="/resume.pdf" target="_blank" className="micro hover:text-ink transition-colors duration-200">
                  download cv ↗
                </a>
                <a href="https://github.com/Jeeeiiiiiii" target="_blank" rel="noopener noreferrer" className="micro hover:text-ink transition-colors duration-200">
                  github ↗
                </a>
                <a href="https://linkedin.com/in/rjcarreon" target="_blank" rel="noopener noreferrer" className="micro hover:text-ink transition-colors duration-200">
                  linkedin ↗
                </a>
              </div>
            </div>
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
              <div className="relative w-full h-full rounded-full overflow-hidden grayscale">
                <Image src="/profile.png" alt="Steven Carreon" fill className="object-cover" priority />
              </div>
              <div className="halftone-bottom absolute -bottom-3 inset-x-0 h-10 pointer-events-none" aria-hidden />
            </div>
          </div>
        </section>

        {/* Stack */}
        <section className="mb-14">
          <h2 className="section-label mb-5">01 — stack</h2>
          <div className="flex flex-wrap gap-2 border-y border-gray-200 py-4">
            {techIcons.map((tech) => (
              <div
                key={tech.name}
                className="group flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-ink transition-colors duration-200"
              >
                <tech.icon className="w-5 h-5" />
                <span className="micro group-hover:text-ink transition-colors duration-200">{tech.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* GitHub */}
        <section className="mb-14">
          <h2 className="section-label mb-5">02 — github</h2>
          <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50 shadow-[var(--shadow-card)]">
            <Image
              src="http://ghchart.rshah.org/Jeeeiiiiiii"
              alt="Jeeeiiiiiii's GitHub contribution chart"
              width={800}
              height={128}
              className="w-full h-28 object-contain grayscale dark:invert"
            />
            <p className="micro mt-3">contribution graph — github.com/jeeeiiiiiii</p>
          </div>
        </section>

        {/* Experience */}
        <section className="mb-14">
          <h2 className="section-label mb-5">03 — experience</h2>
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {experience.map((job) => (
              <div key={job.title} className="py-6">
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

        {/* Certifications */}
        <section>
          <h2 className="section-label mb-5">04 — certifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {certifications.map((cert) => (
              <a
                key={cert.id}
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group border border-gray-200 rounded-2xl p-5 bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="relative h-28 bg-background border border-gray-200 rounded-[10px] mb-4 overflow-hidden">
                  <Image src={cert.image} alt={cert.name} fill className="object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
                <h3 className="text-[13px] font-semibold tracking-tight mb-1">{cert.name}</h3>
                <p className="micro">{cert.issuer} · {cert.date}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
