"use client";

import { useEffect, useRef, useState } from "react";
import { TeamResult } from "@/types";
import { MAJOR_TEAMS, MINOR_TEAMS } from "@/lib/teams";

interface TeamSlotProps {
  companyTeam: string;
  result: TeamResult | undefined;
  isSpinning: boolean;
  isRevealed: boolean;
}

// Slot speed constants
const FAST_MS = 35;       // starting interval (very fast)
const SLOW_MS = 280;      // ending interval (crawling before snap)
const RAMP_FRAC = 0.45;   // fraction of SPIN_WINDOW_MS before slow-down begins
const SPIN_WINDOW_MS = 3500; // expected spin duration — ramp completes here

function SlotReel({
  finalValue,
  pool,
  isSpinning,
  isRevealed,
  accentClass,
}: {
  finalValue: string;
  pool: readonly string[];
  isSpinning: boolean;
  isRevealed: boolean;
  accentClass: string;
}) {
  const [displayValue, setDisplayValue] = useState("???");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveRef = useRef({ isSpinning, isRevealed, finalValue });
  const startTimeRef = useRef(0);
  const idxRef = useRef(0);

  // Keep liveRef in sync so setTimeout callbacks see latest props
  useEffect(() => {
    liveRef.current = { isSpinning, isRevealed, finalValue };
  });

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isRevealed) {
      setDisplayValue(finalValue);
      return;
    }

    if (!isSpinning) {
      setDisplayValue("???");
      return;
    }

    // Kick off the spin
    startTimeRef.current = Date.now();
    idxRef.current = Math.floor(Math.random() * pool.length);

    const tick = () => {
      const { isSpinning: spin, isRevealed: rev, finalValue: fv } = liveRef.current;

      if (rev) { setDisplayValue(fv); return; }
      if (!spin) { setDisplayValue("???"); return; }

      setDisplayValue(pool[idxRef.current % pool.length]);
      idxRef.current++;

      const progress = Math.min((Date.now() - startTimeRef.current) / SPIN_WINDOW_MS, 1);
      let ms: number;
      if (progress < RAMP_FRAC) {
        ms = FAST_MS;
      } else {
        // Cubic ease-out: starts linear, decelerates dramatically
        const t = (progress - RAMP_FRAC) / (1 - RAMP_FRAC);
        const eased = 1 - Math.pow(1 - t, 3);
        ms = FAST_MS + (SLOW_MS - FAST_MS) * eased;
      }

      timerRef.current = setTimeout(tick, ms);
    };

    tick();

    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [isSpinning, isRevealed, finalValue, pool]);

  return (
    <div
      className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-bold transition-all duration-500 ${
        isRevealed
          ? `${accentClass} scale-105 shadow-lg`
          : isSpinning
          ? "bg-gray-700 text-yellow-300"
          : "bg-gray-800 text-gray-500"
      }`}
      style={{ minWidth: "120px", minHeight: "40px" }}
    >
      {isSpinning && !isRevealed ? (
        <span className="font-mono tracking-wider">{displayValue}</span>
      ) : isRevealed ? (
        <span>{displayValue}</span>
      ) : (
        <span className="tracking-widest opacity-40">???</span>
      )}
    </div>
  );
}

export default function TeamSlot({
  companyTeam,
  result,
  isSpinning,
  isRevealed,
}: TeamSlotProps) {
  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ${
        isRevealed
          ? "border-yellow-500 bg-gray-900 shadow-yellow-500/20 shadow-lg"
          : isSpinning
          ? "border-yellow-700 bg-gray-900/80"
          : "border-gray-700 bg-gray-900/40"
      }`}
    >
      <div className="text-center font-semibold text-white text-base tracking-wide">
        {companyTeam}
      </div>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 w-full justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest w-12 shrink-0">
            Major
          </span>
          <SlotReel
            finalValue={result?.major ?? ""}
            pool={MAJOR_TEAMS}
            isSpinning={isSpinning}
            isRevealed={isRevealed}
            accentClass="bg-yellow-500 text-gray-900"
          />
        </div>
        <div className="flex items-center gap-2 w-full justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest w-12 shrink-0">
            Minor
          </span>
          <SlotReel
            finalValue={result?.minor ?? ""}
            pool={MINOR_TEAMS}
            isSpinning={isSpinning}
            isRevealed={isRevealed}
            accentClass="bg-blue-500 text-white"
          />
        </div>
      </div>
    </div>
  );
}
