-- ============================================================
-- 007_spoken_course_skeleton.sql
-- Structural skeleton for the "100-Day Spoken English Course":
-- one new section under the existing Spoken English category, with
-- 10 level topic nodes underneath it. No lesson content yet — each
-- level's 10 lessons are added by their own later migration
-- (008_..._level1.sql, 009_..._level2.sql, ...), inserted as
-- `lessons` rows with node_id pointing at that level's topic node
-- (lessons.slug distinguishes lesson-01..lesson-10 within a level).
-- The existing 6 Spoken English sections (Daily Lessons,
-- Conversation, etc.) are untouched.
-- ============================================================

do $$
declare
  v_spoken uuid;
  v_course uuid;
begin
  select id into v_spoken from content_nodes where parent_id is null and slug = 'spoken-english';

  insert into content_nodes (parent_id, title, slug, description, node_type, sort_order, is_published)
    values (
      v_spoken, '100-Day Spoken Course', 'course',
      'A complete, graded spoken English course for Bangladeshi students -- Lesson 1 to 100, beginner to advanced.',
      'section', 0, true
    )
    returning id into v_course;

  insert into content_nodes (parent_id, title, slug, description, node_type, sort_order, is_published) values
    (v_course, 'Level 1: Foundations & Sounds', 'level-1', 'English sounds, word stress, greetings, and survival phrases. Lessons 1-10.', 'topic', 1, true),
    (v_course, 'Level 2: Everyday Basics', 'level-2', 'Present simple, family, routines, questions, and basic shopping. Lessons 11-20.', 'topic', 2, true),
    (v_course, 'Level 3: Building Conversations', 'level-3', 'Present continuous, weather, directions, restaurants, and small talk. Lessons 21-30.', 'topic', 3, true),
    (v_course, 'Level 4: Past & Stories', 'level-4', 'Past simple and continuous, storytelling, travel, and everyday situations. Lessons 31-40.', 'topic', 4, true),
    (v_course, 'Level 5: Future & Plans', 'level-5', 'Will vs. going to, invitations, advice, obligation, and goals. Lessons 41-50.', 'topic', 5, true),
    (v_course, 'Level 6: Opinions & Discussion', 'level-6', 'Opinions, comparisons, present perfect, hobbies, and feelings. Lessons 51-60.', 'topic', 6, true),
    (v_course, 'Level 7: Real-Life Situations', 'level-7', 'Interviews, airports, hotels, emergencies, and customer service. Lessons 61-70.', 'topic', 7, true),
    (v_course, 'Level 8: Fluency & Idioms', 'level-8', 'Idioms, phrasal verbs, conditionals, storytelling, and debate. Lessons 71-80.', 'topic', 8, true),
    (v_course, 'Level 9: Professional & Academic', 'level-9', 'Presentations, meetings, negotiation, and public speaking. Lessons 81-90.', 'topic', 9, true),
    (v_course, 'Level 10: Mastery & Confidence', 'level-10', 'Advanced idioms, accent refinement, connected speech, and a capstone free-talk assessment. Lessons 91-100.', 'topic', 10, true);
end $$;
