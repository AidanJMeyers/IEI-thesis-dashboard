-- =============================================================================
-- Thesis Command Center — initial schema
-- IEI Honors Thesis, Rollins College
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`), then
-- `pnpm setup:storage` and `pnpm seed`.
--
-- Design notes:
--   * `weeks.key_decisions` and `weeks.deliverables` are text[] rather than
--     separate tables — they are short, read-only lists that come straight from
--     weekly-plan.json and are never queried independently.
--   * `weeks.is_current` is stored for completeness but the app derives it from
--     today's date on every load, so it can never go stale.
--   * Row Level Security is the real access boundary. Middleware only decides
--     which routes render; this file decides who can read what.
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- Profiles
-- -----------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('student', 'sponsor', 'committee', 'external')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Profile creation on signup.
--
-- New accounts get 'committee' — the least-privileged viewer role — never
-- 'student'. Promoting someone is a deliberate act:
--
--   update public.profiles set role = 'student' where email = 'Ameyers@rollins.edu';
--
-- Keep public signups DISABLED in Supabase (Authentication → Providers → Email →
-- "Allow new users to sign up" off) so this trigger only ever fires for people
-- you invited.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'committee'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Role lookups run on every RLS check, so keep them cheap and non-recursive.
create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role() = 'student', false);
$$;

-- Anyone signed in with a profile row can read; only the student writes.
create or replace function public.is_viewer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_role() is not null;
$$;

-- -----------------------------------------------------------------------------
-- Evaluation components
-- -----------------------------------------------------------------------------

create table if not exists public.evaluation_components (
  id text primary key,
  semester text not null check (semester in ('fall_2026', 'spring_2027')),
  name text not null,
  weight integer not null check (weight between 0 and 100),
  description text,
  due_date date,
  status text default 'not_started'
    check (status in ('not_started', 'in_progress', 'submitted', 'graded')),
  grade_notes text,
  sort_order integer default 0
);

create index if not exists evaluation_components_semester_idx
  on public.evaluation_components (semester, sort_order);

-- -----------------------------------------------------------------------------
-- Weeks
-- -----------------------------------------------------------------------------

create table if not exists public.weeks (
  id integer primary key,
  week_number integer not null unique,
  start_date date not null,
  end_date date not null,
  phase text not null,
  title text not null,
  has_meeting boolean default false,
  meeting_agenda text,
  meeting_notes text,
  meeting_action_items text,
  key_decisions text[] default '{}',
  deliverables text[] default '{}',
  is_current boolean default false
);

create index if not exists weeks_dates_idx on public.weeks (start_date, end_date);

-- -----------------------------------------------------------------------------
-- Tasks
-- -----------------------------------------------------------------------------

create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  week_id integer references public.weeks(id) on delete set null,
  evaluation_component_id text references public.evaluation_components(id) on delete set null,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('critical', 'high', 'medium', 'low')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'blocked', 'done')),
  due_date date,
  completed_at timestamptz,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tasks_week_idx on public.tasks (week_id, sort_order);
create index if not exists tasks_component_idx on public.tasks (evaluation_component_id);
create index if not exists tasks_status_idx on public.tasks (status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_touch_updated_at on public.tasks;
create trigger tasks_touch_updated_at
  before update on public.tasks
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- Files and links
-- -----------------------------------------------------------------------------

create table if not exists public.files (
  id text primary key default gen_random_uuid()::text,
  task_id text references public.tasks(id) on delete cascade,
  evaluation_component_id text references public.evaluation_components(id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  file_type text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  uploaded_at timestamptz default now()
);

create index if not exists files_component_idx on public.files (evaluation_component_id);
create index if not exists files_task_idx on public.files (task_id);

create table if not exists public.links (
  id text primary key default gen_random_uuid()::text,
  task_id text references public.tasks(id) on delete cascade,
  evaluation_component_id text references public.evaluation_components(id) on delete set null,
  title text not null,
  url text not null,
  link_type text default 'document'
    check (link_type in ('document', 'github', 'drive', 'zotero', 'redcap', 'other')),
  created_at timestamptz default now()
);

create index if not exists links_component_idx on public.links (evaluation_component_id);

-- -----------------------------------------------------------------------------
-- Meetings, activity, notes
-- -----------------------------------------------------------------------------

create table if not exists public.meetings (
  id text primary key default gen_random_uuid()::text,
  week_id integer references public.weeks(id) on delete set null,
  date date not null,
  attendees text[] default '{}',
  agenda text,
  notes text,
  action_items jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create index if not exists meetings_date_idx on public.meetings (date desc);

create table if not exists public.activity_log (
  id text primary key default gen_random_uuid()::text,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details text,
  created_at timestamptz default now()
);

create index if not exists activity_log_created_idx on public.activity_log (created_at desc);

create table if not exists public.notes (
  id text primary key default gen_random_uuid()::text,
  week_id integer references public.weeks(id) on delete set null,
  title text not null,
  content text,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
  before update on public.notes
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
--
--   student            full read/write everywhere
--   sponsor, committee read everything; write meetings and notes
--   external           read evaluation components, tasks, and files only
-- =============================================================================

alter table public.profiles              enable row level security;
alter table public.evaluation_components enable row level security;
alter table public.weeks                 enable row level security;
alter table public.tasks                 enable row level security;
alter table public.files                 enable row level security;
alter table public.links                 enable row level security;
alter table public.meetings              enable row level security;
alter table public.activity_log          enable row level security;
alter table public.notes                 enable row level security;

-- Profiles ---------------------------------------------------------------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_viewer());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

-- Evaluation components ---------------------------------------------------
-- Readable by every signed-in role, including 'external'.
drop policy if exists components_select on public.evaluation_components;
create policy components_select on public.evaluation_components
  for select using (public.is_viewer());

drop policy if exists components_write on public.evaluation_components;
create policy components_write on public.evaluation_components
  for all using (public.is_student()) with check (public.is_student());

-- Weeks -------------------------------------------------------------------
-- 'external' has no business reading the internal week-by-week plan.
drop policy if exists weeks_select on public.weeks;
create policy weeks_select on public.weeks
  for select using (public.current_role() in ('student', 'sponsor', 'committee'));

drop policy if exists weeks_write on public.weeks;
create policy weeks_write on public.weeks
  for all using (public.is_student()) with check (public.is_student());

-- Tasks -------------------------------------------------------------------
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select using (public.is_viewer());

drop policy if exists tasks_write on public.tasks;
create policy tasks_write on public.tasks
  for all using (public.is_student()) with check (public.is_student());

-- Files -------------------------------------------------------------------
drop policy if exists files_select on public.files;
create policy files_select on public.files
  for select using (public.is_viewer());

drop policy if exists files_write on public.files;
create policy files_write on public.files
  for all using (public.is_student()) with check (public.is_student());

-- Links -------------------------------------------------------------------
drop policy if exists links_select on public.links;
create policy links_select on public.links
  for select using (public.current_role() in ('student', 'sponsor', 'committee'));

drop policy if exists links_write on public.links;
create policy links_write on public.links
  for all using (public.is_student()) with check (public.is_student());

-- Meetings ----------------------------------------------------------------
drop policy if exists meetings_select on public.meetings;
create policy meetings_select on public.meetings
  for select using (public.current_role() in ('student', 'sponsor', 'committee'));

drop policy if exists meetings_write_student on public.meetings;
create policy meetings_write_student on public.meetings
  for all using (public.is_student()) with check (public.is_student());

-- Sponsor and committee can annotate a meeting they attended.
drop policy if exists meetings_update_committee on public.meetings;
create policy meetings_update_committee on public.meetings
  for update using (public.current_role() in ('sponsor', 'committee'))
  with check (public.current_role() in ('sponsor', 'committee'));

-- Activity log ------------------------------------------------------------
drop policy if exists activity_select on public.activity_log;
create policy activity_select on public.activity_log
  for select using (public.current_role() in ('student', 'sponsor', 'committee'));

drop policy if exists activity_insert on public.activity_log;
create policy activity_insert on public.activity_log
  for insert with check (public.is_viewer());

drop policy if exists activity_write_student on public.activity_log;
create policy activity_write_student on public.activity_log
  for all using (public.is_student()) with check (public.is_student());

-- Notes -------------------------------------------------------------------
drop policy if exists notes_select on public.notes;
create policy notes_select on public.notes
  for select using (public.current_role() in ('student', 'sponsor', 'committee'));

drop policy if exists notes_write_student on public.notes;
create policy notes_write_student on public.notes
  for all using (public.is_student()) with check (public.is_student());

drop policy if exists notes_insert_committee on public.notes;
create policy notes_insert_committee on public.notes
  for insert with check (public.current_role() in ('sponsor', 'committee'));

-- =============================================================================
-- Realtime — committee members see changes without refreshing
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.evaluation_components;
alter publication supabase_realtime add table public.activity_log;
alter publication supabase_realtime add table public.files;

-- =============================================================================
-- Storage policies
--
-- Buckets themselves are created by `pnpm setup:storage`. These policies assume
-- both buckets are private; the app hands out short-lived signed URLs.
-- =============================================================================

drop policy if exists storage_read on storage.objects;
create policy storage_read on storage.objects
  for select using (
    bucket_id in ('deliverables', 'meeting-docs') and public.is_viewer()
  );

drop policy if exists storage_write on storage.objects;
create policy storage_write on storage.objects
  for all using (
    bucket_id in ('deliverables', 'meeting-docs') and public.is_student()
  ) with check (
    bucket_id in ('deliverables', 'meeting-docs') and public.is_student()
  );
