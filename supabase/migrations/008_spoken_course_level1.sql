-- ============================================================
-- 008_spoken_course_level1.sql
-- Content batch: Level 1 -- Foundations & Sounds (Lessons 1-10) of
-- the 100-Day Spoken Course. Each lesson is a `lessons` row under
-- the level-1 topic node, paired 1:1 with its own practice
-- `question_sets` row via the new lesson_id column.
-- ============================================================

do $$
declare
  v_level uuid;
  v_lesson uuid;
  v_qset uuid;
  v_q uuid;
begin
  select cn.id into v_level from content_nodes cn
    join content_nodes course on cn.parent_id = course.id
    join content_nodes spoken on course.parent_id = spoken.id
    where spoken.slug = 'spoken-english' and course.slug = 'course' and cn.slug = 'level-1';

  -- Lesson 1: Welcome to Spoken English: How This Course Works

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Welcome to Spoken English: How This Course Works', 'lesson-01', 'How the 100-lesson spoken English course works: learn, listen, then practice.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Welcome! This course has 100 short lessons, from your very first English words to confident, fluent conversation. Every lesson follows the same pattern: first you learn, then you click Start Practice to check what you remember. Tap the speaker icon next to any word or phrase to hear it read aloud."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Hello"}},{"type":"text","text":" — a simple, friendly greeting"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Good morning"}},{"type":"text","text":" — used from waking up until about noon"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Thank you"}},{"type":"text","text":" — used to show politeness and gratitude"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Yes"}},{"type":"text","text":" — agreement"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"No"}},{"type":"text","text":" — disagreement"}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Teacher: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Hello, everyone! Welcome to Spoken English."}}]},{"type":"paragraph","content":[{"type":"text","text":"Student: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Hello! I am ready to learn."}}]},{"type":"paragraph","content":[{"type":"text","text":"Teacher: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Great! Let''s begin with lesson one."}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: In Bangla, we often translate English word-by-word in our head before speaking. In this course, you will practice thinking directly in short English phrases instead — it will make you sound much more natural."}]}]}]}'::jsonb, 'published', 'beginner', 6, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Welcome to Spoken English: How This Course Works', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'What should you do after reading a lesson?', 'multiple_choice', 'Every lesson ends with a Practice exercise so you can check what you remember.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Click ''Start Practice''', true, 1),
    (v_q, 'Close the browser', false, 2),
    (v_q, 'Skip to lesson 100', false, 3),
    (v_q, 'Only read it once', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'This course has 100 lessons.', 'true_false', 'The course runs from Lesson 1 (absolute beginner) to Lesson 100 (advanced).', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which greeting can you use at 9 in the morning?', 'multiple_choice', '''Good morning'' is used from waking up until about noon.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Good morning', true, 1),
    (v_q, 'Good night', false, 2),
    (v_q, 'Good evening', false, 3),
    (v_q, 'Goodbye', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'Complete the polite phrase: ''____ you'' (used to show gratitude).', 'fill_in_blank', '''Thank you'' is used to show politeness and gratitude.', 'Thank', 1, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'What does the speaker icon (🔊) next to a word let you do?', 'multiple_choice', 'Tap it any time you want to hear a word or phrase read aloud.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Hear the pronunciation', true, 1),
    (v_q, 'Translate it to Bangla', false, 2),
    (v_q, 'Delete the word', false, 3),
    (v_q, 'Change the lesson', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'You should try to translate every English sentence word-by-word from Bangla before speaking.', 'true_false', 'Translating word-by-word makes speech sound unnatural — practice thinking in short English phrases instead.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', false, 1),
    (v_q, 'False', true, 2);

  -- Lesson 2: English Sounds vs. Bangla Sounds: The Big Differences

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'English Sounds vs. Bangla Sounds: The Big Differences', 'lesson-02', 'The English sounds that don''t exist in Bangla, and why they feel strange at first.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla and English don''t share every sound. Some English sounds don''t exist in Bangla at all, which is why they feel strange at first. In this lesson, you''ll meet the sounds that need the most practice."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"think"}},{"type":"text","text":" — the unvoiced ''th'' sound — tongue between your teeth, no Bangla equivalent"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"this"}},{"type":"text","text":" — the voiced ''th'' sound — softer, with your voice on"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"very"}},{"type":"text","text":" — the ''v'' sound — top teeth touch bottom lip, not like Bangla ভ"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"world"}},{"type":"text","text":" — the ''w'' sound — rounded lips, not like Bangla ও"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"right"}},{"type":"text","text":" — the English ''r'' — softer than the rolled Bangla র"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"English has about 44 sounds but only 26 letters — the same letter can sound different in different words (compare the ''o'' in ''go'' and ''do'')."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"I think this is very difficult."}}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Don''t worry — the world''s best speakers practiced too!"}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Many Bangla speakers pronounce ''th'' as ''d'' or ''t'' (so ''this'' sounds like ''dis''). Practice by placing your tongue lightly between your teeth and blowing air out gently."}]}]}]}'::jsonb, 'published', 'beginner', 7, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: English Sounds vs. Bangla Sounds: The Big Differences', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which sound has no equivalent in Bangla?', 'multiple_choice', 'The ''th'' sound requires the tongue between the teeth, which Bangla doesn''t use.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'th in ''think''', true, 1),
    (v_q, 'b in ''boy''', false, 2),
    (v_q, 'm in ''mother''', false, 3),
    (v_q, 's in ''sun''', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'English has more sounds than letters.', 'true_false', 'English has about 44 sounds represented by only 26 letters.', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'To make the ''v'' sound correctly, your...', 'multiple_choice', 'This is different from Bangla ভ, which doesn''t use the teeth this way.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'top teeth touch your bottom lip', true, 1),
    (v_q, 'lips touch each other', false, 2),
    (v_q, 'tongue touches the roof of your mouth', false, 3),
    (v_q, 'throat vibrates only', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'The ''th'' sound is made by placing your ____ between your teeth.', 'fill_in_blank', 'Place your tongue lightly between your teeth and blow air out gently.', 'tongue', 1, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'A common Bangla-speaker mistake is pronouncing ''this'' as...', 'multiple_choice', 'Swapping ''th'' for ''d'' is one of the most common pronunciation habits to unlearn.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'dis', true, 1),
    (v_q, 'thiss', false, 2),
    (v_q, 'tiss', false, 3),
    (v_q, 'his', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'The same English letter can represent different sounds in different words.', 'true_false', 'For example, the letter ''o'' sounds different in ''go'' and ''do''.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  -- Lesson 3: Vowel Sounds That Trip Up Bangla Speakers

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Vowel Sounds That Trip Up Bangla Speakers', 'lesson-03', 'Short vs. long English vowels, and why ''ship'' and ''sheep'' are different words.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"English has short and long vowel sounds that change a word''s meaning completely — ''ship'' and ''sheep'' are different words! Bangla vowels don''t map onto English the same way, so this lesson trains your ear."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"ship"}},{"type":"text","text":" — short i — a boat"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"sheep"}},{"type":"text","text":" — long ee — an animal"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"sit"}},{"type":"text","text":" — short i — to sit down"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"seat"}},{"type":"text","text":" — long ee — a chair, a place to sit"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"full"}},{"type":"text","text":" — short u — not empty"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"fool"}},{"type":"text","text":" — long oo — a silly person"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Short vowels are quick and relaxed; long vowels are held for longer and the mouth shape changes slightly. Minimal pairs like ship/sheep are the best way to train your ear."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Did you see the sheep near the ship?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Yes! Please, take a seat and I will tell you."}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Because Bangla doesn''t distinguish short and long vowels the same way, students often say ''ship'' when they mean ''sheep''. Listen to the pronunciation button and repeat slowly, holding the long vowels."}]}]}]}'::jsonb, 'published', 'beginner', 7, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Vowel Sounds That Trip Up Bangla Speakers', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which word has a long vowel sound?', 'multiple_choice', '''Sheep'' uses the long ''ee'' sound, held longer than the short ''i'' in ''ship''.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'sheep', true, 1),
    (v_q, 'ship', false, 2),
    (v_q, 'sit', false, 3),
    (v_q, 'full', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Ship'' and ''sheep'' are the same word with different spelling.', 'true_false', 'They are two completely different words with different meanings.', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', false, 1),
    (v_q, 'False', true, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Seat'' means...', 'multiple_choice', '''Seat'' (long vowel) is a chair or place to sit, different from ''sit'' (short vowel), the action.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'a place to sit', true, 1),
    (v_q, 'a boat', false, 2),
    (v_q, 'to eat', false, 3),
    (v_q, 'silly', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'A ''fool'' is a ____ person.', 'fill_in_blank', '''Fool'' (long oo) means a silly person — different from ''full'' (short u), meaning not empty.', 'silly', 1, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Minimal pairs like ship/sheep help you practice...', 'multiple_choice', 'Minimal pairs differ by only one sound, so they train your ear precisely.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'hearing the vowel difference', true, 1),
    (v_q, 'grammar rules', false, 2),
    (v_q, 'spelling only', false, 3),
    (v_q, 'punctuation', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, metadata, marks, sort_order) values (v_qset, 'Match each word to its meaning.', 'matching', 'Each pair differs by vowel length only.', '{"pairs":[{"left":"ship","right":"a boat"},{"left":"sheep","right":"an animal"},{"left":"seat","right":"a chair"},{"left":"fool","right":"a silly person"}]}'::jsonb, 1, 6);

  -- Lesson 4: Tricky Consonants: TH, V/W, and R

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Tricky Consonants: TH, V/W, and R', 'lesson-04', 'Combining th, v, w, and r in real words and short sentences.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Now let''s combine what you practiced — th, v, w, and r together in real words and short sentences."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"three"}},{"type":"text","text":" — th + numbers, a common mistake area"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"weather"}},{"type":"text","text":" — the w sound, not ''v''"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"very well"}},{"type":"text","text":" — the v sound, practice it twice"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"around"}},{"type":"text","text":" — the r sound, softer than Bangla র"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"thirty-three"}},{"type":"text","text":" — combines th and r"}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"The weather is very warm today."}}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Yes, around thirty-three degrees, I think."}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Try not to swap v and w — ''very'' should not sound like ''wery'', and ''weather'' should not sound like ''vezer''. Say them slowly using the pronunciation buttons."}]}]}]}'::jsonb, 'published', 'beginner', 7, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Tricky Consonants: TH, V/W, and R', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which word starts with the ''w'' sound, not ''v''?', 'multiple_choice', '''Weather'' starts with a rounded-lip ''w'' sound.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'weather', true, 1),
    (v_q, 'very', false, 2),
    (v_q, 'think', false, 3),
    (v_q, 'this', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'Complete: The ____ is very warm today. (the climate or temperature outside)', 'fill_in_blank', '''Weather'' describes outdoor conditions like temperature and rain.', 'weather', 1, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Very'' and ''weather'' start with the same sound.', 'true_false', '''Very'' starts with ''v'' (teeth on lip); ''weather'' starts with ''w'' (rounded lips).', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', false, 1),
    (v_q, 'False', true, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Thirty-three'' contains which two tricky sounds?', 'multiple_choice', '''Thirty'' has ''th'', and ''three'' has both ''th'' and ''r''.', 1, 4) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'th and r', true, 1),
    (v_q, 'v and w', false, 2),
    (v_q, 's and t', false, 3),
    (v_q, 'b and p', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'A common mistake is saying ''wery'' instead of...', 'multiple_choice', 'Swapping ''v'' for ''w'' is a very common habit to unlearn.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'very', true, 1),
    (v_q, 'weather', false, 2),
    (v_q, 'world', false, 3),
    (v_q, 'right', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'The English ''r'' sound is usually softer than the Bangla র.', 'true_false', 'English ''r'' isn''t rolled the way Bangla র often is.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  -- Lesson 5: Word Stress: Why "PRESent" and "preSENT" Are Different Words

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Word Stress: Why "PRESent" and "preSENT" Are Different Words', 'lesson-05', 'How stressing a different syllable can completely change a word''s meaning.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"In English, saying the wrong syllable with stress can completely change a word''s meaning, or just make you harder to understand. This lesson teaches you to hear and use stress correctly."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"PRESent"}},{"type":"text","text":" — noun — a gift, stress on the first syllable"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"preSENT"}},{"type":"text","text":" — verb — to give or show, stress on the second syllable"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"REcord"}},{"type":"text","text":" — noun — stress on the first syllable"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"reCORD"}},{"type":"text","text":" — verb — stress on the second syllable"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"comPUTer"}},{"type":"text","text":" — stress always falls on the second syllable here"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Many English words spelled the same change meaning based on which syllable is stressed — usually noun = stress first syllable, verb = stress second syllable."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Teacher: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"I have a present for you."}}]},{"type":"paragraph","content":[{"type":"text","text":"Student: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Thank you! Will you present it now?"}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: In Bangla, stress works differently and often falls more evenly across a word. In English, stressing the wrong syllable can make even a correct word hard to understand — practice exaggerating the stressed syllable at first."}]}]}]}'::jsonb, 'published', 'beginner', 7, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Word Stress: Why "PRESent" and "preSENT" Are Different Words', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''PRESent'' (stress on the first syllable) means...', 'multiple_choice', 'Stressed on the first syllable, ''PRESent'' is the noun meaning ''a gift''.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'a gift', true, 1),
    (v_q, 'to give something', false, 2),
    (v_q, 'a computer', false, 3),
    (v_q, 'a record', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''preSENT'' (stress on the second syllable) is usually a...', 'multiple_choice', 'Stressed on the second syllable, ''preSENT'' means ''to give or show''.', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'verb', true, 1),
    (v_q, 'noun', false, 2),
    (v_q, 'adjective', false, 3),
    (v_q, 'preposition', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Word stress can change a word''s meaning in English.', 'true_false', 'Pairs like PRESent/preSENT are a clear example of this.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'Complete: I have a ____ for you. (a gift, noun)', 'fill_in_blank', 'As a noun (stress on first syllable), ''present'' means ''a gift''.', 'present', 1, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'A common pattern is: noun = stress first syllable, verb = stress...', 'multiple_choice', 'This noun/verb stress-shift pattern applies to many two-syllable English words.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'the second syllable', true, 1),
    (v_q, 'the first syllable', false, 2),
    (v_q, 'no syllable', false, 3),
    (v_q, 'every syllable', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, metadata, marks, sort_order) values (v_qset, 'Match each stressed form to its meaning.', 'matching', 'Notice how the stress shifts between the noun and verb forms.', '{"pairs":[{"left":"PRESent","right":"a gift (noun)"},{"left":"preSENT","right":"to give something (verb)"},{"left":"REcord","right":"music or data (noun)"},{"left":"reCORD","right":"to save data (verb)"}]}'::jsonb, 1, 6);

  -- Lesson 6: Greetings: Hello, Hi, and Good Morning

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Greetings: Hello, Hi, and Good Morning', 'lesson-06', 'Formal and informal English greetings for different times of day.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Greetings are the first words in almost every conversation. English has formal and informal greetings for different times of day and situations."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Hello"}},{"type":"text","text":" — neutral, works in any situation"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Hi"}},{"type":"text","text":" — informal, used with friends and peers"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Good morning"}},{"type":"text","text":" — formal, used before noon"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Good afternoon"}},{"type":"text","text":" — formal, used from noon to evening"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Good evening"}},{"type":"text","text":" — formal, used in the evening"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"How are you?"}},{"type":"text","text":" — asking about someone''s wellbeing"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Use ''Good night'' only when saying goodbye at the end of the day or before sleeping — never as a greeting when you arrive somewhere."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Good morning, Sir. How are you?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Teacher: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Good morning, Rakib. I am fine, thank you. And you?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"I am fine too, thank you."}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: In Bangla culture we often ask ''Have you eaten?'' as a greeting — in English, ''How are you?'' plays that same friendly role. A short ''Fine, thank you'' or ''I''m good'' is the expected reply."}]}]}]}'::jsonb, 'published', 'beginner', 6, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Greetings: Hello, Hi, and Good Morning', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which greeting is informal, used mostly with friends?', 'multiple_choice', '''Hi'' is casual and used with friends and peers.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Hi', true, 1),
    (v_q, 'Good morning', false, 2),
    (v_q, 'Good afternoon', false, 3),
    (v_q, 'Good evening', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Good night'' can be used when you arrive at a party in the evening.', 'true_false', '''Good night'' is only for saying goodbye at the end of the day, not for arriving.', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', false, 1),
    (v_q, 'False', true, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'The best time to say ''Good morning'' is...', 'multiple_choice', '''Good morning'' is used from waking up until about noon.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'before noon', true, 1),
    (v_q, 'after sunset', false, 2),
    (v_q, 'only at breakfast', false, 3),
    (v_q, 'anytime', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'A polite reply to ''How are you?'' is ''I am ____, thank you.''', 'fill_in_blank', '''Fine, thank you'' is the standard polite reply.', 'fine', 1, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Good evening'' is used...', 'multiple_choice', '''Good evening'' greets someone during the evening hours.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'in the evening', true, 1),
    (v_q, 'before noon', false, 2),
    (v_q, 'only for goodbyes', false, 3),
    (v_q, 'only in writing', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Put this greeting exchange in the correct order.', 'ordering', 'Greetings usually follow this call-and-response pattern.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, sort_order) values
    (v_q, 'Good morning!', 1),
    (v_q, 'Good morning. How are you?', 2),
    (v_q, 'I am fine, thank you. And you?', 3),
    (v_q, 'I am fine too.', 4);

  -- Lesson 7: Introducing Yourself: Name, Country, Language

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Introducing Yourself: Name, Country, Language', 'lesson-07', 'How to introduce your name, country, and language naturally in English.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"After greeting someone, the next step is introducing yourself — your name, where you''re from, and what language you speak."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"My name is..."}},{"type":"text","text":" — stating your name"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"I am from Bangladesh"}},{"type":"text","text":" — stating your country"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"I speak Bangla and English"}},{"type":"text","text":" — stating the languages you speak"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Nice to meet you"}},{"type":"text","text":" — a polite phrase after an introduction"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"What''s your name?"}},{"type":"text","text":" — asking someone''s name"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Avoid the direct Bangla-to-English translation ''What is your good name?'' — in natural English, simply ask ''What''s your name?''"}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Hello, what''s your name?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Tom: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"My name is Tom. I''m from Canada. And you?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"I''m Sadia. I''m from Bangladesh. Nice to meet you, Tom."}}]},{"type":"paragraph","content":[{"type":"text","text":"Tom: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Nice to meet you too!"}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: ''What is your good name?'' is a direct translation from Bangla and sounds unnatural in English. Just say ''What''s your name?''"}]}]}]}'::jsonb, 'published', 'beginner', 6, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Introducing Yourself: Name, Country, Language', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which question is natural, modern English?', 'multiple_choice', '''What is your good name?'' is a direct Bangla translation that sounds unnatural in English.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'What''s your name?', true, 1),
    (v_q, 'What is your good name?', false, 2),
    (v_q, 'What your name is?', false, 3),
    (v_q, 'Name what is?', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'Complete: My ____ is Rakib. (the word for what you are called)', 'fill_in_blank', '''My name is...'' is the standard way to introduce yourself.', 'name', 1, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Nice to meet you'' is said after you learn someone''s name for the first time.', 'true_false', 'It''s a polite closing phrase after a first introduction.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''I am from Bangladesh'' tells the listener your...', 'multiple_choice', '''I am from...'' states where you''re from.', 1, 4) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'country', true, 1),
    (v_q, 'name', false, 2),
    (v_q, 'language', false, 3),
    (v_q, 'age', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, metadata, marks, sort_order) values (v_qset, 'Match each phrase to what it communicates.', 'matching', 'These four phrases together make a complete self-introduction.', '{"pairs":[{"left":"My name is...","right":"stating your name"},{"left":"I am from...","right":"stating your country"},{"left":"I speak...","right":"stating your language"},{"left":"Nice to meet you","right":"a polite closing phrase"}]}'::jsonb, 1, 5);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Put this introduction exchange in the correct order.', 'ordering', 'Introductions usually move from name to country in this order.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, sort_order) values
    (v_q, 'What''s your name?', 1),
    (v_q, 'My name is Sadia.', 2),
    (v_q, 'Where are you from?', 3),
    (v_q, 'I''m from Bangladesh.', 4);

  -- Lesson 8: Numbers 1–100 in Spoken English

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Numbers 1–100 in Spoken English', 'lesson-08', 'Building spoken number skills for prices, phone numbers, ages, and time.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Numbers come up constantly — prices, phone numbers, ages, time. This lesson builds your spoken number skills from 1 to 100."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"one, two, three"}},{"type":"text","text":" — 1 to 3, the foundation numbers"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"thirteen vs. thirty"}},{"type":"text","text":" — easy to confuse — listen carefully to the stress"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"twenty-one"}},{"type":"text","text":" — tens plus ones, joined by a hyphen"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"fifty"}},{"type":"text","text":" — 5 times 10"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"one hundred"}},{"type":"text","text":" — 100"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Numbers 13-19 end in ''-teen'' and stress the LAST syllable (thirTEEN); multiples of ten like 30, 40 stress the FIRST syllable (THIRty). This stress difference is how English speakers tell them apart."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Shopkeeper: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"That will be thirty taka, please."}}]},{"type":"paragraph","content":[{"type":"text","text":"Customer: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Thirty, or thirteen? Sorry, can you repeat?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Shopkeeper: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"THIRty — three-zero."}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Because ''-teen'' and ''-ty'' numbers sound similar, always emphasize the stressed syllable clearly, and if unsure, say the digits separately (''three-zero'' for 30)."}]}]}]}'::jsonb, 'published', 'beginner', 8, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Numbers 1–100 in Spoken English', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which number is stressed on the last syllable?', 'multiple_choice', '''-teen'' numbers stress the last syllable: thirTEEN.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'thirteen', true, 1),
    (v_q, 'thirty', false, 2),
    (v_q, 'forty', false, 3),
    (v_q, 'fifty', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'Write the number 21 in words: ____-one', 'fill_in_blank', '21 is ''twenty-one'', tens plus ones joined by a hyphen.', 'twenty', 1, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Thirty'' and ''thirteen'' are pronounced exactly the same way.', 'true_false', 'They differ in which syllable is stressed: THIRty vs. thirTEEN.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', false, 1),
    (v_q, 'False', true, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '100 in words is...', 'multiple_choice', '100 is spoken as ''one hundred''.', 1, 4) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'one hundred', true, 1),
    (v_q, 'ten ten', false, 2),
    (v_q, 'hundred one', false, 3),
    (v_q, 'one thousand', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'If someone doesn''t understand a number, a clear way to repeat it is to...', 'multiple_choice', 'Saying digits like ''three-zero'' for 30 avoids confusion with ''thirteen''.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'say the digits separately', true, 1),
    (v_q, 'say it faster', false, 2),
    (v_q, 'whisper it', false, 3),
    (v_q, 'only write it', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Put these numbers in order from smallest to largest.', 'ordering', '13, 21, 30, 50 — in increasing order.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, sort_order) values
    (v_q, 'thirteen', 1),
    (v_q, 'twenty-one', 2),
    (v_q, 'thirty', 3),
    (v_q, 'fifty', 4);

  -- Lesson 9: Days, Months, and Dates Out Loud

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Days, Months, and Dates Out Loud', 'lesson-09', 'The spoken pattern for English dates, days of the week, and months.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Talking about days, months, and dates is essential for plans, appointments, and stories. English dates have a specific spoken pattern."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Monday, Tuesday, Wednesday"}},{"type":"text","text":" — days of the week"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"January, February, March"}},{"type":"text","text":" — months of the year"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"the first of January"}},{"type":"text","text":" — the spoken date pattern: ''the'' + ordinal + ''of'' + month"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"today, tomorrow, yesterday"}},{"type":"text","text":" — time reference words"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"What''s the date today?"}},{"type":"text","text":" — asking for the date"}]}]}]},{"type":"callout","attrs":{"variant":"grammar-rule"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Spoken dates use ordinal numbers, not plain numbers: not ''January five'' but ''the fifth of January'' (or ''January the fifth'')."}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"What''s the date today?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"It''s the tenth of March. Our exam is on the twelfth."}}]},{"type":"paragraph","content":[{"type":"text","text":"Sadia: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"That''s a Thursday, right?"}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Bangla dates are usually spoken as plain numbers, so it''s tempting to say ''March five'' — in English, always switch to the ordinal form: ''the fifth of March.''"}]}]}]}'::jsonb, 'published', 'beginner', 7, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Days, Months, and Dates Out Loud', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'What is the correct spoken form for 5 March?', 'multiple_choice', 'Spoken dates use ordinal numbers: ''the fifth of March''.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'the fifth of March', true, 1),
    (v_q, 'March five', false, 2),
    (v_q, 'five March', false, 3),
    (v_q, 'March the five', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'The day after today is called ____.', 'fill_in_blank', '''Tomorrow'' is the day after today.', 'tomorrow', 1, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'English dates are spoken using ordinal numbers (first, second, third...).', 'true_false', 'For example, ''the fifth of March'', not ''March five''.', 1, 3) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which of these is a day of the week?', 'multiple_choice', 'Thursday is one of the seven days of the week.', 1, 4) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Thursday', true, 1),
    (v_q, 'January', false, 2),
    (v_q, 'Twelfth', false, 3),
    (v_q, 'Yesterday', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, metadata, marks, sort_order) values (v_qset, 'Match each word to its meaning.', 'matching', 'These time words are used constantly in everyday conversation.', '{"pairs":[{"left":"today","right":"this day"},{"left":"tomorrow","right":"the next day"},{"left":"yesterday","right":"the day before"},{"left":"January","right":"a month"}]}'::jsonb, 1, 5);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Put these months in calendar order.', 'ordering', 'January through April are the first four months of the year.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, sort_order) values
    (v_q, 'January', 1),
    (v_q, 'February', 2),
    (v_q, 'March', 3),
    (v_q, 'April', 4);

  -- Lesson 10: Survival Phrases: Sorry, Excuse Me, Please, Thank You

  insert into lessons (node_id, title, slug, excerpt, content, status, difficulty, estimated_minutes, published_at)
  values (v_level, 'Survival Phrases: Sorry, Excuse Me, Please, Thank You', 'lesson-10', 'Five short phrases that help in almost any situation.', '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"These five short phrases will help you in almost any situation — getting attention, apologizing, being polite, and showing gratitude."}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Key Phrases"}]},{"type":"bulletList","content":[{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Excuse me"}},{"type":"text","text":" — to politely get someone''s attention or pass by"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Sorry"}},{"type":"text","text":" — to apologize"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Please"}},{"type":"text","text":" — to make a request polite"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"Thank you"}},{"type":"text","text":" — to show gratitude"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"You''re welcome"}},{"type":"text","text":" — a polite reply to ''thank you''"}]}]},{"type":"listItem","content":[{"type":"paragraph","content":[{"type":"pronounce","attrs":{"text":"I don''t understand"}},{"type":"text","text":" — to ask for help when you''re confused"}]}]}]},{"type":"heading","attrs":{"level":3},"content":[{"type":"text","text":"Dialogue"}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Excuse me, can you help me, please?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Stranger: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Of course! What do you need?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Sorry, I don''t understand this sign. Can you explain?"}}]},{"type":"paragraph","content":[{"type":"text","text":"Stranger: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"No problem! It means..."}}]},{"type":"paragraph","content":[{"type":"text","text":"Rakib: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"Thank you so much!"}}]},{"type":"paragraph","content":[{"type":"text","text":"Stranger: ","marks":[{"type":"bold"}]},{"type":"pronounce","attrs":{"text":"You''re welcome!"}}]},{"type":"callout","attrs":{"variant":"note"},"content":[{"type":"paragraph","content":[{"type":"text","text":"Bangla speaker tip: Use ''Excuse me'' BEFORE you interrupt or ask something, and ''Sorry'' AFTER you''ve made a mistake or caused inconvenience — mixing these up is a very common error for Bangla speakers."}]}]}]}'::jsonb, 'published', 'beginner', 6, now())
  returning id into v_lesson;

  insert into question_sets (lesson_id, title, description, difficulty, duration_minutes, marks, is_published)
  values (v_lesson, 'Practice: Survival Phrases: Sorry, Excuse Me, Please, Thank You', 'Check what you learned in this lesson.', 'beginner', 5, 6, true)
  returning id into v_qset;

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which phrase do you say BEFORE interrupting someone?', 'multiple_choice', '''Excuse me'' politely gets attention before you speak or pass by.', 1, 1) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Excuse me', true, 1),
    (v_q, 'Sorry', false, 2),
    (v_q, 'You''re welcome', false, 3),
    (v_q, 'Thanks', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Which phrase do you say AFTER making a mistake?', 'multiple_choice', '''Sorry'' is used to apologize after a mistake or inconvenience.', 1, 2) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'Sorry', true, 1),
    (v_q, 'Excuse me', false, 2),
    (v_q, 'Please', false, 3),
    (v_q, 'Thank you', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, correct_answer, marks, sort_order) values (v_qset, 'A polite reply to ''Thank you'' is ''____ welcome.''', 'fill_in_blank', '''You''re welcome'' is the standard polite reply to ''Thank you''.', 'you''re', 1, 3);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, '''Please'' makes a request sound more polite.', 'true_false', 'Adding ''please'' softens a request and makes it more courteous.', 1, 4) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'True', true, 1),
    (v_q, 'False', false, 2);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'If you don''t understand something, you should say...', 'multiple_choice', '''I don''t understand'' clearly signals you need help or an explanation.', 1, 5) returning id into v_q;
  insert into question_options (question_id, option_text, is_correct, sort_order) values
    (v_q, 'I don''t understand', true, 1),
    (v_q, 'You''re welcome', false, 2),
    (v_q, 'Excuse me only', false, 3),
    (v_q, 'Nothing', false, 4);

  insert into questions (question_set_id, question_text, question_type, explanation, marks, sort_order) values (v_qset, 'Put this polite exchange in the correct order.', 'ordering', 'A polite request-and-response usually follows this pattern.', 1, 6) returning id into v_q;
  insert into question_options (question_id, option_text, sort_order) values
    (v_q, 'Excuse me, can you help me?', 1),
    (v_q, 'Of course, what do you need?', 2),
    (v_q, 'Thank you so much!', 3),
    (v_q, 'You''re welcome!', 4);
end $$;
