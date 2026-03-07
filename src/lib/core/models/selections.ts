import type { Span } from "#ext/stdlib/span"

import type { Selection } from "#core/models/selection"

export const empty: Selection = { anchor: 0, head: 0 }

export function equals(first: Selection | undefined, second: Selection | undefined): boolean {
  return first?.anchor === second?.anchor && first?.head === second?.head
}

export function flip({ anchor, head }: Selection): Selection {
  return { anchor: head, head: anchor }
}

export function toSpan({ anchor, head }: Selection): Span {
  return anchor <= head ? { from: anchor, to: head } : { from: head, to: anchor }
}

export function isForward({ anchor, head }: Selection): boolean {
  return anchor <= head
}
