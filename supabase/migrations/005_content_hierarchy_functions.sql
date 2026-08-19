-- ============================================================
-- 005_content_hierarchy_functions.sql
-- Recursive lookups over content_nodes, exposed as RPC functions so
-- breadcrumb trails and subtree listings are a single database round
-- trip instead of N sequential parent/child queries.
--
-- Both functions are SECURITY INVOKER (the default — omitted here on
-- purpose) so they run with the calling role's own privileges and
-- remain subject to content_nodes' existing RLS policies: an
-- anonymous caller only ever sees published nodes in the result,
-- exactly as a direct SELECT would return.
-- ============================================================

-- Root-to-node breadcrumb trail (the target node itself is the last row).
create or replace function public.get_node_breadcrumbs(target_id uuid)
returns table (
  id uuid,
  parent_id uuid,
  title text,
  slug text,
  node_type text,
  depth int
)
language sql
stable
set search_path = public, pg_temp
as $$
  with recursive ancestors as (
    select cn.id, cn.parent_id, cn.title, cn.slug, cn.node_type, 0 as depth
    from public.content_nodes cn
    where cn.id = target_id

    union all

    select cn.id, cn.parent_id, cn.title, cn.slug, cn.node_type, a.depth + 1
    from public.content_nodes cn
    join ancestors a on cn.id = a.parent_id
  )
  select id, parent_id, title, slug, node_type, depth
  from ancestors
  order by depth desc;
$$;

comment on function public.get_node_breadcrumbs(uuid) is
  'Root-to-node ancestor chain (inclusive of target_id) for breadcrumb navigation.';

-- Every descendant of a node, at any depth (root itself excluded).
create or replace function public.get_node_descendants(root_id uuid)
returns table (
  id uuid,
  parent_id uuid,
  title text,
  slug text,
  node_type text,
  sort_order int,
  is_published boolean,
  depth int
)
language sql
stable
set search_path = public, pg_temp
as $$
  with recursive descendants as (
    select cn.id, cn.parent_id, cn.title, cn.slug, cn.node_type, cn.sort_order, cn.is_published, 1 as depth
    from public.content_nodes cn
    where cn.parent_id = root_id

    union all

    select cn.id, cn.parent_id, cn.title, cn.slug, cn.node_type, cn.sort_order, cn.is_published, d.depth + 1
    from public.content_nodes cn
    join descendants d on cn.parent_id = d.id
  )
  select id, parent_id, title, slug, node_type, sort_order, is_published, depth
  from descendants
  order by depth, sort_order;
$$;

comment on function public.get_node_descendants(uuid) is
  'Every descendant of root_id at any depth, ordered depth-first by sort_order.';

-- This project has auto-exposure of new functions to the Data API
-- turned off (see supabase/config.toml), so RPC calls need an
-- explicit grant or they 404/permission-error from the client.
grant execute on function public.get_node_breadcrumbs(uuid) to anon, authenticated;
grant execute on function public.get_node_descendants(uuid) to anon, authenticated;
