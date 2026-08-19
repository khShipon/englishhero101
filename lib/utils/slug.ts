// U+0300-U+036F is the Unicode "Combining Diacritical Marks" block —
// what NFKD normalization splits accented Latin letters into (e.g.
// "e" + COMBINING ACUTE ACCENT), so stripping this range removes
// accents while keeping the base letters.
const COMBINING_DIACRITICS_START = 0x0300;
const COMBINING_DIACRITICS_END = 0x036f;

function stripCombiningDiacritics(value: string): string {
  let result = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    if (code < COMBINING_DIACRITICS_START || code > COMBINING_DIACRITICS_END) {
      result += char;
    }
  }
  return result;
}

// Converts a title into a URL-safe slug matching the database's
// content_nodes_slug_format / lessons_slug_format CHECK constraint:
// lowercase alphanumeric segments separated by single hyphens. Only
// handles Latin-script input — a Bangla-only title normalizes to an
// empty string, so the CMS must let admins supply a slug manually for
// those (per the project brief: "Allow administrators to manually
// edit slugs").
export function slugify(input: string): string {
  return stripCombiningDiacritics(input.normalize("NFKD"))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
