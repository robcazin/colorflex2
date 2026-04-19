# Trade-show offline demo — backup, history, and recovery

This branch (**`demo/trade-show-offline`**) holds the static trade-show shell (`trade-show-local/`), Windows packaging (`scripts/package-trade-show-windows.js`), and related docs. Use the steps below so work is never only on one machine.

## Git history (primary backup)

- **Branch:** `demo/trade-show-offline` — push to your remote regularly:
  ```bash
  git push -u origin demo/trade-show-offline
  ```
- **Tags (milestones):** After a stable handoff, record a pointer everyone can find:
  ```bash
  git tag -a trade-show-handoff-YYYY-MM-DD -m "Windows trade-show package verified"
  git push origin trade-show-handoff-YYYY-MM-DD
  ```
- **Recover old work:** `git reflog` and `git stash list` — e.g. stashes saved before checking out `main`.
- **Merge policy:** When trade-show work should join production, merge this branch into `main` via PR or explicit merge after review.

## Filesystem backup (repo snapshot)

From the **repo root**, a tarball-style copy is created under **`backups/`** (gitignored):

```bash
bash scripts/full-backup.sh
```

That script copies `src/`, `scripts/`, `docs/`, **`trade-show-local/`**, and other configured paths. **`demo-snapshot/`** is not copied (large JSON; regenerate with `npm run build:trade-show-snapshot`). Inspect `backups/full-backup-*/BACKUP_MANIFEST.txt` after each run.

**npm shortcut (same script):**

```bash
npm run backup
npm run backup:list
```

(`backup:list` prints recent `backups/full-backup-*` directories.)

## Windows handoff vs repo history

- **`ColorFlexTradeShow/`** (from `npm run package:trade-show-windows`) is a **snapshot**, not a git repo. Open **`PACKAGE_BUILD.txt`** inside it to see build time and git `HEAD` short hash.
- To refresh the PC after Mac fixes: pull on Mac → rebuild bundle/snapshot if needed → `npm run package:trade-show-windows` → **replace the entire folder** on the PC.

## Related docs

| Doc | Purpose |
|-----|--------|
| [README.md](./README.md) | Run locally, snapshot, package overview |
| [WINDOWS_DEPLOY.md](./WINDOWS_DEPLOY.md) | Golden-master layout, Windows `npm install`, verification |
| [../OWNER_INSTRUCTIONS.txt](../OWNER_INSTRUCTIONS.txt) | Owner-facing steps (copy into handoff folder) |
