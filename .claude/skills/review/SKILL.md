---
name: review
description: Reviews current code changes against all project guidelines (design system components, Tailwind, Next.js, TypeScript, accessibility, forms, performance, code smells) and fixes violations. Use when the user asks to review, check, or audit their changes.
disable-model-invocation: true
---

Review the current code changes against every project guideline and fix all violations.

## Steps

### 1. Get the diff

Run `git diff HEAD` to see all staged and unstaged changes. If the user provided arguments, treat them as a path filter: `git diff HEAD -- $ARGUMENTS`.

If there is no diff output, also try `git diff --cached` and `git diff` separately. If still empty, tell the user there are no changes to review and stop.

### 2. Read the checklist

Read [review-checklist.md](review-checklist.md). This contains every rule to check, with detection patterns and fix instructions.

### 3. Read each changed file in full

For every file that appears in the diff, read the entire file (not just the diff hunks). You need full context to make correct edits and add imports.

### 4. Phase 1 — Fix pattern violations

Walk through every **pattern rule** in the checklist (Design System Components through Performance), one by one. For each rule, scan every changed file for violations in the changed lines.

**When you find a violation:**

- If the correct fix is unambiguous (one clear right answer given the rule), **fix it immediately** by editing the file.
- If the fix requires a judgment call or has multiple plausible options, **ask the user** before making a change. Describe the violation and the options, then wait for their answer.

Be explicit and methodical: check each rule in order. Do not skip rules or batch them.

When fixing a bare element violation (Cx rules), always:

- Replace the element with the correct component
- Add the import statement if not already present
- Adapt props (e.g., convert `<a href>` to `<TextLink href>`, convert `<select>` children to `options` prop)

When fixing a Tailwind violation (Tx rules), always:

- Show the extracted const or `cn()` call in the fix
- Add the `cn` import if not already present

### 4b. Phase 2 — Code smells

For each changed file, read the **full file** and check for the code smell rules (Ex rules). These are judgment calls.

- Fix violations where the right solution is obvious and self-contained.
- For anything that requires design decisions (naming, restructuring, splitting files), ask the user instead of guessing.
- Note genuinely borderline cases as "Consider: [suggestion]" in the summary rather than changing them.

### 5. Run linters and fix any remaining issues

After all checklist fixes are applied, run these commands and fix any failures:

```bash
pnpm lint:strict    # ESLint with --max-warnings=0
pnpm typecheck      # TypeScript type checking
npx prettier --check "src/**/*.{ts,tsx,css,json}"
```

If any command reports errors or warnings, fix them and re-run until all three pass cleanly. For Prettier issues, run `npx prettier --write` on the affected files.

### 6. Report what was fixed

After everything is clean, output a summary:

```
### Changes made

**[filename]**
- C1 — Replaced bare `<button>` with `<Button>` (line 42)
- T2 — Extracted 9-utility className to `cardStyles` const (line 58)
- E4 — Renamed `data` to `pendingEvents` (line 15)

**[filename]**
- No issues found.

### Consider simplifying

**[filename]**
- E1 — Similar validation block appears in both createEvent and updateEvent; consider extracting
- E5 — Config options object only has one caller; consider inlining

### Linter results
- ESLint: passed (0 errors, 0 warnings)
- TypeScript: passed
- Prettier: passed

### Summary
- Fixed: N issues across N files
- Suggestions: N items to consider
- Files reviewed with no issues: N
```

If nothing was found at all, say: "No violations found. Linters pass. Changes look good."
