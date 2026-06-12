import { BracketResponse, KnockoutRound, NationKnockoutResult } from "@/types";

// ESPN events/schedule endpoint — returns all matches for the competition.
// We filter for knockout-stage matches and derive which teams advanced/lost.
const ESPN_EVENTS_URL =
  process.env.BRACKET_ESPN_URL ??
  "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/scoreboard?season=2026&limit=200";

// ─── Bonus points per knockout round ──────────────────────────────────────────
// Scoring: each knockout win earns bonus points on top of group-stage points.
// Reaching a round (even if you then lose) earns the bonus for that round.

const ROUND_BONUS: Record<KnockoutRound, number> = {
  R32: 3,    // Won the round of 32
  R16: 6,    // Won the round of 16
  QF: 10,    // Won the quarter-final
  SF: 15,    // Won the semi-final
  Final: 21, // Reached the final (runner-up)
  Winner: 30,// Tournament winner
};

// ─── Round name normalisation ──────────────────────────────────────────────────

const ROUND_ALIASES: Record<string, KnockoutRound> = {
  // Round of 32 (first knockout round in WC 2026)
  "round of 32": "R32",
  "r32": "R32",
  "round of 32 -": "R32",
  // Round of 16
  "round of 16": "R16",
  "r16": "R16",
  "round of 16 -": "R16",
  // Quarter-final
  "quarterfinal": "QF",
  "quarter-final": "QF",
  "quarter final": "QF",
  "qf": "QF",
  // Semi-final
  "semifinal": "SF",
  "semi-final": "SF",
  "semi final": "SF",
  "sf": "SF",
  // Final
  "final": "Final",
  "3rd place": "SF", // 3rd-place play-off losers still reached the SF
  "third place": "SF",
  "third-place": "SF",
};

function normaliseRound(raw: string): KnockoutRound | null {
  const key = raw.trim().toLowerCase();
  return ROUND_ALIASES[key] ?? null;
}

const ROUND_ORDER: KnockoutRound[] = ["R32", "R16", "QF", "SF", "Final", "Winner"];

function isLaterRound(a: KnockoutRound, b: KnockoutRound): boolean {
  return ROUND_ORDER.indexOf(a) > ROUND_ORDER.indexOf(b);
}

// ─── ESPN event parsing ───────────────────────────────────────────────────────

interface TeamKOState {
  roundReached: KnockoutRound;
  alive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseEvents(data: any): Map<string, TeamKOState> {
  const teamMap = new Map<string, TeamKOState>();

  const events: unknown[] =
    data?.events ??
    data?.content?.events ??
    data?.children?.flatMap((c: { events?: unknown[] }) => c.events ?? []) ??
    [];

  for (const event of events) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ev = event as any;

    // Determine round
    const roundRaw: string =
      ev.season?.slug ??
      ev.seasonType?.name ??
      ev.name ??
      ev.shortName ??
      "";
    const round = normaliseRound(roundRaw);
    if (!round) continue; // group-stage event, skip

    const competitions: unknown[] = ev.competitions ?? [];
    for (const comp of competitions) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = comp as any;
      const competitors: unknown[] = c.competitors ?? [];
      if (competitors.length !== 2) continue;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [home, away] = competitors as any[];
      const homeScore = parseInt(home.score ?? "-1", 10);
      const awayScore = parseInt(away.score ?? "-1", 10);
      const completed = c.status?.type?.completed === true;

      for (const comp of [home, away]) {
        const name: string = comp.team?.displayName ?? comp.team?.name ?? "";
        if (!name) continue;

        // Determine if this competitor won (alive) or lost (eliminated)
        let alive = true; // tentative until match is complete
        if (completed) {
          const myScore = comp === home ? homeScore : awayScore;
          const oppScore = comp === home ? awayScore : homeScore;
          alive = myScore > oppScore;
          // Penalty/ET winner: ESPN sometimes stores in winner field
          if (homeScore === awayScore) {
            alive = comp.winner === true;
          }
        }

        const current = teamMap.get(name);
        if (!current || isLaterRound(round, current.roundReached)) {
          teamMap.set(name, { roundReached: round, alive });
        } else if (current.roundReached === round) {
          // Same round — if they won keep alive=true
          if (alive) teamMap.set(name, { roundReached: round, alive: true });
        }
      }
    }
  }

  // Promote winners to "Winner" if they won the Final
  for (const [name, state] of teamMap) {
    if (state.roundReached === "Final" && state.alive) {
      teamMap.set(name, { roundReached: "Winner", alive: true });
    }
  }

  return teamMap;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(ESPN_EVENTS_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return Response.json({ error: `ESPN returned ${res.status}` }, { status: 502 });
    }

    const data = await res.json();
    const teamMap = parseEvents(data);

    const isKnockout = teamMap.size > 0;

    const results: NationKnockoutResult[] = Array.from(teamMap.entries()).map(
      ([name, state]) => ({
        name,
        roundReached: state.roundReached,
        alive: state.alive,
        bonusPoints: ROUND_BONUS[state.roundReached],
      }),
    );

    const body: BracketResponse = {
      results,
      fetchedAt: new Date().toISOString(),
      phase: isKnockout ? "knockout" : "group",
    };

    return Response.json(body, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[bracket] fetch error:", err);
    return Response.json({ error: "Failed to fetch bracket" }, { status: 500 });
  }
}
