import type { ThemeSpec } from "@codemirror/view"

export const menuTheme: ThemeSpec = {
  ".tbl-menu": {
    position: "absolute",
    top: 0,
    left: 0,
    "z-index": 900,
    "box-shadow": "2px 2px 0 0 rgb(0 0 0 / 10%)",
    border: "1px solid var(--tbl-theme-menu-border-color)",
    "background-color": "var(--tbl-theme-menu-background)",
    padding: "0.25em 0",
    width: "max-content",
    "font-family": "var(--tbl-style-menu-font-family)",
    "font-size": "var(--tbl-style-menu-font-size)",
  },
}
