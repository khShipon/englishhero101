-- ============================================================
-- 003_indexes.sql
-- Indexes for hierarchy traversal, publish-state filtering,
-- foreign-key joins, and text search. pg_trgm powers fast
-- ILIKE-based partial-word search ahead of the Phase 10 search
-- feature; ranked full-text search can layer tsvector columns on
-- top of these later without a breaking migration.
-- ============================================================

create extension if not exists pg_trgm;

-- ------------------------------------------------------------
-- content_nodes
-- ------------------------------------------------------------
create index content_nodes_parent_id_idx on public.content_nodes (parent_id);
create index content_nodes_node_type_idx on public.content_nodes (node_type);
create index content_nodes_is_published_idx on public.content_nodes (is_published);
create index content_nodes_sort_order_idx on public.content_nodes (sort_order);
create index content_nodes_created_at_idx on public.content_nodes (created_at);
create index content_nodes_slug_idx on public.content_nodes (slug);
create index content_nodes_created_by_idx on public.content_nodes (created_by);
create index content_nodes_title_trgm_idx on public.content_nodes using gin (title gin_trgm_ops);

-- ------------------------------------------------------------
-- lessons
-- ------------------------------------------------------------
create index lessons_node_id_idx on public.lessons (node_id);
create index lessons_status_idx on public.lessons (status);
create index lessons_slug_idx on public.lessons (slug);
create index lessons_created_at_idx on public.lessons (created_at);
create index lessons_published_at_idx on public.lessons (published_at);
create index lessons_author_id_idx on public.lessons (author_id);
create index lessons_title_trgm_idx on public.lessons using gin (title gin_trgm_ops);

-- ------------------------------------------------------------
-- question bank
-- ------------------------------------------------------------
create index question_sets_node_id_idx on public.question_sets (node_id);
create index question_sets_is_published_idx on public.question_sets (is_published);
create index question_sets_exam_type_idx on public.question_sets (exam_type);
create index question_sets_title_trgm_idx on public.question_sets using gin (title gin_trgm_ops);

create index questions_question_set_id_idx on public.questions (question_set_id);
create index questions_sort_order_idx on public.questions (sort_order);
create index questions_question_type_idx on public.questions (question_type);

create index question_options_question_id_idx on public.question_options (question_id);

-- ------------------------------------------------------------
-- vocabulary
-- ------------------------------------------------------------
create index vocabulary_node_id_idx on public.vocabulary (node_id);
create index vocabulary_difficulty_idx on public.vocabulary (difficulty);
create index vocabulary_word_idx on public.vocabulary (word);
create index vocabulary_word_trgm_idx on public.vocabulary using gin (word gin_trgm_ops);
create index vocabulary_definition_trgm_idx on public.vocabulary using gin (english_definition gin_trgm_ops);

-- ------------------------------------------------------------
-- student features
-- ------------------------------------------------------------
create index bookmarks_user_id_idx on public.bookmarks (user_id);
create index bookmarks_content_id_idx on public.bookmarks (content_id);

create index lesson_progress_user_id_idx on public.lesson_progress (user_id);
create index lesson_progress_lesson_id_idx on public.lesson_progress (lesson_id);
