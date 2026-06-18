import { z } from 'zod';
import {
  BUG_REPORT_LABELS,
  BUG_REPORT_SEVERITIES,
  REQUIRED_BUG_REPORT_LABELS,
} from './config';
import type { CleanedBugReport, NormalizedBugReport } from './types';

const CleanedBugReportSchema = z.object({
  title: z.string().min(1).max(160),
  summary: z.string().min(1),
  stepsToReproduce: z.array(z.string()).default([]),
  expectedBehavior: z.string().nullable().default(null),
  actualBehavior: z.string().nullable().default(null),
  environment: z
    .object({
      pageUrl: z.string().nullable().default(null),
      feature: z.string().nullable().default(null),
      device: z.string().nullable().default(null),
      browser: z.string().nullable().default(null),
      locale: z.string().nullable().default(null),
    })
    .default({
      pageUrl: null,
      feature: null,
      device: null,
      browser: null,
      locale: null,
    }),
  severity: z.enum(BUG_REPORT_SEVERITIES).default('medium'),
  labels: z.array(z.enum(BUG_REPORT_LABELS)).default([]),
  triageNotes: z.string().nullable().default(null),
  missingInfo: z.array(z.string()).default([]),
});

const DEEPSEEK_TIMEOUT_MS = 12000;
const DEEPSEEK_MODEL = 'deepseek-chat';

const DEEPSEEK_PROMPT = `You are formatting user-submitted bug reports for the KanaDojo GitHub issue tracker.

KanaDojo is a Japanese learning web app for Hiragana, Katakana, Kanji, Vocabulary, translation, and practice games.

Your job:
- Clean up the user's report.
- Preserve the user's meaning.
- Do not invent facts.
- If information is missing, use null or an empty array.
- Do not include private personal data unless it is directly needed to debug the issue.
- Return only valid JSON matching the requested schema.
- Do not wrap the JSON in Markdown.

Allowed labels:
["bug", "user-report", "needs-triage", "accessibility", "mobile", "desktop", "regression"]

Allowed severities:
["low", "medium", "high", "critical"]

Return this JSON shape:

{
  "title": "Short GitHub issue title, max 90 characters",
  "summary": "Clear one-paragraph summary of the bug",
  "stepsToReproduce": ["Step 1", "Step 2"],
  "expectedBehavior": "What the user expected, or null",
  "actualBehavior": "What happened instead, or null",
  "environment": {
    "pageUrl": "URL or null",
    "feature": "Feature area or null",
    "device": "Device or null",
    "browser": "Browser or null",
    "locale": "Locale/language or null"
  },
  "severity": "low | medium | high | critical",
  "labels": ["bug", "user-report", "needs-triage"],
  "triageNotes": "Brief maintainer-facing notes, or null",
  "missingInfo": ["Question that would help debugging"]
}`;

function clampTitle(title: string): string {
  const trimmed = title.trim();
  return trimmed.length <= 90 ? trimmed : `${trimmed.slice(0, 87)}...`;
}

function mergeLabels(labels: string[]): string[] {
  const allowedLabels = new Set<string>(BUG_REPORT_LABELS);
  const merged = [...REQUIRED_BUG_REPORT_LABELS, ...labels].filter((label) =>
    allowedLabels.has(label),
  );
  return Array.from(new Set(merged));
}

export function createFallbackCleanedReport(
  report: NormalizedBugReport,
): CleanedBugReport {
  const feature = report.feature || report.pageUrl || report.formName || 'report';
  const summary =
    report.description ||
    report.actualBehavior ||
    'A user submitted a bug report without a description.';

  return {
    title: clampTitle(`User bug report: ${feature}`),
    summary,
    stepsToReproduce: [],
    expectedBehavior: report.expectedBehavior,
    actualBehavior: report.actualBehavior || report.description,
    environment: {
      pageUrl: report.pageUrl,
      feature: report.feature,
      device: report.device,
      browser: report.browser,
      locale: report.locale,
    },
    severity: 'medium',
    labels: mergeLabels([]),
    triageNotes: null,
    missingInfo: ['Steps to reproduce', 'Expected behavior'],
  };
}

function sanitizeCleanedReport(report: CleanedBugReport): CleanedBugReport {
  return {
    ...report,
    title: clampTitle(report.title),
    labels: mergeLabels(report.labels),
  };
}

export async function formatBugReportWithDeepSeek(
  report: NormalizedBugReport,
): Promise<{ cleaned: CleanedBugReport; usedFallback: boolean }> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return {
      cleaned: createFallbackCleanedReport(report),
      usedFallback: true,
    };
  }

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_BUG_REPORT_MODEL || DEEPSEEK_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: DEEPSEEK_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            description: report.description,
            pageUrl: report.pageUrl,
            feature: report.feature,
            expectedBehavior: report.expectedBehavior,
            actualBehavior: report.actualBehavior,
            device: report.device,
            browser: report.browser,
            locale: report.locale,
            submittedAt: report.submittedAt,
            attachments: report.attachments.map(({ name, mimeType, size }) => ({
              name,
              mimeType,
              size,
            })),
          }),
        },
      ],
    }),
    signal: AbortSignal.timeout(DEEPSEEK_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('DeepSeek returned an empty response');
  }

  try {
    const parsed = CleanedBugReportSchema.parse(JSON.parse(content));
    return {
      cleaned: sanitizeCleanedReport(parsed),
      usedFallback: false,
    };
  } catch (error) {
    console.error('[bug-report-processor] DeepSeek JSON validation failed', error);
    return {
      cleaned: createFallbackCleanedReport(report),
      usedFallback: true,
    };
  }
}
