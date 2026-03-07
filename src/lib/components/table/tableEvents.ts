import { runScopeHandlers } from "@codemirror/view"

import * as KeyboardEvents from "#ext/dom/keyboardEvents"
import { def } from "#ext/stdlib/existence"

import * as ClipboardActions from "#componentActions/clipboard/clipboardActions"
import * as DeleteActions from "#componentActions/delete/deleteActions"
import * as DeleteKeys from "#componentActions/delete/deleteKeys"
import * as InputKeys from "#componentActions/input/inputKeys"
import { NavigateActions } from "#componentActions/navigate/navigateActions"
import * as NavigateKeys from "#componentActions/navigate/navigateKeys"

import { TableSection } from "#componentModels/table/tableSection"
import type { TableState } from "#componentModels/table/tableState.svelte"

import * as CellViewNodes from "#components/table/cell/cellView/cellViewNodes"

export function oncopy(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.copySelection({ tableState, event })
}

export function oncut(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.cutSelection({ tableState, event })
}

export function onpaste(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.paste({ tableState, event })
}

export function onkeydown(event: KeyboardEvent, tableState: TableState): void {
  if (def(event.target) && def(CellViewNodes.ancestorCellView(event.target))) {
    event.preventDefault()
    return
  }

  if (!tableState.interactive || tableState.selection.isCell()) return

  const navigateKey = NavigateKeys.match(event)
  if (def(navigateKey)) {
    NavigateActions.navigate({
      tableState,
      key: navigateKey,
      event,
      position: { left: true, top: true, right: true, bottom: true },
    })
    return
  }

  const deleteKey = DeleteKeys.match(event)
  if (def(deleteKey)) {
    DeleteActions.deleteSelection({ tableState, event })
    return
  }

  if (tableState.activeTable && def(tableState.activeCell) && InputKeys.pressed(event)) {
    tableState.activeTable = false
    tableState.anchorCell = tableState.activeCell
    const cellEnd = tableState.table.cellAt(tableState.activeCell).length
    tableState.selectionValue = {
      cell: tableState.activeCell,
      section: { head: cellEnd, anchor: cellEnd },
    }
    tableState.outlinedSection = TableSection.ofCell(tableState.activeCell)
    return
  }

  if (KeyboardEvents.isClipboardEvent(event, tableState.window)) return

  if (runScopeHandlers(tableState.rootEditor, event, "editor")) {
    event.preventDefault()
  }
}
