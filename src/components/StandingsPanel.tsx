"use client";

import { useEffect, useState } from "react";
import { DrawState, GroupStanding, NationStanding, SweepstakesEntry } from "@/types";
import { buildSweepstakesLeaderboard, fetchStandings } from "@/lib/standings";
import { TEAM_FLAGS } from "@/lib/teams";

// ─── Flag helper ──────────────────────────────────────────────────────────────

function Flag({ name, size = 20 }: { name: string; size?: number }) {
  const code = TEAM_FLAGS[name];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={name}
      width={size}
      height={Math.round(size * 0.67)}
      className="inline-block rounded-sm object-cover"
      style={{ imageRendering: "auto" }}
    />
  );
}

// ─── Medal colours for top 3 ──────────────────────────────────────────────────

const MEDAL: Record<number, { border: string; glow: string; label: string }> = {
  1: { border: "#FFD700", glow: "rgba(255,215,0,0.35)", label: "🥇" },
  2: { border: "#C0C0C0", glow: "rgba(192,192,192,0.25)", label: "🥈" },
  3: { border: "#CD7F32", glow: "rgba(205,127,50,0.25)", label: "🥉" },
};

// ─── Sweepstakes Leaderboard ──────────────────────────────────────────────────

function LeaderboardRow({ entry, rank }: { entry: SweepstakesEntry; rank: number }) {
  const medal = MEDAL[rank];
  const hasMedal = !!medal;

  const pointsDisplay =
    entry.status === "no-draw"
      ? "Draw pending"
      : entry.totalPoints === null
        ? "N/A"
        : String(entry.totalPoints);

  const pointsColor =
    entry.status === "no-draw"
      ? "text-gray-600"
      : entry.totalPoints === null
        ? "text-gray-500"
        : hasMedal
          ? "text-yellow-300"
          : "text-white";

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors hover:bg-white/5"
      style={
        hasMedal
          ? {
              border: `1px solid ${medal.border}`,
              boxShadow: `0 0 12px ${medal.glow}`,
              background: "rgba(255,255,255,0.03)",
            }
          : { border: "1px solid rgba(255,255,255,0.07)" }
      }
    >
      {/* Rank */}
      <span
        className="w-7 text-center text-sm font-bold shrink-0"
        style={{
          fontFamily: "var(--font-orbitron), monospace",
          color: hasMedal ? medal.border : "rgba(255,255,255,0.25)",
        }}
      >
        {hasMedal ? medal.label : rank}
      </span>

      {/* Company team name */}
      <span className="flex-1 text-sm font-semibold text-gray-200 truncate">
        {entry.companyTeam}
      </span>

      {/* Nations + their individual points */}
      <div className="flex items-center gap-2 shrink-0">
        {entry.majorTeam ? (
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Flag name={entry.majorTeam} size={16} />
            <span className="hidden sm:inline truncate max-w-[80px]">
              {entry.majorTeam}
            </span>
            <span className="text-gray-500">
              {entry.majorPoints !== null ? `(${entry.majorPoints}pt)` : "(-)"}
            </span>
          </span>
        ) : null}

        {entry.minorTeam ? (
          <>
            <span className="text-gray-700 text-xs">+</span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Flag name={entry.minorTeam} size={16} />
              <span className="hidden sm:inline truncate max-w-[80px]">
                {entry.minorTeam}
              </span>
              <span className="text-gray-500">
                {entry.minorPoints !== null ? `(${entry.minorPoints}pt)` : "(-)"}
              </span>
            </span>
          </>
        ) : null}

        {!entry.majorTeam && !entry.minorTeam && (
          <span className="text-xs text-gray-600 italic">No draw yet</span>
        )}
      </div>

      {/* Total points */}
      <span
        className={`w-12 text-right text-base font-black shrink-0 ${pointsColor}`}
        style={{ fontFamily: "var(--font-orbitron), monospace" }}
      >
        {pointsDisplay}
      </span>
    </div>
  );
}

function SweepstakesLeaderboard({
  entries,
}: {
  entries: SweepstakesEntry[];
}) {
  return (
    <section>
      <h2
        className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500/80 mb-3"
        style={{ fontFamily: "var(--font-orbitron), monospace" }}
      >
        🏆 Sweepstakes Leaderboard
      </h2>
      <div className="flex flex-col gap-1.5">
        {entries.map((entry, idx) => (
          <LeaderboardRow key={entry.companyTeam} entry={entry} rank={idx + 1} />
        ))}
      </div>
    </section>
  );
}

// ─── WC Group Table ───────────────────────────────────────────────────────────

function GroupTable({
  group,
  ownedNations,
}: {
  group: GroupStanding;
  ownedNations: Set<string>;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Group header */}
      <div
        className="px-4 py-2 text-xs font-bold uppercase tracking-[0.25em]"
        style={{
          fontFamily: "var(--font-orbitron), monospace",
          background: "rgba(255,255,255,0.06)",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        {group.group}
      </div>

      {/* Column headers */}
      <div
        className="grid px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
        style={{
          gridTemplateColumns: "2rem 1fr 2rem 2rem 2rem 2rem 3rem 2.5rem",
          color: "rgba(255,255,255,0.3)",
        }}
      >
        <span>#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center">GD</span>
        <span className="text-right">Pts</span>
      </div>

      {/* Team rows */}
      {group.teams.map((team, idx) => (
        <GroupTeamRow
          key={team.name}
          team={team}
          position={idx + 1}
          isOwned={isOwnedMatch(team.name, ownedNations)}
          isQualifying={idx < 2}
        />
      ))}
    </div>
  );
}

function isOwnedMatch(espnName: string, ownedNations: Set<string>): boolean {
  const lower = espnName.toLowerCase();
  for (const owned of ownedNations) {
    const ownedLower = owned.toLowerCase();
    if (lower === ownedLower || lower.includes(ownedLower) || ownedLower.includes(lower)) {
      return true;
    }
  }
  return false;
}

function GroupTeamRow({
  team,
  position,
  isOwned,
  isQualifying,
}: {
  team: NationStanding;
  position: number;
  isOwned: boolean;
  isQualifying: boolean;
}) {
  return (
    <div
      className="grid items-center px-3 py-1.5 text-sm transition-colors"
      style={{
        gridTemplateColumns: "2rem 1fr 2rem 2rem 2rem 2rem 3rem 2.5rem",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        background: isOwned ? "rgba(255,220,0,0.05)" : "transparent",
      }}
    >
      {/* Position */}
      <span
        className="text-[11px] font-bold"
        style={{
          color: isQualifying ? "rgba(100,220,120,0.7)" : "rgba(255,255,255,0.25)",
        }}
      >
        {position}
      </span>

      {/* Team name + flag */}
      <span className="flex items-center gap-1.5 truncate">
        <Flag name={team.name} size={14} />
        <span
          className="truncate text-xs"
          style={{
            color: isOwned ? "rgba(255,220,80,0.9)" : "rgba(255,255,255,0.75)",
            fontWeight: isOwned ? 600 : 400,
          }}
        >
          {team.name}
        </span>
        {isOwned && (
          <span className="text-[9px] text-yellow-500/60 shrink-0">★</span>
        )}
      </span>

      {/* Stats */}
      {[team.played, team.won, team.drawn, team.lost].map((val, i) => (
        <span key={i} className="text-center text-xs text-gray-400">
          {val}
        </span>
      ))}
      <span
        className="text-center text-xs"
        style={{
          color:
            team.goalDifference > 0
              ? "rgba(100,220,120,0.8)"
              : team.goalDifference < 0
                ? "rgba(255,100,80,0.8)"
                : "rgba(255,255,255,0.35)",
        }}
      >
        {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
      </span>
      <span
        className="text-right text-sm font-bold"
        style={{
          fontFamily: "var(--font-orbitron), monospace",
          color: isOwned ? "rgba(255,220,80,0.9)" : "rgba(255,255,255,0.85)",
        }}
      >
        {team.points}
      </span>
    </div>
  );
}

// ─── Main StandingsPanel ──────────────────────────────────────────────────────

interface StandingsPanelProps {
  drawState: DrawState | null;
}

export default function StandingsPanel({ drawState }: StandingsPanelProps) {
  const [groups, setGroups] = useState<GroupStanding[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStandings();
        if (!cancelled) {
          setGroups(data.groups);
          setFetchedAt(data.fetchedAt);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    // Refresh every 5 minutes
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Build the set of nations that have been drawn by someone
  const ownedNations = new Set<string>();
  if (drawState?.results) {
    for (const result of Object.values(drawState.results)) {
      if (result.major) ownedNations.add(result.major);
      if (result.minor) ownedNations.add(result.minor);
    }
  }

  const leaderboard =
    groups !== null
      ? buildSweepstakesLeaderboard(groups, drawState)
      : buildSweepstakesLeaderboard([], drawState);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Loading / error states ── */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-500 text-sm">
          <span
            className="animate-led-pulse inline-block w-2 h-2 rounded-full bg-blue-500"
          />
          Loading standings…
        </div>
      )}

      {error && !loading && (
        <div
          className="rounded-lg px-4 py-3 text-sm text-red-300 font-mono"
          style={{ background: "rgba(180,30,30,0.15)", border: "1px solid rgba(180,30,30,0.3)" }}
        >
          ⚠️ Could not load standings: {error}
        </div>
      )}

      {/* ── Sweepstakes Leaderboard ── */}
      <SweepstakesLeaderboard entries={leaderboard} />

      {/* ── WC Group Tables ── */}
      {groups !== null && groups.length > 0 && (
        <section>
          <h2
            className="text-xs font-bold uppercase tracking-[0.3em] text-blue-400/70 mb-3"
            style={{ fontFamily: "var(--font-orbitron), monospace" }}
          >
            ⚽ WC 2026 Group Standings
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupTable
                key={group.group}
                group={group}
                ownedNations={ownedNations}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Empty state when groups haven't loaded ── */}
      {!loading && !error && groups !== null && groups.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm">
          ⚽ Group stage standings not available yet — check back once matches begin!
        </div>
      )}

      {/* ── Data freshness footer ── */}
      {fetchedAt && (
        <p className="text-center text-[10px] text-gray-700">
          Standings refreshed every 5 min · Last fetch:{" "}
          {new Date(fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
