export function isNone(document: Document): boolean {
  return get(document).type === "None"
}

export function hasCursor(document: Document): boolean {
  return !isNone(document)
}

export function start(document: Document): number | undefined {
  return hasCursor(document) ? get(document).getRangeAt(0).startOffset : undefined
}

export function end(document: Document): number | undefined {
  return hasCursor(document) ? get(document).getRangeAt(0).endOffset : undefined
}

export function startNode(document: Document): Node | undefined {
  return hasCursor(document) ? get(document).getRangeAt(0).startContainer : undefined
}

export function unselectAll(document: Document): void {
  get(document).empty()
}

function get(document: Document): Selection {
  return document.getSelection()!
}
