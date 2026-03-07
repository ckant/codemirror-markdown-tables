import type { ThemeSpec } from "@codemirror/view"

export const tableTheme: ThemeSpec = {
  "& .tbl-table-wrapper[data-select-all]": {
    "--tbl-select-all-overlay": "var(--tbl-theme-select-all-blur-overlay)",
  },
  "&.cm-focused .tbl-table-wrapper[data-select-all]": {
    "--tbl-select-all-overlay": "var(--tbl-theme-select-all-focus-overlay)",
  },
  ".tbl-table-wrapper": {
    "--tbl-overlay": "var(--tbl-select-all-overlay, transparent)",
    position: "relative",
    width: "fit-content",
    "white-space-collapse": "collapse",
    "touch-action": "none",
  },
  ".tbl-table": {
    "border-collapse": "separate",
    "border-spacing": 0,
    overflow: "visible",
    "touch-action": "none",

    "&:focus-visible": {
      outline: "none",
    },
  },

  ".tbl-table-head, .tbl-table-body": {
    height: "100%",
  },

  ".tbl-table-row": {
    height: 0,
  },
  "@supports (-moz-appearance: none) /* TableTheme */": {
    ".tbl-table-row": {
      height: "fit-content",
    },
  },

  ".tbl-table-head .tbl-table-row": {
    "--tbl-row-background": "var(--tbl-theme-header-row-background)",
  },
  ".tbl-table-body .tbl-table-row:nth-child(2n + 1)": {
    "--tbl-row-background": "var(--tbl-theme-even-row-background)",
  },
  ".tbl-table-body .tbl-table-row:nth-child(2n)": {
    "--tbl-row-background": "var(--tbl-theme-odd-row-background)",
  },
}
