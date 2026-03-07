import * as Nodes from "#ext/dom/nodes"
import * as Numbers from "#ext/stdlib/numbers"

import type { CellLocation } from "#core/models/cellLocation"

export const component = "Cell"

export function ancestorCell(target: EventTarget): HTMLElement | undefined {
  return Nodes.closestWithData(target, { component })
}

export function descendentCell(
  target: EventTarget,
  { row, col }: CellLocation,
): HTMLElement | undefined {
  return Nodes.queryWithData(target, { component, row: `${row}`, col: `${col}` })
}

export function cellLocation(target: EventTarget): CellLocation | undefined {
  if (!Nodes.hasData(target, { component })) return undefined

  const element = Nodes.htmlElement(target)
  return {
    row: Numbers.parseInt(element.dataset.row!),
    col: Numbers.parseInt(element.dataset.col!),
  }
}
