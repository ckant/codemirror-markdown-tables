export function hoverable(defaultView: Window): boolean {
  return !defaultView.matchMedia("(any-hover: none)").matches
}

export function modifierKey(defaultView: Window): "metaKey" | "ctrlKey" {
  return /Mac|iPod|iPhone|iPad/.test(defaultView.navigator.platform) ? "metaKey" : "ctrlKey"
}
