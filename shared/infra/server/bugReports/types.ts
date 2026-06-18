export const BUG_REPORT_STATUSES = [
  'received',
  'processing',
  'github_created',
  'retryable_error',
  'failed',
] as const;

export type BugReportStatus = (typeof BUG_REPORT_STATUSES)[number];

export interface BugReportAttachmentInput {
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface NormalizedBugReport {
  submissionId: string | null;
  submittedAt: string | null;
  formName: string | null;
  description: string | null;
  pageUrl: string | null;
  feature: string | null;
  expectedBehavior: string | null;
  actualBehavior: string | null;
  device: string | null;
  browser: string | null;
  locale: string | null;
  contact: string | null;
  attachments: BugReportAttachmentInput[];
  fields: Record<string, unknown>;
}

export interface StoredBugReportAttachment {
  name: string;
  storagePath: string;
  mimeType: string;
  size: number;
  signedUrl: string | null;
}

export interface CleanedBugReport {
  title: string;
  summary: string;
  stepsToReproduce: string[];
  expectedBehavior: string | null;
  actualBehavior: string | null;
  environment: {
    pageUrl: string | null;
    feature: string | null;
    device: string | null;
    browser: string | null;
    locale: string | null;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  labels: string[];
  triageNotes: string | null;
  missingInfo: string[];
}

export interface BugReportRow {
  id: string;
  source_submission_id: string | null;
  status: BugReportStatus;
  raw_payload: unknown;
  normalized_payload: NormalizedBugReport | null;
  attempts: number;
}
