import { KeyboardKey } from "#ext/dom/keyboardKey"

import type { DeleteKey } from "#componentActions/delete/deleteKey"

export const all = [KeyboardKey.backspace, KeyboardKey.delete] as const
const allSet = new Set<string>(all)

export function match({ key }: KeyboardEvent): DeleteKey | undefined {
  return allSet.has(key) ? (key as DeleteKey) : undefined
}
