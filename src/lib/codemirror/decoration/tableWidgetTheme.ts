import type { ThemeSpec } from "@codemirror/view"

export const tableWidgetTheme: ThemeSpec = {
  '&[data-tbl-handle-position="inside"] .tbl-table-widget': {
    "padding-left": "6px",
    "margin-left": 0,
  },
  ".tbl-table-widget": {
    contain: "paint",
    "padding-top": "16px",
    "padding-right": "16px",
    "padding-bottom": "16px",
    "padding-left": "16px",
    "margin-left": "-10px",

    "overflow-x": "auto",
    "overflow-y": "hidden",

    "&, &::before, &::after, & *, & *::before, & *::after": {
      "box-sizing": "border-box",
    },
  },
  "&.cm-editor .cm-content div.tbl-table-widget::selection, & .cm-content div.tbl-table-widget ::selection, & .cm-content div.tbl-table-widget:focus::selection, & .cm-content div.tbl-table-widget :focus::selection":
    {
      "background-color": "transparent !important", // Override CM style which uses !important
      "caret-color": "transparent !important", // Override CM style which uses !important
    },
}
