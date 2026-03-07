import type { ThemeSpec } from "@codemirror/view"

export const menuSeparatorTheme: ThemeSpec = {
  ".tbl-menu-separator": {
    margin: "0.25em 0.5em",
    "background-color": "var(--tbl-theme-menu-border-color)",
    height: "1px",
    "font-size": "var(--tbl-style-menu-font-size)",
  },
}
