# CFM.js modularization plan (revised)

This document revises the migration map with **sub-section** granularity, **shell-first** rules, **classification**, and an **anti-cycle** dependency rule. It does **not** prescribe implementation code.

---

## Non-negotiable constraints

### 1. Section 1 is not extracted as a whole first

Section 1 must be split into:

- **Safe pure (or pure-with-parameters) helpers** that can move **early**, and  
- **Startup / order-sensitive logic** that **remains in [src/CFM.js](src/CFM.js)** until a later phase.

Order-sensitive items include (non-exhaustive): `import` side effects, first assignment of `window.appState`, global diagnostic / `fetch` instrumentation, `isAppReady` + `guard`, anything that must run before `initializeApp`, and the **image cache singleton** until a deliberate `image-loading` module owns it with a defined API.

### 2. `dom` and `patternName` accessor stay in the shell for now

Do **not** move **primary `dom` object creation** or the **`patternName` getter/setter** (`Object.defineProperty`) early.

Only extract **DOM helper functions** that are clearly **isolated**: e.g. take `Element`/`Document` as arguments, no reliance on a module-level `dom` singleton, and no hidden coupling to initialization order.

### 3. `window.*` attachment stays centralized in CFM.js

During migration:

- **All `window.*` exports and global attachment** remain in **`CFM.js`** (the orchestration shell).
- **Utility implementations** may live in extracted modules; the shell **imports** them and **assigns** `window.foo = ...` (or calls `registerX(window, ...)`) in one place.

This preserves a single audit point for public API surface and theme integrations.

### 4. Classification (every proposed extraction unit)

Each unit is labeled **one** of:

| Class | Meaning |
|--------|--------|
| **Pure** | Deterministic logic; no observable side effects; no reliance on implicit globals (callers pass inputs). May include small **parameterized** helpers that read `config` passed in. |
| **Side-effectful but bounded** | Mutates **module-private** state, or performs **idempotent** registration, or I/O with a **narrow** contract (e.g. `fetch` with explicit URL). Boundaries must be documented. |
| **Orchestration / timing-sensitive** | Order of execution matters (init before render, single `fetch` wrap, `isAppReady` gates). **Stays in `CFM.js`** until explicitly promoted to a dedicated orchestrator with the same ordering guarantees. |

### 5. Anti-cycle rule

**No extracted module may import from `CFM.js`** (or any path that re-exports the shell).

Allowed directions:

- `CFM.js` (shell) → extracted modules  
- extracted modules → other extracted **leaf** / **pure** modules  
- **not** extracted → `CFM.js`

If a helper needs something from the shell, **pass it in** (parameters) or **move the helper** to a lower layer that does not depend on the shell.

### 6. Extraction order is by **sub-section**, not only by “Section 1 … 12”

The numbered sections remain **conceptual boundaries**. The **migration sequence** is driven by **small units** (pure helpers, bounded utilities, then larger feature blocks), always respecting constraints 1–5.

---

## Section 1 split (explicit)

### Stay in `CFM.js` for now (orchestration / timing-sensitive)

- Mode bootstrap: `import` from `./config/colorFlex-modes.js`, `getCurrentConfig` / `detectMode`, first `window.colorFlexConfig` / `window.colorFlexMode`.
- `DEBUG_FLAGS` / `debugLog` **attachment** (implementation may later move; toggles remain visible in shell if desired).
- Build stamps: `BUILD_*`, `CFM_RUNTIME_MARKER`, `window.COLORFLEX_BUILD_INFO` `defineProperty`.
- **`window.appState` object creation** and any one-time field initialization.
- Global diagnostics scaffold + **`window.fetch` wrapper** (single registration, depends on `appState`).
- `isAppReady`, `guard`, `traceWrapper` (until `isAppReady` lifecycle is owned elsewhere with identical semantics).
- **Image Optimization** block: `imageCache`, queues, `processImageQueue`, etc., **until** replaced by a single shared `image-loading` module (then that module is **bounded**, not the shell).
- `fabricTuning` / `debouncedFabricRender` if they close over `renderFabricMockup` / `appState` (orchestration).

### Safe to extract early (after review)

Subject to **anti-cycle** and **no implicit `appState`**:

- **Pure (preferred):** string/name utilities that only need arguments, e.g. `normalizedCollectionName(col)`, `patternNameMatches(pattern, standardName)` **if** refactored to **not** read `appState` internally (callers pass `collection` / flags). Same for `getScaleLabel(scaleValue, config)` with **config passed in** instead of reading `window.colorFlexConfig` inside the helper.
- **Pure with care:** `sortCollectionsByNumber(collections)` if it does not touch globals (today it may export to `window` in shell only).

### Side-effectful but bounded (later, not “first wave” unless tiny)

- Anything that owns **singleton mutable state** (image cache) → only after **one** module owns it and `loadImage` (Section 8) is wired through that API.

---

## `dom` policy (explicit)

| Item | Location during migration |
|------|---------------------------|
| `const dom = { ... }` | **`CFM.js`** |
| `patternName` `Object.defineProperty` | **`CFM.js`** |
| `validateDOMElements` | **Shell** unless refactored to `validateDOMElements(dom, options)` with **no** module singleton (then **bounded** or **pure** w.r.t. inputs) |
| Helpers like “create toast node” with **no** global `dom` | May extract as **pure** / **bounded** if only `document` / passed elements used |

---

## Shell responsibilities checklist (`CFM.js`)

1. Import extracted implementations (leaf modules only).
2. Instantiate / wire **order-sensitive** setup (state, diagnostics, `fetch`, `isAppReady`).
3. Create **`dom`** and **`patternName`** accessor.
4. **Attach** all `window.*` public API used by theme, `unified-pattern-modal.js`, and docs.
5. Import order must preserve current side-effect order (tests + manual smoke).

---

## Proposed extraction units (by sub-area)

Units are **not** full “Section N” files unless noted. Each row: **classification** + **notes**.

### A. Section 1 — helpers (split)

| Unit | Content | Class | Notes |
|------|---------|--------|------|
| **1a** | Collection name normalization + pattern name equality helpers (parameterized) | **Pure** | No `appState` reads inside; shell passes `appState.selectedCollection` where needed. |
| **1b** | `getScaleLabel(scaleValue, scaleConfig)` | **Pure** | Caller passes `colorFlexConfig.scale` or equivalent. |
| **1c** | `sortCollectionsByNumber` / order helpers | **Pure** if only array in/out; **shell** assigns `window.ColorFlex*` exports. |
| **1d** | `patternIsStandard` | **Orchestration** if it reads `appState` / legacy sets | Keep in shell **or** split into **pure** predicates + shell combines. |
| **1e** | Image cache + queue + `loadImage` bridge | **Bounded** | Extract only as **one** `image-loading` module after contract with Section 8. |
| **1f** | Config/bootstrap, `appState`, `fetch` wrap, guards | **Orchestration** | **Shell** |

### B. Section 2 — customer save / cart (large)

| Unit | Class | Notes |
|------|--------|------|
| **2a** | Thumbnail / ID / storage key helpers with no DOM | **Pure** / **bounded** | Bounded if touching `localStorage` behind a thin API. |
| **2b** | Modal / cart UI | **Orchestration** + DOM | Late; depends on stable `appState` + callbacks injected from shell. |

### C. Section 3 — loading / paths / mockups

| Unit | Class | Notes |
|------|--------|------|
| **3a** | `normalizePath`, URL helpers without `dom` | **Pure** | High value, low risk. |
| **3b** | Mockup map helpers (`canonicalMockupId`, etc.) | **Pure** / **bounded** | If they only touch passed data structures. |
| **3c** | `dom`, `validateDOMElements`, room dropdown wiring | **Orchestration** | **`dom` stays shell**; dropdown may split later with injected `dom`. |

### D. Sections 4–5, 7–11

Follow the same pattern: **pure path/color/math** first; **UI + appState** later; **proof/render** last or after `image-loading` unified.

---

## Revised extraction order (sub-sections)

Order reflects **risk** and **dependencies**, not numeric section order alone.

1. **1a, 1b, 3a** — string/path/color helpers that are **pure** and need **no** `appState` inside the module (callers in shell pass arguments). **Exports to `window` remain in shell.**
2. **1c** — collection sort helpers, if refactored to pure array transforms; **window** assignment in shell only.
3. **3b** — mockup/path map helpers that operate on **passed** objects only.
4. **Section 5** — isolated **color math** (`hexToHSL`, etc.) where they do not close over `dom` (verify each function).
5. **1e** (optional milestone) — **single** `image-loading` module: unify Section 1 cache/queue with Section 8 `loadImage` **without** changing behavior; **no import from shell**; shell imports the module and passes into render pipeline.
6. **2a** — storage key / serialization helpers (pure or bounded).
7. **Larger blocks** — Section 2 modals/cart, Section 4 furniture, Section 6 init: only after **pure** layers exist and **callbacks** are injected from shell; still **no** `window` attachment inside modules.
8. **Section 12 implementations** — e.g. `showNotification` body in a module; **`window` exports** in shell.
9. **Orchestration** — `initializeApp` and heavy coordinators: **last** or remain in shell **permanently** if risk outweighs benefit.

Throughout: **`dom` + `patternName` + all `window.*` assignments** stay in **`CFM.js`** until a dedicated later phase explicitly moves them with tests.

---

## Verification (unchanged intent)

After each milestone: `npm run build:all`, smoke wallpaper / furniture / clothing, My Designs, cart add, proof download, and grep for **`from './CFM'`** / **`from "../CFM"`** inside `src/cfm/**` (must be **empty**).

---

## Document history

- **Revised** with shell-first Section 1 split, `dom` policy, export centralization, classification, anti-cycle rule, and sub-section extraction order.
