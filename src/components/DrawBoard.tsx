"use client";

import { useEffect, useRef } from "react";
import { DrawState } from "@/types";
import { COMPANY_TEAMS } from "@/lib/teams";
import TeamSlot from "./TeamSlot";

interface DrawBoardProps {
  drawState: DrawState | null;
}

export default function DrawBoard({ drawState }: DrawBoardProps) {
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const revealedTeams = new Set<string>();
  const isComplete = drawState?.status === "complete";

  if (isComplete && drawState?.revealOrder) {
    drawState.revealOrder.forEach((t) => revealedTeams.add(t));
  } else if (drawState?.revealOrder) {
    const count = drawState.revealedCount ?? -1;
    for (let i = 0; i <= count; i++) {
      if (drawState.revealOrder[i]) revealedTeams.add(drawState.revealOrder[i]);
    }
  }

  const spinningTeam: string | null = isComplete
    ? null
    : (drawState?.revealOrder?.[drawState.currentRevealIndex] ?? null);

  const isAnySpinning = spinningTeam !== null;

  // Auto-scroll the spinning card into view — but only if the draw section
  // is at least partially visible (don't interrupt someone viewing the formation).
  useEffect(() => {
    if (!spinningTeam) return;
    const el = slotRefs.current[spinningTeam];
    if (!el) return;

    const drawSection = document.getElementById("draw");
    if (drawSection) {
      const { top, bottom } = drawSection.getBoundingClientRect();
      const drawIsVisible = top < window.innerHeight && bottom > 0;
      if (!drawIsVisible) return;
    }

    // block:'nearest' = scroll minimum to make visible; no-op if already in view
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [spinningTeam]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {COMPANY_TEAMS.map((team) => {
        const isRevealed = revealedTeams.has(team);
        const isSpinning = spinningTeam === team;
        const isDimmed = isAnySpinning && !isSpinning && !isRevealed;
        return (
          <div key={team} ref={(el) => { slotRefs.current[team] = el; }}>
            <TeamSlot
              companyTeam={team}
              result={drawState?.results?.[team]}
              isSpinning={isSpinning}
              isRevealed={isRevealed}
              isDimmed={isDimmed}
            />
          </div>
        );
      })}
    </div>
  );
}
