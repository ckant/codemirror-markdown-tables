import { ChangeSet } from "@codemirror/state"
import type { UpdateListenerSpec } from "@codemirror/view"

import * as EditorStates from "#ext/codemirror/state/editorStates"
import * as Arrays from "#ext/stdlib/arrays"

import * as TableEditorState from "#codemirror/state/tableEditorState"
import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"
import * as TableTransactions from "#codemirror/transaction/tableTransactions"

export const tableFormattingUpdaterSpec: UpdateListenerSpec = ({
  state,
  docChanged,
  selectionSet,
  transactions,
  view,
}) => {
  if (!docChanged && !selectionSet && EditorStates.hasHistory(state)) return
  if (transactions.some((it) => TableTransactions.hasTableEvent(it))) return

  const { formatting } = TableEditorState.getTableState(state)
  if (Arrays.isEmpty(formatting)) return

  const formattingChangeSet = ChangeSet.of(formatting, state.doc.length, state.lineBreak)
  const selection = state.selection.map(formattingChangeSet)

  view.dispatch({
    annotations: TableAnnotation.of("table.format"),
    changes: formattingChangeSet,
    selection,
  })
}
