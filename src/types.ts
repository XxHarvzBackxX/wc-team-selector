export type DrawStatus = "idle" | "running" | "complete";

export interface TeamResult {
  major: string;
  minor: string;
}

export interface DrawState {
  status: DrawStatus;
  currentRevealIndex: number;  // which team is currently spinning
  revealedCount: number;       // how many teams have fully landed
  revealOrder: string[];
  results: Record<string, TeamResult>;
  countdown?: number | null;
}

// ─── WC 2026 Standings ────────────────────────────────────────────────────────

export interface NationStanding {
  name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  group: string;
  position: number;
  /** True when ESPN's note marks this team as eliminated from the tournament */
  eliminated: boolean;
  /** ESPN note description, e.g. "Clinched knockout stage", "Eliminated" */
  note: string | null;
}

export interface GroupStanding {
  group: string;   // e.g. "Group A"
  teams: NationStanding[];
}

export interface StandingsResponse {
  groups: GroupStanding[];
  fetchedAt: string;
  source: string;
}

// ─── Knockout bracket ─────────────────────────────────────────────────────────

/** How far a nation has progressed in the knockout stage */
export type KnockoutRound =
  | "R32"      // Round of 32 (WC 2026 — first knockout round)
  | "R16"      // Round of 16
  | "QF"       // Quarter-final
  | "SF"       // Semi-final
  | "Final"    // Final (runner-up OR champion — see `champion`)
  | "Winner";  // Tournament winner

export interface NationKnockoutResult {
  name: string;
  /** Furthest round this nation has participated in */
  roundReached: KnockoutRound;
  /** Whether they won (still alive) or lost (eliminated) in that round */
  alive: boolean;
  /** Extra points awarded for knockout progression */
  bonusPoints: number;
}

export interface BracketResponse {
  results: NationKnockoutResult[];
  fetchedAt: string;
  phase: "group" | "knockout";  // "group" = knockout not started yet
}

// ─── Sweepstakes leaderboard ──────────────────────────────────────────────────

/** One row in the sweepstakes leaderboard */
export interface SweepstakesEntry {
  companyTeam: string;
  majorTeam: string | null;
  minorTeam: string | null;
  majorPoints: number | null;
  minorPoints: number | null;
  majorKnockout: NationKnockoutResult | null;
  minorKnockout: NationKnockoutResult | null;
  /** Group stage + knockout bonus combined */
  totalPoints: number | null;
  /** "no-draw" = draw hasn't happened; "no-matches" = no games played; "ok" = has data */
  status: "ok" | "no-draw" | "no-matches";
  /** True when BOTH nations are eliminated from the tournament */
  bothEliminated: boolean;
}
