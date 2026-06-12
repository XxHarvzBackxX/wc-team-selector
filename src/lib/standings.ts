import {
  BracketResponse,
  DrawState,
  GroupStanding,
  NationKnockoutResult,
  NationStanding,
  StandingsResponse,
  SweepstakesEntry,
} from "@/types";
import { COMPANY_TEAMS } from "./teams";

// ─── Client-side fetches ──────────────────────────────────────────────────────

export async function fetchStandings(): Promise<StandingsResponse> {
  const res = await fetch("/api/standings");
  if (!res.ok) throw new Error(`standings fetch failed: ${res.status}`);
  return res.json() as Promise<StandingsResponse>;
}

export async function fetchBracket(): Promise<BracketResponse> {
  const res = await fetch("/api/bracket");
  if (!res.ok) throw new Error(`bracket fetch failed: ${res.status}`);
  return res.json() as Promise<BracketResponse>;
}

// ─── Lookup helpers ───────────────────────────────────────────────────────────

/** Build a flat map of nation display-name (lowercase) → NationStanding */
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

/** Build a flat map of nation name (lowercase) → NationKnockoutResult */
export function buildKnockoutMap(
  results: NationKnockoutResult[],
): Map<string, NationKnockoutResult> {
  const map = new Map<string, NationKnockoutResult>();
  for (const r of results) {
    map.set(r.name.toLowerCase(), r);
  }
  return map;
}

/**
 * Match a WC nation name (from our teams.ts list) to an ESPN team entry.
 * ESPN sometimes uses different spellings, so we try a few fallbacks.
 */
const ESPN_NAME_OVERRIDES: Record<string, string[]> = {
  usa: ["united states", "usa", "united states men's national soccer team"],
  "south korea": ["korea republic", "south korea", "republic of korea"],
  türkiye: ["turkey", "türkiye"],
  "ivory coast": ["côte d'ivoire", "ivory coast", "cote d'ivoire"],
  "dr congo": ["dr congo", "democratic republic of congo", "congo dr", "congo, dr"],
  "cape verde": ["cape verde", "cabo verde"],
  "bosnia and herzegovina": ["bosnia & herzegovina", "bosnia and herzegovina"],
  czechia: ["czech republic", "czechia"],
};

/**
 * Reverse of ESPN_NAME_OVERRIDES: maps any known ESPN spelling (lowercase)
 * back to our canonical name as used in TEAM_FLAGS / teams.ts.
 * e.g. "united states" → "USA", "congo dr" → "DR Congo"
 */
const ESPN_TO_CANONICAL: Map<string, string> = new Map(
  Object.entries(ESPN_NAME_OVERRIDES).flatMap(([canonical, aliases]) =>
    aliases.map((alias) => [alias.toLowerCase(), canonical] as [string, string]),
  ),
);

/** Convert an ESPN team display name to our canonical name (for flag lookup, etc.). */
export function toCanonicalName(espnName: string): string {
  return ESPN_TO_CANONICAL.get(espnName.toLowerCase()) ?? espnName;
}

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

export function findKnockout(
  name: string,
  knockoutMap: Map<string, NationKnockoutResult>,
): NationKnockoutResult | null {
  const key = name.toLowerCase();
  if (knockoutMap.has(key)) return knockoutMap.get(key)!;

  const overrides = ESPN_NAME_OVERRIDES[key] ?? [];
  for (const alt of overrides) {
    if (knockoutMap.has(alt)) return knockoutMap.get(alt)!;
  }

  for (const [mapKey, result] of knockoutMap) {
    if (mapKey.includes(key) || key.includes(mapKey)) return result;
  }

  return null;
}

// ─── Sweepstakes leaderboard ──────────────────────────────────────────────────

export function buildSweepstakesLeaderboard(
  groups: GroupStanding[],
  drawState: DrawState | null,
  knockoutResults: NationKnockoutResult[] = [],
): SweepstakesEntry[] {
  const nationMap = buildNationMap(groups);
  const knockoutMap = buildKnockoutMap(knockoutResults);
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
        majorKnockout: null,
        minorKnockout: null,
        totalPoints: null,
        status: "no-draw",
        bothEliminated: false,
      };
    }

    const majorNation = findNation(result.major, nationMap);
    const minorNation = findNation(result.minor, nationMap);
    const majorKO = findKnockout(result.major, knockoutMap);
    const minorKO = findKnockout(result.minor, knockoutMap);

    const majorGroupPts = majorNation?.played ? majorNation.points : null;
    const minorGroupPts = minorNation?.played ? minorNation.points : null;
    const majorBonus = majorKO?.bonusPoints ?? 0;
    const minorBonus = minorKO?.bonusPoints ?? 0;

    const majorPoints = majorGroupPts !== null ? majorGroupPts + majorBonus : null;
    const minorPoints = minorGroupPts !== null ? minorGroupPts + minorBonus : null;

    const hasAnyPoints = majorPoints !== null || minorPoints !== null;

    // A nation is only definitively eliminated from the group stage after
    // playing all 3 games (ESPN can send premature notes after a single loss).
    // In the knockout phase, use the bracket alive status instead.
    const groupStageDone = (n: typeof majorNation) => (n?.played ?? 0) >= 3;
    const majorElim =
      (majorNation?.eliminated && groupStageDone(majorNation)) ||
      (majorKO ? !majorKO.alive : false);
    const minorElim =
      (minorNation?.eliminated && groupStageDone(minorNation)) ||
      (minorKO ? !minorKO.alive : false);

    return {
      companyTeam,
      majorTeam: result.major,
      minorTeam: result.minor,
      majorPoints,
      minorPoints,
      majorKnockout: majorKO,
      minorKnockout: minorKO,
      totalPoints: hasAnyPoints ? (majorPoints ?? 0) + (minorPoints ?? 0) : null,
      status: hasAnyPoints ? "ok" : "no-matches",
      bothEliminated: majorElim && minorElim,
    };
  });

  // Sort: teams with points first (desc), then no-matches, then no-draw
  // Within points: eliminated teams sink below alive ones at same points
  return entries.sort((a, b) => {
    if (a.totalPoints !== null && b.totalPoints !== null) {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      // Same points: alive teams rank higher
      if (a.bothEliminated && !b.bothEliminated) return 1;
      if (!a.bothEliminated && b.bothEliminated) return -1;
      return a.companyTeam.localeCompare(b.companyTeam);
    }
    if (a.totalPoints !== null) return -1;
    if (b.totalPoints !== null) return 1;
    if (a.status === "no-matches" && b.status === "no-draw") return -1;
    if (a.status === "no-draw" && b.status === "no-matches") return 1;
    return a.companyTeam.localeCompare(b.companyTeam);
  });
}
