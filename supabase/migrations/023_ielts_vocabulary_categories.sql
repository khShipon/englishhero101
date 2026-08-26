-- ============================================================
-- 023_ielts_vocabulary_categories.sql
-- 27 category nodes for the 1000-word IELTS Band 8 vocabulary list,
-- under the existing IELTS > Vocabulary section. Each vocabulary row
-- is scoped to one of these via vocabulary.node_id, which also makes
-- them show up on the site-wide /vocabulary page (unscoped there).
-- ============================================================

do $$
declare
  v_ielts_vocab uuid;
begin
  select cn.id into v_ielts_vocab from content_nodes cn
    join content_nodes ielts on cn.parent_id = ielts.id
    where ielts.slug = 'ielts' and cn.slug = 'vocabulary';

  insert into content_nodes (parent_id, title, slug, node_type, sort_order, is_published) values
    (v_ielts_vocab, 'Education', 'education', 'topic', 1, true),
    (v_ielts_vocab, 'Technology', 'technology', 'topic', 2, true),
    (v_ielts_vocab, 'Environment', 'environment', 'topic', 3, true),
    (v_ielts_vocab, 'Health & Lifestyle', 'health-and-lifestyle', 'topic', 4, true),
    (v_ielts_vocab, 'Crime & Law', 'crime-and-law', 'topic', 5, true),
    (v_ielts_vocab, 'Economy & Work', 'economy-and-work', 'topic', 6, true),
    (v_ielts_vocab, 'Society & Culture', 'society-and-culture', 'topic', 7, true),
    (v_ielts_vocab, 'Government & Politics', 'government-and-politics', 'topic', 8, true),
    (v_ielts_vocab, 'Media & Advertising', 'media-and-advertising', 'topic', 9, true),
    (v_ielts_vocab, 'Travel & Tourism', 'travel-and-tourism', 'topic', 10, true),
    (v_ielts_vocab, 'Family & Relationships', 'family-and-relationships', 'topic', 11, true),
    (v_ielts_vocab, 'Urbanisation & Housing', 'urbanisation-and-housing', 'topic', 12, true),
    (v_ielts_vocab, 'Science & Space', 'science-and-space', 'topic', 13, true),
    (v_ielts_vocab, 'Art & Sport', 'art-and-sport', 'topic', 14, true),
    (v_ielts_vocab, 'Globalisation', 'globalisation', 'topic', 15, true),
    (v_ielts_vocab, 'Opinion & Stance', 'opinion-and-stance', 'topic', 16, true),
    (v_ielts_vocab, 'Hedging & Nuance', 'hedging-and-nuance', 'topic', 17, true),
    (v_ielts_vocab, 'Agreement & Disagreement', 'agreement-and-disagreement', 'topic', 18, true),
    (v_ielts_vocab, 'Comparison & Contrast', 'comparison-and-contrast', 'topic', 19, true),
    (v_ielts_vocab, 'Cause & Effect', 'cause-and-effect', 'topic', 20, true),
    (v_ielts_vocab, 'Linking & Discourse Markers', 'linking-and-discourse-markers', 'topic', 21, true),
    (v_ielts_vocab, 'Idiomatic Spoken Expressions', 'idiomatic-spoken-expressions', 'topic', 22, true),
    (v_ielts_vocab, 'Speaking Fillers', 'speaking-fillers', 'topic', 23, true),
    (v_ielts_vocab, 'Task 1 Trend & Data Language', 'task-1-trend-and-data-language', 'topic', 24, true),
    (v_ielts_vocab, 'Advanced Adjectives', 'advanced-adjectives', 'topic', 25, true),
    (v_ielts_vocab, 'Advanced Adverbs of Degree', 'advanced-adverbs-of-degree', 'topic', 26, true),
    (v_ielts_vocab, 'Academic Verbs', 'academic-verbs', 'topic', 27, true);
end $$;
