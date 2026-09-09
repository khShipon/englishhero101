-- ============================================================
-- 039_forum.sql
-- A members-only student forum: post a question/text, nested replies
-- (one level deep, Facebook-style — a reply to a reply flattens onto
-- the same top-level reply rather than growing indefinitely deep),
-- like/love reactions on posts and replies, and notifications for the
-- recipient of a reply or reaction.
-- ============================================================

-- ------------------------------------------------------------
-- get_forum_authors
-- profiles_select_own restricts a plain select to your own row (see
-- 002_rls_policies.sql — reviews stay anonymous for the same reason),
-- but a forum inherently needs to show every author's display name.
-- This exposes only id + full_name (never email/role/avatar_url) for
-- an arbitrary set of ids, callable directly as an RPC.
-- ------------------------------------------------------------
create or replace function public.get_forum_authors(author_ids uuid[])
returns table (id uuid, full_name text)
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select p.id, p.full_name
  from public.profiles p
  where p.id = any(author_ids);
$$;

grant execute on function public.get_forum_authors(uuid[]) to authenticated;

-- ------------------------------------------------------------
-- forum_posts
-- ------------------------------------------------------------
create table public.forum_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);

comment on table public.forum_posts is 'A student-authored forum question/post. Members-only: RLS grants select/insert/update/delete only to authenticated, never anon.';

create index forum_posts_created_at_idx on public.forum_posts (created_at desc);
create index forum_posts_user_id_idx on public.forum_posts (user_id);

alter table public.forum_posts enable row level security;

create policy "forum_posts_select_authenticated" on public.forum_posts
  for select to authenticated
  using (true);

create policy "forum_posts_insert_own" on public.forum_posts
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "forum_posts_delete_own" on public.forum_posts
  for delete to authenticated
  using (user_id = auth.uid());

-- Admins/editors can remove an inappropriate post without owning it.
create policy "forum_posts_delete_manager" on public.forum_posts
  for delete to authenticated
  using (public.is_content_manager());

-- ------------------------------------------------------------
-- forum_replies
-- parent_reply_id is null for a reply directly on the post, or points
-- at a top-level reply for a nested one. reply_to_user_id records who
-- a nested reply is specifically addressing (which can differ from
-- parent_reply_id's author once a third reply joins the same
-- sub-thread), independent of the one-level flattening above.
-- ------------------------------------------------------------
create table public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  parent_reply_id uuid references public.forum_replies (id) on delete cascade,
  reply_to_user_id uuid references public.profiles (id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

comment on table public.forum_replies is 'Replies to a forum post, nested one level deep (parent_reply_id always points at a top-level reply, never another nested one).';

create index forum_replies_post_id_idx on public.forum_replies (post_id);
create index forum_replies_parent_reply_id_idx on public.forum_replies (parent_reply_id);
create index forum_replies_user_id_idx on public.forum_replies (user_id);
create index forum_replies_created_at_idx on public.forum_replies (created_at);

-- Keeps the "one level deep" invariant enforceable at the DB layer
-- (not just in application code): a reply's parent must belong to the
-- same post, and can't itself be nested.
create or replace function public.forum_reply_check_parent()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  parent_post_id uuid;
  parent_parent_id uuid;
begin
  if new.parent_reply_id is not null then
    select post_id, parent_reply_id into parent_post_id, parent_parent_id
    from public.forum_replies where id = new.parent_reply_id;

    if parent_post_id is null then
      raise exception 'Parent reply not found';
    end if;
    if parent_post_id <> new.post_id then
      raise exception 'Parent reply belongs to a different post';
    end if;
    if parent_parent_id is not null then
      raise exception 'Cannot nest a reply under another nested reply';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_forum_replies_check_parent before insert or update on public.forum_replies
  for each row execute function public.forum_reply_check_parent();

alter table public.forum_replies enable row level security;

create policy "forum_replies_select_authenticated" on public.forum_replies
  for select to authenticated
  using (true);

create policy "forum_replies_insert_own" on public.forum_replies
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "forum_replies_delete_own" on public.forum_replies
  for delete to authenticated
  using (user_id = auth.uid());

create policy "forum_replies_delete_manager" on public.forum_replies
  for delete to authenticated
  using (public.is_content_manager());

-- ------------------------------------------------------------
-- Reactions — one row per user per post/reply (unique constraint),
-- so reacting again with a different type switches it and reacting
-- with the same type is undone by the app (a delete), same as
-- Facebook's single-reaction-per-person model.
-- ------------------------------------------------------------
create table public.forum_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love')),
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index forum_post_reactions_post_id_idx on public.forum_post_reactions (post_id);

alter table public.forum_post_reactions enable row level security;

create policy "forum_post_reactions_select_authenticated" on public.forum_post_reactions
  for select to authenticated
  using (true);

create policy "forum_post_reactions_insert_own" on public.forum_post_reactions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "forum_post_reactions_update_own" on public.forum_post_reactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "forum_post_reactions_delete_own" on public.forum_post_reactions
  for delete to authenticated
  using (user_id = auth.uid());

create table public.forum_reply_reactions (
  id uuid primary key default gen_random_uuid(),
  reply_id uuid not null references public.forum_replies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  reaction_type text not null check (reaction_type in ('like', 'love')),
  created_at timestamptz not null default now(),
  unique (reply_id, user_id)
);

create index forum_reply_reactions_reply_id_idx on public.forum_reply_reactions (reply_id);

alter table public.forum_reply_reactions enable row level security;

create policy "forum_reply_reactions_select_authenticated" on public.forum_reply_reactions
  for select to authenticated
  using (true);

create policy "forum_reply_reactions_insert_own" on public.forum_reply_reactions
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "forum_reply_reactions_update_own" on public.forum_reply_reactions
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "forum_reply_reactions_delete_own" on public.forum_reply_reactions
  for delete to authenticated
  using (user_id = auth.uid());

-- ------------------------------------------------------------
-- forum_notifications
-- Written by the actor's own request (with check (actor_id =
-- auth.uid())) so any authenticated user can notify another of their
-- own reply/reaction, but can only ever read or mark-read their own
-- incoming notifications.
-- ------------------------------------------------------------
create table public.forum_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('reply_to_post', 'reply_to_reply', 'reaction_post', 'reaction_reply')),
  post_id uuid not null references public.forum_posts (id) on delete cascade,
  reply_id uuid references public.forum_replies (id) on delete cascade,
  reaction_type text check (reaction_type in ('like', 'love')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table public.forum_notifications is 'Notifies a post/reply author about a new reply or reaction. Shown in the student dashboard''s Notifications card.';

create index forum_notifications_user_id_unread_idx on public.forum_notifications (user_id, is_read);
create index forum_notifications_created_at_idx on public.forum_notifications (created_at desc);

alter table public.forum_notifications enable row level security;

create policy "forum_notifications_select_own" on public.forum_notifications
  for select to authenticated
  using (user_id = auth.uid());

create policy "forum_notifications_insert_actor" on public.forum_notifications
  for insert to authenticated
  with check (actor_id = auth.uid() and actor_id <> user_id);

create policy "forum_notifications_update_own" on public.forum_notifications
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
