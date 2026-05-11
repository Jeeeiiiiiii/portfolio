# Visitor Playground — Implementation Plan

GitOps-backed sandbox where visitors edit an "About Visitors" card on the staging site, which opens a PR to `main`. Owner approves → Vercel deploys → card goes live.

This document is the source of truth for the feature. Update it as decisions change; don't let it rot.

---

## 1. Goals

**Primary:** Showcase end-to-end DevOps workflow on a portfolio site — branch-based environments, PR previews, branch protection, GitOps content flow, GitHub Apps, webhook automation.

**Secondary:** Position for MLOps transition by reusing the same pattern for a future "model card" submission feature (out of scope for v1, but the data model and API should not preclude it).

**Non-goals (v1):** Authentication, real moderation queue, multi-language, persistent storage outside git.

---

## 2. User flow

1. Visitor lands on `staging.<domain>/visitors`.
2. Sees a grid of existing visitor cards (name, role, one-liner).
3. Clicks **"Add your card"** → modal form (name, role, message, optional link).
4. Solves Turnstile captcha → submits.
5. Backend validates → creates branch `visitor/<uuid>` → commits to `content/visitors.json` → opens PR to `main`.
6. Visitor sees: "PR opened — preview will appear here in ~30s" with a link.
7. Vercel builds the visitor branch → preview URL appears on the confirmation screen.
8. Owner (you) gets Discord/email notification → reviews → merges or closes.
9. Merge to `main` → production deploy → card visible on prod `/visitors`.

---

## 3. Architecture

```
[visitor on staging.domain/visitors]
        |
        | form submit + Turnstile token
        v
[Next.js route: POST /api/visitors/submit]
   - validate payload (zod)
   - verify Turnstile
   - rate-limit (Upstash Redis: 1/min, 5/day per IP)
   - moderate (length, profanity, URL allowlist)
        |
        v
[GitHub App via Octokit]
   1. read content/visitors.json from main
   2. append new card, write to new branch visitor/<uuid>
   3. open PR -> main, label "visitor-submission"
        |
        v
[GitHub webhook -> Discord/email]   --> owner approves/merges
        |
        v
[Vercel auto-deploys main]          --> card live on prod
```

---

## 4. Environments

v1 uses Vercel-provided subdomains (free). Custom domain is a future swap with no code impact.

| Branch      | Vercel target  | URL (v1)                                          | Purpose                |
|-------------|----------------|---------------------------------------------------|------------------------|
| `main`      | Production     | `final-portfolio.vercel.app`                      | Real prod, read-only   |
| `staging`   | Preview alias  | `final-portfolio-git-staging-<user>.vercel.app`   | Editable sandbox       |
| `visitor/*` | Preview auto   | `<auto>.vercel.app`                               | Per-visitor PR preview |

Staging tracks `main` plus any in-flight work. The `/visitors` submit form is **only enabled when `VERCEL_ENV !== 'production'`** (so it lights up on staging + preview deploys, hidden on prod). Prod renders the same `/visitors` page in read-only mode.

**Future:** when a custom domain is purchased, map `<domain>` → main and `staging.<domain>` → staging branch in Vercel project settings. No code changes required.

---

## 5. File layout (additions)

```
Portfolio/
├── app/
│   ├── visitors/
│   │   ├── page.tsx              # grid of cards (server component, reads JSON)
│   │   └── submit-form.tsx       # client component, modal form
│   └── api/
│       └── visitors/
│           ├── submit/route.ts   # POST handler
│           └── status/route.ts   # GET PR status by id (for confirmation screen)
├── content/
│   └── visitors.json             # source of truth, edited via PR
├── lib/
│   ├── github.ts                 # Octokit client, branch+commit+PR helpers
│   ├── turnstile.ts              # captcha verification
│   ├── ratelimit.ts              # Upstash wrapper
│   ├── moderate.ts               # validation + profanity + URL allowlist
│   └── visitors-schema.ts        # zod schema (shared client/server)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # lint + typecheck + build on PR
│   │   └── stale-visitor-prs.yml # auto-close visitor PRs after 7d inactivity
│   └── CODEOWNERS                # @aurjei-steven-carreon owns everything
└── docs/
    └── playground-plan.md        # this file
```

---

## 6. Data model

`content/visitors.json`:

```json
{
  "version": 1,
  "cards": [
    {
      "id": "01HXYZ...",                  // ULID, generated server-side
      "name": "Jane Dev",                 // 2..40 chars
      "role": "SRE @ Acme",               // 2..60 chars
      "message": "Loved the Terraform writeup.",  // 10..200 chars
      "link": "https://github.com/janedev",        // optional, allowlist domains
      "submittedAt": "2026-05-11T08:30:00Z"
    }
  ]
}
```

Schema lives in `lib/visitors-schema.ts` (zod) and is imported by both the client form and the API route. Validation rules in §8.

---

## 7. API contract

### `POST /api/visitors/submit`

**Request:**
```json
{
  "name": "string",
  "role": "string",
  "message": "string",
  "link": "string | null",
  "turnstileToken": "string"
}
```

**Response (200):**
```json
{ "prNumber": 42, "prUrl": "https://github.com/.../pull/42", "previewUrl": null }
```
`previewUrl` is null at submit time; client polls `/api/visitors/status?pr=42`.

**Response (4xx):** `{ "error": "rate_limited" | "invalid" | "captcha_failed" | "moderation_failed", "detail": "..." }`

### `GET /api/visitors/status?pr=<n>`

Returns `{ state: "open" | "merged" | "closed", previewUrl: string | null, mergedAt: string | null }`.

---

## 8. Security checklist

Non-negotiable before going public. Mark `[x]` as completed.

- [ ] **GitHub App** (not PAT), installed only on the portfolio repo
  - Permissions: `contents: write`, `pull-requests: write`, nothing else
  - Private key stored as Vercel env var `GITHUB_APP_PRIVATE_KEY`
- [ ] **App can only write** `content/visitors.json` — enforced in `lib/github.ts` (reject any other path) AND verified by a CI check on visitor PRs
- [ ] **Branch protection on `main`**
  - Require 1 approving review (owner)
  - Require status checks: `ci.yml`, `visitor-pr-guard.yml` (verifies only allowed files changed)
  - Disallow force pushes, disallow deletions
  - Restrict who can push (just owner + the app's bot)
- [ ] **CODEOWNERS** — every path owned by you
- [ ] **Input validation** (zod)
  - name 2..40, role 2..60, message 10..200, link optional + must match allowlist
  - Link allowlist: `github.com`, `linkedin.com`, `<your-domain>` only
  - Strip all HTML, reject Markdown links in message
- [ ] **Profanity filter** — `bad-words` or similar, reject on hit (don't censor silently)
- [ ] **Rate limit** — Upstash Redis, 1 submission/60s and 5/24h per IP
- [ ] **Turnstile** captcha on form (Cloudflare, free)
- [ ] **Stale PR auto-close** — workflow closes visitor PRs idle >7 days
- [ ] **Secrets never logged** — review API route for accidental console.log of token
- [ ] **`/api/visitors/submit` disabled on prod** — env guard, returns 404 if `VERCEL_ENV === 'production'`

---

## 9. Notification — Discord webhook

**Decided:** Discord webhook for v1. Free, instant, no DNS setup. Email via Resend is a possible v2 add.

Flow: GitHub repo webhook → `POST /api/github/webhook` (Next.js route) → verify HMAC signature with `GITHUB_WEBHOOK_SECRET` → format event → POST to `DISCORD_WEBHOOK_URL`.

Events forwarded:
- `pull_request.opened` with label `visitor-submission` → "New visitor card from {name} — {preview URL when ready}"
- `pull_request.closed` (merged=true) → "Merged ✓ — card is now live on prod"
- `pull_request.closed` (merged=false) → "Closed without merging"

Setup (you): create a Discord server (or reuse one), Channel Settings → Integrations → Webhooks → New Webhook → copy URL → paste as Vercel env var.

---

## 10. Ordered task list

Each item is one focused work session. Owner column: **me** = Claude writes code; **you** = manual GitHub/Vercel/Cloudflare setup; **both** = pair.

| #  | Task                                                              | Owner | Depends on |
|----|-------------------------------------------------------------------|-------|------------|
| 1  | Create `staging` branch from `main`, push                         | you   | —          |
| 2  | Vercel: map `staging.<domain>` to `staging` branch                | you   | 1          |
| 3  | Add `.github/CODEOWNERS` + branch protection on `main`            | you   | —          |
| 4  | Add `.github/workflows/ci.yml` (lint+typecheck+build)             | me    | —          |
| 5  | Create GitHub App, install on repo, save credentials              | you   | —          |
| 6  | Cloudflare Turnstile site, save site key + secret                 | you   | —          |
| 7  | Upstash Redis DB, save REST URL + token                           | you   | —          |
| 8  | Add Vercel env vars (App key, Turnstile, Upstash) for staging+prod | you  | 5,6,7      |
| 9  | `lib/visitors-schema.ts` + `content/visitors.json` seed           | me    | —          |
| 10 | `lib/github.ts` (Octokit App auth + branch/commit/PR)             | me    | 9          |
| 11 | `lib/turnstile.ts`, `lib/ratelimit.ts`, `lib/moderate.ts`         | me    | 9          |
| 12 | `app/api/visitors/submit/route.ts`                                | me    | 10,11      |
| 13 | `app/api/visitors/status/route.ts`                                | me    | 10         |
| 14 | `app/visitors/page.tsx` (read JSON, render grid)                  | me    | 9          |
| 15 | `app/visitors/submit-form.tsx` (modal + Turnstile)                | me    | 9          |
| 16 | `.github/workflows/visitor-pr-guard.yml` (only allowed paths)     | me    | —          |
| 17 | `.github/workflows/stale-visitor-prs.yml`                         | me    | —          |
| 18 | Webhook handler + Discord forwarder                               | me    | 5          |
| 19 | Manual end-to-end test on staging (submit → PR → preview → merge) | both  | all above  |
| 20 | Writeup: blog post explaining the architecture                    | you   | 19         |

---

## 11. MLOps-transition hooks (out of scope for v1, captured here so v2 stays cheap)

When you build the MLOps showcase, reuse this same pipeline:

- **Model card submissions** — visitors submit a (model name, task, metrics, link) card → PR → merge.
- **Schema lives in** `content/model-cards.json` with the same submit/PR/merge flow.
- Same `lib/github.ts` (already path-agnostic), new schema file, new page route.
- This proves the GitOps pattern generalizes — exactly the framing that hiring managers care about.

---

## 12. Decisions

Locked 2026-05-11. Revisit if any of these become a problem during build.

- [x] **Domain:** Vercel free subdomains for v1 (`final-portfolio.vercel.app` / `…-git-staging-<user>.vercel.app`). Custom domain is a later swap, no code impact.
- [x] **Notification:** Discord webhook. Simple, free, instant. (See §9.)
- [x] **Prod has `/visitors` page:** yes, read-only. Editable form only renders when `VERCEL_ENV !== 'production'`. Prod is the demo surface where merged cards appear.
- [x] **Moderation:** auto-PR every submission. CMS-like flow — visitor submits → PR opens → owner reviews on GitHub → merge promotes to prod. Spam control comes from rate-limit + Turnstile + profanity filter at submit time, not a queue.

---

## 13. Done criteria for v1

- Visitor on staging can submit a card → PR appears on GitHub → preview URL works → merging deploys to prod.
- All §8 security boxes checked.
- Stale visitor PRs auto-close after 7 days.
- CI fails any visitor PR that touches a file other than `content/visitors.json`.
- Blog post drafted explaining the pattern.
