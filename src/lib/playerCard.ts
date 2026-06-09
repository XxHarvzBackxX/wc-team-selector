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
  isManager?: boolean; // hides FIFA stats; only funStats are shown
  /** Classic FIFA 6-stat block (values 0–99) — omit or leave empty for managers */
  stats: CardStat[];
  /** Fun extra stats — use numbers or strings like "??" */
  funStats: CardStat[];
}

export const PLAYER_CARDS: PlayerCard[] = [
  {
    name: "DIGGLE RONALDO",
    rating: 94,
    position: "LW",
    club: "MHR Utd.",
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
      { label: "AURA", value: 80 },
    ],
  },

  {
    name: "TONY PELÉ",
    rating: 99,
    position: "ST",
    club: "MHR Utd.",
    number: 9,
    image: "/baller-tony.png",

    stats: [
      { label: "PAC", value: 99 },
      { label: "SHO", value: 85 },
      { label: "PAS", value: 45 },
      { label: "DRI", value: 88 },
      { label: "DEF", value: 23 },
      { label: "PHY", value: 95 },
    ],

    funStats: [
      { label: "DEV", value: 99 },
      { label: "BANT", value: 95 },
      { label: "AURA", value: 99 },
    ],
  },

  {
    name: "REECE MARADONA",
    rating: 88,
    position: "CAM",
    club: "MHR Utd.",
    number: 0,
    image: "/baller-reece.png",

    stats: [
      { label: "PAC", value: 78 },
      { label: "SHO", value: 85 },
      { label: "PAS", value: 90 },
      { label: "DRI", value: 89 },
      { label: "DEF", value: 57 },
      { label: "PHY", value: 72 },
    ],

    funStats: [
      { label: "DEV", value: 87 },
      { label: "BANT", value: 99 },
      { label: "AURA", value: 95 },
    ],
  },

  {
    name: "MATT MESSI",
    rating: 90,
    position: "RW",
    club: "MHR Utd.",
    number: 17,
    image: "/baller-matt.png",

    stats: [
      { label: "PAC", value: 86 },
      { label: "SHO", value: 90 },
      { label: "PAS", value: 92 },
      { label: "DRI", value: 96 },
      { label: "DEF", value: 38 },
      { label: "PHY", value: 68 },
    ],

    funStats: [
      { label: "DEV", value: 74 },
      { label: "BANT", value: 80 },
      { label: "AURA", value: 69 },
    ],
  },

  {
    name: "KOO ROODSWAZAKY",
    rating: 89,
    position: "LDM",
    club: "MHR Utd.",
    number: 6,
    image: "/baller-koo.png",

    stats: [
      { label: "PAC", value: 84 },
      { label: "SHO", value: 82 },
      { label: "PAS", value: 88 },
      { label: "DRI", value: 86 },
      { label: "DEF", value: 88 },
      { label: "PHY", value: 92 },
    ],

    funStats: [
      { label: "DEV", value: 85 },
      { label: "BANT", value: 85 },
      { label: "AURA", value: 98 },
    ],
  },

  {
    name: "LIZZA ZIDANE",
    rating: 85,
    position: "RDM",
    club: "MHR Utd.",
    number: 8,
    image: "/baller-lizza.png",

    stats: [
      { label: "PAC", value: 76 },
      { label: "SHO", value: 82 },
      { label: "PAS", value: 91 },
      { label: "DRI", value: 89 },
      { label: "DEF", value: 79 },
      { label: "PHY", value: 74 },
    ],

    funStats: [
      { label: "DEV", value: 99 },
      { label: "BANT", value: 50 },
      { label: "AURA", value: 45 },
    ],
  },

  {
    name: "AJAY CARLOS",
    rating: 88,
    position: "LB",
    club: "MHR Utd.",
    number: 3,
    image: "/baller-ajay.png",

    stats: [
      { label: "PAC", value: 92 },
      { label: "SHO", value: 81 },
      { label: "PAS", value: 84 },
      { label: "DRI", value: 83 },
      { label: "DEF", value: 86 },
      { label: "PHY", value: 88 },
    ],

    funStats: [
      { label: "DEV", value: 6 },
      { label: "BANT", value: 83 },
      { label: "AURA", value: 22 },
    ],
  },

  {
    name: "SANJIV MALDINI",
    rating: 89,
    position: "CB",
    club: "MHR Utd.",
    number: 5,
    image: "/baller-sanjiv.png",

    stats: [
      { label: "PAC", value: 79 },
      { label: "SHO", value: 48 },
      { label: "PAS", value: 82 },
      { label: "DRI", value: 74 },
      { label: "DEF", value: 95 },
      { label: "PHY", value: 88 },
    ],

    funStats: [
      { label: "DEV", value: 80 },
      { label: "BANT", value: 83 },
      { label: "AURA", value: 22 },
    ],
  },

  {
    name: "SAM BECKENBAUER",
    rating: 89,
    position: "CB",
    club: "MHR Utd.",
    number: 4,
    image: "/baller-sam.png",

    stats: [
      { label: "PAC", value: 78 },
      { label: "SHO", value: 62 },
      { label: "PAS", value: 88 },
      { label: "DRI", value: 80 },
      { label: "DEF", value: 93 },
      { label: "PHY", value: 87 },
    ],

    funStats: [
      { label: "DEV", value: 75 },
      { label: "BANT", value: 97 },
      { label: "AURA", value: 0 },
    ],
  },

  {
    name: "HASSAN WALKER",
    rating: 84,
    position: "RB",
    club: "MHR Utd.",
    number: 2,
    image: "/baller-hassan.png",

    stats: [
      { label: "PAC", value: 94 },
      { label: "SHO", value: 49 },
      { label: "PAS", value: 75 },
      { label: "DRI", value: 73 },
      { label: "DEF", value: 84 },
      { label: "PHY", value: 85 },
    ],

    funStats: [
      { label: "DEV", value: -1 },
      { label: "BANT", value: 91 },
      { label: "AURA", value: 80 },
    ],
  },

  {
    name: "JAN PICKFORD",
    rating: 86,
    position: "GK",
    club: "MHR Utd.",
    number: 1,
    image: "/baller-jan.png",

    stats: [
      { label: "PAC", value: 58 },
      { label: "SHO", value: 21 },
      { label: "PAS", value: 78 },
      { label: "DRI", value: 65 },
      { label: "DEF", value: 92 },
      { label: "PHY", value: 83 },
    ],

    funStats: [
      { label: "DEV", value: 93 },
      { label: "BANT", value: 75 },
      { label: "AURA", value: 77 },
    ],
  },

  // ── Manager ──────────────────────────────────────────────────────────────────
  // Replace image with the real manager pic when available.
  {
    name: "THE GAFFER",
    rating: 97,
    position: "MGR",
    club: "MHR Utd.",
    number: 0,
    image: "/baller-diggle.png", // placeholder — swap for real manager image
    isManager: true,
    stats: [], // managers have no FIFA stats

    funStats: [
      { label: "TACT", value: 94 },
      { label: "MOTIV", value: 88 },
      { label: "PRESS", value: 91 },
      { label: "BANT", value: 72 },
      { label: "TEA",  value: "??" },
      { label: "FURY", value: 85 },
    ],
  },

  // ── Add more players below ────────────────────────────────────────────────
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
