import { requireRole } from "@/lib/auth/dal";
import { BLOG_JSON_TEMPLATE } from "@/lib/admin/blog-bulk-import";

export async function GET() {
  await requireRole(["admin", "editor"]);

  return new Response(BLOG_JSON_TEMPLATE, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="blog-posts-template.json"',
    },
  });
}
