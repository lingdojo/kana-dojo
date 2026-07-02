// Single source of truth for backlog files excluded from validation
// and cleanup. Both scripts/validate-backlog.mjs and scripts/fix-backlog.mjs
// import this constant.
//
// Rationale for each entry:
// - automation-state.json: live counters (totalIssuesCreated, lastRun)
//   mutated by other bot workflows; reformatting invites merge conflicts.
// - pr-authors.json: preserves author-list ordering exactly; not part of
//   the JSON-escape bug surface.

export const EXCLUDED_FILES = new Set([
  'automation-state.json',
  'pr-authors.json',
]);