import type { Metadata } from "next";
import Link from "next/link";
import { getVocabularyList } from "@/lib/queries/vocabulary";
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
import { DeleteVocabularyDialog } from "@/components/admin/vocabulary/delete-vocabulary-dialog";
import { Plus, Pencil, Search, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Vocabulary — Admin — EnglishHero101" };

export default async function AdminVocabularyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const search = q ?? "";
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const { items, totalCount, pageSize } = await getVocabularyList(search, page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    params.set("page", String(target));
    return `/admin/vocabulary?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vocabulary</h1>
          <p className="text-sm text-muted-foreground">{totalCount} words.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/vocabulary/import" className={buttonVariants({ variant: "outline" })}>
            <Upload /> Import CSV
          </Link>
          <Link href="/admin/vocabulary/new" className={buttonVariants()}>
            <Plus /> New word
          </Link>
        </div>
      </div>

      <form className="flex max-w-xs items-center gap-2" action="/admin/vocabulary">
        <Input name="q" defaultValue={search} placeholder="Search by word..." />
        <Button type="submit" variant="outline" size="icon" aria-label="Search">
          <Search />
        </Button>
      </form>

      <Card>
        <CardContent>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? `No words matching "${search}".` : "No vocabulary entries yet."}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Word</TableHead>
                    <TableHead>Part of speech</TableHead>
                    <TableHead>Bangla meaning</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.word}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.partOfSpeech || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {entry.banglaMeaning || "—"}
                      </TableCell>
                      <TableCell>
                        {entry.difficulty ? (
                          <Badge variant="outline">{entry.difficulty}</Badge>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Link
                            href={`/admin/vocabulary/${entry.id}/edit`}
                            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
                            aria-label="Edit"
                          >
                            <Pencil />
                          </Link>
                          <DeleteVocabularyDialog id={entry.id} word={entry.word} />
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
