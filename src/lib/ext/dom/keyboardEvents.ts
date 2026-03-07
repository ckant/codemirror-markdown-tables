import * as Browsers from "#ext/dom/browsers"
import { KeyboardKey } from "#ext/dom/keyboardKey"

const clipboardKeys = new Set<string>([KeyboardKey.c, KeyboardKey.v, KeyboardKey.x])

export function isClipboardEvent(event: KeyboardEvent, defaultView: Window): boolean {
  return clipboardKeys.has(event.key) && event[Browsers.modifierKey(defaultView)]
}
