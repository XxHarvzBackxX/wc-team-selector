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

  if (isComplete && drawState?.revealOrder) {
    drawState.revealOrder.forEach((t) => revealedTeams.add(t));
  } else if (drawState?.revealOrder) {
    for (let i = 0; i < drawState.currentRevealIndex; i++) {
      revealedTeams.add(drawState.revealOrder[i]);
    }
  }

  const spinningTeam: string | null = isComplete
    ? null
    : (drawState?.revealOrder?.[drawState.currentRevealIndex] ?? null);

  const isAnySpinning = spinningTeam !== null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {COMPANY_TEAMS.map((team) => {
        const isRevealed = revealedTeams.has(team);
        const isSpinning = spinningTeam === team;
        const isDimmed = isAnySpinning && !isSpinning && !isRevealed;
        return (
          <TeamSlot
            key={team}
            companyTeam={team}
            result={drawState?.results?.[team]}
            isSpinning={isSpinning}
            isRevealed={isRevealed}
            isDimmed={isDimmed}
          />
        );
      })}
    </div>
  );
}
