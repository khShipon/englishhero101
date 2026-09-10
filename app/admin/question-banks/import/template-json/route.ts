import { requireRole } from "@/lib/auth/dal";
import { QUESTION_SET_JSON_TEMPLATE } from "@/lib/admin/question-set-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(QUESTION_SET_JSON_TEMPLATE, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="question-set-template.json"',
    },
  });
}
