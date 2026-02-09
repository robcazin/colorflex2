# Claude Development Protocol

**Created:** October 20, 2025
**Purpose:** Prevent destructive changes and wasted time

---

## MANDATORY PROTOCOL - READ AT START OF EVERY SESSION

### BEFORE Touching ANY Code:

#### 1. Read Documentation First ✅
- [ ] Read `CLAUDE.md` for project-specific instructions
- [ ] Read all relevant `.md` files related to the task
- [ ] Check `.MODIFIED_FILES.txt` for recent changes
- [ ] Search for existing backups of working versions
- [ ] Understand current architecture BEFORE proposing changes

#### 2. Ask Questions, Don't Assume ✅
When user reports a problem:
- [ ] Ask for console logs (don't grep entire files blindly)
- [ ] Ask what's currently working
- [ ] Ask what changed recently
- [ ] Propose a diagnosis BEFORE making changes
- [ ] Wait for user confirmation before proceeding

#### 3. Create Backups Before Destructive Changes ✅
Before modifying working code:
- [ ] Create timestamped backup
- [ ] Document what's currently working
- [ ] Test backup restoration process
- [ ] Only then proceed with changes

#### 4. Incremental Changes Only ✅
- [ ] Change ONE thing at a time
- [ ] Test after each change
- [ ] Document what each change does
- [ ] NEVER make multiple architectural changes at once
- [ ] If adding features, EXTEND (don't replace)

#### 5. Respect Working Code ✅
- [ ] If code is working, assume it's correct
- [ ] Study HOW it works before changing
- [ ] Don't "improve" working code without explicit request
- [ ] When restoring backups, CHECK for recent features that might be lost

---

## Red Flags - User Should Stop Me If:

1. I start making changes without asking questions
2. I ignore project documentation
3. I don't create backups before destructive changes
4. I make multiple large changes at once
5. I "restore" old code without checking recent improvements
6. I grep entire large files instead of asking for specific info
7. I assume I understand the problem without confirmation

---

## Specific to ColorFlex Project:

### File Structure (CRITICAL):
- `src/CFM.js` - EDIT THIS
- `src/assets/color-flex-core.min.js` - BUILT FILE (don't edit directly)
- Run `npm run build` after editing CFM.js
- Upload `src/assets/color-flex-core.min.js` to Shopify

### Clothing Collections Architecture:
- Use **fabric rendering** (`renderFabricMockup()`), NOT room mockup
- Require **dual-layer system**: `layers` (JPG for preview) + `mockupLayers` (PNG for mannequin)
- Set `isInFabricMode = true` to trigger fabric rendering
- Defined in `furniture-config.json` with `isClothing: true`
- See `CLOTHING_MODE_BEHAVIOR.md` for complete documentation

### Before Making Changes:
1. Read relevant MD files
2. Check recent backups (ls -lt backups/working_versions/)
3. Ask user for console logs if debugging
4. Create backup before changing
5. Test incrementally

---

## Commitments:

### I WILL:
- ✅ Read ALL project documentation before touching code
- ✅ Create backups before ANY destructive changes
- ✅ Ask clarifying questions instead of assuming
- ✅ Make incremental, testable changes
- ✅ Follow this protocol religiously

### I WON'T:
- ❌ Assume I understand without asking
- ❌ Make multiple large changes at once
- ❌ Restore backups without checking recent features
- ❌ Ignore documentation
- ❌ Change working code without explicit request

---

**This protocol is binding. Violating it wastes the user's time and destroys trust.**
