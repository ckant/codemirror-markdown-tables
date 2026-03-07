import * as Nodes from "#ext/dom/nodes"

export const component = "CellView"

export function isCellView(target: EventTarget): boolean {
  return Nodes.hasData(target, { component })
}

export function ancestorCellView(target: EventTarget): HTMLElement | undefined {
  return Nodes.closestWithData(target, { component })
}

export function descendentCellView(target: EventTarget): HTMLElement | undefined {
  return Nodes.queryWithData(target, { component })
}

export function selector(): string {
  return Nodes.dataSelector({ component })
}
