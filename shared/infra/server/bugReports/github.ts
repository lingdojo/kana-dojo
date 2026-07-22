import type {
  CleanedBugReport,
  NormalizedBugReport,
  StoredBugReportAttachment,
} from './types';

const GITHUB_TIMEOUT_MS = 10000;
const EMAIL_ADDRESS_PATTERN = /[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

function redactEmailAddresses(value: string): string {
  return value.replace(EMAIL_ADDRESS_PATTERN, '[redacted]');
}

function isEmailField(label: string): boolean {
  return /\be-?mail\b/i.test(label);
}
function valueOrUnknown(value: string | null): string {
  return value?.trim() || 'Unknown';
}

function formatOriginalFields(fields: Record<string, unknown>): string {
  const entries = Object.entries(fields).filter(([label, value]) => {
    if (isEmailField(label)) {
      return false;
    }
    if (value === null || value === undefined) {
      return false;
    }
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return true;
  });

  if (!entries.length) {
    return 'None.';
  }

  return entries
    .map(([label, value]) => {
      const text =
        typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      return `### ${label}\n\n${redactEmailAddresses(text)}`;
    })
    .join('\n\n');
}

export function formatGitHubIssueBody({
  reportId,
  sourceSubmissionId,
  normalized,
  cleaned,
  attachments,
  processingNotes,
}: {
  reportId: string;
  sourceSubmissionId: string | null;
  normalized: NormalizedBugReport;
  cleaned: CleanedBugReport;
  attachments: StoredBugReportAttachment[];
  processingNotes: string[];
}): string {
  const steps = cleaned.stepsToReproduce.length
    ? cleaned.stepsToReproduce
        .map((step, index) => `${index + 1}. ${step}`)
        .join('\n')
    : 'Not provided.';

  const attachmentLines = attachments.length
    ? attachments
        .map((attachment) =>
          attachment.signedUrl
            ? `- [${attachment.name}](${attachment.signedUrl})`
            : `- ${attachment.name} (${attachment.storagePath})`,
        )
        .join('\n')
    : 'None.';

  const missingInfo = cleaned.missingInfo.length
    ? cleaned.missingInfo.map((item) => `- ${item}`).join('\n')
    : 'None.';

  const notes = [
    cleaned.triageNotes,
    ...processingNotes,
  ]
    .filter(Boolean)
    .join('\n\n');

  const body = `## Summary

${cleaned.summary}

## Steps To Reproduce

${steps}

## Expected Behavior

${valueOrUnknown(cleaned.expectedBehavior)}

## Actual Behavior

${valueOrUnknown(cleaned.actualBehavior)}

## Environment

- Page: ${valueOrUnknown(cleaned.environment.pageUrl)}
- Feature: ${valueOrUnknown(cleaned.environment.feature)}
- Device: ${valueOrUnknown(cleaned.environment.device)}
- Browser: ${valueOrUnknown(cleaned.environment.browser)}
- Locale: ${valueOrUnknown(cleaned.environment.locale)}

## Attachments

${attachmentLines}

## Triage Notes

${notes || 'None.'}

## Missing Info

${missingInfo}

## Source

- Source: Tally
- Report ID: ${reportId}
- Tally submission ID: ${sourceSubmissionId || 'Unknown'}
- Submitted at: ${normalized.submittedAt || 'Unknown'}

## Original User-Entered Fields

${formatOriginalFields(normalized.fields)}
`;

  return redactEmailAddresses(body);
}

export async function createGitHubIssue({
  title,
  body,
  labels,
}: {
  title: string;
  body: string;
  labels: string[];
}): Promise<{ number: number; htmlUrl: string }> {
  const githubPat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_REPO_OWNER || 'lingdojo';
  const repo = process.env.GITHUB_REPO_NAME || 'kana-dojo';

  if (!githubPat) {
    throw new Error('GITHUB_PAT is not configured');
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, labels }),
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`GitHub issue API error ${response.status}: ${detail}`);
  }

  const data = (await response.json()) as {
    number?: number;
    html_url?: string;
  };

  if (!data.number || !data.html_url) {
    throw new Error('GitHub issue API returned an invalid response');
  }

  return { number: data.number, htmlUrl: data.html_url };
}

export async function getGitHubIssue(issueNumber: number): Promise<{
  body: string;
}> {
  const githubPat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_REPO_OWNER || 'lingdojo';
  const repo = process.env.GITHUB_REPO_NAME || 'kana-dojo';

  if (!githubPat) {
    throw new Error('GITHUB_PAT is not configured');
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub issue API error ${response.status}`);
  }

  const data = (await response.json()) as { body?: string | null };
  return { body: data.body || '' };
}

export async function updateGitHubIssueBody({
  issueNumber,
  body,
}: {
  issueNumber: number;
  body: string;
}): Promise<void> {
  const githubPat = process.env.GITHUB_PAT;
  const owner = process.env.GITHUB_REPO_OWNER || 'lingdojo';
  const repo = process.env.GITHUB_REPO_NAME || 'kana-dojo';

  if (!githubPat) {
    throw new Error('GITHUB_PAT is not configured');
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${githubPat}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
      signal: AbortSignal.timeout(GITHUB_TIMEOUT_MS),
    },
  );

  if (!response.ok) {
    throw new Error(`GitHub issue API error ${response.status}`);
  }
}
