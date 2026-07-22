# Bug Report Processor Route

Routes:

```txt
GET /api/process-bug-reports
POST /api/process-bug-reports
```

This route processes stored bug reports. It is used by Vercel Cron as a retry safety net and can also be called manually for a specific report.

## Authentication

Accepted headers:

```txt
Authorization: Bearer <BUG_REPORT_PROCESSOR_SECRET>
Authorization: Bearer <CRON_SECRET>
```

Vercel Cron uses `GET` and the existing `CRON_SECRET` behavior. Manual invocations should use `POST` with `BUG_REPORT_PROCESSOR_SECRET`.

## Manual Single-Report Processing

```http
POST /api/process-bug-reports
Authorization: Bearer <BUG_REPORT_PROCESSOR_SECRET>
Content-Type: application/json
```

```json
{
  "reportId": "supabase-report-uuid"
}
```

## Batch Retry Processing

`GET` or `POST` without a `reportId` processes up to 5 reports where:

```txt
status is received or retryable_error
attempts < 5
```

Reports are processed oldest-first.

## Processing Steps

1. Mark report `processing`.
2. Increment `attempts`.
3. Normalize Tally payload if the row does not already have `normalized_payload`.
4. Copy accepted image attachments to Supabase Storage.
5. Format the report with DeepSeek.
6. Fall back to normalized fields if DeepSeek fails.
7. Create a GitHub issue.
8. Store GitHub issue number, URL, cleaned payload, title, severity, labels, and final status.

## Failure Rules

- DeepSeek failure: continue with fallback cleaned content.
- Attachment failure: continue and add the failure to triage notes.
- GitHub failure: mark `retryable_error`.
- Fifth failed attempt: mark `failed`.

See `shared/infra/server/bugReports/BUG_REPORT_PIPELINE.md` for schema, setup, and rollout details.
