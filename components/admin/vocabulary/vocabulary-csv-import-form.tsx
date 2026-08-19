"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { importVocabularyCsv } from "@/lib/admin/vocabulary-actions";
import { parseCsv } from "@/lib/admin/csv-import";
import { validateVocabularyCsvRow } from "@/lib/admin/vocabulary-csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const PREVIEW_ROW_LIMIT = 200;

type RowCheck =
  | { row: number; word: string; category: string; difficulty: string; ok: true }
  | { row: number; word: string; ok: false; error: string };

export function VocabularyCsvImportForm() {
  const [state, formAction, pending] = useActionState(importVocabularyCsv, undefined);
  const [allChecks, setAllChecks] = useState<RowCheck[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setAllChecks(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const { rows } = parseCsv(text);
    setAllChecks(
      rows.map((row, index) => {
        const result = validateVocabularyCsvRow(row, index + 2);
        return result.ok
          ? {
              row: index + 2,
              word: result.data.word,
              category: result.categorySlug ?? "—",
              difficulty: result.data.difficulty ?? "—",
              ok: true,
            }
          : { row: result.row, word: row.word || "(missing)", ok: false, error: result.error };
      }),
    );
  }

  const invalidCount = allChecks?.filter((r) => !r.ok).length ?? 0;
  const visibleRows = useMemo(() => allChecks?.slice(0, PREVIEW_ROW_LIMIT) ?? [], [allChecks]);

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Import vocabulary from CSV</CardTitle>
        <CardDescription>
          Upload a CSV exported from Excel or Google Sheets.{" "}
          <Link href="/admin/vocabulary/import/template" className="underline">
            Download the template
          </Link>
          .
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="flex flex-col gap-4">
          {state?.error && (
            <Alert variant="destructive">
              <AlertTitle>{state.error}</AlertTitle>
              {state.rowErrors && (
                <AlertDescription>
                  <ul className="mt-1 list-disc pl-4">
                    {state.rowErrors.slice(0, 20).map((err, index) => (
                      <li key={index}>{err}</li>
                    ))}
                  </ul>
                  {state.rowErrors.length > 20 && (
                    <p className="mt-1">...and {state.rowErrors.length - 20} more.</p>
                  )}
                </AlertDescription>
              )}
            </Alert>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="file">CSV file</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              required
            />
          </div>

          {allChecks && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{fileName}</span>
                <Badge variant={invalidCount > 0 ? "destructive" : "default"}>
                  {allChecks.length} row{allChecks.length === 1 ? "" : "s"}
                  {invalidCount > 0 ? `, ${invalidCount} with errors` : " look valid"}
                </Badge>
                {allChecks.length > PREVIEW_ROW_LIMIT && (
                  <span className="text-muted-foreground">
                    (showing first {PREVIEW_ROW_LIMIT})
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Word</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleRows.map((row) => (
                      <TableRow key={row.row}>
                        <TableCell>{row.row}</TableCell>
                        <TableCell>{row.word}</TableCell>
                        <TableCell>{row.ok ? row.category : "—"}</TableCell>
                        <TableCell>{row.ok ? row.difficulty : "—"}</TableCell>
                        <TableCell>
                          {row.ok ? (
                            <Badge variant="outline">OK</Badge>
                          ) : (
                            <Badge variant="destructive" title={row.error}>
                              Error
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending || !allChecks || invalidCount > 0}>
            {pending ? "Importing..." : allChecks ? `Import ${allChecks.length} rows` : "Import"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
