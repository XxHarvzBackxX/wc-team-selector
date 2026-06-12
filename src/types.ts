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

/** One row in the sweepstakes leaderboard */
export interface SweepstakesEntry {
  companyTeam: string;
  majorTeam: string | null;
  minorTeam: string | null;
  majorPoints: number | null;
  minorPoints: number | null;
  /** null = no matches played yet (N/A) */
  totalPoints: number | null;
  /** "no-draw" = draw hasn't happened yet; "no-matches" = nations haven't played; "ok" = has points */
  status: "ok" | "no-draw" | "no-matches";
}
