import type { UpdateListenerSpec, ViewUpdate } from "@codemirror/view"

import * as Transactions from "#ext/codemirror/state/transactions"
import * as Panels from "#ext/codemirror/view/panels"

import * as TableEditorState from "#codemirror/state/tableEditorState"

export const editorFocusUpdaterSpec: UpdateListenerSpec = ({
  state,
  view,
  transactions,
}: ViewUpdate) => {
  if (
    view.hasFocus ||
    TableEditorState.getTableState(state).tables.some((table) => table.containsSelection())
  )
    return

  // Refocus editor when an undo or redo switches from table to editor
  // Also refocus editor when search result navigation moves from inside the table to the editor
  const focusEditor = transactions.some((transaction) => {
    return (
      Transactions.isHistoryEvent(transaction) ||
      (Transactions.isSearchSelectEvent(transaction) && !Panels.hasFocus(view))
    )
  })
  if (focusEditor) view.focus()
}
