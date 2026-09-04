-- ============================================================
-- 037_level_test_results.sql
-- Stores completed attempts of the "Test your English level"
-- placement quiz shown on the dashboard. One row per attempt (a
-- user can retake it — history is kept, callers read the latest).
-- ============================================================

create table public.level_test_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  score integer not null,
  total integer not null,
  percent integer not null check (percent between 0 and 100),
  created_at timestamptz not null default now()
);

comment on table public.level_test_results is 'One row per completed English-level placement test attempt.';

create index level_test_results_user_id_created_at_idx on public.level_test_results (user_id, created_at desc);

alter table public.level_test_results enable row level security;

create policy "level_test_results_select_own" on public.level_test_results
  for select to authenticated
  using (user_id = auth.uid());

create policy "level_test_results_insert_own" on public.level_test_results
  for insert to authenticated
  with check (user_id = auth.uid());
