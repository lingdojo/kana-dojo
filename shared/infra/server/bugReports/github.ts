import type {
  CleanedBugReport,
  NormalizedBugReport,
  StoredBugReportAttachment,
} from './types';

const GITHUB_TIMEOUT_MS = 10000;

function valueOrUnknown(value: string | null): string {
  return value?.trim() || 'Unknown';
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
    normalized.contact ? `Reporter contact: ${normalized.contact}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  return `## Summary

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
`;
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
