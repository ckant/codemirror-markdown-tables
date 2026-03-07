import type { ThemeSpec } from "@codemirror/view"

export const cellTheme: ThemeSpec = {
  ".tbl-cell": {
    "box-sizing": "content-box",
    position: "relative",
    "vertical-align": "top",
    "background-color": "var(--tbl-row-background)",
    padding: 0,
    "font-family": "var(--tbl-style-font-family)",
    "font-size": "var(--tbl-style-font-size)",
    "min-width": "calc(4ch + 20px)",
    height: "inherit",
    "user-select": "none",
    border: "none",
    "scroll-margin-right": "1px",
    "scroll-margin-left": "1px",

    "&:first-child": {
      "scroll-margin-left": "16px",
    },
    "&:last-child": {
      "scroll-margin-right": "16px",
    },

    '&[align="left"]': {
      "text-align": "left",
    },
    '&[align="center"]': {
      "text-align": "center",
    },
    '&[align="right"]': {
      "text-align": "right",
    },

    '&[data-border~="top"]': {
      "border-top": "1px solid var(--tbl-theme-border-color)",
    },
    '&[data-border~="right"]': {
      "border-right": "1px solid var(--tbl-theme-border-color)",
    },
    '&[data-border~="bottom"]': {
      "border-bottom": "1px solid var(--tbl-theme-border-color)",
    },
    '&[data-border~="left"]': {
      "border-left": "1px solid var(--tbl-theme-border-color)",
    },

    '&[data-state="moving"]': {
      "z-index": 200,
      "background-color": "color-mix(in srgb, var(--tbl-row-background), transparent 15%)",
    },

    '&[data-state="shiftable"]': {
      transform: "translate3d(0, 0, 0)",
      transition: "transform 150ms ease",
    },

    "&[data-outline]": {
      "&::after": {
        display: "block",
        position: "absolute",
        top: "-1px",
        left: "-1px",
        border: "none",
        width: "calc(100% + 2px)",
        height: "calc(100% + 2px)",
        "pointer-events": "none",
        content: '""',
      },

      '&[data-outline~="top"]::after': {
        "border-top": "2px solid var(--tbl-theme-outline-color)",
      },
      '&[data-outline~="right"]::after': {
        "border-right": "2px solid var(--tbl-theme-outline-color)",
      },
      '&[data-outline~="bottom"]::after': {
        "border-bottom": "2px solid var(--tbl-theme-outline-color)",
      },
      '&[data-outline~="left"]::after': {
        "border-left": "2px solid var(--tbl-theme-outline-color)",
      },
    },
  },

  ".tbl-header-cell:not([align])": {
    "text-align": "var(--tbl-style-default-header-alignment)",
  },
}
