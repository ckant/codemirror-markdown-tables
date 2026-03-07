import type { ThemeSpec } from "@codemirror/view"

export const handleTheme: ThemeSpec = {
  ".tbl-handle": {
    display: "flex",
    position: "absolute",
    "justify-content": "center",
    "align-items": "center",
    "z-index": 200,
    transition: "opacity 150ms ease 50ms",
    "touch-action": "none",
  },

  ".tbl-handle[data-hover], .tbl-handle[data-active]": {
    "--tbl-handle-opacity": 1,
  },

  '&:not([data-tbl-hoverable]) .tbl-handle[data-type="border"], &:not([data-tbl-hoverable]) .tbl-handle[data-type="table"]':
    {
      display: "none",
    },

  '.tbl-handle[data-type="border"]': {
    "background-color": "var(--tbl-theme-border-hover-color)",
  },

  '.tbl-handle[data-type="border"][data-active]': {
    "background-color": "var(--tbl-theme-border-active-color)",
  },

  '.tbl-handle[data-type="border"][data-toggle]': {
    transition: "none",
  },

  '.tbl-handle[data-type="border"][data-location="top"]': {
    top: "-1px",
    left: "-1px",
    width: "calc(100% + 2px)",
    height: "2px",
  },

  '.tbl-handle[data-type="border"][data-location="left"]': {
    top: "-1px",
    left: "-1px",
    width: "2px",
    height: "calc(100% + 2px)",
  },

  '.tbl-handle[data-type="border"][data-location="col"]': {
    top: "-1px",
    right: "-2px",
    width: "3px",
    height: "calc(100% + 2px)",
  },

  '.tbl-handle[data-type="border"][data-location="row"]': {
    bottom: "-2px",
    left: "-1px",
    width: "calc(100% + 2px)",
    height: "3px",
  },

  '.tbl-handle[data-type="table"]': {
    "box-sizing": "content-box",

    color: "var(--tbl-theme-border-hover-color)",
    "background-color":
      "color-mix(in srgb, var(--tbl-theme-border-color), var(--tbl-theme-header-row-background) 80%)",
  },

  '.tbl-handle[data-type="table"][data-location="right"]': {
    top: 0,
    left: "100%",
    width: "15px",
    height: "calc(100% - 2px)",

    border: "1px solid var(--tbl-theme-border-color)",
    "border-left": "none",

    "&::before": {
      position: "absolute",
      top: "-1px",
      left: "-2px",
      width: "2px",
      height: "calc(100% + 2px)",
      content: '""',
    },

    "&::after": {
      position: "absolute",
      "z-index": 366,
      top: "-1px",
      left: 0,
      content: '""',
      width: "calc(100% + 1px)",
      height: "calc(100% + 2px)",
      "background-color": "var(--tbl-overlay)",
    },
  },

  '.tbl-handle[data-type="table"][data-location="bottom-right"]': {
    left: "calc(100% - 1px)",
    top: "calc(100% - 1px)",
    "z-index": 250,
    width: "15px",
    height: "15px",

    border: "1px solid var(--tbl-theme-border-color)",
    "border-top-style": "dashed",
    "border-left-style": "dashed",

    "&::after": {
      position: "absolute",
      "z-index": 366,
      top: "-1px",
      left: "-1px",
      content: '""',
      width: "calc(100% + 2px)",
      height: "calc(100% + 2px)",
      "background-color": "var(--tbl-overlay)",
    },
  },

  '.tbl-handle[data-type="table"][data-location="bottom"]': {
    top: "100%",
    left: "0",
    width: "calc(100% - 2px)",
    height: "15px",

    border: "1px solid var(--tbl-theme-border-color)",
    "border-top": "none",

    "&::before": {
      position: "absolute",
      top: "-2px",
      left: "-1px",
      width: "calc(100% + 2px)",
      height: "2px",
      content: '""',
    },

    "&::after": {
      position: "absolute",
      "z-index": 366,
      top: 0,
      left: "-1px",
      content: '""',
      width: "calc(100% + 2px)",
      height: "calc(100% + 1px)",
      "background-color": "var(--tbl-overlay)",
    },
  },

  '.tbl-handle[data-type="table"][data-location="bottom-right"][data-hover] ~ .tbl-handle[data-type="table"][data-location="right"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="right"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-hover] ~ .tbl-handle[data-type="table"][data-location="bottom"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="bottom"]':
    {
      "--tbl-handle-opacity": 1,
    },

  '.tbl-handle[data-type="table"][data-location="bottom-right"][data-hover] ~ .tbl-handle[data-type="table"][data-location="right"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="right"]':
    {
      "border-bottom": "none",
    },

  '.tbl-handle[data-type="table"][data-location="bottom-right"][data-hover] ~ .tbl-handle[data-type="table"][data-location="bottom"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="bottom"]':
    {
      "border-right": "none",
    },

  '.tbl-handle[data-type="table"][data-active], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="right"], .tbl-handle[data-type="table"][data-location="bottom-right"][data-active] ~ .tbl-handle[data-type="table"][data-location="bottom"]':
    {
      "background-color":
        "color-mix(in srgb, var(--tbl-theme-border-color), var(--tbl-theme-header-row-background) 80%)",
      color: "var(--tbl-theme-border-active-color)",
    },

  '&[data-tbl-handle-position="outside"] .tbl-handle[data-type="header"]': {
    "box-sizing": "content-box",
    transition: "none",
    "z-index": 300,
    color: "var(--tbl-theme-border-hover-color)",
    border: "1px solid transparent",

    "&:hover": {
      "border-color": "var(--tbl-theme-border-color)",
      "background-color":
        "color-mix(in srgb, var(--tbl-theme-border-color), var(--tbl-theme-header-row-background) 80%)",
    },

    "&[data-active]": {
      "background-color": "var(--tbl-theme-outline-color)",
      "border-color": "var(--tbl-theme-outline-color)",
      color: "#ffffff",
    },
  },

  '&[data-tbl-handle-position="outside"] .tbl-handle[data-type="header"][data-location="row"]': {
    top: "-1px",
    left: "-17px",
    width: "15px",
    height: "100%",
    "border-right": "none",
  },

  '&[data-tbl-handle-position="outside"] .tbl-handle[data-type="header"][data-location="col"]': {
    top: "-17px",
    left: "-1px",
    width: "100%",
    height: "15px",
    "border-bottom": "none",

    "&:hover::after": {
      position: "absolute",
      "z-index": 366,
      top: "-1px",
      left: "-1px",
      content: '""',
      width: "calc(100% + 2px)",
      height: "calc(100% + 1px)",
      "background-color": "var(--tbl-overlay)",
    },
  },

  '&[data-tbl-handle-position="inside"] .tbl-handle[data-type="header"]': {
    transition: "none",
    "z-index": 300,
    color: "var(--tbl-theme-border-hover-color)",

    "&:hover": {
      color: "var(--tbl-theme-border-active-color)",
    },

    "&[data-active]": {
      color: "var(--tbl-theme-outline-color)",
    },
  },

  '&[data-tbl-handle-position="inside"] .tbl-handle[data-type="header"][data-location="row"]': {
    top: "calc(50% - 13px)",
    left: "-1px",
    width: "3px",
    height: "26px",
    "border-top": "4px solid var(--tbl-row-background)",
    "border-bottom": "4px solid var(--tbl-row-background)",
    "background-color": "var(--tbl-row-background)",

    "&:hover::after, &[data-active]::after": {
      position: "absolute",
      top: "-6px",
      left: 0,
      "box-sizing": "content-box",
      "border-top": "2px solid transparent",
      "border-bottom": "2px solid transparent",
      width: "calc(100% + 6px)",
      height: "calc(100% + 8px)",
      content: '""',
    },
  },

  '&[data-tbl-handle-position="inside"] .tbl-handle[data-type="header"][data-location="col"]': {
    top: "-1px",
    left: "calc(50% - 11.5px)",
    width: "23px",
    height: "3px",
    "border-right": "4px solid var(--tbl-row-background)",
    "border-left": "4px solid var(--tbl-row-background)",
    "background-color": "var(--tbl-row-background)",

    "&:hover::after, &[data-active]::after": {
      position: "absolute",
      top: 0,
      left: "-6px",
      "box-sizing": "content-box",
      "border-right": "2px solid transparent",
      "border-left": "2px solid transparent",
      width: "calc(100% + 8px)",
      height: "calc(100% + 6px)",
      content: '""',
    },
  },

  ".tbl-handle-grip": {
    "pointer-events": "none",
    "z-index": 333,
  },
}
