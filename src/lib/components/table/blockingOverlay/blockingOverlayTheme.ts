import type { ThemeSpec } from "@codemirror/view"

export const blockingOverlayTheme: ThemeSpec = {
  ".tbl-blocking-overlay": {
    position: "absolute",
    top: 0,
    left: 0,
    "z-index": 900,
    "background-color": "transparent",
    width: "100%",
    height: "100%",
  },
}
