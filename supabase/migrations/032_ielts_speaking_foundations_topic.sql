-- ============================================================
-- 032_ielts_speaking_foundations_topic.sql
-- A new "Foundations" topic under IELTS > Speaking, alongside the
-- existing Part 1 / Part 2 / Part 3, for the book's general-skills
-- chapters (fluency, coherence, vocabulary, grammar, common
-- mistakes, pronunciation, practice methods) that aren't specific to
-- any one part of the test.
-- ============================================================

do $$
declare
  v_speaking uuid;
begin
  select cn.id into v_speaking from content_nodes cn
    join content_nodes ielts on cn.parent_id = ielts.id
    where ielts.slug = 'ielts' and cn.slug = 'speaking';

  insert into content_nodes (parent_id, title, slug, description, node_type, sort_order, is_published)
    values (
      v_speaking, 'Foundations', 'foundations',
      'The core speaking skills behind every part of the test -- fluency, vocabulary, grammar, pronunciation, common mistakes, and how to practice.',
      'topic', 0, true
    );
end $$;
