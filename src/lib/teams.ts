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

// ─── Flag image codes (ISO 3166-1 alpha-2, lowercase) ────────────────────────
// Used with https://flagcdn.com/w40/{code}.png — no emoji fallback needed.
// England uses the subdivision code "gb-eng" supported by flagcdn.com.
export const TEAM_FLAGS: Record<string, string> = {
  // Major teams
  Brazil: "br",
  Argentina: "ar",
  France: "fr",
  England: "gb-eng",
  Spain: "es",
  Germany: "de",
  Portugal: "pt",
  Netherlands: "nl",
  Uruguay: "uy",
  USA: "us",
  // Minor teams
  Morocco: "ma",
  Senegal: "sn",
  Japan: "jp",
  Croatia: "hr",
  Colombia: "co",
  Mexico: "mx",
  Serbia: "rs",
  Ecuador: "ec",
  "South Korea": "kr",
  Panama: "pa",
};

// ─── Validation ───────────────────────────────────────────────────────────────
if (COMPANY_TEAMS.length !== MAJOR_TEAMS.length || COMPANY_TEAMS.length !== MINOR_TEAMS.length) {
  throw new Error(
    `teams.ts: All three lists must be the same length. ` +
      `Got COMPANY=${COMPANY_TEAMS.length}, MAJOR=${MAJOR_TEAMS.length}, MINOR=${MINOR_TEAMS.length}`
  );
}
