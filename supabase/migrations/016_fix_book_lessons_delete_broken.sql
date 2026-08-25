-- ============================================================
-- 016_fix_book_lessons_delete_broken.sql
-- Migrations 010-015 inserted all 35 book lessons, but a bug in the
-- extraction script silently dropped every table, callout, and
-- pronunciation-button node (a boilerplate filter treated every
-- table block as an empty/blank paragraph). This deletes that
-- content so 017+ can re-insert it correctly. Deleting the part-1/
-- part-2 lessons cascades to their question_sets/questions/options.
-- ============================================================

do $$
declare
  v_part_1 uuid;
  v_part_2 uuid;
begin
  select cn.id into v_part_1 from content_nodes cn
    join content_nodes course on cn.parent_id = course.id
    join content_nodes spoken on course.parent_id = spoken.id
    where spoken.slug = 'spoken-english' and course.slug = 'course' and cn.slug = 'part-1';
  select cn.id into v_part_2 from content_nodes cn
    join content_nodes course on cn.parent_id = course.id
    join content_nodes spoken on course.parent_id = spoken.id
    where spoken.slug = 'spoken-english' and course.slug = 'course' and cn.slug = 'part-2';

  delete from lessons where node_id in (v_part_1, v_part_2);
end $$;
