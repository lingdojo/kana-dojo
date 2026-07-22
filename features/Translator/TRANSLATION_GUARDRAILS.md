# Translator Guardrails

This feature contains the user-facing translator experience and the client-side behavior that keeps it pleasant for real learners.

## What changed

- URL-prefill translations now auto-run only for short snippets.
- Longer shared text still pre-fills the input, but requires an intentional user action.
- The store now carries optional verification state so suspicious requests can be challenged without changing the normal path.
- Client requests include a request context so the server can distinguish manual use from URL-driven traffic.
- The server route uses Azure Translator by default and falls back to Google Cloud Translation if Azure fails.

## SEO note

These changes do not alter the page-level metadata, schema, or static copy that search engines index on the translator pages. The private API route can now reject automated billable calls, but that does not change the crawlable content of the page itself.

## Intent

The aim is to make the translator feel unchanged for real people while reducing abuse and protecting the Google Cloud bill.

