-- ============================================================
-- 006_lesson_practice_and_tracking.sql
-- Two additive changes needed for the spoken-English course:
--
-- 1. question_sets.lesson_id — an optional direct link from a
--    question set to the single lesson it's the practice exercise
--    for. Existing question sets stay node-scoped (node_id); this is
--    for the new "one lesson -> one practice set" course structure,
--    where several lessons can share a topic node so node_id alone
--    isn't precise enough to isolate "this lesson's exercise".
--
-- 2. quiz_attempts — persists a graded attempt so a signed-in
--    student's score history can be shown back to them. Previously
--    submitQuizAttempt() graded and returned a result that was never
--    stored anywhere.
-- ============================================================

alter table public.question_sets
  add column lesson_id uuid references public.lessons (id) on delete cascade;

create index question_sets_lesson_id_idx on public.question_sets (lesson_id) where lesson_id is not null;

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  question_set_id uuid not null references public.question_sets (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete cascade,
  earned_marks numeric not null,
  scorable_marks numeric not null,
  percent integer not null check (percent between 0 and 100),
  created_at timestamptz not null default now()
);

comment on table public.quiz_attempts is 'One row per graded practice-quiz submission, for score history / progress tracking.';

create index quiz_attempts_user_id_created_at_idx on public.quiz_attempts (user_id, created_at desc);
create index quiz_attempts_user_id_lesson_id_idx on public.quiz_attempts (user_id, lesson_id);

alter table public.quiz_attempts enable row level security;

create policy "quiz_attempts_select_own" on public.quiz_attempts
  for select to authenticated
  using (user_id = auth.uid());

create policy "quiz_attempts_insert_own" on public.quiz_attempts
  for insert to authenticated
  with check (user_id = auth.uid());
