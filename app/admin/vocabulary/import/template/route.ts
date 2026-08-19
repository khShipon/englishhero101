import { requireRole } from "@/lib/auth/dal";
import { VOCABULARY_CSV_TEMPLATE } from "@/lib/admin/vocabulary-csv";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(VOCABULARY_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vocabulary-template.csv"',
    },
  });
}
