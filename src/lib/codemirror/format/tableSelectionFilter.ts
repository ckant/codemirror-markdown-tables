import { EditorSelection, type TransactionFilterSpec } from "@codemirror/state"

import * as EditorSelections from "#ext/codemirror/state/editorSelections"
import * as SelectionRanges from "#ext/codemirror/state/selectionRanges"
import * as Arrays from "#ext/stdlib/arrays"
import { def, nil } from "#ext/stdlib/existence"

import type { TableDescription } from "#codemirror/state/tableDescription.svelte"
import * as TableEditorState from "#codemirror/state/tableEditorState"
import * as TableAnnotation from "#codemirror/transaction/tableAnnotation"

export const tableSelectionFilterSpec: TransactionFilterSpec = (transaction) => {
  const { selection, startState, docChanged } = transaction
  if (nil(selection) || docChanged) return transaction
  if (EditorSelections.isSingleCursor(selection)) return transaction

  const newRanges = selection.ranges.map((range) => {
    if (range.empty) return range

    const tables = TableEditorState.getTableState(startState).tables
    const anchor = adjustCursor(range.anchor, tables)
    const head = adjustCursor(range.head, tables)

    return def(anchor) || def(head) ? SelectionRanges.copy(range, { anchor, head }) : range
  })

  if (Arrays.equals(selection.ranges, newRanges, (first, second) => first === second))
    return transaction

  return [
    transaction,
    {
      annotations: TableAnnotation.of("table.select"),
      selection: EditorSelection.create(newRanges, selection.mainIndex),
    },
  ]
}

function adjustCursor(cursor: number, tables: readonly TableDescription[]): number | undefined {
  for (const table of tables) {
    const beforeLineBreak = table.from
    const afterLineBreak = table.to
    const inTableStart = table.from + 1
    const inTableEnd = table.to - 1

    if (cursor === beforeLineBreak || cursor === inTableStart) {
      return beforeLineBreak - 1
    } else if (cursor === afterLineBreak || cursor === inTableEnd) {
      return afterLineBreak + 1
    }
  }
  return undefined
}
