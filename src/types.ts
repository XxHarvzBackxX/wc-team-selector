export type DrawStatus = "idle" | "running" | "complete";

export interface TeamResult {
  major: string;
  minor: string;
}

export interface DrawState {
  status: DrawStatus;
  currentRevealIndex: number;
  revealOrder: string[];
  results: Record<string, TeamResult>;
  countdown?: number | null;
}
