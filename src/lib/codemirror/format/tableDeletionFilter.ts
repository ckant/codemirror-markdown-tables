import type { TransactionFilterSpec } from "@codemirror/state"

import * as EditorSelections from "#ext/codemirror/state/editorSelections"
import * as Transactions from "#ext/codemirror/state/transactions"
import { nil } from "#ext/stdlib/existence"

import * as TableEditorState from "#codemirror/state/tableEditorState"

export const tableDeletionFilterSpec: TransactionFilterSpec = (transaction) => {
  const { selection, startState } = transaction
  if (nil(selection) || !EditorSelections.isSingleCursor(selection)) return transaction

  const startMain = startState.selection.main

  if (Transactions.isForwardDeleteEvent(transaction)) {
    for (const table of TableEditorState.getTableState(startState).tables) {
      if (startMain.head === table.from - 1) {
        // Move cursor to first cell's first character when Delete pressed
        const firstCellFrom = table.table.firstCellSpan.from
        return [
          {
            selection: { anchor: table.from + firstCellFrom, head: table.from + firstCellFrom },
          },
        ]
      }
    }
    return transaction
  } else if (Transactions.isBackwardDeleteEvent(transaction)) {
    for (const table of TableEditorState.getTableState(startState).tables) {
      if (startMain.head === table.to + 1) {
        // Move cursor to last cell's last character when Backspace pressed
        const lastCellTo = table.table.lastCellSpan.to
        return [
          {
            selection: { anchor: table.from + lastCellTo, head: table.from + lastCellTo },
          },
        ]
      }
    }
    return transaction
  } else {
    return transaction
  }
}
