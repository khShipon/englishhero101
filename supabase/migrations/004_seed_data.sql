-- ============================================================
-- 004_seed_data.sql
-- SAMPLE / DEMO CONTENT ONLY.
-- Seeds the initial category hierarchy described in the project
-- brief, plus a handful of demo lessons, a demo question set, and
-- demo vocabulary entries so the CMS and public site have
-- something to render out of the box. Every row here is fully
-- editable/deletable from the admin dashboard — nothing about the
-- hierarchy is hard-coded in application code.
-- ============================================================

do $$
declare
  v_ssc uuid;
  v_hsc uuid;
  v_university uuid;
  v_spoken uuid;
  v_vocabulary uuid;
  v_grammar uuid;
  v_ielts uuid;

  v_grammar_parts_of_speech uuid;
  v_grammar_tense uuid;

  v_ielts_reading uuid;
  v_ielts_reading_question_types uuid;
  v_ielts_writing uuid;
  v_ielts_speaking uuid;
  v_spoken_common_expressions uuid;

  v_lesson_present_simple uuid;
  v_ssc_grammar_node uuid;
  v_qset_ssc_grammar uuid;
  v_q1 uuid;
begin
  -- ----------------------------------------------------------
  -- Top-level categories
  -- ----------------------------------------------------------
  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('SSC English', 'ssc-english', 'Secondary School Certificate English syllabus.', 'category', 1, true)
    returning id into v_ssc;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('HSC English', 'hsc-english', 'Higher Secondary Certificate English syllabus.', 'category', 2, true)
    returning id into v_hsc;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('University English', 'university-english', 'English for university-level courses and admissions.', 'category', 3, true)
    returning id into v_university;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('Spoken English', 'spoken-english', 'Practical spoken English for everyday situations.', 'category', 4, true)
    returning id into v_spoken;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('Vocabulary', 'vocabulary', 'Build your English word bank.', 'category', 5, true)
    returning id into v_vocabulary;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('Grammar', 'grammar', 'English grammar rules and practice.', 'category', 6, true)
    returning id into v_grammar;

  insert into content_nodes (title, slug, description, node_type, sort_order, is_published)
    values ('IELTS', 'ielts', 'IELTS preparation: Listening, Reading, Writing, Speaking.', 'category', 7, true)
    returning id into v_ielts;

  -- ----------------------------------------------------------
  -- SSC English sections
  -- ----------------------------------------------------------
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ssc, '1st Paper', '1st-paper', 'section', 1, true),
    (v_ssc, '2nd Paper', '2nd-paper', 'section', 2, true),
    (v_ssc, 'Grammar', 'grammar', 'section', 3, true),
    (v_ssc, 'Writing', 'writing', 'section', 4, true),
    (v_ssc, 'Board Questions', 'board-questions', 'section', 5, true),
    (v_ssc, 'Model Tests', 'model-tests', 'section', 6, true);

  select id into v_ssc_grammar_node from content_nodes where parent_id = v_ssc and slug = 'grammar';

  -- ----------------------------------------------------------
  -- HSC English sections (same shape as SSC)
  -- ----------------------------------------------------------
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_hsc, '1st Paper', '1st-paper', 'section', 1, true),
    (v_hsc, '2nd Paper', '2nd-paper', 'section', 2, true),
    (v_hsc, 'Grammar', 'grammar', 'section', 3, true),
    (v_hsc, 'Writing', 'writing', 'section', 4, true),
    (v_hsc, 'Board Questions', 'board-questions', 'section', 5, true),
    (v_hsc, 'Model Tests', 'model-tests', 'section', 6, true);

  -- ----------------------------------------------------------
  -- Spoken English sections
  -- ----------------------------------------------------------
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_spoken, 'Daily Lessons', 'daily-lessons', 'section', 1, true),
    (v_spoken, 'Conversation', 'conversation', 'section', 2, true),
    (v_spoken, 'Situational English', 'situational-english', 'section', 3, true),
    (v_spoken, 'Common Expressions', 'common-expressions', 'section', 4, true),
    (v_spoken, 'Pronunciation', 'pronunciation', 'section', 5, true),
    (v_spoken, 'Practice', 'practice', 'section', 6, true);

  select id into v_spoken_common_expressions from content_nodes where parent_id = v_spoken and slug = 'common-expressions';

  -- ----------------------------------------------------------
  -- Grammar sections
  -- ----------------------------------------------------------
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_grammar, 'Parts of Speech', 'parts-of-speech', 'section', 1, true),
    (v_grammar, 'Tense', 'tense', 'section', 2, true),
    (v_grammar, 'Voice', 'voice', 'section', 3, true),
    (v_grammar, 'Narration', 'narration', 'section', 4, true),
    (v_grammar, 'Articles', 'articles', 'section', 5, true),
    (v_grammar, 'Prepositions', 'prepositions', 'section', 6, true),
    (v_grammar, 'Sentence Structure', 'sentence-structure', 'section', 7, true);

  select id into v_grammar_parts_of_speech from content_nodes where parent_id = v_grammar and slug = 'parts-of-speech';
  select id into v_grammar_tense from content_nodes where parent_id = v_grammar and slug = 'tense';

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_grammar_parts_of_speech, 'Noun', 'noun', 'topic', 1, true),
    (v_grammar_parts_of_speech, 'Pronoun', 'pronoun', 'topic', 2, true),
    (v_grammar_parts_of_speech, 'Adjective', 'adjective', 'topic', 3, true),
    (v_grammar_tense, 'Present', 'present', 'topic', 1, true),
    (v_grammar_tense, 'Past', 'past', 'topic', 2, true),
    (v_grammar_tense, 'Future', 'future', 'topic', 3, true);

  -- ----------------------------------------------------------
  -- IELTS sections
  -- ----------------------------------------------------------
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ielts, 'Listening', 'listening', 'section', 1, true),
    (v_ielts, 'Reading', 'reading', 'section', 2, true),
    (v_ielts, 'Writing', 'writing', 'section', 3, true),
    (v_ielts, 'Speaking', 'speaking', 'section', 4, true),
    (v_ielts, 'Vocabulary', 'vocabulary', 'section', 5, true);

  select id into v_ielts_reading from content_nodes where parent_id = v_ielts and slug = 'reading';
  select id into v_ielts_writing from content_nodes where parent_id = v_ielts and slug = 'writing';
  select id into v_ielts_speaking from content_nodes where parent_id = v_ielts and slug = 'speaking';

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ielts_reading, 'Question Types', 'question-types', 'topic', 1, true),
    (v_ielts_reading, 'Practice Tests', 'practice-tests', 'topic', 2, true),
    (v_ielts_reading, 'Strategies', 'strategies', 'topic', 3, true),
    (v_ielts_writing, 'Task 1', 'task-1', 'topic', 1, true),
    (v_ielts_writing, 'Task 2', 'task-2', 'topic', 2, true),
    (v_ielts_speaking, 'Part 1', 'part-1', 'topic', 1, true),
    (v_ielts_speaking, 'Part 2', 'part-2', 'topic', 2, true),
    (v_ielts_speaking, 'Part 3', 'part-3', 'topic', 3, true);

  select id into v_ielts_reading_question_types from content_nodes where parent_id = v_ielts_reading and slug = 'question-types';

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ielts_reading_question_types, 'True / False / Not Given', 'true-false-not-given', 'subtopic', 1, true),
    (v_ielts_reading_question_types, 'Matching Headings', 'matching-headings', 'subtopic', 2, true),
    (v_ielts_reading_question_types, 'Multiple Choice', 'multiple-choice', 'subtopic', 3, true);

  -- ----------------------------------------------------------
  -- Sample lessons (clearly demo content)
  -- ----------------------------------------------------------
  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  select id, 'Present Simple Tense', 'present-simple-tense',
    'Sample lesson: structure, uses, and examples of the present simple tense.',
    '{"type":"doc","content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Present Simple Tense"}]},
        {"type":"paragraph","content":[{"type":"text","text":"We use the present simple tense for habits, facts, and permanent situations."}]},
        {"type":"paragraph","content":[{"type":"text","text":"Structure: Subject + base verb (+ s/es for third person singular)."}]},
        {"type":"paragraph","content":[{"type":"text","marks":[{"type":"bold"}],"text":"Example: "},{"type":"text","text":"She walks to school every day."}]}
      ]}'::jsonb,
    'published', 'beginner', 8, now()
  from content_nodes where parent_id = v_grammar_tense and slug = 'present'
  returning id into v_lesson_present_simple;

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  select id, 'IELTS Writing Task 2 — Essay Structure', 'essay-structure',
    'Sample lesson: a four-paragraph structure for IELTS Writing Task 2 essays.',
    '{"type":"doc","content":[
        {"type":"heading","attrs":{"level":2},"content":[{"type":"text","text":"Essay Structure"}]},
        {"type":"paragraph","content":[{"type":"text","text":"Introduction, two body paragraphs, and a conclusion is a reliable structure for most Task 2 prompts."}]}
      ]}'::jsonb,
    'published', 'intermediate', 12, now()
  from content_nodes where parent_id = v_ielts_writing and slug = 'task-2';

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes)
  values (
    v_spoken_common_expressions, 'Everyday Greetings', 'everyday-greetings',
    'Sample lesson (draft): common English greetings for daily conversation.',
    '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Draft content — not yet published."}]}]}'::jsonb,
    'draft', 'beginner', 5
  );

  -- ----------------------------------------------------------
  -- Sample question set
  -- ----------------------------------------------------------
  insert into question_sets (node_id, title, description, exam_type, subject, difficulty, marks, is_published)
  values (
    v_ssc_grammar_node, 'SSC Grammar Practice — Right Form of Verb',
    'Sample question set for demonstration purposes.',
    'SSC', 'English 2nd Paper', 'medium', 10, true
  )
  returning id into v_qset_ssc_grammar;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order)
  values (
    v_qset_ssc_grammar, 'She ___ (go) to school every day.', 'multiple_choice',
    'Habitual action in the present takes the present simple tense; third-person singular subjects add -s/-es.',
    1, 1
  )
  returning id into v_q1;

  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q1, 'goes', true, 1),
    (v_q1, 'go', false, 2),
    (v_q1, 'going', false, 3),
    (v_q1, 'gone', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order)
  values (
    v_qset_ssc_grammar, 'The sun ___ (rise) in the east.', 'fill_in_blank',
    'General truths and facts also take the present simple tense.',
    'rises', 1, 2
  );

  -- ----------------------------------------------------------
  -- Sample vocabulary (demo entries)
  -- ----------------------------------------------------------
  insert into vocabulary (word, pronunciation, part_of_speech, bangla_meaning, english_definition, example_sentence, synonyms, antonyms, difficulty, node_id)
  values
    ('Ubiquitous', '/juːˈbɪkwɪtəs/', 'adjective', 'সর্বব্যাপী', 'Present, appearing, or found everywhere.', 'Smartphones have become ubiquitous in modern life.', array['omnipresent', 'pervasive'], array['rare', 'scarce'], 'advanced', v_vocabulary),
    ('Benevolent', '/bəˈnɛvələnt/', 'adjective', 'দয়ালু', 'Well-meaning and kindly.', 'The benevolent teacher stayed late to help struggling students.', array['kind', 'charitable'], array['malevolent', 'cruel'], 'intermediate', v_vocabulary),
    ('Ambiguous', '/æmˈbɪɡjuəs/', 'adjective', 'অস্পষ্ট', 'Open to more than one interpretation.', 'His answer was ambiguous, so we asked him to clarify.', array['unclear', 'vague'], array['clear', 'explicit'], 'intermediate', v_vocabulary);

end $$;
