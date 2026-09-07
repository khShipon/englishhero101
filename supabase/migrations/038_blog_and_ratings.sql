-- ============================================================
-- 038_blog_and_ratings.sql
-- Adds a lightweight blog (admin-authored articles, same Tiptap JSON
-- content format as lessons) and a real site-rating system (one
-- rating per student, backing the homepage's "user rating" stat
-- instead of a made-up number).
-- ============================================================

-- ------------------------------------------------------------
-- blog_posts
-- ------------------------------------------------------------
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content jsonb not null default '{}'::jsonb,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  author_id uuid references public.profiles (id) on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint blog_posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.blog_posts is 'Admin-authored articles shown on the public /blog. content is portable JSON (Tiptap document), same format as lessons.content.';

create trigger trg_blog_posts_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();

create index blog_posts_status_idx on public.blog_posts (status);
create index blog_posts_slug_idx on public.blog_posts (slug);
create index blog_posts_published_at_idx on public.blog_posts (published_at);
create index blog_posts_author_id_idx on public.blog_posts (author_id);
create index blog_posts_title_trgm_idx on public.blog_posts using gin (title gin_trgm_ops);

alter table public.blog_posts enable row level security;

create policy "blog_posts_select_published" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published');

create policy "blog_posts_select_manager" on public.blog_posts
  for select to authenticated
  using (public.is_content_manager());

create policy "blog_posts_write_manager" on public.blog_posts
  for all to authenticated
  using (public.is_content_manager())
  with check (public.is_content_manager());

-- ------------------------------------------------------------
-- site_ratings
-- One row per student (unique user_id): a resubmission overwrites
-- their existing star rating/comment rather than creating a second
-- row, so the average always reflects one vote per person.
-- ------------------------------------------------------------
create table public.site_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_ratings is 'One star rating + optional comment per student, backing the public /reviews page and the homepage rating stat.';

create trigger trg_site_ratings_updated_at before update on public.site_ratings
  for each row execute function public.set_updated_at();

create index site_ratings_rating_idx on public.site_ratings (rating);
create index site_ratings_created_at_idx on public.site_ratings (created_at);

alter table public.site_ratings enable row level security;

-- Ratings and comments are shown publicly on /reviews, so read access
-- is open to everyone, same as vocabulary.
create policy "site_ratings_select_all" on public.site_ratings
  for select to anon, authenticated
  using (true);

create policy "site_ratings_insert_own" on public.site_ratings
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "site_ratings_update_own" on public.site_ratings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "site_ratings_delete_own" on public.site_ratings
  for delete to authenticated
  using (user_id = auth.uid());

-- Admins/editors can remove an inappropriate review without owning it.
create policy "site_ratings_delete_manager" on public.site_ratings
  for delete to authenticated
  using (public.is_content_manager());
