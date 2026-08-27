-- ============================================================
-- 034_reading_passages.sql
-- Structured reading passages, linked to a lesson, so a real
-- split-screen "CD IELTS" test interface can show a passage and its
-- own questions side by side instead of everything being flattened
-- into one scrolling lesson body. Content is a simple paragraph list
-- (not the full Tiptap schema) -- passages don't need rich
-- formatting, and this keeps the reading-test UI decoupled from the
-- lesson-content renderer.
-- ============================================================

create table public.reading_passages (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  passage_number integer not null check (passage_number > 0),
  title text not null,
  paragraphs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lesson_id, passage_number)
);

comment on table public.reading_passages is 'Structured passage text for reading-test lessons; paragraphs is [{"label": "A"|null, "text": "..."}].';

create trigger trg_reading_passages_updated_at before update on public.reading_passages
  for each row execute function public.set_updated_at();

alter table public.reading_passages enable row level security;

create policy "reading_passages_select_published" on public.reading_passages
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.lessons l
      where l.id = reading_passages.lesson_id
        and l.status = 'published'
    )
  );

create policy "reading_passages_select_manager" on public.reading_passages
  for select to authenticated
  using (public.is_content_manager());

create policy "reading_passages_write_manager" on public.reading_passages
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());
