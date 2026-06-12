"use client";

import { useEffect, useState } from "react";
import {
  BracketResponse,
  DrawState,
  GroupStanding,
  KnockoutRound,
  NationKnockoutResult,
  NationStanding,
  SweepstakesEntry,
} from "@/types";
import { buildSweepstakesLeaderboard, fetchBracket, fetchStandings } from "@/lib/standings";
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

// ─── Knockout round pill ──────────────────────────────────────────────────────

const ROUND_LABELS: Record<KnockoutRound, string> = {
  R32: "R32",
  R16: "R16",
  QF: "QF",
  SF: "SF",
  Final: "Final",
  Winner: "🏆 Winner",
};

const ROUND_ALIVE_COLORS: Record<KnockoutRound, { bg: string; text: string; border: string }> = {
  R32:    { bg: "rgba(59,130,246,0.15)",  text: "#93c5fd", border: "rgba(59,130,246,0.4)" },
  R16:    { bg: "rgba(99,102,241,0.15)",  text: "#a5b4fc", border: "rgba(99,102,241,0.4)" },
  QF:     { bg: "rgba(168,85,247,0.15)",  text: "#d8b4fe", border: "rgba(168,85,247,0.4)" },
  SF:     { bg: "rgba(234,179,8,0.15)",   text: "#fde047", border: "rgba(234,179,8,0.4)" },
  Final:  { bg: "rgba(249,115,22,0.18)",  text: "#fdba74", border: "rgba(249,115,22,0.5)" },
  Winner: { bg: "rgba(255,215,0,0.2)",    text: "#FFD700", border: "rgba(255,215,0,0.6)" },
};

function KnockoutPill({ ko }: { ko: NationKnockoutResult }) {
  if (!ko.alive) return null;
  const style = ROUND_ALIVE_COLORS[ko.roundReached];
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
      style={{
        fontFamily: "var(--font-orbitron), monospace",
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        letterSpacing: "0.05em",
      }}
    >
      {ROUND_LABELS[ko.roundReached]}
    </span>
  );
}

// ─── ELIMINATED badge ─────────────────────────────────────────────────────────

function EliminatedBadge({ size = "sm" }: { size?: "sm" | "xs" }) {
  return (
    <span
      className={`font-black uppercase tracking-widest shrink-0 ${
        size === "xs" ? "text-[8px] px-1 py-px" : "text-[9px] px-1.5 py-0.5"
      } rounded`}
      style={{
        fontFamily: "var(--font-orbitron), monospace",
        background: "rgba(220,38,38,0.15)",
        color: "rgba(252,165,165,0.85)",
        border: "1px solid rgba(220,38,38,0.35)",
        letterSpacing: "0.12em",
      }}
    >
      OUT
    </span>
  );
}

// ─── Medal config ─────────────────────────────────────────────────────────────

const MEDAL = {
  1: { border: "#FFD700", glow: "rgba(255,215,0,0.4)",   bg: "rgba(255,215,0,0.08)",  label: "🥇", color: "#FFD700",  podiumH: "h-28" },
  2: { border: "#C0C0C0", glow: "rgba(192,192,192,0.3)", bg: "rgba(192,192,192,0.06)", label: "🥈", color: "#C0C0C0", podiumH: "h-20" },
  3: { border: "#CD7F32", glow: "rgba(205,127,50,0.3)",  bg: "rgba(205,127,50,0.06)", label: "🥉", color: "#CD7F32",  podiumH: "h-14" },
} as const;

// ─── Points display helper ────────────────────────────────────────────────────

function pointsText(entry: SweepstakesEntry): string {
  if (entry.status === "no-draw") return "Draw pending";
  if (entry.totalPoints === null) return "N/A";
  return String(entry.totalPoints);
}

// ─── Nation chip (flag + name + knockout status) ──────────────────────────────

function NationChip({
  name,
  points,
  ko,
  eliminated,
  flagSize = 14,
  showName = true,
}: {
  name: string;
  points: number | null;
  ko: NationKnockoutResult | null;
  eliminated: boolean;
  flagSize?: number;
  showName?: boolean;
}) {
  const isOut = eliminated || (ko ? !ko.alive : false);
  return (
    <span className="flex items-center gap-1" style={{ opacity: isOut ? 0.55 : 1 }}>
      <span className={isOut ? "grayscale" : ""} style={{ display: "inline-flex" }}>
        <Flag name={name} size={flagSize} />
      </span>
      {showName && (
        <span
          className="truncate text-[11px]"
          style={{
            color: isOut ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.75)",
            textDecoration: isOut ? "line-through" : "none",
          }}
        >
          {name}
        </span>
      )}
      {isOut ? <EliminatedBadge size="xs" /> : ko ? <KnockoutPill ko={ko} /> : null}
      {points !== null && (
        <span className="text-[10px] text-gray-500">({points}pt)</span>
      )}
    </span>
  );
}

// ─── Podium card (top 3) ──────────────────────────────────────────────────────

function PodiumCard({ entry, rank }: { entry: SweepstakesEntry; rank: 1 | 2 | 3 }) {
  const m = MEDAL[rank];
  const majorElim = entry.majorKnockout ? !entry.majorKnockout.alive : false;
  const minorElim = entry.minorKnockout ? !entry.minorKnockout.alive : false;

  return (
    <div
      className="flex flex-col items-center gap-0 flex-1 min-w-0"
      style={{ opacity: entry.bothEliminated ? 0.6 : 1 }}
    >
      <div
        className="w-full rounded-xl px-3 py-4 flex flex-col items-center gap-2 text-center relative overflow-hidden"
        style={{
          border: `1px solid ${entry.bothEliminated ? "rgba(220,38,38,0.5)" : m.border}`,
          boxShadow: entry.bothEliminated
            ? "0 0 12px rgba(220,38,38,0.2)"
            : `0 0 20px ${m.glow}, 0 4px 24px rgba(0,0,0,0.5)`,
          background: entry.bothEliminated ? "rgba(220,38,38,0.06)" : m.bg,
        }}
      >
        {/* ELIMINATED watermark */}
        {entry.bothEliminated && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 10 }}>
            <span
              className="font-black text-red-500/25 rotate-[-20deg] text-4xl tracking-widest uppercase"
              style={{ fontFamily: "var(--font-orbitron), monospace" }}
            >
              ELIMINATED
            </span>
          </div>
        )}

        <span className="text-2xl leading-none">{m.label}</span>
        <span
          className="font-black text-xl leading-tight truncate w-full"
          style={{
            fontFamily: "var(--font-orbitron), monospace",
            color: entry.bothEliminated ? "rgba(252,165,165,0.7)" : m.color,
          }}
        >
          {pointsText(entry)}
        </span>
        <span
          className="text-sm font-semibold leading-snug truncate w-full"
          style={{ color: entry.bothEliminated ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.9)" }}
        >
          {entry.companyTeam}
        </span>

        <div className="flex flex-col items-center gap-1 mt-0.5 w-full">
          {entry.majorTeam && (
            <NationChip name={entry.majorTeam} points={entry.majorPoints} ko={entry.majorKnockout} eliminated={majorElim} flagSize={13} showName />
          )}
          {entry.minorTeam && (
            <NationChip name={entry.minorTeam} points={entry.minorPoints} ko={entry.minorKnockout} eliminated={minorElim} flagSize={13} showName />
          )}
          {!entry.majorTeam && !entry.minorTeam && (
            <span className="text-[11px] text-gray-600 italic">No draw yet</span>
          )}
        </div>
      </div>

      {/* Podium block */}
      <div
        className={`w-full ${m.podiumH} rounded-b-lg`}
        style={{
          background: `linear-gradient(180deg, ${m.bg.replace("0.08", "0.15").replace("0.06", "0.1")} 0%, rgba(0,0,0,0.2) 100%)`,
          borderLeft:   `1px solid ${entry.bothEliminated ? "rgba(220,38,38,0.3)" : m.border}`,
          borderRight:  `1px solid ${entry.bothEliminated ? "rgba(220,38,38,0.3)" : m.border}`,
          borderBottom: `1px solid ${entry.bothEliminated ? "rgba(220,38,38,0.3)" : m.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

// ─── Regular leaderboard row (rank 4+) ────────────────────────────────────────

function LeaderboardRow({ entry, rank }: { entry: SweepstakesEntry; rank: number }) {
  const pts = pointsText(entry);
  const hasPoints = entry.totalPoints !== null;
  const majorElim = entry.majorKnockout ? !entry.majorKnockout.alive : false;
  const minorElim = entry.minorKnockout ? !entry.minorKnockout.alive : false;

  return (
    <div
      className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-colors hover:bg-white/5"
      style={{
        border: entry.bothEliminated ? "1px solid rgba(220,38,38,0.25)" : "1px solid rgba(255,255,255,0.08)",
        opacity: entry.bothEliminated ? 0.65 : 1,
      }}
    >
      {/* Rank */}
      <span
        className="w-8 text-center text-sm font-bold shrink-0"
        style={{ fontFamily: "var(--font-orbitron), monospace", color: "rgba(255,255,255,0.25)" }}
      >
        {rank}
      </span>

      {/* Company team name + eliminated badge */}
      <span className="flex items-center gap-2 flex-1 min-w-0">
        <span
          className="text-base font-semibold truncate"
          style={{
            color: entry.bothEliminated ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.9)",
            textDecoration: entry.bothEliminated ? "line-through" : "none",
          }}
        >
          {entry.companyTeam}
        </span>
        {entry.bothEliminated && <EliminatedBadge />}
      </span>

      {/* Nations */}
      <div className="flex items-center gap-2 shrink-0">
        {entry.majorTeam && (
          <NationChip name={entry.majorTeam} points={entry.majorPoints} ko={entry.majorKnockout} eliminated={majorElim} flagSize={15} showName={false} />
        )}
        {entry.minorTeam && (
          <>
            <span className="text-gray-700 text-xs">+</span>
            <NationChip name={entry.minorTeam} points={entry.minorPoints} ko={entry.minorKnockout} eliminated={minorElim} flagSize={15} showName={false} />
          </>
        )}
        {!entry.majorTeam && !entry.minorTeam && (
          <span className="text-xs text-gray-600 italic">No draw yet</span>
        )}
      </div>

      {/* Points */}
      <span
        className="w-14 text-right text-base font-black shrink-0"
        style={{
          fontFamily: "var(--font-orbitron), monospace",
          color: entry.bothEliminated
            ? "rgba(252,165,165,0.5)"
            : hasPoints
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.3)",
        }}
      >
        {pts}
      </span>
    </div>
  );
}

// ─── Sweepstakes Leaderboard ──────────────────────────────────────────────────

function SweepstakesLeaderboard({ entries }: { entries: SweepstakesEntry[] }) {
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = [
    top3[1] ? { entry: top3[1], rank: 2 as const } : null,
    top3[0] ? { entry: top3[0], rank: 1 as const } : null,
    top3[2] ? { entry: top3[2], rank: 3 as const } : null,
  ].filter(Boolean) as { entry: SweepstakesEntry; rank: 1 | 2 | 3 }[];

  return (
    <section>
      <h2
        className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-500/80 mb-5"
        style={{ fontFamily: "var(--font-orbitron), monospace" }}
      >
        🏆 Sweepstakes Leaderboard
      </h2>

      {top3.length > 0 && (
        <div className="flex items-end gap-3 mb-6">
          {podiumOrder.map(({ entry, rank }) => (
            <PodiumCard key={entry.companyTeam} entry={entry} rank={rank} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <div className="flex flex-col gap-2">
          {rest.map((entry, idx) => (
            <LeaderboardRow key={entry.companyTeam} entry={entry} rank={idx + 4} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── WC Group Table ───────────────────────────────────────────────────────────

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
        background: team.eliminated
          ? "rgba(220,38,38,0.04)"
          : isOwned
            ? "rgba(255,220,0,0.05)"
            : "transparent",
        opacity: team.eliminated ? 0.65 : 1,
      }}
    >
      {/* Position */}
      <span
        className="text-[11px] font-bold"
        style={{
          color: team.eliminated
            ? "rgba(252,165,165,0.5)"
            : isQualifying
              ? "rgba(100,220,120,0.7)"
              : "rgba(255,255,255,0.25)",
        }}
      >
        {position}
      </span>

      {/* Team name + flag */}
      <span className="flex items-center gap-1.5 truncate">
        <span className={team.eliminated ? "grayscale" : ""} style={{ display: "inline-flex" }}>
          <Flag name={team.name} size={14} />
        </span>
        <span
          className="truncate text-xs"
          style={{
            color: team.eliminated
              ? "rgba(255,255,255,0.35)"
              : isOwned
                ? "rgba(255,220,80,0.9)"
                : "rgba(255,255,255,0.75)",
            fontWeight: isOwned ? 600 : 400,
            textDecoration: team.eliminated ? "line-through" : "none",
          }}
        >
          {team.name}
        </span>
        {isOwned && !team.eliminated && (
          <span className="text-[9px] text-yellow-500/60 shrink-0">★</span>
        )}
        {team.eliminated && <EliminatedBadge size="xs" />}
      </span>

      {/* Stats */}
      {[team.played, team.won, team.drawn, team.lost].map((val, i) => (
        <span key={i} className="text-center text-xs text-gray-400">{val}</span>
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
          color: team.eliminated
            ? "rgba(252,165,165,0.5)"
            : isOwned
              ? "rgba(255,220,80,0.9)"
              : "rgba(255,255,255,0.85)",
        }}
      >
        {team.points}
      </span>
    </div>
  );
}

function GroupTable({ group, ownedNations }: { group: GroupStanding; ownedNations: Set<string> }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
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
        style={{ gridTemplateColumns: "2rem 1fr 2rem 2rem 2rem 2rem 3rem 2.5rem", color: "rgba(255,255,255,0.3)" }}
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

// ─── Main StandingsPanel ──────────────────────────────────────────────────────

interface StandingsPanelProps {
  drawState: DrawState | null;
}

export default function StandingsPanel({ drawState }: StandingsPanelProps) {
  const [groups, setGroups] = useState<GroupStanding[] | null>(null);
  const [bracket, setBracket] = useState<BracketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [standingsData, bracketData] = await Promise.all([
          fetchStandings(),
          fetchBracket().catch(() => null), // bracket is best-effort
        ]);
        if (!cancelled) {
          setGroups(standingsData.groups);
          setBracket(bracketData);
          setFetchedAt(standingsData.fetchedAt);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Build the set of nations drawn by someone
  const ownedNations = new Set<string>();
  if (drawState?.results) {
    for (const result of Object.values(drawState.results)) {
      if (result.major) ownedNations.add(result.major);
      if (result.minor) ownedNations.add(result.minor);
    }
  }

  const knockoutResults: NationKnockoutResult[] = bracket?.results ?? [];
  const isKnockout = bracket?.phase === "knockout" && knockoutResults.length > 0;

  const leaderboard = buildSweepstakesLeaderboard(groups ?? [], drawState, knockoutResults);

  return (
    <div className="flex flex-col gap-8">
      {/* ── Knockout phase banner ── */}
      {isKnockout && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.3)",
            color: "#d8b4fe",
            fontFamily: "var(--font-orbitron), monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.1em",
            fontWeight: 700,
          }}
        >
          <span className="animate-led-pulse inline-block w-2 h-2 rounded-full bg-purple-400 shrink-0" />
          KNOCKOUT STAGE ACTIVE · Bonus points included
        </div>
      )}

      {/* ── Loading / error ── */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-8 text-gray-500 text-sm">
          <span className="animate-led-pulse inline-block w-2 h-2 rounded-full bg-blue-500" />
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
              <GroupTable key={group.group} group={group} ownedNations={ownedNations} />
            ))}
          </div>
        </section>
      )}

      {!loading && !error && groups !== null && groups.length === 0 && (
        <div className="text-center py-8 text-gray-600 text-sm">
          ⚽ Group stage standings not available yet — check back once matches begin!
        </div>
      )}

      {fetchedAt && (
        <p className="text-center text-[10px] text-gray-700">
          Standings refreshed every 5 min · Last fetch: {new Date(fetchedAt).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
