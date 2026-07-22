# Tally Bug Report Webhook Route

Route:

```txt
POST /api/webhooks/tally/bug-report
```

This route receives pushed Tally submissions. It should stay fast because Tally expects a timely `2xx` response.

## Request Requirements

Headers:

```txt
Authorization: Bearer <TALLY_WEBHOOK_TOKEN>
Tally-Signature: <base64 hmac sha256 signature>
Content-Type: application/json
```

The route rejects:

- missing or invalid bearer token with `401`
- invalid Tally signature with `401`
- malformed JSON with `400`

## Behavior

1. Parse the raw JSON body.
2. Verify the Tally signature.
3. Normalize the payload with `normalizeTallyPayload`.
4. Check `bug_reports.source_submission_id` for duplicate Tally deliveries.
5. Insert the raw and normalized payload into Supabase with status `received`.
6. Schedule immediate processing with Next.js `after()`.
7. Return `200` after storage succeeds.

Downstream DeepSeek, Supabase Storage, or GitHub failures do not make the webhook fail after the report has been stored. Those failures are handled by the processor retry path.

## Operational Notes

- This route uses the Node.js runtime.
- It has a 30 second Vercel max duration, but normal responses should be much faster.
- It does not expose Supabase, GitHub, Tally, or DeepSeek secrets to client code.
- Duplicate Tally deliveries return `200` and reuse the existing report.

See `shared/infra/server/bugReports/BUG_REPORT_PIPELINE.md` for the full setup checklist and data model.
