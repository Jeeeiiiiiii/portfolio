import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Footer from '@/components/Footer';
import DiagramFrame from '@/components/DiagramFrame';
import { getProject, projects, projectSlugs, statusLabel, kindLabel } from '@/content/projects';

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const project = getProject((await params).slug);
  if (!project) return { title: 'Project not found' };
  return {
    title: `${project.title} | Steven Carreon`,
    description: project.summary,
  };
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="section-label border-b border-gray-200 pb-3 mb-5">
        {number} — {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ProjectPage({ params }: { params: Params }) {
  const project = getProject((await params).slug);
  if (!project) notFound();

  const index = projects.findIndex((p) => p.slug === project.slug);
  const prev = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  // Section numbering stays contiguous whichever optional sections exist.
  let n = 0;
  const num = () => String(++n).padStart(2, '0');

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
        <div className="mb-8">
          <Link href="/projects" className="inline-flex items-center gap-2 micro hover:text-ink transition-colors duration-200">
            <ArrowLeft className="w-3 h-3" />
            back to projects
          </Link>
        </div>

        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-40 h-32 pointer-events-none" aria-hidden />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="micro">{kindLabel[project.kind]}</span>
            <span className="micro">·</span>
            <span className="micro">{project.period}</span>
            <span
              className={`micro !text-[9px] rounded-full border px-2 py-px ${
                project.status === 'shipped' ? 'border-ink !text-ink' : 'border-gray-300'
              }`}
            >
              {statusLabel[project.status]}
            </span>
          </div>
          <h1 className="text-[1.6rem] font-semibold tracking-tight mb-1">{project.title}</h1>
          <p className="micro mb-5">{project.tagline}</p>
          <p className="text-gray-500 leading-relaxed mb-5">{project.summary}</p>

          <div className="flex flex-wrap items-center gap-5 mb-5">
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-ink text-background text-xs px-4 py-2 rounded-md hover:opacity-90 transition-opacity duration-200"
              >
                view code ↗
              </a>
            )}
            {project.links.demo && (
              <Link href={project.links.demo} className="micro hover:text-ink transition-colors duration-200">
                see it live →
              </Link>
            )}
            {project.links.diagram && (
              <a href="#architecture" className="micro hover:text-ink transition-colors duration-200">
                jump to diagram ↓
              </a>
            )}
            {project.links.inspiredBy && (
              <a
                href={project.links.inspiredBy.url}
                target="_blank"
                rel="noopener noreferrer"
                className="micro hover:text-ink transition-colors duration-200"
              >
                modelled on {project.links.inspiredBy.label} ↗
              </a>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span key={tech} className="rounded-full border border-gray-300 px-2 py-px micro !text-[9px]">
                {tech}
              </span>
            ))}
          </div>
        </header>

        <Section number={num()} title="why it exists">
          <div className="space-y-4 text-gray-500 text-[15px] leading-relaxed">
            {project.purpose.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Section>

        {(project.ascii || project.links.diagram) && (
          <section id="architecture" className="mb-12 scroll-mt-8">
            <h2 className="section-label border-b border-gray-200 pb-3 mb-5">{num()} — architecture</h2>
            {project.links.diagram && (
              <div className="mb-4">
                <DiagramFrame src={project.links.diagram} title={`${project.title} architecture diagram`} />
              </div>
            )}
            {project.ascii && (
              <pre className="font-mono text-[11px] sm:text-[12px] leading-[1.35] text-gray-500 bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5 overflow-x-auto">
                {project.ascii}
              </pre>
            )}
          </section>
        )}

        <Section number={num()} title="the decisions">
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {project.decisions.map((d) => (
              <div key={d.title} className="py-5 grid grid-cols-1 sm:grid-cols-[minmax(0,14rem)_1fr] gap-2 sm:gap-6">
                <h3 className="text-[13px] font-semibold tracking-tight">{d.title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{d.why}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section number={num()} title="practices it demonstrates">
          <ul className="space-y-2 text-[13px] text-gray-500 list-disc pl-5">
            {project.practices.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Section>

        <Section number={num()} title="what is real, what is not">
          <ul className="space-y-2 text-[13px] text-gray-500 list-disc pl-5">
            {project.honest.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Section>

        {project.next.length > 0 && (
          <Section number={num()} title="next steps">
            <ol className="space-y-2 text-[13px] text-gray-500 list-decimal pl-5">
              {project.next.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </Section>
        )}

        <nav className="flex justify-between items-center border-t border-gray-200 pt-6">
          <div>
            {prev && (
              <Link href={`/projects/${prev.slug}`} className="micro hover:text-ink transition-colors duration-200">
                ← {prev.title.toLowerCase()}
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link href={`/projects/${next.slug}`} className="micro hover:text-ink transition-colors duration-200">
                {next.title.toLowerCase()} →
              </Link>
            )}
          </div>
        </nav>
      </div>
      <Footer />
    </div>
  );
}
