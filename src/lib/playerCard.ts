// ─── Edit Baller Diggle's FIFA card here ─────────────────────────────────────

export interface CardStat {
  label: string;
  value: number | string;
}

export const PLAYER_CARD = {
  name: "BALLER DIGGLE",
  rating: 94,
  position: "ST",
  club: "MHR",
  number: 67,

  // Classic FIFA 6-stat block (values 0–99)
  stats: [
    { label: "PAC", value: 97 },
    { label: "SHO", value: 72 },
    { label: "PAS", value: 68 },
    { label: "DRI", value: 85 },
    { label: "DEF", value: 12 },
    { label: "PHY", value: 88 },
  ] satisfies CardStat[],

  // Fun extra stats — use numbers or strings like "??"
  funStats: [
    { label: "DEV", value: "??" },
    { label: "VIBE", value: 100 },
    { label: "CHAT", value: "??" },
    { label: "BANT", value: 69 },
    { label: "LUCK", value: "??" },
    { label: "SWAG", value: 99 },
  ] satisfies CardStat[],
};
