CLAUDE Start
=========================================

## 🚨 CRITICAL: Start Every Session Here

### At the Start of Each Session:

**STEP 1: Read Architecture**
```
Read ARCHITECTURE.md first
```

This reminds Claude to consult the architecture before making any changes.

**STEP 2: Check Recent Work**
```
Read docs/session-summaries/ (latest session)
```

Review the most recent session summary to understand:
- What was completed last session
- Current deployment status
- Known issues or pending tasks
- Files modified recently

**STEP 3 (Optional): Specify Focus Area**
If working on something specific, say:
```
Read ARCHITECTURE.md - we're working on [wallpaper/clothing/furniture] page
```

---

## 📋 End-of-Day Session Summary Protocol

### When I Say "I'm Going to Bed" or "Session Complete":

**Claude MUST create a session summary:**

1. **File Location**: `docs/session-summaries/SESSION_YYYYMMDD_brief_description.md`
2. **File Naming**: Use date + brief topic (e.g., `SESSION_20251209_clipping_fix.md`)

**Required Sections:**
```markdown
# Session Summary - [Date]

## Problem Identified
[What issue was being addressed]

## Root Cause
[Why the problem existed]

## Solution Implemented
[What was changed and why]

## Key Learnings
[Important concepts or constraints discovered]

## Files Modified
[List with line numbers and descriptions]

## Build Output
[File sizes, build status]

## Deployment Status
[What's deployed, what's pending]

## Testing Checklist
[Steps to verify the fix works]

## Backup Location
[Path to backup directory]

## Next Steps
[What needs to happen next session]
```

**Example:**
- Problem: Abundance patterns showing 3 tiles at 2X instead of 2
- Root Cause: Missing clipping region for standard patterns
- Solution: Added canvas clipping to match ColorFlex pattern behavior
- Key Learning: 24-inch roll constraint is fundamental
- Files: src/CFM.js lines 10848-10873
- Status: Built ✅, Deployed ⏳
- Next: Deploy to Shopify, test Abundance patterns

---

## 📁 Session Summary Organization

**Storage**: `docs/session-summaries/`
**Format**: `SESSION_YYYYMMDD_topic.md`

**Examples:**
- `SESSION_20251209_clipping_fix.md`
- `SESSION_20251210_cart_integration.md`
- `SESSION_20251211_new_collection_deploy.md`

This ensures continuity between sessions and prevents re-solving solved problems.

---

## 🔧 Quick Command Reference

```bash
# Deployment
./deploy-shopify-cli.sh snippets
./deploy-shopify-cli.sh assets

# Collection Updates
./update-collection.sh add-pattern english-cottage
node ./scripts/shopify-create-products.js english-cottage

# Build
npm run build
```
