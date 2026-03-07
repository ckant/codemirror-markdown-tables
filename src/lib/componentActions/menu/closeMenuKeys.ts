import { KeyboardKey } from "#ext/dom/keyboardKey"

export function pressed({ metaKey, shiftKey, altKey, ctrlKey, key }: KeyboardEvent): boolean {
  return key === KeyboardKey.escape && !shiftKey && !altKey && !metaKey && !ctrlKey
}
