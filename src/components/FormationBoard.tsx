"use client";

import { PLAYER_CARDS, PlayerCard } from "@/lib/playerCard";
import BallerCard from "./BallerCard";

// 4-2-3-1 formation rows (top = attack, bottom = GK)
const FORMATION_ROWS: {
  zone: string;
  positions: string[];
  zoneColor: string;
  centerLine?: boolean; // render the halfway line BEFORE this row
}[] = [
  { zone: "ATTACK",        positions: ["ST"],                  zoneColor: "text-red-400/70" },
  { zone: "ATTACKING MID", positions: ["LW", "CAM", "RW"],     zoneColor: "text-orange-300/60" },
  { zone: "MIDFIELD",      positions: ["LDM", "RDM"],          zoneColor: "text-yellow-300/60", centerLine: true },
  { zone: "DEFENCE",       positions: ["LB", "CB", "CB", "RB"],zoneColor: "text-blue-300/60" },
  { zone: "GOALKEEPER",    positions: ["GK"],                  zoneColor: "text-emerald-400/70" },
];

function resolveFormation(cards: PlayerCard[]): (PlayerCard | null)[][] {
  const byPos: Record<string, PlayerCard[]> = {};
  for (const c of cards) {
    (byPos[c.position] ??= []).push(c);
  }
  const usedIdx: Record<string, number> = {};
  return FORMATION_ROWS.map(({ positions }) =>
    positions.map((pos) => {
      const idx = usedIdx[pos] ?? 0;
      usedIdx[pos] = idx + 1;
      return byPos[pos]?.[idx] ?? null;
    })
  );
}

export default function FormationBoard() {
  const manager = PLAYER_CARDS.find((c) => c.isManager) ?? null;
  const squad = PLAYER_CARDS.filter((c) => !c.isManager);
  const rows = resolveFormation(squad);

  return (
    <section
      className="relative border-b border-gray-800/60 overflow-hidden"
      style={{
        // Dark pitch with faint grass stripes
        background: `
          repeating-linear-gradient(
            180deg,
            rgba(255,255,255,0.012) 0px,
            rgba(255,255,255,0.012) 80px,
            transparent 80px,
            transparent 160px
          ),
          linear-gradient(180deg, #060f06 0%, #0a1e0a 35%, #0d260d 65%, #060f06 100%)
        `,
      }}
    >
      {/* Faint centre-circle underlay */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: "47%",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.055)",
        }}
      />
      {/* Centre spot */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-full"
        style={{
          top: "calc(47% + 108px)",
          width: "6px",
          height: "6px",
          background: "rgba(255,255,255,0.12)",
          transform: "translateX(-50%)",
        }}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="relative z-10 pt-6 pb-0 flex flex-col items-center gap-2">
        <p className="text-gray-500 text-xs uppercase tracking-[0.25em]">Tonight&apos;s starting XI</p>
        <div className="flex items-center gap-3">
          <span className="text-white/30 text-sm">4</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/30 text-sm">2</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/30 text-sm">3</span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/30 text-sm">1</span>
        </div>

        {/* Skip button */}
        <a
          href="#draw"
          className="
            mt-1 px-5 py-2 rounded-full
            bg-gray-800/80 hover:bg-gray-700/90
            border border-gray-600/50 hover:border-gray-500
            text-gray-300 hover:text-white
            text-xs font-semibold tracking-wide
            transition-all duration-200
            flex items-center gap-2
          "
        >
          <span>Skip to the Draw</span>
          <span className="text-base leading-none">↓</span>
        </a>
      </div>

      {/* ── Formation rows ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center gap-1 py-5 px-4 overflow-x-auto">
        {FORMATION_ROWS.map(({ zone, zoneColor, centerLine }, rowIdx) => {
          const players = rows[rowIdx];
          return (
            <div key={zone} className="flex flex-col items-center gap-2 w-full min-w-max">
              {/* Centre line between AM and DM rows */}
              {centerLine && (
                <div className="w-full max-w-3xl flex items-center gap-3 my-1 px-4">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.09)" }} />
                  <span className="text-[9px] text-white/20 uppercase tracking-[0.3em] shrink-0">
                    Centre Line
                  </span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.09)" }} />
                </div>
              )}

              {/* Zone label */}
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-[0.25em] ${zoneColor}`}>
                  {zone}
                </span>
              </div>

              {/* Player cards */}
              <div className="flex justify-center gap-3 sm:gap-4">
                {players.map((player, i) =>
                  player ? (
                    <BallerCard key={player.name} card={player} size="sm" />
                  ) : (
                    // Placeholder for missing position
                    <div
                      key={i}
                      className="w-[148px] sm:w-[165px] lg:w-[182px] rounded-[18px] border border-gray-700/40 bg-gray-900/20 flex items-center justify-center text-gray-700 text-xs"
                      style={{ aspectRatio: "13/18" }}
                    >
                      ?
                    </div>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Manager dugout ──────────────────────────────────────── */}
      {manager && (
        <div
          className="relative z-10 flex flex-col items-center gap-3 pb-7 pt-2 px-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Dugout label */}
          <div className="flex items-center gap-3">
            <div className="h-px w-16" style={{ background: "rgba(80,210,100,0.25)" }} />
            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-emerald-400/60">
              The Gaffer
            </span>
            <div className="h-px w-16" style={{ background: "rgba(80,210,100,0.25)" }} />
          </div>
          <BallerCard card={manager} size="sm" />
        </div>
      )}

      {/* Bottom fade */}
      <div
        className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(6,15,6,0.6))" }}
      />
    </section>
  );
}
