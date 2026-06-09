// ─── Edit player FIFA cards here ─────────────────────────────────────────────
// Add as many cards as you like; they'll all be displayed in the hero section.

export interface CardStat {
  label: string;
  value: number | string;
}

export interface PlayerCard {
  name: string;
  rating: number;
  position: string;
  club: string;
  number: number;
  image: string; // path relative to /public, e.g. "/baller-diggle.png"
  /** Classic FIFA 6-stat block (values 0–99) */
  stats: CardStat[];
  /** Fun extra stats — use numbers or strings like "??" */
  funStats: CardStat[];
}

export const PLAYER_CARDS: PlayerCard[] = [
  {
    name: "DIGGLE RONALDO",
    rating: 94,
    position: "ST",
    club: "MHR",
    number: 67,
    image: "/baller-diggle.png",

    stats: [
      { label: "PAC", value: 97 },
      { label: "SHO", value: 72 },
      { label: "PAS", value: 68 },
      { label: "DRI", value: 85 },
      { label: "DEF", value: 12 },
      { label: "PHY", value: 88 },
    ],

    funStats: [
      { label: "DEV", value: 3 },
      { label: "BANT", value: 67 },
      { label: "SWAG", value: 99 },
    ],
  },

  // ── Add more cards below ────────────────────────────────────────────────────
  // {
  //   name: "ANOTHER PLAYER",
  //   rating: 88,
  //   position: "GK",
  //   club: "MHR",
  //   number: 1,
  //   image: "/another-player.png",
  //   stats: [
  //     { label: "PAC", value: 50 },
  //     { label: "SHO", value: 20 },
  //     { label: "PAS", value: 55 },
  //     { label: "DRI", value: 45 },
  //     { label: "DEF", value: 82 },
  //     { label: "PHY", value: 77 },
  //   ],
  //   funStats: [
  //     { label: "CHAT", value: "??" },
  //     { label: "LUCK", value: 42 },
  //     { label: "VIBE", value: 91 },
  //   ],
  // },
];
