Rebase the current branch onto main and fix any migration conflicts.

## Steps

### 1. Rebase onto main

Run `git rebase main`. If there are conflicts:

- Show the conflicting files
- For each conflict, read the file and resolve it, preferring the current branch's intent
- After resolving, run `git add <file>` and `git rebase --continue`
- If a conflict is ambiguous, ask the user before resolving

### 2. Fix Drizzle migration timestamps

After the rebase completes check `drizzle/meta/_journal.json` for out-of-order timestamps.

Find the merge base with main: `git merge-base HEAD main`

Then find which migration SQL files are new on our branch (not in main):
`git diff --name-only <merge-base> HEAD -- drizzle/*.sql`

Extract the migration tags from the new filenames (e.g., `0010_messy_fantastic_four` from `drizzle/0010_messy_fantastic_four.sql`).

Read `drizzle/meta/_journal.json`. For each entry whose `tag` matches a new-on-branch migration, set its `when` to `Date.now()`. Write the updated `_journal.json`.

Report what was changed:

- If fixes were made: list each migration tag that was updated and its old → new timestamp
- If no fixes needed: "No branch-only migrations found — nothing to update."

### 3. Verify

Run these checks and fix any issues:

1. `pnpm prettier --write .` — fix formatting drift from conflict resolution
2. `pnpm lint:strict` — fix any lint errors introduced by the rebase
3. `pnpm typecheck` — ensure no type errors from schema/migration mismatch

Delete any temporary scripts created during this process.
