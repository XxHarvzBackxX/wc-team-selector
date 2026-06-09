"use client";

import { DrawState } from "@/types";
import { COMPANY_TEAMS } from "@/lib/teams";
import TeamSlot from "./TeamSlot";

interface DrawBoardProps {
  drawState: DrawState | null;
}

export default function DrawBoard({ drawState }: DrawBoardProps) {
  const revealedTeams = new Set<string>();
  const isComplete = drawState?.status === "complete";

  // When complete, all teams are revealed (fixes last team spinning forever)
  if (isComplete && drawState?.revealOrder) {
    drawState.revealOrder.forEach((t) => revealedTeams.add(t));
  } else if (drawState?.revealOrder) {
    for (let i = 0; i < drawState.currentRevealIndex; i++) {
      revealedTeams.add(drawState.revealOrder[i]);
    }
  }

  // No spinning team when draw is complete
  const spinningTeam: string | null = isComplete
    ? null
    : (drawState?.revealOrder?.[drawState.currentRevealIndex] ?? null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {COMPANY_TEAMS.map((team) => {
        const isRevealed = revealedTeams.has(team);
        const isSpinning = spinningTeam === team;
        return (
          <TeamSlot
            key={team}
            companyTeam={team}
            result={drawState?.results?.[team]}
            isSpinning={isSpinning}
            isRevealed={isRevealed}
          />
        );
      })}
    </div>
  );
}
