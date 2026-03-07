import type { TransactionFilterSpec } from "@codemirror/state"

import * as EditorSelections from "#ext/codemirror/state/editorSelections"
import * as Transactions from "#ext/codemirror/state/transactions"
import { def, nil } from "#ext/stdlib/existence"

import * as TableEditorState from "#codemirror/state/tableEditorState"
import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"

/**
 * Fixes cursor position when it moves into or over the table.
 */
export const tableCursorMovementFilterSpec: TransactionFilterSpec = (transaction) => {
  const { selection, startState, docChanged } = transaction
  if (nil(selection) || docChanged || !Transactions.isCursorSelectEvent(transaction))
    return transaction
  if (
    !EditorSelections.isSingleCursor(selection) ||
    !EditorSelections.isSingleCursor(startState.selection)
  )
    return transaction

  const startMain = startState.selection.main
  const main = selection.main

  for (const table of TableEditorState.getTableState(startState).tables) {
    const movedIntoStart = table.from === main.head
    const movedIntoEnd = table.to === main.head
    const jumpedOverStart = table.from === startMain.head + 1 && table.to === main.head - 1
    const jumpedOverEnd = table.from === main.head + 1 && table.to === startMain.head - 1

    let cellPosition: number | undefined = undefined
    if (movedIntoStart) {
      cellPosition = table.table.firstCellSpan.from
    } else if (jumpedOverStart) {
      cellPosition = table.table.firstCellSpan.to
    } else if (movedIntoEnd || jumpedOverEnd) {
      cellPosition = table.table.lastCellSpan.to
    }

    if (def(cellPosition)) {
      return [
        transaction,
        {
          annotation: TableAnnotation.of("table.navigate"),
          selection: EditorSelections.singleCursor({ pos: table.from + cellPosition }),
        },
      ]
    }
  }

  return transaction
}
