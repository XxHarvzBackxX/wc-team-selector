"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BracketResponse,
  DrawState,
  KnockoutRound,
  NationKnockoutResult,
  StandingsResponse,
  SweepstakesEntry,
} from "@/types";
import {
  buildSweepstakesLeaderboard,
  fetchBracket,
  fetchStandings,
} from "@/lib/standings";
import { TEAM_FLAGS } from "@/lib/teams";

const REFRESH_INTERVAL_MS = 60_000;

const ROUND_LABELS: Record<KnockoutRound, string> = {
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarter-finals",
  SF: "Semi-finals",
  Final: "Final",
  Winner: "World champions",
};

const ROUND_ORDER: KnockoutRound[] = ["R32", "R16", "QF", "SF", "Final", "Winner"];

function Flag({ name, size = 24 }: { name: string; size?: number }) {
  const code = TEAM_FLAGS[name];
  if (!code) return <span className="inline-block w-6" />;

  return (
    // Flags are tiny, remote, display-only assets and do not benefit from image optimisation.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt=""
      width={size}
      height={Math.round(size * 0.67)}
      className="inline-block rounded-sm object-cover shadow-sm"
    />
  );
}

function RoundPill({ result }: { result: NationKnockoutResult }) {
  return (
    <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
      {ROUND_LABELS[result.roundReached]}
    </span>
  );
}

function LiveNation({ name, result }: { name: string; result: NationKnockoutResult }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/8 bg-white/[0.03] px-2.5 py-2">
      <Flag name={name} />
      <span className="min-w-0 truncate text-sm font-semibold text-white/85">{name}</span>
      <RoundPill result={result} />
    </div>
  );
}

function remainingNations(entry: SweepstakesEntry) {
  const nations: { name: string; result: NationKnockoutResult }[] = [];

  if (entry.majorTeam && entry.majorKnockout?.alive) {
    nations.push({ name: entry.majorTeam, result: entry.majorKnockout });
  }
  if (entry.minorTeam && entry.minorKnockout?.alive) {
    nations.push({ name: entry.minorTeam, result: entry.minorKnockout });
  }

  return nations;
}

function StandingsRow({ entry, rank }: { entry: SweepstakesEntry; rank: number }) {
  const nations = remainingNations(entry);

  return (
    <div
      className={`grid gap-3 px-4 py-4 sm:grid-cols-[3rem_minmax(9rem,1fr)_minmax(17rem,2fr)_5rem] sm:items-center ${
        rank === 1 ? "bg-yellow-400/[0.06]" : "bg-white/[0.015]"
      }`}
    >
      <div className="flex items-center gap-3 sm:contents">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            rank === 1
              ? "bg-yellow-400 text-gray-950 shadow-[0_0_20px_rgba(250,204,21,0.25)]"
              : "bg-white/5 text-white/35"
          }`}
          style={{ fontFamily: "var(--font-orbitron), monospace" }}
        >
          {rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-base font-bold text-white sm:block">
          {entry.companyTeam}
        </span>
        <span
          className="text-right text-xl font-black text-yellow-300 sm:col-start-4 sm:row-start-1"
          style={{ fontFamily: "var(--font-orbitron), monospace" }}
        >
          {entry.totalPoints ?? "–"}
          <span className="ml-1 text-[9px] uppercase tracking-wider text-white/25">pts</span>
        </span>
      </div>

      <div className="grid gap-2 sm:col-start-3 sm:row-start-1 sm:grid-cols-2">
        {nations.map(({ name, result }) => (
          <LiveNation key={name} name={name} result={result} />
        ))}
      </div>
    </div>
  );
}

function currentRound(results: NationKnockoutResult[]): KnockoutRound | null {
  return results
    .filter((result) => result.alive)
    .reduce<KnockoutRound | null>((latest, result) => {
      if (!latest || ROUND_ORDER.indexOf(result.roundReached) > ROUND_ORDER.indexOf(latest)) {
        return result.roundReached;
      }
      return latest;
    }, null);
}

interface StandingsPanelProps {
  drawState: DrawState | null;
}

export default function StandingsPanel({ drawState }: StandingsPanelProps) {
  const [standings, setStandings] = useState<StandingsResponse | null>(null);
  const [bracket, setBracket] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    else setLoading(true);

    try {
      const [standingsData, bracketData] = await Promise.all([
        fetchStandings(),
        fetchBracket(),
      ]);
      setStandings(standingsData);
      setBracket(bracketData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not refresh the knockout standings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    const interval = window.setInterval(() => void load(true), REFRESH_INTERVAL_MS);

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [load]);

  const allEntries = useMemo(
    () => buildSweepstakesLeaderboard(standings?.groups ?? [], drawState, bracket?.results ?? []),
    [bracket?.results, drawState, standings?.groups],
  );
  const activeEntries = allEntries.filter((entry) => !entry.bothEliminated);
  const eliminatedCount = allEntries.filter((entry) => entry.bothEliminated).length;
  const activeNationCount = new Set(
    (bracket?.results ?? []).filter((result) => result.alive).map((result) => result.name),
  ).size;
  const round = currentRound(bracket?.results ?? []);
  const fetchedAt = bracket?.fetchedAt ?? standings?.fetchedAt;

  if (loading && !standings) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-sm text-white/40">
        <span className="animate-led-pulse inline-block h-2 w-2 rounded-full bg-emerald-400" />
        Loading the knockout picture…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-400/[0.08] via-white/[0.025] to-yellow-400/[0.05]">
        <div className="flex flex-col gap-5 border-b border-white/8 px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-emerald-300">
              <span className="animate-led-pulse inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Live knockout standings
            </div>
            <h2
              className="text-2xl font-black tracking-tight text-white sm:text-3xl"
              style={{ fontFamily: "var(--font-orbitron), monospace" }}
            >
              Last teams standing
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2">
              <div className="text-lg font-black text-white">{activeEntries.length}</div>
              <div className="text-[8px] uppercase tracking-widest text-white/30">Pools left</div>
            </div>
            <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2">
              <div className="text-lg font-black text-white">{activeNationCount}</div>
              <div className="text-[8px] uppercase tracking-widest text-white/30">Nations left</div>
            </div>
            <div className="rounded-lg border border-white/8 bg-black/15 px-3 py-2">
              <div className="text-sm font-black text-yellow-300 sm:text-base">
                {round ? ROUND_LABELS[round] : "Pending"}
              </div>
              <div className="text-[8px] uppercase tracking-widest text-white/30">Current round</div>
            </div>
          </div>
        </div>

        <div className="hidden grid-cols-[3rem_minmax(9rem,1fr)_minmax(17rem,2fr)_5rem] gap-3 border-b border-white/8 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white/25 sm:grid">
          <span>Rank</span>
          <span>Team</span>
          <span>Countries still in</span>
          <span className="text-right">Score</span>
        </div>

        {activeEntries.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {activeEntries.map((entry, index) => (
              <StandingsRow key={entry.companyTeam} entry={entry} rank={index + 1} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-sm text-white/40">
            No active sweepstake teams found yet.
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {eliminatedCount} eliminated {eliminatedCount === 1 ? "team has" : "teams have"} been removed
          from the table.
        </span>
        <span className="flex items-center gap-2">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${refreshing ? "animate-pulse bg-yellow-300" : "bg-emerald-400"}`} />
          ESPN data · refreshes every minute
          {fetchedAt ? ` · ${new Date(fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-3 text-xs text-red-200">
          Latest refresh failed; showing the last available standings. {error}
        </div>
      )}
    </div>
  );
}
