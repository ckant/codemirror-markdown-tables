import type { ThemeSpec } from "@codemirror/view"

export const menuItemTheme: ThemeSpec = {
  ".tbl-menu-item": {
    display: "flex",
    position: "relative",
    "align-items": "center",
    gap: "0.75em",
    padding: "0.5em 0.75em",
    color: "var(--tbl-theme-menu-text-color)",
    "user-select": "none",
    "line-height": 1,
    "font-size": "var(--tbl-style-menu-font-size)",

    "&:active": {
      cursor: "pointer",
      color: "var(--tbl-theme-menu-hover-text-color)",

      "&::after": { "background-color": "var(--tbl-theme-menu-hover-background)" },
    },

    "&::after": {
      position: "absolute",
      left: "0.25em",
      width: "calc(100% - 0.5em)",
      height: "100%",
      content: '""',
    },
  },
  "&[data-tbl-hoverable] .tbl-menu-item:hover": {
    cursor: "pointer",
    color: "var(--tbl-theme-menu-hover-text-color)",

    "&::after": { "background-color": "var(--tbl-theme-menu-hover-background)" },
  },
}
