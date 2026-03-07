import * as Nodes from "#ext/dom/nodes"
import { def } from "#ext/stdlib/existence"

import type {
  BorderHandle,
  Handle,
  HeaderHandle,
  TableHandle,
} from "#componentModels/table/handle/handle"
import * as Handles from "#componentModels/table/handle/handles"

import * as CellNodes from "#components/table/cell/cellNodes"

export const component = "Handle"

export function handle(target: EventTarget): Handle | undefined {
  if (!Nodes.hasData(target, { component })) return undefined

  const { type, location } = Nodes.htmlElement(target).dataset
  if (type === "table") {
    return { type, location: location as TableHandle["location"] }
  } else {
    const cell = CellNodes.cellLocation(CellNodes.ancestorCell(target)!)!
    const partialHandle = { location, type } as Pick<
      HeaderHandle | BorderHandle,
      "location" | "type"
    >
    return Handles.reconstruct(partialHandle, cell)
  }
}

export function firstDescendentHandle(
  target: EventTarget,
  handleModel: Handle,
): HTMLElement | undefined {
  const { type, location } = handleModel
  if (type === "table") return Nodes.queryWithData(target, { component, type, location })

  const containingCell = CellNodes.descendentCell(target, Handles.locateFirst(handleModel))
  return def(containingCell)
    ? Nodes.queryWithData(containingCell, { component, type, location })
    : undefined
}
