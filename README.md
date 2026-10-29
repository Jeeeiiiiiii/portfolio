# portfolio

Personal site — [stevencarreon on Vercel](https://final-portfolio.vercel.app). Next.js 15 (App Router), Tailwind 4, the
[bryl-minimal](https://github.com/bryllim/bryl-minimal-design) design language.

## What is where

```
app/                 routes: / (about), /projects, /projects/[slug], /blog, /resume, /contact, /visitors
app/api/visitors/    submit (POST) and status (GET) — the visitor playground write path
app/api/discord/     the /blog Discord command (docs/blog-bot.md)
content/blog/        one markdown file per post; lib/blog.ts reads them
content/projects.ts  every project, one typed module; the grid, detail pages and resume read it
content/work.ts      the "at work now" highlights on the about page
content/visitors.json  the guestbook — edited only through pull requests
lib/blog-bot/        Discord signature check · /blog commands · GitHub dispatch/merge
lib/visitors/        config · github (App + PR) · turnstile · ratelimit · moderate · submit · pipeline
public/diagrams/     archify architecture pages from the lab repos, embedded on project pages
docs/playground-plan.md  the visitor playground: goals, architecture, security checklist, progress log
docs/blog-bot.md     drafting posts from Discord: flow, guard rails, setup
```

## Run it

```bash
npm ci
npm run dev        # http://localhost:3000
npm test           # vitest: lib/**/*.test.ts
npm run typecheck
npm run build      # lint + typecheck + build, same as CI
```

Copy `.env.example` to `.env.local` for the optional integrations (visitor submissions, the contact map).
Without them the site builds and runs; the visitor form shows a "submissions open soon" state.

## Editing content

- **A project** — add an entry to `content/projects.ts`. It appears on `/projects`, gets a page at
  `/projects/<slug>`, and (if `status: 'shipped'`) is listed on `/resume`. If it has an archify
  diagram, drop the HTML in `public/diagrams/` and set `links.diagram`.
- **A blog post** — add `content/blog/<slug>.md` (lowercase-hyphenated filename = URL). Frontmatter:
  `title`, `date` (YYYY-MM-DD), `excerpt`, `tags`, and optionally `image` (path under `public/`),
  `source` (the article it responds to) and `draft: true` (dev only). `lib/blog.ts` validates the
  frontmatter, renders the markdown, sanitises the HTML and builds the table of contents from `##` headings.
- **Work highlights** — `content/work.ts`. Written for a public site: no client names, tickets or hostnames.
  Or from your phone: `/blog new url:<article> note:<angle>` in Discord drafts it as a PR (docs/blog-bot.md).
- **Visitor cards** — never by hand; they arrive as PRs labelled `visitor-submission`.

## Branches and environments

| Branch      | Vercel     | Purpose                              |
|-------------|------------|--------------------------------------|
| `main`      | production | read-only demo surface               |
| `staging`   | preview    | the sandbox where the form is live   |
| `visitor/*` | preview    | one branch per submitted card        |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and build on every PR and push to
`main`/`staging`. `visitor-pr-guard.yml` fails any `visitor/*` PR that touches a file other than
`content/visitors.json`; `stale-visitor-prs.yml` closes idle visitor PRs after 7 days.
`blog-draft.yml` drafts a post as a PR (from Discord or by hand); `blog-pr-guard.yml` fails any `blog/*`
PR that touches anything but `content/blog/*.md`.
