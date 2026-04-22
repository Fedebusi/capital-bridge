# CapitalBridge — Agent Rules

> Read at the start of every session alongside `CLAUDE.md`. This file is rules.
> `CLAUDE.md` is state. `docs/ROADMAP.md` is backlog. `docs/CHANGELOG.md` is
> history — do not read unless explicitly needed.

## Session discipline

Before closing a session where changes shipped:

1. Update `CLAUDE.md` → prune "What's in flight" if anything landed
2. Append a one-paragraph entry to `docs/CHANGELOG.md` with the commit hash
3. Move completed items out of `docs/ROADMAP.md`; move any new commitments in
4. Do **not** invent "next steps" and add them to `CLAUDE.md`. If they belong, they go in `docs/ROADMAP.md` with a gate (Now / Next / Later). Vague ideas don't belong anywhere.

## Commit + branch conventions

- Conventional commits: `feat:`, `fix:`, `polish:`, `chore:`, `docs:`
- Never push to `main` directly
- Branch prefixes: `feat/*`, `fix/*`, `polish/*`, `chore/*`, `docs/*`, `finance/*`
- One PR per logical unit; do not pile unrelated work on a single branch

## Do not touch without approval

See `CLAUDE.md` → "Do not touch without approval".

## Design tokens

- Accent: indigo/violet `hsl(245 75% 65%)`
- Cards: `rounded-2xl bg-slate-50 p-6` (borderless, soft background)
- Buttons: `rounded-full` primary; `rounded-full bg-slate-50` secondary
- Typography: `text-4xl font-bold tracking-tight` for h1, `text-base` for subtitles
- Spacing: `space-y-8` between sections, `gap-5` between cards

## Sub-agent roster (.claude/agents/)

Use these when the task naturally fits their scope **and** warrants its own
branch + PR. For a multi-item session on a single branch (like most
launch-prep work), invoke the main assistant directly with the full context
— don't fragment.

| Agent | Use when | Skip when |
|-------|----------|-----------|
| `feature-builder` | End-to-end new feature on its own branch | You're doing multiple small things in one session |
| `bug-fixer` | Isolated bug with a reproduction | You're already fixing it inline |
| `finance-auditor` | Reviewing or changing money/rate/ratio math | Non-financial UI polish |
| `design` | Visual consistency, empty states, microcopy, responsive | Content-heavy feature work |
| `doc-writer` | User-facing guides in `docs/guides/` | CLAUDE.md / ROADMAP — those are session discipline |
| `reviewer` | Structured review of an open PR | Routine changes |

Note: the three design agents (`ux-designer`, `ui-designer`, `ux-polisher`) have been consolidated into a single `design` agent. `bug-fixer` handles what `bug-fixer` was; everything else is as listed above.

## When to use Explore / general-purpose instead

- Open-ended research across the codebase (>3 files)
- "Where does X live?" questions
- Codebase audits before planning a change

## Anti-patterns

- **Infinite backlog in `CLAUDE.md`.** Any "P1 remaining / P2 pending" goes in `docs/ROADMAP.md`. Not here.
- **Session history in `CLAUDE.md`.** That's what `docs/CHANGELOG.md` is for.
- **"Also, future work:" in commit messages.** If it's not this commit, it's a ROADMAP item.
- **Sub-agent sprawl.** Don't invoke 5 agents in parallel on a single-branch task. Overhead > value.
- **Shimming around auth / RLS / migrations** without human approval. Ask.
