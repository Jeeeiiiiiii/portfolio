import Link from 'next/link';
import Footer from '@/components/Footer';
import { visitorsFileSchema, type VisitorCard } from '@/lib/visitors-schema';
import { isProduction, turnstileSiteKey } from '@/lib/visitors/config';
import visitorsJson from '@/content/visitors.json';
import PipelineView from './pipeline-view';
import SubmitForm from './submit-form';

export const metadata = {
  title: "Visitors | Steven Carreon",
  description: "A GitOps guestbook — every card on this page arrived as a pull request.",
};

function hostLabel(link: string) {
  try {
    return new URL(link).hostname.replace(/^www\./, '');
  } catch {
    return 'link';
  }
}

function CardTile({ card }: { card: VisitorCard }) {
  const date = new Date(card.submittedAt).toISOString().slice(0, 10);
  return (
    <article className="border border-gray-200 rounded-xl p-5 bg-gray-50 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="text-[13px] font-semibold tracking-tight">{card.name}</h2>
        <span className="micro !text-[9px] shrink-0">{date}</span>
      </div>
      <p className="micro mb-3">{card.role}</p>
      <p className="text-[13px] text-gray-500 leading-relaxed">{card.message}</p>
      {card.link && (
        <a
          href={card.link}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="micro inline-block mt-3 hover:text-ink transition-colors duration-200"
        >
          {hostLabel(card.link)} ↗
        </a>
      )}
    </article>
  );
}

export default function VisitorsPage() {
  const { cards } = visitorsFileSchema.parse(visitorsJson);
  const isProd = isProduction();
  // The form needs the public Turnstile key; without it the sandbox is not open yet.
  const siteKey = isProd ? null : turnstileSiteKey();

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 stagger">
        <header className="relative mb-10">
          <div className="halftone absolute -top-6 right-0 w-48 h-36 pointer-events-none" aria-hidden />
          <h1 className="page-title mb-3">visitors</h1>
          <p className="micro">06 — a gitops guestbook</p>
          <p className="text-gray-500 mt-4 max-w-md text-[13px] leading-relaxed">
            Every card on this page arrived as a pull request: a visitor submits the form on
            staging, a bot opens a PR against <span className="font-mono text-[12px]">main</span>,
            and merging it deploys the card here. Content as code, reviewed like code.
          </p>
        </header>

        <section>
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-4 mb-6">
            <h2 className="section-label">01 — the wall</h2>
            <span className="micro">{cards.length} {cards.length === 1 ? 'card' : 'cards'}</span>
          </div>

          {cards.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-2xl px-6 py-14 text-center">
              <p className="micro mb-2">no cards yet</p>
              <p className="text-[13px] text-gray-500">Be the first — the wall is waiting for its first merge.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cards.map((card) => (
                <CardTile key={card.id} card={card} />
              ))}
            </div>
          )}

          {/* Submission affordance: live only off-production, and only once
              the public Turnstile key is present. */}
          <div className="mt-8 border-t border-gray-200 pt-6 flex flex-wrap items-center justify-between gap-3">
            {isProd ? (
              <p className="micro">read-only on production — cards are added from the staging sandbox</p>
            ) : siteKey ? (
              <>
                <p className="micro">this is the sandbox — your card opens a real pull request</p>
                <SubmitForm siteKey={siteKey} />
              </>
            ) : (
              <>
                <p className="micro">submissions open on staging soon</p>
                <span
                  aria-disabled="true"
                  className="bg-ink text-background text-xs px-4 py-2 rounded-md opacity-40 cursor-not-allowed select-none"
                >
                  add your card
                </span>
              </>
            )}
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-baseline justify-between border-b border-gray-200 pb-4 mb-6">
            <h2 className="section-label">02 — how a card gets here</h2>
            <Link href="/projects/visitor-playground" className="micro hover:text-ink transition-colors duration-200">
              the design →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_minmax(0,16rem)] gap-8">
            <PipelineView />
            <aside className="text-[12px] text-gray-500 leading-relaxed space-y-3">
              <p>
                The only file a visitor PR may change is{' '}
                <span className="font-mono text-[11px]">content/visitors.json</span>. That is enforced
                in the code that writes it and again by a CI check on the pull request.
              </p>
              <p>
                Spam control happens at submit time — captcha, one submission a minute and five a day
                per address, a profanity filter, and a link allowlist. Review happens on GitHub.
              </p>
              <p>
                After you submit, this page shows the pull request moving through each stage until
                it is merged and deployed.
              </p>
            </aside>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
