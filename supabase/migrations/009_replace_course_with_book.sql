-- ============================================================
-- 009_replace_course_with_book.sql
-- Replaces the generated 10-level/100-lesson skeleton (007) and its
-- Level 1 content (008) with the real structure of the user's own
-- book, "English Foundation" -- 35 lessons in two parts. Deleting the
-- level-* nodes cascades to their lessons, question_sets, questions,
-- and question_options automatically (all FKs are ON DELETE CASCADE).
-- ============================================================

do $$
declare
  v_course uuid;
begin
  select cn.id into v_course from content_nodes cn
    join content_nodes spoken on cn.parent_id = spoken.id
    where spoken.slug = 'spoken-english' and cn.slug = 'course';

  delete from content_nodes where parent_id = v_course;

  insert into content_nodes (parent_id, title, slug, description, node_type, sort_order, is_published) values
    (v_course, 'Part 1: Grammar Foundations', 'part-1', 'Lessons 1-23 -- the grammar foundation, from your first sentence to full sentence patterns.', 'topic', 1, true),
    (v_course, 'Part 2: Everyday English & Speaking', 'part-2', 'Lessons 24-35 -- real conversations, idioms, and speaking practice built on that grammar.', 'topic', 2, true);
end $$;
