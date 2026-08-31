-- Widens SSC English and HSC English from 2 levels (category > section)
-- to 3 (category > section > topic) by seeding real English 1st/2nd
-- Paper subtopics under the existing '1st-paper'/'2nd-paper' sections
-- of both boards. Purely additive: no existing rows are touched, and
-- content_nodes is already a generic recursive tree so this is just
-- more inserts, no schema change. Same topic list under both boards —
-- the exam question-type structure is essentially identical between
-- SSC and HSC; only lesson difficulty differs later.
do $$
declare
  v_ssc_1st uuid;
  v_ssc_2nd uuid;
  v_hsc_1st uuid;
  v_hsc_2nd uuid;
begin
  select cn.id into v_ssc_1st from content_nodes cn
    join content_nodes ssc on cn.parent_id = ssc.id
    where ssc.slug = 'ssc-english' and ssc.parent_id is null and cn.slug = '1st-paper';
  select cn.id into v_ssc_2nd from content_nodes cn
    join content_nodes ssc on cn.parent_id = ssc.id
    where ssc.slug = 'ssc-english' and ssc.parent_id is null and cn.slug = '2nd-paper';
  select cn.id into v_hsc_1st from content_nodes cn
    join content_nodes hsc on cn.parent_id = hsc.id
    where hsc.slug = 'hsc-english' and hsc.parent_id is null and cn.slug = '1st-paper';
  select cn.id into v_hsc_2nd from content_nodes cn
    join content_nodes hsc on cn.parent_id = hsc.id
    where hsc.slug = 'hsc-english' and hsc.parent_id is null and cn.slug = '2nd-paper';

  if v_ssc_1st is null or v_ssc_2nd is null or v_hsc_1st is null or v_hsc_2nd is null then
    raise exception 'SSC/HSC 1st-paper or 2nd-paper section not found — check 004_seed_data.sql seeded correctly';
  end if;

  -- English 1st Paper: organized by question type, how it's actually tested
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ssc_1st, 'Seen Passage Comprehension', 'seen-passage-comprehension', 'topic', 1, true),
    (v_ssc_1st, 'Unseen Passage Comprehension', 'unseen-passage-comprehension', 'topic', 2, true),
    (v_ssc_1st, 'Multiple Choice Questions (MCQ)', 'multiple-choice-questions', 'topic', 3, true),
    (v_ssc_1st, 'Cloze Test (With Clues)', 'cloze-test-with-clues', 'topic', 4, true),
    (v_ssc_1st, 'Cloze Test (Without Clues)', 'cloze-test-without-clues', 'topic', 5, true),
    (v_ssc_1st, 'Matching', 'matching', 'topic', 6, true),
    (v_ssc_1st, 'Rearranging Sentences', 'rearranging-sentences', 'topic', 7, true),
    (v_ssc_1st, 'Summary Writing', 'summary-writing', 'topic', 8, true),
    (v_ssc_1st, 'Table & Flow-chart Completion', 'table-flow-chart-completion', 'topic', 9, true),
    (v_ssc_1st, 'Information Transfer (Graph/Chart)', 'information-transfer', 'topic', 10, true);

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_hsc_1st, 'Seen Passage Comprehension', 'seen-passage-comprehension', 'topic', 1, true),
    (v_hsc_1st, 'Unseen Passage Comprehension', 'unseen-passage-comprehension', 'topic', 2, true),
    (v_hsc_1st, 'Multiple Choice Questions (MCQ)', 'multiple-choice-questions', 'topic', 3, true),
    (v_hsc_1st, 'Cloze Test (With Clues)', 'cloze-test-with-clues', 'topic', 4, true),
    (v_hsc_1st, 'Cloze Test (Without Clues)', 'cloze-test-without-clues', 'topic', 5, true),
    (v_hsc_1st, 'Matching', 'matching', 'topic', 6, true),
    (v_hsc_1st, 'Rearranging Sentences', 'rearranging-sentences', 'topic', 7, true),
    (v_hsc_1st, 'Summary Writing', 'summary-writing', 'topic', 8, true),
    (v_hsc_1st, 'Table & Flow-chart Completion', 'table-flow-chart-completion', 'topic', 9, true),
    (v_hsc_1st, 'Information Transfer (Graph/Chart)', 'information-transfer', 'topic', 10, true);

  -- English 2nd Paper: grammar items, then composition/writing items
  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ssc_2nd, 'Right Forms of Verbs', 'right-forms-of-verbs', 'topic', 1, true),
    (v_ssc_2nd, 'Fill in the Blanks (With Clues)', 'fill-in-the-blanks-with-clues', 'topic', 2, true),
    (v_ssc_2nd, 'Fill in the Blanks (Without Clues)', 'fill-in-the-blanks-without-clues', 'topic', 3, true),
    (v_ssc_2nd, 'Narration', 'narration', 'topic', 4, true),
    (v_ssc_2nd, 'Voice Change', 'voice-change', 'topic', 5, true),
    (v_ssc_2nd, 'Preposition', 'preposition', 'topic', 6, true),
    (v_ssc_2nd, 'Article', 'article', 'topic', 7, true),
    (v_ssc_2nd, 'Connectors & Linkers', 'connectors-linkers', 'topic', 8, true),
    (v_ssc_2nd, 'Sentence Transformation', 'sentence-transformation', 'topic', 9, true),
    (v_ssc_2nd, 'Tag Questions', 'tag-questions', 'topic', 10, true),
    (v_ssc_2nd, 'Punctuation & Capitalization', 'punctuation-capitalization', 'topic', 11, true),
    (v_ssc_2nd, 'Paragraph Writing', 'paragraph-writing', 'topic', 12, true),
    (v_ssc_2nd, 'Composition / Essay', 'composition-essay', 'topic', 13, true),
    (v_ssc_2nd, 'Letter & Application Writing', 'letter-application-writing', 'topic', 14, true),
    (v_ssc_2nd, 'Email Writing', 'email-writing', 'topic', 15, true),
    (v_ssc_2nd, 'Report Writing', 'report-writing', 'topic', 16, true),
    (v_ssc_2nd, 'Dialogue Writing', 'dialogue-writing', 'topic', 17, true),
    (v_ssc_2nd, 'Story Writing', 'story-writing', 'topic', 18, true),
    (v_ssc_2nd, 'Graph/Chart/Diagram Description', 'graph-chart-diagram-description', 'topic', 19, true),
    (v_ssc_2nd, 'CV & Cover Letter Writing', 'cv-cover-letter-writing', 'topic', 20, true);

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_hsc_2nd, 'Right Forms of Verbs', 'right-forms-of-verbs', 'topic', 1, true),
    (v_hsc_2nd, 'Fill in the Blanks (With Clues)', 'fill-in-the-blanks-with-clues', 'topic', 2, true),
    (v_hsc_2nd, 'Fill in the Blanks (Without Clues)', 'fill-in-the-blanks-without-clues', 'topic', 3, true),
    (v_hsc_2nd, 'Narration', 'narration', 'topic', 4, true),
    (v_hsc_2nd, 'Voice Change', 'voice-change', 'topic', 5, true),
    (v_hsc_2nd, 'Preposition', 'preposition', 'topic', 6, true),
    (v_hsc_2nd, 'Article', 'article', 'topic', 7, true),
    (v_hsc_2nd, 'Connectors & Linkers', 'connectors-linkers', 'topic', 8, true),
    (v_hsc_2nd, 'Sentence Transformation', 'sentence-transformation', 'topic', 9, true),
    (v_hsc_2nd, 'Tag Questions', 'tag-questions', 'topic', 10, true),
    (v_hsc_2nd, 'Punctuation & Capitalization', 'punctuation-capitalization', 'topic', 11, true),
    (v_hsc_2nd, 'Paragraph Writing', 'paragraph-writing', 'topic', 12, true),
    (v_hsc_2nd, 'Composition / Essay', 'composition-essay', 'topic', 13, true),
    (v_hsc_2nd, 'Letter & Application Writing', 'letter-application-writing', 'topic', 14, true),
    (v_hsc_2nd, 'Email Writing', 'email-writing', 'topic', 15, true),
    (v_hsc_2nd, 'Report Writing', 'report-writing', 'topic', 16, true),
    (v_hsc_2nd, 'Dialogue Writing', 'dialogue-writing', 'topic', 17, true),
    (v_hsc_2nd, 'Story Writing', 'story-writing', 'topic', 18, true),
    (v_hsc_2nd, 'Graph/Chart/Diagram Description', 'graph-chart-diagram-description', 'topic', 19, true),
    (v_hsc_2nd, 'CV & Cover Letter Writing', 'cv-cover-letter-writing', 'topic', 20, true);
end $$;
