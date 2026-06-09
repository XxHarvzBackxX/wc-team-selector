"use client";

interface ViewerBoardProps {
  count: number;
}

export default function ViewerBoard({ count }: ViewerBoardProps) {
  const digits = String(count).padStart(2, "0");

  return (
    <div
      className="fixed bottom-5 right-5 z-50 select-none"
      aria-label={`${count} viewers watching`}
    >
      {/* Outer casing — dark charcoal with red rim glow */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "linear-gradient(145deg, #1c1c1c, #0a0a0a)",
          boxShadow:
            "0 0 0 2px #2a0000, 0 0 20px rgba(220,20,20,0.5), 0 8px 32px rgba(0,0,0,0.8)",
          padding: "3px",
        }}
      >
        {/* Inner board */}
        <div
          className="rounded-lg px-5 py-3 flex flex-col items-center gap-1"
          style={{
            background:
              "radial-gradient(ellipse at center, #120000 0%, #0a0000 100%)",
            /* subtle LED dot-matrix texture */
            backgroundImage:
              "radial-gradient(ellipse at center, #120000 0%, #0a0000 100%), repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,0,0,0.03) 3px, rgba(255,0,0,0.03) 4px), repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,0,0,0.03) 3px, rgba(255,0,0,0.03) 4px)",
          }}
        >
          {/* "WATCHING" label */}
          <span
            className="text-[9px] tracking-[0.35em] font-bold uppercase"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              color: "#cc2200",
              textShadow: "0 0 6px rgba(255,40,0,0.6)",
            }}
          >
            Watching
          </span>

          {/* Big LED digit */}
          <span
            className="leading-none font-black tabular-nums"
            style={{
              fontFamily: "var(--font-orbitron), monospace",
              fontSize: "clamp(2.5rem, 5vw, 3.5rem)",
              color: "#ff2200",
              textShadow:
                "0 0 8px #ff4400, 0 0 20px #ff2200, 0 0 45px #cc0000",
              letterSpacing: "0.08em",
            }}
          >
            {digits}
          </span>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="animate-led-pulse inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: "#ff2200", boxShadow: "0 0 6px #ff4400" }}
            />
            <span
              className="text-[8px] tracking-[0.3em] font-bold"
              style={{
                fontFamily: "var(--font-orbitron), monospace",
                color: "#991100",
              }}
            >
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
