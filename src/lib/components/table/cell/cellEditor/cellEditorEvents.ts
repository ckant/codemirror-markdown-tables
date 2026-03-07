import type { EditorState } from "@codemirror/state"

import { nil } from "#ext/stdlib/existence"

import * as ClipboardActions from "#componentActions/clipboard/clipboardActions"
import { NavigateActions } from "#componentActions/navigate/navigateActions"
import * as NavigateKeys from "#componentActions/navigate/navigateKeys"

import type { TableState } from "#componentModels/table/tableState.svelte"

export function onbeforeinput(event: InputEvent, tableState: TableState): void {
  if (event.inputType === "historyUndo") {
    tableState.undo()
    event.preventDefault()
  } else if (event.inputType === "historyRedo") {
    tableState.redo()
    event.preventDefault()
  }
}

export function ondragstart(event: DragEvent): void {
  event.preventDefault()
}

export function onkeydown(
  event: KeyboardEvent,
  editorState: EditorState,
  tableState: TableState,
): void {
  const navigateKey = NavigateKeys.match(event)
  if (nil(navigateKey)) return

  const head = editorState.selection.main.head
  const line = editorState.doc.lineAt(head).number

  const firstChar = 0
  const lastChar = editorState.doc.length
  const firstLine = 1
  const lastLine = editorState.doc.lines

  const position = {
    top: line === firstLine,
    right: head === lastChar,
    bottom: line === lastLine,
    left: head === firstChar,
  }

  NavigateActions.navigate({ tableState, key: navigateKey, event, position })
}

export function onpaste(event: ClipboardEvent, tableState: TableState): void {
  void ClipboardActions.paste({ tableState, event })
}
