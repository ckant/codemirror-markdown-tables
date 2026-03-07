import * as Browsers from "#ext/dom/browsers"
import * as PointerEvents from "#ext/dom/pointerEvents"

import { OutlineActions } from "#componentActions/outline/outlineActions"

import type { TableState } from "#componentModels/table/tableState.svelte"

import { type CellLocation } from "#core/models/cellLocation"
import * as CellLocations from "#core/models/cellLocations"

export function onmouseover(cellLocation: CellLocation, tableState: TableState): void {
  if (Browsers.hoverable(tableState.window)) tableState.hoveredCell = cellLocation
}

export function onmouseout(tableState: TableState): void {
  if (Browsers.hoverable(tableState.window)) tableState.hoveredCell = undefined
}

export function onpointerdown(
  event: PointerEvent,
  cellLocation: CellLocation,
  tableState: TableState,
): void {
  if (!tableState.interactive || !PointerEvents.isPrimaryButton(event)) return

  if (event.shiftKey) {
    if (
      tableState.selection.isCell() &&
      CellLocations.equals(cellLocation, tableState.selection.cell)
    ) {
      return
    }
    OutlineActions.resizeAndContinueOutline({ event, tableState, cellLocation })
  } else {
    OutlineActions.startOutline({ event, tableState, cellLocation })
  }
}
