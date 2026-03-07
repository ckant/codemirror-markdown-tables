import { def, nil } from "#ext/stdlib/existence"

import type { TableState } from "#componentModels/table/tableState.svelte"

import * as CellEvents from "#components/table/cell/cellEvents"
import * as CellNodes from "#components/table/cell/cellNodes"
import * as HandleEvents from "#components/table/handle/handleEvents"
import * as HandleNodes from "#components/table/handle/handleNodes"

export function onmouseover(event: MouseEvent, tableState: TableState): void {
  const target = event.target
  if (nil(target)) return

  const handle = HandleNodes.handle(target)
  if (def(handle)) {
    HandleEvents.onmouseover(handle, tableState)
    return
  }

  const cell = CellNodes.ancestorCell(target)
  if (def(cell)) {
    CellEvents.onmouseover(CellNodes.cellLocation(cell)!, tableState)
    return
  }
}

export function onmouseout(event: MouseEvent, tableState: TableState): void {
  const target = event.target
  if (nil(target)) return

  const handle = HandleNodes.handle(target)
  if (def(handle)) {
    HandleEvents.onmouseout(tableState)
    return
  }

  const cell = CellNodes.ancestorCell(target)
  if (def(cell)) {
    CellEvents.onmouseout(tableState)
    return
  }
}

export function onpointerdown(event: PointerEvent, tableState: TableState): void {
  const target = event.target
  if (nil(target)) return

  const handle = HandleNodes.handle(target)
  if (def(handle)) {
    HandleEvents.onpointerdown(event, handle, tableState)
    return
  }

  const cell = CellNodes.ancestorCell(target)
  if (def(cell)) {
    CellEvents.onpointerdown(event, CellNodes.cellLocation(cell)!, tableState)
    return
  }

  event.preventDefault()
}

export function ondragover(event: DragEvent): void {
  event.preventDefault()
}
