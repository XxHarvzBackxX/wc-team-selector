import Image from "next/image";
import { PlayerCard, CardStat } from "@/lib/playerCard";

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

export default function BallerCard({ card }: { card: PlayerCard }) {
  const { name, rating, position, club, number, image, stats, funStats } = card;

  return (
    /* Card shell — gold gradient, FIFA proportions ~13:18 */
    <div
      className="
        relative w-56 sm:w-64 shrink-0
        rounded-[18px] overflow-hidden
        shadow-[0_8px_48px_rgba(0,0,0,0.7),0_0_60px_rgba(232,196,42,0.35)]
        ring-1 ring-yellow-400/50
      "
      style={{
        aspectRatio: "13/18",
        background:
          "linear-gradient(160deg, #7a6010 0%, #c9a000 20%, #e8c42a 45%, #c9a000 70%, #7a6010 100%)",
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

      {/* Player image — top 68% of card */}
      <div className="absolute inset-x-0 top-0 z-10" style={{ height: "68%" }}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top"
          priority
        />
        {/* Fade image into card at bottom — shorter so legs/ball show through */}
        <div
          className="absolute inset-x-0 bottom-0 h-12"
          style={{
            background:
              "linear-gradient(to top, #c9a000 0%, rgba(201,160,0,0.7) 50%, transparent 100%)",
          }}
        />
      </div>

      {/* Player name */}
      <div className="absolute z-20 inset-x-0" style={{ top: "63%" }}>
        <p className="text-center text-white font-black text-xs sm:text-sm tracking-[0.18em] uppercase drop-shadow px-2">
          {name}
        </p>
      </div>

      {/* Divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "69%", height: "1px", background: "rgba(255,220,60,0.5)" }}
      />

      {/* Standard FIFA stats — 3 columns × 2 rows */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "71%", gap: "4px 0" }}
      >
        {stats.map((s) => (
          <StatBlock key={s.label} stat={s} />
        ))}
      </div>

      {/* Fun stats divider */}
      <div
        className="absolute z-20 inset-x-3"
        style={{ top: "87%", height: "1px", background: "rgba(255,220,60,0.25)" }}
      />

      {/* Fun stats — 3 columns × 2 rows */}
      <div
        className="absolute z-20 inset-x-3 grid grid-cols-3"
        style={{ top: "89%", gap: "3px 0" }}
      >
        {funStats.map((s) => (
          <StatBlock key={s.label} stat={s} small />
        ))}
      </div>
    </div>
  );
}
