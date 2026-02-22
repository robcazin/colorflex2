# Bassett ColorFlex — workflow and backup

**Purpose:** One place for the Bassett workflow and a living backup of decisions and progress so we don’t lose context (e.g. after a bad delete or context loss).

---

## BASSETT is local only — no Shopify deploy

**Do not deploy BASSETT project files or code to Shopify.** Bassett runs locally only (`npm run bassett` → http://localhost:3333). Main-branch deploys (collections, theme, assets) must not include Bassett bundles, Bassett templates, or Bassett mockup data. Server rsync excludes `mockups/bassett`; the Shopify deploy script refuses to push Bassett assets.

**Main site must never show “CF Bassett”.** The bar at the bottom of the storefront shows the **theme name** from Shopify. If your **published** theme on saffroncottage.shop is named “CF Bassett”, visitors will see that. Fix: In **Shopify Admin → Online Store → Themes**, rename the **current (published) theme** to e.g. “Saffron Cottage” or “Live theme”, or publish a different theme that is not named “CF Bassett”. Keep “CF Bassett” as an unpublished duplicate for Bassett dev only. The deploy script now excludes the Bassett bundle and Bassett template when pushing to the **live** theme (assets / changed); use separate deploy targets for live so the main site never loads Bassett.

---

## Streamlined workflow (no copying)

**Single command from repo root (main or worktree):**

```bash
npm run bassett
```

(Layer-stack composite, 4× tiling, and blanket-only tint are now in both main and worktree so you can stay in either directory.)

This builds the Bassett bundle, builds the local HTML, and starts the server. Open **http://localhost:3333**.

**What runs:**

1. `npm run build` → writes `src/assets/color-flex-bassett.min.js` (and other bundles).
2. `node scripts/build-bassett-local-html.js` → writes `bassett-local/index.html`.
3. `node bassett-local/server.js` → serves UI, assets, `/data`, and APIs.

**No manual copying:** The server resolves assets from multiple roots (current repo, sibling `colorflex2` / `colorflex2-bassett`). So you can run from the **main repo** or the **bassett worktree**; built JS is found from the main repo if the current tree doesn’t have it.

**Optional env (e.g. `config/local.env`):**

- `BASSETT_PSD_PATH` — PSD path for render API (optional).
- `BASSETT_REPO_ROOT` / `BASSETT_CONTENT_ROOT` — override content root for data/assets.
- `BASSETT_LOCAL_PORT` — default 3333.

**If you see "No collections found":**

1. **Yes, use `npm run bassett`** — from the repo root (main or worktree). That one command builds and starts the server.
2. **Rebuild** — `npm run bassett` runs `npm run build` first, so the bundle is fresh. If you changed code, run `npm run bassett` again (or `npm run build` then `npm run bassett-local`).
3. **Server startup** — On start the server logs either `collections.json: <path>` or `collections.json: NOT FOUND`. If NOT FOUND, the app will show "No collections found"; ensure the repo has `data/collections.json` or `src/assets/collections.json` (main and worktree both have `src/assets/collections.json`).
4. **Browser** — Hard refresh (Cmd+Shift+R). In Network tab check `/assets/collections.json`: status 200 and response has a `collections` array.

---

## Room preview: tiled pattern + layers (no PSD for preview)

- Build a **tiled pattern** (like a mockup background).
- **Composite** it with the **extracted PSD layers** (exported PNGs).
- **Warp** only the layers that have a **DSPL** (displacement) file; the rest are drawn as images or tinted (blanket).

**Layer stack (draw order: back → front)** — in code: `BASSETT_LAYER_STACK` in `src/CFM.js`:

| # | Layer              | File                     | Type               | Notes                          |
|---|--------------------|--------------------------|--------------------|--------------------------------|
| 1 | background         | Background.png           | image              |                                |
| 2 | sofa-displaced     | SOFA-DSPL.png            | pattern-displaced  | pattern warped by displacement |
| 3 | sofa-shadows       | SOFA-SHADOWS.png         | image              |                                |
| 4 | blanket            | BLANKET-BACKGROUND.png   | solid-color        | ColorFlex color index 1        |
| 5 | pillow2            | PILLOW-2.png             | image              |                                |
| 6 | pillow2-displaced  | PILLOW-2-DSPL.png        | pattern-displaced  |                                |
| 7 | pillow2-shadows    | PILLOW-2-SHADOWS.png     | image              |                                |
| 8 | pillow1            | PILLOW-1.png             | image              |                                |
| 9 | pillow1-displaced  | PILLOW-1-DSPL.png        | pattern-displaced  |                                |
|10 | pillow1-shadows    | PILLOW-1-SHADOWS.png     | image              |                                |

**Displacement (DSPL) files:** `PILLOW-1-DSPL.png`, `PILLOW-2-DSPL.png`, `SOFA-DSPL.png`.

**Layer base URL:** `window.BASSETT_LAYERS_BASE_URL` or `/data/mockups/bassett/sofa-with-pillows-mockup-2`. Point `/data` or this URL at the folder that contains the exported layer images.

---

## Key files (for recovery / reference)

- **Layer stack + displace client:** `src/CFM.js` (BASSETT_LAYER_STACK, getBassettLayersBaseUrl, bassettDisplaceInWorker), `src/bassett-layer-stack.js`, `src/bassett-displace-client.js`
- **Displacement worker:** `src/workers/pattern-displace.worker.js`
- **Server:** `bassett-local/server.js`
- **Build HTML:** `scripts/build-bassett-local-html.js` (template: `src/templates/page.colorflex-bassett.liquid`)

---

## Milestones

**Milestone — February 2026**  
Bassett layer-based room preview is in place and the workflow is stable. One command (`npm run bassett`) from main or worktree builds and serves. Room preview: tiled pattern + extracted layers; only DSPL layers are warped; blanket uses second ColorFlex color with strict alpha; 4× pattern repetition; default launch collection **hip-to-be-square**. Server logs `collections.json` path at startup; progress and context are backed up in this doc so we can resume after a long thread or a bad delete. Commemorating this as a landmark before the next phase.

---

## Progress / backup log

*Update this section as we make decisions or recover from issues.*

- **2025-02-07:** Streamlined workflow: single command `npm run bassett`; server serves `/assets` from all fallback roots so no copying between main and worktree. Added this doc as living backup. Layer order and “tiled background → composite with layers → warp only DSPL” behavior documented and confirmed in code comments.
- **2025-02-07:** Room preview scramble fix: displacement worker now uses the map's **alpha as a mask** — where alpha < 128 the output pixel is transparent, so we don't draw warped pattern in "empty" regions (which were using R/G and producing large offsets and scramble). File: `src/workers/pattern-displace.worker.js`.
- **2026-02:** Launch default collection **hip-to-be-square** when no valid collection found (BASSETT mode). Server logs `collections.json` path at startup. "No collections found" troubleshooting and checklist added. **Milestone:** layer-stack composite, single-command workflow, and backup/checkpoint policy in place; commemorated in Milestones section above.
- **2026-02-07:** Main-branch session: curated colors retained for standard patterns (no clear at top); layer inputs for standard patterns restored to blurb (clear layer UI, hide heading/lock, show "24x24 inches" copy). Collection number ordering (cf-dl, templates). **Safety:** Separation checklist added to `docs/GIT_LOCAL_WORKFLOW.md` (work in bassett worktree, open correct folder, confirm branch, Bassett-only edits, merge direction) so Bassett work doesn't change main.

---

## Chat backup

Cursor chat is not stored in the repo. To keep a backup of our conversations:

- Use Cursor’s export/archive for the chat when you want a snapshot.
- This file (`docs/BASSETT_WORKFLOW.md`) is the in-repo backup of workflow, layer stack, and progress so we can recover without re-reading the full chat.

---

## Context / buffer checkpoint policy

The AI does **not** get a live buffer or token counter, so it can’t see “how much context is left.” To avoid losing context when the thread gets long or Cursor can’t retrieve the conversation:

1. **When the AI suggests a checkpoint** — It will say something like: *“Consider checkpointing: update this doc and/or export the chat.”* Do it before starting the next big task.
2. **When we’ve done a lot in one thread** — Many file edits, multi-step work, or a long back-and-forth = good time to checkpoint.
3. **Before a large new feature or refactor** — Update the Progress log below with current state and intent, then continue.

**Checkpoint = update the Progress / backup log in this file + (optionally) export the Cursor chat.** That way a new thread or recovered session can resume from the doc.
