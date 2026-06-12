import { GroupStanding, NationStanding, StandingsResponse } from "@/types";

// ESPN's undocumented public API — no auth required, fetched server-side.
// WC 2026 uses the "fifa.world" slug; add ?season=2026 to target the right year.
const ESPN_URL =
  process.env.STANDINGS_ESPN_URL ??
  "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings?season=2026";

// ─── Helpers to parse ESPN's response shape ───────────────────────────────────

function statValue(stats: { name: string; value: number }[], name: string): number {
  return stats.find((s) => s.name === name)?.value ?? 0;
}

/**
 * ESPN standings entries can carry a `note` object:
 *   { color: "00ff00", description: "Clinched knockout stage", abbreviation: "x" }
 *   { color: "ff0000", description: "Eliminated", abbreviation: "e" }
 * We treat any note with abbreviation "e" (or red-ish colour) as eliminated.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNote(entry: any): { eliminated: boolean; note: string | null } {
  const note = entry.note ?? entry.clincher ?? null;
  if (!note) return { eliminated: false, note: null };

  const desc: string = note.description ?? note.shortDescription ?? "";
  const abbr: string = (note.abbreviation ?? "").toLowerCase();
  const color: string = (note.color ?? "").toLowerCase().replace("#", "");

  // Red-ish colours or "e" abbreviation → eliminated
  const isEliminated =
    abbr === "e" ||
    desc.toLowerCase().includes("eliminat") ||
    color === "ff0000" ||
    color === "d00" ||
    color === "red";

  return { eliminated: isEliminated, note: desc || null };
}

function parseEntries(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entries: any[],
  groupName: string,
): NationStanding[] {
  return entries.map((entry, idx) => {
    const name =
      entry.team?.displayName ?? entry.team?.location ?? entry.team?.name ?? "Unknown";
    const stats: { name: string; value: number }[] = entry.stats ?? [];
    const gf = statValue(stats, "pointsFor") || statValue(stats, "goalsFor");
    const ga = statValue(stats, "pointsAgainst") || statValue(stats, "goalsAgainst");
    const { eliminated, note } = parseNote(entry);
    return {
      name,
      played: statValue(stats, "gamesPlayed"),
      won: statValue(stats, "wins"),
      drawn: statValue(stats, "ties"),
      lost: statValue(stats, "losses"),
      goalsFor: gf,
      goalsAgainst: ga,
      goalDifference: statValue(stats, "pointDifferential") || gf - ga,
      points: statValue(stats, "points"),
      group: groupName,
      position: idx + 1,
      eliminated,
      note,
    };
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseESPN(data: any): GroupStanding[] {
  const groups: GroupStanding[] = [];

  // Shape 1: data.children[] each has .name + .standings.entries[]
  if (Array.isArray(data?.children)) {
    for (const child of data.children) {
      const groupName: string = child.name ?? child.abbreviation ?? "Group";
      const entries = child?.standings?.entries ?? child?.entries ?? [];
      if (entries.length) {
        groups.push({ group: groupName, teams: parseEntries(entries, groupName) });
      }
    }
    if (groups.length) return groups;
  }

  // Shape 2: data.standings.entries[] flat list (league-style)
  const flat = data?.standings?.entries ?? data?.entries ?? [];
  if (flat.length) {
    const grouped: Record<string, typeof flat> = {};
    for (const entry of flat) {
      const grpStat = entry.stats?.find(
        (s: { name: string }) => s.name === "group" || s.name === "groupName",
      );
      const grpName: string = grpStat?.displayValue ?? grpStat?.value ?? "Group A";
      (grouped[grpName] ??= []).push(entry);
    }
    for (const [grpName, entries] of Object.entries(grouped)) {
      groups.push({ group: grpName, teams: parseEntries(entries, grpName) });
    }
    if (groups.length) return groups;
  }

  return groups;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(ESPN_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!res.ok) {
      return Response.json(
        { error: `ESPN API returned ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    const groups = parseESPN(data);

    const body: StandingsResponse = {
      groups,
      fetchedAt: new Date().toISOString(),
      source: "ESPN",
    };

    return Response.json(body, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[standings] fetch error:", err);
    return Response.json(
      { error: "Failed to fetch standings" },
      { status: 500 },
    );
  }
}
