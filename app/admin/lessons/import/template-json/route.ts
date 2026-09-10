import { requireRole } from "@/lib/auth/dal";
import { LESSON_JSON_TEMPLATE } from "@/lib/admin/lesson-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(LESSON_JSON_TEMPLATE, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="lessons-template.json"',
    },
  });
}
