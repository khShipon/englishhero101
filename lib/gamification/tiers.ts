// Growth-tier ladder for the points badge shown on the dashboard.
// Unlike the placement test (a one-off assessment), this tag only ever
// goes up — it's driven by what a student has actually completed.
export type Tier = { name: string; min: number };

export const TIERS: Tier[] = [
  { name: "Beginner", min: 0 },
  { name: "Elementary", min: 50 },
  { name: "Pre-Intermediate", min: 150 },
  { name: "Intermediate", min: 300 },
  { name: "Upper-Intermediate", min: 500 },
  { name: "Advanced", min: 800 },
];

export function getTierInfo(points: number): { tier: Tier; next: Tier | null } {
  let tier = TIERS[0];
  let next: Tier | null = null;

  for (let i = 0; i < TIERS.length; i++) {
    if (points >= TIERS[i].min) {
      tier = TIERS[i];
      next = TIERS[i + 1] ?? null;
    }
  }

  return { tier, next };
}
