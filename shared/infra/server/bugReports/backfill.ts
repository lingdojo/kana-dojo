import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdminClient } from './supabaseAdmin';
import { normalizeTallyPayload } from './tally';
import type { NormalizedBugReport } from './types';

interface TallyExportField {
  label?: string;
  type?: string;
  value?: unknown;
  options?: Array<{ id: string; text: string }>;
}

interface TallyLikePayload {
  eventId?: string;
  createdAt?: string;
  data: {
    responseId?: string;
    submissionId?: string;
    formName?: string;
    createdAt?: string;
    fields: TallyExportField[];
  };
}

export interface ParsedBackfillReport {
  sourceSubmissionId: string;
  rawPayload: TallyLikePayload;
  normalizedPayload: NormalizedBugReport;
}

export interface InvalidBackfillRow {
  index: number;
  reason: string;
}

export interface ParseBackfillResult {
  reports: ParsedBackfillReport[];
  invalidRows: InvalidBackfillRow[];
}

export interface ImportBackfillResult {
  parsed: number;
  inserted: number;
  skippedDuplicates: number;
  invalid: number;
  failed: number;
  failures: string[];
}

export interface StaleProcessingResetResult {
  reset: number;
  cutoffIso: string;
}

type ExportRecord = Record<string, unknown>;

const KNOWN_METADATA_KEYS = new Set([
  'id',
  'eventid',
  'event id',
  'responseid',
  'response id',
  'submissionid',
  'submission id',
  'createdat',
  'created at',
  'submittedat',
  'submitted at',
  'formname',
  'form name',
]);

function isRecord(value: unknown): value is ExportRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value).trim();
  return text || null;
}

function firstString(record: ExportRecord, keys: string[]): string | null {
  const entries = Object.entries(record);

  for (const key of keys) {
    const match = entries.find(
      ([entryKey]) => entryKey.trim().toLowerCase() === key,
    );
    if (match) {
      return stringValue(match[1]);
    }
  }

  return null;
}

function normalizeMetadataKey(key: string): string {
  return key.trim().toLowerCase().replace(/[_-]/g, ' ');
}

function makeField(label: string, value: unknown): TallyExportField {
  const normalizedLabel = normalizeMetadataKey(label);
  if (
    typeof value === 'string' &&
    normalizedLabel.includes('screenshot') &&
    value.trim().length > 0
  ) {
    const urls = value
      .split(/\s*,\s*|\s*\n\s*/)
      .map((item) => item.trim())
      .filter((item) => /^https?:\/\//i.test(item));

    if (urls.length > 0) {
      return {
        label,
        type: 'FILE_UPLOAD',
        value: urls.map((url) => {
          const pathname = new URL(url).pathname;
          const name = pathname.split('/').pop() || 'attachment';
          const extension = name.toLowerCase().split('.').pop();
          const mimeType =
            extension === 'png'
              ? 'image/png'
              : extension === 'jpg' || extension === 'jpeg'
                ? 'image/jpeg'
                : extension === 'webp'
                  ? 'image/webp'
                  : 'application/octet-stream';

          return { name, url, mimeType, size: 0 };
        }),
      };
    }
  }

  if (Array.isArray(value)) {
    const looksLikeFiles = value.every(
      (item) =>
        isRecord(item) &&
        'url' in item &&
        ('name' in item || 'filename' in item),
    );

    if (looksLikeFiles) {
      return {
        label,
        type: 'FILE_UPLOAD',
        value: value.map((item) => {
          const file = item as ExportRecord;
          return {
            name: stringValue(file.name) || stringValue(file.filename) || 'file',
            url: stringValue(file.url) || '',
            mimeType:
              stringValue(file.mimeType) ||
              stringValue(file.mime_type) ||
              stringValue(file.type) ||
              'application/octet-stream',
            size: Number(file.size || file.size_bytes || 0),
          };
        }),
      };
    }
  }

  return { label, value };
}

function fieldsFromRecord(record: ExportRecord): TallyExportField[] {
  if (Array.isArray(record.fields)) {
    return record.fields.filter(isRecord).map((field) => ({
      label: stringValue(field.label) || stringValue(field.name) || undefined,
      type: stringValue(field.type) || undefined,
      value: field.value,
      options: Array.isArray(field.options)
        ? field.options.filter(isRecord).map((option) => ({
            id: String(option.id),
            text: String(option.text),
          }))
        : undefined,
    }));
  }

  if (isRecord(record.data) && Array.isArray(record.data.fields)) {
    return record.data.fields.filter(isRecord).map((field) => ({
      label: stringValue(field.label) || stringValue(field.name) || undefined,
      type: stringValue(field.type) || undefined,
      value: field.value,
      options: Array.isArray(field.options)
        ? field.options.filter(isRecord).map((option) => ({
            id: String(option.id),
            text: String(option.text),
          }))
        : undefined,
    }));
  }

  return Object.entries(record)
    .filter(([key]) => !KNOWN_METADATA_KEYS.has(normalizeMetadataKey(key)))
    .map(([key, value]) => makeField(key, value));
}

function toTallyLikePayload(record: ExportRecord): TallyLikePayload | null {
  const data = isRecord(record.data) ? record.data : {};
  const submissionId =
    firstString(data, ['submissionid', 'submission id', 'responseid', 'response id']) ||
    firstString(record, [
      'submissionid',
      'submission id',
      'responseid',
      'response id',
      'id',
    ]);

  const responseId =
    firstString(data, ['responseid', 'response id']) ||
    firstString(record, ['responseid', 'response id']);
  const eventId =
    firstString(record, ['eventid', 'event id']) ||
    firstString(data, ['eventid', 'event id']);
  const createdAt =
    firstString(data, ['createdat', 'created at', 'submittedat', 'submitted at']) ||
    firstString(record, ['createdat', 'created at', 'submittedat', 'submitted at']);
  const formName =
    firstString(data, ['formname', 'form name']) ||
    firstString(record, ['formname', 'form name']);

  if (!submissionId && !responseId && !eventId) {
    return null;
  }

  return {
    eventId: eventId || undefined,
    createdAt: createdAt || undefined,
    data: {
      submissionId: submissionId || undefined,
      responseId: responseId || undefined,
      formName: formName || undefined,
      createdAt: createdAt || undefined,
      fields: fieldsFromRecord(record),
    },
  };
}

function parseJsonExport(text: string): ExportRecord[] {
  const parsed = JSON.parse(text) as unknown;

  if (Array.isArray(parsed)) {
    return parsed.filter(isRecord);
  }

  if (isRecord(parsed)) {
    for (const key of ['submissions', 'responses', 'data', 'items']) {
      const value = parsed[key];
      if (Array.isArray(value)) {
        return value.filter(isRecord);
      }
    }
  }

  throw new Error('JSON export must be an array or contain submissions/responses');
}

function parseCsvExport(text: string): ExportRecord[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      value += '"';
      index += 1;
    } else if (
      inQuotes &&
      char === '"' &&
      (next === ',' || next === '\r' || next === '\n' || next === undefined)
    ) {
      inQuotes = false;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(value);
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (inQuotes) {
    throw new Error('CSV export contains an unterminated quoted value');
  }

  row.push(value);
  if (row.some((cell) => cell.length > 0)) {
    rows.push(row);
  }

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.slice(1).map((values) => {
    return Object.fromEntries(
      headers.map((header, index) => [header, values[index] || '']),
    );
  });
}

export function parseTallyBackfillExport(
  text: string,
  fileName = 'export.json',
): ParseBackfillResult {
  const extension = extname(fileName).toLowerCase();
  const records =
    extension === '.csv' ? parseCsvExport(text) : parseJsonExport(text);
  const reports: ParsedBackfillReport[] = [];
  const invalidRows: InvalidBackfillRow[] = [];
  const seen = new Set<string>();

  records.forEach((record, index) => {
    const rawPayload = toTallyLikePayload(record);
    if (!rawPayload) {
      invalidRows.push({ index, reason: 'Missing submission/response/event id' });
      return;
    }

    const normalizedPayload = normalizeTallyPayload(rawPayload);
    const sourceSubmissionId = normalizedPayload.submissionId;
    if (!sourceSubmissionId) {
      invalidRows.push({ index, reason: 'Normalizer produced no submission id' });
      return;
    }

    if (seen.has(sourceSubmissionId)) {
      invalidRows.push({
        index,
        reason: `Duplicate submission id in export: ${sourceSubmissionId}`,
      });
      return;
    }

    seen.add(sourceSubmissionId);
    reports.push({ sourceSubmissionId, rawPayload, normalizedPayload });
  });

  return { reports, invalidRows };
}

export async function parseTallyBackfillExportFile(
  filePath: string,
): Promise<ParseBackfillResult> {
  const text = await readFile(filePath, 'utf8');
  return parseTallyBackfillExport(text, filePath);
}

export async function importBackfillReports({
  reports,
  dryRun,
  limit,
  supabase,
}: {
  reports: ParsedBackfillReport[];
  dryRun: boolean;
  limit?: number;
  supabase?: SupabaseClient;
}): Promise<ImportBackfillResult> {
  const selectedReports = limit ? reports.slice(0, limit) : reports;
  const result: ImportBackfillResult = {
    parsed: selectedReports.length,
    inserted: 0,
    skippedDuplicates: 0,
    invalid: 0,
    failed: 0,
    failures: [],
  };

  if (dryRun || selectedReports.length === 0) {
    return result;
  }

  const client = supabase || getSupabaseAdminClient();
  const sourceIds = selectedReports.map((report) => report.sourceSubmissionId);
  const { data: existingRows, error: lookupError } = await client
    .from('bug_reports')
    .select('source_submission_id')
    .in('source_submission_id', sourceIds);

  if (lookupError) {
    throw lookupError;
  }

  const existingIds = new Set(
    (existingRows || [])
      .map((row) => row.source_submission_id)
      .filter((id): id is string => typeof id === 'string'),
  );
  const newReports = selectedReports.filter(
    (report) => !existingIds.has(report.sourceSubmissionId),
  );

  result.skippedDuplicates = selectedReports.length - newReports.length;

  if (newReports.length === 0) {
    return result;
  }

  const { data: insertedRows, error: insertError } = await client
    .from('bug_reports')
    .insert(
      newReports.map((report) => ({
        source: 'tally',
        source_submission_id: report.sourceSubmissionId,
        status: 'received',
        raw_payload: report.rawPayload,
        normalized_payload: report.normalizedPayload,
      })),
    )
    .select('id, source_submission_id');

  if (insertError) {
    result.failed = newReports.length;
    result.failures.push(insertError.message);
    return result;
  }

  result.inserted = insertedRows?.length || 0;
  return result;
}

export async function loadPendingBackfillReportIds({
  limit,
  supabase = getSupabaseAdminClient(),
}: {
  limit?: number;
  supabase?: SupabaseClient;
}): Promise<string[]> {
  let query = supabase
    .from('bug_reports')
    .select('id')
    .eq('source', 'tally')
    .in('status', ['received', 'retryable_error'])
    .order('created_at', { ascending: true });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return (data || []).map((row) => row.id as string);
}

export async function resetStaleProcessingReports({
  olderThanMinutes = 30,
  supabase = getSupabaseAdminClient(),
}: {
  olderThanMinutes?: number;
  supabase?: SupabaseClient;
} = {}): Promise<StaleProcessingResetResult> {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
  const cutoffIso = cutoff.toISOString();
  const { data, error } = await supabase
    .from('bug_reports')
    .update({
      status: 'retryable_error',
      last_error: `Reset stale processing row older than ${olderThanMinutes} minutes`,
      updated_at: new Date().toISOString(),
    })
    .eq('source', 'tally')
    .eq('status', 'processing')
    .lt('updated_at', cutoffIso)
    .select('id');

  if (error) {
    throw error;
  }

  return { reset: data?.length || 0, cutoffIso };
}
