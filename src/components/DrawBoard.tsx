"use client";

import { DrawState } from "@/types";
import { COMPANY_TEAMS } from "@/lib/teams";
import TeamSlot from "./TeamSlot";

interface DrawBoardProps {
  drawState: DrawState | null;
}

export default function DrawBoard({ drawState }: DrawBoardProps) {
  const revealedTeams = new Set<string>();
  const spinningTeam: string | null = drawState?.revealOrder?.[drawState.currentRevealIndex] ?? null;

  if (drawState?.revealOrder) {
    for (let i = 0; i < drawState.currentRevealIndex; i++) {
      revealedTeams.add(drawState.revealOrder[i]);
    }
  }

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
