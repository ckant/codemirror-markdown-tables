import type { ThemeSpec } from "@codemirror/view"

export const tableAutocompleterTheme: ThemeSpec = {
  "& .cm-tooltip.cm-tooltip-autocomplete:has(.cm-completionIcon-table)": {
    border: "1px solid var(--tbl-theme-menu-border-color)",
    "box-shadow": "2px 2px 0 0 rgb(0 0 0 / 10%)",
    "font-family": "var(--tbl-style-menu-font-family)",
    "font-size": "var(--tbl-style-menu-font-size)",
  },
  "& .cm-tooltip.cm-tooltip-autocomplete > ul:has(.cm-completionIcon-table)": {
    "min-width": "auto",
    display: "flex",
    "flex-direction": "column",
    "justify-content": "center",
    padding: "0.25em 0",
    "line-height": 1,
    "font-family": "var(--tbl-style-menu-font-family)",
    "font-size": "var(--tbl-style-menu-font-size)",

    background: "var(--tbl-theme-menu-background)",
  },

  "& .cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]:has(.cm-completionIcon-table)": {
    color: "var(--tbl-theme-menu-hover-text-color)",

    "&::before": {
      background: "var(--tbl-theme-menu-hover-background)",
    },
  },

  "& .cm-tooltip.cm-tooltip-autocomplete ul li:not([aria-selected]):has(.cm-completionIcon-table)":
    {
      color: "var(--tbl-theme-menu-text-color)",
    },

  "& .cm-tooltip.cm-tooltip-autocomplete ul li:not([aria-selected]):has(.cm-completionIcon-table), & .cm-tooltip.cm-tooltip-autocomplete ul li[aria-selected]:has(.cm-completionIcon-table)":
    {
      position: "relative",
      padding: "0.5em 0.75em",
      background: "var(--tbl-theme-menu-background)",
      display: "flex",
      gap: "0.75em",
      "align-items": "center",
      "font-family": "var(--tbl-style-menu-font-family)",
      "font-size": "var(--tbl-style-menu-font-size)",
      "line-height": 1,

      "&::before": {
        position: "absolute",
        height: "100%",
        width: "calc(100% - 0.5em)",
        left: "0.25em",
        top: 0,
        content: '""',

        "pointer-events": "none",
      },
    },
  "& .cm-completionIcon.cm-completionIcon-table": {
    opacity: 1,
    // Using mask-image allows setting the color of the inline svg in CSS with `background`
    "mask-image":
      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' height='14' width='12.25' viewBox='0 0 448 512'%3E%3C!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.--%3E%3Cpath d='M384 96l-128 0 0 128 128 0 0-128zm64 128l0 192c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96C0 60.7 28.7 32 64 32l320 0c35.3 0 64 28.7 64 64l0 128zM64 288l0 128 128 0 0-128-128 0zm128-64l0-128-128 0 0 128 128 0zm64 64l0 128 128 0 0-128-128 0z'/%3E%3C/svg%3E\")",
    "mask-position": "center",
    "mask-repeat": "no-repeat",
    padding: 0,
    background: "currentColor",
    position: "relative",
    width: "1em",
    height: "1em",
    "font-family": "var(--tbl-style-menu-font-family)",
    "font-size": "var(--tbl-style-menu-font-size)",
    "line-height": 1,
  },
  "& :has(.cm-completionIcon.cm-completionIcon-table) .cm-completionLabel": {
    position: "relative",
  },
}
