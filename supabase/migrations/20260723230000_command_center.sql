-- APROPOS Procurement Intelligence Engine Command Center
-- Operational control plane schema

create extension if not exists pgcrypto;

create type public.command_run_status as enum ('queued','running','retrying','stopping','stopped','interrupted','failed','completed_with_failures','completed');
create type public.command_job_status as enum ('pending','running','retrying','failed','completed','skipped','stopped');

create table if not exists public.command_runs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  status public.command_run_status not null default 'queued',
  current_stage text,
  requested_by uuid references auth.users(id),
  stop_requested_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  execution_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.command_jobs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.command_runs(id) on delete cascade,
  sequence_number smallint not null check (sequence_number between 1 and 5),
  agent_name text not null,
  function_name text not null,
  status public.command_job_status not null default 'pending',
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  input_payload jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(run_id, sequence_number)
);

create table if not exists public.command_events (
  id bigint generated always as identity primary key,
  run_id uuid references public.command_runs(id) on delete cascade,
  job_id uuid references public.command_jobs(id) on delete cascade,
  event_type text not null,
  severity text not null default 'info',
  message text not null,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.command_failures (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.command_runs(id) on delete cascade,
  job_id uuid references public.command_jobs(id) on delete cascade,
  agent_name text,
  failure_type text not null,
  recoverable boolean not null default false,
  attempt_number integer not null default 1,
  error_code text,
  error_message text not null,
  evidence jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.command_metrics (
  id bigint generated always as identity primary key,
  run_id uuid not null references public.command_runs(id) on delete cascade,
  job_id uuid references public.command_jobs(id) on delete cascade,
  metric_name text not null,
  metric_value numeric,
  metric_text text,
  metric_dimensions jsonb not null default '{}'::jsonb,
  recorded_at timestamptz not null default now()
);

create table if not exists public.daily_executive_briefs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null unique references public.command_runs(id) on delete cascade,
  brief_date date not null default current_date,
  overall_status text not null,
  executive_summary jsonb not null,
  acquisition jsonb not null,
  intelligence_processing jsonb not null,
  eligibility jsonb not null,
  delivery jsonb not null,
  system_health jsonb not null,
  content jsonb not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.system_status (
  singleton boolean primary key default true check (singleton),
  operational_status text not null default 'operational',
  current_run_id uuid references public.command_runs(id),
  current_execution_state text not null default 'idle',
  current_workflow_stage text,
  queue_depth integer not null default 0,
  connector_health jsonb not null default '{}'::jsonb,
  execution_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.system_status(singleton) values(true) on conflict(singleton) do nothing;

create index if not exists command_runs_status_idx on public.command_runs(status, created_at desc);
create index if not exists command_jobs_run_status_idx on public.command_jobs(run_id, status, sequence_number);
create index if not exists command_events_run_idx on public.command_events(run_id, created_at desc);
create index if not exists command_failures_run_idx on public.command_failures(run_id, created_at desc);
create index if not exists command_metrics_run_idx on public.command_metrics(run_id, metric_name);

create or replace function public.command_touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger command_runs_touch before update on public.command_runs for each row execute function public.command_touch_updated_at();
create trigger command_jobs_touch before update on public.command_jobs for each row execute function public.command_touch_updated_at();
create trigger system_status_touch before update on public.system_status for each row execute function public.command_touch_updated_at();

alter table public.command_runs enable row level security;
alter table public.command_jobs enable row level security;
alter table public.command_events enable row level security;
alter table public.command_failures enable row level security;
alter table public.command_metrics enable row level security;
alter table public.daily_executive_briefs enable row level security;
alter table public.system_status enable row level security;

create or replace function public.command_is_operator() returns boolean language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid()
      and lower(email) in ('jmitchell@aproposgroupllc.com','jmitchell1126@gmail.com')
  );
$$;

revoke all on function public.command_is_operator() from public;
grant execute on function public.command_is_operator() to authenticated;

create policy command_runs_operator_read on public.command_runs for select to authenticated using (public.command_is_operator());
create policy command_jobs_operator_read on public.command_jobs for select to authenticated using (public.command_is_operator());
create policy command_events_operator_read on public.command_events for select to authenticated using (public.command_is_operator());
create policy command_failures_operator_read on public.command_failures for select to authenticated using (public.command_is_operator());
create policy command_metrics_operator_read on public.command_metrics for select to authenticated using (public.command_is_operator());
create policy daily_briefs_operator_read on public.daily_executive_briefs for select to authenticated using (public.command_is_operator());
create policy system_status_operator_read on public.system_status for select to authenticated using (public.command_is_operator());

revoke insert, update, delete on public.command_runs, public.command_jobs, public.command_events, public.command_failures, public.command_metrics, public.daily_executive_briefs, public.system_status from anon, authenticated;
