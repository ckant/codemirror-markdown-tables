import { KeyboardKey } from "#ext/dom/keyboardKey"
import * as KeyboardKeys from "#ext/dom/keyboardKeys"

const specialKeys = new Set<string>([
  KeyboardKey.alt,
  KeyboardKey.escape,
  KeyboardKey.enter,
  KeyboardKey.shift,
])

export function pressed({ metaKey, ctrlKey, key }: KeyboardEvent): boolean {
  return !ctrlKey && !metaKey && !specialKeys.has(key) && !KeyboardKeys.isFunctionKey(key)
}
