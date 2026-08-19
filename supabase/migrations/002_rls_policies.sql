-- ============================================================
-- 002_rls_policies.sql
-- Row Level Security for every public table. Nothing here trusts
-- the client: anonymous/student access is read-only and limited to
-- published content plus the user's own rows; all writes to
-- educational content require the admin or editor role.
-- ============================================================

alter table public.profiles enable row level security;
alter table public.content_nodes enable row level security;
alter table public.lessons enable row level security;
alter table public.question_sets enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.vocabulary enable row level security;
alter table public.bookmarks enable row level security;
alter table public.lesson_progress enable row level security;

-- ------------------------------------------------------------
-- profiles
-- Row creation happens via the handle_new_user trigger (SECURITY
-- DEFINER), so no client-facing INSERT policy is needed. Role
-- changes are additionally blocked for non-admins by the
-- prevent_role_escalation trigger from 001.
-- ------------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin" on public.profiles
  for select to authenticated
  using (public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_update_admin" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "profiles_delete_admin" on public.profiles
  for delete to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- content_nodes
-- ------------------------------------------------------------
create policy "content_nodes_select_published" on public.content_nodes
  for select to anon, authenticated
  using (is_published = true);

create policy "content_nodes_select_manager" on public.content_nodes
  for select to authenticated
  using (public.is_content_manager());

create policy "content_nodes_write_manager" on public.content_nodes
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- lessons
-- ------------------------------------------------------------
create policy "lessons_select_published" on public.lessons
  for select to anon, authenticated
  using (status = 'published');

create policy "lessons_select_manager" on public.lessons
  for select to authenticated
  using (public.is_content_manager());

create policy "lessons_write_manager" on public.lessons
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- question_sets
-- ------------------------------------------------------------
create policy "question_sets_select_published" on public.question_sets
  for select to anon, authenticated
  using (is_published = true);

create policy "question_sets_select_manager" on public.question_sets
  for select to authenticated
  using (public.is_content_manager());

create policy "question_sets_write_manager" on public.question_sets
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- questions (visible only when the parent question set is published)
-- ------------------------------------------------------------
create policy "questions_select_published" on public.questions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.question_sets qs
      where qs.id = questions.question_set_id
        and qs.is_published = true
    )
  );

create policy "questions_select_manager" on public.questions
  for select to authenticated
  using (public.is_content_manager());

create policy "questions_write_manager" on public.questions
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- question_options (visible only when the parent question set is published)
-- ------------------------------------------------------------
create policy "question_options_select_published" on public.question_options
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.questions q
      join public.question_sets qs on qs.id = q.question_set_id
      where q.id = question_options.question_id
        and qs.is_published = true
    )
  );

create policy "question_options_select_manager" on public.question_options
  for select to authenticated
  using (public.is_content_manager());

create policy "question_options_write_manager" on public.question_options
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- vocabulary (open reference content, no draft/publish state)
-- ------------------------------------------------------------
create policy "vocabulary_select_all" on public.vocabulary
  for select to anon, authenticated
  using (true);

create policy "vocabulary_write_manager" on public.vocabulary
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- bookmarks (student-owned)
-- ------------------------------------------------------------
create policy "bookmarks_select_own" on public.bookmarks
  for select to authenticated
  using (user_id = auth.uid());

create policy "bookmarks_insert_own" on public.bookmarks
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "bookmarks_delete_own" on public.bookmarks
  for delete to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- lesson_progress (student-owned)
-- ------------------------------------------------------------
create policy "lesson_progress_select_own" on public.lesson_progress
  for select to authenticated
  using (user_id = auth.uid());

create policy "lesson_progress_insert_own" on public.lesson_progress
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "lesson_progress_update_own" on public.lesson_progress
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "lesson_progress_delete_own" on public.lesson_progress
  for delete to authenticated
  using (user_id = auth.uid());
