"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { DrawState } from "@/types";
import { subscribeToDrawState } from "@/lib/firebase";
import DrawBoard from "./DrawBoard";
import AdminPanel from "./AdminPanel";

export default function DrawApp() {
  const searchParams = useSearchParams();
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const [connected, setConnected] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);

  const adminSecret = process.env.NEXT_PUBLIC_ADMIN_SECRET;
  const isAdmin =
    adminSecret != null &&
    adminSecret.length > 0 &&
    searchParams.get("admin") === adminSecret;

  useEffect(() => {
    try {
      const unsubscribe = subscribeToDrawState(
        (state) => {
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
              firebaseError ? "bg-red-500" : connected ? "bg-green-500" : "bg-yellow-500 animate-pulse"
            }`}
          />
          <span className="text-xs text-gray-500">
            {firebaseError ? "Error" : connected ? "Live" : "Connecting…"}
          </span>
        </div>
      </header>

      {/* Baller Diggle hero strip */}
      <div className="border-b border-gray-800/60 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-end gap-6">
          {/* Player card */}
          <div className="relative shrink-0 w-28 h-40 sm:w-36 sm:h-52 rounded-2xl overflow-hidden ring-2 ring-red-600/70 shadow-[0_0_40px_rgba(220,38,38,0.5)]">
            <Image
              src="/baller-diggle.png"
              alt="Baller Diggle"
              fill
              className="object-cover object-top"
              priority
            />
            {/* Subtle gradient at base of card */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          {/* Text */}
          <div className="pb-1">
            <p className="text-xs text-gray-500 uppercase tracking-widest">Tonight's draw hosted by</p>
            <p className="text-white font-extrabold text-2xl sm:text-3xl leading-tight mt-1">
              Baller Diggle
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-full bg-red-700/60 text-red-300 text-xs font-semibold tracking-wide">MHR</span>
              <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs font-semibold">#67</span>
            </div>
          </div>
          {/* Decorative pitch lines — desktop only */}
          <div className="hidden sm:flex ml-auto items-center gap-4 opacity-[0.07] select-none pb-1" aria-hidden>
            <div className="w-20 h-20 rounded-full border-2 border-white" />
            <div className="w-px h-20 bg-white" />
          </div>
        </div>
      </div>

      {/* Firebase error banner */}
      {firebaseError && (
        <div className="bg-red-900/60 border-b border-red-700 text-red-300 px-4 py-2 text-xs font-mono">
          ⚠️ Firebase error: {firebaseError}
        </div>
      )}

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

        {/* Always show the board — cards display as "not drawn" until revealed */}
        <DrawBoard drawState={drawState} />

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
      </main>

      <footer className="border-t border-gray-800 px-6 py-3 text-center text-xs text-gray-700">
        FIFA World Cup 2026 Sweepstakes &mdash; Good luck! 🏆
      </footer>
    </div>
  );
}
