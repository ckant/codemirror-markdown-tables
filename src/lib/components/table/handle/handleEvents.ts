import * as PointerEvents from "#ext/dom/pointerEvents"

import { MenuActions } from "#componentActions/menu/menuActions"
import { MoveActions } from "#componentActions/move/moveActions"
import { ResizeActions } from "#componentActions/resize/resizeActions"

import type { Handle } from "#componentModels/table/handle/handle"
import type { TableState } from "#componentModels/table/tableState.svelte"

export function onmouseover(handle: Handle, tableState: TableState): void {
  if (tableState.interactive) tableState.activeHandle = { state: "hover", handle }
}

export function onmouseout(tableState: TableState): void {
  if (tableState.interactive) tableState.activeHandle = undefined
}

export function onpointerdown(event: PointerEvent, handle: Handle, tableState: TableState): void {
  if (!tableState.interactive) return
  if (!PointerEvents.isPrimaryButton(event)) {
    event.preventDefault()
    return
  }

  if (handle.type === "table" || handle.type === "border") {
    ResizeActions.startResize({ event, handle, tableState })
  } else if (handle.type === "header") {
    MoveActions.startMove({
      event,
      rowOrCol: handle.location,
      index: handle.index,
      tableState,
      onClick: () =>
        MenuActions.showMenu({
          handle,
          point: { x: event.clientX, y: event.clientY },
          tableState,
        }),
    })
  }
}
