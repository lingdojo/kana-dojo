create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'tally',
  source_submission_id text unique,
  status text not null default 'received',
  raw_payload jsonb not null,
  normalized_payload jsonb,
  cleaned_payload jsonb,
  title text,
  description text,
  severity text,
  labels text[] not null default '{}',
  github_issue_number integer,
  github_issue_url text,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bug_reports_status_check check (
    status in (
      'received',
      'processing',
      'github_created',
      'retryable_error',
      'failed'
    )
  ),
  constraint bug_reports_attempts_check check (attempts >= 0)
);

create table if not exists public.bug_report_attachments (
  id uuid primary key default gen_random_uuid(),
  bug_report_id uuid not null references public.bug_reports(id) on delete cascade,
  original_url text,
  original_name text,
  storage_path text not null,
  mime_type text,
  size_bytes integer,
  created_at timestamptz not null default now(),
  constraint bug_report_attachments_size_bytes_check check (
    size_bytes is null or size_bytes >= 0
  )
);

alter table public.bug_reports enable row level security;
alter table public.bug_report_attachments enable row level security;

create index if not exists bug_reports_status_attempts_created_at_idx
  on public.bug_reports (status, attempts, created_at);

create index if not exists bug_report_attachments_bug_report_id_idx
  on public.bug_report_attachments (bug_report_id);

create or replace function public.set_bug_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_bug_reports_updated_at on public.bug_reports;

create trigger set_bug_reports_updated_at
before update on public.bug_reports
for each row
execute function public.set_bug_reports_updated_at();

insert into storage.buckets (id, name, public)
values ('bug-report-attachments', 'bug-report-attachments', false)
on conflict (id) do update
set public = excluded.public;
