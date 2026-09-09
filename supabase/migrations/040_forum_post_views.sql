-- ============================================================
-- 040_forum_post_views.sql
-- Tracks which forum posts a student has opened, so the feed can show
-- a "New" tag that lasts until the viewer actually reads the post
-- (not just a fixed time window).
-- ============================================================

create table public.forum_post_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  viewed_at timestamptz not null default now(),
  unique (user_id, post_id)
);

comment on table public.forum_post_views is 'One row per (user, post) once a student opens a forum post — backs the feed''s "New" badge (unseen = new). A post''s own author never needs a row: they''re treated as having seen it from creation.';

create index forum_post_views_user_id_idx on public.forum_post_views (user_id);

alter table public.forum_post_views enable row level security;

create policy "forum_post_views_select_own" on public.forum_post_views
  for select to authenticated
  using (user_id = auth.uid());

create policy "forum_post_views_insert_own" on public.forum_post_views
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "forum_post_views_update_own" on public.forum_post_views
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
