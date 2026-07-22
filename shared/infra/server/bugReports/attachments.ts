import { randomUUID } from 'node:crypto';
import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MAX_ATTACHMENT_BYTES,
  MAX_ATTACHMENT_COUNT,
  SIGNED_ATTACHMENT_URL_TTL_SECONDS,
} from './config';
import { getBugReportBucketName, getSupabaseAdminClient } from './supabaseAdmin';
import type {
  BugReportAttachmentInput,
  StoredBugReportAttachment,
} from './types';

function safeFileName(fileName: string): string {
  return fileName
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
}

export async function createSignedUrl(path: string): Promise<string | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage
    .from(getBugReportBucketName())
    .createSignedUrl(path, SIGNED_ATTACHMENT_URL_TTL_SECONDS);

  if (error) {
    console.error('[bug-report-processor] Failed to sign attachment URL', error);
    return null;
  }

  return data.signedUrl;
}

export async function copyAttachmentsToSupabase({
  bugReportId,
  attachments,
}: {
  bugReportId: string;
  attachments: BugReportAttachmentInput[];
}): Promise<{
  storedAttachments: StoredBugReportAttachment[];
  errors: string[];
}> {
  const supabase = getSupabaseAdminClient();
  const bucket = getBugReportBucketName();
  const storedAttachments: StoredBugReportAttachment[] = [];
  const errors: string[] = [];

  for (const attachment of attachments.slice(0, MAX_ATTACHMENT_COUNT)) {
    if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(attachment.mimeType)) {
      errors.push(`Rejected ${attachment.name}: unsupported ${attachment.mimeType}`);
      continue;
    }

    if (attachment.size > MAX_ATTACHMENT_BYTES) {
      errors.push(`Rejected ${attachment.name}: file exceeds 10 MB`);
      continue;
    }

    try {
      const response = await fetch(attachment.url, {
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        throw new Error(`download failed with ${response.status}`);
      }

      const contentType =
        response.headers.get('content-type') || attachment.mimeType;
      if (!ALLOWED_ATTACHMENT_MIME_TYPES.has(contentType)) {
        throw new Error(`downloaded file has unsupported type ${contentType}`);
      }

      const bytes = await response.arrayBuffer();
      if (bytes.byteLength > MAX_ATTACHMENT_BYTES) {
        throw new Error('downloaded file exceeds 10 MB');
      }

      const storagePath = `bug-reports/${bugReportId}/${randomUUID()}-${safeFileName(attachment.name)}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, bytes, {
          contentType,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const signedUrl = await createSignedUrl(storagePath);

      const { error: insertError } = await supabase
        .from('bug_report_attachments')
        .insert({
          bug_report_id: bugReportId,
          original_url: attachment.url,
          original_name: attachment.name,
          storage_path: storagePath,
          mime_type: contentType,
          size_bytes: bytes.byteLength,
        });

      if (insertError) {
        throw insertError;
      }

      storedAttachments.push({
        name: attachment.name,
        storagePath,
        mimeType: contentType,
        size: bytes.byteLength,
        signedUrl,
      });
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      errors.push(`Failed ${attachment.name}: ${detail}`);
    }
  }

  return { storedAttachments, errors };
}
