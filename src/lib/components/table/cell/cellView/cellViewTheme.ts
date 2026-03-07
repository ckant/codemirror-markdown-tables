import type { ThemeSpec } from "@codemirror/view"

export const cellViewTheme: ThemeSpec = {
  '&[data-tbl-line-wrapping="wrap"] .tbl-cell-view': {
    "word-break": "normal",
    "overflow-wrap": "break-word",
  },

  '&[data-tbl-line-wrapping="nowrap"] .tbl-cell-view': {
    "white-space": "pre",
  },

  ".tbl-cell-view": {
    margin: 0,
    outline: "none",
    padding: "7px 10px",
    height: "100%",
    "line-height": 1.5,
    "white-space-collapse": "break-spaces",
    "font-family": "var(--tbl-style-font-family)",
    "font-size": "var(--tbl-style-font-size)",
    color: "var(--tbl-theme-text-color)",

    "&[data-hidden]": {
      display: "none",
    },
  },

  ".tbl-cell-view [data-br]": {
    "white-space": "pre",
  },
}
