"use client";

import Link from "next/link";
import { useActionState, useMemo, useRef, useState } from "react";
import {
  importLessonsCsv,
  importLessonsJson,
  type LessonImportState,
} from "@/lib/admin/lesson-bulk-import-actions";
import { parseCsv } from "@/lib/admin/csv-import";
import { validateLessonCsvRow } from "@/lib/admin/lesson-bulk-import";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";

const PREVIEW_ROW_LIMIT = 200;

const FORMAT_NOTES = (
  <div className="flex flex-col gap-2 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
    <p>
      <code>content</code> uses a lightweight text format so it&apos;s easy for an AI model to
      generate:
    </p>
    <ul className="list-inside list-disc">
      <li>
        <code>## Heading</code> — a level-2 heading (<code>###</code> / <code>####</code> for
        levels 3–4)
      </li>
      <li>Blank line — ends a paragraph</li>
      <li>
        <code>- item</code> or <code>1. item</code> — bullet or numbered list (consecutive lines)
      </li>
      <li>
        <code>&gt; text</code> — blockquote
      </li>
      <li>
        <code>[example]</code>, <code>[note]</code>, <code>[highlight]</code>,{" "}
        <code>[grammar-rule]</code>, <code>[question]</code>, or <code>[answer]</code> on its own
        line, followed by text — a callout box
      </li>
      <li>
        <code>**bold**</code>, <code>*italic*</code>, <code>__underline__</code>,{" "}
        <code>~~strike~~</code> — inline formatting
      </li>
      <li>
        <code>---</code> on its own line — horizontal rule
      </li>
    </ul>
    <p>
      <code>category</code> is the category&apos;s slug path (e.g. <code>grammar/tenses</code>),
      matching its URL under Content.
    </p>
  </div>
);

function CsvImportPanel() {
  const [state, formAction, pending] = useActionState<LessonImportState, FormData>(
    importLessonsCsv,
    undefined,
  );
  const [showFormat, setShowFormat] = useState(false);
  const [checks, setChecks] = useState<
    ({ label: string; title: string; category: string } & ({ ok: true } | { ok: false; error: string }))[]
    | null
  >(null);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setChecks(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const { rows } = parseCsv(text);
    setChecks(
      rows.map((row, index) => {
        const result = validateLessonCsvRow(row, index + 2);
        return result.ok
          ? { label: result.label, title: result.data.title, category: result.category, ok: true }
          : { label: result.label, title: row.title || "(missing)", category: row.category ?? "—", ok: false, error: result.error };
      }),
    );
  }

  const invalidCount = checks?.filter((r) => !r.ok).length ?? 0;
  const visibleRows = useMemo(() => checks?.slice(0, PREVIEW_ROW_LIMIT) ?? [], [checks]);

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
                {state.rowErrors.length > 20 && <p className="mt-1">...and {state.rowErrors.length - 20} more.</p>}
              </AlertDescription>
            )}
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <Label htmlFor="file">CSV file</Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowFormat((v) => !v)}>
            {showFormat ? <ChevronUp /> : <ChevronDown />}
            {showFormat ? "Hide format" : "Show format"}
          </Button>
        </div>
        {showFormat && FORMAT_NOTES}
        <Input id="file" name="file" type="file" accept=".csv,text/csv" onChange={handleFileChange} required />

        {checks && (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{fileName}</span>
              <Badge variant={invalidCount > 0 ? "destructive" : "default"}>
                {checks.length} lesson{checks.length === 1 ? "" : "s"}
                {invalidCount > 0 ? `, ${invalidCount} with errors` : " look valid"}
              </Badge>
              {checks.length > PREVIEW_ROW_LIMIT && (
                <span className="text-muted-foreground">(showing first {PREVIEW_ROW_LIMIT})</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleRows.map((row) => (
                    <TableRow key={row.label}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell>{row.title}</TableCell>
                      <TableCell>{row.ok ? row.category : "—"}</TableCell>
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
        <Button type="submit" disabled={pending || !checks || invalidCount > 0}>
          {pending ? "Importing..." : checks ? `Import ${checks.length} lesson(s)` : "Import"}
        </Button>
      </CardFooter>
    </form>
  );
}

const JSON_EXAMPLE = `[
  {
    "title": "Present Simple Tense",
    "slug": "present-simple-tense",
    "category": "grammar/tenses",
    "excerpt": "Learn how and when to use the present simple.",
    "difficulty": "beginner",
    "estimatedMinutes": 15,
    "status": "draft",
    "content": "## Present Simple\\n\\nThe present simple describes habits, facts, and routines.\\n\\n[example]\\nShe **walks** to school every day.\\n\\n- Use it for daily routines\\n- Add *-s* or *-es* for he/she/it"
  }
]`;

function JsonImportPanel() {
  const [state, formAction, pending] = useActionState<LessonImportState, FormData>(
    importLessonsJson,
    undefined,
  );
  const [showFormat, setShowFormat] = useState(false);
  const [payload, setPayload] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleLoadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPayload(await file.text());
    event.target.value = "";
  }

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
          <Label htmlFor="payload">Lesson document (JSON)</Label>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()}>
              Load from file
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowFormat((v) => !v)}>
              {showFormat ? <ChevronUp /> : <ChevronDown />}
              {showFormat ? "Hide format" : "Show format & example"}
            </Button>
          </div>
          <input ref={fileInputRef} type="file" accept=".json,application/json" hidden onChange={handleLoadFile} />
        </div>
        {showFormat && (
          <div className="flex flex-col gap-2">
            {FORMAT_NOTES}
            <pre className="overflow-x-auto rounded-md border bg-background p-3 text-xs">{JSON_EXAMPLE}</pre>
          </div>
        )}
        <Textarea
          id="payload"
          name="payload"
          rows={18}
          placeholder="Paste one lesson object, or an array of lesson objects..."
          className="font-mono text-xs"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          required
        />
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Importing..." : "Import"}
        </Button>
      </CardFooter>
    </form>
  );
}

export function LessonImportForm() {
  const [mode, setMode] = useState<"csv" | "json">("json");

  return (
    <Card className="max-w-4xl">
      <CardHeader>
        <CardTitle>Import lessons</CardTitle>
        <CardDescription>
          Bulk-add lessons from a JSON or CSV file — generate one with any AI model, starting from
          the template.{" "}
          <Link href="/admin/lessons/import/template-json" className="underline">
            Download JSON template
          </Link>{" "}
          ·{" "}
          <Link href="/admin/lessons/import/template" className="underline">
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
