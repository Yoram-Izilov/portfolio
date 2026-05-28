# PORTFOLIO_PROMPT.md — Build a portfolio nobody forgets

You are building a **personal-brand portfolio / landing page**. The bar is not "professional." The bar is: a visitor lands, says *"I'll remember this,"* and sends it to someone. Anything that merely "looks like a nice template" is a failure.

You have a team of subagents (`.claude/agents/`). Use them. Don't do everything in one head:
- **orchestrator** — runs the plan, sequences the work, holds the concept line, calls done.
- **content-strategist** — figures out who the user is and what story to tell (Step 0).
- **frontend-engineer** — scaffolds and builds.
- **design-critic** — brutally honest craft & distinctiveness review.
- **qa-engineer** — tries to break it across states/devices.
- **a11y-perf** — accessibility + performance gates.

Two hooks run automatically on every edit (`.claude/settings.json`):
- `no-generic-ai.sh` — warns (non-blocking) on AI design tells.
- `quality-gate.sh` — blocks (exit 2) on failing lint/typecheck/build, so wire those scripts up early.

---

## Creative direction: BOLD
The user has explicitly asked for a brave creative direction — *weird is good, they'll rein it in.* Do not pre-compromise toward recruiter-safe. Propose the daring version first. When in doubt, choose the more memorable option and let the user pull it back.

---

## Step 0 — Context brief (content-strategist leads, BEFORE any design)
Mine everything available locally first: `CLAUDE.md`, repos in this workspace, READMEs, commit history, any resume/bio files. Build a brief covering: who the user is, what they've built, their stack, strengths, and taste.

**Then present it back and ask the user to fill gaps. Never invent achievements, titles, dates, or metrics.** Specifically confirm:
- Name, role/identity, and the one-line "who is this" takeaway.
- The 3–5 projects worth featuring (and which one leads).
- Real outcomes/metrics per project — only the ones that are true.
- Links: GitHub, live demos, socials, contact/email.
- Any assets: logo, headshot, screenshots, brand colors, existing domain.
- Tone the user wants to project.

Do not proceed to design until the brief is confirmed.

## Step 1 — Concept (orchestrator + content-strategist + design-critic)
Propose **2–3 distinct creative concepts**, each with: a one-line premise, the "memorable moment," the typographic & color direction, the motion idea, and why it fits *this* person. Let the user pick one. Then **defend it** — every later decision ladders up to it.

## Step 2 — Framework (frontend-engineer proposes, USER chooses)
Propose **exactly two** framework options with honest tradeoffs for *this* concept, then stop and let the user choose. Suggested pairing for a bold, animation-forward personal site:

- **Option A — Astro + vanilla/Web Components (+ GSAP or Motion One).** Ships almost zero JS by default → effortless Lighthouse ≥ 90, total control over custom motion, no framework aesthetic leaking in. Best when the wow is bespoke animation and raw craft. Tradeoff: you hand-build interactive bits.
- **Option B — SvelteKit (+ native transitions / GSAP).** Tiny runtime, first-class built-in transitions/springs, compiled and fast, great DX for richly interactive sections. Best when there's lots of stateful interactivity. Tradeoff: slightly more shipped JS than Astro, a mild framework convention footprint.

(If the user prefers React's ecosystem, offer **Next.js** as a substitute for B — but note it's the heaviest of the three and the easiest to make look generic, so it needs the most discipline.)

Wait for the choice. Then scaffold cleanly and **immediately wire up `lint`, `typecheck`, and `build` npm scripts** so `quality-gate.sh` works.

## Step 3 — Build (frontend-engineer, reviewed continuously)
- Build in **vertical slices**: get ONE real section fully done (hero + the memorable moment first) so reviewers can react early.
- After each meaningful slice, hand to **design-critic** and **qa-engineer**. Address findings; don't dismiss them.
- Run **a11y-perf** before polish is called done.
- Honor `prefers-reduced-motion`, real semantics, keyboard paths, and contrast from the start — not as a cleanup pass.

## Step 4 — Containerize & deploy (frontend-engineer, verified by qa-engineer)
- Multi-stage **Dockerfile** → slim runtime (static server or nginx).
- **docker-compose.yml** with a documented exposed port.
- A sample **nginx `location` reverse-proxy block**, and verify asset/base paths work behind a subpath/proxy.
- qa-engineer must confirm `docker-compose up` works from clean and serves on the documented port.

---

## Non-Negotiables (the generic-AI blocklist)
None of these unless deliberately chosen AND justified in writing against the concept:
- Purple→blue / indigo gradients.
- Glassmorphism (frosted white blur cards).
- Default Inter / Geist on white with a centered hero + three feature cards.
- Generic blobs, mesh gradients, floating 3D shapes for decoration's sake.
- The 0 4px 6px rgba(0,0,0,.1) card shadow on everything.
- Buzzword copy ("passionate developer who loves clean code").
- Emoji-as-iconography in a serious layout.
- Motion that's just "fade-up on scroll" on every element.

## Deliverables Checklist (orchestrator owns; all must be checked)
- [ ] Context brief confirmed by the user (no fabricated facts).
- [ ] One creative concept chosen and held throughout.
- [ ] Framework chosen by the user; project scaffolded with lint/typecheck/build scripts.
- [ ] A named **"memorable moment"** that earns the screenshot/share.
- [ ] Responsive across 320 → ultrawide; real interaction states.
- [ ] `prefers-reduced-motion` honored; keyboard-navigable; WCAG 2.1 AA.
- [ ] Lighthouse performance ≥ 90 (or a documented, justified exception).
- [ ] design-critic signed off (not a 7/10 "looks professional").
- [ ] qa-engineer signed off: zero 🔴 blockers, container builds & serves.
- [ ] Dockerfile + docker-compose.yml + nginx proxy block, verified.
- [ ] README with run/build/deploy instructions.

## Definition of done
Every box checked, every Non-Negotiable holds, design-critic and qa-engineer have signed off, and there is a named memorable moment. **If any agent flags a blocker, it is not done.** Mediocre-but-safe is the only unacceptable outcome.
