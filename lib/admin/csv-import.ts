import Papa from "papaparse";

export const MAX_CSV_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export type CsvRow = Record<string, string>;

export type CsvParseResult = {
  rows: CsvRow[];
  errors: string[];
};

export type CsvImportState =
  | {
      error?: string;
      rowErrors?: string[];
    }
  | undefined;

// Parses CSV text (from an Excel/Sheets export) into header-keyed rows.
// Header names and cell values are trimmed so "Word " / " word" both
// match the "word" column, matching how people actually clean up
// spreadsheets. Used identically on the client (instant preview) and
// the server (the only parse that's ever trusted for the real import).
export function parseCsv(text: string): CsvParseResult {
  const result = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim().toLowerCase(),
    transform: (value) => value.trim(),
  });

  const errors = result.errors.map(
    (error) => `Row ${(error.row ?? 0) + 2}: ${error.message}`,
  );

  return { rows: result.data, errors };
}

// Multi-value cells (synonyms, options, etc.) use ";" to separate
// values, since "," is already the column delimiter.
export function splitMultiValue(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
