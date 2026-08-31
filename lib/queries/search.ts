import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { mapNode, NODE_COLUMNS, type ContentNodeRow } from "@/lib/queries/content";
import { mapLesson, LESSON_COLUMNS, type LessonRow } from "@/lib/queries/lessons";
import { mapVocabulary, VOCABULARY_COLUMNS, type VocabularyRow } from "@/lib/queries/vocabulary";
import { searchPublishedQuestionSets, type QuestionSet } from "@/lib/queries/question-banks";
import type { ContentNode } from "@/types/content";
import type { Lesson } from "@/lib/queries/lessons";
import type { VocabularyEntry } from "@/lib/queries/vocabulary";

export type SearchResults = {
  nodes: ContentNode[];
  lessons: Lesson[];
  vocabulary: VocabularyEntry[];
  questionSets: QuestionSet[];
};

const RESULT_LIMIT = 10;

// Four separate single-column ilike queries rather than one combined
// .or(...) — same reasoning as the vocabulary admin search: .or()
// needs the caller to hand-escape user input to avoid filter
// injection, which isn't worth it here. Full-text ranking across
// multiple columns is a Phase 10 (dedicated Search/SEO) concern.
export async function searchSite(query: string): Promise<SearchResults> {
  "use cache";
  cacheLife("hours");
  cacheTag("content-nodes", "lessons", "vocabulary", "question-sets");

  const trimmed = query.trim();
  if (!trimmed) {
    return { nodes: [], lessons: [], vocabulary: [], questionSets: [] };
  }

  const supabase = createPublicClient();
  const pattern = `%${trimmed}%`;

  const [nodesRes, lessonsRes, vocabRes, questionSets] = await Promise.all([
    supabase
      .from("content_nodes")
      .select(NODE_COLUMNS)
      .eq("is_published", true)
      .ilike("title", pattern)
      .limit(RESULT_LIMIT),
    supabase
      .from("lessons")
      .select(LESSON_COLUMNS)
      .eq("status", "published")
      .ilike("title", pattern)
      .limit(RESULT_LIMIT),
    supabase.from("vocabulary").select(VOCABULARY_COLUMNS).ilike("word", pattern).limit(RESULT_LIMIT),
    searchPublishedQuestionSets({ query: trimmed, limit: RESULT_LIMIT }),
  ]);

  if (nodesRes.error) throw nodesRes.error;
  if (lessonsRes.error) throw lessonsRes.error;
  if (vocabRes.error) throw vocabRes.error;

  return {
    nodes: ((nodesRes.data ?? []) as ContentNodeRow[]).map(mapNode),
    lessons: ((lessonsRes.data ?? []) as LessonRow[]).map(mapLesson),
    vocabulary: ((vocabRes.data ?? []) as VocabularyRow[]).map(mapVocabulary),
    questionSets,
  };
}
