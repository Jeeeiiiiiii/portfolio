# portfolio

Personal site — [stevencarreon on Vercel](https://final-portfolio.vercel.app). Next.js 15 (App Router), Tailwind 4, the
[bryl-minimal](https://github.com/bryllim/bryl-minimal-design) design language.

## What is where

```
app/                 routes: / (about), /projects, /projects/[slug], /blog, /resume, /contact
app/api/discord/     the /blog Discord command (docs/blog-bot.md)
content/blog/        one markdown file per post; lib/blog.ts reads them
content/projects.ts  every project, one typed module; the grid, detail pages and resume read it
lib/blog-bot/        Discord signature check · /blog commands · GitHub dispatch/merge
lib/github-config.ts GitHub App environment (used by the blog bot)
public/diagrams/     archify architecture pages from the lab repos, embedded on project pages
docs/blog-style.md   how posts are written: structure, voice, checklist
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

Copy `.env.example` to `.env.local` for the optional integrations (the blog bot, the contact map).
Without them the site builds and runs.

## Editing content

- **A project** — add an entry to `content/projects.ts`. It appears on `/projects`, gets a page at
  `/projects/<slug>`, and (if `status: 'shipped'`) is listed on `/resume`. If it has an archify
  diagram, drop the HTML in `public/diagrams/` and set `links.diagram`.
- **A blog post** — add `content/blog/<slug>.md` (lowercase-hyphenated filename = URL). Frontmatter:
  `title`, `date` (YYYY-MM-DD), `excerpt`, `tags`, and optionally `image` (path under `public/`),
  `source` (the article it responds to), `draft: true` (dev only) and `featured: <n>`. `lib/blog.ts` validates the
  frontmatter, renders the markdown, sanitises the HTML and builds the table of contents from `##` headings.
  Or from your phone: `/blog write` (your own thoughts) or `/blog new url:<article>` in Discord drafts it as a PR (docs/blog-bot.md).
  The home page lists up to five posts marked `featured`, in order (`featured: 1` is the top); with none
  featured it shows the five newest. Everything else is under "show all" (`/blog`).
  Write posts the way `docs/blog-style.md` describes.
- **Public-content rule** — no client names, tickets or hostnames from the day job anywhere on the site.

## Branches and environments

| Branch      | Vercel     | Purpose                              |
|-------------|------------|--------------------------------------|
| `main`      | production | the live site                        |
| `staging`   | preview    | check changes before production      |
| `blog/*`    | preview    | one branch per drafted post          |

CI (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests and build on every PR and push to
`main`/`staging`.
`blog-draft.yml` drafts a post as a PR (from Discord or by hand); `blog-pr-guard.yml` fails any `blog/*`
PR that touches anything but `content/blog/*.md`.
