// ─── Edit these lists to match your sweepstakes ─────────────────────────────
// All three arrays must be the same length (up to 16 entries).

export const COMPANY_TEAMS: string[] = [
  "Team Alpha",
  "Team Bravo",
  "Team Charlie",
  "Team Delta",
  "Team Echo",
  "Team Foxtrot",
  "Team Golf",
  "Team Hotel",
  "Team India",
  "Team Juliet",
];

// Stronger / well-known FIFA WC 2026 nations
export const MAJOR_TEAMS: string[] = [
  "Brazil",
  "Argentina",
  "France",
  "England",
  "Spain",
  "Germany",
  "Portugal",
  "Netherlands",
  "Uruguay",
  "USA",
];

// Smaller / underdog FIFA WC 2026 nations
export const MINOR_TEAMS: string[] = [
  "Morocco",
  "Senegal",
  "Japan",
  "Croatia",
  "Colombia",
  "Mexico",
  "Serbia",
  "Ecuador",
  "South Korea",
  "Panama",
];

// ─── Validation ───────────────────────────────────────────────────────────────
if (COMPANY_TEAMS.length !== MAJOR_TEAMS.length || COMPANY_TEAMS.length !== MINOR_TEAMS.length) {
  throw new Error(
    `teams.ts: All three lists must be the same length. ` +
      `Got COMPANY=${COMPANY_TEAMS.length}, MAJOR=${MAJOR_TEAMS.length}, MINOR=${MINOR_TEAMS.length}`
  );
}
