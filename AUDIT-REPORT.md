# Claude Code Configuration Audit — Truckee Pride

**Date:** 2026-03-21
**Scope:** CLAUDE.md, `.claude/skills/`, `.claude/settings.json`, hooks

---

## 1. Structure & Scope

### CLAUDE.md Length
**240 lines — 3x over the ~80 line target.** This is the single biggest structural issue. Much of what's in CLAUDE.md is duplicated in skills or is generic knowledge Claude already has.

### Skills Directory Structure
Skills are correctly placed in `.claude/skills/<name>/SKILL.md`. All 7 skills have valid YAML frontmatter with `name` and `description`. The `review` skill includes a supplementary `review-checklist.md` — good pattern.

### Missing Configuration
**No `.claude/settings.json` exists.** This means zero hooks are configured — no auto-formatting, no branch protection, no automation.

---

## 🔴 Critical (fix now)

### C1. No `dangerouslySetInnerHTML` rule in review checklist

The review checklist covers auth (A1, A2) but has no rule for XSS via `dangerouslySetInnerHTML`. This is a OWASP Top 10 gap.

**Fix:** Add to `review-checklist.md` after rule A2:

```markdown
### A3 — No dangerouslySetInnerHTML without sanitization

Look for: `dangerouslySetInnerHTML` in JSX
Fix: Remove it entirely and use React's built-in escaping. If raw HTML is
truly required (e.g., rendering Markdown output), sanitize with DOMPurify
before passing to `dangerouslySetInnerHTML`.
```

### C2. No rule for secrets in `NEXT_PUBLIC_` env vars

Server secrets exposed via `NEXT_PUBLIC_` prefix are shipped to the browser. Neither CLAUDE.md nor any skill flags this.

**Fix:** Add to `review-checklist.md` after A3:

```markdown
### A4 — No secrets in NEXT_PUBLIC_ env vars

Look for: `NEXT_PUBLIC_` env vars containing API keys, database URLs,
or auth secrets — either in `.env*` files or `process.env.NEXT_PUBLIC_*`
references to values that should be server-only.
Fix: Remove the `NEXT_PUBLIC_` prefix. Use the variable only in Server
Components or Server Actions.
```

### C3. No rule for force-unwrapped env vars

`process.env.FOO!` (non-null assertion) in server code will crash at runtime if the var is missing.

**Fix:** Add to `review-checklist.md`:

```markdown
### A5 — No force-unwrapped env vars

Look for: `process.env.VARIABLE_NAME!` (non-null assertion on env vars)
Fix: Add a runtime check or use a validated env schema. Example:
`const dbUrl = process.env.DATABASE_URL ?? ''` with an early error if empty.
```

### C4. No SQL injection / string interpolation rule for Drizzle

The data-layer skill mentions "prefer `db.query.*`" but never explicitly bans string interpolation in SQL.

**Fix:** Add to `review-checklist.md` after D2:

```markdown
### D3 — No string interpolation in SQL

Look for: Template literals building SQL strings with `${variable}` that
bypass Drizzle's parameterized query builders.
Fix: Use Drizzle's query builder API or `sql.placeholder()` for dynamic values.
```

---

## 🟡 Important (high ROI)

### I1. CLAUDE.md is bloated — 240 lines, should be ~80

Large sections duplicate what skills already cover.

**Fix:** Remove/shrink these sections from CLAUDE.md:

| Section to remove/shrink | Already covered by |
|---|---|
| "Tailwind CSS Rules" (~20 lines) | `tailwind` skill |
| "Admin Table Styles" (full code example) | `review` checklist rule T7 |
| "Component Library" (full catalog) | `components` skill |
| "Code Style > TypeScript" type inference | `data-layer` skill + review checklist TS2 |
| "Common Commands" (standard ones) | `package.json` scripts |

Replace each with a one-line pointer to the relevant skill.

### I2. No `.claude/settings.json` — zero hooks configured

**Fix:** Create `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|NotebookEdit",
        "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null; true"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE 'git (push|commit).*main\\b'; then echo 'BLOCKED: Do not push/commit directly to main.' >&2; exit 1; fi"
      }
    ]
  }
}
```

### I3. `review` skill missing `context: fork`

The review skill is expensive (reads every changed file, runs 3 linters). Should run in a subagent.

**Fix:** Add `context: fork` to `review/SKILL.md` frontmatter.

### I4. `review` skill missing a forcing-function checklist

No final gate to confirm all categories were checked.

**Fix:** Add a pre-report checklist confirming all 11 categories (C, T, N, TS, S, A, D, A11Y, F, P, E) were reviewed.

### I5. `review` checklist missing stack-specific footguns

Missing rules:
- **D4** — Drizzle N+1 queries (db calls inside loops)
- **A6** — Auth check uses client-supplied userId instead of `auth()`
- **N6** — Hydration mismatch sources (`Date.now()`, `Math.random()`, `window.*` in Server Components)

### I6. `data-layer` skill description not trigger-rich enough

Current description won't trigger for "add a column" or "write a query."

**Fix:** Add action verbs: "adding columns, writing queries, changing schema, creating migrations"

### I7. Missing `prettier-plugin-tailwindcss`

`.prettierrc` has `plugins: []` but the Tailwind skill references "Prettier Tailwind plugin sort order." Class ordering is unenforced.

**Fix:** `pnpm add -D prettier-plugin-tailwindcss` and update `.prettierrc`.

---

## 🟢 Quick Wins (polish)

### Q1. `pr` skill — add `context: fork`

Moderate context usage; safe to offload to subagent.

### Q2. `rebase` skill description too terse

Add trigger words: "sync with main", "fix migration conflicts", "merge branches."

### Q3. `components` skill — add action-verb triggers

Append: `Loaded when building pages, adding buttons/links/inputs, creating forms.`

### Q4. Review checklist TS1 duplicates ESLint

Add note: "(ESLint also catches this — only flag if suppressed with a disable comment)"

### Q5. `forms` skill — add "edit" and "update" triggers

Users say "update the form" — current description won't trigger reliably.

### Q6. CLAUDE.md "Common Commands" is low-value

Shrink to only non-obvious commands (Drizzle with dotenv).

---

## Summary

| Priority | Count | Key themes |
|---|---|---|
| 🔴 Critical | 4 | Missing security rules (XSS, env secrets, SQL injection, env non-null assertion) |
| 🟡 Important | 7 | CLAUDE.md bloat, no hooks, review skill gaps, skill trigger descriptions |
| 🟢 Quick Wins | 6 | `context: fork`, description wording, dedup with ESLint |

**Top 3 actions by impact:**
1. Add the 4 missing security rules to the review checklist
2. Create `.claude/settings.json` with auto-format and main-branch-protection hooks
3. Trim CLAUDE.md by ~50% by pointing to skills instead of duplicating them
