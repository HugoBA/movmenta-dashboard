// Dark-mode chart palette — validated defaults from the dataviz reference
// palette (references/palette.md). Swap these hexes for Sollo's brand hues
// once confirmed; keep the same slot order (it's the CVD-safety mechanism).
export const categorical = [
  "#3987e5", // 1 blue
  "#ff2f00", // 2 orange
  "#199e70", // 3 aqua
  "#c98500", // 4 yellow
  "#d55181", // 5 magenta
  "#008300", // 6 green
  "#9085e9", // 7 violet
  "#e66767", // 8 red
] as const;

export const ink = {
  primary: "#ffffff",
  secondary: "#c3c2b7",
  muted: "#898781",
};

export const chartChrome = {
  surface: "#1a1a19",
  grid: "#2c2c2a",
  baseline: "#383835",
};

export const status = {
  good: "#0ca30c",
  warning: "#fab219",
  serious: "#ec835a",
  critical: "#d03b3b",
};
