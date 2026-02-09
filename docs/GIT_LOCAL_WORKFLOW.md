# Git local workflow (colorflex2)

We use Git **locally** so you can restore any file or the whole project to a previous state—e.g. to avoid losing work like the "missing no-delete flag" incident. You don't need to push to an external site to get back to a state; everything below is on your machine.

---

## When to commit

- **When you're pleased with the state of things** — e.g. after a fix is done and tested, or before a risky change.
- The assistant will **suggest a commit** when it seems like a good moment (e.g. after finishing a feature or fix), with a clear message describing what the commit is for. You can run the commands yourself or ask it to run them.
- **Commit message** should state what the commit is for (e.g. "Header menus restored", "Collection grid fix", "Deploy script: add --nodelete to all push commands").

---

## Save a state (commit)

```bash
# Stage the files you changed (or everything)
git add path/to/file
# or: git add .

# Save that state with a clear message
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
