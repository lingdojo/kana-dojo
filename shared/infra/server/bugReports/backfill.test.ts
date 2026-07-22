import { describe, expect, it, vi } from 'vitest';
import {
  importBackfillReports,
  parseTallyBackfillExport,
  resetStaleProcessingReports,
} from './backfill';

function makeSupabaseMock({
  existingIds = [],
  insertedRows = [],
}: {
  existingIds?: string[];
  insertedRows?: Array<{ id: string; source_submission_id: string }>;
}) {
  const selectAfterInsert = vi.fn().mockResolvedValue({
    data: insertedRows,
    error: null,
  });
  const insert = vi.fn().mockReturnValue({ select: selectAfterInsert });
  const inFilter = vi.fn().mockResolvedValue({
    data: existingIds.map((id) => ({ source_submission_id: id })),
    error: null,
  });
  const selectExisting = vi.fn().mockReturnValue({ in: inFilter });
  const select = vi
    .fn()
    .mockImplementation((columns: string) =>
      columns === 'source_submission_id'
        ? selectExisting(columns)
        : { id: columns },
    );
  const from = vi.fn().mockReturnValue({ select, insert });

  return {
    client: { from },
    insert,
    inFilter,
  };
}

describe('parseTallyBackfillExport', () => {
  it('parses a Tally-style JSON export into normalized reports', () => {
    const result = parseTallyBackfillExport(
      JSON.stringify([
        {
          submissionId: 'sub_1',
          createdAt: '2026-06-01T00:00:00.000Z',
          formName: 'Bug report',
          fields: [
            { label: 'What happened?', value: 'Kana page broke' },
            { label: 'Page URL', value: 'https://kanadojo.com/kana' },
          ],
        },
      ]),
      'bug-reports.json',
    );

    expect(result.invalidRows).toEqual([]);
    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].sourceSubmissionId).toBe('sub_1');
    expect(result.reports[0].normalizedPayload.description).toBe(
      'Kana page broke',
    );
    expect(result.reports[0].normalizedPayload.pageUrl).toBe(
      'https://kanadojo.com/kana',
    );
  });

  it('parses CSV exports and reports rows without submission ids', () => {
    const result = parseTallyBackfillExport(
      [
        'Submission ID,Created At,What happened?,Browser',
        'sub_2,2026-06-02T00:00:00.000Z,Button does nothing,Firefox',
        ',2026-06-03T00:00:00.000Z,Missing id,Chrome',
      ].join('\n'),
      'bug-reports.csv',
    );

    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].sourceSubmissionId).toBe('sub_2');
    expect(result.reports[0].normalizedPayload.browser).toBe('Firefox');
    expect(result.invalidRows).toEqual([
      { index: 1, reason: 'Missing submission/response/event id' },
    ]);
  });

  it('parses quoted CSV values containing commas, quotes, and line breaks', () => {
    const result = parseTallyBackfillExport(
      [
        'Submission ID,What happened?',
        'sub_3,"The button says ""Start"", then crashes',
        'on the next line."',
      ].join('\n'),
      'bug-reports.csv',
    );

    expect(result.invalidRows).toEqual([]);
    expect(result.reports).toHaveLength(1);
    expect(result.reports[0].normalizedPayload.description).toBe(
      'The button says "Start", then crashes\non the next line.',
    );
  });

  it('parses fully quoted CSV headers and values from Tally exports', () => {
    const result = parseTallyBackfillExport(
      [
        '"Submission ID","Submitted at","What happened?"',
        '"sub_quoted","2026-06-02 00:00:00","Button does nothing"',
      ].join('\n'),
      'bug-reports.csv',
    );

    expect(result.invalidRows).toEqual([]);
    expect(result.reports[0].sourceSubmissionId).toBe('sub_quoted');
  });

  it('converts CSV screenshot URLs into file attachments', () => {
    const result = parseTallyBackfillExport(
      [
        '"Submission ID","Provide any related screenshots here (optional)"',
        '"sub_image","https://storage.tally.so/private/example.png?id=1"',
      ].join('\n'),
      'bug-reports.csv',
    );

    expect(result.reports[0].normalizedPayload.attachments).toEqual([
      {
        name: 'example.png',
        url: 'https://storage.tally.so/private/example.png?id=1',
        mimeType: 'image/png',
        size: 0,
      },
    ]);
  });

  it('rejects duplicate submission ids inside the export', () => {
    const result = parseTallyBackfillExport(
      JSON.stringify([{ submissionId: 'sub_1' }, { submissionId: 'sub_1' }]),
      'bug-reports.json',
    );

    expect(result.reports).toHaveLength(1);
    expect(result.invalidRows).toEqual([
      { index: 1, reason: 'Duplicate submission id in export: sub_1' },
    ]);
  });
});

describe('importBackfillReports', () => {
  it('does not write during dry runs', async () => {
    const parsed = parseTallyBackfillExport(
      JSON.stringify([{ submissionId: 'sub_1' }]),
      'bug-reports.json',
    );
    const mock = makeSupabaseMock({});

    const result = await importBackfillReports({
      reports: parsed.reports,
      dryRun: true,
      supabase: mock.client as never,
    });

    expect(result).toMatchObject({ parsed: 1, inserted: 0 });
    expect(mock.insert).not.toHaveBeenCalled();
    expect(mock.inFilter).not.toHaveBeenCalled();
  });

  it('skips rows already present in Supabase', async () => {
    const parsed = parseTallyBackfillExport(
      JSON.stringify([{ submissionId: 'sub_1' }, { submissionId: 'sub_2' }]),
      'bug-reports.json',
    );
    const mock = makeSupabaseMock({
      existingIds: ['sub_1'],
      insertedRows: [{ id: 'report_2', source_submission_id: 'sub_2' }],
    });

    const result = await importBackfillReports({
      reports: parsed.reports,
      dryRun: false,
      supabase: mock.client as never,
    });

    expect(result.inserted).toBe(1);
    expect(result.skippedDuplicates).toBe(1);
    expect(mock.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        source_submission_id: 'sub_2',
        status: 'received',
      }),
    ]);
  });
});

describe('resetStaleProcessingReports', () => {
  it('resets only stale processing rows by source/status/cutoff filters', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [{ id: 'report_1' }, { id: 'report_2' }],
      error: null,
    });
    const lt = vi.fn().mockReturnValue({ select });
    const statusEq = vi.fn().mockReturnValue({ lt });
    const sourceEq = vi.fn().mockReturnValue({ eq: statusEq });
    const update = vi.fn().mockReturnValue({ eq: sourceEq });
    const from = vi.fn().mockReturnValue({ update });

    const result = await resetStaleProcessingReports({
      olderThanMinutes: 30,
      supabase: { from } as never,
    });

    expect(result.reset).toBe(2);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'retryable_error' }),
    );
    expect(sourceEq).toHaveBeenCalledWith('source', 'tally');
    expect(statusEq).toHaveBeenCalledWith('status', 'processing');
    expect(lt).toHaveBeenCalledWith('updated_at', expect.any(String));
  });
});
