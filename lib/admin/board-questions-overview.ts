import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type BoardQuestionSet = {
  id: string;
  title: string;
  board: string | null;
  year: number | null;
  isPublished: boolean;
  questionCount: number;
};

export type BoardQuestionsData = {
  sectionNodeId: string | null;
  examType: "SSC" | "HSC";
  questionSets: BoardQuestionSet[];
};

// "Board Questions" is a flat content-node section (see
// supabase/migrations/004_seed_data.sql) holding freestanding question
// sets — this fetches all of them under one board's section so the
// admin Board Questions manager can group them by the year/board
// columns question_sets already carries (001_initial_schema.sql).
export const getBoardQuestionsData = cache(
  async (rootSlug: "ssc-english" | "hsc-english"): Promise<BoardQuestionsData> => {
    const examType = rootSlug === "ssc-english" ? "SSC" : "HSC";
    const supabase = await createClient();

    const { data: rootNode } = await supabase
      .from("content_nodes")
      .select("id")
      .eq("slug", rootSlug)
      .is("parent_id", null)
      .maybeSingle();
    if (!rootNode) return { sectionNodeId: null, examType, questionSets: [] };

    const { data: section } = await supabase
      .from("content_nodes")
      .select("id")
      .eq("parent_id", rootNode.id)
      .eq("slug", "board-questions")
      .maybeSingle();
    if (!section) return { sectionNodeId: null, examType, questionSets: [] };

    const { data: setRows, error } = await supabase
      .from("question_sets")
      .select("id, title, board, year, is_published")
      .eq("node_id", section.id)
      .order("year", { ascending: false });
    if (error) throw error;

    const rows = setRows ?? [];
    const setIds = rows.map((row) => row.id);

    const countBySet = new Map<string, number>();
    if (setIds.length > 0) {
      const { data: questionRows, error: questionsError } = await supabase
        .from("questions")
        .select("question_set_id")
        .in("question_set_id", setIds);
      if (questionsError) throw questionsError;
      for (const row of questionRows ?? []) {
        countBySet.set(row.question_set_id, (countBySet.get(row.question_set_id) ?? 0) + 1);
      }
    }

    return {
      sectionNodeId: section.id,
      examType,
      questionSets: rows.map((row) => ({
        id: row.id,
        title: row.title,
        board: row.board,
        year: row.year,
        isPublished: row.is_published,
        questionCount: countBySet.get(row.id) ?? 0,
      })),
    };
  },
);
