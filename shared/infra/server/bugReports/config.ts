export const BUG_REPORT_LABELS = [
  'bug',
  'user-report',
  'needs-triage',
  'accessibility',
  'mobile',
  'desktop',
  'regression',
] as const;

export const REQUIRED_BUG_REPORT_LABELS = [
  'bug',
  'user-report',
  'needs-triage',
] as const;

export const BUG_REPORT_SEVERITIES = [
  'low',
  'medium',
  'high',
  'critical',
] as const;

export const MAX_BUG_REPORT_ATTEMPTS = 5;
export const BUG_REPORT_BATCH_SIZE = 5;
export const MAX_ATTACHMENT_COUNT = 3;
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
export const SIGNED_ATTACHMENT_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

export const ALLOWED_ATTACHMENT_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);
