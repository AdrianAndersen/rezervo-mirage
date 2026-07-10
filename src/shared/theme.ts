import { createTheme, type MantineColorsTuple } from "@mantine/core";

// rezervo brand green (MUI green 500 = #4caf50), expanded to a Mantine ramp.
const rezervoGreen: MantineColorsTuple = [
  "#eef9ef",
  "#dcf1de",
  "#b6e2bb",
  "#8dd394",
  "#69c672",
  "#52bb5c",
  "#4caf50",
  "#3f9d44",
  "#348638",
  "#256b29",
];

// Neutral near-black dark scale (rezervo uses pure neutrals, not Mantine's bluish default).
const neutralDark: MantineColorsTuple = [
  "#c9c9c9",
  "#b0b0b0",
  "#909090",
  "#6d6d6d",
  "#3f3f3f",
  "#2b2b2b",
  "#1c1c1c",
  "#141414",
  "#0d0d0d",
  "#080808",
];

// Tabular/mono face for data: times, week numbers, slugs and ids.
export const MONO_FONT_FAMILY =
  "'SFMono-Regular', ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";

export const theme = createTheme({
  primaryColor: "rezervo",
  primaryShade: { light: 6, dark: 7 },
  colors: {
    rezervo: rezervoGreen,
    dark: neutralDark,
  },
  defaultRadius: "md",
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  headings: {
    fontWeight: "650",
  },
  cursorType: "pointer",
});
