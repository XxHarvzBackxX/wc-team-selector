"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { DrawState } from "@/types";
import {
  subscribeToDrawState,
  joinPresence,
  leavePresence,
  startPresenceHeartbeat,
  subscribeToViewerCount,
} from "@/lib/firebase";
import { COMPANY_TEAMS } from "@/lib/teams";
import DrawBoard from "./DrawBoard";
import AdminPanel from "./AdminPanel";
import FormationBoard from "./FormationBoard";
import ViewerBoard from "./ViewerBoard";
import StandingsPanel from "./StandingsPanel";

function ShareButton({ drawState }: { drawState: DrawState }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const lines = COMPANY_TEAMS.map((team) => {
      const r = drawState.results?.[team];
      return r ? `${team}: ${r.major} + ${r.minor}` : `${team}: -`;
    });
    const text = ["🏆 FIFA WC 2026 Country Draw Results", "", ...lines].join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold transition-colors flex items-center gap-2"
    >
      {copied ? "✅ Copied!" : "📋 Copy Results"}
    </button>
  );
}

export default function DrawApp() {
  const searchParams = useSearchParams();
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [connected, setConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  // Stable session ID for presence tracking
  const sessionIdRef = useRef(`viewer-${Math.random().toString(36).slice(2, 10)}`);

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const isAdmin =
    adminSecret != null &&
    adminSecret.length > 0 &&
    searchParams.get("admin") === adminSecret;

  // Draw state subscription
  useEffect(() => {
    try {
      const unsubscribe = subscribeToDrawState(
        (state) => {
          const newStatus = state?.status ?? "idle";
          if (newStatus === "complete" && prevStatusRef.current !== "complete") {
            confetti({ particleCount: 180, spread: 100, origin: { y: 0.55 } });
            setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.1, y: 0.6 } }), 300);
            setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { x: 0.9, y: 0.6 } }), 500);
          }
          prevStatusRef.current = newStatus;
          setDrawState(state);
          setConnected(true);
          setFirebaseError(null);
        },
        (err) => {
          setFirebaseError(err.message);
          setConnected(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      setFirebaseError(err instanceof Error ? err.message : String(err));
    }
  }, []);

  // Presence tracking
  useEffect(() => {
    const id = sessionIdRef.current;
    joinPresence(id).catch(() => {});
    const stopHeartbeat = startPresenceHeartbeat(id);
    const unsubCount = subscribeToViewerCount(setViewerCount);

    const handleUnload = () => { leavePresence(id).catch(() => {}); };
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      stopHeartbeat();
      unsubCount();
      window.removeEventListener("beforeunload", handleUnload);
      leavePresence(id).catch(() => {});
    };
  }, []);

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"draw" | "standings">(
    tabParam === "draw" ? "draw" : "standings"
  );

  function switchTab(tab: "draw" | "standings") {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState(null, "", url.toString());
  }

  const status = drawState?.status ?? "idle";
  const countdown = drawState?.countdown ?? null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Countdown overlay — visible to ALL clients */}
      {countdown !== null && countdown > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/90 backdrop-blur-sm">
          <p className="text-gray-400 text-sm uppercase tracking-[0.3em] mb-6">Draw starting in…</p>
          <span
            key={countdown}
            className="animate-countdown-pop inline-block font-black text-white"
            style={{ fontSize: "clamp(8rem, 25vw, 18rem)", lineHeight: 1, textShadow: "0 0 80px rgba(255,220,60,0.6), 0 4px 20px rgba(0,0,0,0.8)" }}
          >
            {countdown}
          </span>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              MHR Engineering - FIFA World Cup 2026
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Country Draw</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${
            firebaseError ? "bg-red-500" : connected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
          }`} />
          <span className="text-xs text-gray-500">
            {firebaseError ? "Error" : connected ? "Live" : "Connecting…"}
          </span>
        </div>
      </header>

      {/* Starting XI formation */}
      <FormationBoard />

      {/* Firebase error banner */}
      {firebaseError && (
        <div className="bg-red-900/60 border-b border-red-700 text-red-300 px-4 py-2 text-xs font-mono">
          ⚠️ Firebase error: {firebaseError}
        </div>
      )}

      {/* Status banners */}
      {status === "complete" && (
        <div className="bg-yellow-500 text-gray-900 text-center py-2 px-4 text-sm font-bold tracking-wide flex items-center justify-center gap-3">
          <span>🏆 Draw Complete! Good luck everyone!</span>
          {drawState && <ShareButton drawState={drawState} />}
        </div>
      )}
      {status === "running" && (
        <div className="bg-blue-900/50 border-b border-blue-700 text-blue-300 text-center py-2 px-4 text-sm font-semibold tracking-wide animate-pulse">
          🎰 Draw in progress…
        </div>
      )}

      {/* Main content */}
      <main id="draw" className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        <p className="text-gray-500 text-xs uppercase tracking-[0.25em]">Tonight&apos;s country draw... presented by MHR United&apos;s Academy</p>

        {/* ── Tab switcher ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => switchTab("draw")}
            className="px-7 py-3 rounded-full text-base font-semibold transition-all cursor-pointer"
            style={
              activeTab === "draw"
                ? {
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff",
                  }
                : {
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            🎲 Draw
          </button>
          <button
            onClick={() => switchTab("standings")}
            className="px-7 py-3 rounded-full text-base font-semibold transition-all cursor-pointer"
            style={
              activeTab === "standings"
                ? {
                    background: "rgba(255,215,0,0.12)",
                    border: "1px solid rgba(255,215,0,0.3)",
                    color: "#FFD700",
                  }
                : {
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.4)",
                  }
            }
          >
            🏆 Standings
          </button>
        </div>

        {/* ── Draw tab ── */}
        {activeTab === "draw" && (
          <>
            {isAdmin && <AdminPanel drawState={drawState}/>}
            <DrawBoard drawState={drawState}/>
            {status === "idle" && !isAdmin && (
              <div className="text-center py-8 text-gray-600 text-sm">
                🎰 Waiting for the draw to begin… hang tight!
              </div>
            )}
            {status === "idle" && isAdmin && (
              <div className="text-center py-4 text-gray-600 text-sm">
                Click <strong className="text-gray-400">Start Draw</strong> above when ready.
              </div>
            )}
          </>
        )}

        {/* ── Standings tab ── */}
        {activeTab === "standings" && (
          <StandingsPanel drawState={drawState} />
        )}
      </main>

      <footer className="border-t border-gray-800 px-6 py-3 text-center text-xs text-gray-700">
        MHR Engineering · FIFA World Cup 2026 Sweepstakes &mdash; Good luck! 🏆 :: HW
      </footer>

      {/* Substitution-board style viewer count — fixed bottom-right */}
      {viewerCount !== null && connected && <ViewerBoard count={viewerCount} />}
    </div>
  );
}
