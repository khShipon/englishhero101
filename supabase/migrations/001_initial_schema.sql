-- ============================================================
-- 001_initial_schema.sql
-- Core tables for EnglishHero101: profiles, the recursive content
-- hierarchy, lessons, the question bank, vocabulary, and student
-- progress tracking.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- profiles
-- One row per auth.users row. Role drives authorization; kept as
-- TEXT (not an enum) so new roles can be introduced with a plain
-- CHECK-constraint migration instead of an enum-type migration.
-- ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('admin', 'editor', 'student')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with app-level profile and role data.';

-- ------------------------------------------------------------
-- content_nodes
-- Recursive category/section/topic/subtopic/lesson-folder hierarchy.
-- node_type is intentionally free-text so the admin can introduce
-- new kinds of nodes without a schema change.
-- ------------------------------------------------------------
create table public.content_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.content_nodes (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  node_type text not null,
  icon text,
  cover_image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint content_nodes_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.content_nodes is 'Recursive, admin-managed content hierarchy (categories, sections, topics, subtopics, ...).';

-- Slug must be unique among siblings (same parent), including at the
-- top level. NULL parent_id values are folded to a fixed sentinel so
-- Postgres treats all top-level nodes as sharing one uniqueness scope
-- (plain NULLs would otherwise each be considered distinct).
create unique index content_nodes_parent_slug_key
  on public.content_nodes (coalesce(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), slug);

-- ------------------------------------------------------------
-- lessons
-- ------------------------------------------------------------
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.content_nodes (id) on delete cascade,
  title text not null,
  slug text not null,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  content_format text not null default 'tiptap',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  difficulty text,
  estimated_minutes integer,
  author_id uuid references public.profiles (id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint lessons_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  unique (node_id, slug)
);

comment on table public.lessons is 'Rich-text lessons attached to a content node. content is portable JSON (Tiptap document), never raw HTML/components.';

-- ------------------------------------------------------------
-- question bank: question_sets -> questions -> question_options
-- ------------------------------------------------------------
create table public.question_sets (
  id uuid primary key default gen_random_uuid(),
  node_id uuid references public.content_nodes (id) on delete cascade,
  title text not null,
  description text,
  exam_type text,
  subject text,
  year integer,
  board text,
  difficulty text,
  duration_minutes integer,
  marks numeric,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.question_sets (id) on delete cascade,
  question_text text not null,
  question_type text not null check (
    question_type in (
      'multiple_choice',
      'multiple_answer',
      'true_false',
      'fill_in_blank',
      'short_answer',
      'matching',
      'ordering',
      'written_answer'
    )
  ),
  explanation text,
  marks numeric not null default 1,
  difficulty text,
  sort_order integer not null default 0,
  correct_answer text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.questions.correct_answer is 'Used for option-less types (fill_in_blank, short_answer, ordering, matching); option-based types use question_options.is_correct instead.';

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

-- ------------------------------------------------------------
-- vocabulary
-- ------------------------------------------------------------
create table public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  word text not null,
  pronunciation text,
  part_of_speech text,
  bangla_meaning text,
  english_definition text,
  example_sentence text,
  synonyms text[] not null default '{}',
  antonyms text[] not null default '{}',
  related_words text[] not null default '{}',
  difficulty text,
  node_id uuid references public.content_nodes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- student features
-- ------------------------------------------------------------
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  content_id uuid not null references public.lessons (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed boolean not null default false,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  last_opened_at timestamptz,
  completed_at timestamptz,
  unique (user_id, lesson_id)
);

-- ------------------------------------------------------------
-- shared trigger: keep updated_at current
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger trg_content_nodes_updated_at before update on public.content_nodes
  for each row execute function public.set_updated_at();
create trigger trg_lessons_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();
create trigger trg_question_sets_updated_at before update on public.question_sets
  for each row execute function public.set_updated_at();
create trigger trg_questions_updated_at before update on public.questions
  for each row execute function public.set_updated_at();
create trigger trg_vocabulary_updated_at before update on public.vocabulary
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- auth.users -> profiles provisioning
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------------
-- role-check helpers (SECURITY DEFINER so RLS policies on
-- profiles can call these without recursing into profiles' own
-- RLS policies)
-- ------------------------------------------------------------
create or replace function public.current_user_role()
returns text
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.current_user_role() = 'admin';
$$;

create or replace function public.is_content_manager()
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select public.current_user_role() in ('admin', 'editor');
$$;

-- Prevent non-admins from promoting themselves (or anyone) to a
-- higher-privileged role via a plain profile UPDATE.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only admins can change user roles';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();
