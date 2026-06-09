import { DrawState, TeamResult } from "@/types";
import { COMPANY_TEAMS, MAJOR_TEAMS, MINOR_TEAMS } from "./teams";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateDraw(): Pick<DrawState, "results" | "revealOrder"> {
  const shuffledMajors = shuffle(MAJOR_TEAMS);
  const shuffledMinors = shuffle(MINOR_TEAMS);
  const revealOrder = shuffle(COMPANY_TEAMS);

  const results: Record<string, TeamResult> = {};
  COMPANY_TEAMS.forEach((team, i) => {
    results[team] = {
      major: shuffledMajors[i],
      minor: shuffledMinors[i],
    };
  });

  return { results, revealOrder };
}
