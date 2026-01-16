# KanaDojo Hybrid Modular Architecture Migration Plan

**Version:** 1.0
**Date:** 2025-12-31
**Target Architecture:** Hybrid Modular (Feature-Based + Selective FSD Principles)
**Estimated Timeline:** 5-7 days (40-56 hours)
**Risk Level:** Medium
**Status:** ✅ COMPLETED

---

> **Note:** This migration plan has been completed. This document is archived for historical reference.
> See `MIGRATION_SUMMARY.md` for the final summary of changes made.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Migration Goals](#migration-goals)
3. [Architecture Overview](#architecture-overview)
4. [Phase 0: Preparation](#phase-0-preparation-day-0)
5. [Phase 1: Create Facades](#phase-1-create-facades-days-1-2)
6. [Phase 2: Create Widgets](#phase-2-create-widgets-days-2-3)
7. [Phase 3: Migrate Shared Components](#phase-3-migrate-shared-components-day-4)
8. [Phase 4: Add Barrel Exports & Enforcement](#phase-4-add-barrel-exports--enforcement-day-5)
9. [Phase 5: Testing & Validation](#phase-5-testing--validation-days-5-6)
10. [Rollback Strategy](#rollback-strategy)
11. [Success Metrics](#success-metrics)
12. [Post-Migration Checklist](#post-migration-checklist)

---

## Executive Summary

### Current State
- **Total Layer Violations:** 27 files in shared/ importing from features/
- **Code Duplication:** 540+ lines across Kana/Kanji/Vocabulary game components
- **Hub Pattern Anti-Pattern:** Progress/useStatsStore imported by 25+ files
- **Missing Abstractions:** No shared game orchestration, no unified facades
- **Missing Public APIs:** 8 features lack barrel exports (index.ts)

### Target State
- **Layer Violations:** 0 (enforced by ESLint)
- **Code Duplication:** < 100 lines (90% reduction via TrainingGame widget)
- **Decoupled Stats:** Event-based system, < 10 direct imports
- **Unified Widgets:** 5 major widgets abstracting cross-feature composition
- **Complete Public APIs:** All features expose clean barrel exports

### Migration Strategy
**Hybrid Modular Architecture:**
- **Features remain** as primary organizational unit
- **Widgets layer** added for complex UI compositions
- **Facades** abstract feature store access for cross-feature needs
- **Strict enforcement** via ESLint import rules
- **No entities layer** (too heavyweight for current scope)

---

## Migration Goals

### Primary Goals
1. **Eliminate Layer Violations:** shared/ must never import from features/
2. **Eliminate Duplication:** Abstract game logic into shared widgets
3. **Decouple Stats System:** Break Progress store hub pattern
4. **Create Clean APIs:** All features expose public barrel exports
5. **Enforce Boundaries:** ESLint rules prevent future violations

### Secondary Goals
6. **Improve DX:** Faster navigation with clear boundaries
7. **Enable Testing:** Isolated facades easier to mock
8. **Prepare for Scale:** Architecture supports 50+ features
9. **Maintain Performance:** No runtime overhead from abstraction
10. **OSS-Friendly:** Simpler mental model for contributors

---

## Architecture Overview

### New Directory Structure
```
kanadojo/
├── app/                    # Next.js App Router (unchanged)
│
├── widgets/                # ✨ NEW: Complex UI compositions
│   ├── TrainingGame/       # Unified game orchestrator
│   ├── MenuSystem/         # DojoMenu + GameModes + ActionBar
│   ├── GameUI/             # Stats, Progress, Exit screens
│   ├── SelectionUI/        # Content selection widgets
│   └── index.ts            # Barrel export
│
├── features/               # Feature modules (enhanced with facades)
│   ├── Kana/
│   │   ├── adapters/       # ✨ NEW: ContentAdapter implementation
│   │   ├── facade/         # ✨ NEW: Public hooks API
│   │   ├── components/     # Feature-specific UI
│   │   ├── store/          # Internal state (not exported)
│   │   ├── data/           # Internal data (not exported)
│   │   ├── lib/            # Internal utilities (not exported)
│   │   └── index.ts        # ✨ NEW: Public API only
│   ├── Kanji/
│   │   └── [same structure]
│   ├── Vocabulary/
│   │   └── [same structure]
│   ├── Progress/
│   │   ├── facade/         # ✨ NEW: Stats facade
│   │   ├── components/
│   │   ├── store/          # Private
│   │   └── index.ts        # ✨ NEW
│   └── Preferences/
│       ├── facade/         # ✨ NEW: Preferences facade
│       └── index.ts        # ✨ NEW
│
├── shared/                 # ✨ STRICT: No feature imports allowed
│   ├── components/         # Simple, reusable UI (Button, Card, etc.)
│   ├── hooks/              # Generic hooks only (no feature coupling)
│   ├── lib/                # Pure utilities
│   ├── events/             # ✨ NEW: Event bus for cross-cutting concerns
│   └── types/              # Shared type definitions
│
└── core/                   # Infrastructure (unchanged)
```

### Layer Rules

| Layer | Can Import From | Cannot Import From | Enforced By |
|-------|----------------|-------------------|-------------|
| `app/` | widgets, features (via index.ts), shared, core | feature internals | ESLint |
| `widgets/` | features (via facade), shared, core | feature stores directly | ESLint |
| `features/` | other features (via index.ts), shared, core | other feature internals | ESLint |
| `shared/` | shared, core | features, widgets | ESLint ✅ |
| `core/` | core only | app, widgets, features, shared | ESLint |

---

*[Rest of the detailed migration plan continues - see full plan for Phases 1-5]*

---

**END OF MIGRATION PLAN**

This document is archived for historical reference. The migration was successfully completed on December 31, 2025.
