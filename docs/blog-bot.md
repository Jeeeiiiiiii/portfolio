# Blog bot — draft posts from Discord

Type `/blog write` (your own thoughts) or `/blog new url:<article> note:<your angle>` in Discord from anywhere. A
GitHub Action has Claude write the post as a PR, Discord gets the preview link,
and `/blog publish` merges it. Nothing is live until the PR is merged.

```
Discord /blog ──► Vercel /api/discord/interactions          (answers in < 3 s)
                    verify Ed25519 signature · owner-only
                    └─► repository_dispatch "blog-draft"
                                   │
                    .github/workflows/blog-draft.yml          (3–6 min)
                    fetch article (r.jina.ai) → Claude writes content/blog/<slug>.md
                    → exactly-one-file check → lib/blog.test.ts → branch blog/<slug> → PR
                    → wait for the Vercel preview → edit the Discord reply
                                   │
Discord /blog publish pr:N ──► merge (squash) ──► production deploy
```

## Commands

| Command | What it does |
|---|---|
| `/blog write` | Opens a text box (up to 4,000 characters) for your own thoughts — paste or dictate, rough is fine. Claude does a light edit: grammar, headings, code blocks; your ideas and sentences stay, nothing is added. |
| `/blog new url:<link> note:<text>` | Drafts a post about an article. The note can be one rough sentence, or empty. |
| `/blog revise pr:<n> note:<text>` | Rewrites the draft per your note and pushes to the same PR. |
| `/blog publish pr:<n>` | Squash-merges the draft. Refuses anything not on a `blog/` branch, and GitHub refuses if checks fail. |
| `/blog list` | Open drafts. |

Only the Discord user in `DISCORD_OWNER_ID` can run any of them.

## Guard rails

- **Claude can only write files.** The workflow runs Claude Code with Read/Write/Edit/Glob/Grep;
  no shell, no network. The article is fetched beforehand and the prompt
  (`.github/blog-bot/prompt.md`) treats it as untrusted text.
- **Exactly one file.** After Claude runs, the workflow fails unless the only change is one
  `content/blog/<slug>.md` (and, for revise, the same file as before). `blog-pr-guard.yml`
  enforces the same rule on every `blog/*` PR.
- **Valid or nothing.** `lib/blog.test.ts` parses every post; bad frontmatter fails the run.
- **No shell injection.** Discord input reaches workflow scripts only as env vars.
- **The Discord token never hits the log.** It is read from the event file and masked.
- **The public-content rules** (no employer, client, hostname or ticket names) are in the prompt,
  and you read the preview before publishing.

## Setup

Do this after the branch is merged: `repository_dispatch` only runs workflows that exist on
`main`, and Discord needs the route on the production URL.

### 1. GitHub App

The visitor playground's App works (see `.env.example`). It needs, on this repo only:
**Contents: write**, **Pull requests: write**, **Deployments: read**.

- Vercel → Production env: `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`.
- GitHub → repo → Settings → Secrets and variables → Actions:
  - variable `BLOG_APP_ID` = the App ID
  - secret `BLOG_APP_PRIVATE_KEY` = the PEM

  Without these the workflow falls back to `GITHUB_TOKEN`, which works but means CI and the PR
  guard don't run on drafts (GitHub doesn't trigger workflows from `GITHUB_TOKEN` pushes).

### 2. Claude

Actions secret `CLAUDE_CODE_OAUTH_TOKEN`: run `claude setup-token` locally (uses your Claude
subscription). Or set `ANTHROPIC_API_KEY` instead.

### 3. Discord application

1. <https://discord.com/developers/applications> → New Application.
2. General Information → copy **Application ID** and **Public Key**.
3. Bot → Reset Token → copy it (only used once, to register the command; don't store it on Vercel).
4. OAuth2 → URL Generator → scope `applications.commands` → open the URL → add it to your server.
5. Discord settings → Advanced → Developer Mode on → right-click yourself → **Copy User ID**.

Vercel → Production env: `DISCORD_PUBLIC_KEY`, `DISCORD_OWNER_ID`. Redeploy.

### 4. Register the command and the endpoint

```bash
DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... DISCORD_GUILD_ID=<your server id> \
  node scripts/register-discord-commands.mjs
```

With a guild ID it shows up instantly; without one it's global and takes up to an hour.

Then General Information → **Interactions Endpoint URL** =
`https://<production domain>/api/discord/interactions` → Save. Discord sends a signed PING and
a deliberately bad one; saving only succeeds if the route accepts the first and rejects the second.

### 5. Optional

- Actions secret `DISCORD_WEBHOOK_URL` (channel → Integrations → Webhooks): used if a run outlives
  the 15-minute interaction token, so a slow draft still reaches you.
- Vercel previews are behind Vercel Authentication by default; stay logged in to Vercel on your
  phone, or relax Deployment Protection for previews.

## Testing without Discord

Actions → **Blog draft** → Run workflow → mode `new`, a URL, a note. It opens the PR the same way
and prints the message it would have sent.
