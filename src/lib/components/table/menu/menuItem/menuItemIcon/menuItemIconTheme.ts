import type { ThemeSpec } from "@codemirror/view"

export const menuItemIconTheme: ThemeSpec = {
  ".tbl-menu-item-icon": {
    "z-index": 200,
    width: "1em",
    height: "1em",
    "pointer-events": "none",
    "font-size": "var(--tbl-style-menu-font-size)",
  },
}
