export type ModifierKey = "Alt" | "Control" | "Meta" | "Shift"
export type StandardKey = Exclude<(typeof KeyboardKey)[keyof typeof KeyboardKey], ModifierKey>

export const KeyboardKey = {
  alt: "Alt",
  arrowDown: "ArrowDown",
  arrowLeft: "ArrowLeft",
  arrowRight: "ArrowRight",
  arrowUp: "ArrowUp",
  backspace: "Backspace",
  c: "c",
  ctrl: "Control",
  delete: "Delete",
  enter: "Enter",
  escape: "Escape",
  meta: "Meta",
  shift: "Shift",
  tab: "Tab",
  v: "v",
  x: "x",
} as const
