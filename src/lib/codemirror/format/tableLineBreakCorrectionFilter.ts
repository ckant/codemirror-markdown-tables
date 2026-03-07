import { ChangeSet, type ChangeSpec, type TransactionFilterSpec } from "@codemirror/state"

import * as Arrays from "#ext/stdlib/arrays"

import * as TableEditorState from "#codemirror/state/tableEditorState"
import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"
import * as TableTransactions from "#codemirror/transaction/tableTransactions"

import * as TableInserter from "#core/tableInserter"

export const tableLineBreakCorrectionFilterSpec: TransactionFilterSpec = (transaction) => {
  if (!transaction.docChanged || TableTransactions.hasTableEvent(transaction)) return transaction

  const changes = transaction.changes
  const { tables } = TableEditorState.getTableState(transaction.startState)
  const lineBreakChanges: ChangeSpec[] = []
  for (const table of tables) {
    if (
      changes.touchesRange(table.from - 1, table.from) !== false ||
      changes.touchesRange(table.to, table.to + 1) !== false
    ) {
      const newSpan = { from: changes.mapPos(table.from, 1), to: changes.mapPos(table.to) }
      if (newSpan.from >= newSpan.to) continue

      lineBreakChanges.push(
        TableInserter.computeInsertion({
          doc: transaction.newDoc,
          lineBreak: transaction.startState.lineBreak,
          span: newSpan,
        }).changes,
      )
    }
  }

  if (Arrays.isEmpty(lineBreakChanges)) return transaction

  const lineBreakChangeSet = ChangeSet.of(
    lineBreakChanges,
    transaction.changes.newLength,
    transaction.startState.lineBreak,
  )
  const selection = transaction.newSelection.map(lineBreakChangeSet)

  return [
    transaction,
    {
      annotation: TableAnnotation.of("table.correct"),
      changes: lineBreakChangeSet,
      selection,
      sequential: true,
    },
  ]
}
