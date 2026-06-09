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

function SlotReel({
  finalValue,
  pool,
  isSpinning,
  isRevealed,
  accentClass,
}: {
  finalValue: string;
  pool: string[];
  isSpinning: boolean;
  isRevealed: boolean;
  accentClass: string;
}) {
  const [displayValue, setDisplayValue] = useState("???");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpinning && !isRevealed) {
      let i = 0;
      intervalRef.current = setInterval(() => {
        setDisplayValue(pool[i % pool.length]);
        i++;
      }, 80);
    } else if (isRevealed) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayValue(finalValue);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayValue("???");
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, isRevealed, finalValue, pool]);

  return (
    <div
      className={`flex items-center justify-center rounded-lg px-3 py-2 text-sm font-bold transition-all duration-500 ${
        isRevealed
          ? `${accentClass} scale-105 shadow-lg`
          : isSpinning
          ? "bg-gray-700 text-yellow-300 animate-pulse"
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
