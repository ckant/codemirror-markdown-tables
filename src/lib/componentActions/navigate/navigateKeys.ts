import { KeyboardKey, type ModifierKey, type StandardKey } from "#ext/dom/keyboardKey"

import type { NavigateKey } from "#componentActions/navigate/navigateKey"

export const all = [
  KeyboardKey.arrowDown,
  KeyboardKey.arrowLeft,
  KeyboardKey.arrowRight,
  KeyboardKey.arrowUp,
  KeyboardKey.enter,
  KeyboardKey.tab,

  `${KeyboardKey.shift}${KeyboardKey.arrowDown}`,
  `${KeyboardKey.shift}${KeyboardKey.arrowLeft}`,
  `${KeyboardKey.shift}${KeyboardKey.arrowRight}`,
  `${KeyboardKey.shift}${KeyboardKey.arrowUp}`,
  `${KeyboardKey.shift}${KeyboardKey.tab}`,
] as const satisfies (StandardKey | `${ModifierKey}${StandardKey}`)[]
const allSet = new Set<string>(all)

export function match({
  key,
  shiftKey,
  altKey,
  metaKey,
  ctrlKey,
}: KeyboardEvent): NavigateKey | undefined {
  if (altKey || metaKey || ctrlKey) return undefined

  if (shiftKey) {
    return allSet.has(`${KeyboardKey.shift}${key}`)
      ? (`${KeyboardKey.shift}${key}` as NavigateKey)
      : undefined
  }
  return allSet.has(key) ? (key as NavigateKey) : undefined
}
