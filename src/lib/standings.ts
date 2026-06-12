import {
  DrawState,
  GroupStanding,
  NationStanding,
  StandingsResponse,
  SweepstakesEntry,
} from "@/types";
import { COMPANY_TEAMS } from "./teams";

// ─── Client-side fetch ────────────────────────────────────────────────────────

export async function fetchStandings(): Promise<StandingsResponse> {
  const res = await fetch("/api/standings");
  if (!res.ok) throw new Error(`standings fetch failed: ${res.status}`);
  return res.json() as Promise<StandingsResponse>;
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Build a flat map of nation display-name → NationStanding for quick lookups */
export function buildNationMap(
  groups: GroupStanding[],
): Map<string, NationStanding> {
  const map = new Map<string, NationStanding>();
  for (const group of groups) {
    for (const team of group.teams) {
      map.set(team.name.toLowerCase(), team);
    }
  }
  return map;
}

/**
 * Match a WC nation name (from our teams.ts list) to an ESPN team entry.
 * ESPN sometimes uses different spellings (e.g. "United States" vs "USA",
 * "South Korea" vs "Korea Republic"), so we try a few fallbacks.
 */
const ESPN_NAME_OVERRIDES: Record<string, string[]> = {
  usa: ["united states", "usa", "united states men's national soccer team"],
  "south korea": ["korea republic", "south korea", "republic of korea"],
  türkiye: ["turkey", "türkiye"],
  "ivory coast": ["côte d'ivoire", "ivory coast", "cote d'ivoire"],
  "dr congo": ["dr congo", "democratic republic of congo", "congo dr"],
  "cape verde": ["cape verde", "cabo verde"],
  "bosnia and herzegovina": ["bosnia & herzegovina", "bosnia and herzegovina"],
  czechia: ["czech republic", "czechia"],
};

export function findNation(
  name: string,
  nationMap: Map<string, NationStanding>,
): NationStanding | null {
  const key = name.toLowerCase();
  if (nationMap.has(key)) return nationMap.get(key)!;

  const overrides = ESPN_NAME_OVERRIDES[key] ?? [];
  for (const alt of overrides) {
    if (nationMap.has(alt)) return nationMap.get(alt)!;
  }

  // Partial match fallback
  for (const [mapKey, standing] of nationMap) {
    if (mapKey.includes(key) || key.includes(mapKey)) return standing;
  }

  return null;
}

// ─── Sweepstakes leaderboard ──────────────────────────────────────────────────

export function buildSweepstakesLeaderboard(
  groups: GroupStanding[],
  drawState: DrawState | null,
): SweepstakesEntry[] {
  const nationMap = buildNationMap(groups);
  const drawComplete = drawState?.status === "complete" || drawState?.status === "running";

  const entries: SweepstakesEntry[] = COMPANY_TEAMS.map((companyTeam) => {
    const result = drawState?.results?.[companyTeam];

    if (!result || !drawComplete) {
      return {
        companyTeam,
        majorTeam: null,
        minorTeam: null,
        majorPoints: null,
        minorPoints: null,
        totalPoints: null,
        status: "no-draw",
      };
    }

    const majorNation = findNation(result.major, nationMap);
    const minorNation = findNation(result.minor, nationMap);

    const majorPoints = majorNation?.played ? majorNation.points : null;
    const minorPoints = minorNation?.played ? minorNation.points : null;

    const hasAnyPoints = majorPoints !== null || minorPoints !== null;

    return {
      companyTeam,
      majorTeam: result.major,
      minorTeam: result.minor,
      majorPoints,
      minorPoints,
      totalPoints: hasAnyPoints ? (majorPoints ?? 0) + (minorPoints ?? 0) : null,
      status: hasAnyPoints ? "ok" : "no-matches",
    };
  });

  // Sort: teams with points first (desc), then no-matches, then no-draw
  return entries.sort((a, b) => {
    if (a.totalPoints !== null && b.totalPoints !== null) {
      return b.totalPoints - a.totalPoints;
    }
    if (a.totalPoints !== null) return -1;
    if (b.totalPoints !== null) return 1;
    if (a.status === "no-matches" && b.status === "no-draw") return -1;
    if (a.status === "no-draw" && b.status === "no-matches") return 1;
    return a.companyTeam.localeCompare(b.companyTeam);
  });
}
