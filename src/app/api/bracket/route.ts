import { BracketResponse, KnockoutRound, NationKnockoutResult } from "@/types";

// ESPN events/schedule endpoint — returns all matches for the competition.
// We filter for knockout-stage matches and derive which teams advanced/lost.
const ESPN_EVENTS_URL =
  process.env.BRACKET_ESPN_URL ??
  "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=2026&limit=200";

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
  "round-of-32": "R32",
  // Round of 16
  "round of 16": "R16",
  "r16": "R16",
  "round of 16 -": "R16",
  "round-of-16": "R16",
  // Quarter-final
  "quarterfinal": "QF",
  "quarter-final": "QF",
  "quarter final": "QF",
  "qf": "QF",
  "quarterfinals": "QF",
  // Semi-final
  "semifinal": "SF",
  "semi-final": "SF",
  "semi final": "SF",
  "sf": "SF",
  "semifinals": "SF",
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

const NEXT_ROUND: Partial<Record<KnockoutRound, KnockoutRound>> = {
  R32: "R16",
  R16: "QF",
  QF: "SF",
  SF: "Final",
  Final: "Winner",
};

function isLaterRound(a: KnockoutRound, b: KnockoutRound): boolean {
  return ROUND_ORDER.indexOf(a) > ROUND_ORDER.indexOf(b);
}

function isPlaceholderTeam(name: string): boolean {
  return /(?:winner|loser|tbd|to be determined)/i.test(name);
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
      const completed = c.status?.type?.completed === true;

      for (const competitor of [home, away]) {
        const name: string =
          competitor.team?.displayName ?? competitor.team?.name ?? "";
        if (!name || isPlaceholderTeam(name)) continue;

        let alive = true;
        let roundReached = round;

        if (completed) {
          let won = competitor.winner === true;

          // A few ESPN responses omit the winner boolean for regulation wins.
          if (home.winner !== true && away.winner !== true) {
            const myScore = Number(competitor.score);
            const opponentScore = Number(competitor === home ? away.score : home.score);
            won = Number.isFinite(myScore) && Number.isFinite(opponentScore) && myScore > opponentScore;
          }

          alive = won;
          if (won) roundReached = NEXT_ROUND[round] ?? round;
        }

        const current = teamMap.get(name);
        if (!current || isLaterRound(roundReached, current.roundReached)) {
          teamMap.set(name, { roundReached, alive });
        } else if (current.roundReached === roundReached && alive !== current.alive) {
          teamMap.set(name, { roundReached, alive });
        }
      }
    }
  }

  return teamMap;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<Response> {
  try {
    const res = await fetch(ESPN_EVENTS_URL, {
      headers: { Accept: "application/json" },
      cache: "no-store",
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
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (err) {
    console.error("[bracket] fetch error:", err);
    return Response.json({ error: "Failed to fetch bracket" }, { status: 500 });
  }
}
