# Portfolio Build Kit (for Claude Code)

A subagent team + hooks + a master prompt for building a **personal-brand portfolio that people remember** — with Claude Code doing the work and refusing to ship the generic AI look.

## What's in here

```
portfolio-kit/
├── PORTFOLIO_PROMPT.md          ← the master prompt; start here
└── .claude/
    ├── settings.json            ← wires the hooks into PostToolUse
    ├── agents/
    │   ├── orchestrator.md       ← tech lead / coordinator (has Task tool)
    │   ├── content-strategist.md ← Step 0: who you are, what to feature
    │   ├── frontend-engineer.md  ← scaffolds & builds
    │   ├── design-critic.md      ← brutal craft & "wow" review
    │   ├── qa-engineer.md         ← tries to break it
    │   └── a11y-perf.md           ← accessibility + performance gates
    └── hooks/
        ├── no-generic-ai.sh       ← non-blocking nudge on AI design tells
        └── quality-gate.sh        ← blocking lint/typecheck/build gate
```

## Setup

1. Copy the `.claude/` folder and `PORTFOLIO_PROMPT.md` into your project root.
2. Make the hooks executable:
   ```bash
   chmod +x .claude/hooks/*.sh
   ```
3. Open Claude Code in that directory. The agents in `.claude/agents/` and the hooks in `.claude/settings.json` are picked up automatically.

## How to run it

In Claude Code, point it at the prompt:

> Read PORTFOLIO_PROMPT.md and use the orchestrator agent to drive the build. Start with Step 0.

The orchestrator will pull in the other agents at the right moments. It will pause and ask **you** to:

- confirm the context brief (it won't invent facts about you),
- pick a creative concept (it proposes 2–3),
- pick a framework (it proposes exactly 2).

## The hooks

- **`no-generic-ai.sh`** — runs after every edit, _warns_ (never blocks) when it spots purple/indigo gradients, white glassmorphism, the cookie-cutter card shadow, default Inter, or leftover lorem ipsum. Exit 0 always.
- **`quality-gate.sh`** — runs after edits to source files, _blocks_ (exit 2) if `lint`, `typecheck`, or `build` fail. It auto-detects pnpm/yarn/npm and skips any script you haven't defined, so wire those scripts up during scaffolding. Skip the slow build step with `QUALITY_GATE_SKIP_BUILD=1`.

## Notes

- The `tools:` line in each agent's frontmatter limits what that agent can do (e.g. reviewers are read-only; only the engineer can Write/Edit; only the orchestrator has `Task` to delegate).
- The hooks assume a Node project. If you use a different toolchain, edit `quality-gate.sh` accordingly.
- `$CLAUDE_PROJECT_DIR` in `settings.json` resolves to your project root at runtime.
