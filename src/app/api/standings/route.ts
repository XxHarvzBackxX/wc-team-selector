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

function parseEntries(
  entries: {
    team: { displayName?: string; name?: string; location?: string };
    stats: { name: string; value: number }[];
  }[],
  groupName: string,
): NationStanding[] {
  return entries.map((entry, idx) => {
    const name =
      entry.team.displayName ?? entry.team.location ?? entry.team.name ?? "Unknown";
    const stats = entry.stats ?? [];
    const gf = statValue(stats, "pointsFor") || statValue(stats, "goalsFor");
    const ga = statValue(stats, "pointsAgainst") || statValue(stats, "goalsAgainst");
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
    // ESPN sometimes puts a "group" stat on each entry
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
        // Allow browsers to cache for 5 min too
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
