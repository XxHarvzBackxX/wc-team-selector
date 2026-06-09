"use client";

import { useEffect, useRef, useState } from "react";
import { TeamResult } from "@/types";
import { MAJOR_TEAMS, MINOR_TEAMS, TEAM_FLAGS, TEAM_WIKI, TEAM_DISPLAY } from "@/lib/teams";

interface TeamSlotProps {
  companyTeam: string;
  result: TeamResult | undefined;
  isSpinning: boolean;
  isRevealed: boolean;
  isDimmed: boolean;
}

const FAST_MS = 35;
const SLOW_MS = 280;
const RAMP_FRAC = 0.45;
const SPIN_WINDOW_MS = 4000;

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

  useEffect(() => { liveRef.current = { isSpinning, isRevealed, finalValue }; });

  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    if (isRevealed) { setDisplayValue(finalValue); return; }
    if (!isSpinning) { setDisplayValue("???"); return; }

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
        const t = (progress - RAMP_FRAC) / (1 - RAMP_FRAC);
        ms = FAST_MS + (SLOW_MS - FAST_MS) * (1 - Math.pow(1 - t, 3));
      }
      timerRef.current = setTimeout(tick, ms);
    };

    tick();
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; } };
  }, [isSpinning, isRevealed, finalValue, pool]);

  const flagCode = isRevealed && TEAM_FLAGS[finalValue] ? TEAM_FLAGS[finalValue] : null;
  const wikiUrl  = isRevealed && TEAM_WIKI[finalValue]  ? TEAM_WIKI[finalValue]  : null;
  const label    = TEAM_DISPLAY[finalValue] ?? finalValue;

  return (
    <div
      className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-all duration-500 ${
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
        <>
          {flagCode && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`https://flagcdn.com/w20/${flagCode}.png`}
              width={20}
              height={15}
              alt={finalValue}
              className="rounded-sm shrink-0 shadow-sm"
              style={{ objectFit: "cover" }}
            />
          )}
          {wikiUrl ? (
            <a
              href={wikiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-dotted hover:opacity-80 transition-opacity"
              title={`Wikipedia: ${finalValue} national team`}
            >
              {label}
            </a>
          ) : (
            <span>{label}</span>
          )}
        </>
      ) : (
        <span className="tracking-widest opacity-40">???</span>
      )}
    </div>
  );
}

export default function TeamSlot({ companyTeam, result, isSpinning, isRevealed, isDimmed }: TeamSlotProps) {
  const [playReveal, setPlayReveal] = useState(false);
  const prevRevealedRef = useRef(false);

  useEffect(() => {
    if (isRevealed && !prevRevealedRef.current) {
      setPlayReveal(true);
      const t = setTimeout(() => setPlayReveal(false), 450);
      prevRevealedRef.current = true;
      return () => clearTimeout(t);
    }
    if (!isRevealed) prevRevealedRef.current = false;
  }, [isRevealed]);

  return (
    <div
      className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all duration-300 ${
        playReveal ? "animate-flip-reveal" : ""
      } ${
        isRevealed
          ? "border-yellow-500 bg-gray-900 shadow-yellow-500/20 shadow-lg"
          : isSpinning
          ? "border-yellow-700 bg-gray-900/80"
          : "border-gray-700 bg-gray-900/40"
      } ${isDimmed ? "opacity-35" : "opacity-100"}`}
    >
      <div className="text-center font-semibold text-white text-base tracking-wide">{companyTeam}</div>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex items-center gap-2 w-full justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest w-12 shrink-0">Major</span>
          <SlotReel finalValue={result?.major ?? ""} pool={MAJOR_TEAMS} isSpinning={isSpinning} isRevealed={isRevealed} accentClass="bg-yellow-500 text-gray-900" />
        </div>
        <div className="flex items-center gap-2 w-full justify-between">
          <span className="text-xs text-gray-400 uppercase tracking-widest w-12 shrink-0">Minor</span>
          <SlotReel finalValue={result?.minor ?? ""} pool={MINOR_TEAMS} isSpinning={isSpinning} isRevealed={isRevealed} accentClass="bg-blue-500 text-white" />
        </div>
      </div>
    </div>
  );
}
