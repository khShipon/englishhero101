import { requireRole } from "@/lib/auth/dal";
import { VOCABULARY_JSON_TEMPLATE } from "@/lib/admin/vocabulary-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(VOCABULARY_JSON_TEMPLATE, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="vocabulary-template.json"',
    },
  });
}
