# Clean branch switching (ColorFlex2)

Goal: **`git status`** is clean before `git checkout` / `git switch`, so Git does not refuse the switch or mix half-applied changes.

## 1. Check status

```bash
git status -sb
```

- **Nothing to commit, working tree clean** — safe to switch.
- **Modified tracked files** — commit them, or **stash** (see below).
- **Untracked files** — either add + commit, **stash with untracked**, or ensure they are **gitignored** (e.g. `ColorFlexTradeShow/`, `homePageVideos/` in `.gitignore`).

## 2. Stash when you cannot commit yet

```bash
git stash push -u -m "wip before switching branch"
git switch <other-branch>
# … work …
git switch -
git stash pop   # or: git stash apply && git stash drop
```

`-u` includes **untracked** files so they do not block checkout on branches that do not carry those paths.

## 3. Align with remote before switching

```bash
git fetch origin
git switch main
git pull --ff-only origin main
```

Avoids surprise conflicts when your local branch was behind.

## 4. Trade-show vs `main`

After **`demo/trade-show-offline`** was merged into **`main`**, both tips may match. Switching between them should be a **no-op** on files unless new commits land on only one branch.

Windows handoff output stays **outside** git noise: **`ColorFlexTradeShow/`** is gitignored.

## 5. Optional safety alias

```bash
git config alias.sw '!git status -sb && git switch'
```

Use `git sw <branch>` only when you are disciplined about reading status first.

## Related

- **`trade-show-local/BACKUP_AND_HISTORY.md`** — push, tags, `npm run backup`, recovery.
