"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { getQuestionSetById, getQuestionsBySet } from "@/lib/queries/question-banks";
import { gradeQuestion, type GradedQuestion, type SubmittedAnswer } from "@/lib/student/quiz-grading";

export type QuizResult = {
  totalMarks: number;
  scorableMarks: number;
  earnedMarks: number;
  percent: number;
  questions: GradedQuestion[];
};

// Public practice quizzes — no login required, mirroring the existing
// read-only question-set page. Re-fetches the question set and its
// answer key server-side; only per-field "correct" results go back to
// the client, never the raw key, and only after a submission exists.
export async function submitQuizAttempt(
  questionSetId: string,
  answers: SubmittedAnswer[],
): Promise<QuizResult> {
  const questionSet = await getQuestionSetById(questionSetId);
  if (!questionSet) {
    throw new Error("This question set is not available.");
  }

  // Unpublished sets can only be graded by an admin/editor previewing
  // their own draft (see /admin/lessons/[id]/preview) — everyone else
  // still gets the "not available" error a draft should show.
  let isPreview = false;
  if (!questionSet.isPublished) {
    const previewer = await getCurrentUser();
    if (!previewer || (previewer.role !== "admin" && previewer.role !== "editor")) {
      throw new Error("This question set is not available.");
    }
    isPreview = true;
  }

  const questions = await getQuestionsBySet(questionSetId);
  if (questions.length === 0) {
    throw new Error("This question set has no questions.");
  }

  const answerByQuestionId = new Map((Array.isArray(answers) ? answers : []).map((answer) => [answer.questionId, answer]));
  const graded = [...questions]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((question) => gradeQuestion(question, answerByQuestionId.get(question.id)));

  const totalMarks = graded.reduce((sum, question) => sum + question.marks, 0);
  const scorableMarks = graded
    .filter((question) => question.autoGraded)
    .reduce((sum, question) => sum + question.marks, 0);
  const earnedMarks = graded.reduce((sum, question) => sum + question.earnedMarks, 0);
  const percent = scorableMarks > 0 ? Math.round((earnedMarks / scorableMarks) * 100) : 0;

  // Best-effort persistence for score history — guests still get a
  // graded result above, they just don't get a saved attempt. Preview
  // runs never get saved, so an admin test-driving a draft doesn't
  // pollute their own quiz history.
  if (scorableMarks > 0 && !isPreview) {
    const user = await getCurrentUser();
    if (user) {
      const supabase = await createClient();
      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        question_set_id: questionSetId,
        lesson_id: questionSet.lessonId,
        earned_marks: earnedMarks,
        scorable_marks: scorableMarks,
        percent,
      });
      if (error) {
        console.error("Failed to record quiz attempt:", error.message);
      } else {
        revalidatePath("/profile");
      }
    }
  }

  return { totalMarks, scorableMarks, earnedMarks, percent, questions: graded };
}
