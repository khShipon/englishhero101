import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPostsAdmin } from "@/lib/queries/blog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteBlogPostDialog } from "@/components/admin/blog/delete-blog-post-dialog";
import { Plus, Pencil, Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Blog — Admin — EnglishHero101" };

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const search = q ?? "";
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const { items, totalCount, pageSize } = await getBlogPostsAdmin(search, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(target));
    return `/admin/blog?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Blog</h1>
          <p className="text-sm text-muted-foreground">{totalCount} posts.</p>
        </div>
        <Link href="/admin/blog/new" className={buttonVariants()}>
          <Plus /> New post
        </Link>
      </div>

      <form className="flex max-w-xs items-center gap-2" action="/admin/blog">
        <Input name="q" defaultValue={search} placeholder="Search by title..." />
        <Button type="submit" variant="outline" size="icon" aria-label="Search">
          <Search />
        </Button>
      </form>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? `No posts matching "${search}".` : "No blog posts yet."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant={post.status === "published" ? "default" : "outline"}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {post.status === "published" && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                              aria-label="View"
                            >
                              <ExternalLink />
                            </Link>
                          )}
                          <Link
                            href={`/admin/blog/${post.id}/edit`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label="Edit"
                          >
                            <Pencil />
                          </Link>
                          <DeleteBlogPostDialog id={post.id} title={post.title} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Link
                      href={pageHref(page - 1)}
                      aria-disabled={page <= 1}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        page <= 1 && "pointer-events-none opacity-50",
                      )}
                    >
                      <ChevronLeft /> Previous
                    </Link>
                    <Link
                      href={pageHref(page + 1)}
                      aria-disabled={page >= totalPages}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        page >= totalPages && "pointer-events-none opacity-50",
                      )}
                    >
                      Next <ChevronRight />
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
