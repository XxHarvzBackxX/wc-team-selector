"use client";

import { useCallback, useRef, useState } from "react";
import { DrawState } from "@/types";
import { generateDraw } from "@/lib/draw";
import { advanceReveal, completeDraw, resetDraw, startDraw, setCountdown } from "@/lib/firebase";
import { COMPANY_TEAMS } from "@/lib/teams";

interface AdminPanelProps {
  drawState: DrawState | null;
}

const SPIN_DURATION_MS = 5000;       // how long each card spins
const POST_REVEAL_PAUSE_MS = 7000;   // pause AFTER the card lands before the next spin
const COUNTDOWN_FROM = 10;

export default function AdminPanel({ drawState }: AdminPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTimers = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  const handleStartDraw = useCallback(async () => {
    if (isRunning) return;
    setError(null);
    setIsRunning(true);

    // Write countdown to Firestore so all clients see it
    let n = COUNTDOWN_FROM;
    try { await setCountdown(n); } catch { /* non-fatal */ }

    await new Promise<void>((resolve) => {
      const tick = async () => {
        n--;
        if (n > 0) {
          try { await setCountdown(n); } catch { /* non-fatal */ }
          timerRef.current = setTimeout(tick, 900);
        } else {
          try { await setCountdown(null); } catch { /* non-fatal */ }
          resolve();
        }
      };
      timerRef.current = setTimeout(tick, 900);
    });

    try {
      const { results, revealOrder } = generateDraw();
      await startDraw(results, revealOrder);

      let idx = 0;
      const total = COMPANY_TEAMS.length;

      const tick = async () => {
        try {
          await advanceReveal(idx);
          idx++;
          if (idx < total) {
            timerRef.current = setTimeout(tick, SPIN_DURATION_MS + POST_REVEAL_PAUSE_MS);
          } else {
            timerRef.current = setTimeout(async () => {
              try { await completeDraw(); }
              catch (e) { setError(`Failed to complete: ${e instanceof Error ? e.message : e}`); }
              finally { setIsRunning(false); }
            }, SPIN_DURATION_MS + 500);
          }
        } catch (e) {
          setError(`Firebase write failed: ${e instanceof Error ? e.message : e}`);
          setIsRunning(false);
        }
      };

      timerRef.current = setTimeout(tick, 1500);
    } catch (e) {
      setError(`Failed to start draw: ${e instanceof Error ? e.message : e}`);
      setIsRunning(false);
    }
  }, [isRunning]);

  const handleReset = useCallback(async () => {
    stopTimers();
    setIsRunning(false);
    setError(null);
    try { await resetDraw(); }
    catch (e) { setError(`Reset failed: ${e instanceof Error ? e.message : e}`); }
  }, []);

  const status = drawState?.status ?? "idle";

  return (
    <div className="w-full rounded-2xl border border-red-700 bg-red-950/40 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="text-red-400 text-lg">🔐</span>
        <span className="text-red-300 font-semibold text-sm uppercase tracking-widest">Admin Panel</span>
      </div>

      {error && (
        <div className="rounded-lg bg-red-900/60 border border-red-600 px-3 py-2 text-xs text-red-300 font-mono break-all">
          ⚠️ {error}
        </div>
      )}

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
          className="px-5 py-2 rounded-lg bg-red-700 text-white font-bold text-sm hover:bg-red-600 transition-colors"
        >
          🔄 Reset / Unstick
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Firebase: <span className="text-gray-300 font-mono">{status}</span>
        {"  |  "}Local: <span className="text-gray-300 font-mono">{isRunning ? "running…" : "idle"}</span>
      </p>
    </div>
  );
}
