---
name: pr
description: Creates a pull request for the current branch with structured What/Why/Verification body. Use when the user asks to open, create, or submit a PR.
disable-model-invocation: true
---

Open a pull request for the current branch.

## Steps

### 1. Gather context

Run in parallel:

- `git log main..HEAD --oneline` — commits on this branch
- `git diff main...HEAD` — full diff vs main

### 2. Write the PR

**Title:** imperative verb, ≤60 chars, no period. Describe _what_ changes, not _why_. Examples:

- "Add image upload to event form"
- "Fix date overflow on mobile event cards"

**Body:**

```
## What

1–3 bullets describing the change. Lead with the user-facing impact, not implementation details.

## Why

One sentence. The motivation or ticket context. Skip if obvious from the title.

## Verification

- [ ] If `package.json` changed: `pnpm install`
- [ ] If schema files changed: `pnpm exec dotenv -e .env.local -- npx drizzle-kit generate && pnpm exec dotenv -e .env.local -- npx drizzle-kit migrate`
- [ ] [list the specific pages/flows a reviewer should manually test — e.g. "Submit a new event and confirm it appears in the pending queue"]
- [ ] [any edge cases worth testing — e.g. "Try submitting with a missing required field"]
```

Keep the Verification checklist specific to _this_ change. Only include the pnpm install and migration steps if the diff actually touches `package.json` or schema files.

### 3. Open the PR

Push the branch if needed, then run:

```bash
gh pr create --title "..." --body "$(cat <<'EOF'
...
EOF
)"
```

Return the PR URL.
