import type { ThemeSpec } from "@codemirror/view"

export const menuTooltipTheme: ThemeSpec = {
  ".cm-tooltip.tbl-menu-tooltip": {
    border: "none",
    "user-select": "none",

    "&, &::before, &::after, & *, & *::before, & *::after": {
      "box-sizing": "border-box",
    },
  },
}
