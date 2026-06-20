# Mohawk Room compositor — stack architecture (source of truth)

This document is the **canonical reference** for rebuilding the Mohawk Room compositor on top of stable ColorFlex2. It is derived from the Photoshop layer template (see `photoshop-layer-reference.png`).

**Out of scope here:** runtime implementation, CFM edits, Shopify deploy, Bassett displacement stacks, or `mohawk-floor-texture-poc` wholesale imports.

---

## Photoshop layer order (bottom → top)

In Photoshop, layers at the **bottom** of the Layers panel are drawn **first** (back); layers toward the **top** are drawn **last** (front).

| # | Layer / group (conceptual) | Role |
|---|----------------------------|------|
| 1 | **`floor-detail`** (group) | **Floor detail plate** — base floor lighting/texture/read; **not** a mask. |
| 2 | **`floor-tile`** (e.g. `Layer 4` / `floor-tile.png`) | **Mohawk carpet tile** — repeating / swappable carpet basis; **separate** from `floor-detail`. |
| 3 | **`panel-mask`** | **Mask** — localizes where downstream wall/panel treatment applies. |
| 4 | **`wall-mask`** | **Mask** — localizes main wall / wallpaper projection region. |
| 5 | **`pinned-wall-mask`** | **Mask** — localizes upper / “pinned” wall band vs full field. |
| 6 | **`trim`** (group: e.g. `trim` + `Levels`) | **Trim detail plate** + tone correction — **geometry and shading** of molding; not a tint mask. |
| 7 | **`trim-mask (Color)`** (group: Hue/Sat Colorize + `trim-mask`) | **Tint pass** — color localized **only** where `trim-mask` allows. |
| 8 | **`sofa-detail`** (group) | **Sofa detail plate** — high-frequency texture/shading; must **remain visible** under sofa tint (see below). |
| 9 | **`sofa (Color)`** (group: Hue/Sat Colorize + `sofa-mask (tint+multiply)`) | **Sofa tint** — mask **only** localizes color; blend intent is multiply-style so luminance/detail from `sofa-detail` read through. |
| 10 | **`pillows (Color)`** (group: Hue/Sat Colorize + `pillow-mask (tint+multiply)`) | **Pillow tint** — same pattern as sofa; drawn **above** sofa stack. |

Minor naming in PSD may differ (e.g. `Layer 4` vs exported `floor-tile.png`); **semantic roles** above are what the compositor must preserve.

---

## Detail plates vs masks

| Type | Purpose | Examples |
|------|---------|----------|
| **Detail plate** | Carries **structure, lighting, texture** for a region. Drawn as normal (or leveled) imagery. | `floor-detail`, `trim`, `sofa-detail` |
| **Mask** | **Does not replace** geometry; **only restricts** where tint, wallpaper projection, or adjustments apply. | `wall-mask`, `pinned-wall-mask`, `panel-mask`, `sofa-mask`, `pillow-mask`, `trim-mask` |

**Rule:** Do not treat detail plates as alpha mattes for unrelated content unless the PSD explicitly does so. Masks **localize color** (and projection), not semantic structure.

---

## Floor: `floor-detail` vs projected Mohawk carpet **tile**

- **`floor-detail`:** Non-repeating **floor read** (lighting, pile, grout edge, etc.). Stays relatively stable when swapping **which** Mohawk carpet SKU is shown.
- **`floor-tile` / carpet tile layer:** The **repeatable** Mohawk carpet thumbnail / tile basis. Tiling, scale, and UV belong here — **not** fused into `floor-detail`.

Swapping the **carpet design** updates **tile projection / tile asset**, not the **semantic Mohawk palette** driving UI (see rules below).

---

## Wall: `wall-mask` / `pinned-wall-mask` as wallpaper projection masks

- **`wall-mask`** and **`pinned-wall-mask`** (with **`panel-mask`** where applicable) define **where** the ColorFlex **wallpaper pattern is projected** in screen space (or equivalent homography), independent of **how** Mohawk RGB roles were extracted from the carpet thumbnail.
- **Wallpaper projection** is a **render-time compositor** concern. **Semantic palette extraction** is a **separate** pipeline that feeds ColorFlex **inputs** / tint uniforms.

---

## Sofa: `sofa-detail` vs `sofa-mask` / `pillow-mask`

- **`sofa-detail`:** **Visible detail plate** under the sofa body tint — preserves fabric read, seams, cushions when color changes.
- **`sofa-mask` / `pillow-mask`:** **Color-localization only** — paired with Hue/Saturation-style **Colorize** + **tint+multiply** semantics so color does not paint over the whole canvas, and **detail remains legible**.

Stack order: **`sofa-detail` below `sofa (Color)`** so tint applies **on top** of detail with multiply-friendly blending, not by deleting detail pixels.

---

## Stability rules (must not regress)

### 1. Wallpaper switch must **not** recompute the Mohawk palette

Changing **which ColorFlex wallpaper** is shown (or re-projecting into `wall-mask` / `pinned-wall-mask`) **must not** trigger a new Mohawk thumbnail extraction or overwrite stored role colors **unless** the user explicitly asks for a new extraction.

### 2. Mohawk palette drives ColorFlex inputs **once**, then stays stable

- **First:** Mohawk carpet thumbnail → palette roles (e.g. background / linework / accent) → mapped into ColorFlex **layer inputs** (canonical path: `applyColorsToLayerInputs` in `src/CFM.js` when wired).
- **Then:** Palette is **session-stable UI state**; room compositor and wallpaper projection **read** those inputs. They do **not** feed back into extraction on wallpaper change.

---

## Reference image

File: **`docs/mohawk-room/photoshop-layer-reference.png`** — screenshot of the Photoshop Layers panel and canvas for this template.

---

## Related (not duplicated here)

- Mohawk **CLI** palette extraction: `tools/mohawk/extract-palette.js` + `tools/mohawk/readme.md`
- ColorFlex **input bridge** (when enabled): `src/demo/colorflexPaletteHook.js` + `src/color/*` (palette engine helpers)
