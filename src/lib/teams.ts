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

// ─── Wikipedia links — shown when a team slot is revealed ────────────────────
// Each URL opens the national team's Wikipedia page (squad, history, WC wins).
export const TEAM_WIKI: Record<string, string> = {
  // Major teams
  Brazil:      "https://en.wikipedia.org/wiki/Brazil_national_football_team",
  Argentina:   "https://en.wikipedia.org/wiki/Argentina_national_football_team",
  France:      "https://en.wikipedia.org/wiki/France_national_football_team",
  England:     "https://en.wikipedia.org/wiki/England_national_football_team",
  Spain:       "https://en.wikipedia.org/wiki/Spain_national_football_team",
  Germany:     "https://en.wikipedia.org/wiki/Germany_national_football_team",
  Portugal:    "https://en.wikipedia.org/wiki/Portugal_national_football_team",
  Netherlands: "https://en.wikipedia.org/wiki/Netherlands_national_football_team",
  Uruguay:     "https://en.wikipedia.org/wiki/Uruguay_national_football_team",
  USA:         "https://en.wikipedia.org/wiki/United_States_men%27s_national_soccer_team",
  // Minor teams
  Morocco:       "https://en.wikipedia.org/wiki/Morocco_national_football_team",
  Senegal:       "https://en.wikipedia.org/wiki/Senegal_national_football_team",
  Japan:         "https://en.wikipedia.org/wiki/Japan_national_football_team",
  Croatia:       "https://en.wikipedia.org/wiki/Croatia_national_football_team",
  Colombia:      "https://en.wikipedia.org/wiki/Colombia_national_football_team",
  Mexico:        "https://en.wikipedia.org/wiki/Mexico_national_football_team",
  Serbia:        "https://en.wikipedia.org/wiki/Serbia_national_football_team",
  Ecuador:       "https://en.wikipedia.org/wiki/Ecuador_national_football_team",
  "South Korea": "https://en.wikipedia.org/wiki/South_Korea_national_football_team",
  Panama:        "https://en.wikipedia.org/wiki/Panama_national_football_team",
};
if (COMPANY_TEAMS.length !== MAJOR_TEAMS.length || COMPANY_TEAMS.length !== MINOR_TEAMS.length) {
  throw new Error(
    `teams.ts: All three lists must be the same length. ` +
      `Got COMPANY=${COMPANY_TEAMS.length}, MAJOR=${MAJOR_TEAMS.length}, MINOR=${MINOR_TEAMS.length}`
  );
}
