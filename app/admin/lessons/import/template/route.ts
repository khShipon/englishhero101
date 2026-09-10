import { requireRole } from "@/lib/auth/dal";
import { LESSON_CSV_TEMPLATE } from "@/lib/admin/lesson-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(LESSON_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lessons-template.csv"',
    },
  });
}
