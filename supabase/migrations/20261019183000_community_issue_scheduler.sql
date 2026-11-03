create table public.community_issue_scheduler (
  scheduler_key text primary key check (scheduler_key = 'community-issues'),
  next_run_at timestamptz not null default clock_timestamp(),
  active_run_id text,
  claim_expires_at timestamptz,
  updated_at timestamptz not null default clock_timestamp()
);

insert into public.community_issue_scheduler (scheduler_key)
values ('community-issues')
on conflict (scheduler_key) do nothing;

alter table public.community_issue_scheduler enable row level security;
revoke all on public.community_issue_scheduler from public, anon, authenticated;
grant all on public.community_issue_scheduler to service_role;

create or replace function public.community_issue_scheduler_claim_due(
  p_run_id text,
  p_lease_seconds integer
)
returns table (claim_status text, due_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  scheduler_row public.community_issue_scheduler%rowtype;
  current_time_utc timestamptz := clock_timestamp();
begin
  if p_run_id is null or p_run_id = '' then
    raise exception 'run ID is required';
  end if;
  if p_lease_seconds < 1 then
    raise exception 'lease duration must be at least one second';
  end if;

  insert into public.community_issue_scheduler (scheduler_key)
  values ('community-issues')
  on conflict (scheduler_key) do nothing;

  select * into scheduler_row
  from public.community_issue_scheduler
  where scheduler_key = 'community-issues'
  for update;

  if scheduler_row.next_run_at > current_time_utc then
    return query select 'not_due'::text, scheduler_row.next_run_at;
    return;
  end if;

  if scheduler_row.active_run_id is not null
     and scheduler_row.claim_expires_at > current_time_utc then
    return query select 'already_claimed'::text, scheduler_row.next_run_at;
    return;
  end if;

  update public.community_issue_scheduler
  set active_run_id = p_run_id,
      claim_expires_at = current_time_utc + make_interval(secs => p_lease_seconds),
      updated_at = current_time_utc
  where scheduler_key = 'community-issues';

  return query select 'claimed_by_us'::text, scheduler_row.next_run_at;
end;
$$;

create or replace function public.community_issue_scheduler_complete(
  p_run_id text,
  p_outcome text,
  p_interval_minutes integer
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  scheduler_row public.community_issue_scheduler%rowtype;
  current_time_utc timestamptz := clock_timestamp();
begin
  if p_outcome not in ('created', 'no_issue', 'failed') then
    raise exception 'invalid scheduler outcome';
  end if;
  if p_interval_minutes < 1 then
    raise exception 'scheduler interval must be at least one minute';
  end if;

  select * into scheduler_row
  from public.community_issue_scheduler
  where scheduler_key = 'community-issues'
  for update;

  if not found or scheduler_row.active_run_id is distinct from p_run_id then
    return false;
  end if;

  update public.community_issue_scheduler
  set next_run_at = case
        when p_outcome in ('created', 'no_issue')
          then current_time_utc + make_interval(mins => p_interval_minutes)
        else next_run_at
      end,
      active_run_id = null,
      claim_expires_at = null,
      updated_at = current_time_utc
  where scheduler_key = 'community-issues';

  return true;
end;
$$;

create or replace function public.community_issue_scheduler_release(p_run_id text)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  affected_rows integer;
begin
  update public.community_issue_scheduler
  set active_run_id = null,
      claim_expires_at = null,
      updated_at = clock_timestamp()
  where scheduler_key = 'community-issues'
    and active_run_id = p_run_id;

  get diagnostics affected_rows = row_count;
  return affected_rows = 1;
end;
$$;

revoke all on function public.community_issue_scheduler_claim_due(text, integer)
  from public, anon, authenticated;
revoke all on function public.community_issue_scheduler_complete(text, text, integer)
  from public, anon, authenticated;
revoke all on function public.community_issue_scheduler_release(text)
  from public, anon, authenticated;
grant execute on function public.community_issue_scheduler_claim_due(text, integer)
  to service_role;
grant execute on function public.community_issue_scheduler_complete(text, text, integer)
  to service_role;
grant execute on function public.community_issue_scheduler_release(text)
  to service_role;
