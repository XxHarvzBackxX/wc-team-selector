"use client";

import { useCallback, useRef, useState } from "react";
import { DrawState } from "@/types";
import { generateDraw } from "@/lib/draw";
import { advanceReveal, completeDraw, resetDraw, startDraw } from "@/lib/firebase";
import { COMPANY_TEAMS } from "@/lib/teams";

interface AdminPanelProps {
  drawState: DrawState | null;
}

// ms between each team reveal
const REVEAL_INTERVAL_MS = 4000;
// ms the slot spins before snapping to result
const SPIN_DURATION_MS = 3200;

export default function AdminPanel({ drawState }: AdminPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleStartDraw = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);

    const { results, revealOrder } = generateDraw();
    await startDraw(results, revealOrder);

    // Drive reveal sequence — increment currentRevealIndex in Firebase each interval.
    // Index -1 means "all slots spinning, none revealed yet".
    // Index 0..n-1 means that team is currently spinning then snaps to result.
    // After last team we mark complete.
    let idx = 0;
    const total = COMPANY_TEAMS.length;

    const tick = async () => {
      await advanceReveal(idx);
      idx++;
      if (idx < total) {
        timerRef.current = setTimeout(tick, REVEAL_INTERVAL_MS);
      } else {
        // Wait for the last slot's spin duration, then complete
        timerRef.current = setTimeout(async () => {
          await completeDraw();
          setIsRunning(false);
        }, SPIN_DURATION_MS + 500);
      }
    };

    // Small delay before first reveal so viewers see all slots spinning first
    timerRef.current = setTimeout(tick, 1500);
  }, [isRunning]);

  const handleReset = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsRunning(false);
    await resetDraw();
  }, []);

  const status = drawState?.status ?? "idle";

  return (
    <div className="w-full rounded-2xl border border-red-700 bg-red-950/40 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-lg">🔐</span>
        <span className="text-red-300 font-semibold text-sm uppercase tracking-widest">
          Admin Panel
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleStartDraw}
          disabled={isRunning || status === "running" || status === "complete"}
          className="px-5 py-2 rounded-lg bg-green-600 text-white font-bold text-sm hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          🎰 Start Draw
        </button>

        <button
          onClick={handleReset}
          disabled={isRunning && status !== "running"}
          className="px-5 py-2 rounded-lg bg-red-700 text-white font-bold text-sm hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          🔄 Reset Draw
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Status:{" "}
        <span className="text-gray-300 font-mono">
          {isRunning ? "revealing…" : status}
        </span>
      </p>
    </div>
  );
}
