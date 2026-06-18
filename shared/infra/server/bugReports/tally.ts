import type {
  BugReportAttachmentInput,
  NormalizedBugReport,
} from './types';

interface TallyField {
  label?: string;
  type?: string;
  value?: unknown;
  options?: Array<{ id: string; text: string }>;
}

interface TallyPayload {
  eventId?: string;
  createdAt?: string;
  data?: {
    responseId?: string;
    submissionId?: string;
    formName?: string;
    createdAt?: string;
    fields?: TallyField[];
  };
}

const FIELD_ALIASES = {
  description: ['description', 'bug', 'bug report', 'what happened', 'details'],
  pageUrl: ['url', 'page url', 'page', 'link', 'where'],
  feature: ['feature', 'area', 'section'],
  expectedBehavior: ['expected', 'expected behavior', 'what did you expect'],
  actualBehavior: ['actual', 'actual behavior', 'what happened instead'],
  device: ['device', 'platform'],
  browser: ['browser'],
  locale: ['locale', 'language'],
  contact: ['email', 'contact'],
} as const;

function normalizeLabel(label: string | undefined): string {
  return (label || '').trim().toLowerCase();
}

function optionText(field: TallyField, id: string): string {
  return field.options?.find((option) => option.id === id)?.text || id;
}

function stringifyValue(field: TallyField): string | null {
  const value = field.value;

  if (value === null || value === undefined || field.type === 'FILE_UPLOAD') {
    return null;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === 'string' ? optionText(field, item) : String(item),
      )
      .join(', ');
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function findFieldValue(
  fields: TallyField[],
  aliases: readonly string[],
): string | null {
  for (const field of fields) {
    const label = normalizeLabel(field.label);
    if (aliases.some((alias) => label.includes(alias))) {
      return stringifyValue(field);
    }
  }

  return null;
}

function extractAttachments(fields: TallyField[]): BugReportAttachmentInput[] {
  const attachments: BugReportAttachmentInput[] = [];

  for (const field of fields) {
    if (field.type !== 'FILE_UPLOAD' || !Array.isArray(field.value)) {
      continue;
    }

    for (const file of field.value) {
      if (
        file &&
        typeof file === 'object' &&
        'name' in file &&
        'url' in file &&
        'mimeType' in file &&
        'size' in file
      ) {
        attachments.push({
          name: String(file.name),
          url: String(file.url),
          mimeType: String(file.mimeType),
          size: Number(file.size),
        });
      }
    }
  }

  return attachments;
}

export function normalizeTallyPayload(payload: unknown): NormalizedBugReport {
  const tallyPayload = payload as TallyPayload;
  const fields = tallyPayload.data?.fields || [];
  const fieldValues: Record<string, unknown> = {};

  for (const field of fields) {
    if (!field.label) {
      continue;
    }
    fieldValues[field.label] =
      field.type === 'FILE_UPLOAD' ? field.value : stringifyValue(field);
  }

  return {
    submissionId:
      tallyPayload.data?.submissionId ||
      tallyPayload.data?.responseId ||
      tallyPayload.eventId ||
      null,
    submittedAt:
      tallyPayload.data?.createdAt || tallyPayload.createdAt || null,
    formName: tallyPayload.data?.formName || null,
    description: findFieldValue(fields, FIELD_ALIASES.description),
    pageUrl: findFieldValue(fields, FIELD_ALIASES.pageUrl),
    feature: findFieldValue(fields, FIELD_ALIASES.feature),
    expectedBehavior: findFieldValue(fields, FIELD_ALIASES.expectedBehavior),
    actualBehavior: findFieldValue(fields, FIELD_ALIASES.actualBehavior),
    device: findFieldValue(fields, FIELD_ALIASES.device),
    browser: findFieldValue(fields, FIELD_ALIASES.browser),
    locale: findFieldValue(fields, FIELD_ALIASES.locale),
    contact: findFieldValue(fields, FIELD_ALIASES.contact),
    attachments: extractAttachments(fields),
    fields: fieldValues,
  };
}
