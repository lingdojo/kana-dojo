import { NextResponse } from 'next/server';
import { verifyBearerToken } from '@/shared/infra/server/bugReports/auth';
import { processBugReports } from '@/shared/infra/server/bugReports/processor';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface ProcessBugReportsRequest {
  reportId?: string;
}

async function handleProcessRequest(request: Request, reportId?: string) {
  const authHeader = request.headers.get('authorization');
  const hasProcessorAuth = verifyBearerToken(
    authHeader,
    process.env.BUG_REPORT_PROCESSOR_SECRET,
  );
  const hasCronAuth = verifyBearerToken(authHeader, process.env.CRON_SECRET);

  if (!hasProcessorAuth && !hasCronAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results = await processBugReports(reportId);
    return NextResponse.json({ ok: true, results }, { status: 200 });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error('[bug-report-processor] route failed', error);
    return NextResponse.json(
      { error: 'Bug report processing failed', detail },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  return handleProcessRequest(request);
}

export async function POST(request: Request) {
  let body: ProcessBugReportsRequest = {};
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    body = (await request.json().catch(() => ({}))) as ProcessBugReportsRequest;
  }

  return handleProcessRequest(request, body.reportId);
}
