# Git local workflow (colorflex2)

We use Git **locally** so you can restore any file or the whole project to a previous state—e.g. to avoid losing work like the "missing no-delete flag" incident. You don't need to push to an external site to get back to a state; everything below is on your machine.

**Do not rely on Shopify editor history** for recovery—it is unreliable. Git is the source of truth: every commit includes sections, snippets, built JavaScript, templates, and assets needed to restore a full working state.

---

## When to commit

- **When you're pleased with the state of things** — e.g. after a fix is done and tested, or before a risky change. You don't have to commit after every single edit; batch your work and commit at natural break points (end of a fix, before deploy, end of day).
- The assistant will **suggest a commit** when it seems like a good moment (e.g. after finishing a feature or fix), with a clear message describing what the commit is for. You can run the commands yourself or ask it to run them.
- **Commit message** should state what the commit is for (e.g. "Header menus restored", "Collection grid fix", "Deploy script: add --nodelete to all push commands").

---

## Save a state (commit)

**Easiest: one command (adds everything and commits — no forgetting to add)**

```bash
./scripts/git-save.sh "Short description of what this commit is for"
```

This adds all changed files and commits with your message. Use it whenever you're happy with your work; it removes the "did I add?" step.

**When you want to commit only specific files** (manual add + commit):

```bash
git add path/to/file
# or: git add .

git commit -m "Short description of what this commit is for"
```

---

## See past states

```bash
git log --oneline
```

Shows a list of commits, newest first. Each line is a snapshot you can restore. Example:

```
a1b2c3d Header menus restored
b2c3d4e Collection grid: restore full section from previous theme
c3d4e5f Initial commit – theme, scripts, deploy with --nodelete
```

---

## Get back to a previous state

**Restore one file** to how it was in a given commit (e.g. `a1b2c3d`):

```bash
git checkout a1b2c3d -- path/to/file
```

Example: restore `src/sections/header.liquid` to the previous commit:

```bash
git checkout a1b2c3d -- src/sections/header.liquid
```

**Restore the whole project** to a commit (use with care — overwrites everything):

```bash
git checkout a1b2c3d
```

You're then in "detached HEAD" at that state. To return to normal: `git checkout main`.

---

## Optional: backup to a remote

If you add a remote (e.g. GitHub), you can push when you want an off-machine backup:

```bash
git remote add origin <url>
git push -u origin main
```

Restoring is still done locally with `git log` and `git checkout`; the remote is for backup and sharing, not required to "get back" to a state.

---

## Example: ColorFlex black background (Feb 2026)

**Issue:** Header had gone black after recovery; we wanted the ColorFlex page to match.

**Steps we followed:**
1. **Identify files:** ColorFlex page template and its preview/canvas backgrounds → `src/templates/page.colorflex.liquid`; JS-set backgrounds → `src/CFM.js` and `src/assets/color-flex-core.min.js`.
2. **Safety:** We had Git; could have run pull + compare if we’d needed to check Shopify vs local. No overwrite of newer remote.
3. **Edit:** Changed gray (#434341) and dark blue (rgba(17,24,39)) to black (#000) in template, CFM.js, and min JS.
4. **Save state:** `./scripts/git-save.sh "ColorFlex page: black background to match header"` (or manual add + commit).
5. **Deploy:** Either one file (e.g. `./deploy-shopify-cli.sh only templates/page.colorflex.liquid`) or only what changed: `./deploy-shopify-cli.sh changed` → confirm → push.

**Takeaway:** Issue → find file(s) → optional safety check (pull/compare) → edit → save (Git) → deploy (changed or only).

---

## Short commands (run from any directory)

Load the project’s short commands once per terminal, or add to your shell profile so they’re always available:

```bash
source /Volumes/K3/jobs/colorflex2/scripts/cf-aliases.sh
```

To add to your profile (bash or zsh) so they work from any location:

```bash
echo 'source /Volumes/K3/jobs/colorflex2/scripts/cf-aliases.sh' >> ~/.zshrc
# or for bash: >> ~/.bashrc
# Then: source ~/.zshrc  (or open a new terminal)
```

| Command | What it does |
|--------|----------------|
| `cfs "message"` | Save state: git add all + commit with message |
| `cfd` | Deploy only changed files (git-based, then confirm) |
| `cfo <path>` | Deploy one file (e.g. `cfo templates/page.colorflex.liquid`) |
| `cfa` | Deploy entire theme (--nodelete) |
| `cfp` | Pull theme from Shopify into theme-pull/ |
| `cfsync` | Copy theme-pull/ into src/ (config, templates, sections, layout) — run after cfp to sync with editor |
| `cfcompare` | Compare src/ vs theme-pull/ (use this instead of `compare`, which runs ImageMagick) |
| `cfl` | Show last 15 commits (git log --oneline) |

All of these run from the colorflex2 project root no matter where your shell is.
