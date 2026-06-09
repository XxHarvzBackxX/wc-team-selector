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
