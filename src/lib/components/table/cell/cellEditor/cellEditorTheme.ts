import type { ThemeSpec } from "@codemirror/view"

export const cellEditorTheme: ThemeSpec = {
  "& .cm-content div.tbl-table-widget .tbl-cell-editor ::selection, & .cm-content div.tbl-table-widget .tbl-cell-editor :focus::selection":
    {
      "background-color": "Highlight !important", // Override CM style which uses !important
      "caret-color": "initial !important", // Override CM style which uses !important
    },

  "&[data-tbl-selection-type='codemirror'] .tbl-cell-editor .cm-editor .cm-content": {
    "caret-color": "transparent !important", // Override CM style which uses !important
  },

  "&[data-tbl-selection-type='codemirror'] .tbl-cell-editor .cm-editor .cm-content ::selection, &[data-tbl-selection-type='codemirror'] .tbl-cell-editor .cm-editor .cm-content :focus::selection":
    {
      "background-color": "transparent !important", // Override CM style which uses !important
      "caret-color": "transparent !important", // Override CM style which uses !important
    },

  "&[data-tbl-line-wrapping='wrap'] .tbl-cell-editor .cm-editor .cm-content": {
    "word-break": "normal",
    "overflow-wrap": "break-word",
  },

  ".tbl-cell-editor": {
    height: "100%",
  },

  ".tbl-cell-editor .cm-editor": {
    margin: 0,
    padding: 0,
    outline: "none",
    height: "100%",
    background: "unset",
    color: "var(--tbl-theme-text-color)",
  },

  ".tbl-cell-editor .cm-editor .cm-scroller": {
    margin: 0,
    padding: 0,
    overflow: "hidden",
    "line-height": 1.5,
    "font-family": "var(--tbl-style-font-family)",
    "font-size": "var(--tbl-style-font-size)",
    color: "var(--tbl-theme-text-color)",
  },

  ".tbl-cell-editor .cm-editor .cm-content": {
    margin: 0,
    padding: "7px 9px",
    "line-height": 1.5,
    "font-family": "var(--tbl-style-font-family)",
    "font-size": "var(--tbl-style-font-size)",
    color: "var(--tbl-theme-text-color)",
  },

  ".tbl-cell-editor .cm-editor .cm-line": {
    margin: 0,
    padding: "0 1px",
    "line-height": 1.5,
    "touch-action": "none",
    "font-family": "var(--tbl-style-font-family)",
    "font-size": "var(--tbl-style-font-size)",
    color: "var(--tbl-theme-text-color)",
  },
}
