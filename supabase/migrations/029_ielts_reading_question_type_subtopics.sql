-- ============================================================
-- 029_ielts_reading_question_type_subtopics.sql
-- 5 subtopic nodes for question types not yet represented under
-- IELTS > Reading > Question Types (which already has True/False/Not
-- Given, Matching Headings, and Multiple Choice from the original
-- seed data).
-- ============================================================

do $$
declare
  v_question_types uuid;
begin
  select cn.id into v_question_types from content_nodes cn
    join content_nodes reading on cn.parent_id = reading.id
    join content_nodes ielts on reading.parent_id = ielts.id
    where ielts.slug = 'ielts' and reading.slug = 'reading' and cn.slug = 'question-types';

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_question_types, 'Yes / No / Not Given', 'yes-no-not-given', 'subtopic', 4, true),
    (v_question_types, 'Completion', 'completion', 'subtopic', 5, true),
    (v_question_types, 'Matching Information', 'matching-information', 'subtopic', 6, true),
    (v_question_types, 'Matching Features', 'matching-features', 'subtopic', 7, true),
    (v_question_types, 'Short-Answer Questions & Diagram Labelling', 'short-answer-and-diagram-labelling', 'subtopic', 8, true);
end $$;
