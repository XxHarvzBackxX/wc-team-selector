import Image from "next/image";
import { PLAYER_CARD, CardStat } from "@/lib/playerCard";

function StatBlock({ stat, small = false }: { stat: CardStat; small?: boolean }) {
  const isQuestion = stat.value === "??";
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className={`font-black leading-none ${
          small ? "text-[11px]" : "text-sm"
        } ${isQuestion ? "text-amber-400/60" : "text-white drop-shadow"}`}
      >
        {stat.value}
      </span>
      <span
        className={`font-bold uppercase tracking-wider leading-none ${
          small ? "text-[7px]" : "text-[9px]"
        } text-amber-200/60`}
      >
        {stat.label}
      </span>
    </div>
  );
}

export default function BallerCard() {
  const { name, rating, position, club, number, stats, funStats } = PLAYER_CARD;

  return (
    /* Card shell — gold gradient, FIFA proportions ~13:18 */
    <div
      className="
        relative w-56 sm:w-64 shrink-0
        rounded-[18px] overflow-hidden
        shadow-[0_8px_48px_rgba(0,0,0,0.7),0_0_60px_rgba(251,191,36,0.25)]
        ring-1 ring-amber-400/40
      "
      style={{
        aspectRatio: "13/18",
        background:
          "linear-gradient(160deg, #78350f 0%, #92400e 20%, #b45309 45%, #92400e 70%, #78350f 100%)",
      }}
    >
      {/* Metallic sheen overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 40%, transparent 60%, rgba(255,255,255,0.08) 100%)",
        }}
      />

      {/* Top-left: rating + position + club */}
      <div className="absolute top-3 left-3 z-20 flex flex-col items-center leading-none">
        <span className="text-white font-black text-4xl sm:text-5xl drop-shadow-lg">{rating}</span>
        <span className="text-white/90 font-extrabold text-sm tracking-widest mt-0.5">{position}</span>
        <span className="text-amber-200/70 font-bold text-xs tracking-wider mt-1.5">{club}</span>
        <span className="text-amber-200/50 font-semibold text-[10px]">#{number}</span>
      </div>

      {/* Player image — top 60% of card */}
      <div className="absolute inset-x-0 top-0 z-10" style={{ height: "62%" }}>
        <Image
          src="/baller-diggle.png"
          alt={name}
          fill
          className="object-cover object-top"
          priority
        />
        {/* Fade image into card at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 h-20"
          style={{
            background:
              "linear-gradient(to top, #92400e 0%, rgba(146,64,14,0.8) 40%, transparent 100%)",
          }}
        />
      </div>

      {/* Player name */}
      <div className="absolute z-20 inset-x-0" style={{ top: "57%" }}>
        <p className="text-center text-white font-black text-xs sm:text-sm tracking-[0.18em] uppercase drop-shadow px-2">
          {name}
        </p>
      </div>

      {/* Divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "63%", height: "1px", background: "rgba(251,191,36,0.35)" }}
      />

      {/* Standard FIFA stats — 3 columns × 2 rows */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "65%", gap: "4px 0" }}
      >
        {stats.map((s) => (
          <StatBlock key={s.label} stat={s} />
        ))}
      </div>

      {/* Fun stats divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "82%", height: "1px", background: "rgba(251,191,36,0.2)" }}
      />

      {/* Fun stats — 3 columns × 2 rows */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "84%", gap: "3px 0" }}
      >
        {funStats.map((s) => (
          <StatBlock key={s.label} stat={s} small />
        ))}
      </div>
    </div>
  );
}
