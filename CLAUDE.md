# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The personal-brand portfolio site for **Yoram Izilov** (DevOps engineer), live at `www.yoram-izilov.com`. It's a SvelteKit app prerendered to a fully static site and served by nginx inside the `portfolio` container. It is one of three repos behind the self-hosted box (`home-server` owns the shared infra; `discord-py` is the bot).

This repo also carries the **build system that produced the site**: a team of Claude Code subagents, two automatic hooks, and a master prompt ([`PORTFOLIO_PROMPT.md`](PORTFOLIO_PROMPT.md)). They are wired into `.claude/` - not a kit to copy elsewhere. When you work here, you work _inside_ that system: plan first, build in vertical slices, let the reviewers push back, and never ship the generic-AI look.

The bar for this site is not "professional." The bar is: a visitor lands, thinks _"I'll remember this,"_ and sends it to someone. Mediocre-but-safe is the only unacceptable outcome.

## Working in this repo

**Stack**

- **SvelteKit 2** + **Svelte 5** in **runes mode** (forced project-wide in `svelte.config.js`; use `$state`/`$props`/`$derived`, not legacy reactive `$:`).
- **`@sveltejs/adapter-static`** - the whole site prerenders to `build/`. There is no server runtime; every route must be prerenderable (`+layout.ts` sets `prerender = true`).
- **TypeScript** (strict), **Vite 8**, **Node 22** (`.nvmrc`).
- **Custom CSS only** (`src/app.css`, a dark "blueprint" theme with CSS custom properties) - no Tailwind, no CSS framework. Fonts: Space Grotesk (display) + JetBrains Mono (mono), self-hosted via `@fontsource-variable`.
- **GSAP** for the bespoke motion (the hero pipeline tween, the project-panel scale-in). Native Svelte transitions + a small `inview` action elsewhere.

**Key files**

```
src/
  app.css                     ← the blueprint theme: colors, type, motion tokens
  routes/
    +layout.svelte            ← <head> meta, OpenGraph, JSON-LD, Footer
    +layout.ts                ← prerender = true
    +page.svelte              ← home: the interactive pipeline hero + project graph
    work/<slug>/+page.svelte  ← one case study per slug
  lib/
    components/               ← PipelineGraph, InteractiveGrid, ProjectPanel, *Diagram, Footer
    data/projects.ts          ← the three featured projects (drives the home graph)
    data/caseStudies.ts       ← case-study metadata (drives each /work page <head>)
nginx.conf                    ← container nginx: JSON logs, OTel spans, caching, /status.json
status-exporter/              ← stdlib-only Python sidecar that writes status.json
deploy/nginx-reverse-proxy.conf ← sample HOST nginx server blocks (www routing)
PORTFOLIO_PROMPT.md           ← the master build prompt
```

Adding a project = add an entry to `data/projects.ts`. Adding a case study = a `routes/work/<slug>/+page.svelte` plus an entry in `data/caseStudies.ts`.

**Run / build / deploy**

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # prerender → build/
npm run preview    # serve the built site
npm run lint       # prettier --check . && eslint .
npm run check      # svelte-check (typecheck)
npm run format     # prettier --write .

docker compose up -d --build   # portfolio + status-exporter (needs the two external networks)
```

The `portfolio` container joins **both** external networks: `nginx_nginx_network` (host reverse proxy → public routing) and `monitoring_monitoring` (so nginx can ship spans to `otel-collector:4317`). Both are created by other repos - see `home-server`. Deployment is the Jenkins pipeline in `Jenkinsfile` (test → build → smoke → deploy on `main`). The README's "Observability" and "Deployment" sections have the full picture.

## The build system (agents · hooks · prompt)

A team of subagents lives in `.claude/agents/`; the master prompt that drives them is `PORTFOLIO_PROMPT.md`. Use them - don't do everything in one head:

| Agent                | Role                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `orchestrator`       | Tech lead / coordinator. Runs the plan, sequences work, holds the concept line, calls done. Has the `Task` tool to delegate. |
| `content-strategist` | Step 0: who the user is and what story to tell. Never invents facts.                                                         |
| `frontend-engineer`  | Scaffolds and builds.                                                                                                        |
| `design-critic`      | Brutal craft & distinctiveness review (read-only).                                                                           |
| `qa-engineer`        | Tries to break it across states/devices; verifies the container builds & serves.                                             |
| `a11y-perf`          | Accessibility + performance gates.                                                                                           |

The `tools:` line in each agent's frontmatter limits what it can do (reviewers are read-only; only the engineer writes; only the orchestrator delegates).

Two hooks run automatically after every edit (`.claude/settings.json`, `PostToolUse` on `Write|Edit|MultiEdit`):

- **`no-generic-ai.sh`** - _non-blocking_ nudge (exit 0 always). Warns on AI design tells: purple/indigo gradients, white glassmorphism, the cookie-cutter `0 4px 6px rgba(0,0,0,.1)` shadow, default Inter, leftover lorem ipsum.
- **`quality-gate.sh`** - _blocking_ (exit 2). Runs `lint`, `typecheck`, `build`; fails the edit if any fail. Auto-detects the package manager and skips scripts you haven't defined. Skip the slow build with `QUALITY_GATE_SKIP_BUILD=1`.

To run the build from scratch: point Claude Code at `PORTFOLIO_PROMPT.md` and have the orchestrator drive from Step 0. It will pause and ask **you** to confirm the context brief (it won't invent achievements), pick a creative concept, and pick a framework.

## Non-Negotiables (the generic-AI blocklist)

None of these unless deliberately chosen _and_ justified in writing against the concept:

- Purple→blue / indigo gradients; mesh gradients, decorative blobs, floating 3D shapes.
- Glassmorphism (frosted white blur cards); the `0 4px 6px rgba(0,0,0,.1)` shadow on everything.
- Default Inter/Geist on white with a centered hero + three feature cards.
- Buzzword copy ("passionate developer who loves clean code"); emoji-as-iconography in a serious layout.
- Motion that's just "fade-up on scroll" on every element.

Honor `prefers-reduced-motion`, real semantics, keyboard paths, and contrast (WCAG 2.1 AA) from the start - not as a cleanup pass. Target Lighthouse performance ≥ 90.

## Hard constraints

- **Public-safe content only.** This is a public site. Feature only work that is cleared to be public - currently the three projects in `data/projects.ts` (`discord-bot`, `home-server`, `this-site`).
- **Confidential client work stays off the site.** Some past work must never be publicly identifiable - not by name, logo, or any identifying detail, anywhere in this repo or the rendered site. When in doubt, leave it out and confirm with the user.
- **Never invent facts** about the user - titles, dates, metrics, employers. If it isn't confirmed, leave it out.

## Git guidelines

- **Branch + PR, never push to `main`.** Branches: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. Merging to `main` triggers the Jenkins deploy.
- **Conventional-commit subjects** `<type>(<scope>): <summary in imperative>` to match the sibling repos. Types: `feat · fix · refactor · chore · docs · style`. Scopes track the area (`home`, `work`, `components`, `nginx`, `docker`, `ci`, `docs`, …).
- **CI is the gate.** The Docker `test` stage runs `lint` + `typecheck` on every build, so `prettier --check .` must pass - run `npm run format` before pushing. Keep one logical change per commit.
