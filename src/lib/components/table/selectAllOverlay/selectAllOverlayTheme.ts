import type { ThemeSpec } from "@codemirror/view"

export const selectAllOverlayTheme: ThemeSpec = {
  ".tbl-select-all-overlay": {
    position: "absolute",
    top: 0,
    left: 0,
    "z-index": 900,
    "background-color": "var(--tbl-overlay)",
    width: "100%",
    height: "100%",
    "pointer-events": "none",
  },
}
