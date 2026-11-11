import Link from 'next/link';
import Footer from '@/components/Footer';
import { projects, statusLabel, kindLabel, type Project } from '@/content/projects';

export const metadata = {
  title: "Projects | Aurjei Steven Carreon",
  description: "Payments, trading-bot and machine-learning platforms, each tested by breaking it on purpose, plus smaller infrastructure labs.",
};

function ProjectTile({ project }: { project: Project }) {
  const shipped = project.status === 'shipped';
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-1">
        <h2 className="text-[15px] font-semibold tracking-tight">{project.title}</h2>
        <span
          className={`micro !text-[9px] shrink-0 rounded-full border px-2 py-px ${
            shipped ? 'border-ink !text-ink' : 'border-gray-300'
          }`}
        >
          {statusLabel[project.status]}
        </span>
      </div>
      <p className="micro mb-3">{project.tagline}</p>
      <p className="text-[13px] text-gray-500 leading-relaxed mb-4 flex-1">{project.summary}</p>
      <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex gap-1.5 flex-wrap">
          {project.stack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]">
              {tech}
            </span>
          ))}
          {project.stack.length > 4 && (
            <span className="micro !text-[9px]">+{project.stack.length - 4}</span>
          )}
        </div>
        <span className="micro !text-[9px] shrink-0">{kindLabel[project.kind]}</span>
      </div>
    </Link>
  );
}

function Section({ label, note, items }: { label: string; note: string; items: Project[] }) {
  if (items.length === 0) return null;
  return (
    <section className="mb-12">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-4 mb-6">
        <h2 className="section-label">{label}</h2>
        <span className="micro">{note}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((p) => (
          <ProjectTile key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}

export default function ProjectsPage() {
  const main = projects.filter((p) => p.kind === 'project');
  const labs = projects.filter((p) => p.kind === 'lab');
  const earlier = projects.filter((p) => p.kind === 'earlier');

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-48 h-36 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">projects</h1>
          <p className="micro">02 — selected work</p>
          <p className="text-gray-500 mt-4 max-w-md text-[13px] leading-relaxed">
            The projects are platforms around real open-source apps and models: payments, trading
            bots and machine learning, each tested by breaking it on purpose. The labs are smaller
            systems, each one making a single part of a platform visible.
          </p>
        </header>

        <Section label="01 — projects" note={`${main.length} projects`} items={main} />
        <Section label="02 — labs" note={`${labs.length} labs · verified end to end on a local emulator`} items={labs} />
        <Section label="03 — earlier work" note={`${earlier.length} project${earlier.length === 1 ? '' : 's'}`} items={earlier} />
      </div>
      <Footer />
    </div>
  );
}
