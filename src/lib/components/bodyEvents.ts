import * as ClipboardActions from "#componentActions/clipboard/clipboardActions"

import type { TableState } from "#componentModels/table/tableState.svelte"

export function onpointerdown(tableState: TableState): void {
  tableState.pointerDown = true
}

export function onpointerup(tableState: TableState): void {
  tableState.pointerDown = false
}

export function onpointerleave(tableState: TableState): void {
  tableState.pointerDown = false
}

export function oncopy(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.copySelection({ tableState, event })
}

export function oncut(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.cutSelection({ tableState, event })
}

export function onpaste(event: ClipboardEvent, tableState: TableState): void {
  if (!tableState.selection.isCell()) ClipboardActions.paste({ tableState, event })
}
