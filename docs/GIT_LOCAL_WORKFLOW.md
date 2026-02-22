# Git local workflow (colorflex2)

We use Git **locally** so you can restore any file or the whole project to a previous state—e.g. to avoid losing work like the "missing no-delete flag" incident. You don't need to push to an external site to get back to a state; everything below is on your machine.

**Do not rely on Shopify editor history** for recovery—it is unreliable. Git is the source of truth: every commit includes sections, snippets, built JavaScript, templates, and assets needed to restore a full working state.

---

## Branches and themes

| Branch   | Shopify theme to deploy to / preview on |
|----------|----------------------------------------|
| **bassett** | **CF Bassett** (duplicate theme for safe preview) |
| main     | Live theme (script default)             |

When you work on the **bassett** branch, deploy to the **CF Bassett** theme so you can preview without affecting the live theme. The deploy script auto-selects the theme by branch (bassett → CF Bassett, main → live).

---

## Two terminals: main + bassett (worktrees)

You can keep **main** and **bassett** in separate folders and use two terminal windows—one for live wallpaper work, one for Bassett—so you can jump into either at any time.

**One-time setup (from the main repo):**

```bash
cd /Volumes/K3/jobs/colorflex2
./scripts/setup-worktrees.sh
```

That creates a **bassett worktree** at `colorflex2-bassett` (sibling folder). Same Git history, two working directories.

**Daily use:**

| Terminal | Folder | Branch | Deploys to |
|----------|--------|--------|------------|
| **1** | `colorflex2` | main | Live theme |
| **2** | `colorflex2-bassett` | bassett | CF Bassett theme |

In **Terminal 1** (main): `cd` to `colorflex2` (or use the **CF Main** profile in Cursor).  
In **Terminal 2** (bassett): `cd` to `colorflex2-bassett` (or use the **CF Bassett** profile).  
If you’ve run `./scripts/cf-source-setup.sh` once, aliases load automatically when the shell starts in either folder — no need to type `source scripts/cf-aliases.sh`. Then `cfd` / `cfo` / `cfs` in each terminal use that side’s branch.

Each folder has its own branch checked out. Edits and deploys stay separate. When you want main to get bassett changes, in the **main** folder run: `git merge bassett`.

**If you open the project in an editor:** Open the folder for the branch you’re working on (e.g. `colorflex2` for main, `colorflex2-bassett` for bassett). Or open both as separate workspace folders.

**Cursor: left terminal = main, right = bassett**  
The repo has two terminal profiles (see `.vscode/settings.json`): **CF Main** (starts in `colorflex2`) and **CF Bassett** (starts in `colorflex2-bassett`). Default is CF Main. To get main on the left and bassett on the right: (1) Open a terminal — it uses CF Main (left). (2) Split terminal (right side). (3) In the right panel, use the dropdown → **Terminal: Create New Terminal (With Profile)** → **CF Bassett**. If you’ve run `./scripts/cf-source-setup.sh` once, aliases load automatically in both panels; otherwise run `source scripts/cf-aliases.sh` in each.

---

## Safety: working on Bassett without changing main

**Goal:** When you work on the local Bassett app or the `bassett` branch, avoid accidentally changing or deploying main-branch (live) code.

**Separation checklist before Bassett work:**

1. **Work in the Bassett worktree** — `cd` to `colorflex2-bassett` (sibling of `colorflex2`). Do not edit files in `colorflex2` when your intent is Bassett-only changes.
2. **Open the correct folder in Cursor** — Open the workspace/folder `colorflex2-bassett` when doing Bassett work. That way edits, search, and terminal default to the bassett branch.
3. **Confirm branch** — In the Bassett folder, run `git branch` and confirm it shows `* bassett`. Deploys from here go to **CF Bassett** theme only (script selects by branch).
4. **Bassett-only edits** — Prefer editing only Bassett-specific files (e.g. `page.colorflex-bassett.liquid`, `color-flex-bassett.min.js` source, bassett-local). If you must change shared code (e.g. `CFM.js`), use `window.COLORFLEX_MODE === 'BASSETT'` guards so main behavior is unchanged. See `docs/COLORFLEX_BASSETT.md` for "Do not edit for Basset work".
5. **Merge direction** — Changes flow **bassett → main** by merging in the **main** folder (`git merge bassett`). Never merge main into bassett if you've made Bassett-only experiments you don't want on live.

**Quick check:** If you're about to edit `page.colorflex.liquid` or a main-only section, confirm you're in the main worktree and intend to change the live experience.

---

**ColorFlex chameleon icon (intended behavior):** On both main and Bassett, the icon should show **My Designs** (saved patterns). If the user has designs, using one takes them to the appropriate experience (wallpaper on main, furniture on Bassett; the Bassett furniture page is to be revised and may use the current ColorFlex furniture page as a starting point). The theme setting **"ColorFlex icon opens furniture page"** (Theme settings → ColorFlex) was only for testing direct launch; for normal behavior leave it **unchecked** on both themes so the icon opens My Designs.

**If you get 401 "Service is not valid for authentication"** when running the deploy script, use a **Theme Access password** (CLI browser login alone is often not enough for theme push):

1. In your store’s Shopify Admin, go to **Apps** and install **Theme Access** from the [Shopify App Store](https://apps.shopify.com/theme-access) (or open it if already installed).
2. In Theme Access, create a new password and enter your developer email; the app will send you the password (link expires in 7 days).
3. In your terminal, run:  
   `export SHOPIFY_THEME_PASSWORD="the-password-you-received"`  
   then run your deploy (e.g. `./deploy-shopify-cli.sh layout`). The script will pass this as `--password` to `shopify theme push`.

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

Load the project’s short commands once per terminal, or add to your shell profile so they’re always available.

**One-time setup (so they load in every new terminal):**

```bash
cd /Volumes/K3/jobs/colorflex2
./scripts/cf-source-setup.sh
source ~/.zshrc   # or  source ~/.bashrc  if you use bash
```

That script appends the correct `source` line to your `~/.zshrc` (or `~/.bashrc`) and avoids duplicates.

**Or load manually in the current terminal only:**

```bash
source /Volumes/K3/jobs/colorflex2/scripts/cf-aliases.sh
```

**If aliases still don’t appear in new terminals:** Your shell may be reading a different file (e.g. bash on macOS often uses `~/.bash_profile` for login shells). Run `echo $SHELL` to see your shell; then ensure either `~/.zshrc` (zsh) or `~/.bashrc` (bash) is loaded—for bash on macOS, add `[ -f ~/.bashrc ] && source ~/.bashrc` to `~/.bash_profile` if it’s not there.

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
