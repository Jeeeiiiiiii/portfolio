import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Footer from '@/components/Footer';
import { focusRing } from '@/components/PostList';
import { getAllPosts, type Post } from '@/lib/blog';
import { projects, statusLabel, kindLabel, type Project } from '@/content/projects';

/** Built work first, then plans; within a status, the order in content/projects.ts. */
const statusOrder: Record<Project['status'], number> = { shipped: 0, 'in-progress': 1, 'in-design': 2 };

function StatusChip({ status }: { status: Project['status'] }) {
  return (
    <span
      className={`micro !text-[9px] shrink-0 rounded-full border px-2 py-px ${
        status === 'in-design' ? 'border-gray-300 !text-gray-500' : 'border-ink !text-ink'
      }`}
    >
      {statusLabel[status]}
    </span>
  );
}

/**
 * A main project as a full-width row. The whole row opens the project; the
 * write-up link sits above that stretched link so it stays its own target.
 */
function ProjectRow({ project, index, post }: { project: Project; index: number; post?: Post }) {
  return (
    <li className="group relative -mx-4 grid grid-cols-[2rem_1fr] gap-x-3 rounded-xl px-4 py-6 transition-colors duration-200 hover:bg-gray-50 sm:grid-cols-[2.5rem_1fr_auto]">
      <span className="section-label pt-1 tabular-nums transition-colors duration-200 group-hover:!text-ink">
        {String(index).padStart(2, '0')}
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <h3 className="text-[1.15rem] font-semibold tracking-[-0.02em]">
            <Link
              href={`/projects/${project.slug}`}
              className={`after:absolute after:inset-0 after:rounded-xl after:content-[''] ${focusRing}`}
            >
              {project.title}
            </Link>
          </h3>
          <StatusChip status={project.status} />
        </div>
        <p className="mt-1 text-[13px] font-medium text-gray-600">{project.tagline}</p>
        <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-gray-600">{project.summary}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="micro !text-gray-500">{project.stack.slice(0, 4).join(' · ')}</span>
          {post && (
            <Link
              href={`/blog/${post.slug}`}
              className={`group/post relative z-10 inline-flex items-center gap-1.5 text-[13px] font-medium ${focusRing}`}
            >
              <span className="underline decoration-gray-300 underline-offset-4 transition-colors duration-200 group-hover/post:decoration-ink">
                {post.kind === 'design' ? 'read the plan' : 'read the write-up'}
              </span>
              <span className="micro !text-gray-500">{post.readingMinutes} min</span>
            </Link>
          )}
        </div>
      </div>
      <ArrowRight
        className="hidden h-4 w-4 self-center text-gray-400 transition-[translate,color] duration-300 ease-[var(--ease-out-long)] group-hover:translate-x-1 group-hover:text-ink sm:block"
        aria-hidden
      />
    </li>
  );
}

function MainProjects({ items }: { items: Project[] }) {
  if (items.length === 0) return null;
  const posts = new Map(getAllPosts().map((p) => [p.slug, p]));
  const ordered = [...items].sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  return (
    <section className="mb-14">
      <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
        <h2 className="section-label">01 — projects</h2>
        <span className="micro">{items.length} projects</span>
      </div>
      <ol className="divide-y divide-gray-200 border-b border-gray-200">
        {ordered.map((p, i) => (
          <ProjectRow key={p.slug} project={p} index={i + 1} post={p.links.post ? posts.get(p.links.post) : undefined} />
        ))}
      </ol>
    </section>
  );
}

export const metadata = {
  title: "Projects | Aurjei Steven Carreon",
  description: "Payments, trading-bot and machine-learning platforms, each tested by breaking it on purpose, plus smaller infrastructure labs.",
};

function ProjectTile({ project }: { project: Project }) {
  const shipped = project.status === 'shipped';
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group flex flex-col border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300 ${focusRing}`}
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
      <p className="micro mb-3 !text-gray-500">{project.tagline}</p>
      <p className="text-[13px] text-gray-600 leading-relaxed mb-4 flex-1">{project.summary}</p>
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

        <MainProjects items={main} />
        <Section label="02 — labs" note={`${labs.length} labs · verified end to end on a local emulator`} items={labs} />
        <Section label="03 — earlier work" note={`${earlier.length} project${earlier.length === 1 ? '' : 's'}`} items={earlier} />
      </div>
      <Footer />
    </div>
  );
}
