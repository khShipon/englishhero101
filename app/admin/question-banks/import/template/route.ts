import { requireRole } from "@/lib/auth/dal";
import { QUESTIONS_CSV_TEMPLATE } from "@/lib/admin/question-csv";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(QUESTIONS_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="questions-template.csv"',
    },
  });
}
