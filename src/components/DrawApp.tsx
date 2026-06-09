"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DrawState } from "@/types";
import { subscribeToDrawState } from "@/lib/firebase";
import DrawBoard from "./DrawBoard";
import AdminPanel from "./AdminPanel";

export default function DrawApp() {
  const searchParams = useSearchParams();
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [connected, setConnected] = useState(false);

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const isAdmin =
    adminSecret != null &&
    adminSecret.length > 0 &&
    searchParams.get("admin") === adminSecret;

  useEffect(() => {
    const unsubscribe = subscribeToDrawState((state) => {
      setDrawState(state);
      setConnected(true);
    });
    return unsubscribe;
  }, []);

  const status = drawState?.status ?? "idle";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚽</span>
          <div>
            <h1 className="text-xl font-bold tracking-tight leading-none">
              FIFA World Cup 2026
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Sweepstakes Draw</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              connected ? "bg-green-500" : "bg-gray-600"
            }`}
          />
          <span className="text-xs text-gray-500">
            {connected ? "Live" : "Connecting…"}
          </span>
        </div>
      </header>

      {/* Status banner */}
      {status === "complete" && (
        <div className="bg-yellow-500 text-gray-900 text-center py-2 px-4 text-sm font-bold tracking-wide">
          🏆 Draw Complete! Good luck everyone!
        </div>
      )}
      {status === "running" && (
        <div className="bg-blue-900/50 border-b border-blue-700 text-blue-300 text-center py-2 px-4 text-sm font-semibold tracking-wide animate-pulse">
          🎰 Draw in progress…
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {isAdmin && <AdminPanel drawState={drawState} />}

        {status === "idle" && !isAdmin && (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-4">🎰</div>
            <p className="text-lg font-medium text-gray-400">
              Waiting for the draw to begin…
            </p>
            <p className="text-sm mt-2">Hang tight, the admin will start soon!</p>
          </div>
        )}

        {status !== "idle" && <DrawBoard drawState={drawState} />}

        {status === "idle" && isAdmin && (
          <div className="text-center py-8 text-gray-600 text-sm">
            Click <strong className="text-gray-400">Start Draw</strong> above when ready.
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 px-6 py-3 text-center text-xs text-gray-700">
        FIFA World Cup 2026 Sweepstakes &mdash; Good luck! 🏆
      </footer>
    </div>
  );
}
