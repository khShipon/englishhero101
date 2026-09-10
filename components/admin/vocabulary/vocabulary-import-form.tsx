"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import { importVocabularyCsv, importVocabularyJson } from "@/lib/admin/vocabulary-actions";
import type { CsvImportState } from "@/lib/admin/csv-import";
import { parseCsv } from "@/lib/admin/csv-import";
import { validateVocabularyCsvRow } from "@/lib/admin/vocabulary-csv";
import { validateVocabularyJsonItem } from "@/lib/admin/vocabulary-bulk-import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ChevronDown, ChevronUp } from "lucide-react";

const PREVIEW_ROW_LIMIT = 200;

type RowCheck =
  | { label: string; word: string; category: string; difficulty: string; ok: true }
  | { label: string; word: string; ok: false; error: string };

function CsvImportPanel() {
  const [state, formAction, pending] = useActionState<CsvImportState, FormData>(
    importVocabularyCsv,
    undefined,
  );
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
              label: `Row ${index + 2}`,
              word: result.data.word,
              category: result.categorySlug ?? "—",
              difficulty: result.data.difficulty ?? "—",
              ok: true,
            }
          : { label: `Row ${result.row}`, word: row.word || "(missing)", ok: false, error: result.error };
      }),
    );
  }

  const invalidCount = allChecks?.filter((r) => !r.ok).length ?? 0;
  const visibleRows = useMemo(() => allChecks?.slice(0, PREVIEW_ROW_LIMIT) ?? [], [allChecks]);

  return (
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
                    <TableRow key={row.label}>
                      <TableCell>{row.label}</TableCell>
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
  );
}

const JSON_EXAMPLE = `[
  {
    "word": "Meticulous",
    "pronunciation": "/mə'tɪkjələs/",
    "partOfSpeech": "adjective",
    "banglaMeaning": "সূক্ষ্ম",
    "englishDefinition": "Showing great attention to detail",
    "exampleSentence": "She is meticulous about her work.",
    "synonyms": ["careful", "thorough"],
    "antonyms": ["careless", "sloppy"],
    "difficulty": "intermediate",
    "category": "vocabulary"
  }
]`;

function JsonImportPanel() {
  const [state, formAction, pending] = useActionState<CsvImportState, FormData>(
    importVocabularyJson,
    undefined,
  );
  const [showFormat, setShowFormat] = useState(false);
  const [payload, setPayload] = useState("");
  const [preview, setPreview] = useState<{ ok: boolean; word: string; error?: string }[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePayloadChange(value: string) {
    setPayload(value);
    if (!value.trim()) {
      setPreview(null);
      return;
    }
    try {
      const raw = JSON.parse(value);
      const items = Array.isArray(raw) ? raw : [raw];
      setPreview(
        items.map((item, index) => {
          const result = validateVocabularyJsonItem(item, index);
          return result.ok
            ? { ok: true, word: result.data.word }
            : { ok: false, word: "(invalid)", error: result.error };
        }),
      );
    } catch {
      setPreview(null);
    }
  }

  async function handleLoadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    handlePayloadChange(await file.text());
    event.target.value = "";
  }

  const invalidCount = preview?.filter((r) => !r.ok).length ?? 0;

  return (
    <form action={formAction}>
      <CardContent className="flex flex-col gap-4">
        {state?.error && (
          <Alert variant="destructive">
            <AlertDescription>
              <p>{state.error}</p>
              {state.rowErrors && state.rowErrors.length > 0 && (
                <ul className="mt-2 list-inside list-disc text-sm">
                  {state.rowErrors.slice(0, 20).map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="payload">Word list (JSON)</Label>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              Load from file
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowFormat((v) => !v)}>
              {showFormat ? <ChevronUp /> : <ChevronDown />}
              {showFormat ? "Hide example" : "Show example"}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleLoadFile} />
        </div>
        {showFormat && (
          <pre className="overflow-x-auto rounded-md border bg-background p-3 text-xs">{JSON_EXAMPLE}</pre>
        )}
        <Textarea
          id="payload"
          name="payload"
          rows={16}
          placeholder="Paste one word object, or an array of word objects..."
          className="font-mono text-xs"
          value={payload}
          onChange={(e) => handlePayloadChange(e.target.value)}
          required
        />

        {preview && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant={invalidCount > 0 ? "destructive" : "default"}>
              {preview.length} word{preview.length === 1 ? "" : "s"}
              {invalidCount > 0 ? `, ${invalidCount} with errors` : " look valid"}
            </Badge>
            {invalidCount > 0 && (
              <ul className="basis-full list-inside list-disc text-muted-foreground">
                {preview
                  .filter((r) => !r.ok)
                  .slice(0, 10)
                  .map((r, i) => (
                    <li key={i}>{r.error}</li>
                  ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={pending || !preview || invalidCount > 0}>
          {pending ? "Importing..." : preview ? `Import ${preview.length} word(s)` : "Import"}
        </Button>
      </CardFooter>
    </form>
  );
}

export function VocabularyImportForm() {
  const [mode, setMode] = useState<"csv" | "json">("json");

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle>Import vocabulary</CardTitle>
        <CardDescription>
          Bulk-add words from a JSON or CSV file — generate one with any AI model, starting from
          the template.{" "}
          <Link href="/admin/vocabulary/import/template-json" className="underline">
            Download JSON template
          </Link>{" "}
          ·{" "}
          <Link href="/admin/vocabulary/import/template" className="underline">
            Download CSV template
          </Link>
          .
        </CardDescription>
        <div className="flex gap-2 pt-2">
          <Button type="button" size="sm" variant={mode === "json" ? "default" : "outline"} onClick={() => setMode("json")}>
            Paste JSON
          </Button>
          <Button type="button" size="sm" variant={mode === "csv" ? "default" : "outline"} onClick={() => setMode("csv")}>
            Upload CSV
          </Button>
        </div>
      </CardHeader>
      {mode === "json" ? <JsonImportPanel /> : <CsvImportPanel />}
    </Card>
  );
}
