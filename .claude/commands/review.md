Review the current code changes against every project guideline and fix all violations.

## Steps

### 1. Get the diff

Run `git diff HEAD` to see all staged and unstaged changes. If the user provided arguments, treat them as a path filter: `git diff HEAD -- $ARGUMENTS`.

If there is no diff output, also try `git diff --cached` and `git diff` separately. If still empty, tell the user there are no changes to review and stop.

### 2. Read the checklist

Read `.claude/review-checklist.md`. This contains every rule to check, with detection patterns and fix instructions.

### 3. Read each changed file in full

For every file that appears in the diff, read the entire file (not just the diff hunks). You need full context to make correct edits and add imports.

### 4. Phase 1 — Fix pattern violations (C1–P1)

Walk through every **pattern rule** (C1 through P1) in the checklist, one by one. For each rule, scan every changed file for violations in the changed lines. When you find a violation, **fix it immediately** by editing the file.

Be explicit and methodical: check C1, then C2, then C3, and so on through P1. Do not skip rules or batch them.

When fixing a bare element violation (C1–C4), always:
- Replace the element with the correct component
- Add the import statement if not already present
- Adapt props (e.g., convert `<a href>` to `<TextLink href>`, convert `<select>` children to `options` prop)

When fixing a Tailwind violation (T1–T6), always:
- Show the extracted const or `cn()` call in the fix
- Add the `cn` import if not already present

### 4b. Phase 2 — Evaluate simplicity rules (E1–E8)

For each changed file, read the **full file** (not just changed lines) and evaluate the simplicity/maintainability rules E1 through E8.

These are judgment calls, not pattern matches. For each rule, ask the question and decide:
- **Clear violation** → fix it immediately (same as pattern rules)
- **Borderline** → do not fix, but note it in the summary as "Consider: [suggestion]"
- **No issue** → move on

Do not over-apply these rules. The goal is catching genuinely problematic complexity, not nitpicking. A 160-line component that does one thing well is fine. A helper used twice is borderline. Use good judgment.

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
- E6 — Renamed `data` to `pendingEvents` (line 15)

**[filename]**
- No issues found.

### Consider simplifying

**[filename]**
- E2 — EventForm component is 180 lines with both validation and display logic; consider splitting
- E3 — AdminEventCard has 6 props; consider whether this should be two components

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
