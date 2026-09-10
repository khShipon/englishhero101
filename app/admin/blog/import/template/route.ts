import { requireRole } from "@/lib/auth/dal";
import { BLOG_CSV_TEMPLATE } from "@/lib/admin/blog-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(BLOG_CSV_TEMPLATE, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="blog-posts-template.csv"',
    },
  });
}
