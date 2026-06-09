import Image from "next/image";
import { PlayerCard, CardStat } from "@/lib/playerCard";

// ── Card colour theme by OVR ───────────────────────────────────────────────
type CardTheme = {
  bg: string;
  sheen: string;
  glow: string;
  ring: string;
  fade: string;
  divider: string;
  statLabel: string;
};

function getCardTheme(rating: number): CardTheme {
  if (rating >= 95) {
    // ICON / special dark purple
    return {
      bg: "linear-gradient(160deg, #080318 0%, #1c0848 25%, #3a1090 50%, #1c0848 75%, #080318 100%)",
      sheen: "rgba(200,140,255,0.22)",
      glow: "rgba(130,50,255,0.55)",
      ring: "rgba(180,100,255,0.6)",
      fade: "#1c0848",
      divider: "rgba(190,110,255,0.55)",
      statLabel: "rgba(210,170,255,0.65)",
    };
  }
  if (rating >= 90) {
    // Gold
    return {
      bg: "linear-gradient(160deg, #7a6010 0%, #c9a000 20%, #e8c42a 45%, #c9a000 70%, #7a6010 100%)",
      sheen: "rgba(255,255,255,0.18)",
      glow: "rgba(232,196,42,0.45)",
      ring: "rgba(255,220,80,0.55)",
      fade: "#c9a000",
      divider: "rgba(255,220,60,0.5)",
      statLabel: "rgba(255,240,180,0.65)",
    };
  }
  if (rating >= 85) {
    // Silver / blue rare
    return {
      bg: "linear-gradient(160deg, #12202e 0%, #1e3a55 20%, #336699 45%, #1e3a55 70%, #12202e 100%)",
      sheen: "rgba(170,215,255,0.2)",
      glow: "rgba(50,130,230,0.4)",
      ring: "rgba(80,170,255,0.5)",
      fade: "#1e3a55",
      divider: "rgba(90,185,255,0.5)",
      statLabel: "rgba(170,215,255,0.65)",
    };
  }
  // Bronze
  return {
    bg: "linear-gradient(160deg, #1a1008 0%, #422010 20%, #845025 45%, #422010 70%, #1a1008 100%)",
    sheen: "rgba(255,195,120,0.15)",
    glow: "rgba(150,90,25,0.4)",
    ring: "rgba(200,135,50,0.5)",
    fade: "#422010",
    divider: "rgba(215,155,65,0.5)",
    statLabel: "rgba(230,185,115,0.65)",
  };
}

// ── Stat block ─────────────────────────────────────────────────────────────
function StatBlock({
  stat,
  labelColor,
  size = "lg",
}: {
  stat: CardStat;
  labelColor: string;
  size?: "lg" | "sm";
}) {
  const isQuestion = stat.value === "??";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`font-black leading-none ${
          size === "sm" ? "text-[9px]" : "text-sm"
        } ${isQuestion ? "opacity-50" : "text-white drop-shadow"}`}
      >
        {stat.value}
      </span>
      <span
        className={`font-bold uppercase tracking-wider leading-none ${
          size === "sm" ? "text-[5px]" : "text-[9px]"
        }`}
        style={{ color: labelColor }}
      >
        {stat.label}
      </span>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────
export default function BallerCard({
  card,
  size = "lg",
}: {
  card: PlayerCard;
  size?: "lg" | "sm";
}) {
  const { name, rating, position, club, number, image, stats, funStats } = card;
  const theme = getCardTheme(rating);

  const widthClass =
    size === "sm"
      ? "w-[148px] sm:w-[165px] lg:w-[182px]"
      : "w-56 sm:w-64";

  return (
    <div
      className={`relative ${widthClass} shrink-0 rounded-[18px] overflow-hidden`}
      style={{
        aspectRatio: "13/18",
        background: theme.bg,
        boxShadow: `0 8px 40px rgba(0,0,0,0.7), 0 0 50px ${theme.glow}`,
        outline: `1px solid ${theme.ring}`,
      }}
    >
      {/* Metallic sheen */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: `linear-gradient(135deg, ${theme.sheen} 0%, rgba(255,255,255,0.03) 40%, transparent 60%, rgba(255,255,255,0.07) 100%)`,
        }}
      />

      {/* Top-left: rating + position + club */}
      <div
        className={`absolute top-3 left-3 z-20 flex flex-col items-center leading-none ${
          size === "sm" ? "top-2 left-2" : "top-3 left-3"
        }`}
      >
        <span
          className={`text-white font-black drop-shadow-lg ${
            size === "sm" ? "text-3xl" : "text-4xl sm:text-5xl"
          }`}
        >
          {rating}
        </span>
        <span
          className={`text-white/90 font-extrabold tracking-widest mt-0.5 ${
            size === "sm" ? "text-[9px]" : "text-sm"
          }`}
        >
          {position}
        </span>
        <span
          className={`font-bold tracking-wider mt-1.5 ${size === "sm" ? "text-[6px]" : "text-xs"}`}
          style={{ color: theme.statLabel }}
        >
          {club}
        </span>
        <span
          className={`font-semibold ${size === "sm" ? "text-[5px]" : "text-[10px]"}`}
          style={{ color: theme.statLabel, opacity: 0.7 }}
        >
          #{number}
        </span>
      </div>

      {/* Player image */}
      <div className="absolute inset-x-0 top-0 z-10" style={{ height: "68%" }}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top"
          priority
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{
            background: `linear-gradient(to top, ${theme.fade} 0%, ${theme.fade}b0 50%, transparent 100%)`,
          }}
        />
      </div>

      {/* Player name */}
      <div className="absolute z-20 inset-x-0" style={{ top: "63%" }}>
        <p
          className={`text-center text-white font-black uppercase drop-shadow px-2 ${
            size === "sm" ? "text-[7px] tracking-[0.12em]" : "text-xs sm:text-sm tracking-[0.18em]"
          }`}
        >
          {name}
        </p>
      </div>

      {/* Divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "69%", height: "1px", background: theme.divider }}
      />

      {/* FIFA stats */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "71%", gap: size === "sm" ? "3px 0" : "4px 0" }}
      >
        {stats.map((s) => (
          <StatBlock key={s.label} stat={s} labelColor={theme.statLabel} size={size} />
        ))}
      </div>

      {/* Fun stats divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "87%", height: "1px", background: `${theme.divider.replace("0.5", "0.25")}` }}
      />

      {/* Fun stats */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "89%", gap: "3px 0" }}
      >
        {funStats.map((s) => (
          <StatBlock key={s.label} stat={s} labelColor={theme.statLabel} size="sm" />
        ))}
      </div>
    </div>
  );
}
