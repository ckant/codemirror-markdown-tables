import type { ThemeSpec } from "@codemirror/view"

export const menuItemTextTheme: ThemeSpec = {
  ".tbl-menu-item-text": {
    "z-index": 200,
    "pointer-events": "none",
    "user-select": "none",
    "font-size": "var(--tbl-style-menu-font-size)",
  },
}
