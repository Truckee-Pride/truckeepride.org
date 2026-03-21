---
name: pr
description: Generates a GitHub PR link with pre-populated title and description for the current branch. Use when the user asks to open, create, or submit a PR.
disable-model-invocation: true
---

Generate a GitHub "compare" link with pre-populated title and body for the current branch.

## Steps

### 1. Gather context

Run in parallel:

- `git log main..HEAD --oneline` — commits on this branch
- `git diff main...HEAD --stat` — changed files summary
- `git diff main...HEAD` — full diff vs main
- `git remote get-url origin` — to extract the GitHub org/repo

If `main` doesn't work, try `master`.

### 2. Extract the GitHub repo path

Parse the remote URL to get the `owner/repo` path. Handle both formats:

- `https://github.com/Owner/repo.git` → `Owner/repo`
- `git@github.com:Owner/repo.git` → `Owner/repo`

### 3. Write the PR title and body

**Title:** imperative verb, ≤60 chars, no period. Describe _what_ changes, not _why_. Examples:

- "Add image upload to event form"
- "Fix date overflow on mobile event cards"

**Body:**

```
## Summary

1-3 bullets describing the change. Lead with the user-facing impact, not implementation details.

## Test plan

- [ ] If `package.json` changed: `pnpm install`
- [ ] If schema files changed: `pnpm exec drizzle-kit generate && pnpm exec drizzle-kit migrate`
- [ ] [list the specific pages/flows a reviewer should manually test]
- [ ] [any edge cases worth testing]

https://claude.ai/code/<session-id>
```

Keep the Test plan checklist specific to _this_ change. Only include the pnpm install and migration steps if the diff actually touches `package.json` or schema files.

### 4. Generate the link

Get the current branch name with `git branch --show-current`.

Use Python to URL-encode the title and body into query parameters on a GitHub compare URL:

```bash
python3 -c "
import urllib.parse
title = '''<PR TITLE>'''
body = '''<PR BODY>'''
base_url = 'https://github.com/<owner>/<repo>/compare/main...<branch>'
params = urllib.parse.urlencode({'expand': 1, 'title': title, 'body': body})
print(f'{base_url}?{params}')
"
```

### 5. Output

Display the link as a clickable markdown link:

```
[Create PR: <title>](<full URL>)
```

Do NOT use `gh pr create`. Do NOT push to the remote. Just output the link.
