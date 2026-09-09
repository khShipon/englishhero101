// The 9 general education boards for SSC/HSC exams in Bangladesh —
// the fixed grid the admin Board Questions manager organizes papers
// into, and also offered as datalist suggestions on the question set
// form. Madrasah and Technical boards exist too but aren't part of
// the year/board grid (SSC/HSC English board papers are overwhelmingly
// organized around these 9), so they stay free-text-only suggestions.
export const GENERAL_BOARDS = [
  "Dhaka Board",
  "Rajshahi Board",
  "Chattogram Board",
  "Cumilla Board",
  "Barishal Board",
  "Jashore Board",
  "Sylhet Board",
  "Dinajpur Board",
  "Mymensingh Board",
] as const;

export const BOARD_SUGGESTIONS: string[] = [...GENERAL_BOARDS, "Madrasah Board", "Technical Board"];
